import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StatusView } from '../../views/StatusView';
import type { PostureState } from '../../models/PostureState';

describe('StatusView', () => {
  let container: HTMLDivElement;
  let statusView: StatusView;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'status-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    it('컨테이너 ID로 생성할 수 있다', () => {
      statusView = new StatusView('status-container');

      expect(statusView).toBeInstanceOf(StatusView);
    });

    it('존재하지 않는 컨테이너 ID로 생성 시 에러를 던진다', () => {
      expect(() => new StatusView('non-existent')).toThrow(
        '컨테이너를 찾을 수 없습니다: non-existent'
      );
    });
  });

  describe('render', () => {
    it('normal 상태를 렌더링한다', () => {
      statusView = new StatusView('status-container');
      const state: PostureState = {
        level: 'normal',
        neckAngle: 10,
        timestamp: Date.now(),
      };

      statusView.render(state);

      expect(container.textContent).toContain('10');
      expect(container.innerHTML).toContain('normal');
    });

    it('warning 상태를 렌더링한다', () => {
      statusView = new StatusView('status-container');
      const state: PostureState = {
        level: 'warning',
        neckAngle: 20,
        timestamp: Date.now(),
      };

      statusView.render(state);

      expect(container.textContent).toContain('20');
      expect(container.innerHTML).toContain('warning');
    });

    it('danger 상태를 렌더링한다', () => {
      statusView = new StatusView('status-container');
      const state: PostureState = {
        level: 'danger',
        neckAngle: 30,
        timestamp: Date.now(),
      };

      statusView.render(state);

      expect(container.textContent).toContain('30');
      expect(container.innerHTML).toContain('danger');
    });

    it('각도를 정수로 표시한다', () => {
      statusView = new StatusView('status-container');
      const state: PostureState = {
        level: 'normal',
        neckAngle: 12.567,
        timestamp: Date.now(),
      };

      statusView.render(state);

      expect(container.textContent).toContain('13');
    });
  });

  describe('renderError', () => {
    it('에러 메시지를 렌더링한다', () => {
      statusView = new StatusView('status-container');

      statusView.renderError('포즈를 감지할 수 없습니다.');

      expect(container.textContent).toContain('포즈를 감지할 수 없습니다.');
    });
  });

  describe('renderLoading', () => {
    it('로딩 상태를 렌더링한다', () => {
      statusView = new StatusView('status-container');

      statusView.renderLoading();

      expect(container.textContent).toContain('준비 중');
    });
  });
});
