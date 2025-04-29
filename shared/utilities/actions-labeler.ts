import { LabelerMatchNames, LabelerRootNames } from '../constants';

import type { BaseRule, LabelCategory, RootRule } from '../definitions';

export const Labeler = {
  Branch: {
    /**
     * 指定されたカテゴリにマッチするか判定する
     */
    isMatched: (category: LabelCategory, base: string, head: string) =>
      category.rules.some((rule) => {
        if (!isRootRule(rule)) {
          return isBranchAnyMatch(rule, base, head);
        }

        if (isRootRule(rule) && rule.any) {
          return rule.any.some((rule) => isBranchAnyMatch(rule, base, head));
        }

        if (isRootRule(rule) && rule.all) {
          return rule.all.some((rule) => isBranchAllMatch(rule, base, head));
        }

        return false;
      })
  }
};

/**
 * ルートルールか判定する
 */
const isRootRule = (rule: RootRule | BaseRule): rule is RootRule => {
  return LabelerRootNames.Any in rule || LabelerRootNames.All in rule;
};

/**
 * ブランチルールのいずれかにマッチするか判定する
 */
const isBranchAnyMatch = (rule: BaseRule, base: string, head: string) => {
  let isMatch = false;

  if (LabelerMatchNames.BaseBranch in rule && rule[LabelerMatchNames.BaseBranch]) {
    isMatch = rule[LabelerMatchNames.BaseBranch]!.some((pattern) => new RegExp(pattern).test(base));
  }

  if (LabelerMatchNames.HeadBranch in rule && rule[LabelerMatchNames.HeadBranch] && !isMatch) {
    isMatch = rule[LabelerMatchNames.HeadBranch]!.some((pattern) => new RegExp(pattern).test(head));
  }

  return isMatch;
};

/**
 * ブランチルールのすべてにマッチするか判定する
 */
const isBranchAllMatch = (rule: BaseRule, base: string, head: string) => {
  return (
    LabelerMatchNames.BaseBranch in rule &&
    rule[LabelerMatchNames.BaseBranch]!.every((pattern) => new RegExp(pattern).test(base)) &&
    LabelerMatchNames.HeadBranch in rule &&
    rule[LabelerMatchNames.HeadBranch]!.every((pattern) => new RegExp(pattern).test(head))
  );
};
