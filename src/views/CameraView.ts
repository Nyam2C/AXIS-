import type { Pose } from '@tensorflow-models/pose-detection';

/**
 * 웹캠 비디오 스트림을 관리하는 View
 */
export class CameraView {
  private container: HTMLElement;
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private stream: MediaStream | null = null;

  /**
   * CameraView를 생성한다.
   * @param containerId - 비디오를 렌더링할 컨테이너 ID
   */
  constructor(containerId: string) {
    const container = document.getElementById(containerId);

    if (!container) {
      throw new Error(`컨테이너를 찾을 수 없습니다: ${containerId}`);
    }

    this.container = container;
  }

  /**
   * 비디오 엘리먼트와 캔버스를 컨테이너에 렌더링한다.
   */
  render(): void {
    // 컨테이너를 relative로 설정
    this.container.style.position = 'relative';

    // 비디오 엘리먼트
    this.videoElement = document.createElement('video');
    this.videoElement.autoplay = true;
    this.videoElement.playsInline = true;
    this.videoElement.style.width = '100%';
    this.videoElement.style.height = '100%';
    this.videoElement.style.objectFit = 'cover';
    this.container.appendChild(this.videoElement);

    // 스켈레톤 오버레이 캔버스
    this.canvasElement = document.createElement('canvas');
    this.canvasElement.style.position = 'absolute';
    this.canvasElement.style.top = '0';
    this.canvasElement.style.left = '0';
    this.canvasElement.style.width = '100%';
    this.canvasElement.style.height = '100%';
    this.canvasElement.style.pointerEvents = 'none';
    this.container.appendChild(this.canvasElement);
  }

  /**
   * 카메라 스트림을 시작한다.
   */
  async startCamera(): Promise<void> {
    if (!this.videoElement) {
      throw new Error('render()를 먼저 호출해야 합니다.');
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });

      this.videoElement.srcObject = this.stream;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        throw new Error('카메라 권한이 거부되었습니다.');
      }
      throw error;
    }
  }

  /**
   * 카메라 스트림을 중지한다.
   */
  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  /**
   * 비디오 엘리먼트를 반환한다.
   */
  getVideoElement(): HTMLVideoElement | null {
    return this.videoElement;
  }

  /**
   * 포즈 스켈레톤을 캔버스에 그린다.
   * @param pose - 감지된 포즈
   */
  drawSkeleton(pose: Pose): void {
    if (!this.canvasElement || !this.videoElement) return;

    const ctx = this.canvasElement.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기를 비디오 크기에 맞춤
    const videoWidth = this.videoElement.videoWidth;
    const videoHeight = this.videoElement.videoHeight;

    if (videoWidth === 0 || videoHeight === 0) return;

    this.canvasElement.width = videoWidth;
    this.canvasElement.height = videoHeight;

    // 캔버스 클리어
    ctx.clearRect(0, 0, videoWidth, videoHeight);

    // 미러링 (프론트 카메라이므로)
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-videoWidth, 0);

    const keypoints = pose.keypoints;
    const minScore = 0.3;

    // 키포인트 그리기
    keypoints.forEach((kp) => {
      if (kp.score && kp.score > minScore) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#00D26A';
        ctx.fill();

        // 외곽선
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // 스켈레톤 연결선 그리기
    const connections: [string, string][] = [
      ['left_ear', 'left_shoulder'],
      ['right_ear', 'right_shoulder'],
      ['left_shoulder', 'right_shoulder'],
      ['left_shoulder', 'left_elbow'],
      ['right_shoulder', 'right_elbow'],
      ['left_elbow', 'left_wrist'],
      ['right_elbow', 'right_wrist'],
      ['left_shoulder', 'left_hip'],
      ['right_shoulder', 'right_hip'],
      ['left_hip', 'right_hip'],
      ['nose', 'left_eye'],
      ['nose', 'right_eye'],
      ['left_eye', 'left_ear'],
      ['right_eye', 'right_ear'],
    ];

    connections.forEach(([from, to]) => {
      const fromKp = keypoints.find((kp) => kp.name === from);
      const toKp = keypoints.find((kp) => kp.name === to);

      if (
        fromKp &&
        toKp &&
        fromKp.score &&
        fromKp.score > minScore &&
        toKp.score &&
        toKp.score > minScore
      ) {
        ctx.beginPath();
        ctx.moveTo(fromKp.x, fromKp.y);
        ctx.lineTo(toKp.x, toKp.y);
        ctx.strokeStyle = '#3182F6';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });

    ctx.restore();
  }

  /**
   * 캔버스를 클리어한다.
   */
  clearCanvas(): void {
    if (!this.canvasElement) return;

    const ctx = this.canvasElement.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    }
  }
}
