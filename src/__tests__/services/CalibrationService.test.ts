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
    it('기준 거리를 설정할 수 있다', () => {
      service.calibrate(100);

      expect(service.isCalibrated()).toBe(true);
      expect(service.getBaselineDistance()).toBe(100);
    });

    it('음수 거리도 설정할 수 있다', () => {
      service.calibrate(-50);

      expect(service.getBaselineDistance()).toBe(-50);
    });
  });

  describe('getAdjustedDistance', () => {
    it('캘리브레이션 전에는 원본 거리를 반환한다', () => {
      const adjusted = service.getAdjustedDistance(200);

      expect(adjusted).toBe(200);
    });

    it('캘리브레이션 후에는 보정된 거리를 반환한다', () => {
      service.calibrate(100); // 기준 거리가 100

      // 실제 120 → 보정 후 20 (120 - 100)
      expect(service.getAdjustedDistance(120)).toBe(20);
    });

    it('기준보다 작은 거리는 음수가 될 수 있다', () => {
      service.calibrate(100);

      // 실제 80 → 보정 후 -20 (80 - 100)
      expect(service.getAdjustedDistance(80)).toBe(-20);
    });
  });

  describe('reset', () => {
    it('캘리브레이션을 초기화할 수 있다', () => {
      service.calibrate(100);
      expect(service.isCalibrated()).toBe(true);

      service.reset();

      expect(service.isCalibrated()).toBe(false);
      expect(service.getBaselineDistance()).toBe(0);
    });
  });

  describe('persistence', () => {
    it('캘리브레이션 값이 localStorage에 저장된다', () => {
      service.calibrate(120);

      const stored = localStorage.getItem('axis_calibration');
      expect(stored).not.toBeNull();

      const data = JSON.parse(stored!);
      expect(data.baselineDistance).toBe(120);
    });

    it('저장된 캘리브레이션 값을 불러온다', () => {
      localStorage.setItem(
        'axis_calibration',
        JSON.stringify({ baselineDistance: 80, calibrated: true })
      );

      const newService = new CalibrationService();

      expect(newService.isCalibrated()).toBe(true);
      expect(newService.getBaselineDistance()).toBe(80);
    });

    it('reset() 시 localStorage도 초기화된다', () => {
      service.calibrate(100);
      service.reset();

      const stored = localStorage.getItem('axis_calibration');
      expect(stored).toBeNull();
    });
  });

  describe('샘플 기반 캘리브레이션', () => {
    it('여러 샘플의 평균으로 캘리브레이션한다 (변동이 작은 경우)', () => {
      service.addCalibrationSample(100);
      service.addCalibrationSample(102);
      service.addCalibrationSample(104);

      const result = service.finishCalibration();

      expect(result.success).toBe(true);
      expect(service.isCalibrated()).toBe(true);
      expect(service.getBaselineDistance()).toBeCloseTo(102); // 평균
    });

    it('변동이 크면 재측정을 요청한다', () => {
      service.addCalibrationSample(100);
      service.addCalibrationSample(150); // 50px 차이 (15px 초과)
      service.addCalibrationSample(200);

      const result = service.finishCalibration();

      expect(result.success).toBe(false);
      expect(result.needsRetry).toBe(true);
      expect(service.isCalibrated()).toBe(false);
    });

    it('샘플이 없으면 finishCalibration이 실패를 반환한다', () => {
      const result = service.finishCalibration();

      expect(result.success).toBe(false);
      expect(result.needsRetry).toBe(false);
      expect(service.isCalibrated()).toBe(false);
    });

    it('clearSamples로 샘플을 초기화할 수 있다', () => {
      service.addCalibrationSample(100);
      service.addCalibrationSample(102);

      service.clearSamples();
      const result = service.finishCalibration();

      expect(result.success).toBe(false);
    });

    it('getSampleCount로 현재 샘플 수를 확인할 수 있다', () => {
      expect(service.getSampleCount()).toBe(0);

      service.addCalibrationSample(100);
      expect(service.getSampleCount()).toBe(1);

      service.addCalibrationSample(102);
      expect(service.getSampleCount()).toBe(2);
    });
  });
});
