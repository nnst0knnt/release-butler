import { beforeEach, describe, expect, it, vi } from 'vitest';

import defaultConfig from '../../shared/mocks/config';
import { Config } from '../../shared/utilities/config';

describe('Converter', async () => {
  const { Converter } = await import('./converter');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('toCategories', () => {
    it('設定からカテゴリ一覧に変換できること', () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        label: {
          lgtm: {
            ...defaultConfig.label.lgtm,
            name: 'LGTM+',
            icon: 'o'
          },
          categories: [
            {
              name: 'Category 1',
              description: 'Category 1 description',
              icon: 'o',
              color: '000000',
              rules: [
                {
                  'base-branch': ['category', 'one']
                }
              ]
            }
          ]
        }
      });
      const config = Config.load();

      const categories = new Converter({ config }).toCategories();

      expect(categories).toHaveLength(config.label.categories.length + 1);
      expect(categories[categories.length - 1]).toEqual({
        ...config.label.lgtm,
        name: 'o LGTM+'
      });
    });

    it('空のカテゴリ一覧を処理できること', () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        label: {
          lgtm: defaultConfig.label.lgtm,
          categories: []
        }
      });

      const categories = new Converter().toCategories();

      expect(categories).toHaveLength(1);
    });
  });

  describe('toYaml', () => {
    it('単一のchanged-filesルールを持つカテゴリを変換できること', () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        label: {
          lgtm: defaultConfig.label.lgtm,
          categories: [
            {
              name: 'Frontend',
              description: 'Frontend changes',
              icon: '🎨',
              color: '000000',
              rules: [
                {
                  'changed-files': [
                    {
                      'any-glob-to-any-file': ['src/**/*.ts']
                    }
                  ]
                }
              ]
            }
          ]
        }
      });

      const yml = new Converter().toYaml();

      expect(yml).toBe(`🎨 Frontend:
  - changed-files:
      - any-glob-to-any-file:
          - src/**/*.ts
`);
    });

    it('複数のマッチパターンを持つchanged-filesルールを変換できること', () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        label: {
          lgtm: defaultConfig.label.lgtm,
          categories: [
            {
              name: 'Documentation',
              description: 'Documentation changes',
              icon: '📝',
              color: '000000',
              rules: [
                {
                  'changed-files': [
                    {
                      'any-glob-to-any-file': ['docs/*'],
                      'all-globs-to-all-files': ['*.md']
                    }
                  ]
                }
              ]
            }
          ]
        }
      });

      const yml = new Converter().toYaml();

      expect(yml).toBe(`📝 Documentation:
  - changed-files:
      - any-glob-to-any-file:
          - docs/*
        all-globs-to-all-files:
          - '*.md'
`);
    });

    it('anyとallの複合ルールを変換できること', () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        label: {
          lgtm: defaultConfig.label.lgtm,
          categories: [
            {
              name: 'Complex',
              description: 'Complex rules',
              icon: '🔧',
              color: '000000',
              rules: [
                {
                  any: [
                    {
                      'changed-files': [
                        {
                          'any-glob-to-any-file': ['src/**/*']
                        }
                      ]
                    },
                    {
                      'head-branch': ['^feature']
                    }
                  ],
                  all: [
                    {
                      'base-branch': ['main']
                    }
                  ]
                }
              ]
            }
          ]
        }
      });

      const yml = new Converter().toYaml();

      expect(yml).toBe(`🔧 Complex:
  - any:
      - changed-files:
          - any-glob-to-any-file:
              - src/**/*
      - head-branch:
          - ^feature
    all:
      - base-branch:
          - main
`);
    });

    it('複数のブランチパターンルールを変換できること', () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        label: {
          lgtm: defaultConfig.label.lgtm,
          categories: [
            {
              name: 'Release',
              description: 'Release related',
              icon: '🚀',
              color: '000000',
              rules: [
                {
                  'base-branch': ['main', 'staging'],
                  'head-branch': ['^release', '^hotfix']
                }
              ]
            }
          ]
        }
      });

      const yml = new Converter().toYaml();

      expect(yml).toBe(`🚀 Release:
  - base-branch:
      - main
      - staging
    head-branch:
      - ^release
      - ^hotfix
`);
    });

    it('空のルール配列を持つカテゴリを変換できること', () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        label: {
          lgtm: defaultConfig.label.lgtm,
          categories: [
            {
              name: 'Empty',
              description: 'Empty rules',
              icon: '⚪',
              color: '000000',
              rules: []
            }
          ]
        }
      });

      const yml = new Converter().toYaml();

      expect(yml).toBe(`⚪ Empty: []
`);
    });

    it('複数のカテゴリを変換できること', () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        label: {
          lgtm: defaultConfig.label.lgtm,
          categories: [
            {
              name: 'Category1',
              description: 'First category',
              icon: '1️⃣',
              color: '000000',
              rules: [
                {
                  'base-branch': ['main']
                }
              ]
            },
            {
              name: 'Category2',
              description: 'Second category',
              icon: '2️⃣',
              color: '000000',
              rules: [
                {
                  'head-branch': ['develop']
                }
              ]
            }
          ]
        }
      });

      const yml = new Converter().toYaml();

      expect(yml).toBe(`1️⃣ Category1:
  - base-branch:
      - main
2️⃣ Category2:
  - head-branch:
      - develop
`);
    });

    it('全てのchanged-filesパターンを組み合わせたルールを変換できること', () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        label: {
          lgtm: defaultConfig.label.lgtm,
          categories: [
            {
              name: 'AllPatterns',
              description: 'All changed-files patterns',
              icon: '🔍',
              color: '000000',
              rules: [
                {
                  'changed-files': [
                    {
                      'any-glob-to-any-file': ['src/*.ts'],
                      'any-glob-to-all-files': ['*.md'],
                      'all-globs-to-any-file': ['docs/*', 'README.md'],
                      'all-globs-to-all-files': ['test/*.test.ts']
                    }
                  ]
                }
              ]
            }
          ]
        }
      });

      const yml = new Converter().toYaml();

      expect(yml).toBe(`🔍 AllPatterns:
  - changed-files:
      - any-glob-to-any-file:
          - src/*.ts
        any-glob-to-all-files:
          - '*.md'
        all-globs-to-any-file:
          - docs/*
          - README.md
        all-globs-to-all-files:
          - test/*.test.ts
`);
    });

    it('特殊な文字を含むカテゴリとパターンを変換できること', () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        label: {
          lgtm: defaultConfig.label.lgtm,
          categories: [
            {
              name: 'Special Characters & Unicode',
              description: 'Special patterns',
              icon: '🌈',
              color: '000000',
              rules: [
                {
                  'changed-files': [
                    {
                      'any-glob-to-any-file': [
                        'path with spaces/*.ts',
                        '*.特殊.txt',
                        'path/with/[brackets]/*'
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      });

      const yml = new Converter().toYaml();

      expect(yml).toBe(`🌈 Special Characters & Unicode:
  - changed-files:
      - any-glob-to-any-file:
          - path with spaces/*.ts
          - '*.特殊.txt'
          - path/with/[brackets]/*
`);
    });
  });
});
