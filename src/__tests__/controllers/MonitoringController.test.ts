import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MonitoringController } from '../../controllers/MonitoringController';
import type { PostureState } from '../../models/PostureState';

describe('MonitoringController', () => {
  let controller: MonitoringController;

  beforeEach(() => {
    vi.useFakeTimers();
    controller = new MonitoringController();
  });

  afterEach(() => {
    controller.stop();
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('MonitoringController 인스턴스를 생성할 수 있다', () => {
      expect(controller).toBeInstanceOf(MonitoringController);
    });

    it('초기 상태는 stopped이다', () => {
      expect(controller.isRunning()).toBe(false);
    });
  });

  describe('start/stop', () => {
    it('start()를 호출하면 running 상태가 된다', () => {
      controller.start();

      expect(controller.isRunning()).toBe(true);
    });

    it('stop()을 호출하면 stopped 상태가 된다', () => {
      controller.start();
      controller.stop();

      expect(controller.isRunning()).toBe(false);
    });
  });

  describe('샘플링', () => {
    it('10초마다 콜백을 호출한다', () => {
      const callback = vi.fn();
      controller.onSample(callback);
      controller.start();

      // 10초 경과
      vi.advanceTimersByTime(10000);
      expect(callback).toHaveBeenCalledTimes(1);

      // 20초 경과
      vi.advanceTimersByTime(10000);
      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('stop() 후에는 콜백을 호출하지 않는다', () => {
      const callback = vi.fn();
      controller.onSample(callback);
      controller.start();

      vi.advanceTimersByTime(10000);
      expect(callback).toHaveBeenCalledTimes(1);

      controller.stop();
      vi.advanceTimersByTime(10000);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('데이터 기록', () => {
    it('recordPosture()로 자세 데이터를 기록할 수 있다', () => {
      const state: PostureState = {
        level: 'normal',
        neckAngle: 10,
        timestamp: Date.now(),
      };

      controller.recordPosture(state);

      expect(controller.getHistory()).toHaveLength(1);
      expect(controller.getHistory()[0]).toEqual(state);
    });

    it('여러 데이터를 기록할 수 있다', () => {
      const states: PostureState[] = [
        { level: 'normal', neckAngle: 10, timestamp: 1000 },
        { level: 'warning', neckAngle: 20, timestamp: 2000 },
        { level: 'danger', neckAngle: 30, timestamp: 3000 },
      ];

      states.forEach((s) => controller.recordPosture(s));

      expect(controller.getHistory()).toHaveLength(3);
    });

    it('clearHistory()로 기록을 초기화할 수 있다', () => {
      controller.recordPosture({
        level: 'normal',
        neckAngle: 10,
        timestamp: Date.now(),
      });

      controller.clearHistory();

      expect(controller.getHistory()).toHaveLength(0);
    });
  });

  describe('통계', () => {
    it('평균 각도를 계산한다', () => {
      controller.recordPosture({ level: 'normal', neckAngle: 10, timestamp: 1000 });
      controller.recordPosture({ level: 'warning', neckAngle: 20, timestamp: 2000 });
      controller.recordPosture({ level: 'danger', neckAngle: 30, timestamp: 3000 });

      expect(controller.getAverageAngle()).toBe(20);
    });

    it('기록이 없으면 평균 각도는 0이다', () => {
      expect(controller.getAverageAngle()).toBe(0);
    });

    it('각 레벨별 횟수를 계산한다', () => {
      controller.recordPosture({ level: 'normal', neckAngle: 10, timestamp: 1000 });
      controller.recordPosture({ level: 'normal', neckAngle: 12, timestamp: 2000 });
      controller.recordPosture({ level: 'warning', neckAngle: 20, timestamp: 3000 });
      controller.recordPosture({ level: 'danger', neckAngle: 30, timestamp: 4000 });

      const stats = controller.getLevelStats();

      expect(stats.normal).toBe(2);
      expect(stats.warning).toBe(1);
      expect(stats.danger).toBe(1);
    });

    it('기록이 없으면 모든 레벨 횟수는 0이다', () => {
      const stats = controller.getLevelStats();

      expect(stats.normal).toBe(0);
      expect(stats.warning).toBe(0);
      expect(stats.danger).toBe(0);
    });
  });

  describe('1분 세션', () => {
    it('1분(60초) 후 onSessionComplete 콜백을 호출한다', () => {
      const callback = vi.fn();
      controller.onSessionComplete(callback);
      controller.start();

      // 60초 경과
      vi.advanceTimersByTime(60000);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('세션 완료 시 통계 데이터를 전달한다', () => {
      const callback = vi.fn();
      controller.onSessionComplete(callback);

      // 데이터 기록
      controller.recordPosture({ level: 'normal', neckAngle: 10, timestamp: 1000 });
      controller.recordPosture({ level: 'warning', neckAngle: 20, timestamp: 2000 });

      controller.start();
      vi.advanceTimersByTime(60000);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          averageAngle: 15,
          levelStats: { normal: 1, warning: 1, danger: 0 },
        })
      );
    });

    it('세션 완료 후 자동으로 히스토리를 초기화한다', () => {
      controller.recordPosture({ level: 'normal', neckAngle: 10, timestamp: 1000 });
      controller.onSessionComplete(() => {});
      controller.start();

      vi.advanceTimersByTime(60000);

      expect(controller.getHistory()).toHaveLength(0);
    });
  });
});
