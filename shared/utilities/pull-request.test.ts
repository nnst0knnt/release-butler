import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PullRequestDirections, PullRequestSorts, PullRequestStates } from '../constants';
import { GithubError } from '../errors/github';
import { github } from '../mocks/github';

vi.mock('@actions/github', () => github);

vi.mock('./formatter.ts', async (factory) => {
  return {
    ...(await factory()),
    toAppPullRequest: vi.fn()
  };
});

describe('GithubPullRequest', async () => {
  const { GithubPullRequest } = await import('./pull-request');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findByBranch', () => {
    it('ブランチの組み合わせに対応するプルリクエストを1件取得できること', async () => {
      github.octokit.rest.pulls.list.mockResolvedValue({
        data: [
          {
            number: 1
          }
        ]
      });

      const pr = await new GithubPullRequest().findByBranch({
        base: 'main',
        head: 'feature/find-by-branch'
      });

      expect(pr).not.toBeNull();
      expect(github.octokit.rest.pulls.list).toHaveBeenCalledWith({
        ...github.context.repo,
        state: PullRequestStates.Open,
        base: 'main',
        head: `${github.context.repo.owner}:feature/find-by-branch`,
        sort: PullRequestSorts.Updated,
        direction: PullRequestDirections.Descending,
        per_page: 1
      });
    });

    it('該当するプルリクエストが存在しない場合、nullを返すこと', async () => {
      github.octokit.rest.pulls.list.mockResolvedValue({ data: [] });

      const pr = await new GithubPullRequest().findByBranch({
        base: 'main',
        head: 'not-exists'
      });

      expect(pr).toBeNull();
    });

    it('プルリクエストの取得に失敗した場合、GithubErrorを投げること', async () => {
      github.octokit.rest.pulls.list.mockRejectedValue(new Error());

      await expect(
        new GithubPullRequest().findByBranch({
          base: 'main',
          head: 'pull-request-list-failed'
        })
      ).rejects.toThrow(GithubError);
    });
  });

  describe('findByNumber', () => {
    it('指定した番号のプルリクエストを取得できること', async () => {
      github.octokit.rest.pulls.get.mockResolvedValue({
        data: {
          number: 1
        }
      });

      const pr = await new GithubPullRequest().findByNumber(1);

      expect(pr).not.toBeNull();
      expect(github.octokit.rest.pulls.get).toHaveBeenCalledWith({
        ...github.context.repo,
        pull_number: 1
      });
    });

    it('存在しない番号を指定した場合、nullを返すこと', async () => {
      github.octokit.rest.pulls.get.mockRejectedValue(Object.assign(new Error(), { status: 404 }));

      const pr = await new GithubPullRequest().findByNumber(999);

      expect(pr).toBeNull();
    });

    it('プルリクエストの取得に失敗した場合、GithubErrorを投げること', async () => {
      github.octokit.rest.pulls.get.mockRejectedValue(new Error());

      await expect(new GithubPullRequest().findByNumber(1)).rejects.toThrow(GithubError);
    });
  });

  describe('create', () => {
    it('プルリクエストを作成できること', async () => {
      github.octokit.rest.pulls.create.mockResolvedValue({
        data: {
          number: 5
        }
      });

      const pr = await new GithubPullRequest().create({
        title: 'New pr title',
        body: 'New pr description',
        base: 'main',
        head: 'staging'
      });

      expect(pr).not.toBeNull();
      expect(github.octokit.rest.pulls.create).toHaveBeenCalledWith({
        ...github.context.repo,
        title: 'New pr title',
        body: 'New pr description',
        base: 'main',
        head: 'staging'
      });
    });

    it('プルリクエストの作成に失敗した場合、GithubErrorを投げること', async () => {
      github.octokit.rest.pulls.create.mockRejectedValue(new Error());

      await expect(
        new GithubPullRequest().create({
          title: 'Failed pr title',
          body: 'Failed pr description',
          base: 'main',
          head: 'staging'
        })
      ).rejects.toThrow(GithubError);
    });
  });

  describe('update', () => {
    it('プルリクエストのタイトルを更新できること', async () => {
      github.octokit.rest.pulls.update.mockResolvedValue({});

      await new GithubPullRequest().update({
        number: 1,
        title: 'Updated title'
      });

      expect(github.octokit.rest.pulls.update).toHaveBeenCalledWith({
        ...github.context.repo,
        pull_number: 1,
        title: 'Updated title',
        body: undefined
      });
    });

    it('プルリクエストの本文を更新できること', async () => {
      github.octokit.rest.pulls.update.mockResolvedValue({});

      await new GithubPullRequest().update({
        number: 1,
        body: 'Updated description'
      });

      expect(github.octokit.rest.pulls.update).toHaveBeenCalledWith({
        ...github.context.repo,
        pull_number: 1,
        title: undefined,
        body: 'Updated description'
      });
    });

    it('プルリクエストの更新に失敗した場合、GithubErrorを投げること', async () => {
      github.octokit.rest.pulls.update.mockRejectedValue(new Error());

      await expect(
        new GithubPullRequest().update({
          number: 1,
          title: 'Failed update title'
        })
      ).rejects.toThrow(GithubError);
    });
  });

  describe('comment', () => {
    it('プルリクエストにコメントを追加できること', async () => {
      github.octokit.rest.issues.createComment.mockResolvedValue({});

      await new GithubPullRequest().comment(1, 'Add comment');

      expect(github.octokit.rest.issues.createComment).toHaveBeenCalledWith({
        ...github.context.repo,
        issue_number: 1,
        body: 'Add comment'
      });
    });

    it('コメントの追加に失敗した場合、GithubErrorを投げること', async () => {
      github.octokit.rest.issues.createComment.mockRejectedValue(new Error());

      await expect(new GithubPullRequest().comment(1, 'Failed comment')).rejects.toThrow(
        GithubError
      );
    });
  });

  describe('hasDiff', () => {
    it('ブランチ間に差分が存在する場合、trueを返すこと', async () => {
      github.octokit.rest.git.getRef
        .mockResolvedValueOnce({
          data: {
            object: {
              sha: 'base-sha'
            }
          }
        })
        .mockResolvedValueOnce({
          data: {
            object: {
              sha: 'head-sha'
            }
          }
        });
      github.octokit.rest.repos.compareCommits.mockResolvedValue({
        data: {
          total_commits: 3
        }
      });

      const hasDiff = await new GithubPullRequest().hasDiff('base-branch', 'head-branch');

      expect(hasDiff).toBe(true);
      expect(github.octokit.rest.git.getRef).toHaveBeenCalledTimes(2);
      expect(github.octokit.rest.git.createRef).not.toHaveBeenCalled();
      expect(github.octokit.rest.repos.compareCommits).toHaveBeenCalledTimes(1);
      expect(github.octokit.rest.repos.compareCommits).toHaveBeenCalledWith({
        ...github.context.repo,
        base: 'base-branch',
        head: 'head-branch',
        per_page: 1
      });
    });

    it('ブランチ間に差分が存在しない場合、falseを返すこと', async () => {
      github.octokit.rest.git.getRef
        .mockResolvedValueOnce({
          data: {
            object: {
              sha: 'base-sha'
            }
          }
        })
        .mockResolvedValueOnce({
          data: {
            object: {
              sha: 'head-sha'
            }
          }
        });
      github.octokit.rest.repos.compareCommits.mockResolvedValue({
        data: {
          total_commits: 0
        }
      });

      const hasDiff = await new GithubPullRequest().hasDiff('base-branch', 'head-branch');

      expect(hasDiff).toBe(false);
      expect(github.octokit.rest.git.getRef).toHaveBeenCalledTimes(2);
      expect(github.octokit.rest.git.createRef).not.toHaveBeenCalled();
      expect(github.octokit.rest.repos.compareCommits).toHaveBeenCalledTimes(1);
      expect(github.octokit.rest.repos.compareCommits).toHaveBeenCalledWith({
        ...github.context.repo,
        base: 'base-branch',
        head: 'head-branch',
        per_page: 1
      });
    });

    it('どちらか一方のブランチが存在しない場合、存在するブランチの最新のハッシュからブランチを作成すること', async () => {
      github.octokit.rest.git.getRef
        .mockResolvedValueOnce({
          data: {
            object: {
              sha: 'base-sha'
            }
          }
        })
        .mockRejectedValueOnce(Object.assign(new Error(), { status: 404 }));
      github.octokit.rest.git.createRef.mockResolvedValue({});
      github.octokit.rest.repos.compareCommits.mockResolvedValue({
        data: {
          total_commits: 0
        }
      });

      const hasDiff = await new GithubPullRequest().hasDiff('base-branch', 'head-branch');

      expect(hasDiff).toBe(false);
      expect(github.octokit.rest.git.getRef).toHaveBeenCalledTimes(2);
      expect(github.octokit.rest.git.createRef).toHaveBeenCalledTimes(1);
      expect(github.octokit.rest.git.createRef).toHaveBeenCalledWith({
        ...github.context.repo,
        ref: 'refs/heads/head-branch',
        sha: 'base-sha'
      });
      expect(github.octokit.rest.repos.compareCommits).toHaveBeenCalledTimes(1);
      expect(github.octokit.rest.repos.compareCommits).toHaveBeenCalledWith({
        ...github.context.repo,
        base: 'base-branch',
        head: 'head-branch',
        per_page: 1
      });
    });

    it('ブランチ間の差分の取得に失敗した場合、GithubErrorを投げること', async () => {
      github.octokit.rest.git.getRef
        .mockResolvedValueOnce({
          data: {
            object: {
              sha: 'base-sha'
            }
          }
        })
        .mockResolvedValueOnce({
          data: {
            object: {
              sha: 'head-sha'
            }
          }
        });
      github.octokit.rest.repos.compareCommits.mockRejectedValue(new Error());

      await expect(new GithubPullRequest().hasDiff('base-branch', 'head-branch')).rejects.toThrow(
        GithubError
      );
      expect(github.octokit.rest.git.getRef).toHaveBeenCalledTimes(2);
      expect(github.octokit.rest.git.createRef).not.toHaveBeenCalled();
      expect(github.octokit.rest.repos.compareCommits).toHaveBeenCalledTimes(1);
      expect(github.octokit.rest.repos.compareCommits).toHaveBeenCalledWith({
        ...github.context.repo,
        base: 'base-branch',
        head: 'head-branch',
        per_page: 1
      });
    });

    it('ブランチの取得に失敗した場合、GithubErrorを投げること', async () => {
      github.octokit.rest.git.getRef.mockRejectedValue(new Error());

      await expect(new GithubPullRequest().hasDiff('base-branch', 'head-branch')).rejects.toThrow(
        GithubError
      );
      expect(github.octokit.rest.git.getRef).toHaveBeenCalledTimes(2);
      expect(github.octokit.rest.git.createRef).not.toHaveBeenCalled();
      expect(github.octokit.rest.repos.compareCommits).not.toHaveBeenCalled();
    });

    it('指定されたブランチがどちらも存在しない場合、エラーを投げること', async () => {
      github.octokit.rest.git.getRef
        .mockRejectedValueOnce(Object.assign(new Error(), { status: 404 }))
        .mockRejectedValueOnce(Object.assign(new Error(), { status: 404 }));

      await expect(new GithubPullRequest().hasDiff('base-branch', 'head-branch')).rejects.toThrow(
        GithubError
      );
      expect(github.octokit.rest.git.getRef).toHaveBeenCalledTimes(2);
      expect(github.octokit.rest.git.createRef).not.toHaveBeenCalled();
      expect(github.octokit.rest.repos.compareCommits).not.toHaveBeenCalled();
    });

    it('ブランチの作成に失敗した場合、GithubErrorを投げること', async () => {
      github.octokit.rest.git.getRef
        .mockResolvedValueOnce({
          data: {
            object: {
              sha: 'base-sha'
            }
          }
        })
        .mockRejectedValueOnce(Object.assign(new Error(), { status: 404 }));
      github.octokit.rest.git.createRef.mockRejectedValue(new Error());

      await expect(new GithubPullRequest().hasDiff('base-branch', 'head-branch')).rejects.toThrow(
        GithubError
      );
      expect(github.octokit.rest.git.getRef).toHaveBeenCalledTimes(2);
      expect(github.octokit.rest.git.createRef).toHaveBeenCalledTimes(1);
      expect(github.octokit.rest.git.createRef).toHaveBeenCalledWith({
        ...github.context.repo,
        ref: 'refs/heads/head-branch',
        sha: 'base-sha'
      });
      expect(github.octokit.rest.repos.compareCommits).not.toHaveBeenCalled();
    });
  });
});
