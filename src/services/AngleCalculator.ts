import type { Point } from '../models/Point';

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

/**
 * 얼굴 키포인트(코, 눈)를 기반으로 고개 숙임 각도를 계산한다.
 * 어깨가 보이지 않을 때 사용하는 대체 방식.
 * @param nose - 코 좌표
 * @param leftEye - 왼쪽 눈 좌표
 * @param rightEye - 오른쪽 눈 좌표
 * @returns 각도 (도 단위) - 양수면 고개 숙임, 음수면 고개 들음
 */
export function calculateHeadTiltAngle(
  nose: Point,
  leftEye: Point,
  rightEye: Point
): number {
  // 두 눈의 중심점 계산
  const eyeCenter: Point = {
    x: (leftEye.x + rightEye.x) / 2,
    y: (leftEye.y + rightEye.y) / 2,
  };

  // 코와 눈 중심점 사이의 수직 거리 비율로 고개 숙임 감지
  // 정면일 때 코가 눈 아래에 있음 (dy > 0)
  // 고개를 숙이면 코가 눈과 가까워지거나 위로 올라감
  const dx = nose.x - eyeCenter.x;
  const dy = nose.y - eyeCenter.y;

  // 두 눈 사이 거리 (기준 스케일)
  const eyeDistance = Math.sqrt(
    Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2)
  );

  if (eyeDistance === 0) return 0;

  // 코-눈 각도 계산 (정면 기준 약 90도)
  const radians = Math.atan2(dy, Math.abs(dx) || 0.001);
  const degrees = radians * RADIANS_TO_DEGREES;

  // 정면(90도)에서의 편차를 반환
  // 90도보다 작으면 고개를 숙인 것
  return 90 - degrees;
}
