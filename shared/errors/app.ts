/**
 * アプリケーション用の基本エラー
 */
export class ReleaseButlerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReleaseButlerError';
  }
}

/**
 * 環境変数が設定されていない場合のエラー
 */
export class MissingEnvironmentVariableError extends ReleaseButlerError {
  constructor(message: string) {
    super(message);
    this.name = 'MissingEnvironmentVariableError';
  }
}

/**
 * 指定したパスに設定ファイルがない場合のエラー
 */
export class MissingConfigFileError extends ReleaseButlerError {
  constructor(message: string) {
    super(message);
    this.name = 'MissingConfigFileError';
  }
}

/**
 * 不正なバージョンのインクリメント種別のエラー
 */
export class InvalidIncrementLevelError extends ReleaseButlerError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidIncrementLevelError';
  }
}

/**
 * 不正なバージョン形式のエラー
 */
export class InvalidVersionFormatError extends ReleaseButlerError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidVersionFormatError';
  }
}

/**
 * 不正なフォーマットのエラー
 */
export class InvalidFormatError extends ReleaseButlerError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidFormatError';
  }
}
