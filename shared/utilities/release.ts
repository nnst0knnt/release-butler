import * as github from '@actions/github';

import {
  PullRequestDirections,
  PullRequestSorts,
  PullRequestStates,
  ReleasePullRequestFormats
} from '../constants';
import { InvalidFormatError } from '../errors';
import { Config } from './config';
import { toAppPullRequest } from './formatter';
import { GithubError } from '../errors/github';

import type {
  AppConfig,
  CreateReleaseParameters,
  GenerateReleaseNoteParameters,
  GetReleasePullRequestParameters,
  Octokit,
  OctokitPullRequest,
  PullRequest,
  ReleasePullRequestFormat
} from '../definitions';

/**
 * リリースを操作するクラス
 */
export class GithubRelease {
  private readonly config: AppConfig;
  private readonly octokit: Octokit;

  /**
   * フォールバックのルール
   *
   * どのパターンにもヒットしないリリース対象のプルリクエストが割り振られる
   */
  static readonly FALLBACK_RULE = '.*';

  /**
   * デフォルトのフォールバックラベル
   */
  static readonly DEFAULT_FALLBACK_LABEL = '🔍 その他';

  constructor(args?: { octokit?: Octokit; config?: AppConfig }) {
    this.config = args?.config || Config.load();
    this.octokit = args?.octokit || github.getOctokit(Config.Github.load().token);
  }

  /**
   * 現在のバージョンを取得する
   */
  async current() {
    try {
      const { data: releases } = await this.octokit.rest.repos.listReleases({
        ...github.context.repo,
        per_page: 1
      });

      if (releases.length === 0 || !releases[0]) {
        return null;
      }

      return releases[0].tag_name;
    } catch (e) {
      throw GithubError.build('バージョンの取得に失敗', e);
    }
  }

  /**
   * リリースするプルリクエスト一覧を取得する
   */
  async prs({ number, perPage = 1000 }: GetReleasePullRequestParameters = {}) {
    try {
      let pr: OctokitPullRequest | null = null;

      if (number) {
        const { data } = await this.octokit.rest.pulls.get({
          ...github.context.repo,
          pull_number: number
        });

        pr = data;
      }

      const isHotfix =
        pr && pr.head.ref !== this.config.release.head && pr.base.ref === this.config.release.base;
      if (isHotfix) return [toAppPullRequest(pr!)];

      const {
        data: { commits, total_commits }
      } = await this.octokit.rest.repos.compareCommits({
        ...github.context.repo,
        base: pr ? pr.base.sha : this.config.release.base,
        head: this.config.release.head,
        per_page: perPage
      });

      const shas = commits.map((commit) => commit.sha);

      const { data: prs } = await this.octokit.rest.pulls.list({
        ...github.context.repo,
        state: PullRequestStates.Closed,
        base: this.config.release.head,
        sort: PullRequestSorts.Updated,
        direction: PullRequestDirections.Descending,
        per_page: total_commits
      });

      return prs
        .filter(
          ({ merged_at, merge_commit_sha }) =>
            merged_at !== null && merge_commit_sha && shas.includes(merge_commit_sha)
        )
        .map(toAppPullRequest);
    } catch (e) {
      throw GithubError.build('リリースするプルリクエスト一覧の取得に失敗', e);
    }
  }

  /**
   * リリースを作成する
   */
  async create({ version, title, body, base }: CreateReleaseParameters) {
    try {
      await this.octokit.rest.repos.createRelease({
        ...github.context.repo,
        tag_name: version,
        name: title,
        body,
        target_commitish: base,
        draft: false,
        prerelease: false,
        generate_release_notes: false
      });
    } catch (e) {
      throw GithubError.build('リリースの作成に失敗', e);
    }
  }

  /**
   * リリースノートを生成する
   */
  notes({ prs, format }: GenerateReleaseNoteParameters) {
    const summary: Record<string, PullRequest[]> = {};

    const fallbacks = this.config.release.categories
      .filter((category) => category.rules.includes(GithubRelease.FALLBACK_RULE))
      .map((category) => category.name);
    if (fallbacks.length === 0) {
      fallbacks.push(GithubRelease.DEFAULT_FALLBACK_LABEL);
    }

    for (const category of this.config.release.categories) {
      summary[category.name] = [];
    }

    for (const fallback of fallbacks) {
      summary[fallback] = [];
    }

    for (const pr of prs.sort((a, b) => a.number - b.number)) {
      const specifics = this.config.release.categories
        .filter((category) =>
          category.rules.some(
            (rule) => GithubRelease.FALLBACK_RULE !== rule && new RegExp(rule).test(pr.head)
          )
        )
        .map((category) => category.name);

      if (specifics.length > 0) {
        for (const name of specifics) {
          summary[name]!.push(pr);
        }
      } else {
        for (const fallback of fallbacks) {
          summary[fallback]!.push(pr);
        }
      }
    }

    return Object.entries(summary)
      .filter(([_, prs]) => prs.length > 0)
      .map(
        ([name, prs]) => `## ${name}\n\n${prs.map((pr) => this.toPrText(pr, format.pr)).join('\n')}`
      )
      .join('\n\n');
  }

  /**
   * デフォルトのリリースノートを生成する
   */
  defaultNote(number: number) {
    return `## 🚀 Release Butler\n\nhttps://github.com/${github.context.repo.owner}/${github.context.repo.repo}/pull/${number}`;
  }

  /**
   * リリースするプルリクエストの表示テキスト
   */
  private toPrText(pr: PullRequest, format: ReleasePullRequestFormat) {
    switch (format) {
      case ReleasePullRequestFormats.Checklist:
        return `- [ ] #${pr.number}${pr.author ? ` @${pr.author}` : ''}`;
      case ReleasePullRequestFormats.List:
        return `- [${pr.title}](${pr.url})${pr.author ? ` @${pr.author}` : ''}`;
      default:
        throw new InvalidFormatError(`不正なプルリクエストの表示形式です`);
    }
  }
}
