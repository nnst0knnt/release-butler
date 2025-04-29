import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ReleasePullRequestFormats } from '../constants';
import { InvalidFormatError } from '../errors';
import { Config } from './config';
import { GithubError } from '../errors/github';
import defaultConfig from '../mocks/config';
import { github } from '../mocks/github';

import type { ReleasePullRequestFormat } from '../definitions';

vi.mock('@actions/github', () => github);

describe('GithubRelease', async () => {
  const { GithubRelease } = await import('./release');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('current', () => {
    it('最新のリリースを取得できること', async () => {
      github.octokit.rest.repos.listReleases.mockResolvedValue({
        data: [{ tag_name: 'v1.0.0' }]
      });

      const version = await new GithubRelease().current();

      expect(version).toBe('v1.0.0');
      expect(github.octokit.rest.repos.listReleases).toHaveBeenCalledWith({
        ...github.context.repo,
        per_page: 1
      });
    });

    it('リリースが存在しない場合、nullを返すこと', async () => {
      github.octokit.rest.repos.listReleases.mockResolvedValue({
        data: []
      });

      const version = await new GithubRelease().current();

      expect(version).toBeNull();
      expect(github.octokit.rest.repos.listReleases).toHaveBeenCalledWith({
        ...github.context.repo,
        per_page: 1
      });
    });

    it('最新リリースがnullの場合、nullを返すこと', async () => {
      github.octokit.rest.repos.listReleases.mockResolvedValue({
        data: [null]
      });

      const version = await new GithubRelease().current();

      expect(version).toBeNull();
      expect(github.octokit.rest.repos.listReleases).toHaveBeenCalledWith({
        ...github.context.repo,
        per_page: 1
      });
    });

    it('リリースの取得に失敗した場合、GithubErrorを投げること', async () => {
      github.octokit.rest.repos.listReleases.mockRejectedValue(new Error());

      await expect(new GithubRelease().current()).rejects.toThrow(GithubError);
      expect(github.octokit.rest.repos.listReleases).toHaveBeenCalledWith({
        ...github.context.repo,
        per_page: 1
      });
    });
  });

  describe('create', () => {
    it('リリースを作成できること', async () => {
      github.octokit.rest.repos.createRelease.mockResolvedValue({});

      await new GithubRelease().create({
        version: 'v1.0.0',
        title: 'v1.0.0 released title',
        body: 'v1.0.0 released body',
        base: 'main'
      });

      expect(github.octokit.rest.repos.createRelease).toHaveBeenCalledWith({
        ...github.context.repo,
        tag_name: 'v1.0.0',
        name: 'v1.0.0 released title',
        body: 'v1.0.0 released body',
        target_commitish: 'main',
        draft: false,
        prerelease: false,
        generate_release_notes: false
      });
    });

    it('リリースの作成に失敗した場合、GithubErrorを投げること', async () => {
      github.octokit.rest.repos.createRelease.mockRejectedValue(new Error());

      await expect(
        new GithubRelease().create({
          version: 'v1.0.0',
          title: 'v1.0.0 released title',
          body: 'v1.0.0 released body',
          base: 'main'
        })
      ).rejects.toThrow(GithubError);
      expect(github.octokit.rest.repos.createRelease).toHaveBeenCalledWith({
        ...github.context.repo,
        tag_name: 'v1.0.0',
        name: 'v1.0.0 released title',
        body: 'v1.0.0 released body',
        target_commitish: 'main',
        draft: false,
        prerelease: false,
        generate_release_notes: false
      });
    });
  });

  describe('notes', () => {
    it('カテゴリごとにプルリクエストを分類してリリースノートを生成できること', () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        release: {
          ...defaultConfig.release,
          categories: [
            {
              name: '🌟 機能追加',
              rules: ['^feature/']
            },
            {
              name: '🐛 バグ修正',
              rules: ['^fix/']
            }
          ]
        }
      });

      const notes = new GithubRelease().notes({
        prs: [
          {
            number: 1,
            title: 'Feature A',
            body: 'Add feature A',
            labels: [],
            base: 'main',
            head: 'feature/a',
            sha: 'sha1',
            url: 'https://github.com/owner/repo/pull/1',
            mergedAt: null,
            author: 'user1'
          },
          {
            number: 2,
            title: 'Fix B',
            body: 'Fix bug B',
            labels: [],
            base: 'main',
            head: 'fix/b',
            sha: 'sha2',
            url: 'https://github.com/owner/repo/pull/2',
            mergedAt: null,
            author: 'user2'
          }
        ],
        format: { pr: ReleasePullRequestFormats.Checklist }
      });

      expect(notes).toBe('## 🌟 機能追加\n\n- [ ] #1 @user1\n\n## 🐛 バグ修正\n\n- [ ] #2 @user2');
    });

    it('フォールバックルールに一致するプルリクエストを適切に分類できること', () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        release: {
          ...defaultConfig.release,
          categories: [
            {
              name: '🌟 機能追加',
              rules: ['^feature/']
            },
            {
              name: '👂 その他',
              rules: [GithubRelease.FALLBACK_RULE]
            }
          ]
        }
      });

      const notes = new GithubRelease().notes({
        prs: [
          {
            number: 1,
            title: 'Feature A',
            body: 'Add feature A',
            labels: [],
            base: 'main',
            head: 'feature/a',
            sha: 'sha1',
            url: 'https://github.com/owner/repo/pull/1',
            mergedAt: null,
            author: 'user1'
          },
          {
            number: 2,
            title: 'Other change',
            body: 'Some other change',
            labels: [],
            base: 'main',
            head: 'other/change',
            sha: 'sha2',
            url: 'https://github.com/owner/repo/pull/2',
            mergedAt: null,
            author: 'user2'
          }
        ],
        format: { pr: ReleasePullRequestFormats.Checklist }
      });

      expect(notes).toBe('## 🌟 機能追加\n\n- [ ] #1 @user1\n\n## 👂 その他\n\n- [ ] #2 @user2');
    });

    it('フォールバックルールが存在しない場合、デフォルトのフォールバックが使用されること', () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        release: {
          ...defaultConfig.release,
          categories: [
            {
              name: '🌟 機能追加',
              rules: ['^feature/']
            }
          ]
        }
      });

      const notes = new GithubRelease().notes({
        prs: [
          {
            number: 1,
            title: 'Feature A',
            body: 'Add feature A',
            labels: [],
            base: 'main',
            head: 'feature/a',
            sha: 'sha1',
            url: 'https://github.com/owner/repo/pull/1',
            mergedAt: null,
            author: 'user1'
          },
          {
            number: 2,
            title: 'Other change',
            body: 'Some other change',
            labels: [],
            base: 'main',
            head: 'other/change',
            sha: 'sha2',
            url: 'https://github.com/owner/repo/pull/2',
            mergedAt: null,
            author: 'user2'
          }
        ],
        format: { pr: ReleasePullRequestFormats.Checklist }
      });

      expect(notes).toBe(
        `## 🌟 機能追加\n\n- [ ] #1 @user1\n\n## ${GithubRelease.DEFAULT_FALLBACK_LABEL}\n\n- [ ] #2 @user2`
      );
    });

    it('複数のフォールバックルールが指定された場合、各ルールに対して対象のプルリクエストを追加すること', () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        release: {
          ...defaultConfig.release,
          categories: [
            {
              name: '🌟 機能追加',
              rules: ['^feature/']
            },
            {
              name: '🐛 バグ修正 + その他',
              rules: [GithubRelease.FALLBACK_RULE, '^fix/']
            },
            {
              name: '👂 その他',
              rules: [GithubRelease.FALLBACK_RULE]
            }
          ]
        }
      });

      const notes = new GithubRelease().notes({
        prs: [
          {
            number: 1,
            title: 'Feature A',
            body: 'Add feature A',
            labels: [],
            base: 'main',
            head: 'feature/a',
            sha: 'sha1',
            url: 'https://github.com/owner/repo/pull/1',
            mergedAt: '2022-01-01',
            author: 'user1'
          },
          {
            number: 2,
            title: 'Fix B',
            body: 'Fix bug B',
            labels: [],
            base: 'main',
            head: 'fix/b',
            sha: 'sha2',
            url: 'https://github.com/owner/repo/pull/2',
            mergedAt: '2022-01-02',
            author: 'user2'
          },
          {
            number: 3,
            title: 'Other change',
            body: 'Some other change',
            labels: [],
            base: 'main',
            head: 'other/change',
            sha: 'sha3',
            url: 'https://github.com/owner/repo/pull/3',
            mergedAt: '2022-01-03',
            author: 'user3'
          }
        ],
        format: { pr: ReleasePullRequestFormats.Checklist }
      });

      expect(notes).toBe(
        '## 🌟 機能追加\n\n- [ ] #1 @user1\n\n## 🐛 バグ修正 + その他\n\n- [ ] #2 @user2\n- [ ] #3 @user3\n\n## 👂 その他\n\n- [ ] #3 @user3'
      );
    });

    it('リスト形式でリリースノートを生成できること', () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        release: {
          ...defaultConfig.release,
          categories: [
            {
              name: '🌟 機能追加',
              rules: ['^feature/']
            }
          ]
        }
      });

      const notes = new GithubRelease().notes({
        prs: [
          {
            number: 1,
            title: 'Feature A',
            body: 'Add feature A',
            labels: [],
            base: 'main',
            head: 'feature/a',
            sha: 'sha1',
            url: 'https://github.com/owner/repo/pull/1',
            mergedAt: null,
            author: 'user1'
          }
        ],
        format: { pr: ReleasePullRequestFormats.List }
      });

      expect(notes).toBe(
        '## 🌟 機能追加\n\n- [Feature A](https://github.com/owner/repo/pull/1) @user1'
      );
    });

    it('プルリクエストが存在しないカテゴリは出力しないこと', () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        release: {
          ...defaultConfig.release,
          categories: [
            {
              name: '🌟 機能追加',
              rules: ['^feature/']
            },
            {
              name: '🐛 バグ修正',
              rules: ['^fix/']
            }
          ]
        }
      });

      const notes = new GithubRelease().notes({
        prs: [
          {
            number: 1,
            title: 'Feature A',
            body: 'Add feature A',
            labels: [],
            base: 'main',
            head: 'feature/a',
            sha: 'sha1',
            url: 'https://github.com/owner/repo/pull/1',
            mergedAt: null,
            author: 'user1'
          }
        ],
        format: { pr: ReleasePullRequestFormats.Checklist }
      });

      expect(notes).toBe('## 🌟 機能追加\n\n- [ ] #1 @user1');
    });

    it('ユーザー情報がないリリースノートを生成できること', () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        release: {
          ...defaultConfig.release,
          categories: [
            {
              name: '🌟 機能追加',
              rules: ['^feature/']
            }
          ]
        }
      });

      const notes = new GithubRelease().notes({
        prs: [
          {
            number: 1,
            title: 'Feature A',
            body: 'Add feature A',
            labels: [],
            base: 'main',
            head: 'feature/a',
            sha: 'sha1',
            url: 'https://github.com/owner/repo/pull/1',
            mergedAt: null,
            author: null
          }
        ],
        format: { pr: ReleasePullRequestFormats.Checklist }
      });

      expect(notes).toBe('## 🌟 機能追加\n\n- [ ] #1');
    });

    it('ユーザー情報がないリスト形式のリリースノートを生成できること', () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        release: {
          ...defaultConfig.release,
          categories: [
            {
              name: '🌟 機能追加',
              rules: ['^feature/']
            }
          ]
        }
      });

      const notes = new GithubRelease().notes({
        prs: [
          {
            number: 1,
            title: 'Feature A',
            body: 'Add feature A',
            labels: [],
            base: 'main',
            head: 'feature/a',
            sha: 'sha1',
            url: 'https://github.com/owner/repo/pull/1',
            mergedAt: null,
            author: null
          }
        ],
        format: { pr: ReleasePullRequestFormats.List }
      });

      expect(notes).toBe('## 🌟 機能追加\n\n- [Feature A](https://github.com/owner/repo/pull/1)');
    });

    it('プルリクエストが番号順にソートされること', () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        release: {
          ...defaultConfig.release,
          categories: [
            {
              name: '🌟 機能追加',
              rules: ['^feature/']
            }
          ]
        }
      });

      const notes = new GithubRelease().notes({
        prs: [
          {
            number: 3,
            title: 'Feature C',
            body: 'Add feature C',
            labels: [],
            base: 'main',
            head: 'feature/c',
            sha: 'sha3',
            url: 'https://github.com/owner/repo/pull/3',
            mergedAt: null,
            author: 'user3'
          },
          {
            number: 1,
            title: 'Feature A',
            body: 'Add feature A',
            labels: [],
            base: 'main',
            head: 'feature/a',
            sha: 'sha1',
            url: 'https://github.com/owner/repo/pull/1',
            mergedAt: null,
            author: 'user1'
          },
          {
            number: 2,
            title: 'Feature B',
            body: 'Add feature B',
            labels: [],
            base: 'main',
            head: 'feature/b',
            sha: 'sha2',
            url: 'https://github.com/owner/repo/pull/2',
            mergedAt: null,
            author: 'user2'
          }
        ],
        format: { pr: ReleasePullRequestFormats.Checklist }
      });

      expect(notes).toBe('## 🌟 機能追加\n\n- [ ] #1 @user1\n- [ ] #2 @user2\n- [ ] #3 @user3');
    });

    it('不正なフォーマットを指定した場合、InvalidFormatErrorを投げること', () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        release: {
          ...defaultConfig.release,
          categories: [
            {
              name: '🌟 機能追加',
              rules: ['^feature/']
            }
          ]
        }
      });

      expect(() =>
        new GithubRelease().notes({
          prs: [
            {
              number: 1,
              title: 'Feature A',
              body: 'Add feature A',
              labels: [],
              base: 'main',
              head: 'feature/a',
              sha: 'sha1',
              url: 'https://github.com/owner/repo/pull/1',
              mergedAt: null,
              author: 'user1'
            }
          ],
          format: { pr: 'invalid' as ReleasePullRequestFormat }
        })
      ).toThrow(InvalidFormatError);
    });
  });

  describe('defaultNote', () => {
    it('プルリクエストの番号からデフォルトのリリースノートを返すこと', () => {
      const release = new GithubRelease();

      expect(release.defaultNote(1)).toBe(
        `## 🚀 Release Butler\n\nhttps://github.com/${github.context.repo.owner}/${github.context.repo.repo}/pull/1`
      );
    });
  });
});
