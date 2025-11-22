import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PoseDetectionService } from '../../services/PoseDetectionService';
import { PostureController } from '../../controllers/PostureController';
import { StatusView } from '../../views/StatusView';
import type { Pose } from '@tensorflow-models/pose-detection';

// TensorFlow.js 모킹
vi.mock('@tensorflow/tfjs-core', () => ({
  setBackend: vi.fn().mockResolvedValue(true),
  ready: vi.fn().mockResolvedValue(true),
}));

vi.mock('@tensorflow/tfjs-backend-webgl', () => ({}));

vi.mock('@tensorflow-models/pose-detection', () => ({
  SupportedModels: { MoveNet: 'MoveNet' },
  movenet: { modelType: { SINGLEPOSE_LIGHTNING: 'SinglePose.Lightning' } },
  createDetector: vi.fn(),
}));

describe('Posture Detection Pipeline 통합 테스트', () => {
  let poseService: PoseDetectionService;
  let controller: PostureController;
  let statusView: StatusView;
  let container: HTMLDivElement;

  const createMockPose = (
    earX: number,
    earY: number,
    shoulderX: number,
    shoulderY: number
  ): Pose => ({
    keypoints: [
      { x: earX, y: earY, name: 'left_ear', score: 0.9 },
      { x: shoulderX, y: shoulderY, name: 'left_shoulder', score: 0.9 },
    ],
  });

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'status-container';
    document.body.appendChild(container);

    poseService = new PoseDetectionService();
    controller = new PostureController(poseService);
    statusView = new StatusView('status-container');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('전체 파이프라인', () => {
    it('정상 자세 포즈 → 분석 → UI 렌더링', () => {
      // given - 귀와 어깨가 수직 (정상 자세)
      const pose = createMockPose(100, 50, 100, 100);

      // when
      const result = controller.analyzePosture(pose);
      if (result) {
        statusView.render(result);
      }

      // then
      expect(result?.level).toBe('normal');
      expect(container.textContent).toContain('좋아요');
      expect(container.textContent).toContain('0°');
    });

    it('주의 자세 포즈 → 분석 → UI 렌더링', () => {
      // given - 약 20도 기울어진 상태
      const pose = createMockPose(118, 50, 100, 100);

      // when
      const result = controller.analyzePosture(pose);
      if (result) {
        statusView.render(result);
      }

      // then
      expect(result?.level).toBe('warning');
      expect(container.textContent).toContain('주의');
    });

    it('위험 자세 포즈 → 분석 → UI 렌더링', () => {
      // given - 약 45도 기울어진 상태
      const pose = createMockPose(150, 50, 100, 100);

      // when
      const result = controller.analyzePosture(pose);
      if (result) {
        statusView.render(result);
      }

      // then
      expect(result?.level).toBe('danger');
      expect(container.textContent).toContain('위험');
      expect(container.textContent).toContain('거북목');
    });

    it('키포인트 누락 시 에러 UI 렌더링', () => {
      // given - 어깨만 있고 귀가 없는 포즈
      const pose: Pose = {
        keypoints: [{ x: 100, y: 100, name: 'left_shoulder', score: 0.9 }],
      };

      // when
      const result = controller.analyzePosture(pose);
      if (!result) {
        statusView.renderError('얼굴이 잘 보이게 해주세요');
      }

      // then
      expect(result).toBeNull();
      expect(container.textContent).toContain('얼굴이 잘 보이게 해주세요');
    });
  });

  describe('연속 감지 시뮬레이션', () => {
    it('자세가 변할 때 UI가 올바르게 업데이트된다', () => {
      // 1. 정상 자세
      let pose = createMockPose(100, 50, 100, 100);
      let result = controller.analyzePosture(pose);
      if (result) statusView.render(result);
      expect(container.textContent).toContain('좋아요');

      // 2. 주의 자세로 변경
      pose = createMockPose(118, 50, 100, 100);
      result = controller.analyzePosture(pose);
      if (result) statusView.render(result);
      expect(container.textContent).toContain('주의');

      // 3. 위험 자세로 변경
      pose = createMockPose(150, 50, 100, 100);
      result = controller.analyzePosture(pose);
      if (result) statusView.render(result);
      expect(container.textContent).toContain('위험');

      // 4. 다시 정상 자세로 복귀
      pose = createMockPose(100, 50, 100, 100);
      result = controller.analyzePosture(pose);
      if (result) statusView.render(result);
      expect(container.textContent).toContain('좋아요');
    });
  });
});
