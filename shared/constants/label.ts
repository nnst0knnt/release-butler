/**
 * パターンのマッチング戦略
 */
export const LabelerStrategyNames = {
  /**
   * いずれかのパターンが、いずれかのファイルに一致する場合にマッチ
   *
   * 例：パターン(*.js, *.ts)のいずれかがファイル(app.js, main.ts)のいずれかに一致
   */
  AnyGlobToAnyFile: 'any-glob-to-any-file',

  /**
   * いずれかのグロブパターンが、全てのファイルに一致する場合にマッチ
   *
   * 例：パターン(*.js, *.ts)のいずれかがファイル(app.js, util.js)の全てに一致
   */
  AnyGlobToAllFiles: 'any-glob-to-all-files',

  /**
   * 全てのグロブパターンが、いずれかのファイルに一致する場合にマッチ
   *
   * 例：パターン(*.js, src/*.ts)の全てがファイル(app.js, src/main.ts)のいずれかに一致
   */
  AllGlobsToAnyFile: 'all-globs-to-any-file',

  /**
   * 全てのグロブパターンが、全てのファイルに一致する場合にマッチ
   *
   * 例：パターン(*.js)の全てがファイル(app.js, util.js)の全てに一致
   */
  AllGlobsToAllFiles: 'all-globs-to-all-files'
} as const;

/**
 * マッチング対象となるファイルやブランチの種類
 */
export const LabelerMatchNames = {
  /** 変更されたファイル */
  ChangedFiles: 'changed-files',
  /** プルリクエストのヘッドブランチ名 */
  HeadBranch: 'head-branch',
  /** プルリクエストのベースブランチ名 */
  BaseBranch: 'base-branch'
} as const;

/**
 * 最上位キーの種類
 */
export const LabelerRootNames = {
  Any: 'any',
  All: 'all'
} as const;
