import { MissingEnvironmentVariableError } from '../shared';
import { Creator } from './core';

const main = async () => {
  const number = Number(process.env.PR_NUMBER);

  if (isNaN(number)) {
    throw new MissingEnvironmentVariableError('PR_NUMBER が指定されていません');
  }

  const creator = new Creator();

  await creator.create(number);

  console.log(
    JSON.stringify({
      success: true,
      message: '🎉 リリースを作成しました',
      data: null
    })
  );
};

main();
