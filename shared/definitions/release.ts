import { type IncrementLevels } from '../constants';

import type { PullRequest } from './pull-request';
import type { ReleasePullRequestFormats, ReleaseTitleVariables } from '../constants';

/**
 * リリースの設定
 */
export type ReleaseConfig = {
  /** ベースブランチ */
  base: string;
  /** ヘッドブランチ */
  head: string;
  /**
   * リリースのタイトル
   *
   * @see ReleaseTitleVariable
   */
  title: string;
  /** カテゴリ */
  categories: ReleaseCategory[];
  /** リリースのバージョン */
  version: {
    /**
     * ルール
     *
     * 指定したブランチにマージされたプルリクエストのブランチパターンによってインクリメントするバージョンを決定する
     * */
    rules: {
      /** メジャーバージョンアップのブランチパターン */
      major: string[];
      /** マイナーバージョンアップのブランチパターン */
      minor: string[];
      /** パッチバージョンアップのブランチパターン */
      patch: string[];
    };
    /** デフォルト設定 */
    defaults: {
      /** デフォルトのインクリメント方法 */
      increment: IncrementLevel;
    };
  };
};

/**
 * リリースの分類
 */
export type ReleaseCategory = {
  /** 分類名 */
  name: string;
  /** ルール */
  rules: string[];
};

/**
 * バージョン
 */
export type Version = {
  /** メジャーバージョン */
  major: number;
  /** マイナーバージョン */
  minor: number;
  /** パッチバージョン */
  patch: number;
};

/**
 * バージョンのインクリメント種別
 */
export type IncrementLevel = (typeof IncrementLevels)[keyof typeof IncrementLevels];

/**
 * リリースタイトルの変数
 */
export type ReleaseTitleVariable =
  (typeof ReleaseTitleVariables)[keyof typeof ReleaseTitleVariables];

/**
 * リリースするプルリクエストの表示形式
 */
export type ReleasePullRequestFormat =
  (typeof ReleasePullRequestFormats)[keyof typeof ReleasePullRequestFormats];

/**
 * リリースするプルリクエスト一覧の取得パラメータ
 */
export type GetReleasePullRequestParameters = {
  /** リリースされたプルリクエストの番号 */
  number?: number;
  /** 1ページあたりの取得件数 */
  perPage?: number;
};

/**
 * リリースの作成パラメータ
 */
export type CreateReleaseParameters = {
  /** バージョン */
  version: string;
  /** リリースタイトル */
  title: string;
  /** リリースノート */
  body: string;
  /** ベースブランチ */
  base: string;
};

/**
 * リリースノートの生成パラメータ
 */
export type GenerateReleaseNoteParameters = {
  /** プルリクエスト一覧 */
  prs: PullRequest[];
  /** 表示形式 */
  format: {
    pr: ReleasePullRequestFormat;
  };
};
