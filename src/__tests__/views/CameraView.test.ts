import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CameraView } from '../../views/CameraView';

describe('CameraView', () => {
  let container: HTMLDivElement;
  let cameraView: CameraView;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'camera-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('컨테이너 ID로 생성할 수 있다', () => {
      cameraView = new CameraView('camera-container');

      expect(cameraView).toBeInstanceOf(CameraView);
    });

    it('존재하지 않는 컨테이너 ID로 생성 시 에러를 던진다', () => {
      expect(() => new CameraView('non-existent')).toThrow(
        '컨테이너를 찾을 수 없습니다: non-existent'
      );
    });
  });

  describe('render', () => {
    it('video 엘리먼트를 컨테이너에 렌더링한다', () => {
      cameraView = new CameraView('camera-container');

      cameraView.render();

      const video = container.querySelector('video');
      expect(video).not.toBeNull();
    });

    it('video 엘리먼트에 autoplay 속성이 설정된다', () => {
      cameraView = new CameraView('camera-container');

      cameraView.render();

      const video = container.querySelector('video');
      expect(video?.autoplay).toBe(true);
    });

    it('video 엘리먼트에 playsinline 속성이 설정된다', () => {
      cameraView = new CameraView('camera-container');

      cameraView.render();

      const video = container.querySelector('video');
      expect(video?.playsInline).toBe(true);
    });
  });

  describe('startCamera', () => {
    it('카메라 스트림을 video에 연결한다', async () => {
      const mockStream = { id: 'mock-stream' } as MediaStream;
      const mockGetUserMedia = vi.fn().mockResolvedValue(mockStream);
      vi.stubGlobal('navigator', {
        mediaDevices: { getUserMedia: mockGetUserMedia },
      });

      cameraView = new CameraView('camera-container');
      cameraView.render();

      await cameraView.startCamera();

      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: { facingMode: 'user' },
        audio: false,
      });
    });

    it('카메라 권한이 거부되면 에러를 던진다', async () => {
      const mockGetUserMedia = vi.fn().mockRejectedValue(
        new DOMException('Permission denied', 'NotAllowedError')
      );
      vi.stubGlobal('navigator', {
        mediaDevices: { getUserMedia: mockGetUserMedia },
      });

      cameraView = new CameraView('camera-container');
      cameraView.render();

      await expect(cameraView.startCamera()).rejects.toThrow(
        '카메라 권한이 거부되었습니다.'
      );
    });

    it('render 전에 startCamera 호출 시 에러를 던진다', async () => {
      cameraView = new CameraView('camera-container');

      await expect(cameraView.startCamera()).rejects.toThrow(
        'render()를 먼저 호출해야 합니다.'
      );
    });
  });

  describe('stopCamera', () => {
    it('카메라 스트림을 중지한다', async () => {
      const mockTrack = { stop: vi.fn() };
      const mockStream = {
        getTracks: vi.fn().mockReturnValue([mockTrack]),
      } as unknown as MediaStream;
      const mockGetUserMedia = vi.fn().mockResolvedValue(mockStream);
      vi.stubGlobal('navigator', {
        mediaDevices: { getUserMedia: mockGetUserMedia },
      });

      cameraView = new CameraView('camera-container');
      cameraView.render();
      await cameraView.startCamera();

      cameraView.stopCamera();

      expect(mockTrack.stop).toHaveBeenCalled();
    });
  });

  describe('getVideoElement', () => {
    it('video 엘리먼트를 반환한다', () => {
      cameraView = new CameraView('camera-container');
      cameraView.render();

      const video = cameraView.getVideoElement();

      expect(video).toBeInstanceOf(HTMLVideoElement);
    });

    it('render 전에 호출 시 null을 반환한다', () => {
      cameraView = new CameraView('camera-container');

      const video = cameraView.getVideoElement();

      expect(video).toBeNull();
    });
  });
});
