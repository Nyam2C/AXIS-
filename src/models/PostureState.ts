/**
 * 자세 상태 레벨
 */
export type PostureLevel = 'normal' | 'warning' | 'danger';

/**
 * 자세 분석 결과
 */
export interface PostureState {
  level: PostureLevel;
  neckAngle: number;
  timestamp: number;
}
