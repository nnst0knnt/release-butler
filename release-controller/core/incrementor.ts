import {
  IncrementLevels,
  InvalidIncrementLevelError,
  InvalidVersionFormatError,
  GithubRelease,
  Config
} from '../../shared';

import type { Version, AppConfig, PullRequest } from '../../shared';

/**
 * バージョンのインクリメントを行うクラス
 */
export class Incrementor {
  private readonly config: AppConfig;
  private readonly release: GithubRelease;

  constructor(args?: { config?: AppConfig; release?: GithubRelease }) {
    this.config = args?.config || Config.load();
    this.release = args?.release || new GithubRelease();
  }

  /**
   * バージョンをインクリメントする
   */
  async increment(prs: PullRequest[]) {
    const current = await this.current();

    if (current === null) {
      return {
        current: null,
        next: this.defaultVersion
      };
    }

    const level = this.level(prs.map(({ head }) => head));
    const next = { ...current };

    switch (level) {
      case IncrementLevels.Major:
        next.major += 1;
        next.minor = 0;
        next.patch = 0;

        break;
      case IncrementLevels.Minor:
        next.minor += 1;
        next.patch = 0;

        break;
      case IncrementLevels.Patch:
        next.patch += 1;

        break;
      default:
        throw new InvalidIncrementLevelError('不正なインクリメントタイプです');
    }

    return {
      current,
      next
    };
  }

  /**
   * バージョン文字列をパースする
   */
  static parse(version: string) {
    const match = version.match(/^v?(\d+)\.(\d+)\.(\d+)$/);

    if (!match || match[1] === undefined || match[2] === undefined || match[3] === undefined) {
      throw new InvalidVersionFormatError('不正なバージョン形式です');
    }

    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10)
    };
  }

  /**
   * バージョンを文字列に変換する
   */
  static stringify(version: Version) {
    return `v${version.major}.${version.minor}.${version.patch}`;
  }

  /**
   * デフォルトのバージョン
   */
  get defaultVersion() {
    return {
      major: 1,
      minor: 0,
      patch: 0
    };
  }

  /**
   * 現在のバージョンを取得する
   */
  private async current() {
    const version = await this.release.current();

    if (version === null) return null;

    return Incrementor.parse(version);
  }

  /**
   * リリースするブランチ名の一覧からインクリメント種別を判別する
   */
  private level(branchNames: string[]) {
    const { rules } = this.config.release.version;

    if (
      branchNames.some((branchName) =>
        rules.major.some((rule) => new RegExp(rule).test(branchName))
      )
    ) {
      return IncrementLevels.Major;
    }

    if (
      branchNames.some((branchName) =>
        rules.minor.some((rule) => new RegExp(rule).test(branchName))
      )
    ) {
      return IncrementLevels.Minor;
    }

    if (
      branchNames.some((branchName) =>
        rules.patch.some((rule) => new RegExp(rule).test(branchName))
      )
    ) {
      return IncrementLevels.Patch;
    }

    return this.config.release.version.defaults.increment;
  }
}
