import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PoseDetectionService } from '../../services/PoseDetectionService';
import type { Pose, Keypoint } from '@tensorflow-models/pose-detection';

// TensorFlow.js 모킹 (외부 의존성)
vi.mock('@tensorflow-models/pose-detection', () => ({
  SupportedModels: { MoveNet: 'MoveNet' },
  movenet: { modelType: { SINGLEPOSE_LIGHTNING: 'SinglePose.Lightning' } },
  createDetector: vi.fn(),
}));

vi.mock('@tensorflow/tfjs-backend-webgl', () => ({}));

describe('PoseDetectionService', () => {
  let service: PoseDetectionService;

  beforeEach(() => {
    service = new PoseDetectionService();
  });

  describe('getKeypoint', () => {
    const createMockPose = (keypoints: Keypoint[]): Pose => ({
      keypoints,
    });

    it('키포인트가 존재하면 좌표를 반환한다', () => {
      const pose = createMockPose([
        { x: 100, y: 200, name: 'left_ear', score: 0.9 },
      ]);

      const result = service.getKeypoint(pose, 'left_ear');

      expect(result).toEqual({ x: 100, y: 200 });
    });

    it('키포인트가 존재하지 않으면 null을 반환한다', () => {
      const pose = createMockPose([
        { x: 100, y: 200, name: 'left_ear', score: 0.9 },
      ]);

      const result = service.getKeypoint(pose, 'right_ear');

      expect(result).toBeNull();
    });

    it('신뢰도가 0.3 미만이면 null을 반환한다', () => {
      const pose = createMockPose([
        { x: 100, y: 200, name: 'left_ear', score: 0.2 },
      ]);

      const result = service.getKeypoint(pose, 'left_ear');

      expect(result).toBeNull();
    });

    it('신뢰도가 0.3 이상이면 좌표를 반환한다', () => {
      const pose = createMockPose([
        { x: 100, y: 200, name: 'left_ear', score: 0.3 },
      ]);

      const result = service.getKeypoint(pose, 'left_ear');

      expect(result).toEqual({ x: 100, y: 200 });
    });

    it('신뢰도가 없으면(undefined) 좌표를 반환한다', () => {
      const pose = createMockPose([
        { x: 100, y: 200, name: 'left_ear' },
      ]);

      const result = service.getKeypoint(pose, 'left_ear');

      expect(result).toEqual({ x: 100, y: 200 });
    });
  });

  describe('getLeftEar', () => {
    it('left_ear 키포인트를 반환한다', () => {
      const pose: Pose = {
        keypoints: [{ x: 50, y: 60, name: 'left_ear', score: 0.8 }],
      };

      const result = service.getLeftEar(pose);

      expect(result).toEqual({ x: 50, y: 60 });
    });
  });

  describe('getRightEar', () => {
    it('right_ear 키포인트를 반환한다', () => {
      const pose: Pose = {
        keypoints: [{ x: 70, y: 80, name: 'right_ear', score: 0.8 }],
      };

      const result = service.getRightEar(pose);

      expect(result).toEqual({ x: 70, y: 80 });
    });
  });

  describe('getLeftShoulder', () => {
    it('left_shoulder 키포인트를 반환한다', () => {
      const pose: Pose = {
        keypoints: [{ x: 100, y: 300, name: 'left_shoulder', score: 0.8 }],
      };

      const result = service.getLeftShoulder(pose);

      expect(result).toEqual({ x: 100, y: 300 });
    });
  });

  describe('getRightShoulder', () => {
    it('right_shoulder 키포인트를 반환한다', () => {
      const pose: Pose = {
        keypoints: [{ x: 150, y: 320, name: 'right_shoulder', score: 0.8 }],
      };

      const result = service.getRightShoulder(pose);

      expect(result).toEqual({ x: 150, y: 320 });
    });
  });
});
