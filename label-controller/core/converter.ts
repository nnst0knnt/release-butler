import * as yaml from 'js-yaml';

import { Config, GithubLabel, type AppConfig } from '../../shared';

/**
 * 設定ファイルから各アプリケーション用の設定に変換する
 */
export class Converter {
  private readonly config: AppConfig;

  constructor(args?: { config?: AppConfig }) {
    this.config = args?.config || Config.load();
  }

  /**
   * ラベル同期用のデータに変換する
   */
  toCategories() {
    return [
      ...this.config.label.categories.map((category) => {
        return {
          ...category,
          name: GithubLabel.format(category)
        };
      }),
      ...(this.config.label.lgtm
        ? [
            {
              ...this.config.label.lgtm,
              name: GithubLabel.format(this.config.label.lgtm)
            }
          ]
        : [])
    ];
  }

  /**
   * actions/labeler用のデータに変換する
   *
   * @see https://github.com/actions/labeler
   */
  toYaml() {
    return yaml.dump(
      this.config.label.categories.reduce(
        (data, category) => {
          const labelName = `${category.icon} ${category.name}`;

          data[labelName] = category.rules;

          return data;
        },
        {} as Record<string, unknown>
      )
    );
  }
}
