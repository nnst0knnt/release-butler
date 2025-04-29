/**
 * プルリクエストの状態
 */
export const PullRequestStates = {
  /** オープン状態 */
  Open: 'open',
  /** クロースド状態 */
  Closed: 'closed',
  /** 全て */
  All: 'all'
} as const;

/**
 * プルリクエストのソート種別
 */
export const PullRequestSorts = {
  /** 作成日時 */
  Created: 'created',
  /** 更新日時 */
  Updated: 'updated',
  /** コメント数 */
  Popularity: 'popularity',
  /** 1ヶ月以上オープンしているアクティビティのあるプルリクエストの作成日時 */
  LongRunning: 'long-running'
} as const;

/**
 * プルリクエストの並び順
 */
export const PullRequestDirections = {
  /** 昇順 */
  Ascending: 'asc',
  /** 降順 */
  Descending: 'desc'
} as const;
