/**
 * 웹캠 비디오 스트림을 관리하는 View
 */
export class CameraView {
  private container: HTMLElement;
  private videoElement: HTMLVideoElement | null = null;
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
   * 비디오 엘리먼트를 컨테이너에 렌더링한다.
   */
  render(): void {
    this.videoElement = document.createElement('video');
    this.videoElement.autoplay = true;
    this.videoElement.playsInline = true;

    this.container.appendChild(this.videoElement);
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
}
