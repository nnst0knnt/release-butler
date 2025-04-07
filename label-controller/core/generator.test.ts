import { beforeEach, describe, expect, it, vi } from 'vitest';

import defaultConfig from '../../shared/mocks/config';
import { Config } from '../../shared/utilities/config';
import { GithubLabel } from '../../shared/utilities/label';

vi.spyOn(console, 'log').mockResolvedValue();

vi.spyOn(global, 'setTimeout').mockImplementation(
  (fn) => fn() as unknown as ReturnType<typeof setTimeout>
);

describe('Generator', async () => {
  const { Generator } = await import('./generator');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sync', () => {
    it('新規にラベルを作成できること', async () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        label: {
          categories: [
            {
              name: 'new-label',
              description: 'new-label description',
              icon: '🌟',
              color: '000000',
              rules: [
                {
                  'base-branch': ['main']
                }
              ]
            },
            {
              name: 'exists-label',
              description: 'exists-label description',
              icon: '🍕',
              color: '000000',
              rules: [
                {
                  'base-branch': ['pizza']
                }
              ]
            }
          ]
        }
      });
      const label = new GithubLabel();
      vi.spyOn(label, 'get').mockResolvedValue(['🍕 exists-label']);
      vi.spyOn(label, 'delete').mockResolvedValue([]);
      vi.spyOn(label, 'create').mockResolvedValue();

      await new Generator({ label }).sync();

      expect(label.create).toHaveBeenCalledWith({
        name: '🌟 new-label',
        description: 'new-label description',
        icon: '🌟',
        color: '000000',
        rules: [
          {
            'base-branch': ['main']
          }
        ]
      });
      expect(label.create).toHaveBeenCalledTimes(1);
      expect(label.delete).not.toHaveBeenCalled();
    });

    it('全ラベルを削除した後に設定ファイルに基づいて再作成できること', async () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        label: {
          categories: [
            {
              name: 'label-a',
              description: 'label-a description',
              icon: '🔥',
              color: '000000',
              rules: [
                {
                  'base-branch': ['main']
                }
              ]
            },
            {
              name: 'label-b',
              description: 'label-b description',
              icon: '🚑',
              color: '000000',
              rules: [
                {
                  'base-branch': ['main']
                }
              ]
            }
          ]
        }
      });
      const label = new GithubLabel();
      vi.spyOn(label, 'get').mockResolvedValue(['🚧 label-1', '📌 label-2']);
      vi.spyOn(label, 'delete').mockResolvedValueOnce(['📌 label-2']).mockResolvedValueOnce([]);
      vi.spyOn(label, 'create').mockResolvedValue();

      await new Generator({ label }).sync(true);

      expect(label.create).toHaveBeenCalledWith({
        name: '🔥 label-a',
        description: 'label-a description',
        icon: '🔥',
        color: '000000',
        rules: [
          {
            'base-branch': ['main']
          }
        ]
      });
      expect(label.create).toHaveBeenCalledWith({
        name: '🚑 label-b',
        description: 'label-b description',
        icon: '🚑',
        color: '000000',
        rules: [
          {
            'base-branch': ['main']
          }
        ]
      });
      expect(label.create).toHaveBeenCalledTimes(2);
      expect(label.delete).toHaveBeenCalledWith({
        name: '🚧 label-1',
        names: ['🚧 label-1', '📌 label-2']
      });
      expect(label.delete).toHaveBeenCalledWith({
        name: '📌 label-2',
        names: ['📌 label-2']
      });
      expect(label.delete).toHaveBeenCalledTimes(2);
    });
  });
});
