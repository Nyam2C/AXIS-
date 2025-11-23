import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SettingsView } from '../../views/SettingsView';

describe('SettingsView', () => {
  let container: HTMLDivElement;
  let settingsView: SettingsView;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'settings-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    it('SettingsView 인스턴스를 생성할 수 있다', () => {
      settingsView = new SettingsView('settings-container');

      expect(settingsView).toBeInstanceOf(SettingsView);
    });

    it('존재하지 않는 컨테이너 ID로 생성 시 에러를 던진다', () => {
      expect(() => new SettingsView('non-existent')).toThrow(
        '컨테이너를 찾을 수 없습니다: non-existent'
      );
    });
  });

  describe('render', () => {
    it('설정 화면을 렌더링한다', () => {
      settingsView = new SettingsView('settings-container');

      settingsView.render({
        soundEnabled: true,
        alertThreshold: 3,
        isCalibrated: false,
      });

      expect(container.innerHTML).not.toBe('');
    });

    it('사운드 토글이 표시된다', () => {
      settingsView = new SettingsView('settings-container');

      settingsView.render({
        soundEnabled: true,
        alertThreshold: 3,
        isCalibrated: false,
      });

      expect(container.textContent).toContain('알림 소리');
    });

    it('알림 임계값 설정이 표시된다', () => {
      settingsView = new SettingsView('settings-container');

      settingsView.render({
        soundEnabled: true,
        alertThreshold: 3,
        isCalibrated: false,
      });

      expect(container.textContent).toContain('연속 감지 횟수');
    });

    it('캘리브레이션 버튼이 표시된다', () => {
      settingsView = new SettingsView('settings-container');

      settingsView.render({
        soundEnabled: true,
        alertThreshold: 3,
        isCalibrated: false,
      });

      const calibrateBtn = container.querySelector('[data-calibrate]');
      expect(calibrateBtn).not.toBeNull();
    });

    it('캘리브레이션 완료 시 리셋 버튼이 표시된다', () => {
      settingsView = new SettingsView('settings-container');

      settingsView.render({
        soundEnabled: true,
        alertThreshold: 3,
        isCalibrated: true,
      });

      const resetBtn = container.querySelector('[data-reset-calibration]');
      expect(resetBtn).not.toBeNull();
    });
  });

  describe('callbacks', () => {
    it('사운드 토글 변경 시 콜백이 호출된다', () => {
      settingsView = new SettingsView('settings-container');
      const callback = vi.fn();
      settingsView.onSoundToggle(callback);

      settingsView.render({
        soundEnabled: true,
        alertThreshold: 3,
        isCalibrated: false,
      });

      const toggle = container.querySelector('[data-sound-toggle]') as HTMLInputElement;
      toggle.click();

      expect(callback).toHaveBeenCalled();
    });

    it('캘리브레이션 버튼 클릭 시 콜백이 호출된다', () => {
      settingsView = new SettingsView('settings-container');
      const callback = vi.fn();
      settingsView.onCalibrate(callback);

      settingsView.render({
        soundEnabled: true,
        alertThreshold: 3,
        isCalibrated: false,
      });

      const btn = container.querySelector('[data-calibrate]') as HTMLButtonElement;
      btn.click();

      expect(callback).toHaveBeenCalled();
    });

    it('닫기 버튼 클릭 시 콜백이 호출된다', () => {
      settingsView = new SettingsView('settings-container');
      const callback = vi.fn();
      settingsView.onClose(callback);

      settingsView.render({
        soundEnabled: true,
        alertThreshold: 3,
        isCalibrated: false,
      });

      const btn = container.querySelector('[data-close]') as HTMLButtonElement;
      btn.click();

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('hide', () => {
    it('설정 화면을 숨긴다', () => {
      settingsView = new SettingsView('settings-container');
      settingsView.render({
        soundEnabled: true,
        alertThreshold: 3,
        isCalibrated: false,
      });

      settingsView.hide();

      expect(container.innerHTML).toBe('');
    });
  });

  describe('isVisible', () => {
    it('렌더링 후 true를 반환한다', () => {
      settingsView = new SettingsView('settings-container');

      settingsView.render({
        soundEnabled: true,
        alertThreshold: 3,
        isCalibrated: false,
      });

      expect(settingsView.isVisible()).toBe(true);
    });

    it('hide 후 false를 반환한다', () => {
      settingsView = new SettingsView('settings-container');
      settingsView.render({
        soundEnabled: true,
        alertThreshold: 3,
        isCalibrated: false,
      });

      settingsView.hide();

      expect(settingsView.isVisible()).toBe(false);
    });
  });
});
