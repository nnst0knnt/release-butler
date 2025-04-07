import { RequestError } from '@octokit/request-error';

/**
 * GitHub API実行時のエラー
 */
export class GithubError extends Error {
  status: number;

  public constructor(summary: string, status: number, e?: unknown) {
    const message = `${summary} 👉 ${GithubError.message(status)}`;
    super(message, { cause: e });

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = 'GithubError';
    this.status = status;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GithubError);
    }
  }

  private static message(status: number) {
    switch (status) {
      case this.status.Unauthorized:
        return 'トークンの認証に失敗しました';
      case this.status.Forbidden:
        return 'アクセス権限がありません';
      case this.status.NotFound:
        return 'リソースが見つかりません';
      case this.status.UnprocessableEntity:
        return 'リクエスト内容が不正です';
      default:
        return '通信中にエラーが発生しました';
    }
  }

  static build(summary = 'Github Rest API 実行時にエラーが発生しました', e?: unknown) {
    if (e instanceof RequestError && e.status) {
      return new GithubError(summary, e.status);
    }

    return new GithubError(summary, 500, e);
  }

  static isNotFound(e: unknown) {
    return e instanceof Error && 'status' in e && e.status === this.status.NotFound;
  }

  private static get status() {
    return {
      Unauthorized: 401,
      Forbidden: 403,
      NotFound: 404,
      UnprocessableEntity: 422
    };
  }
}
