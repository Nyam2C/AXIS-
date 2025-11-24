const STORAGE_KEY = 'axis_calibration';
const MAX_DEVIATION_THRESHOLD = 15; // 최대 허용 편차 (픽셀)

interface CalibrationData {
  baselineDistance: number;
  calibrated: boolean;
}

interface CalibrationResult {
  success: boolean;
  needsRetry: boolean;
  message: string;
}

/**
 * 캘리브레이션 서비스
 * - 개인별 기준 자세 설정
 * - 어깨선과 코 간의 거리 기반 측정
 * - 변동이 큰 경우 재측정 요청
 * - localStorage 영속성
 */
export class CalibrationService {
  private baselineDistance = 0;
  private calibrated = false;
  private samples: number[] = [];

  constructor() {
    this.loadFromStorage();
  }

  /**
   * 캘리브레이션 여부를 반환한다.
   */
  isCalibrated(): boolean {
    return this.calibrated;
  }

  /**
   * 기준 거리를 반환한다.
   */
  getBaselineDistance(): number {
    return this.baselineDistance;
  }

  /**
   * 기준 거리를 직접 설정한다.
   */
  calibrate(distance: number): void {
    this.baselineDistance = distance;
    this.calibrated = true;
    this.saveToStorage();
  }

  /**
   * 보정된 거리 변화를 반환한다.
   * 양수: 코가 기준보다 앞으로 나옴 (거북목)
   * 음수: 코가 기준보다 뒤로 감
   */
  getAdjustedDistance(rawDistance: number): number {
    if (!this.calibrated) {
      return rawDistance;
    }
    return rawDistance - this.baselineDistance;
  }

  /**
   * 캘리브레이션을 초기화한다.
   */
  reset(): void {
    this.baselineDistance = 0;
    this.calibrated = false;
    this.samples = [];
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * 캘리브레이션 샘플을 추가한다.
   */
  addCalibrationSample(distance: number): void {
    this.samples.push(distance);
  }

  /**
   * 현재 샘플 수를 반환한다.
   */
  getSampleCount(): number {
    return this.samples.length;
  }

  /**
   * 샘플을 초기화한다.
   */
  clearSamples(): void {
    this.samples = [];
  }

  /**
   * 샘플의 변동이 허용 범위 내인지 검사한다.
   */
  private checkSampleStability(): { isStable: boolean; deviation: number } {
    if (this.samples.length < 2) {
      return { isStable: true, deviation: 0 };
    }

    const min = Math.min(...this.samples);
    const max = Math.max(...this.samples);
    const deviation = max - min;

    return {
      isStable: deviation <= MAX_DEVIATION_THRESHOLD,
      deviation,
    };
  }

  /**
   * 샘플 평균으로 캘리브레이션을 완료한다.
   * 변동이 크면 재측정을 요청한다.
   */
  finishCalibration(): CalibrationResult {
    if (this.samples.length === 0) {
      return {
        success: false,
        needsRetry: false,
        message: '샘플이 없습니다.',
      };
    }

    const { isStable, deviation } = this.checkSampleStability();

    if (!isStable) {
      this.samples = [];
      return {
        success: false,
        needsRetry: true,
        message: `측정값 변동이 너무 큽니다 (${deviation.toFixed(1)}px). 자세를 고정하고 다시 측정해주세요.`,
      };
    }

    const average =
      this.samples.reduce((sum, s) => sum + s, 0) / this.samples.length;
    this.calibrate(average);
    this.samples = [];

    return {
      success: true,
      needsRetry: false,
      message: '캘리브레이션 완료!',
    };
  }

  /**
   * localStorage에서 데이터를 불러온다.
   */
  private loadFromStorage(): void {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data: CalibrationData = JSON.parse(stored);
        this.baselineDistance = data.baselineDistance;
        this.calibrated = data.calibrated;
      } catch {
        // 파싱 실패 시 무시
      }
    }
  }

  /**
   * localStorage에 데이터를 저장한다.
   */
  private saveToStorage(): void {
    const data: CalibrationData = {
      baselineDistance: this.baselineDistance,
      calibrated: this.calibrated,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}
