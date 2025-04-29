import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { Generator } from './core/generator';

const main = async () => {
  const options = yargs(hideBin(process.argv))
    .option('replace-all', { type: 'boolean', default: false })
    .parseSync();

  const generator = new Generator();

  await generator.sync(options.replaceAll);

  console.log(
    JSON.stringify({
      success: true,
      message: '🎉 ラベルを同期しました',
      data: null
    })
  );
};

main();
