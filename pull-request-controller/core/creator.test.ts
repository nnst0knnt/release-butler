import { beforeEach, describe, expect, it, vi } from 'vitest';

import defaultConfig from '../../shared/mocks/config';
import { Config } from '../../shared/utilities/config';
import { GithubLabel } from '../../shared/utilities/label';
import { GithubPullRequest } from '../../shared/utilities/pull-request';
import { GithubRelease } from '../../shared/utilities/release';

import type { PullRequest } from '../../shared/definitions/pull-request';

describe('Creator', async () => {
  const { Creator } = await import('./creator');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('既存のプルリクエストが存在しない場合、新規作成できること', async () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        label: {
          ...defaultConfig.label,
          categories: []
        },
        release: {
          ...defaultConfig.release,
          base: 'base-branch',
          head: 'head-branch'
        }
      });
      const pr = new GithubPullRequest();
      vi.spyOn(pr, 'findByBranch').mockResolvedValue(null);
      vi.spyOn(pr, 'hasDiff').mockResolvedValue(true);
      vi.spyOn(pr, 'create').mockResolvedValue({ number: 1 } as PullRequest);
      const release = new GithubRelease();
      vi.spyOn(release, 'prs').mockResolvedValue([]);
      vi.spyOn(release, 'notes').mockReturnValue('fake notes');

      const number = await new Creator({ pr, release }).create();

      expect(number).toBe(1);
      expect(pr.create).toHaveBeenCalledWith({
        title: 'base-branch ← head-branch',
        body: 'fake notes',
        base: 'base-branch',
        head: 'head-branch'
      });
    });

    it('既存のプルリクエストが存在する場合、作成をスキップすること', async () => {
      const pr = new GithubPullRequest();
      vi.spyOn(pr, 'findByBranch').mockResolvedValue({ number: 1 } as PullRequest);
      vi.spyOn(pr, 'hasDiff').mockResolvedValue(true);
      vi.spyOn(pr, 'create');
      const release = new GithubRelease();

      const number = await new Creator({ pr, release }).create();

      expect(number).toBeUndefined();
      expect(pr.create).not.toHaveBeenCalled();
    });

    it('差分が存在しない場合、作成をスキップすること', async () => {
      const pr = new GithubPullRequest();
      vi.spyOn(pr, 'findByBranch').mockResolvedValue(null);
      vi.spyOn(pr, 'hasDiff').mockResolvedValue(false);
      vi.spyOn(pr, 'create');
      const release = new GithubRelease();

      const number = await new Creator({ pr, release }).create();

      expect(number).toBeUndefined();
      expect(pr.create).not.toHaveBeenCalled();
    });

    it('マッチするラベルがある場合、ラベルを付与すること', async () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        label: {
          ...defaultConfig.label,
          categories: [
            {
              name: 'release',
              description: 'Release changes',
              icon: '🚀',
              color: '000000',
              rules: [{ 'base-branch': ['base-branch'] }]
            }
          ]
        },
        release: {
          ...defaultConfig.release,
          base: 'base-branch',
          head: 'head-branch'
        }
      });
      const pr = new GithubPullRequest();
      vi.spyOn(pr, 'findByBranch').mockResolvedValue(null);
      vi.spyOn(pr, 'hasDiff').mockResolvedValue(true);
      vi.spyOn(pr, 'create').mockResolvedValue({ number: 1 } as PullRequest);
      const release = new GithubRelease();
      vi.spyOn(release, 'prs').mockResolvedValue([]);
      vi.spyOn(release, 'notes').mockReturnValue('fake notes');
      const label = new GithubLabel();
      vi.spyOn(label, 'add').mockResolvedValue();

      const number = await new Creator({ pr, release, label }).create();

      expect(number).toBe(1);
      expect(label.add).toHaveBeenCalledWith({
        number: 1,
        labels: ['🚀 release']
      });
    });
  });
});
