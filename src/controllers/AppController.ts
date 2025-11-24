import { CameraView } from '../views/CameraView';
import { StatusView } from '../views/StatusView';
import { AlertView } from '../views/AlertView';
import { SettingsView } from '../views/SettingsView';
import { OnboardingView } from '../views/OnboardingView';
import { ResultView } from '../views/ResultView';
import { PoseDetectionService } from '../services/PoseDetectionService';
import { CalibrationService } from '../services/CalibrationService';
import { PostureController } from './PostureController';
import { MonitoringController } from './MonitoringController';
import { AlertController } from './AlertController';

/**
 * 앱 전체 흐름을 관리하는 메인 Controller
 */
export class AppController {
  // Views
  private cameraView: CameraView;
  private statusView: StatusView;
  private alertView: AlertView;
  private settingsView: SettingsView;
  private onboardingView: OnboardingView;
  private resultView: ResultView;

  // Services & Controllers
  private poseService: PoseDetectionService;
  private calibrationService: CalibrationService;
  private postureController: PostureController;
  private monitoringController: MonitoringController;
  private alertController: AlertController;

  // UI Elements
  private startBtn!: HTMLButtonElement;
  private settingsBtn!: HTMLButtonElement;
  private calibrationProgress!: HTMLDivElement;
  private calibrationCount!: HTMLSpanElement;
  private calibrationBar!: HTMLDivElement;
  private statsContainer!: HTMLDivElement;
  private currentAngleEl!: HTMLSpanElement;

  // State
  private isRunning = false;
  private animationId: number | null = null;
  private soundEnabled = true;
  private lastPostureResult: { level: 'normal' | 'warning' | 'danger'; neckAngle: number; distanceChange: number } | null = null;

  constructor() {
    // Views
    this.cameraView = new CameraView('camera-container');
    this.statusView = new StatusView('status-container');
    this.alertView = new AlertView('alert-container');
    this.settingsView = new SettingsView('settings-container');
    this.onboardingView = new OnboardingView('onboarding-container');
    this.resultView = new ResultView('result-container');

    // Services & Controllers
    this.poseService = new PoseDetectionService();
    this.calibrationService = new CalibrationService();
    this.postureController = new PostureController(this.poseService);
    this.postureController.setCalibrationService(this.calibrationService);
    this.monitoringController = new MonitoringController();
    this.alertController = new AlertController();
  }

  /**
   * 앱을 초기화한다.
   */
  async init(): Promise<void> {
    this.bindUIElements();
    this.setupOnboarding();
    this.setupSettings();
    this.setupAlerts();
    this.setupResult();
    this.setupStartButton();
  }

  /**
   * UI 요소를 바인딩한다.
   */
  private bindUIElements(): void {
    this.startBtn = document.getElementById('start-btn') as HTMLButtonElement;
    this.settingsBtn = document.getElementById('settings-btn') as HTMLButtonElement;
    this.calibrationProgress = document.getElementById('calibration-progress') as HTMLDivElement;
    this.calibrationCount = document.getElementById('calibration-count') as HTMLSpanElement;
    this.calibrationBar = document.getElementById('calibration-bar') as HTMLDivElement;
    this.statsContainer = document.getElementById('stats-container') as HTMLDivElement;
    this.currentAngleEl = document.getElementById('current-angle') as HTMLSpanElement;
  }

  /**
   * 온보딩을 설정한다.
   */
  private setupOnboarding(): void {
    if (this.onboardingView.shouldShow()) {
      this.onboardingView.render();
      this.onboardingView.onComplete(() => console.log('온보딩 완료'));
      this.onboardingView.onSkip(() => console.log('온보딩 건너뛰기'));
    }
  }

  /**
   * 설정을 설정한다.
   */
  private setupSettings(): void {
    this.settingsBtn.addEventListener('click', () => {
      this.settingsView.render({
        soundEnabled: this.soundEnabled,
        alertThreshold: this.alertController.getThreshold(),
        isCalibrated: this.calibrationService.isCalibrated(),
      });
    });

    this.settingsView.onClose(() => this.settingsView.hide());
    this.settingsView.onSoundToggle((enabled) => {
      this.soundEnabled = enabled;
      this.alertView.setSoundEnabled(enabled);
    });
    this.settingsView.onThresholdChange((value) => this.alertController.setThreshold(value));
    this.settingsView.onResetCalibration(() => {
      this.calibrationService.reset();
      this.settingsView.render({
        soundEnabled: this.soundEnabled,
        alertThreshold: this.alertController.getThreshold(),
        isCalibrated: false,
      });
    });
  }

