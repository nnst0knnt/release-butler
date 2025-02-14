import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Labeler', async () => {
  const { Labeler } = await import('./actions-labeler');

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  describe('Branch', () => {
    it('ルートルールが定義されておらず、指定されたブランチのいずれかがカテゴリにヒットする場合、trueを返すこと', () => {
      const isMatched = Labeler.Branch.isMatched(
        {
          name: 'test',
          description: 'test',
          icon: '✅',
          color: '6A9FFD',
          rules: [
            {
              'base-branch': ['not-hit'],
              'head-branch': ['hit']
            }
          ]
        },
        'dummy',
        'hit'
      );

      expect(isMatched).toBe(true);
    });

    it('ルートルールが定義されていない、指定されたブランチのいずれもカテゴリにヒットしない場合、falseを返すこと', () => {
      const isMatched = Labeler.Branch.isMatched(
        {
          name: 'test',
          description: 'test',
          icon: '✅',
          color: '6A9FFD',
          rules: [
            {
              'base-branch': ['not-hit'],
              'head-branch': ['not-hit']
            }
          ]
        },
        'dummy-1',
        'dummy-2'
      );

      expect(isMatched).toBe(false);
    });

    it('ルートルールがanyであり、指定されたブランチのいずれかがカテゴリにヒットする場合、trueを返すこと', () => {
      const isMatched = Labeler.Branch.isMatched(
        {
          name: 'test',
          description: 'test',
          icon: '✅',
          color: '6A9FFD',
          rules: [
            {
              any: [
                {
                  'base-branch': ['hit'],
                  'head-branch': ['not-hit']
                }
              ]
            }
          ]
        },
        'hit',
        'dummy'
      );

      expect(isMatched).toBe(true);
    });

    it('ルートルールがanyであり、指定されたブランチのいずれもカテゴリにヒットしない場合、falseを返すこと', () => {
      const isMatched = Labeler.Branch.isMatched(
        {
          name: 'test',
          description: 'test',
          icon: '✅',
          color: '6A9FFD',
          rules: [
            {
              any: [
                {
                  'base-branch': ['any-not-hit'],
                  'head-branch': ['any-not-hit']
                }
              ]
            }
          ]
        },
        'dummy-1',
        'dummy-2'
      );

      expect(isMatched).toBe(false);
    });

    it('ルートルールがallであり、指定されたブランチが全てカテゴリにヒットする場合、trueを返すこと', () => {
      const isMatched = Labeler.Branch.isMatched(
        {
          name: 'test',
          description: 'test',
          icon: '✅',
          color: '6A9FFD',
          rules: [
            {
              all: [
                {
                  'base-branch': ['all', 'hit', 'base'],
                  'head-branch': ['all', 'hit', 'head']
                }
              ]
            }
          ]
        },
        'all-hit-base',
        'all-hit-head'
      );

      expect(isMatched).toBe(true);
    });

    it('ルートルールがallであり、指定されたブランチが全てカテゴリにヒットしない場合、falseを返すこと', () => {
      const isMatched = Labeler.Branch.isMatched(
        {
          name: 'test',
          description: 'test',
          icon: '✅',
          color: '6A9FFD',
          rules: [
            {
              all: [
                {
                  'base-branch': ['all', 'hit', 'base'],
                  'head-branch': ['all', 'hit', 'head', 'not-hit']
                }
              ]
            }
          ]
        },
        'all-hit-base',
        'all-hit-head'
      );

      expect(isMatched).toBe(false);
    });
  });
});
