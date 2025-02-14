import { describe, expect, it } from 'vitest';

import { toAppPullRequest } from './formatter';

describe('toAppPullRequest', () => {
  it('Octokitのプルリクエストをアプリケーション用に変換できること', () => {
    const pr = toAppPullRequest({
      number: 1,
      title: 'Successful pr title',
      body: 'Successful pr body',
      labels: [{ name: 'successful-label' }],
      base: { ref: 'successful-base-ref', sha: 'successful-base-sha' },
      head: { ref: 'successful-head-ref', sha: 'successful-head-sha' },
      html_url: 'https://github.com/test/repo/pull/1',
      merged_at: '2024-02-22T00:00:00Z',
      user: { login: 'successful-user' }
    });

    expect(pr).toEqual({
      number: 1,
      title: 'Successful pr title',
      body: 'Successful pr body',
      labels: ['successful-label'],
      base: 'successful-base-ref',
      head: 'successful-head-ref',
      sha: 'successful-head-sha',
      url: 'https://github.com/test/repo/pull/1',
      mergedAt: '2024-02-22T00:00:00Z',
      author: 'successful-user'
    });
  });

  it('ラベルが文字列で渡された場合、正しく変換できること', () => {
    const pr = toAppPullRequest({
      number: 1,
      title: 'String label pr title',
      body: 'String label pr body',
      labels: ['string-label'],
      base: { ref: 'string-base-ref', sha: 'string-base-sha' },
      head: { ref: 'string-head-ref', sha: 'string-head-sha' },
      html_url: 'https://github.com/test/repo/pull/1',
      merged_at: null,
      user: { login: 'string-user' }
    });

    expect(pr).toEqual({
      number: 1,
      title: 'String label pr title',
      body: 'String label pr body',
      labels: ['string-label'],
      base: 'string-base-ref',
      head: 'string-head-ref',
      sha: 'string-head-sha',
      url: 'https://github.com/test/repo/pull/1',
      mergedAt: null,
      author: 'string-user'
    });
  });

  it('オプショナルなフィールドがnullの場合、正しく変換できること', () => {
    const pr = toAppPullRequest({
      number: 1,
      title: 'Optional pr title',
      body: null,
      labels: [],
      base: { ref: 'optional-base-ref', sha: 'optional-base-sha' },
      head: { ref: 'optional-head-ref', sha: 'optional-head-sha' },
      html_url: 'https://github.com/test/repo/pull/1',
      merged_at: null,
      user: null
    });

    expect(pr).toEqual({
      number: 1,
      title: 'Optional pr title',
      body: '',
      labels: [],
      base: 'optional-base-ref',
      head: 'optional-head-ref',
      sha: 'optional-head-sha',
      url: 'https://github.com/test/repo/pull/1',
      mergedAt: null,
      author: null
    });
  });
});
