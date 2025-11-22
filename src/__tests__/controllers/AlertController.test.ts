import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AlertController } from '../../controllers/AlertController';

describe('AlertController', () => {
  let controller: AlertController;

  beforeEach(() => {
    controller = new AlertController();
  });

  describe('constructor', () => {
    it('AlertController 인스턴스를 생성할 수 있다', () => {
      expect(controller).toBeInstanceOf(AlertController);
    });

    it('초기 연속 danger 카운트는 0이다', () => {
      expect(controller.getConsecutiveDangerCount()).toBe(0);
    });

    it('초기 알림 상태는 false이다', () => {
      expect(controller.isAlertActive()).toBe(false);
    });
  });

  describe('checkPosture', () => {
    it('danger 자세일 때 카운트가 증가한다', () => {
      controller.checkPosture('danger');

      expect(controller.getConsecutiveDangerCount()).toBe(1);
    });

    it('danger가 아닌 자세일 때 카운트가 리셋된다', () => {
      controller.checkPosture('danger');
      controller.checkPosture('danger');
      controller.checkPosture('normal');

      expect(controller.getConsecutiveDangerCount()).toBe(0);
    });

    it('warning 자세도 카운트를 리셋한다', () => {
      controller.checkPosture('danger');
      controller.checkPosture('warning');

      expect(controller.getConsecutiveDangerCount()).toBe(0);
    });
  });

  describe('3회 연속 감지', () => {
    it('3회 연속 danger 시 알림이 활성화된다', () => {
      controller.checkPosture('danger');
      controller.checkPosture('danger');
      controller.checkPosture('danger');

      expect(controller.isAlertActive()).toBe(true);
    });

    it('2회 연속 danger 시 알림이 활성화되지 않는다', () => {
      controller.checkPosture('danger');
      controller.checkPosture('danger');

      expect(controller.isAlertActive()).toBe(false);
    });

    it('3회 연속 danger 시 onAlert 콜백이 호출된다', () => {
      const callback = vi.fn();
      controller.onAlert(callback);

      controller.checkPosture('danger');
      controller.checkPosture('danger');
      controller.checkPosture('danger');

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('알림 후 다시 danger가 오면 4회째에 콜백이 다시 호출되지 않는다', () => {
      const callback = vi.fn();
      controller.onAlert(callback);

      controller.checkPosture('danger');
      controller.checkPosture('danger');
      controller.checkPosture('danger');
      controller.checkPosture('danger');

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('알림 해제', () => {
    it('normal 자세가 되면 알림이 해제된다', () => {
      controller.checkPosture('danger');
      controller.checkPosture('danger');
      controller.checkPosture('danger');
      expect(controller.isAlertActive()).toBe(true);

      controller.checkPosture('normal');

      expect(controller.isAlertActive()).toBe(false);
    });

    it('알림 해제 시 onAlertDismiss 콜백이 호출된다', () => {
      const callback = vi.fn();
      controller.onAlertDismiss(callback);

      controller.checkPosture('danger');
      controller.checkPosture('danger');
      controller.checkPosture('danger');
      controller.checkPosture('normal');

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('dismissAlert()로 수동으로 알림을 해제할 수 있다', () => {
      controller.checkPosture('danger');
      controller.checkPosture('danger');
      controller.checkPosture('danger');

      controller.dismissAlert();

      expect(controller.isAlertActive()).toBe(false);
      expect(controller.getConsecutiveDangerCount()).toBe(0);
    });
  });

  describe('알림 재트리거', () => {
    it('알림 해제 후 다시 3회 연속 danger가 오면 알림이 다시 발생한다', () => {
      const callback = vi.fn();
      controller.onAlert(callback);

      // 첫 번째 알림
      controller.checkPosture('danger');
      controller.checkPosture('danger');
      controller.checkPosture('danger');

      // 해제
      controller.checkPosture('normal');

      // 두 번째 알림
      controller.checkPosture('danger');
      controller.checkPosture('danger');
      controller.checkPosture('danger');

      expect(callback).toHaveBeenCalledTimes(2);
    });
  });

  describe('임계값 설정', () => {
    it('기본 임계값은 3이다', () => {
      expect(controller.getThreshold()).toBe(3);
    });

    it('임계값을 변경할 수 있다', () => {
      controller.setThreshold(5);

      expect(controller.getThreshold()).toBe(5);
    });

    it('변경된 임계값에 따라 알림이 발생한다', () => {
      controller.setThreshold(2);

      controller.checkPosture('danger');
      controller.checkPosture('danger');

      expect(controller.isAlertActive()).toBe(true);
    });
  });
});
