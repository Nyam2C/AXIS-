import { Point } from '../models/Point';

const RADIANS_TO_DEGREES = 180 / Math.PI;

/**
 * 귀와 어깨 좌표를 기반으로 목 기울기 각도를 계산한다.
 * @param ear - 귀 좌표
 * @param shoulder - 어깨 좌표
 * @returns 각도 (도 단위, 항상 양수)
 */
export function calculateNeckAngle(ear: Point, shoulder: Point): number {
  const dx = ear.x - shoulder.x;
  const dy = ear.y - shoulder.y;

  const radians = Math.atan2(dx, -dy);
  const degrees = Math.abs(radians * RADIANS_TO_DEGREES);

  return degrees;
}
