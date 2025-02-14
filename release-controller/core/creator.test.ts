import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Incrementor } from './incrementor';
import { ReleaseTitleVariables } from '../../shared/constants/release';
import defaultConfig from '../../shared/mocks/config';
import { Config } from '../../shared/utilities/config';
import { GithubRelease } from '../../shared/utilities/release';

import type { PullRequest } from '../../shared/definitions/pull-request';

describe('Creator', async () => {
  const { Creator } = await import('./creator');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('マージされたプルリクエストが存在する場合、リリースを作成できること', async () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        release: {
          ...defaultConfig.release,
          base: 'main',
          title: `${ReleaseTitleVariables.PreviousVersion} → ${ReleaseTitleVariables.ReleaseVersion}`
        }
      });
      const release = new GithubRelease();
      const incrementor = new Incrementor();
      vi.spyOn(incrementor, 'increment').mockResolvedValue({
        current: { major: 1, minor: 0, patch: 0 },
        next: { major: 1, minor: 1, patch: 0 }
      });
      vi.spyOn(release, 'prs').mockResolvedValue([{ number: 2 } as PullRequest]);
      vi.spyOn(release, 'notes').mockReturnValue('Release notes with PRs');
      vi.spyOn(release, 'create').mockResolvedValue();

      await new Creator({ release, incrementor }).create(1);

      expect(release.create).toHaveBeenCalledWith({
        version: 'v1.1.0',
        title: 'v1.0.0 → v1.1.0',
        body: 'Release notes with PRs',
        base: 'main'
      });
    });

    it('マージされたプルリクエストが存在しない場合、デフォルトのリリースノートを使用すること', async () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        release: {
          ...defaultConfig.release,
          base: 'main',
          title: `${ReleaseTitleVariables.PreviousVersion} → ${ReleaseTitleVariables.ReleaseVersion}`
        }
      });
      const release = new GithubRelease();
      const incrementor = new Incrementor();
      vi.spyOn(incrementor, 'increment').mockResolvedValue({
        current: { major: 1, minor: 0, patch: 0 },
        next: { major: 1, minor: 1, patch: 0 }
      });
      vi.spyOn(release, 'prs').mockResolvedValue([]);
      vi.spyOn(release, 'notes');
      vi.spyOn(release, 'defaultNote').mockReturnValue('Default release note');
      vi.spyOn(release, 'create').mockResolvedValue();

      await new Creator({ release, incrementor }).create(1);

      expect(release.defaultNote).toHaveBeenCalledWith(1);
      expect(release.notes).not.toHaveBeenCalled();
      expect(release.create).toHaveBeenCalledWith({
        version: 'v1.1.0',
        title: 'v1.0.0 → v1.1.0',
        body: 'Default release note',
        base: 'main'
      });
    });

    it('初回リリースの場合、デフォルトのタイトルを使用すること', async () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        release: {
          ...defaultConfig.release,
          base: 'main',
          title: `${ReleaseTitleVariables.PreviousVersion} → ${ReleaseTitleVariables.ReleaseVersion}`
        }
      });
      const release = new GithubRelease();
      const incrementor = new Incrementor();
      vi.spyOn(incrementor, 'increment').mockResolvedValue({
        current: null,
        next: { major: 1, minor: 0, patch: 0 }
      });
      vi.spyOn(release, 'prs').mockResolvedValue([]);
      vi.spyOn(release, 'notes');
      vi.spyOn(release, 'defaultNote').mockReturnValue('First release note');
      vi.spyOn(release, 'create').mockResolvedValue();

      await new Creator({ release, incrementor }).create(1);

      expect(release.defaultNote).toHaveBeenCalledWith(1);
      expect(release.notes).not.toHaveBeenCalled();
      expect(release.create).toHaveBeenCalledWith({
        version: 'v1.0.0',
        title: `${Creator.DefaultCurrentVersion} → v1.0.0`,
        body: 'First release note',
        base: 'main'
      });
    });

    it('設定ファイルに基づいてタイトルをフォーマットすること', async () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        release: {
          ...defaultConfig.release,
          base: 'main',
          title: `${ReleaseTitleVariables.ReleaseVersion}（previous version: ${ReleaseTitleVariables.PreviousVersion}）`
        }
      });
      const release = new GithubRelease();
      const incrementor = new Incrementor();
      vi.spyOn(incrementor, 'increment').mockResolvedValue({
        current: { major: 2, minor: 1, patch: 0 },
        next: { major: 2, minor: 2, patch: 0 }
      });
      vi.spyOn(release, 'prs').mockResolvedValue([]);
      vi.spyOn(release, 'defaultNote').mockReturnValue('Release note');
      vi.spyOn(release, 'create').mockResolvedValue();

      await new Creator({ release, incrementor }).create(1);

      expect(release.create).toHaveBeenCalledWith({
        version: 'v2.2.0',
        title: 'v2.2.0（previous version: v2.1.0）',
        body: 'Release note',
        base: 'main'
      });
    });
  });
});
