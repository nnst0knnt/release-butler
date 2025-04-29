import { beforeEach, describe, expect, it, vi } from 'vitest';

import defaultConfig from '../../shared/mocks/config';
import { Config } from '../../shared/utilities/config';
import { GithubPullRequest } from '../../shared/utilities/pull-request';
import { GithubRelease } from '../../shared/utilities/release';

import type { PullRequest } from '../../shared/definitions/pull-request';

describe('Updater', async () => {
  const { Updater } = await import('./updater');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('update', () => {
    it('対象のプルリクエストが存在する場合、更新できること', async () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        release: {
          ...defaultConfig.release,
          base: 'base-branch',
          head: 'head-branch'
        }
      });
      const pr = new GithubPullRequest();
      vi.spyOn(pr, 'findByBranch').mockResolvedValue({ number: 1 } as PullRequest);
      vi.spyOn(pr, 'update').mockResolvedValue();
      const release = new GithubRelease();
      vi.spyOn(release, 'prs').mockResolvedValue([]);
      vi.spyOn(release, 'notes').mockReturnValue('updated notes');

      const number = await new Updater({ pr, release }).update();

      expect(number).toBe(1);
      expect(pr.update).toHaveBeenCalledWith({
        number: 1,
        body: 'updated notes'
      });
    });

    it('対象のプルリクエストが存在しない場合、更新をスキップすること', async () => {
      const pr = new GithubPullRequest();
      vi.spyOn(pr, 'findByBranch').mockResolvedValue(null);
      vi.spyOn(pr, 'update');
      const release = new GithubRelease();

      const number = await new Updater({ pr, release }).update();

      expect(number).toBeUndefined();
      expect(pr.update).not.toHaveBeenCalled();
    });
  });
});
