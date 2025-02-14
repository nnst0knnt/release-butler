import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { MissingEnvironmentVariableError } from '../shared';
import { Attacher } from './core/attacher';

const main = async () => {
  const number = Number(process.env.PR_NUMBER);
  const labels = (process.env.LABELS || '').split(',');
  const options = yargs(hideBin(process.argv))
    .option('lgtm', { type: 'boolean', default: false })
    .parseSync();

  if (isNaN(number) || (!labels.length && !options.lgtm)) {
    throw new MissingEnvironmentVariableError('PR_NUMBER, LABELS が指定されていません');
  }

  const attacher = new Attacher();

  await attacher.attach({ number, labels, lgtm: options.lgtm });

  console.log(
    JSON.stringify({
      success: true,
      message: '🎉 ラベルを追加しました',
      data: null
    })
  );
};

main();
