import type { SessionStats } from '../controllers/MonitoringController';

/**
 * 측정 결과 화면을 담당하는 View
 * 측정 종료 시 통계를 보여줌
 */
export class ResultView {
  private containerId: string;
  private container: HTMLElement | null = null;
  private closeCallback: (() => void) | null = null;

  constructor(containerId: string) {
    this.containerId = containerId;
  }

  /**
   * 결과 화면을 렌더링한다.
   */
  render(stats: SessionStats): void {
    this.container = document.getElementById(this.containerId);
    if (!this.container) return;

    const durationMinutes = Math.floor(stats.totalDuration / 60000);
    const durationSeconds = Math.floor((stats.totalDuration % 60000) / 1000);
    const durationText =
      durationMinutes > 0
        ? `${durationMinutes}분 ${durationSeconds}초`
        : `${durationSeconds}초`;

    const totalCount =
      stats.levelStats.normal + stats.levelStats.warning + stats.levelStats.danger;

    const normalPercent = totalCount > 0 ? Math.round((stats.levelStats.normal / totalCount) * 100) : 0;
    const warningPercent = totalCount > 0 ? Math.round((stats.levelStats.warning / totalCount) * 100) : 0;
    const dangerPercent = totalCount > 0 ? Math.round((stats.levelStats.danger / totalCount) * 100) : 0;

    // 점수 계산 (좋은 자세 비율 기반)
    const score = stats.goodPostureRatio;
    const grade = this.getGrade(score);
    const message = this.getMessage(score);

    this.container.innerHTML = `
      <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-5">
        <div class="bg-[#1E2530] rounded-3xl w-full max-w-sm overflow-hidden animate-fade-in">
          <!-- 헤더 -->
          <div class="bg-gradient-to-br ${this.getGradientColor(score)} p-6 text-center">
            <div class="text-6xl font-bold mb-2">${score}점</div>
            <div class="text-xl font-semibold">${grade}</div>
            <div class="text-sm opacity-80 mt-1">${message}</div>
          </div>

          <!-- 통계 -->
          <div class="p-5 space-y-4">
            <!-- 측정 시간 -->
            <div class="flex justify-between items-center py-2 border-b border-[#2B3240]">
              <span class="text-[#8B95A1]">측정 시간</span>
              <span class="font-semibold">${durationText}</span>
            </div>

            <!-- 평균 각도 -->
            <div class="flex justify-between items-center py-2 border-b border-[#2B3240]">
              <span class="text-[#8B95A1]">평균 목 각도</span>
              <span class="font-semibold">${stats.averageAngle.toFixed(1)}°</span>
            </div>

            <!-- 자세 분포 -->
            <div class="py-2">
              <div class="text-[#8B95A1] mb-3">자세 분포</div>

              <!-- 프로그레스 바 -->
              <div class="h-3 bg-[#2B3240] rounded-full overflow-hidden flex mb-3">
                <div class="bg-[#00D26A] h-full" style="width: ${normalPercent}%"></div>
                <div class="bg-[#FFB800] h-full" style="width: ${warningPercent}%"></div>
                <div class="bg-[#FF5252] h-full" style="width: ${dangerPercent}%"></div>
              </div>

              <!-- 범례 -->
              <div class="flex justify-between text-sm">
                <div class="flex items-center gap-1.5">
                  <div class="w-2.5 h-2.5 rounded-full bg-[#00D26A]"></div>
                  <span>좋음 ${normalPercent}%</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <div class="w-2.5 h-2.5 rounded-full bg-[#FFB800]"></div>
                  <span>주의 ${warningPercent}%</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <div class="w-2.5 h-2.5 rounded-full bg-[#FF5252]"></div>
                  <span>위험 ${dangerPercent}%</span>
                </div>
              </div>
            </div>

            <!-- 상세 횟수 -->
            <div class="grid grid-cols-3 gap-3 pt-2">
              <div class="bg-[#2B3240] rounded-xl p-3 text-center">
                <div class="text-[#00D26A] text-xl font-bold">${stats.levelStats.normal}</div>
                <div class="text-xs text-[#8B95A1]">좋은 자세</div>
              </div>
              <div class="bg-[#2B3240] rounded-xl p-3 text-center">
                <div class="text-[#FFB800] text-xl font-bold">${stats.levelStats.warning}</div>
                <div class="text-xs text-[#8B95A1]">주의 자세</div>
              </div>
              <div class="bg-[#2B3240] rounded-xl p-3 text-center">
                <div class="text-[#FF5252] text-xl font-bold">${stats.levelStats.danger}</div>
                <div class="text-xs text-[#8B95A1]">나쁜 자세</div>
              </div>
            </div>
          </div>

          <!-- 닫기 버튼 -->
          <div class="p-5 pt-0">
            <button id="result-close-btn" class="w-full bg-[#3182F6] hover:bg-[#1B64DA] active:scale-[0.98] text-white py-4 px-6 rounded-2xl font-semibold text-[17px] transition-all duration-150">
              확인
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  /**
   * 결과 화면을 숨긴다.
   */
  hide(): void {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  /**
   * 닫기 콜백을 등록한다.
   */
  onClose(callback: () => void): void {
    this.closeCallback = callback;
  }

  /**
   * 이벤트를 바인딩한다.
   */
  private bindEvents(): void {
    const closeBtn = document.getElementById('result-close-btn');
    closeBtn?.addEventListener('click', () => {
      this.closeCallback?.();
    });
  }

  /**
   * 점수에 따른 등급을 반환한다.
   */
  private getGrade(score: number): string {
    if (score >= 90) return '최고예요!';
    if (score >= 70) return '잘하고 있어요';
    if (score >= 50) return '조금 더 노력해요';
    if (score >= 30) return '주의가 필요해요';
    return '자세 교정이 필요해요';
  }

  /**
   * 점수에 따른 메시지를 반환한다.
   */
  private getMessage(score: number): string {
    if (score >= 90) return '거북목 걱정 없어요!';
    if (score >= 70) return '바른 자세를 유지하고 있어요';
    if (score >= 50) return '가끔 자세를 체크해주세요';
    if (score >= 30) return '자세에 더 신경 써주세요';
    return '스트레칭을 권장해요';
  }

  /**
   * 점수에 따른 그라데이션 색상을 반환한다.
   */
  private getGradientColor(score: number): string {
    if (score >= 70) return 'from-[#00D26A] to-[#00B85C]';
    if (score >= 50) return 'from-[#FFB800] to-[#FF9500]';
    return 'from-[#FF5252] to-[#E53935]';
  }
}
