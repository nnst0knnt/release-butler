import type { AppConfig } from '../definitions';
import type { RequiredDeep } from 'type-fest';

const config: RequiredDeep<AppConfig> = {
  label: {
    lgtm: { name: 'LGTM', description: 'Pull request approved', icon: '👍', color: '0E8A16' },
    categories: []
  },
  release: {
    base: 'main',
    head: 'release',
    title: 'Release',
    categories: [],
    version: {
      rules: {
        major: ['^major'],
        minor: ['^minor'],
        patch: ['^patch']
      },
      defaults: {
        increment: 'patch'
      }
    }
  }
};

export default config;
