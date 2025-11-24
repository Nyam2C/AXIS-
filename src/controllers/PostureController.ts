import type { Pose } from '@tensorflow-models/pose-detection';
import type { PoseDetectionService } from '../services/PoseDetectionService';
import type { CalibrationService } from '../services/CalibrationService';
import type { PostureState, PostureLevel } from '../models/PostureState';
import type { Point } from '../models/Point';
import { calculateNoseToShoulderDistance } from '../services/AngleCalculator';

// 거리 변화량 기준 (픽셀)
const DISTANCE_THRESHOLD_WARNING = 20; // 20px 이상 변화 시 주의
const DISTANCE_THRESHOLD_DANGER = 40; // 40px 이상 변화 시 위험

/**
 * 자세 분석을 담당하는 Controller
 * 코-어깨 거리 변화 기반 측정 사용
 */
export class PostureController {
  private poseService: PoseDetectionService;
  private calibrationService: CalibrationService | null = null;

  constructor(poseService: PoseDetectionService) {
    this.poseService = poseService;
  }

  /**
   * CalibrationService를 설정한다.
   */
  setCalibrationService(calibrationService: CalibrationService): void {
    this.calibrationService = calibrationService;
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
   * 어깨 중심점을 계산한다.
   */
  private getShoulderCenter(pose: Pose): Point | null {
    const leftShoulder = this.poseService.getLeftShoulder(pose);
    const rightShoulder = this.poseService.getRightShoulder(pose);

    if (leftShoulder && rightShoulder) {
      return {
        x: (leftShoulder.x + rightShoulder.x) / 2,
        y: (leftShoulder.y + rightShoulder.y) / 2,
      };
    } else if (leftShoulder) {
      return leftShoulder;
    } else if (rightShoulder) {
      return rightShoulder;
    }

    return null;
  }

  /**
   * 코-어깨 거리를 계산한다.
   */
  calculateDistance(pose: Pose): number | null {
    const nose = this.poseService.getNose(pose);
    const shoulderCenter = this.getShoulderCenter(pose);

    if (!nose || !shoulderCenter) {
      return null;
    }

    return calculateNoseToShoulderDistance(nose, shoulderCenter);
  }

  /**
   * 포즈 데이터를 분석하여 자세 상태를 반환한다.
   * 코-어깨 거리 변화 기반 분석 사용
   * @param pose - 감지된 포즈
   * @returns 자세 상태 또는 null (미감지 시)
   */
  analyzePosture(pose: Pose): PostureState | null {
    const nose = this.poseService.getNose(pose);
    const shoulderCenter = this.getShoulderCenter(pose);

    if (!nose || !shoulderCenter) {
      return null;
    }

    const distance = calculateNoseToShoulderDistance(nose, shoulderCenter);

    // 거리 변화량 계산
    let distanceChange = 0;
    if (this.calibrationService?.isCalibrated()) {
      distanceChange = this.calibrationService.getAdjustedDistance(distance);
      // 음수로 변환 (거리가 줄어들면 = 코가 내려감 = 거북목 = 양수로 표현)
      distanceChange = -distanceChange;
    }

    const level = this.determineLevel(distanceChange);

    return {
      level,
      noseToShoulderDistance: distance,
      distanceChange,
      timestamp: Date.now(),
      // 하위 호환성
      neckAngle: distance,
    };
  }

  /**
   * 거리 변화량에 따른 자세 레벨을 결정한다.
   */
  private determineLevel(distanceChange: number): PostureLevel {
    const absChange = Math.abs(distanceChange);

    if (absChange > DISTANCE_THRESHOLD_DANGER) {
      return 'danger';
    }
    if (absChange > DISTANCE_THRESHOLD_WARNING) {
      return 'warning';
    }
    return 'normal';
  }
}
