import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';
import type { Point } from '../models/Point';

const MIN_KEYPOINT_SCORE = 0.3;

/**
 * MoveNet 포즈 감지 서비스
 */
export class PoseDetectionService {
  private detector: poseDetection.PoseDetector | null = null;

  /**
   * MoveNet 모델을 초기화한다.
   */
  async initialize(): Promise<void> {
    // TensorFlow.js 백엔드 초기화 대기
    await tf.setBackend('webgl');
    await tf.ready();

    const model = poseDetection.SupportedModels.MoveNet;
    const detectorConfig: poseDetection.MoveNetModelConfig = {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    };

    this.detector = await poseDetection.createDetector(model, detectorConfig);
  }

  /**
   * 이미지에서 포즈를 감지한다.
   * @param video - 비디오 엘리먼트
   * @returns 감지된 포즈 배열
   */
  async detectPose(video: HTMLVideoElement): Promise<poseDetection.Pose[]> {
    if (!this.detector) {
      throw new Error('PoseDetectionService가 초기화되지 않았습니다.');
    }

    return await this.detector.estimatePoses(video);
  }

  /**
   * 포즈에서 특정 키포인트의 좌표를 추출한다.
   * @param pose - 감지된 포즈
   * @param name - 키포인트 이름 (예: 'left_ear', 'left_shoulder')
   * @returns 좌표 또는 null
   */
  getKeypoint(pose: poseDetection.Pose, name: string): Point | null {
    const keypoint = pose.keypoints.find((kp) => kp.name === name);

    if (!keypoint || (keypoint.score && keypoint.score < MIN_KEYPOINT_SCORE)) {
      return null;
    }

    return { x: keypoint.x, y: keypoint.y };
  }

  /**
   * 왼쪽 귀 좌표를 추출한다.
   */
  getLeftEar(pose: poseDetection.Pose): Point | null {
    return this.getKeypoint(pose, 'left_ear');
  }

  /**
   * 오른쪽 귀 좌표를 추출한다.
   */
  getRightEar(pose: poseDetection.Pose): Point | null {
    return this.getKeypoint(pose, 'right_ear');
  }

  /**
   * 왼쪽 어깨 좌표를 추출한다.
   */
  getLeftShoulder(pose: poseDetection.Pose): Point | null {
    return this.getKeypoint(pose, 'left_shoulder');
  }

  /**
   * 오른쪽 어깨 좌표를 추출한다.
   */
  getRightShoulder(pose: poseDetection.Pose): Point | null {
    return this.getKeypoint(pose, 'right_shoulder');
  }

  /**
   * 코 좌표를 추출한다.
   */
  getNose(pose: poseDetection.Pose): Point | null {
    return this.getKeypoint(pose, 'nose');
  }

  /**
   * 왼쪽 눈 좌표를 추출한다.
   */
  getLeftEye(pose: poseDetection.Pose): Point | null {
    return this.getKeypoint(pose, 'left_eye');
  }

  /**
   * 오른쪽 눈 좌표를 추출한다.
   */
  getRightEye(pose: poseDetection.Pose): Point | null {
    return this.getKeypoint(pose, 'right_eye');
  }

  /**
   * 리소스를 정리한다.
   */
  dispose(): void {
    if (this.detector) {
      this.detector.dispose();
      this.detector = null;
    }
  }
}
