import * as github from '@actions/github';

import { Config } from './config';
import { GithubError } from '../errors/github';

import type {
  AddLabelParameters,
  CreateLabelParameters,
  DeleteLabelParameters,
  GetLabelParameters,
  LabelCategory,
  Octokit,
  UpdateLabelParameters
} from '../definitions';

/**
 * ラベルを操作するクラス
 */
export class GithubLabel {
  private readonly octokit: Octokit;

  constructor(args?: { octokit?: Octokit }) {
    this.octokit = args?.octokit || github.getOctokit(Config.Github.load().token);
  }

  /**
   * ラベル一覧を取得する
   */
  async get({ perPage = 100 }: GetLabelParameters = {}) {
    try {
      const { data: labels } = await this.octokit.rest.issues.listLabelsForRepo({
        ...github.context.repo,
        per_page: perPage
      });

      return labels.map((label) => label.name);
    } catch (e) {
      throw GithubError.build('ラベルの取得に失敗', e);
    }
  }

  /**
   * ラベルを作成する
   */
  async create({ name, description, color }: CreateLabelParameters) {
    try {
      await this.octokit.rest.issues.createLabel({
        ...github.context.repo,
        name,
        description,
        color
      });
    } catch (e) {
      throw GithubError.build('ラベルの作成に失敗', e);
    }
  }

  /**
   * ラベルを更新する
   */
  async update({ name, description, color }: UpdateLabelParameters) {
    try {
      await this.octokit.rest.issues.updateLabel({
        ...github.context.repo,
        name,
        description,
        color
      });
    } catch (e) {
      throw GithubError.build(`${name}の更新に失敗`, e);
    }
  }

  /**
   * ラベルを削除する
   */
  async delete({ name, names }: DeleteLabelParameters) {
    try {
      if (!names.includes(name)) return names;

      await this.octokit.rest.issues.deleteLabel({
        ...github.context.repo,
        name
      });

      return names.filter((_name) => _name !== name);
    } catch (e) {
      if (!GithubError.isNotFound(e)) {
        throw GithubError.build(`${name} の削除に失敗`, e);
      }

      return names.filter((_name) => _name !== name);
    }
  }

  /**
   * プルリクエストにラベルを追加する
   */
  async add({ number, labels }: AddLabelParameters) {
    try {
      await this.octokit.rest.issues.addLabels({
        ...github.context.repo,
        issue_number: number,
        labels: Array.isArray(labels) ? labels : [labels]
      });
    } catch (e) {
      throw GithubError.build('ラベルの追加に失敗', e);
    }
  }

  /**
   * ラベルをフォーマットする
   */
  static format(category: Omit<LabelCategory, 'rules'>) {
    return `${category.icon} ${category.name}`;
  }
}
