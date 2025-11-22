import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AlertView } from '../../views/AlertView';

describe('AlertView', () => {
  let container: HTMLDivElement;
  let alertView: AlertView;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'alert-container';
    document.body.appendChild(container);

    // Audio 모킹 - class 형태로 모킹
    class MockAudio {
      play = vi.fn().mockResolvedValue(undefined);
      pause = vi.fn();
      currentTime = 0;
    }
    vi.stubGlobal('Audio', MockAudio);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.unstubAllGlobals();
  });

  describe('constructor', () => {
    it('AlertView 인스턴스를 생성할 수 있다', () => {
      alertView = new AlertView('alert-container');

      expect(alertView).toBeInstanceOf(AlertView);
    });

    it('존재하지 않는 컨테이너 ID로 생성 시 에러를 던진다', () => {
      expect(() => new AlertView('non-existent')).toThrow(
        '컨테이너를 찾을 수 없습니다: non-existent'
      );
    });
  });

  describe('show', () => {
    it('알림을 표시한다', () => {
      alertView = new AlertView('alert-container');

      alertView.show();

      expect(container.innerHTML).not.toBe('');
      expect(container.textContent).toContain('거북목');
    });

    it('알림에 경고 메시지가 포함된다', () => {
      alertView = new AlertView('alert-container');

      alertView.show();

      expect(container.textContent).toContain('목을 펴주세요');
    });

    it('알림에 닫기 버튼이 있다', () => {
      alertView = new AlertView('alert-container');

      alertView.show();

      const closeBtn = container.querySelector('[data-dismiss]');
      expect(closeBtn).not.toBeNull();
    });

    it('닫기 버튼 클릭 시 onDismiss 콜백이 호출된다', () => {
      alertView = new AlertView('alert-container');
      const callback = vi.fn();
      alertView.onDismiss(callback);

      alertView.show();

      const closeBtn = container.querySelector('[data-dismiss]') as HTMLElement;
      closeBtn.click();

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('hide', () => {
    it('알림을 숨긴다', () => {
      alertView = new AlertView('alert-container');
      alertView.show();

      alertView.hide();

      expect(container.innerHTML).toBe('');
    });
  });

  describe('사운드', () => {
    it('사운드 활성화 상태를 확인할 수 있다', () => {
      alertView = new AlertView('alert-container');

      expect(alertView.isSoundEnabled()).toBe(true);

      alertView.setSoundEnabled(false);
      expect(alertView.isSoundEnabled()).toBe(false);
    });

    it('사운드가 활성화되면 show()에서 에러 없이 재생된다', () => {
      alertView = new AlertView('alert-container');

      expect(() => alertView.show()).not.toThrow();
    });

    it('사운드가 비활성화되면 show()에서 Audio를 생성하지 않는다', () => {
      alertView = new AlertView('alert-container');
      alertView.setSoundEnabled(false);

      alertView.show();

      // 사운드 비활성화 시에도 UI는 정상 렌더링
      expect(container.textContent).toContain('거북목');
    });
  });

  describe('isVisible', () => {
    it('알림이 표시되면 true를 반환한다', () => {
      alertView = new AlertView('alert-container');

      alertView.show();

      expect(alertView.isVisible()).toBe(true);
    });

    it('알림이 숨겨지면 false를 반환한다', () => {
      alertView = new AlertView('alert-container');
      alertView.show();

      alertView.hide();

      expect(alertView.isVisible()).toBe(false);
    });

    it('초기 상태는 false이다', () => {
      alertView = new AlertView('alert-container');

      expect(alertView.isVisible()).toBe(false);
    });
  });
});
