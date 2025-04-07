import type { getOctokit } from '@actions/github';

/**
 * Octokit
 */
export type Octokit = ReturnType<typeof getOctokit>;

/**
 * Octokitのオプション
 */
export type OctokitOptions = {
  /** GitHubトークン */
  token: string;
  /** リポジトリオーナー */
  owner: string;
  /** リポジトリ名 */
  repository: string;
};

/**
 * Octokitで定義されたブランチ
 */
export type OctokitBranch = {
  /** ブランチ名 */
  ref: string;
  /** コミットのSHA */
  sha: string;
};

/**
 * Octokitで定義されたプルリクエスト
 */
export type OctokitPullRequest = {
  /** 番号 */
  number: number;
  /** タイトル */
  title: string;
  /** 説明 */
  body: string | null;
  /** 付与されているラベル */
  labels: (
    | string
    | {
        name: string;
      }
  )[];
  /** ベースブランチ */
  base: OctokitBranch;
  /** ヘッドブランチ */
  head: OctokitBranch;
  /** URL */
  html_url: string;
  /** マージ日時 */
  merged_at: string | null;
  /** 作成者 */
  user: {
    login: string;
  } | null;
};
