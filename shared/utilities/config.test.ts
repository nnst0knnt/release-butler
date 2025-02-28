import fs from 'node:fs';
import path from 'node:path';

import { configDotenv } from 'dotenv';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MissingConfigFileError, MissingEnvironmentVariableError } from '../errors';
import defaultConfig from '../mocks/config';

vi.mock('node:fs');

vi.mock('node:path');

vi.mock('dotenv');

describe('Config', async () => {
  const { Config } = await import('./config');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('load', () => {
    it('設定ファイルのパスが指定されていない場合、デフォルトの設定を返すこと', () => {
      vi.mock('../../release-butler.config.ts', async (factory) => {
        return {
          ...(await factory()),
          default: defaultConfig
        };
      });

      const config = Config.load();

      expect(config).toEqual(defaultConfig);
    });

    it('相対パスで指定されたアプリケーションの設定ファイルを読み込むこと', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          label: { categories: [{ name: 'test' }] }
        })
      );
      vi.mocked(path.isAbsolute).mockReturnValue(false);
      vi.mocked(path.join).mockReturnValue('/release-butler/config.yml');
      vi.spyOn(process, 'cwd').mockReturnValue('/release-butler');

      const config = Config.load('config.yml');

      expect(path.join).toHaveBeenCalledWith('/release-butler', 'config.yml');
      expect(fs.readFileSync).toHaveBeenCalledWith('/release-butler/config.yml', 'utf8');
      expect(config).toEqual({
        ...defaultConfig,
        label: { ...defaultConfig.label, categories: [{ name: 'test' }] }
      });
    });

    it('指定したパスに設定ファイルが存在しない場合、MissingConfigFileErrorを投げること', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      expect(() => Config.load('invalid/path')).toThrow(MissingConfigFileError);
    });
  });

  describe('Github.load', () => {
    it('GITHUB_TOKENが設定されている場合、トークンを返すこと', () => {
      vi.mocked(configDotenv).mockReturnValue({});
      process.env.GITHUB_TOKEN = 'test-token';

      const config = Config.Github.load();

      expect(config).toEqual({ token: 'test-token' });
    });

    it('GITHUB_TOKENが設定されていない場合、MissingEnvironmentVariableErrorを投げること', () => {
      vi.mocked(configDotenv).mockReturnValue({});
      delete process.env.GITHUB_TOKEN;

      expect(() => Config.Github.load()).toThrow(MissingEnvironmentVariableError);
    });
  });
});
