import type { Pose } from '@tensorflow-models/pose-detection';
import type { PoseDetectionService } from '../services/PoseDetectionService';
import type { PostureState, PostureLevel } from '../models/PostureState';
import { calculateNeckAngle, calculateHeadTiltAngle } from '../services/AngleCalculator';

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
   * 우선 어깨 기반 분석을 시도하고, 실패 시 얼굴 기반 분석을 사용한다.
   * @param pose - 감지된 포즈
   * @returns 자세 상태 또는 null
   */
  analyzePosture(pose: Pose): PostureState | null {
    // 1순위: 어깨 기반 분석 (더 정확함)
    const shoulderResult = this.analyzeWithShoulder(pose);
    if (shoulderResult) {
      return shoulderResult;
    }

    // 2순위: 얼굴 기반 분석 (어깨가 안 보일 때)
    return this.analyzeWithFace(pose);
  }

  /**
   * 어깨 기반으로 자세를 분석한다.
   */
  private analyzeWithShoulder(pose: Pose): PostureState | null {
    const ear = this.poseService.getLeftEar(pose) || this.poseService.getRightEar(pose);
    const shoulder = this.poseService.getLeftShoulder(pose) || this.poseService.getRightShoulder(pose);

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
   * 얼굴(코, 눈) 기반으로 자세를 분석한다.
   */
  private analyzeWithFace(pose: Pose): PostureState | null {
    const nose = this.poseService.getNose(pose);
    const leftEye = this.poseService.getLeftEye(pose);
    const rightEye = this.poseService.getRightEye(pose);

    if (!nose || !leftEye || !rightEye) {
      return null;
    }

    const headTiltAngle = calculateHeadTiltAngle(nose, leftEye, rightEye);
    const level = this.determineLevel(Math.abs(headTiltAngle));

    return {
      level,
      neckAngle: headTiltAngle,
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
