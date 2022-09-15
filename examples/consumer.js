const RedisTaskStream = require("../index");
const redisTaskStream = new RedisTaskStream();

(async () => {
  await redisTaskStream.connect();
  await redisTaskStream.createGroup();

  while (true) {
    const items = await redisTaskStream.get("consumer1");
    items.forEach(async (item) => {
      console.log(`Fetched item:`, item.id);
      console.log("Message: ", item.message.data);
      const ack = await redisTaskStream.ack(item.id);
      console.log(`Acknowledged: ${ack}`);
    });
  }
})();
