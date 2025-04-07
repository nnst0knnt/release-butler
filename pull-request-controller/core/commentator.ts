import { GithubPullRequest } from '../../shared';

/**
 * プルリクエストにコメントを追加するクラス
 */
export class Commentator {
  private readonly pr: GithubPullRequest;

  /**
   * デフォルトのコメント
   */
  static readonly DefaultComment = '🚀 Release Butler';

  constructor(args?: { pr?: GithubPullRequest }) {
    this.pr = args?.pr ?? new GithubPullRequest();
  }

  /**
   * コメントを追加する
   */
  async add(number: number, comment = Commentator.DefaultComment) {
    const pr = await this.pr.findByNumber(number);

    if (!pr) return;

    await this.pr.comment(number, comment);
  }
}
