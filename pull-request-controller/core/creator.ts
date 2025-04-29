import {
  Config,
  GithubLabel,
  GithubPullRequest,
  GithubRelease,
  Labeler,
  ReleasePullRequestFormats
} from '../../shared';

import type { AppConfig } from '../../shared';

/**
 * プルリクエストを作成するクラス
 */
export class Creator {
  private readonly config: AppConfig;
  private readonly pr: GithubPullRequest;
  private readonly release: GithubRelease;
  private readonly label: GithubLabel;

  constructor(args?: {
    config?: AppConfig;
    pr?: GithubPullRequest;
    release?: GithubRelease;
    label?: GithubLabel;
  }) {
    this.config = args?.config || Config.load();
    this.pr = args?.pr || new GithubPullRequest();
    this.release = args?.release || new GithubRelease();
    this.label = args?.label || new GithubLabel();
  }

  /**
   * プルリクエストを作成する
   */
  async create() {
    const exists = !!(await this.pr.findByBranch({
      base: this.config.release.base,
      head: this.config.release.head
    }));
    const hasDiff = await this.pr.hasDiff(this.config.release.base, this.config.release.head);

    if (exists || !hasDiff) return;

    const prs = await this.release.prs();

    const pr = await this.pr.create({
      title: `${this.config.release.base} ← ${this.config.release.head}`,
      body: this.release.notes({ prs, format: { pr: ReleasePullRequestFormats.Checklist } }),
      base: this.config.release.base,
      head: this.config.release.head
    });

    const labels = this.config.label.categories
      .filter((category) =>
        Labeler.Branch.isMatched(category, this.config.release.base, this.config.release.head)
      )
      .map(GithubLabel.format);

    if (labels.length) {
      await this.label.add({ number: pr.number, labels });
    }

    return pr.number;
  }
}
