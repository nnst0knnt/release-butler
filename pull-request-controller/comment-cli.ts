import { MissingEnvironmentVariableError } from '../shared';
import { Commentator } from './core';

const main = async () => {
  const number = Number(process.env.PR_NUMBER);
  const comment = process.env.COMMENT;

  if (isNaN(number)) {
    throw new MissingEnvironmentVariableError('PR_NUMBER が指定されていません');
  }

  const commentator = new Commentator();

  await commentator.add(number, comment);

  console.log(
    JSON.stringify({
      success: true,
      message: '🎉 コメントを追加しました',
      data: null
    })
  );
};

main();
