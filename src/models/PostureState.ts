/**
 * 자세 상태 레벨
 */
export type PostureLevel = 'normal' | 'warning' | 'danger';

/**
 * 자세 분석 결과
 */
export interface PostureState {
  level: PostureLevel;
  /** 코-어깨 거리 (픽셀) */
  noseToShoulderDistance: number;
  /** 기준 대비 거리 변화량 (픽셀, 양수=거북목) */
  distanceChange: number;
  timestamp: number;
  /** 하위 호환성용 (deprecated) */
  neckAngle: number;
}
