import { Incrementor } from './incrementor';
import {
  Config,
  GithubRelease,
  ReleasePullRequestFormats,
  ReleaseTitleVariables
} from '../../shared';

import type { AppConfig } from '../../shared';

/**
 * リリースを作成するクラス
 */
export class Creator {
  private readonly config: AppConfig;
  private readonly release: GithubRelease;
  private readonly incrementor: Incrementor;

  /**
   * リリースのバージョンが存在しない場合のデフォルトバージョン文字
   */
  static readonly DefaultCurrentVersion = '🎉';

  constructor(args?: { config?: AppConfig; release?: GithubRelease; incrementor?: Incrementor }) {
    this.config = args?.config || Config.load();
    this.release = args?.release || new GithubRelease();
    this.incrementor = args?.incrementor || new Incrementor();
  }

  /**
   * リリースを作成する
   */
  async create(number: number) {
    const prs = await this.release.prs({ number });

    const { current, next } = await this.incrementor.increment(prs);

    const vCurrent = current ? Incrementor.stringify(current) : Creator.DefaultCurrentVersion;
    const vNext = Incrementor.stringify(next);

    await this.release.create({
      version: vNext,
      title: this.toTitle(vCurrent, vNext),
      body:
        prs.length > 0
          ? this.release.notes({ prs, format: { pr: ReleasePullRequestFormats.List } })
          : this.release.defaultNote(number),
      base: this.config.release.base
    });
  }

  /**
   * リリースタイトルを生成する
   */
  private toTitle(current: string, next: string) {
    return this.config.release.title
      .replace(ReleaseTitleVariables.PreviousVersion, current)
      .replace(ReleaseTitleVariables.ReleaseVersion, next);
  }
}
