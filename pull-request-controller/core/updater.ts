import { Config, GithubPullRequest, GithubRelease, ReleasePullRequestFormats } from '../../shared';

import type { AppConfig } from '../../shared';

/**
 * プルリクエストを更新するクラス
 */
export class Updater {
  private readonly config: AppConfig;
  private readonly pr: GithubPullRequest;
  private readonly release: GithubRelease;

  constructor(args?: { config?: AppConfig; pr?: GithubPullRequest; release?: GithubRelease }) {
    this.config = args?.config || Config.load();
    this.pr = args?.pr || new GithubPullRequest();
    this.release = args?.release || new GithubRelease();
  }

  /**
   * プルリクエストを更新する
   */
  async update() {
    const found = await this.pr.findByBranch({
      base: this.config.release.base,
      head: this.config.release.head
    });

    if (!found) return;

    const prs = await this.release.prs();

    await this.pr.update({
      number: found.number,
      body: this.release.notes({ prs, format: { pr: ReleasePullRequestFormats.Checklist } })
    });

    return found.number;
  }
}
