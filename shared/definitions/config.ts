import type { LabelConfig } from './label';
import type { ReleaseConfig } from './release';

/**
 * アプリケーションの設定
 */
export type AppConfig = {
  /** ラベルの設定 */
  label: LabelConfig;
  /** リリースの設定 */
  release: ReleaseConfig;
};
