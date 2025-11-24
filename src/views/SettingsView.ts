export interface SettingsState {
  soundEnabled: boolean;
  alertThreshold: number;
  isCalibrated: boolean;
}

/**
 * 설정 화면 View
 */
export class SettingsView {
  private container: HTMLElement;
  private visible = false;
  private soundToggleCallback: ((enabled: boolean) => void) | null = null;
  private calibrateCallback: (() => void) | null = null;
  private resetCalibrationCallback: (() => void) | null = null;
  private closeCallback: (() => void) | null = null;
  private thresholdChangeCallback: ((value: number) => void) | null = null;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);

    if (!container) {
      throw new Error(`컨테이너를 찾을 수 없습니다: ${containerId}`);
    }

    this.container = container;
  }

  /**
   * 설정 화면을 렌더링한다.
   */
  render(state: SettingsState): void {
    this.visible = true;

    this.container.innerHTML = `
      <div class="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
        <div class="bg-[#2B3240] rounded-t-3xl w-full max-w-lg p-6 pb-10 animate-slide-up">
          <!-- 헤더 -->
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold">설정</h2>
            <button data-close class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#3B4654] transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- 알림 소리 -->
          <div class="flex items-center justify-between py-4 border-b border-[#3B4654]">
            <div>
              <div class="font-medium">알림 소리</div>
              <div class="text-sm text-gray-400">거북목 감지 시 소리 알림</div>
            </div>
            <label class="relative inline-flex cursor-pointer">
              <input type="checkbox" data-sound-toggle class="sr-only peer" ${state.soundEnabled ? 'checked' : ''}>
              <div class="w-11 h-6 bg-[#3B4654] rounded-full peer peer-checked:bg-[#3182F6] transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
            </label>
          </div>

          <!-- 연속 감지 횟수 -->
          <div class="py-4 border-b border-[#3B4654]">
            <div class="flex items-center justify-between mb-3">
              <div>
                <div class="font-medium">연속 감지 횟수</div>
                <div class="text-sm text-gray-400">알림 발생 기준</div>
              </div>
              <span class="text-[#3182F6] font-semibold">${state.alertThreshold}회</span>
            </div>
            <input
              type="range"
              data-threshold
              min="1"
              max="10"
              value="${state.alertThreshold}"
              class="w-full h-2 bg-[#3B4654] rounded-lg appearance-none cursor-pointer accent-[#3182F6]"
            >
          </div>

          <!-- 캘리브레이션 -->
          <div class="py-4">
            <div class="font-medium mb-1">자세 캘리브레이션</div>
            <div class="text-sm text-gray-400 mb-4">
              ${state.isCalibrated ? '캘리브레이션이 완료되었습니다.' : '현재 자세를 기준점으로 설정합니다.'}
            </div>
            ${
              state.isCalibrated
                ? `
              <button data-reset-calibration class="w-full py-3 px-4 bg-[#3B4654] hover:bg-[#4B5664] rounded-xl font-medium transition-colors">
                캘리브레이션 초기화
              </button>
            `
                : ''
            }
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  /**
   * 설정 화면을 숨긴다.
   */
  hide(): void {
    this.visible = false;
    this.container.innerHTML = '';
  }

  /**
   * 표시 여부를 반환한다.
   */
  isVisible(): boolean {
    return this.visible;
  }

  /**
   * 사운드 토글 콜백을 등록한다.
   */
  onSoundToggle(callback: (enabled: boolean) => void): void {
    this.soundToggleCallback = callback;
  }

  /**
   * 캘리브레이션 콜백을 등록한다.
   */
  onCalibrate(callback: () => void): void {
    this.calibrateCallback = callback;
  }

  /**
   * 캘리브레이션 초기화 콜백을 등록한다.
   */
  onResetCalibration(callback: () => void): void {
    this.resetCalibrationCallback = callback;
  }

  /**
   * 닫기 콜백을 등록한다.
   */
  onClose(callback: () => void): void {
    this.closeCallback = callback;
  }

  /**
   * 임계값 변경 콜백을 등록한다.
   */
  onThresholdChange(callback: (value: number) => void): void {
    this.thresholdChangeCallback = callback;
  }

  /**
   * 이벤트를 바인딩한다.
   */
  private bindEvents(): void {
    // 닫기 버튼
    const closeBtn = this.container.querySelector('[data-close]');
    closeBtn?.addEventListener('click', () => {
      this.closeCallback?.();
    });

    // 사운드 토글
    const soundToggle = this.container.querySelector(
      '[data-sound-toggle]'
    ) as HTMLInputElement;
    soundToggle?.addEventListener('change', () => {
      this.soundToggleCallback?.(soundToggle.checked);
    });

    // 임계값 슬라이더
    const threshold = this.container.querySelector(
      '[data-threshold]'
    ) as HTMLInputElement;
    threshold?.addEventListener('input', () => {
      this.thresholdChangeCallback?.(parseInt(threshold.value, 10));
    });

    // 캘리브레이션 버튼
    const calibrateBtn = this.container.querySelector('[data-calibrate]');
    calibrateBtn?.addEventListener('click', () => {
      this.calibrateCallback?.();
    });

    // 캘리브레이션 초기화 버튼
    const resetBtn = this.container.querySelector('[data-reset-calibration]');
    resetBtn?.addEventListener('click', () => {
      this.resetCalibrationCallback?.();
    });
  }
}
