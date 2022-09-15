const RedisTaskStream = require("../index");

(async () => {
  const redisTaskStream = new RedisTaskStream();
  await redisTaskStream.connect();

  setInterval(async () => {
    const now = new Date();
    const current = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    await redisTaskStream.add(current);
    console.log(`Created item ${current}`);
  }, 1000);
})();
