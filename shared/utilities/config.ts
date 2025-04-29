import * as fs from 'node:fs';
import * as path from 'node:path';
import { isAbsolute } from 'node:path';

import { configDotenv } from 'dotenv';
import * as yaml from 'js-yaml';

import defaultConfig from '../../release-butler.config';
import { MissingConfigFileError, MissingEnvironmentVariableError } from '../errors';

import type { AppConfig } from '../definitions';

export const Config = {
  /**
   * 基本の設定ファイルを読み込む
   */
  load: (toPath?: string) => load(toPath),
  /**
   * GitHubの設定情報を読み込む
   */
  Github: {
    load: () => {
      configDotenv();

      const { GITHUB_TOKEN } = process.env;

      if (!GITHUB_TOKEN) {
        throw new MissingEnvironmentVariableError(
          '\n\n🚫 .env に GITHUB_TOKEN が設定されていません\n'
        );
      }

      return {
        token: GITHUB_TOKEN
      };
    }
  }
} as const;

const load = (toPath?: string) => {
  if (!toPath) return defaultConfig;

  const formattedToPath = isAbsolute(toPath) ? toPath : path.join(process.cwd(), toPath);

  if (!fs.existsSync(formattedToPath)) {
    throw new MissingConfigFileError(`\n\n🚫 指定したパスに設定ファイルが存在しません`);
  }

  return merge(
    defaultConfig,
    yaml.load(fs.readFileSync(formattedToPath, 'utf8')) as Partial<AppConfig>
  ) as AppConfig;
};

const merge = (defaults: AppConfig, source: Partial<AppConfig>): AppConfig => {
  return {
    label: {
      lgtm: source.label?.lgtm ?? defaults.label.lgtm,
      categories: source.label?.categories ?? defaults.label.categories
    },
    release: {
      base: source.release?.base ?? defaults.release.base,
      head: source.release?.head ?? defaults.release.head,
      title: source.release?.title ?? defaults.release.title,
      categories: source.release?.categories ?? defaults.release.categories,
      version: {
        rules: {
          ...(source.release?.version?.rules ?? defaults.release.version.rules)
        },
        defaults: {
          ...(source.release?.version?.defaults ?? defaults.release.version.defaults)
        }
      }
    }
  };
};
