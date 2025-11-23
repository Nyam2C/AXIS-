import type { Pose } from '@tensorflow-models/pose-detection';
import type { PoseDetectionService } from '../services/PoseDetectionService';
import type { PostureState, PostureLevel } from '../models/PostureState';
import type { Point } from '../models/Point';
import { calculateNeckAngle } from '../services/AngleCalculator';

const ANGLE_THRESHOLD_WARNING = 15;
const ANGLE_THRESHOLD_DANGER = 25;

/**
 * 자세 분석을 담당하는 Controller
 * 코-어깨 중심점 기반 측정 사용
 */
export class PostureController {
  private poseService: PoseDetectionService;

  constructor(poseService: PoseDetectionService) {
    this.poseService = poseService;
  }

  /**
   * 코와 어깨가 감지되는지 확인한다.
   */
  hasShoulderDetected(pose: Pose): boolean {
    const nose = this.poseService.getNose(pose);
    const leftShoulder = this.poseService.getLeftShoulder(pose);
    const rightShoulder = this.poseService.getRightShoulder(pose);
    // 코와 어깨 중 하나라도 있어야 함
    return !!(nose && (leftShoulder || rightShoulder));
  }

  /**
   * 포즈 데이터를 분석하여 자세 상태를 반환한다.
   * 코-어깨 중심점 기반 분석 사용
   * @param pose - 감지된 포즈
   * @returns 자세 상태 또는 null (미감지 시)
   */
  analyzePosture(pose: Pose): PostureState | null {
    const nose = this.poseService.getNose(pose);
    const leftShoulder = this.poseService.getLeftShoulder(pose);
    const rightShoulder = this.poseService.getRightShoulder(pose);

    if (!nose) {
      return null;
    }

    // 어깨 중심점 계산
    let shoulderCenter: Point;

    if (leftShoulder && rightShoulder) {
      // 양쪽 어깨 모두 있으면 중심점 사용
      shoulderCenter = {
        x: (leftShoulder.x + rightShoulder.x) / 2,
        y: (leftShoulder.y + rightShoulder.y) / 2,
      };
    } else if (leftShoulder) {
      shoulderCenter = leftShoulder;
    } else if (rightShoulder) {
      shoulderCenter = rightShoulder;
    } else {
      return null;
    }

    const neckAngle = calculateNeckAngle(nose, shoulderCenter);
    const level = this.determineLevel(neckAngle);

    return {
      level,
      neckAngle,
      timestamp: Date.now(),
    };
  }

  /**
   * 각도에 따른 자세 레벨을 결정한다.
   */
  private determineLevel(angle: number): PostureLevel {
    if (angle > ANGLE_THRESHOLD_DANGER) {
      return 'danger';
    }
    if (angle > ANGLE_THRESHOLD_WARNING) {
      return 'warning';
    }
    return 'normal';
  }
}
