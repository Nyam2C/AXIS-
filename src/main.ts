import './style.css';
import { AppController } from './controllers/AppController';

// AXIS - Posture Correction App
const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <div class="min-h-screen bg-[#191F28] text-white">
    <!-- 헤더 -->
    <header class="safe-area-top px-5 py-4">
      <div class="flex items-center justify-between max-w-lg mx-auto">
        <div class="w-10"></div>
        <h1 class="text-[22px] font-bold tracking-tight">AXIS</h1>
        <button id="settings-btn" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#2B3240] transition-colors">
          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </button>
      </div>
    </header>

    <!-- 메인 컨텐츠 -->
    <main class="px-5 pb-32 max-w-lg mx-auto">
      <!-- 상태 카드 -->
      <div id="status-container" class="mb-6">
        <div class="bg-[#2B3240] rounded-3xl p-8 text-center">
          <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-[#3B4654] flex items-center justify-center">
            <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </div>
          <p class="text-[17px] text-gray-400 font-medium">바른 자세를 취해주세요</p>
          <p class="text-[14px] text-gray-500 mt-2">시작 시 현재 자세가 기준점이 됩니다</p>
        </div>
      </div>

      <!-- 카메라 영역 -->
      <div class="mb-6">
        <div id="camera-container" class="aspect-video bg-[#2B3240] rounded-3xl overflow-hidden">
        </div>
      </div>

      <!-- 캘리브레이션 진행 상태 -->
      <div id="calibration-progress" class="mb-6 hidden">
        <div class="bg-[#2B3240] rounded-2xl p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[13px] text-gray-400">기준 자세 측정 중</span>
            <span id="calibration-count" class="text-[13px] text-[#3182F6] font-medium">0 / 5</span>
          </div>
          <div class="w-full h-1.5 bg-[#3B4654] rounded-full overflow-hidden">
            <div id="calibration-bar" class="h-full bg-[#3182F6] rounded-full transition-all duration-300" style="width: 0%"></div>
          </div>
        </div>
      </div>

      <!-- 모니터링 통계 -->
      <div id="stats-container" class="mb-6 hidden">
        <div class="bg-[#2B3240] rounded-2xl p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[13px] text-gray-400">모니터링 중</span>
            <span id="current-angle" class="text-[13px] text-[#3182F6] font-medium">0°</span>
          </div>
          <div class="text-xs text-gray-500">기준 자세에서 벗어난 각도를 측정합니다</div>
        </div>
      </div>

      <!-- 정보 카드 -->
      <div class="grid grid-cols-3 gap-3 mb-6">
        <div class="bg-[#2B3240] rounded-2xl p-4 text-center">
          <div class="text-[13px] text-gray-500 mb-1">정상</div>
          <div class="text-[15px] font-semibold text-[#00D26A]">0° ~ 15°</div>
        </div>
        <div class="bg-[#2B3240] rounded-2xl p-4 text-center">
          <div class="text-[13px] text-gray-500 mb-1">주의</div>
          <div class="text-[15px] font-semibold text-[#FFD60A]">15° ~ 25°</div>
        </div>
        <div class="bg-[#2B3240] rounded-2xl p-4 text-center">
          <div class="text-[13px] text-gray-500 mb-1">위험</div>
          <div class="text-[15px] font-semibold text-[#FF453A]">25° 이상</div>
        </div>
      </div>
    </main>

    <!-- 하단 버튼 -->
    <div class="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#191F28] via-[#191F28] to-transparent pt-10">
      <div class="max-w-lg mx-auto">
        <button id="start-btn" class="w-full bg-[#3182F6] hover:bg-[#1B64DA] active:scale-[0.98] text-white py-4 px-6 rounded-2xl font-semibold text-[17px] transition-all duration-150 shadow-lg shadow-[#3182F6]/25">
          시작하기
        </button>
      </div>
    </div>

    <!-- 오버레이 컨테이너 -->
    <div id="alert-container"></div>
    <div id="settings-container"></div>
    <div id="onboarding-container"></div>
    <div id="result-container"></div>
  </div>
`;

// Initialize app
const appController = new AppController();
appController.init();
