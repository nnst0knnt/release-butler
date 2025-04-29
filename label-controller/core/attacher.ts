import { Config, GithubLabel } from '../../shared';

import type { AppConfig } from '../../shared';

/**
 * 指定されたラベルを追加する
 */
export class Attacher {
  private readonly config: AppConfig;
  private readonly label: GithubLabel;

  constructor(args?: { config?: AppConfig; label?: GithubLabel }) {
    this.config = args?.config || Config.load();
    this.label = args?.label || new GithubLabel();
  }

  /**
   * 指定したプルリクエストにラベルを追加する
   */
  async attach(args: { number: number; labels: string[]; lgtm: boolean }) {
    await this.label.add({
      number: args.number,
      labels: [
        ...args.labels,
        ...(args.lgtm && this.config.label.lgtm ? [GithubLabel.format(this.config.label.lgtm)] : [])
      ]
    });
  }
}
