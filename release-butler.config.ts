import type { AppConfig } from './shared';

const config: AppConfig = {
  label: {
    lgtm: {
      name: 'LGTM',
      description: 'プルリクエストが承認されました',
      icon: '👍',
      color: '0E8A16'
    },
    categories: [
      {
        name: 'フロントエンド',
        description: 'フロントエンド関連の変更',
        icon: '🎨',
        color: 'DEEFF5',
        rules: [
          {
            any: [
              {
                'changed-files': [
                  {
                    'any-glob-to-any-file': [
                      'components/**/*',
                      'pages/**/*',
                      'styles/**/*',
                      'assets/**/*',
                      '*.css',
                      '*.scss',
                      '*.vue',
                      '*.tsx',
                      '*.jsx'
                    ]
                  }
                ]
              },
              {
                'head-branch': ['^frontend', 'front']
              }
            ]
          }
        ]
      },
      {
        name: 'バックエンド',
        description: 'バックエンド関連の変更',
        icon: '🛠️',
        color: '1e293b',
        rules: [
          {
            any: [
              {
                'changed-files': [
                  {
                    'any-glob-to-any-file': [
                      'api/**/*',
                      'models/**/*',
                      'services/**/*',
                      'middleware/**/*',
                      'controllers/**/*',
                      'routes/**/*'
                    ]
                  }
                ]
              },
              {
                'head-branch': ['^backend', 'api']
              }
            ]
          }
        ]
      },
      {
        name: 'インフラ',
        description: 'インフラストラクチャの変更',
        icon: '☁️',
        color: '9EE61B',
        rules: [
          {
            any: [
              {
                'changed-files': [
                  {
                    'any-glob-to-any-file': [
                      'docker/**/*',
                      'k8s/**/*',
                      'terraform/**/*',
                      'deployment/**/*',
                      'infra/**/*',
                      'env/**/*',
                      'nginx/**/*',
                      'config/**/*'
                    ]
                  }
                ]
              },
              {
                'head-branch': ['^infra', '^deploy']
              }
            ]
          }
        ]
      },
      {
        name: '設定変更',
        description: '設定ファイルの変更',
        icon: '⚙️',
        color: '525252',
        rules: [
          {
            'changed-files': [
              {
                'any-glob-to-any-file': [
                  '*.json',
                  '*.yaml',
                  '*.yml',
                  '.env.*',
                  '.gitignore',
                  '.eslintrc*',
                  '.prettier*',
                  'tsconfig.json',
                  '.env.example',
                  '*.config.js'
                ]
              }
            ]
          }
        ]
      },
      {
        name: 'ドキュメント',
        description: 'ドキュメントの変更や追加',
        icon: '📝',
        color: '0ea5e9',
        rules: [
          {
            any: [
              {
                'changed-files': [
                  {
                    'any-glob-to-any-file': [
                      'docs/**/*',
                      '*.md',
                      'README*',
                      'CHANGELOG*',
                      'documentation/**/*'
                    ]
                  }
                ]
              },
              {
                'head-branch': ['^docs', 'document']
              }
            ]
          }
        ]
      },
      {
        name: 'テスト',
        description: 'テストの追加や修正',
        icon: '✅',
        color: '6A9FFD',
        rules: [
          {
            any: [
              {
                'changed-files': [
                  {
                    'any-glob-to-any-file': [
                      'tests/**/*',
                      'test/**/*',
                      '**/*.test.*',
                      '**/*.spec.*',
                      'cypress/**/*',
                      'jest/**/*',
                      '__tests__/**/*',
                      'vitest/**/*',
                      'playwright/**/*'
                    ]
                  }
                ]
              },
              {
                'head-branch': ['^test']
              }
            ]
          }
        ]
      },
      {
        name: 'データベース',
        description: 'データベース関連の変更',
        icon: '💾',
        color: 'AB6581',
        rules: [
          {
            any: [
              {
                'changed-files': [
                  {
                    'any-glob-to-any-file': [
                      'db/**/*',
                      'migrations/**/*',
                      'schemas/**/*',
                      'prisma/**/*',
                      '*.sql'
                    ]
                  }
                ]
              },
              {
                'head-branch': ['^db', '^database']
              }
            ]
          }
        ]
      },
      {
        name: 'バグ修正',
        description: 'バグの修正',
        icon: '🐞',
        color: 'dc2626',
        rules: [
          {
            'head-branch': ['^fix', '^hotfix', '^bugfix', 'bug']
          }
        ]
      },
      {
        name: '機能追加',
        description: '新機能の追加',
        icon: '🌟',
        color: 'A3A711',
        rules: [
          {
            'head-branch': ['^feature', '^feat']
          }
        ]
      },
      {
        name: 'リファクタリング',
        description: 'コードのリファクタリング',
        icon: '♻️',
        color: 'ea580c',
        rules: [
          {
            any: [
              {
                'head-branch': ['^refactor']
              }
            ]
          }
        ]
      },
      {
        name: 'リリース',
        description: 'リリース関連の変更',
        icon: '🚀',
        color: '1012C5',
        rules: [
          {
            any: [
              {
                'base-branch': ['main', 'master', 'release']
              },
              {
                'head-branch': ['^release', '^staging']
              }
            ]
          }
        ]
      },
      {
        name: 'CI',
        description: 'CI/CD関連の変更',
        icon: '🤖',
        color: '059669',
        rules: [
          {
            'changed-files': [
              {
                'any-glob-to-any-file': [
                  '.github/**/*',
                  '.circleci/**/*',
                  '.gitlab-ci.yml',
                  'azure-pipelines.yml',
                  'jenkins/**/*',
                  '.travis.yml'
                ]
              }
            ]
          }
        ]
      },
      {
        name: 'パッケージ更新',
        description: 'パッケージの更新',
        icon: '📦',
        color: 'a21caf',
        rules: [
          {
            any: [
              {
                'changed-files': [
                  {
                    'any-glob-to-any-file': [
                      'package.json',
                      'package-lock.json',
                      'yarn.lock',
                      'pnpm-lock.yaml',
                      'Gemfile',
                      'Gemfile.lock',
                      'requirements.txt',
                      'poetry.lock',
                      'go.mod',
                      'go.sum',
                      '**/requirements.txt',
                      'composer.json',
                      'composer.lock'
                    ]
                  }
                ]
              },
              {
                'head-branch': ['^deps', '^dependency']
              }
            ]
          }
        ]
      }
    ]
  },
  release: {
    base: 'main',
    head: 'staging',
    title: '${previous_version} → ${version}',
    categories: [
      {
        name: '🌈 プロダクト強化',
        rules: ['^feature', '^feat', '^frontend', 'front']
      },
      {
        name: '⚡ システム改善',
        rules: ['^backend', 'api', '^db', '^database']
      },
      {
        name: '🛡️ 基盤整備',
        rules: ['^infra', '^deploy', '^ci', '^cd']
      },
      {
        name: '🎯 品質向上',
        rules: ['^fix', '^hotfix', '^bugfix', '^bug', '^test']
      },
      {
        name: '⚙️ 技術的改善',
        rules: ['^refactor', '^deps', '^dependency']
      },
      {
        name: '📘 ドキュメント整備',
        rules: ['^docs', 'document']
      },
      {
        name: '🔍 その他',
        rules: ['.*']
      }
    ],
    version: {
      rules: {
        major: ['^breaking/', '^major/', '^v\\d+\\.0\\.0$'],
        minor: ['^feature/', '^feat/', '^enhancement/'],
        patch: ['^fix/', '^bugfix/', '^hotfix/', '^patch/', '^refactor/', '^chore/']
      },
      defaults: {
        increment: 'patch'
      }
    }
  }
};

export default config;
