import './style.css';
import { CameraView } from './views/CameraView';
import { StatusView } from './views/StatusView';
import { PoseDetectionService } from './services/PoseDetectionService';
import { PostureController } from './controllers/PostureController';

// AXIS - Posture Correction App
const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <div class="min-h-screen bg-[#191F28] text-white">
    <!-- 헤더 -->
    <header class="safe-area-top px-5 py-4">
      <div class="flex items-center justify-center max-w-lg mx-auto">
        <h1 class="text-[22px] font-bold tracking-tight">AXIS</h1>
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
          <p class="text-[17px] text-gray-400 font-medium">카메라를 시작해주세요</p>
          <p class="text-[14px] text-gray-500 mt-2">자세를 실시간으로 분석해드려요</p>
        </div>
      </div>

      <!-- 카메라 영역 -->
      <div class="mb-6">
        <div id="camera-container" class="aspect-video bg-[#2B3240] rounded-3xl overflow-hidden">
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
  </div>
`;

async function initApp(): Promise<void> {
  const cameraView = new CameraView('camera-container');
  const statusView = new StatusView('status-container');
  const poseService = new PoseDetectionService();
  const postureController = new PostureController(poseService);

  const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
  let isRunning = false;
  let animationId: number | null = null;

  startBtn.addEventListener('click', async () => {
    if (isRunning) {
      // 중지
      isRunning = false;
      startBtn.textContent = '시작하기';
      startBtn.className = 'w-full bg-[#3182F6] hover:bg-[#1B64DA] active:scale-[0.98] text-white py-4 px-6 rounded-2xl font-semibold text-[17px] transition-all duration-150 shadow-lg shadow-[#3182F6]/25';

      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      cameraView.stopCamera();
      return;
    }

    // 시작
    try {
      startBtn.textContent = '준비 중...';
      startBtn.disabled = true;
      startBtn.className = 'w-full bg-[#3B4654] text-gray-400 py-4 px-6 rounded-2xl font-semibold text-[17px] transition-all duration-150';

      statusView.renderLoading();
      cameraView.render();

      await poseService.initialize();
      await cameraView.startCamera();

      isRunning = true;
      startBtn.textContent = '측정 중지';
      startBtn.disabled = false;
      startBtn.className = 'w-full bg-[#2B3240] hover:bg-[#3B4654] active:scale-[0.98] text-white py-4 px-6 rounded-2xl font-semibold text-[17px] transition-all duration-150 border border-[#3B4654]';

      // 실시간 포즈 감지 루프
      const detectLoop = async (): Promise<void> => {
        if (!isRunning) return;

        const video = cameraView.getVideoElement();
        if (video && video.readyState >= 2) {
          try {
            const poses = await poseService.detectPose(video);

            if (poses.length > 0) {
              const result = postureController.analyzePosture(poses[0]);

              if (result) {
                statusView.render(result);
              } else {
                statusView.renderError('얼굴이 잘 보이게 해주세요');
              }
            } else {
              statusView.renderError('포즈를 감지할 수 없습니다');
            }
          } catch (error) {
            console.error('Detection error:', error);
          }
        }

        animationId = requestAnimationFrame(detectLoop);
      };

      detectLoop();
    } catch (error) {
      console.error('Init error:', error);
      const message = error instanceof Error ? error.message : '알 수 없는 오류';
      statusView.renderError(message);
      startBtn.textContent = '다시 시도';
      startBtn.disabled = false;
      startBtn.className = 'w-full bg-[#3182F6] hover:bg-[#1B64DA] active:scale-[0.98] text-white py-4 px-6 rounded-2xl font-semibold text-[17px] transition-all duration-150 shadow-lg shadow-[#3182F6]/25';
    }
  });
}

initApp();
