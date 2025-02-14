/**
 * バージョンのインクリメント種別
 */
export const IncrementLevels = {
  /** メジャーバージョン */
  Major: 'major',
  /** マイナーバージョン */
  Minor: 'minor',
  /** パッチバージョン */
  Patch: 'patch'
} as const;

/**
 * リリースタイトルの変数
 */
export const ReleaseTitleVariables = {
  /** 前のバージョン */
  PreviousVersion: '${previous_version}',
  /** リリースするバージョン */
  ReleaseVersion: '${version}'
} as const;

/**
 * リリースするプルリクエストの表示形式
 */
export const ReleasePullRequestFormats = {
  /** チェックリスト形式 */
  Checklist: 'checklist',
  /** リスト形式 */
  List: 'list'
} as const;
