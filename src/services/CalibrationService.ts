const STORAGE_KEY = 'axis_calibration';

interface CalibrationData {
  baselineAngle: number;
  calibrated: boolean;
}

/**
 * 캘리브레이션 서비스
 * - 개인별 기준 자세 설정
 * - 보정된 각도 계산
 * - localStorage 영속성
 */
export class CalibrationService {
  private baselineAngle = 0;
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
   * 기준 각도를 반환한다.
   */
  getBaselineAngle(): number {
    return this.baselineAngle;
  }

  /**
   * 기준 각도를 직접 설정한다.
   */
  calibrate(angle: number): void {
    this.baselineAngle = angle;
    this.calibrated = true;
    this.saveToStorage();
  }

  /**
   * 보정된 각도를 반환한다.
   */
  getAdjustedAngle(rawAngle: number): number {
    if (!this.calibrated) {
      return rawAngle;
    }
    return rawAngle - this.baselineAngle;
  }

  /**
   * 캘리브레이션을 초기화한다.
   */
  reset(): void {
    this.baselineAngle = 0;
    this.calibrated = false;
    this.samples = [];
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * 캘리브레이션 샘플을 추가한다.
   */
  addCalibrationSample(angle: number): void {
    this.samples.push(angle);
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
   * 샘플 평균으로 캘리브레이션을 완료한다.
   */
  finishCalibration(): boolean {
    if (this.samples.length === 0) {
      return false;
    }

    const average =
      this.samples.reduce((sum, s) => sum + s, 0) / this.samples.length;
    this.calibrate(average);
    this.samples = [];
    return true;
  }

  /**
   * localStorage에서 데이터를 불러온다.
   */
  private loadFromStorage(): void {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data: CalibrationData = JSON.parse(stored);
        this.baselineAngle = data.baselineAngle;
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
      baselineAngle: this.baselineAngle,
      calibrated: this.calibrated,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}
