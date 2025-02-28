import type { OctokitPullRequest } from '../definitions';

/**
 * Octokitのプルリクエストをアプリケーション用のプルリクエストに変換する
 */
export const toAppPullRequest = (pr: OctokitPullRequest) => ({
  number: pr.number,
  title: pr.title,
  body: pr.body ?? '',
  labels: pr.labels.map((label) => (typeof label === 'string' ? label : label.name)),
  base: pr.base.ref,
  head: pr.head.ref,
  sha: pr.head.sha,
  url: pr.html_url,
  mergedAt: pr.merged_at ?? null,
  author: pr.user?.login ?? null
});
