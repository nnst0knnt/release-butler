import type { LabelerMatchNames, LabelerRootNames, LabelerStrategyNames } from '../constants';

/**
 * ラベルの設定
 */
export type LabelConfig = {
  /** ラベルの分類 */
  categories: LabelCategory[];
  /** LGTMラベル用 */
  lgtm?: Omit<LabelCategory, 'rules'> | undefined;
};

/**
 * ラベルの分類
 */
export type LabelCategory = {
  /** 分類名 */
  name: string;
  /** 分類の説明 */
  description: string;
  /** アイコン */
  icon: string;
  /** ラベルの色（16進数） */
  color: string;
  /**
   * ルール
   *
   * @see https://github.com/actions/labeler
   */
  rules: (RootRule | BaseRule)[];
};

/**
 * ファイルパターン
 */
type FilePattern = string;

/**
 * ブランチパターン
 */
type BranchPattern = string;

/**
 * ファイルパターン
 */
type FileMatchStrategy = {
  /** いずれかのパターンがいずれかのファイルに一致 */
  [LabelerStrategyNames.AnyGlobToAnyFile]?: FilePattern[];
  /** いずれかのパターンが全てのファイルに一致 */
  [LabelerStrategyNames.AnyGlobToAllFiles]?: FilePattern[];
  /** 全てのパターンがいずれかのファイルに一致 */
  [LabelerStrategyNames.AllGlobsToAnyFile]?: FilePattern[];
  /** 全てのパターンが全てのファイルに一致 */
  [LabelerStrategyNames.AllGlobsToAllFiles]?: FilePattern[];
};

/**
 * 変更ファイルによる判定ルール
 */
type FileMatch = {
  /** 変更されたファイルのパターン */
  [LabelerMatchNames.ChangedFiles]?: FileMatchStrategy[];
};

/**
 * ブランチパターンによる判定ルール
 */
type BranchMatch = {
  /** ベースブランチのパターン */
  [LabelerMatchNames.BaseBranch]?: BranchPattern[];
  /** ヘッドブランチのパターン */
  [LabelerMatchNames.HeadBranch]?: BranchPattern[];
};

/**
 * 基本ルール
 */
export type BaseRule = FileMatch | BranchMatch;

/**
 * ルートルール
 */
export type RootRule = {
  /** いずれかのルールに一致 */
  [LabelerRootNames.Any]?: BaseRule[];
  /** 全てのルールに一致 */
  [LabelerRootNames.All]?: BaseRule[];
};

/**
 * ラベル一覧の取得パラメータ
 */
export type GetLabelParameters = {
  /** 1ページあたりの取得件数 */
  perPage?: number;
};

/**
 * ラベルの作成パラメータ
 */
export type CreateLabelParameters = {
  /** ラベル名 */
  name: string;
  /** ラベルの説明 */
  description: string;
  /** ラベルの色（16進数） */
  color: string;
};

/**
 * ラベルの更新パラメータ
 */
export type UpdateLabelParameters = {
  /** ラベル名 */
  name: string;
  /** ラベルの説明 */
  description: string;
  /** ラベルの色（16進数） */
  color: string;
};

/**
 * ラベルの削除パラメータ
 */
export type DeleteLabelParameters = {
  /** ラベル名 */
  name: string;
  /** 既存のラベル名一覧 */
  names: string[];
};

/**
 * プルリクエストへのラベル追加パラメータ
 */
export type AddLabelParameters = {
  /** プルリクエスト番号 */
  number: number;
  /** 追加するラベル名 */
  labels: string[] | string;
};