  /**
   * 알림을 설정한다.
   */
  private setupAlerts(): void {
    this.alertController.onAlert(() => this.alertView.show());
    this.alertView.onDismiss(() => this.alertController.dismissAlert());
  }

  /**
   * 결과 화면을 설정한다.
   */
  private setupResult(): void {
    this.resultView.onClose(() => {
      this.resultView.hide();
    });
  }

  /**
   * 시작 버튼을 설정한다.
   */
  private setupStartButton(): void {
    this.startBtn.addEventListener('click', () => this.handleStartClick());
  }

  /**
   * 시작 버튼 클릭을 처리한다.
   */
  private async handleStartClick(): Promise<void> {
    if (this.isRunning) {
      this.stop();
      return;
    }

    await this.start();
  }

  /**
   * 측정을 중지한다.
   */
  private stop(): void {
    // 통계 먼저 가져오기 (stop 호출 전에)
    const stats = this.monitoringController.getSessionStats();
    const hasData = stats.totalSamples > 0;

    this.isRunning = false;
    this.updateButtonToStart();

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    this.cameraView.clearCanvas();
    this.cameraView.stopCamera();
    this.monitoringController.stop();
    this.monitoringController.clearHistory();
    this.alertController.dismissAlert();
    this.alertView.hide();
    this.calibrationService.reset();

    this.calibrationProgress.classList.add('hidden');
    this.statsContainer.classList.add('hidden');
    this.lastPostureResult = null;

    // 데이터가 있으면 결과 화면 표시
    if (hasData) {
      this.resultView.render(stats);
    }
  }

