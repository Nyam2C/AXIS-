import type { PostureLevel } from '../models/PostureState';

const DEFAULT_THRESHOLD = 3;

/**
 * 자세 알림 컨트롤러
 * - 연속 danger 감지 시 알림 트리거
 * - 알림 상태 관리
 */
export class AlertController {
  private consecutiveDangerCount = 0;
  private alertActive = false;
  private threshold = DEFAULT_THRESHOLD;
  private alertCallback: (() => void) | null = null;
  private dismissCallback: (() => void) | null = null;

  /**
   * 연속 danger 카운트를 반환한다.
   */
  getConsecutiveDangerCount(): number {
    return this.consecutiveDangerCount;
  }

  /**
   * 알림 활성화 여부를 반환한다.
   */
  isAlertActive(): boolean {
    return this.alertActive;
  }

  /**
   * 현재 임계값을 반환한다.
   */
  getThreshold(): number {
    return this.threshold;
  }

  /**
   * 임계값을 설정한다.
   */
  setThreshold(value: number): void {
    this.threshold = value;
  }

  /**
   * 자세를 체크하고 알림 상태를 업데이트한다.
   */
  checkPosture(level: PostureLevel): void {
    if (level === 'danger') {
      this.consecutiveDangerCount++;

      // 임계값 도달 시 알림
      if (this.consecutiveDangerCount >= this.threshold && !this.alertActive) {
        this.alertActive = true;
        this.alertCallback?.();
      }
    } else {
      // danger가 아니면 카운트 리셋
      const wasActive = this.alertActive;
      this.consecutiveDangerCount = 0;
      this.alertActive = false;

      // 알림이 활성화되어 있었다면 해제 콜백 호출
      if (wasActive) {
        this.dismissCallback?.();
      }
    }
  }

  /**
   * 알림 콜백을 등록한다.
   */
  onAlert(callback: () => void): void {
    this.alertCallback = callback;
  }

  /**
   * 알림 해제 콜백을 등록한다.
   */
  onAlertDismiss(callback: () => void): void {
    this.dismissCallback = callback;
  }

  /**
   * 알림을 수동으로 해제한다.
   */
  dismissAlert(): void {
    this.alertActive = false;
    this.consecutiveDangerCount = 0;
  }
}
