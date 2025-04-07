import * as github from '@actions/github';

import { Config } from './config';
import { PullRequestDirections, PullRequestSorts, PullRequestStates } from '../constants';
import { toAppPullRequest } from './formatter';
import { GithubError } from '../errors/github';

import type {
  CreatePullRequestParameters,
  FindPullRequestParameters,
  Octokit,
  UpdatePullRequestParameters
} from '../definitions';

/**
 * プルリクエストを操作するクラス
 */
export class GithubPullRequest {
  private readonly octokit: Octokit;

  constructor(args?: { octokit?: Octokit }) {
    this.octokit = args?.octokit || github.getOctokit(Config.Github.load().token);
  }

  /**
   * 指定されたブランチのプルリクエストを1件取得する
   */
  async findByBranch({ base, head }: FindPullRequestParameters) {
    try {
      const { data: prs } = await this.octokit.rest.pulls.list({
        ...github.context.repo,
        state: PullRequestStates.Open,
        base,
        head: `${github.context.repo.owner}:${head}`,
        sort: PullRequestSorts.Updated,
        direction: PullRequestDirections.Descending,
        per_page: 1
      });

      if (prs.length === 0 || !prs[0]) return null;

      return toAppPullRequest(prs[0]);
    } catch (e) {
      throw GithubError.build('プルリクエストの取得に失敗', e);
    }
  }

  /**
   * 指定された番号のプルリクエストを取得する
   */
  async findByNumber(number: number) {
    try {
      const { data: pr } = await this.octokit.rest.pulls.get({
        ...github.context.repo,
        pull_number: number
      });

      if (!pr) return null;

      return toAppPullRequest(pr);
    } catch (e) {
      if (!GithubError.isNotFound(e)) {
        throw GithubError.build('プルリクエストの取得に失敗', e);
      }

      return null;
    }
  }

  /**
   * プルリクエストを作成する
   */
  async create({ title, body, base, head }: CreatePullRequestParameters) {
    try {
      const { data: pr } = await this.octokit.rest.pulls.create({
        ...github.context.repo,
        title,
        body,
        base,
        head
      });

      return toAppPullRequest(pr);
    } catch (e) {
      throw GithubError.build('プルリクエストの作成に失敗', e);
    }
  }

  /**
   * プルリクエストを更新する
   */
  async update({ number, title = undefined, body = undefined }: UpdatePullRequestParameters) {
    try {
      await this.octokit.rest.pulls.update({
        ...github.context.repo,
        pull_number: number,
        title: title as string,
        body: body as string
      });
    } catch (e) {
      throw GithubError.build('プルリクエストの更新に失敗', e);
    }
  }

  /**
   * 指定された番号のプルリクエストにコメントを追加する
   */
  async comment(number: number, comment: string) {
    try {
      await this.octokit.rest.issues.createComment({
        ...github.context.repo,
        issue_number: number,
        body: comment
      });
    } catch (e) {
      throw GithubError.build('コメントの追加に失敗', e);
    }
  }

  /**
   * ベースブランチとヘッドブランチの差分を確認する
   */
  async hasDiff(base: string, head: string): Promise<boolean> {
    try {
      const refs = await Promise.all(
        [base, head].map(async (branch) => {
          try {
            const { data: ref } = await this.octokit.rest.git.getRef({
              ...github.context.repo,
              ref: `heads/${branch}`
            });

            return { branch, exists: true, sha: ref.object.sha };
          } catch (e) {
            if (GithubError.isNotFound(e)) {
              return { branch, exists: false, sha: null };
            }

            throw e;
          }
        })
      );

      for (const ref of refs) {
        if (!ref.exists) {
          const source = refs.find(({ exists }) => exists);

          if (!source || !source.sha) {
            throw new Error('少なくとも1つのブランチが存在する必要があります');
          }

          await this.octokit.rest.git.createRef({
            ...github.context.repo,
            ref: `refs/heads/${ref.branch}`,
            sha: source.sha
          });
        }
      }

      const { data: comparison } = await this.octokit.rest.repos.compareCommits({
        ...github.context.repo,
        base,
        head,
        per_page: 1
      });

      return comparison.total_commits > 0;
    } catch (e) {
      throw GithubError.build(`${base} と ${head} の差分の確認に失敗`, e);
    }
  }
}