  /**
   * 측정을 시작한다.
   */
  private async start(): Promise<void> {
    try {
      this.updateButtonToLoading();
      this.statusView.renderLoading();
      this.cameraView.render();

      await this.poseService.initialize();
      await this.cameraView.startCamera();

      await this.runCalibration();
      this.startMonitoring();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 캘리브레이션을 실행한다.
   * 5회 측정 후 변동이 크면 다시 측정한다.
   */
  private async runCalibration(): Promise<void> {
    this.calibrationProgress.classList.remove('hidden');

    const runCalibrationAttempt = (): Promise<boolean> => {
      this.calibrationService.clearSamples();
      let sampleCount = 0;
      const targetSamples = 5;

      return new Promise((resolve) => {
        const loop = async () => {
          const video = this.cameraView.getVideoElement();
          if (video && video.readyState >= 2) {
            const poses = await this.poseService.detectPose(video);

            if (poses.length > 0) {
              // 스켈레톤 그리기
              this.cameraView.drawSkeleton(poses[0]);

              // 어깨 감지 확인
              if (!this.postureController.hasShoulderDetected(poses[0])) {
                this.statusView.renderError('어깨가 보이도록 카메라를 조정해주세요');
              } else {
                // 거리 기반 측정
                const distance = this.postureController.calculateDistance(poses[0]);
                if (distance !== null) {
                  this.calibrationService.addCalibrationSample(distance);
                  sampleCount++;

                  this.calibrationCount.textContent = `${sampleCount} / ${targetSamples}`;
                  this.calibrationBar.style.width = `${(sampleCount / targetSamples) * 100}%`;
                  this.statusView.renderError(`바른 자세를 유지해주세요 (${sampleCount}/${targetSamples})`);
                }
              }
            }
          }

          if (sampleCount < targetSamples) {
            setTimeout(loop, 400);
          } else {
            // 캘리브레이션 완료 시도 (변동 검사 포함)
            const result = this.calibrationService.finishCalibration();

            if (result.success) {
              resolve(true);
            } else if (result.needsRetry) {
              // 변동이 크면 재시도 안내
              this.statusView.renderError(result.message);
              this.calibrationCount.textContent = '0 / 5';
              this.calibrationBar.style.width = '0%';

              // 2초 후 재시도
              setTimeout(() => resolve(false), 2000);
            } else {
              resolve(false);
            }
          }
        };

        loop();
      });
    };

    // 캘리브레이션 시도 (최대 3회)
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      const success = await runCalibrationAttempt();
      if (success) {
        this.calibrationProgress.classList.add('hidden');
        this.statusView.renderError('캘리브레이션 완료!');
        return;
      }
      attempts++;

      if (attempts < maxAttempts) {
        this.statusView.renderError(`재측정 중... (${attempts}/${maxAttempts})`);
      }
    }

    // 3회 실패 시 마지막 값으로 진행
    this.calibrationProgress.classList.add('hidden');
    this.statusView.renderError('캘리브레이션 완료 (자세를 더 안정적으로 유지해주세요)');
  }

  /**
   * 모니터링을 시작한다.
   */
  private startMonitoring(): void {
    this.isRunning = true;
    this.updateButtonToStop();

    this.statsContainer.classList.remove('hidden');

    // 10초마다 마지막 자세 상태를 기록 및 UI 업데이트
    this.monitoringController.onSample(() => {
      if (this.lastPostureResult) {
        this.monitoringController.recordPosture({
          level: this.lastPostureResult.level,
          neckAngle: this.lastPostureResult.neckAngle,
          noseToShoulderDistance: 0,
          distanceChange: this.lastPostureResult.distanceChange,
          timestamp: Date.now(),
        });

        // 10초마다 거리 변화 표시 업데이트 (픽셀 단위)
        this.currentAngleEl.textContent = `${this.lastPostureResult.distanceChange.toFixed(1)}px`;
      }
    });

    this.monitoringController.start();
    this.runDetectionLoop();
  }

  /**
   * 실시간 감지 루프를 실행한다.
   * 거리 변화 기반으로 자세를 판단한다.
   */
  private async runDetectionLoop(): Promise<void> {
    if (!this.isRunning) return;

    const video = this.cameraView.getVideoElement();
    if (video && video.readyState >= 2) {
      try {
        const poses = await this.poseService.detectPose(video);

        if (poses.length > 0) {
          // 스켈레톤 그리기
          this.cameraView.drawSkeleton(poses[0]);

          // 어깨 감지 여부 확인
          if (!this.postureController.hasShoulderDetected(poses[0])) {
            this.statusView.renderError('어깨가 보이도록 카메라를 조정해주세요');
          } else {
            // 거리 변화 기반 분석
            const result = this.postureController.analyzePosture(poses[0]);

            if (result) {
              this.statusView.render(result);

              // 마지막 자세 상태 저장 (10초마다 기록용)
              this.lastPostureResult = {
                level: result.level,
                neckAngle: result.distanceChange, // 하위 호환성을 위해 neckAngle에 저장
                distanceChange: result.distanceChange,
              };
              this.alertController.checkPosture(result.level);
            } else {
              this.statusView.renderError('어깨가 보이도록 카메라를 조정해주세요');
            }
          }
        } else {
          this.statusView.renderError('포즈를 감지할 수 없습니다');
        }
      } catch (error) {
        console.error('Detection error:', error);
      }
    }

    this.animationId = requestAnimationFrame(() => this.runDetectionLoop());
  }

  /**
   * 에러를 처리한다.
   */
  private handleError(error: unknown): void {
    console.error('Init error:', error);
    const message = error instanceof Error ? error.message : '알 수 없는 오류';
    this.statusView.renderError(message);
    this.updateButtonToRetry();
  }

  /**
   * 버튼을 시작 상태로 업데이트한다.
   */
  private updateButtonToStart(): void {
    this.startBtn.textContent = '시작하기';
    this.startBtn.className = 'w-full bg-[#3182F6] hover:bg-[#1B64DA] active:scale-[0.98] text-white py-4 px-6 rounded-2xl font-semibold text-[17px] transition-all duration-150 shadow-lg shadow-[#3182F6]/25';
  }

  /**
   * 버튼을 로딩 상태로 업데이트한다.
   */
  private updateButtonToLoading(): void {
    this.startBtn.textContent = '준비 중...';
    this.startBtn.disabled = true;
    this.startBtn.className = 'w-full bg-[#3B4654] text-gray-400 py-4 px-6 rounded-2xl font-semibold text-[17px] transition-all duration-150';
  }

  /**
   * 버튼을 중지 상태로 업데이트한다.
   */
  private updateButtonToStop(): void {
    this.startBtn.textContent = '측정 중지';
    this.startBtn.disabled = false;
    this.startBtn.className = 'w-full bg-[#2B3240] hover:bg-[#3B4654] active:scale-[0.98] text-white py-4 px-6 rounded-2xl font-semibold text-[17px] transition-all duration-150 border border-[#3B4654]';
  }

  /**
   * 버튼을 재시도 상태로 업데이트한다.
   */
  private updateButtonToRetry(): void {
    this.startBtn.textContent = '다시 시도';
    this.startBtn.disabled = false;
    this.startBtn.className = 'w-full bg-[#3182F6] hover:bg-[#1B64DA] active:scale-[0.98] text-white py-4 px-6 rounded-2xl font-semibold text-[17px] transition-all duration-150 shadow-lg shadow-[#3182F6]/25';
  }
}
