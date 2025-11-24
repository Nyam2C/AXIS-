import type { PostureState, PostureLevel } from '../models/PostureState';

export interface SessionStats {
  averageAngle: number;
  levelStats: Record<PostureLevel, number>;
  totalDuration: number; // 총 측정 시간 (ms)
  goodPostureRatio: number; // 좋은 자세 비율 (0-100)
  totalSamples: number; // 총 샘플 수
  startTime: number; // 시작 시간
  endTime: number; // 종료 시간
}

const SAMPLE_INTERVAL = 10000; // 10초
const SESSION_DURATION = 60000; // 1분

/**
 * 자세 모니터링 컨트롤러
 * - 10초마다 샘플링
 * - 1분 세션 관리
 * - 통계 수집
 */
export class MonitoringController {
  private running = false;
  private history: PostureState[] = [];
  private sampleCallback: (() => void) | null = null;
  private sessionCallback: ((stats: SessionStats) => void) | null = null;
  private sampleTimer: ReturnType<typeof setInterval> | null = null;
  private sessionTimer: ReturnType<typeof setTimeout> | null = null;
  private startTime: number = 0;

  /**
   * 모니터링 실행 여부를 반환한다.
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * 모니터링을 시작한다.
   */
  start(): void {
    if (this.running) return;

    this.running = true;
    this.startTime = Date.now();

    // 10초마다 샘플링 콜백
    this.sampleTimer = setInterval(() => {
      this.sampleCallback?.();
    }, SAMPLE_INTERVAL);

    // 1분 후 세션 완료
    this.sessionTimer = setTimeout(() => {
      this.completeSession();
    }, SESSION_DURATION);
  }

  /**
   * 모니터링을 중지한다.
   */
  stop(): void {
    this.running = false;

    if (this.sampleTimer) {
      clearInterval(this.sampleTimer);
      this.sampleTimer = null;
    }

    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  /**
   * 샘플링 콜백을 등록한다.
   */
  onSample(callback: () => void): void {
    this.sampleCallback = callback;
  }

  /**
   * 세션 완료 콜백을 등록한다.
   */
  onSessionComplete(callback: (stats: SessionStats) => void): void {
    this.sessionCallback = callback;
  }

  /**
   * 자세 데이터를 기록한다.
   */
  recordPosture(state: PostureState): void {
    this.history.push(state);
  }

  /**
   * 기록된 자세 히스토리를 반환한다.
   */
  getHistory(): PostureState[] {
    return [...this.history];
  }

  /**
   * 히스토리를 초기화한다.
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * 평균 목 각도를 계산한다.
   */
  getAverageAngle(): number {
    if (this.history.length === 0) return 0;

    const sum = this.history.reduce((acc, state) => acc + state.neckAngle, 0);
    return sum / this.history.length;
  }

  /**
   * 레벨별 횟수 통계를 반환한다.
   */
  getLevelStats(): Record<PostureLevel, number> {
    const stats: Record<PostureLevel, number> = {
      normal: 0,
      warning: 0,
      danger: 0,
    };

    this.history.forEach((state) => {
      stats[state.level]++;
    });

    return stats;
  }

  /**
   * 좋은 자세 비율을 계산한다 (0-100).
   */
  getGoodPostureRatio(): number {
    if (this.history.length === 0) return 0;

    const normalCount = this.history.filter((s) => s.level === 'normal').length;
    return Math.round((normalCount / this.history.length) * 100);
  }

  /**
   * 전체 세션 통계를 반환한다.
   */
  getSessionStats(): SessionStats {
    const endTime = Date.now();
    return {
      averageAngle: this.getAverageAngle(),
      levelStats: this.getLevelStats(),
      totalDuration: endTime - this.startTime,
      goodPostureRatio: this.getGoodPostureRatio(),
      totalSamples: this.history.length,
      startTime: this.startTime,
      endTime,
    };
  }

  /**
   * 세션을 완료하고 통계를 전달한다.
   */
  private completeSession(): void {
    const stats = this.getSessionStats();
    this.sessionCallback?.(stats);
    this.clearHistory();
    this.stop();
  }
}
