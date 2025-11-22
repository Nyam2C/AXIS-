import type { Pose } from '@tensorflow-models/pose-detection';
import type { PoseDetectionService } from '../services/PoseDetectionService';
import type { PostureState, PostureLevel } from '../models/PostureState';
import { calculateNeckAngle } from '../services/AngleCalculator';

const ANGLE_THRESHOLD_WARNING = 15;
const ANGLE_THRESHOLD_DANGER = 25;

/**
 * 자세 분석을 담당하는 Controller
 */
export class PostureController {
  private poseService: PoseDetectionService;

  constructor(poseService: PoseDetectionService) {
    this.poseService = poseService;
  }

  /**
   * 포즈 데이터를 분석하여 자세 상태를 반환한다.
   * @param pose - 감지된 포즈
   * @returns 자세 상태 또는 null
   */
  analyzePosture(pose: Pose): PostureState | null {
    const ear = this.poseService.getLeftEar(pose);
    const shoulder = this.poseService.getLeftShoulder(pose);

    if (!ear || !shoulder) {
      return null;
    }

    const neckAngle = calculateNeckAngle(ear, shoulder);
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
