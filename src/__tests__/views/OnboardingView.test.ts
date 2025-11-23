import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OnboardingView } from '../../views/OnboardingView';

describe('OnboardingView', () => {
  let container: HTMLDivElement;
  let onboardingView: OnboardingView;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement('div');
    container.id = 'onboarding-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  describe('constructor', () => {
    it('OnboardingView 인스턴스를 생성할 수 있다', () => {
      onboardingView = new OnboardingView('onboarding-container');

      expect(onboardingView).toBeInstanceOf(OnboardingView);
    });
  });

  describe('shouldShow', () => {
    it('첫 방문 시 true를 반환한다', () => {
      onboardingView = new OnboardingView('onboarding-container');

      expect(onboardingView.shouldShow()).toBe(true);
    });

    it('온보딩 완료 후 false를 반환한다', () => {
      localStorage.setItem('axis_onboarding_completed', 'true');
      onboardingView = new OnboardingView('onboarding-container');

      expect(onboardingView.shouldShow()).toBe(false);
    });
  });

  describe('render', () => {
    it('온보딩 화면을 렌더링한다', () => {
      onboardingView = new OnboardingView('onboarding-container');

      onboardingView.render();

      expect(container.innerHTML).not.toBe('');
    });

    it('환영 메시지가 표시된다', () => {
      onboardingView = new OnboardingView('onboarding-container');

      onboardingView.render();

      expect(container.textContent).toContain('AXIS');
    });

    it('시작 버튼이 표시된다', () => {
      onboardingView = new OnboardingView('onboarding-container');

      onboardingView.render();

      const startBtn = container.querySelector('[data-start]');
      expect(startBtn).not.toBeNull();
    });
  });

  describe('steps', () => {
    it('초기 스텝은 0이다', () => {
      onboardingView = new OnboardingView('onboarding-container');

      expect(onboardingView.getCurrentStep()).toBe(0);
    });

    it('nextStep()으로 다음 스텝으로 이동한다', () => {
      onboardingView = new OnboardingView('onboarding-container');
      onboardingView.render();

      onboardingView.nextStep();

      expect(onboardingView.getCurrentStep()).toBe(1);
    });

    it('마지막 스텝에서 nextStep()을 호출하면 완료된다', () => {
      onboardingView = new OnboardingView('onboarding-container');
      onboardingView.render();

      // 모든 스텝 이동 (3개 스텝 가정)
      onboardingView.nextStep();
      onboardingView.nextStep();
      onboardingView.nextStep();

      expect(onboardingView.shouldShow()).toBe(false);
    });
  });

  describe('callbacks', () => {
    it('완료 시 onComplete 콜백이 호출된다', () => {
      onboardingView = new OnboardingView('onboarding-container');
      const callback = vi.fn();
      onboardingView.onComplete(callback);
      onboardingView.render();

      // 모든 스텝 완료
      onboardingView.nextStep();
      onboardingView.nextStep();
      onboardingView.nextStep();

      expect(callback).toHaveBeenCalled();
    });

    it('건너뛰기 시 onSkip 콜백이 호출된다', () => {
      onboardingView = new OnboardingView('onboarding-container');
      const callback = vi.fn();
      onboardingView.onSkip(callback);
      onboardingView.render();

      const skipBtn = container.querySelector('[data-skip]') as HTMLButtonElement;
      skipBtn?.click();

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('hide', () => {
    it('온보딩 화면을 숨긴다', () => {
      onboardingView = new OnboardingView('onboarding-container');
      onboardingView.render();

      onboardingView.hide();

      expect(container.innerHTML).toBe('');
    });
  });

  describe('markCompleted', () => {
    it('온보딩 완료를 localStorage에 저장한다', () => {
      onboardingView = new OnboardingView('onboarding-container');

      onboardingView.markCompleted();

      expect(localStorage.getItem('axis_onboarding_completed')).toBe('true');
    });
  });
});
