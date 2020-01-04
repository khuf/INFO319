const express = require("express");
const io = require("socket.io");
const { Kafka } = require("kafkajs");
const cors = require("cors");
const bodyParser = require("body-parser");
const NodeCache = require("node-cache");

const topicCache = new NodeCache({
  stdTTL: 300,
  checkperiod: 120
});

//Initialize kafka
const kafka = new Kafka({
  clientId: "socketio",
  brokers: ["kafka-docker_kafka_1:9093"]
});

//Create a consumer of group: test-group
const consumer = kafka.consumer({
  groupId: "test-group"
});

//Initialize the express web server and add middleware
const app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(cors());

const http = require("http").Server(app);

const port = 9999;

//Create a socket connection (note endpoint as being the express app)
const socket = io(http);

socket.on("connection", socket => {
  console.log("connected");

  socket.emit("disconnect", () => {
    console.log("Disconnected");
  });
});

//Asyncrounous code block exhausting consumer for messages and emitting them via websocket
const run = async () => {
  // Consuming
  await consumer.connect();
  //Topics
  await consumer.subscribe({
    topic: "bigrams",
    fromBeginning: true
  });
  await consumer.subscribe({
    topic: "sentiments",
    fromBeginning: true
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        partition,
        offset: message.offset,
        message,
        topic
      });

      socket.emit(topic, {
        key: message.key.toString(),
        value: JSON.parse(message.value.toString())
      });
    }
  });
};

//Notice that the async code block is run here
run().catch(e => console.error(`[example/consumer] ${e.message}`, e));

function cache(message, topic) {
  //Emit object with key and value to appropriate topic.
  value = topicCache.get(topic);

  //Incoming message belongs to newer batch
  if (value != undefined) {
    if (value.batchId < message.key.toString()) {
      success = topicCache.set(
        topic,
        {
          batchId: message.key.toString(),
          messages: [message.value.toString()]
        },
        60
      );
      // Incoming message belongs to current batch
    } else {
      value.messages.push(message.value.toString());
      size = value.messages.length;
      success = topicCache.set(topic, value, 60);
    }
    //Cache has not yet been set
  } else {
    success = topicCache.set(
      topic,
      {
        batchId: message.key.toString(),
        messages: [message.value.toString()]
      },
      60
    );
  }
}

//Declare exceptions for where code might "trip".
const errorTypes = ["unhandledRejection", "uncaughtException"];
const signalTraps = ["SIGTERM", "SIGINT", "SIGUSR2"];

errorTypes.map(type => {
  process.on(type, async e => {
    try {
      console.log(`process.on ${type}`);
      console.error(e);
      await consumer.disconnect();
      process.exit(0);
    } catch (_) {
      process.exit(1);
    }
  });
});

signalTraps.map(type => {
  process.once(type, async () => {
    try {
      await consumer.disconnect();
    } finally {
      process.kill(process.pid, type);
    }
  });
});

app.use(express.static("public"));
//Start listening on port 9999
http.listen(port, () => {
  console.log("connected to port " + port);
});
