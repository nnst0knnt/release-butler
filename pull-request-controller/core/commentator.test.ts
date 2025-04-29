import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GithubPullRequest } from '../../shared/utilities/pull-request';

import type { PullRequest } from '../../shared/definitions/pull-request';

describe('Commentator', async () => {
  const { Commentator } = await import('./commentator');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('add', () => {
    it('プルリクエストが存在する場合、コメントを追加できること', async () => {
      const pr = new GithubPullRequest();
      vi.spyOn(pr, 'findByNumber').mockResolvedValue({
        number: 1
      } as PullRequest);
      vi.spyOn(pr, 'comment').mockResolvedValue();

      await new Commentator({ pr }).add(1, 'Test comment');

      expect(pr.comment).toHaveBeenCalledWith(1, 'Test comment');
    });

    it('プルリクエストが存在しない場合、コメントを追加しないこと', async () => {
      const pr = new GithubPullRequest();
      vi.spyOn(pr, 'findByNumber').mockResolvedValue(null);
      vi.spyOn(pr, 'comment').mockResolvedValue();

      await new Commentator({ pr }).add(999, 'Test comment');

      expect(pr.comment).not.toHaveBeenCalled();
    });

    it('メッセージが指定されていない場合、デフォルトメッセージを使用すること', async () => {
      const pr = new GithubPullRequest();
      vi.spyOn(pr, 'findByNumber').mockResolvedValue({
        number: 2
      } as PullRequest);
      vi.spyOn(pr, 'comment').mockResolvedValue();

      await new Commentator({ pr }).add(2);

      expect(pr.comment).toHaveBeenCalledWith(2, Commentator.DefaultComment);
    });
  });
});
