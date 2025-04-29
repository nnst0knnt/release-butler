import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GithubError } from '../errors/github';
import { github } from '../mocks/github';

vi.mock('@actions/github', () => github);

describe('GithubLabel', async () => {
  const { GithubLabel } = await import('./label');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('get', () => {
    it('ラベル名一覧を取得できること', async () => {
      github.octokit.rest.issues.listLabelsForRepo.mockResolvedValue({
        data: [{ name: 'test-label-1' }, { name: 'test-label-2' }, { name: 'test-label-3' }]
      });

      const labels = await new GithubLabel().get();

      expect(labels).toStrictEqual(['test-label-1', 'test-label-2', 'test-label-3']);
    });

    it('ラベル一覧の取得に失敗した場合、GithubErrorを投げること', async () => {
      github.octokit.rest.issues.listLabelsForRepo.mockRejectedValue(new Error());

      await expect(new GithubLabel().get()).rejects.toThrow(GithubError);
    });
  });

  describe('create', () => {
    it('新しいラベルを作成できること', async () => {
      github.octokit.rest.issues.createLabel.mockResolvedValue({});

      await new GithubLabel().create({
        name: 'test-label',
        description: 'test-description',
        color: 'test-color'
      });

      expect(github.octokit.rest.issues.createLabel).toHaveBeenCalledWith({
        ...github.context.repo,
        name: 'test-label',
        description: 'test-description',
        color: 'test-color'
      });
    });

    it('ラベルの作成に失敗した場合、GithubErrorを投げること', async () => {
      github.octokit.rest.issues.createLabel.mockRejectedValue(new Error());

      await expect(
        new GithubLabel().create({
          name: 'test-label',
          description: 'test-description',
          color: 'test-color'
        })
      ).rejects.toThrow(GithubError);
      expect(github.octokit.rest.issues.createLabel).toHaveBeenCalledWith({
        ...github.context.repo,
        name: 'test-label',
        description: 'test-description',
        color: 'test-color'
      });
    });
  });

  describe('update', () => {
    it('指定したラベルを更新できること', async () => {
      github.octokit.rest.issues.updateLabel.mockResolvedValue({});

      await new GithubLabel().update({
        name: 'update-label',
        description: 'update-description',
        color: 'update-color'
      });

      expect(github.octokit.rest.issues.updateLabel).toHaveBeenCalledWith({
        ...github.context.repo,
        name: 'update-label',
        description: 'update-description',
        color: 'update-color'
      });
    });

    it('ラベルの更新に失敗した場合、GithubErrorを投げること', async () => {
      github.octokit.rest.issues.updateLabel.mockRejectedValue(new Error());

      await expect(
        new GithubLabel().update({
          name: 'update-label',
          description: 'update-description',
          color: 'update-color'
        })
      ).rejects.toThrow(GithubError);
      expect(github.octokit.rest.issues.updateLabel).toHaveBeenCalledWith({
        ...github.context.repo,
        name: 'update-label',
        description: 'update-description',
        color: 'update-color'
      });
    });
  });

  describe('delete', () => {
    it('存在するラベルを削除できること', async () => {
      github.octokit.rest.issues.deleteLabel.mockResolvedValue({});

      const labels = await new GithubLabel().delete({
        name: 'delete-label',
        names: ['delete-label', 'fake-label-1', 'fake-label-2']
      });

      expect(github.octokit.rest.issues.deleteLabel).toHaveBeenCalledWith({
        ...github.context.repo,
        name: 'delete-label'
      });
      expect(labels).toStrictEqual(['fake-label-1', 'fake-label-2']);
    });

    it('namesに存在しないラベルの場合、そのままnamesを返すこと', async () => {
      github.octokit.rest.issues.deleteLabel.mockRejectedValue({});

      const labels = await new GithubLabel().delete({
        name: 'not-exists-label',
        names: ['fake-label-1', 'fake-label-2', 'fake-label-3']
      });

      expect(github.octokit.rest.issues.deleteLabel).not.toHaveBeenCalled();
      expect(labels).toStrictEqual(['fake-label-1', 'fake-label-2', 'fake-label-3']);
    });

    it('API実行時に対象のラベルが存在しない場合、指定されたラベル以外のnamesを返すこと', async () => {
      github.octokit.rest.issues.deleteLabel.mockRejectedValue(
        Object.assign(new Error(), { status: 404 })
      );

      const labels = await new GithubLabel().delete({
        name: 'not-exists-label',
        names: ['not-exists-label', 'fake-label-1', 'fake-label-2', 'fake-label-3']
      });

      expect(github.octokit.rest.issues.deleteLabel).toHaveBeenCalledWith({
        ...github.context.repo,
        name: 'not-exists-label'
      });
      expect(labels).toStrictEqual(['fake-label-1', 'fake-label-2', 'fake-label-3']);
    });

    it('ラベルの削除に失敗した場合、GithubErrorを投げること', async () => {
      github.octokit.rest.issues.deleteLabel.mockRejectedValue(new Error());

      await expect(
        new GithubLabel().delete({
          name: 'delete-label',
          names: ['delete-label', 'fake-label-1', 'fake-label-2']
        })
      ).rejects.toThrow(GithubError);
      expect(github.octokit.rest.issues.deleteLabel).toHaveBeenCalledWith({
        ...github.context.repo,
        name: 'delete-label'
      });
    });
  });

  describe('add', () => {
    it('プルリクエストに単一のラベルを追加できること', async () => {
      github.octokit.rest.issues.addLabels.mockResolvedValue({});

      await new GithubLabel().add({
        number: 1,
        labels: 'test-label'
      });

      expect(github.octokit.rest.issues.addLabels).toHaveBeenCalledWith({
        ...github.context.repo,
        issue_number: 1,
        labels: ['test-label']
      });
    });

    it('プルリクエストに複数のラベルを追加できること', async () => {
      github.octokit.rest.issues.addLabels.mockResolvedValue({});

      await new GithubLabel().add({
        number: 1,
        labels: ['test-label-1', 'test-label-2']
      });

      expect(github.octokit.rest.issues.addLabels).toHaveBeenCalledWith({
        ...github.context.repo,
        issue_number: 1,
        labels: ['test-label-1', 'test-label-2']
      });
    });

    it('ラベルの追加に失敗した場合、GithubErrorを投げること', async () => {
      github.octokit.rest.issues.addLabels.mockRejectedValue(new Error());

      await expect(
        new GithubLabel().add({
          number: 1,
          labels: ['test-label-1', 'test-label-2']
        })
      ).rejects.toThrow(GithubError);
      expect(github.octokit.rest.issues.addLabels).toHaveBeenCalledWith({
        ...github.context.repo,
        issue_number: 1,
        labels: ['test-label-1', 'test-label-2']
      });
    });
  });

  describe('format', () => {
    it('アイコン付きラベルにフォーマットできること', () => {
      const label = GithubLabel.format({
        name: 'test-label',
        icon: 'x',
        description: 'test-description',
        color: 'test-color'
      });

      expect(label).toStrictEqual('x test-label');
    });
  });
});
