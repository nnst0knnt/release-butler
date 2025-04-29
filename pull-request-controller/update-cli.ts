import { Updater } from './core';

const main = async () => {
  const updater = new Updater();

  const number = await updater.update();

  console.log(
    JSON.stringify({
      success: true,
      message: '🎉 プルリクエストを更新しました',
      data: {
        number: number ?? null
      }
    })
  );
};

main();
