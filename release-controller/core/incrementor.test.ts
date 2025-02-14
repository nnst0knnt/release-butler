import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  IncrementLevels,
  InvalidIncrementLevelError,
  InvalidVersionFormatError
} from '../../shared';
import defaultConfig from '../../shared/mocks/config';
import { Config } from '../../shared/utilities/config';
import { GithubRelease } from '../../shared/utilities/release';

import type { IncrementLevel, PullRequest } from '../../shared/definitions';

describe('Incrementor', async () => {
  const { Incrementor } = await import('./incrementor');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('increment', () => {
    it('現在のバージョンが存在しない場合、デフォルトバージョンを返すこと', async () => {
      const release = new GithubRelease();
      vi.spyOn(release, 'current').mockResolvedValue(null);

      const version = await new Incrementor({ release }).increment([]);

      expect(version).toEqual({
        current: null,
        next: { major: 1, minor: 0, patch: 0 }
      });
    });

    it('パッチ更新のブランチパターンの場合、パッチバージョンをインクリメントすること', async () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        release: {
          ...defaultConfig.release,
          version: {
            ...defaultConfig.release.version,
            rules: {
              ...defaultConfig.release.version.rules,
              patch: ['^fix/']
            }
          }
        }
      });
      const release = new GithubRelease();
      vi.spyOn(release, 'current').mockResolvedValue('v1.2.3');

      const version = await new Incrementor({ release }).increment([
        { head: 'fix/bug-123' } as PullRequest
      ]);

      expect(version).toEqual({
        current: { major: 1, minor: 2, patch: 3 },
        next: { major: 1, minor: 2, patch: 4 }
      });
    });

    it('パッチバージョンのデフォルト設定でインクリメントすること', async () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        release: {
          ...defaultConfig.release,
          version: {
            rules: {
              major: [],
              minor: [],
              patch: []
            },
            defaults: {
              increment: IncrementLevels.Patch
            }
          }
        }
      });
      const release = new GithubRelease();
      vi.spyOn(release, 'current').mockResolvedValue('v1.0.0');

      const version = await new Incrementor({ release }).increment([]);

      expect(version).toEqual({
        current: { major: 1, minor: 0, patch: 0 },
        next: { major: 1, minor: 0, patch: 1 }
      });
    });

    it('マイナー更新のブランチパターンの場合、マイナーバージョンをインクリメントすること', async () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        release: {
          ...defaultConfig.release,
          version: {
            ...defaultConfig.release.version,
            rules: {
              ...defaultConfig.release.version.rules,
              minor: ['^feature/']
            }
          }
        }
      });
      const release = new GithubRelease();
      vi.spyOn(release, 'current').mockResolvedValue('v1.2.3');

      const version = await new Incrementor({ release }).increment([
        { head: 'feature/new-feature' } as PullRequest
      ]);

      expect(version).toEqual({
        current: { major: 1, minor: 2, patch: 3 },
        next: { major: 1, minor: 3, patch: 0 }
      });
    });

    it('マイナーバージョンのデフォルト設定でインクリメントすること', async () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        release: {
          ...defaultConfig.release,
          version: {
            rules: {
              major: [],
              minor: [],
              patch: []
            },
            defaults: {
              increment: IncrementLevels.Minor
            }
          }
        }
      });
      const release = new GithubRelease();
      vi.spyOn(release, 'current').mockResolvedValue('v1.0.0');

      const version = await new Incrementor({ release }).increment([]);

      expect(version).toEqual({
        current: { major: 1, minor: 0, patch: 0 },
        next: { major: 1, minor: 1, patch: 0 }
      });
    });

    it('メジャー更新のブランチパターンの場合、メジャーバージョンをインクリメントすること', async () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        release: {
          ...defaultConfig.release,
          version: {
            ...defaultConfig.release.version,
            rules: {
              ...defaultConfig.release.version.rules,
              major: ['^breaking/']
            }
          }
        }
      });
      const release = new GithubRelease();
      vi.spyOn(release, 'current').mockResolvedValue('v1.2.3');

      const version = await new Incrementor({ release }).increment([
        { head: 'breaking/api-change' } as PullRequest
      ]);

      expect(version).toEqual({
        current: { major: 1, minor: 2, patch: 3 },
        next: { major: 2, minor: 0, patch: 0 }
      });
    });

    it('メジャーバージョンのデフォルト設定でインクリメントすること', async () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        release: {
          ...defaultConfig.release,
          version: {
            rules: {
              major: [],
              minor: [],
              patch: []
            },
            defaults: {
              increment: IncrementLevels.Major
            }
          }
        }
      });
      const release = new GithubRelease();
      vi.spyOn(release, 'current').mockResolvedValue('v1.0.0');

      const version = await new Incrementor({ release }).increment([]);

      expect(version).toEqual({
        current: { major: 1, minor: 0, patch: 0 },
        next: { major: 2, minor: 0, patch: 0 }
      });
    });

    it('不正なインクリメントレベルの場合、InvalidIncrementLevelErrorを投げること', async () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        release: {
          ...defaultConfig.release,
          version: {
            rules: {
              major: [],
              minor: [],
              patch: []
            },
            defaults: {
              increment: 'invalid' as IncrementLevel
            }
          }
        }
      });
      const release = new GithubRelease();
      vi.spyOn(release, 'current').mockResolvedValue('v1.0.0');

      await expect(new Incrementor({ release }).increment([])).rejects.toThrow(
        InvalidIncrementLevelError
      );
    });

    it('メジャー、マイナー、パッチの更新が混在する場合、最も大きな変更を優先すること', async () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        release: {
          ...defaultConfig.release,
          version: {
            ...defaultConfig.release.version,
            rules: {
              major: ['^breaking/'],
              minor: ['^feature/'],
              patch: ['^fix/']
            }
          }
        }
      });
      const release = new GithubRelease();
      vi.spyOn(release, 'current').mockResolvedValue('v3.3.9');

      const version = await new Incrementor({ release }).increment([
        { head: 'fix/bug-123' },
        { head: 'feature/new-feature' },
        { head: 'breaking/api-change' }
      ] as PullRequest[]);

      expect(version).toEqual({
        current: { major: 3, minor: 3, patch: 9 },
        next: { major: 4, minor: 0, patch: 0 }
      });
    });
  });

  describe('parse', () => {
    it('正しいバージョン文字列をパースできること', () => {
      expect(Incrementor.parse('v1.2.3')).toEqual({
        major: 1,
        minor: 2,
        patch: 3
      });
      expect(Incrementor.parse('1.2.3')).toEqual({
        major: 1,
        minor: 2,
        patch: 3
      });
    });

    it('不正なバージョン文字列の場合、InvalidVersionFormatErrorを投げること', () => {
      ['invalid', 'v1.2', 'v1.2.3.4', 'v1.2.x', 'va.b.c', ''].forEach((version) => {
        expect(() => Incrementor.parse(version)).toThrow(InvalidVersionFormatError);
      });
    });
  });

  describe('stringify', () => {
    it('バージョンオブジェクトを文字列に変換できること', () => {
      expect(
        Incrementor.stringify({
          major: 1,
          minor: 2,
          patch: 3
        })
      ).toBe('v1.2.3');
    });

    it('0を含むバージョンを正しく文字列化できること', () => {
      expect(
        Incrementor.stringify({
          major: 1,
          minor: 0,
          patch: 0
        })
      ).toBe('v1.0.0');
    });
  });

  describe('defaultVersion', () => {
    it('デフォルトバージョンを取得できること', () => {
      const incrementor = new Incrementor();

      expect(incrementor.defaultVersion).toEqual({
        major: 1,
        minor: 0,
        patch: 0
      });
    });
  });
});
