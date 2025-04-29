import { vi } from 'vitest';

import type { Octokit } from '../definitions';
import type * as Github from '@actions/github';
import type { PartialDeep } from 'type-fest';
import type { Mock } from 'vitest';

const context = {
  repo: {
    owner: 'test-owner',
    repo: 'test-repo'
  }
} satisfies PartialDeep<typeof Github.context>;

type MockedIssues = Record<keyof Octokit['rest']['issues'], Mock>;
type MockedPulls = Record<keyof Octokit['rest']['pulls'], Mock>;
type MockedGit = Record<keyof Octokit['rest']['git'], Mock>;
type MockedRepos = Record<keyof Octokit['rest']['repos'], Mock>;
const getOctokit = vi.fn().mockReturnValue({
  rest: {
    issues: {
      listLabelsForRepo: vi.fn(),
      createLabel: vi.fn(),
      updateLabel: vi.fn(),
      deleteLabel: vi.fn(),
      addLabels: vi.fn(),
      createComment: vi.fn()
    },
    pulls: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    },
    git: {
      getRef: vi.fn(),
      createRef: vi.fn()
    },
    repos: {
      listReleases: vi.fn(),
      createRelease: vi.fn(),
      compareCommits: vi.fn()
    }
  } satisfies PartialDeep<
    Record<keyof Octokit['rest'], MockedIssues | MockedPulls | MockedGit | MockedRepos>
  >
});

type MockedOctokit = {
  rest: {
    issues: MockedIssues;
    pulls: MockedPulls;
    git: MockedGit;
    repos: MockedRepos;
  };
};
const octokit = getOctokit('fake-token') as MockedOctokit;

export const github = {
  getOctokit,
  octokit,
  context
} as const;
