import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StatusView } from '../../views/StatusView';
import type { PostureState } from '../../models/PostureState';

// 테스트용 PostureState 생성 헬퍼
function createPostureState(
  level: 'normal' | 'warning' | 'danger',
  distanceChange: number
): PostureState {
  return {
    level,
    neckAngle: distanceChange,
    noseToShoulderDistance: 100,
    distanceChange,
    timestamp: Date.now(),
  };
}

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
      const state = createPostureState('normal', 10);

      statusView.render(state);

      expect(container.textContent).toContain('10');
      expect(container.innerHTML).toContain('normal');
    });

    it('warning 상태를 렌더링한다', () => {
      statusView = new StatusView('status-container');
      const state = createPostureState('warning', 25);

      statusView.render(state);

      expect(container.textContent).toContain('25');
      expect(container.innerHTML).toContain('warning');
    });

    it('danger 상태를 렌더링한다', () => {
      statusView = new StatusView('status-container');
      const state = createPostureState('danger', 45);

      statusView.render(state);

      expect(container.textContent).toContain('45');
      expect(container.innerHTML).toContain('danger');
    });

    it('거리 변화를 정수로 표시한다', () => {
      statusView = new StatusView('status-container');
      const state = createPostureState('normal', 12.567);

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
