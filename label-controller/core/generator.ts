import { Converter } from './converter';
import { GithubLabel } from '../../shared';

/**
 * 設定ファイルからラベルを生成する
 */
export class Generator {
  private names: string[];
  private readonly converter: Converter;
  private readonly label: GithubLabel;

  constructor(args?: { names?: string[]; converter?: Converter; label?: GithubLabel }) {
    this.names = args?.names || [];
    this.converter = args?.converter || new Converter();
    this.label = args?.label || new GithubLabel();
  }

  /**
   * 設定に基づいてラベルを同期する
   */
  async sync(replaceAll = false) {
    this.names = await this.label.get();

    if (replaceAll) {
      await this.clear();
    }

    await this.upsert();
  }

  /**
   * 全てのラベルを削除する
   */
  private async clear() {
    for (const name of this.names) {
      this.names = await this.label.delete({ name, names: this.names });

      console.log(`🗑️ ${name} を削除しました`);

      await this.wait();
    }
  }

  /**
   * 設定に基づいてラベルを同期する
   */
  private async upsert() {
    const categories = this.converter.toCategories();

    for (const category of Object.values(categories)) {
      if (this.names.includes(category.name)) continue;

      await this.label.create(category);

      console.log(`✨ ${category.name} を作成しました`);

      await this.wait();
    }
  }

  /**
   * API呼び出しの間隔を開ける
   */
  private async wait() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
