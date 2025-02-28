import type { PullRequestDirections, PullRequestSorts, PullRequestStates } from '../constants';

/**
 * プルリクエスト
 */
export type PullRequest = {
  /** 番号 */
  number: number;
  /** タイトル */
  title: string;
  /** 説明 */
  body: string;
  /** 付与されているラベル */
  labels: string[];
  /** ベースブランチ */
  base: string;
  /** ヘッドブランチ */
  head: string;
  /** コミットのSHA */
  sha: string;
  /** URL */
  url: string;
  /** マージ日時 */
  mergedAt: string | null;
  /** 作成者 */
  author: string | null;
};

/**
 * プルリクエストの状態
 */
export type PullRequestState = (typeof PullRequestStates)[keyof typeof PullRequestStates];

/**
 * プルリクエストのソート種別
 */
export type PullRequestSort = (typeof PullRequestSorts)[keyof typeof PullRequestSorts];

/**
 * プルリクエストの並び順
 */
export type PullRequestDirection =
  (typeof PullRequestDirections)[keyof typeof PullRequestDirections];

/**
 * プルリクエストの取得パラメータ
 */
export type FindPullRequestParameters = {
  /** ベースブランチ */
  base: string;
  /** ヘッドブランチ */
  head: string;
};

/**
 * プルリクエストの作成パラメータ
 */
export type CreatePullRequestParameters = {
  /** タイトル */
  title: string;
  /** 説明 */
  body: string;
  /** ベースブランチ */
  base: string;
  /** ヘッドブランチ */
  head: string;
};

/**
 * プルリクエストの更新パラメータ
 */
export type UpdatePullRequestParameters = {
  /** 番号 */
  number: number;
  /** タイトル */
  title?: string;
  /** 説明 */
  body?: string;
};
