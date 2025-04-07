import { beforeEach, describe, expect, it, vi } from 'vitest';

import defaultConfig from '../../shared/mocks/config';
import { Config } from '../../shared/utilities/config';
import { GithubLabel } from '../../shared/utilities/label';

describe('Attacher', async () => {
  const { Attacher } = await import('./attacher');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('attach', () => {
    it('指定されたプルリクエストに単一のラベルを追加できること', async () => {
      const label = new GithubLabel();
      vi.spyOn(label, 'add').mockResolvedValue();

      await new Attacher({ label }).attach({
        number: 1,
        labels: ['test-label'],
        lgtm: false
      });

      expect(label.add).toHaveBeenCalledWith({
        number: 1,
        labels: ['test-label']
      });
    });

    it('指定されたプルリクエストに複数のラベルを追加できること', async () => {
      const label = new GithubLabel();
      vi.spyOn(label, 'add').mockResolvedValue();

      await new Attacher({ label }).attach({
        number: 1,
        labels: ['test-label-1', 'test-label-2'],
        lgtm: false
      });

      expect(label.add).toHaveBeenCalledWith({
        number: 1,
        labels: ['test-label-1', 'test-label-2']
      });
    });

    it('lgtmフラグがtrueの場合、LGTMラベルも追加されること', async () => {
      vi.spyOn(Config, 'load').mockReturnValue({
        ...defaultConfig,
        label: {
          ...defaultConfig.label,
          lgtm: {
            ...defaultConfig.label.lgtm!,
            name: 'LGTM+',
            icon: 'o'
          }
        }
      });
      const label = new GithubLabel();
      vi.spyOn(label, 'add').mockResolvedValue();

      await new Attacher({ label }).attach({
        number: 1,
        labels: ['test-label'],
        lgtm: true
      });

      expect(label.add).toHaveBeenCalledWith({
        number: 1,
        labels: ['test-label', 'o LGTM+']
      });
    });
  });
});
