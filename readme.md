Redis Task Stream
===

Simplest possible implementation to add, get and acknowledge jobs with Redis Streams as backend.

## Install

TODO

## Usage

You may set your redis connection configuration either by environment variables or in the construction options. Default it connects to a local default instance of redis (`127.0.0.1:6379`)

**Possible environment variables**

```bash
REDIS_HOST = <default localhost>
REDIS_PORT = <default 6379>
REDIS_PASSWORD = <default empty>
```

```js
const redisTaskStream = new RedisTaskStream({
  socket: {
    port: 6379,
    host: "127.0.0.1",
  }
  password: ""
});
```

### Producer

Simple example exists in [producer.js](examples/producer.js)

```js
const RedisTaskStream = require("redis-task-stream");

const message = "This is my important message";

const redisTaskStream = new RedisTaskStream();
await redisTaskStream.add(message);
```

### Consumer

Simple example exists in [consumer.js](examples/consumer.js)

```js
const RedisTaskStream = require("redis-task-stream");

const redisTaskStream = new RedisTaskStream();
await redisTaskStream.createGroup("my-consumer-group-name");

while (true) {
  const items = await redisTaskStream.get("my-consumer-name");
  items.forEach(async (item) => {
    console.log(`Fetched item:`, item.id);
    console.log("Message: ", item.message.data);
    const ack = await redisTaskStream.ack(item.id);
    console.log(`Acknowledged: ${ack}`);
  });
}
```

### Methods

- `connect()` if we do not bother to wait for the connection to be handled by the class
- `createGroup(groupName?)` creates the consumer group
- `add(message)`
- `get(consumerName)` returns a list of messages objects (id + message)
- `ack(id)` acknowledged the message received so it will be deleted
- `disconnect()` release your Redis connection
