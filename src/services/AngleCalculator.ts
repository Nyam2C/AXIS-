import type { Point } from '../models/Point';

/**
 * 코와 어깨선 간의 수직 거리를 계산한다.
 * 어깨선(y좌표)을 기준으로 코가 얼마나 앞으로 나왔는지 측정.
 *
 * @param nose - 코 좌표
 * @param shoulderCenter - 양 어깨 중심점 좌표
 * @returns 수직 거리 (픽셀 단위, 코가 어깨보다 위에 있으면 양수)
 */
export function calculateNoseToShoulderDistance(
  nose: Point,
  shoulderCenter: Point
): number {
  // 어깨 중심점의 Y좌표와 코의 Y좌표 차이
  // 화면 좌표계에서 Y는 아래로 갈수록 증가하므로
  // shoulderCenter.y - nose.y가 양수면 코가 어깨보다 위에 있음 (정상)
  return shoulderCenter.y - nose.y;
}

/**
 * 거리 변화량을 기반으로 목 기울기 수준을 판단한다.
 * 기준 거리 대비 현재 거리의 변화를 측정.
 *
 * @param currentDistance - 현재 코-어깨 거리
 * @param baselineDistance - 기준(바른 자세) 거리
 * @returns 변화량 (양수: 코가 앞으로 나옴/거북목, 음수: 코가 뒤로 감)
 */
export function calculateDistanceChange(
  currentDistance: number,
  baselineDistance: number
): number {
  // 기준 거리보다 현재 거리가 작으면 코가 앞으로 나온 것
  // (코가 내려갔다 = 거북목)
  return baselineDistance - currentDistance;
}

// 하위 호환성을 위한 별칭 (deprecated)
export const calculateNeckAngle = calculateNoseToShoulderDistance;
