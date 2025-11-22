/**
 * 자세 경고 알림 View
 * - 시각적 알림 표시
 * - 사운드 알림
 */
export class AlertView {
  private container: HTMLElement;
  private visible = false;
  private soundEnabled = true;
  private dismissCallback: (() => void) | null = null;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);

    if (!container) {
      throw new Error(`컨테이너를 찾을 수 없습니다: ${containerId}`);
    }

    this.container = container;
  }

  /**
   * 알림을 표시한다.
   */
  show(): void {
    this.visible = true;

    this.container.innerHTML = `
      <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
        <div class="bg-[#2B3240] rounded-3xl p-8 mx-5 max-w-sm w-full text-center shadow-2xl">
          <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-[#FF453A]/15 flex items-center justify-center">
            <span class="text-5xl">🚨</span>
          </div>
          <h2 class="text-2xl font-bold text-[#FF453A] mb-2">거북목 주의!</h2>
          <p class="text-gray-400 mb-6">목을 펴주세요. 바른 자세를 유지해야 건강해요.</p>
          <button
            data-dismiss
            class="w-full bg-[#FF453A] hover:bg-[#FF453A]/80 text-white py-3 px-6 rounded-xl font-semibold transition-all"
          >
            확인했어요
          </button>
        </div>
      </div>
    `;

    // 닫기 버튼 이벤트 바인딩
    const dismissBtn = this.container.querySelector('[data-dismiss]');
    dismissBtn?.addEventListener('click', () => {
      this.hide();
      this.dismissCallback?.();
    });

    // 사운드 재생
    if (this.soundEnabled) {
      this.playSound();
    }
  }

  /**
   * 알림을 숨긴다.
   */
  hide(): void {
    this.visible = false;
    this.container.innerHTML = '';
  }

  /**
   * 알림 표시 여부를 반환한다.
   */
  isVisible(): boolean {
    return this.visible;
  }

  /**
   * 닫기 콜백을 등록한다.
   */
  onDismiss(callback: () => void): void {
    this.dismissCallback = callback;
  }

  /**
   * 사운드 활성화 여부를 설정한다.
   */
  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  /**
   * 사운드 활성화 여부를 반환한다.
   */
  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  /**
   * 알림 사운드를 재생한다.
   */
  private playSound(): void {
    const audio = new Audio(
      'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2IiIF7d3V9hoyKg3x2dX2GjYuFfnh2fYWLiYR+eHZ9hYuJhH54dn2Fi4mEfnh2fYWLiQ=='
    );
    audio.play().catch(() => {
      // 자동 재생이 차단된 경우 무시
    });
  }
}
