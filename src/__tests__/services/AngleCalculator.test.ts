import { describe, it, expect } from 'vitest';
import { calculateNeckAngle } from '../../services/AngleCalculator';

describe('AngleCalculator', () => {
  describe('calculateNeckAngle', () => {
    it('귀와 어깨가 수직일 때 0도를 반환한다', () => {
      // given
      const ear = { x: 100, y: 50 };
      const shoulder = { x: 100, y: 100 };

      // when
      const angle = calculateNeckAngle(ear, shoulder);

      // then
      expect(angle).toBe(0);
    });

    it('귀가 어깨보다 앞으로 나와있으면 양수 각도를 반환한다', () => {
      // given
      const ear = { x: 150, y: 50 };
      const shoulder = { x: 100, y: 100 };

      // when
      const angle = calculateNeckAngle(ear, shoulder);

      // then
      expect(angle).toBeGreaterThan(0);
    });

    it('15도 이상이면 거북목 경고 범위이다', () => {
      // given - 약 45도 기울어진 상태
      const ear = { x: 150, y: 50 };
      const shoulder = { x: 100, y: 100 };

      // when
      const angle = calculateNeckAngle(ear, shoulder);

      // then
      expect(angle).toBeGreaterThan(15);
    });

    it('각도는 항상 양수를 반환한다', () => {
      // given - 귀가 어깨 뒤에 있는 경우
      const ear = { x: 50, y: 50 };
      const shoulder = { x: 100, y: 100 };

      // when
      const angle = calculateNeckAngle(ear, shoulder);

      // then
      expect(angle).toBeGreaterThanOrEqual(0);
    });
  });
});
