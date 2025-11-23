const STORAGE_KEY = 'axis_onboarding_completed';

interface OnboardingStep {
  emoji: string;
  title: string;
  description: string;
}

const STEPS: OnboardingStep[] = [
  {
    emoji: '👋',
    title: 'AXIS에 오신 것을 환영합니다',
    description: '실시간으로 자세를 분석하고 거북목을 예방해요.',
  },
  {
    emoji: '📷',
    title: '카메라 권한이 필요해요',
    description: '자세 분석을 위해 카메라 접근 권한을 허용해주세요.',
  },
  {
    emoji: '🎯',
    title: '캘리브레이션을 해보세요',
    description: '바른 자세를 취한 후 캘리브레이션하면 더 정확해요.',
  },
];

/**
 * 온보딩 플로우 View
 */
export class OnboardingView {
  private container: HTMLElement;
  private currentStep = 0;
  private completeCallback: (() => void) | null = null;
  private skipCallback: (() => void) | null = null;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);

    if (!container) {
      throw new Error(`컨테이너를 찾을 수 없습니다: ${containerId}`);
    }

    this.container = container;
  }

  /**
   * 온보딩을 표시해야 하는지 확인한다.
   */
  shouldShow(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== 'true';
  }

  /**
   * 현재 스텝을 반환한다.
   */
  getCurrentStep(): number {
    return this.currentStep;
  }

  /**
   * 온보딩 화면을 렌더링한다.
   */
  render(): void {
    const step = STEPS[this.currentStep];
    const isLastStep = this.currentStep === STEPS.length - 1;

    this.container.innerHTML = `
      <div class="fixed inset-0 bg-[#191F28] z-50 flex flex-col items-center justify-center p-6">
        <!-- 스킵 버튼 -->
        <button data-skip class="absolute top-6 right-6 text-gray-400 hover:text-white text-sm">
          건너뛰기
        </button>

        <!-- 컨텐츠 -->
        <div class="text-center max-w-sm">
          <div class="text-7xl mb-6">${step.emoji}</div>
          <h1 class="text-2xl font-bold mb-3">${step.title}</h1>
          <p class="text-gray-400 mb-10">${step.description}</p>

          <!-- 인디케이터 -->
          <div class="flex justify-center gap-2 mb-8">
            ${STEPS.map(
              (_, i) => `
              <div class="w-2 h-2 rounded-full ${i === this.currentStep ? 'bg-[#3182F6]' : 'bg-[#3B4654]'}"></div>
            `
            ).join('')}
          </div>

          <!-- 버튼 -->
          <button data-start class="w-full bg-[#3182F6] hover:bg-[#1B64DA] text-white py-4 px-6 rounded-2xl font-semibold text-[17px] transition-all">
            ${isLastStep ? '시작하기' : '다음'}
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  /**
   * 다음 스텝으로 이동한다.
   */
  nextStep(): void {
    if (this.currentStep < STEPS.length - 1) {
      this.currentStep++;
      this.render();
    } else {
      this.complete();
    }
  }

  /**
   * 온보딩을 완료한다.
   */
  private complete(): void {
    this.markCompleted();
    this.hide();
    this.completeCallback?.();
  }

  /**
   * 온보딩 완료를 저장한다.
   */
  markCompleted(): void {
    localStorage.setItem(STORAGE_KEY, 'true');
  }

  /**
   * 온보딩 화면을 숨긴다.
   */
  hide(): void {
    this.container.innerHTML = '';
  }

  /**
   * 완료 콜백을 등록한다.
   */
  onComplete(callback: () => void): void {
    this.completeCallback = callback;
  }

  /**
   * 건너뛰기 콜백을 등록한다.
   */
  onSkip(callback: () => void): void {
    this.skipCallback = callback;
  }

  /**
   * 이벤트를 바인딩한다.
   */
  private bindEvents(): void {
    const startBtn = this.container.querySelector('[data-start]');
    startBtn?.addEventListener('click', () => {
      this.nextStep();
    });

    const skipBtn = this.container.querySelector('[data-skip]');
    skipBtn?.addEventListener('click', () => {
      this.markCompleted();
      this.hide();
      this.skipCallback?.();
    });
  }
}
