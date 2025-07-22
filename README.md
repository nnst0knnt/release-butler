# Release Butler

## 概要

GitHubリポジトリのリリース管理を自動化します。

PRのラベリング、リリースPRの作成・更新、リリースノートの生成、バージョン管理などを自動化し、リリースプロセスを効率化します。

## 機能

- PRの自動ラベリング

  - ブランチ名やファイル変更に基づくラベルの自動付与
  - レビュー承認時のLGTMラベル付与
  - カスタマイズ可能なラベルルール
  - Githubへのラベルの同期

- リリース管理の自動化

  - リリースブランチへのマージを自動検知
  - リリースPRの自動作成・更新
  - マージされたPRの分類と一覧化
  - リリースノートの自動生成
  - セマンティックバージョニングの自動管理

- 柔軟な設定
  - 設定ファイルによるカスタマイズ
  - カテゴリ別のPR分類ルール
  - バージョンアップルールのカスタマイズ

## 技術スタック

- 🚀 TypeScript
- 🚀 Node.js
- 🚀 GitHub Actions

- 📦 @actions/github
- 📦 js-yaml

- 🛠️ ESLint
- 🛠️ Prettier
- 🛠️ Docker

## システム要件

- Node.js 20.0.0以上
- GitHub Actions対応のリポジトリ
- GitHub Personal Access Token（ローカルでラベル同期する際に使用）

## プロジェクト構成

```
.
├── label-controller/ # ラベル管理機能
│   ├── core/
│   │   ├── attacher.ts
│   │   ├── converter.ts
│   │   └── generator.ts
│   ├── attach-cli.ts
│   ├── generate-cli.ts
│   └── sync-cli.ts
├── pull-request-controller/ # PR管理機能
│   ├── core/
│   │   ├── commentator.ts
│   │   ├── creator.ts
│   │   └── updater.ts
│   ├── comment-cli.ts
│   ├── create-cli.ts
│   └── update-cli.ts
├── release-controller/ # リリース管理機能
│   ├── core/
│   │   ├── creator.ts
│   │   └── incrementor.ts
│   └── create-cli.ts
└── shared/ # 共有機能
    ├── definitions/
    ├── errors/
    └── utilities/
```

## 主要なコンポーネント

- `label-controller`：PRラベルの自動付与と管理
- `pull-request-controller`：リリースPRの作成と更新
- `release-controller`：リリースノート生成とバージョン管理
- `shared`：共通の型定義、ユーティリティ、エラーハンドリング
