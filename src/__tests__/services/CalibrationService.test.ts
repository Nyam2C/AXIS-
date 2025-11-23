import { describe, it, expect, beforeEach } from 'vitest';
import { CalibrationService } from '../../services/CalibrationService';

describe('CalibrationService', () => {
  let service: CalibrationService;

  beforeEach(() => {
    localStorage.clear();
    service = new CalibrationService();
  });

  describe('constructor', () => {
    it('CalibrationService 인스턴스를 생성할 수 있다', () => {
      expect(service).toBeInstanceOf(CalibrationService);
    });

    it('초기 캘리브레이션 상태는 false이다', () => {
      expect(service.isCalibrated()).toBe(false);
    });
  });

  describe('calibrate', () => {
    it('기준 각도를 설정할 수 있다', () => {
      service.calibrate(10);

      expect(service.isCalibrated()).toBe(true);
      expect(service.getBaselineAngle()).toBe(10);
    });

    it('음수 각도도 설정할 수 있다', () => {
      service.calibrate(-5);

      expect(service.getBaselineAngle()).toBe(-5);
    });
  });

  describe('getAdjustedAngle', () => {
    it('캘리브레이션 전에는 원본 각도를 반환한다', () => {
      const adjusted = service.getAdjustedAngle(20);

      expect(adjusted).toBe(20);
    });

    it('캘리브레이션 후에는 보정된 각도를 반환한다', () => {
      service.calibrate(10); // 기준 자세가 10도

      // 실제 20도 → 보정 후 10도 (20 - 10)
      expect(service.getAdjustedAngle(20)).toBe(10);
    });

    it('기준보다 작은 각도는 음수가 될 수 있다', () => {
      service.calibrate(15);

      // 실제 10도 → 보정 후 -5도 (10 - 15)
      expect(service.getAdjustedAngle(10)).toBe(-5);
    });
  });

  describe('reset', () => {
    it('캘리브레이션을 초기화할 수 있다', () => {
      service.calibrate(10);
      expect(service.isCalibrated()).toBe(true);

      service.reset();

      expect(service.isCalibrated()).toBe(false);
      expect(service.getBaselineAngle()).toBe(0);
    });
  });

  describe('persistence', () => {
    it('캘리브레이션 값이 localStorage에 저장된다', () => {
      service.calibrate(12);

      const stored = localStorage.getItem('axis_calibration');
      expect(stored).not.toBeNull();

      const data = JSON.parse(stored!);
      expect(data.baselineAngle).toBe(12);
    });

    it('저장된 캘리브레이션 값을 불러온다', () => {
      localStorage.setItem(
        'axis_calibration',
        JSON.stringify({ baselineAngle: 8, calibrated: true })
      );

      const newService = new CalibrationService();

      expect(newService.isCalibrated()).toBe(true);
      expect(newService.getBaselineAngle()).toBe(8);
    });

    it('reset() 시 localStorage도 초기화된다', () => {
      service.calibrate(10);
      service.reset();

      const stored = localStorage.getItem('axis_calibration');
      expect(stored).toBeNull();
    });
  });

  describe('샘플 기반 캘리브레이션', () => {
    it('여러 샘플의 평균으로 캘리브레이션한다', () => {
      service.addCalibrationSample(10);
      service.addCalibrationSample(12);
      service.addCalibrationSample(14);

      service.finishCalibration();

      expect(service.isCalibrated()).toBe(true);
      expect(service.getBaselineAngle()).toBe(12); // 평균
    });

    it('샘플이 없으면 finishCalibration이 false를 반환한다', () => {
      const result = service.finishCalibration();

      expect(result).toBe(false);
      expect(service.isCalibrated()).toBe(false);
    });

    it('clearSamples로 샘플을 초기화할 수 있다', () => {
      service.addCalibrationSample(10);
      service.addCalibrationSample(12);

      service.clearSamples();
      const result = service.finishCalibration();

      expect(result).toBe(false);
    });

    it('getSampleCount로 현재 샘플 수를 확인할 수 있다', () => {
      expect(service.getSampleCount()).toBe(0);

      service.addCalibrationSample(10);
      expect(service.getSampleCount()).toBe(1);

      service.addCalibrationSample(12);
      expect(service.getSampleCount()).toBe(2);
    });
  });
});
