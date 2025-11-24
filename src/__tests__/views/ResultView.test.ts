import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ResultView } from '../../views/ResultView';
import type { SessionStats } from '../../controllers/MonitoringController';

describe('ResultView', () => {
  let resultView: ResultView;
  let container: HTMLDivElement;

  const createMockStats = (overrides: Partial<SessionStats> = {}): SessionStats => ({
    averageAngle: 10,
    levelStats: { normal: 50, warning: 30, danger: 20 },
    totalDuration: 120000, // 2분
    goodPostureRatio: 50,
    totalSamples: 100,
    startTime: Date.now() - 120000,
    endTime: Date.now(),
    ...overrides,
  });

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'result-container';
    document.body.appendChild(container);

    resultView = new ResultView('result-container');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('render', () => {
    it('결과 화면을 렌더링한다', () => {
      const stats = createMockStats();

      resultView.render(stats);

      expect(container.innerHTML).not.toBe('');
      expect(container.textContent).toContain('50점');
    });

    it('측정 시간을 표시한다', () => {
      const stats = createMockStats({ totalDuration: 120000 });

      resultView.render(stats);

      expect(container.textContent).toContain('2분');
    });

    it('평균 각도를 표시한다', () => {
      const stats = createMockStats({ averageAngle: 15.5 });

      resultView.render(stats);

      expect(container.textContent).toContain('15.5°');
    });

    it('자세 분포를 표시한다', () => {
      const stats = createMockStats({
        levelStats: { normal: 50, warning: 30, danger: 20 },
      });

      resultView.render(stats);

      expect(container.textContent).toContain('좋음');
      expect(container.textContent).toContain('주의');
      expect(container.textContent).toContain('위험');
    });

    it('90점 이상이면 최고 등급을 표시한다', () => {
      const stats = createMockStats({ goodPostureRatio: 95 });

      resultView.render(stats);

      expect(container.textContent).toContain('95점');
      expect(container.textContent).toContain('최고예요!');
    });

    it('70점 이상이면 좋은 등급을 표시한다', () => {
      const stats = createMockStats({ goodPostureRatio: 75 });

      resultView.render(stats);

      expect(container.textContent).toContain('75점');
      expect(container.textContent).toContain('잘하고 있어요');
    });

    it('50점 미만이면 주의 등급을 표시한다', () => {
      const stats = createMockStats({ goodPostureRatio: 35 });

      resultView.render(stats);

      expect(container.textContent).toContain('35점');
      expect(container.textContent).toContain('주의가 필요해요');
    });

    it('30점 미만이면 위험 등급을 표시한다', () => {
      const stats = createMockStats({ goodPostureRatio: 20 });

      resultView.render(stats);

      expect(container.textContent).toContain('20점');
      expect(container.textContent).toContain('자세 교정이 필요해요');
    });
  });

  describe('hide', () => {
    it('결과 화면을 숨긴다', () => {
      resultView.render(createMockStats());

      resultView.hide();

      expect(container.innerHTML).toBe('');
    });
  });

  describe('onClose', () => {
    it('닫기 버튼 클릭 시 콜백을 호출한다', () => {
      const callback = vi.fn();
      resultView.onClose(callback);
      resultView.render(createMockStats());

      const closeBtn = document.getElementById('result-close-btn');
      closeBtn?.click();

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('시간 포맷팅', () => {
    it('1분 미만은 초만 표시한다', () => {
      const stats = createMockStats({ totalDuration: 45000 });

      resultView.render(stats);

      expect(container.textContent).toContain('45초');
      // "0분"이 표시되지 않아야 함
      expect(container.textContent).not.toContain('0분');
    });

    it('1분 이상은 분과 초를 표시한다', () => {
      const stats = createMockStats({ totalDuration: 90000 });

      resultView.render(stats);

      expect(container.textContent).toContain('1분 30초');
    });
  });

  describe('레벨 횟수 표시', () => {
    it('각 레벨별 횟수를 표시한다', () => {
      const stats = createMockStats({
        levelStats: { normal: 60, warning: 25, danger: 15 },
      });

      resultView.render(stats);

      expect(container.textContent).toContain('60');
      expect(container.textContent).toContain('25');
      expect(container.textContent).toContain('15');
    });
  });
});
