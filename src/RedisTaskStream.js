const redis = require("redis");

class RedisTaskStream {
  constructor(options) {
    const defaultConfig = {
      socket: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || "127.0.0.1",
      },
      password: process.env.REDIS_PASSWORD || "",
    };
    const config = options
      ? Object.assign({}, defaultConfig, options)
      : defaultConfig;
    this.redisClient = redis.createClient(config);
    this.connect();
    this.stream = "main:stream";
    this.group = "g";
  }

  async connect() {
    if (this.redisClient.isReady || this.redisClient.isOpen) return;
    this.redisClient.connect();
  }

  async createGroup(groupname = this.group) {
    this.group = groupname;
    let res = false;
    try {
      await this.redisClient.xGroupCreate(this.stream, groupname, "0", {
        MKSTREAM: true,
      });
      console.log("Created consumer group.");
      res = true;
    } catch (e) {
      console.log("Consumer group already exists, skipped creation.");
    }
    return res;
  }

  async add(message) {
    await this.redisClient.xAdd(
      this.stream,
      "*",
      { data: message.toString() },
      { MKSTREAM: true }
    );
  }

  async get(consumerName) {
    const streamResponse = await this.redisClient.xReadGroup(
      redis.commandOptions({
        isolated: true,
      }),
      this.group,
      consumerName,
      [
        {
          key: this.stream,
          id: ">",
        },
      ],
      {
        COUNT: 1,
        BLOCK: 5000,
      }
    );
    if (!streamResponse) return [];
    const stream = streamResponse.find((s) => s.name === this.stream);
    if (!stream) return [];
    const messages = stream.messages;
    return messages;
  }

  async ack(id) {
    return await this.redisClient.xAck(this.stream, this.group, id);
  }
}
module.exports = RedisTaskStream;
