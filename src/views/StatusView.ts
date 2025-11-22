import type { PostureState, PostureLevel } from '../models/PostureState';

const LEVEL_CONFIG: Record<
  PostureLevel,
  { color: string; bgColor: string; label: string; emoji: string; message: string }
> = {
  normal: {
    color: '#00D26A',
    bgColor: 'rgba(0, 210, 106, 0.15)',
    label: '좋아요',
    emoji: '👍',
    message: '바른 자세를 유지하고 있어요',
  },
  warning: {
    color: '#FFD60A',
    bgColor: 'rgba(255, 214, 10, 0.15)',
    label: '주의',
    emoji: '⚠️',
    message: '목이 조금 앞으로 나왔어요',
  },
  danger: {
    color: '#FF453A',
    bgColor: 'rgba(255, 69, 58, 0.15)',
    label: '위험',
    emoji: '🚨',
    message: '거북목 자세예요! 목을 펴주세요',
  },
};

/**
 * 자세 상태를 표시하는 View
 */
export class StatusView {
  private container: HTMLElement;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);

    if (!container) {
      throw new Error(`컨테이너를 찾을 수 없습니다: ${containerId}`);
    }

    this.container = container;
  }

  /**
   * 자세 상태를 렌더링한다.
   */
  render(state: PostureState): void {
    const config = LEVEL_CONFIG[state.level];
    const angle = Math.round(state.neckAngle);

    this.container.innerHTML = `
      <div class="bg-[#2B3240] rounded-3xl p-6 ${state.level}">
        <!-- 상태 뱃지 -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2">
            <span class="text-2xl">${config.emoji}</span>
            <span class="text-[15px] font-semibold" style="color: ${config.color}">${config.label}</span>
          </div>
          <div class="px-3 py-1 rounded-full text-[13px] font-medium" style="background: ${config.bgColor}; color: ${config.color}">
            실시간
          </div>
        </div>

        <!-- 각도 표시 -->
        <div class="text-center mb-6">
          <div class="text-[64px] font-bold tracking-tight leading-none mb-2" style="color: ${config.color}">
            ${angle}°
          </div>
          <div class="text-[15px] text-gray-400">목 기울기 각도</div>
        </div>

        <!-- 상태 메시지 -->
        <div class="rounded-2xl p-4 text-center" style="background: ${config.bgColor}">
          <p class="text-[15px] font-medium" style="color: ${config.color}">${config.message}</p>
        </div>

        <!-- 프로그레스 바 -->
        <div class="mt-6">
          <div class="flex justify-between text-[13px] text-gray-500 mb-2">
            <span>0°</span>
            <span>15°</span>
            <span>25°</span>
            <span>45°</span>
          </div>
          <div class="h-2 bg-[#3B4654] rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-300"
              style="width: ${Math.min(100, (angle / 45) * 100)}%; background: ${config.color}"
            ></div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 에러 메시지를 렌더링한다.
   */
  renderError(message: string): void {
    this.container.innerHTML = `
      <div class="bg-[#2B3240] rounded-3xl p-8 text-center error">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FF453A]/15 flex items-center justify-center">
          <span class="text-3xl">😅</span>
        </div>
        <p class="text-[17px] text-gray-300 font-medium mb-2">잠깐!</p>
        <p class="text-[15px] text-gray-500">${message}</p>
      </div>
    `;
  }

  /**
   * 로딩 상태를 렌더링한다.
   */
  renderLoading(): void {
    this.container.innerHTML = `
      <div class="bg-[#2B3240] rounded-3xl p-8 text-center loading">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-[#3182F6]/15 flex items-center justify-center">
          <div class="w-8 h-8 border-3 border-[#3182F6] border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p class="text-[17px] text-gray-300 font-medium mb-2">준비 중...</p>
        <p class="text-[15px] text-gray-500">AI 모델을 불러오고 있어요</p>
      </div>
    `;
  }
}
