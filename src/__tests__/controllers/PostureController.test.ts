 import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostureController } from '../../controllers/PostureController';
import type { PoseDetectionService } from '../../services/PoseDetectionService';
import type { Pose } from '@tensorflow-models/pose-detection';

describe('PostureController', () => {
  let controller: PostureController;
  let mockPoseService: PoseDetectionService;

  const createMockPose = (
    leftEar: { x: number; y: number } | null,
    leftShoulder: { x: number; y: number } | null
  ): Pose => ({
    keypoints: [
      ...(leftEar ? [{ x: leftEar.x, y: leftEar.y, name: 'left_ear', score: 0.9 }] : []),
      ...(leftShoulder
        ? [{ x: leftShoulder.x, y: leftShoulder.y, name: 'left_shoulder', score: 0.9 }]
        : []),
    ],
  });

  beforeEach(() => {
    mockPoseService = {
      detectPose: vi.fn(),
      getLeftEar: vi.fn(),
      getLeftShoulder: vi.fn(),
      getRightEar: vi.fn(),
      getRightShoulder: vi.fn(),
      getKeypoint: vi.fn(),
      initialize: vi.fn(),
      dispose: vi.fn(),
    } as unknown as PoseDetectionService;

    controller = new PostureController(mockPoseService);
  });

  describe('analyzePosture', () => {
    it('포즈에서 목 각도를 계산한다', async () => {
      // given - 귀와 어깨가 수직
      const mockPose = createMockPose({ x: 100, y: 50 }, { x: 100, y: 100 });
      vi.mocked(mockPoseService.getLeftEar).mockReturnValue({ x: 100, y: 50 });
      vi.mocked(mockPoseService.getLeftShoulder).mockReturnValue({ x: 100, y: 100 });

      // when
      const result = controller.analyzePosture(mockPose);

      // then
      expect(result?.neckAngle).toBe(0);
    });

    it('귀가 앞으로 나온 경우 양수 각도를 반환한다', async () => {
      // given
      const mockPose = createMockPose({ x: 150, y: 50 }, { x: 100, y: 100 });
      vi.mocked(mockPoseService.getLeftEar).mockReturnValue({ x: 150, y: 50 });
      vi.mocked(mockPoseService.getLeftShoulder).mockReturnValue({ x: 100, y: 100 });

      // when
      const result = controller.analyzePosture(mockPose);

      // then
      expect(result?.neckAngle).toBeGreaterThan(0);
    });

    it('귀 좌표가 없으면 null을 반환한다', async () => {
      // given
      const mockPose = createMockPose(null, { x: 100, y: 100 });
      vi.mocked(mockPoseService.getLeftEar).mockReturnValue(null);
      vi.mocked(mockPoseService.getLeftShoulder).mockReturnValue({ x: 100, y: 100 });

      // when
      const result = controller.analyzePosture(mockPose);

      // then
      expect(result).toBeNull();
    });

    it('어깨 좌표가 없으면 null을 반환한다', async () => {
      // given
      const mockPose = createMockPose({ x: 100, y: 50 }, null);
      vi.mocked(mockPoseService.getLeftEar).mockReturnValue({ x: 100, y: 50 });
      vi.mocked(mockPoseService.getLeftShoulder).mockReturnValue(null);

      // when
      const result = controller.analyzePosture(mockPose);

      // then
      expect(result).toBeNull();
    });
  });

  describe('determineLevel', () => {
    it('각도가 15도 이하이면 normal을 반환한다', () => {
      // given
      const mockPose = createMockPose({ x: 100, y: 50 }, { x: 100, y: 100 });
      vi.mocked(mockPoseService.getLeftEar).mockReturnValue({ x: 100, y: 50 });
      vi.mocked(mockPoseService.getLeftShoulder).mockReturnValue({ x: 100, y: 100 });

      // when
      const result = controller.analyzePosture(mockPose);

      // then
      expect(result?.level).toBe('normal');
    });

    it('각도가 15도 초과 25도 이하이면 warning을 반환한다', () => {
      // given - 약 20도 기울어진 상태
      const mockPose = createMockPose({ x: 118, y: 50 }, { x: 100, y: 100 });
      vi.mocked(mockPoseService.getLeftEar).mockReturnValue({ x: 118, y: 50 });
      vi.mocked(mockPoseService.getLeftShoulder).mockReturnValue({ x: 100, y: 100 });

      // when
      const result = controller.analyzePosture(mockPose);

      // then
      expect(result?.level).toBe('warning');
    });

    it('각도가 25도 초과이면 danger를 반환한다', () => {
      // given - 약 45도 기울어진 상태
      const mockPose = createMockPose({ x: 150, y: 50 }, { x: 100, y: 100 });
      vi.mocked(mockPoseService.getLeftEar).mockReturnValue({ x: 150, y: 50 });
      vi.mocked(mockPoseService.getLeftShoulder).mockReturnValue({ x: 100, y: 100 });

      // when
      const result = controller.analyzePosture(mockPose);

      // then
      expect(result?.level).toBe('danger');
    });
  });

  describe('경계값 테스트', () => {
    it('15도 이하일 때 normal을 반환한다', () => {
      // given - tan(14°) ≈ 0.249, dy=50이면 dx≈12.5
      const mockPose = createMockPose({ x: 112.5, y: 50 }, { x: 100, y: 100 });
      vi.mocked(mockPoseService.getLeftEar).mockReturnValue({ x: 112.5, y: 50 });
      vi.mocked(mockPoseService.getLeftShoulder).mockReturnValue({ x: 100, y: 100 });

      // when
      const result = controller.analyzePosture(mockPose);

      // then
      expect(result?.level).toBe('normal');
    });

    it('정확히 25도일 때 warning을 반환한다', () => {
      // given - tan(25°) ≈ 0.466, dy=50이면 dx≈23.3
      const mockPose = createMockPose({ x: 123.3, y: 50 }, { x: 100, y: 100 });
      vi.mocked(mockPoseService.getLeftEar).mockReturnValue({ x: 123.3, y: 50 });
      vi.mocked(mockPoseService.getLeftShoulder).mockReturnValue({ x: 100, y: 100 });

      // when
      const result = controller.analyzePosture(mockPose);

      // then
      expect(result?.level).toBe('warning');
    });
  });
});
