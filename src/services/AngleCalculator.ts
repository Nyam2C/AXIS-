import type { Point } from '../models/Point';

const RADIANS_TO_DEGREES = 180 / Math.PI;

/**
 * 코와 어깨 중심점을 기반으로 목 기울기 각도를 계산한다.
 * 코가 어깨 중심보다 앞으로 나오면 양수 각도.
 * @param nose - 코 좌표
 * @param shoulderCenter - 양 어깨 중심점 좌표
 * @returns 각도 (도 단위, 항상 양수)
 */
export function calculateNeckAngle(nose: Point, shoulderCenter: Point): number {
  const dx = nose.x - shoulderCenter.x;
  const dy = nose.y - shoulderCenter.y;

  // 수직선(어깨→위) 대비 코가 앞으로 나온 각도
  const radians = Math.atan2(dx, -dy);
  const degrees = Math.abs(radians * RADIANS_TO_DEGREES);

  return degrees;
}
