import './style.css';
import { CameraView } from './views/CameraView';
import { StatusView } from './views/StatusView';
import { AlertView } from './views/AlertView';
import { SettingsView } from './views/SettingsView';
import { OnboardingView } from './views/OnboardingView';
import { PoseDetectionService } from './services/PoseDetectionService';
import { CalibrationService } from './services/CalibrationService';
import { PostureController } from './controllers/PostureController';
import { MonitoringController } from './controllers/MonitoringController';
import { AlertController } from './controllers/AlertController';

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
          <p class="text-[17px] text-gray-400 font-medium">카메라를 시작해주세요</p>
          <p class="text-[14px] text-gray-500 mt-2">자세를 실시간으로 분석해드려요</p>
        </div>
      </div>

      <!-- 카메라 영역 -->
      <div class="mb-6">
        <div id="camera-container" class="aspect-video bg-[#2B3240] rounded-3xl overflow-hidden">
        </div>
      </div>

      <!-- 모니터링 통계 -->
      <div id="stats-container" class="mb-6 hidden">
        <div class="bg-[#2B3240] rounded-2xl p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[13px] text-gray-400">세션 진행</span>
            <span id="session-timer" class="text-[13px] text-[#3182F6] font-medium">0초 / 60초</span>
          </div>
          <div class="w-full h-1.5 bg-[#3B4654] rounded-full overflow-hidden">
            <div id="session-progress" class="h-full bg-[#3182F6] rounded-full transition-all duration-500" style="width: 0%"></div>
          </div>
        </div>
      </div>

      <!-- 캘리브레이션 상태 -->
      <div id="calibration-status" class="mb-6 hidden">
        <div class="bg-[#2B3240] rounded-2xl p-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-[#00D26A]/15 flex items-center justify-center">
              <svg class="w-4 h-4 text-[#00D26A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div>
              <div class="text-sm font-medium">캘리브레이션 완료</div>
              <div id="baseline-angle" class="text-xs text-gray-400">기준 각도: 0°</div>
            </div>
          </div>
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
  </div>
`;

async function initApp(): Promise<void> {
  // Views
  const cameraView = new CameraView('camera-container');
  const statusView = new StatusView('status-container');
  const alertView = new AlertView('alert-container');
  const settingsView = new SettingsView('settings-container');
  const onboardingView = new OnboardingView('onboarding-container');

  // Services & Controllers
  const poseService = new PoseDetectionService();
  const calibrationService = new CalibrationService();
  const postureController = new PostureController(poseService);
  const monitoringController = new MonitoringController();
  const alertController = new AlertController();

  // UI Elements
  const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
  const settingsBtn = document.getElementById('settings-btn') as HTMLButtonElement;
  const statsContainer = document.getElementById('stats-container') as HTMLDivElement;
  const sessionTimer = document.getElementById('session-timer') as HTMLSpanElement;
  const sessionProgress = document.getElementById('session-progress') as HTMLDivElement;
  const calibrationStatus = document.getElementById('calibration-status') as HTMLDivElement;
  const baselineAngleEl = document.getElementById('baseline-angle') as HTMLDivElement;

  let isRunning = false;
  let animationId: number | null = null;
  let sessionStartTime: number | null = null;
  let timerInterval: ReturnType<typeof setInterval> | null = null;
  let soundEnabled = true;

  // 캘리브레이션 상태 업데이트
  const updateCalibrationUI = (): void => {
    if (calibrationService.isCalibrated()) {
      calibrationStatus.classList.remove('hidden');
      baselineAngleEl.textContent = `기준 각도: ${calibrationService.getBaselineAngle().toFixed(1)}°`;
    } else {
      calibrationStatus.classList.add('hidden');
    }
  };

  // 초기 캘리브레이션 UI 업데이트
  updateCalibrationUI();

  // 온보딩 표시
  if (onboardingView.shouldShow()) {
    onboardingView.render();

    onboardingView.onComplete(() => {
      console.log('온보딩 완료');
    });

    onboardingView.onSkip(() => {
      console.log('온보딩 건너뛰기');
    });
  }

  // 설정 버튼
  settingsBtn.addEventListener('click', () => {
    settingsView.render({
      soundEnabled,
      alertThreshold: alertController.getThreshold(),
      isCalibrated: calibrationService.isCalibrated(),
    });
  });

  // 설정 콜백들
  settingsView.onClose(() => {
    settingsView.hide();
  });

  settingsView.onSoundToggle((enabled) => {
    soundEnabled = enabled;
    alertView.setSoundEnabled(enabled);
  });

  settingsView.onThresholdChange((value) => {
    alertController.setThreshold(value);
  });

  settingsView.onCalibrate(() => {
    settingsView.hide();
    startCalibration();
  });

  settingsView.onResetCalibration(() => {
    calibrationService.reset();
    updateCalibrationUI();
    settingsView.render({
      soundEnabled,
      alertThreshold: alertController.getThreshold(),
      isCalibrated: false,
    });
  });

  // 캘리브레이션 시작
  const startCalibration = async (): Promise<void> => {
    try {
      statusView.renderLoading();
      startBtn.textContent = '캘리브레이션 중...';
      startBtn.disabled = true;

      cameraView.render();
      await poseService.initialize();
      await cameraView.startCamera();

      calibrationService.clearSamples();
      let sampleCount = 0;
      const targetSamples = 10;

      const calibrateLoop = async (): Promise<void> => {
        const video = cameraView.getVideoElement();
        if (video && video.readyState >= 2) {
          const poses = await poseService.detectPose(video);

          if (poses.length > 0) {
            const result = postureController.analyzePosture(poses[0]);
            if (result) {
              calibrationService.addCalibrationSample(result.neckAngle);
              sampleCount++;
              statusView.renderError(`캘리브레이션 중... (${sampleCount}/${targetSamples})`);
            }
          }
        }

        if (sampleCount < targetSamples) {
          setTimeout(calibrateLoop, 300);
        } else {
          // 캘리브레이션 완료
          calibrationService.finishCalibration();
          cameraView.stopCamera();
          updateCalibrationUI();

          statusView.renderError('캘리브레이션 완료!');
          startBtn.textContent = '시작하기';
          startBtn.disabled = false;

          setTimeout(() => {
            statusView.renderError('카메라를 시작해주세요');
          }, 1500);
        }
      };

      calibrateLoop();
    } catch (error) {
      console.error('Calibration error:', error);
      statusView.renderError('캘리브레이션 실패');
      startBtn.textContent = '시작하기';
      startBtn.disabled = false;
    }
  };

  // 세션 타이머 업데이트
  const updateSessionTimer = (): void => {
    if (!sessionStartTime) return;

    const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
    const progress = Math.min((elapsed / 60) * 100, 100);

    sessionTimer.textContent = `${elapsed}초 / 60초`;
    sessionProgress.style.width = `${progress}%`;
  };

  // 알림 설정
  alertController.onAlert(() => {
    alertView.show();
  });

  alertView.onDismiss(() => {
    alertController.dismissAlert();
  });

  // 세션 완료 콜백
  monitoringController.onSessionComplete((stats) => {
    console.log('세션 완료:', stats);

    const { normal, warning, danger } = stats.levelStats;
    const total = normal + warning + danger;

    if (total > 0) {
      const normalPercent = Math.round((normal / total) * 100);
      console.log(`정상 자세 비율: ${normalPercent}%, 평균 각도: ${stats.averageAngle.toFixed(1)}°`);
    }

    // 세션 초기화 후 다시 시작
    sessionStartTime = Date.now();
    monitoringController.start();
  });

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

      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }

      cameraView.stopCamera();
      monitoringController.stop();
      alertController.dismissAlert();
      alertView.hide();

      statsContainer.classList.add('hidden');
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

      // 모니터링 시작
      statsContainer.classList.remove('hidden');
      sessionStartTime = Date.now();
      monitoringController.start();

      // 타이머 업데이트 (1초마다)
      timerInterval = setInterval(updateSessionTimer, 1000);

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
                // 캘리브레이션 적용
                const adjustedAngle = calibrationService.getAdjustedAngle(result.neckAngle);
                const adjustedResult = {
                  ...result,
                  neckAngle: Math.abs(adjustedAngle),
                };

                statusView.render(adjustedResult);

                // 모니터링에 기록
                monitoringController.recordPosture(adjustedResult);

                // 알림 체크
                alertController.checkPosture(adjustedResult.level);
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
