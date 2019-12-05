const express = require("express");
const io = require("socket.io");
const {
    Kafka
} = require("kafkajs")
const cors = require("cors")
const streamRouter = require("./streamRouter.js")
const bodyParser = require("body-parser")
const NodeCache = require("node-cache")

const topicCache = new NodeCache({
    stdTTL: 300,
    checkperiod: 120
});


//Initialize kafka
const kafka = new Kafka({
    clientId: "socketio",
    brokers: ["172.25.0.3:9093"]
})

//Create a consumer of group: test-group
const consumer = kafka.consumer({
    groupId: "test-group"
})

//Initialize the express web server and add middleware
const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(cors())

const http = require("http").Server(app);

const port = 9999;

//Create a socket connection (note endpoint as being the express app)
const socket = io(http);


socket.on("connection", (socket) => {
    console.log("connected");
    /**
    //Hent ut alle topics
    topics = topicCache.mget(["bigrams", "sentiments"]);
    //Hvis det finnes topics i cache
    if (topics != undefined) {
        //For hver topic i topics
        Object.keys(topics).forEach(topic => {
            //Hent ut topic objekt (topic er streng som referer til topicen, i.e. bigrams eller sentiments)
            let topicObj = topics[topic];
            console.log(topicObj.messages.length);
            //For hver melding i topic objekt, send til react siden
            for (var x = 0; x < topicObj.messages.length; x++) {
                 console.log({
                "Marked as:": topicObj.batchId,
                "Actual batch id": topicObj.messages[x]
                });
               

                //console.log("Emptying cached topic: " + topic);
                console.log("Socket emit");
                console.log(topic, {
                    key: topicObj.batchId,
                    value: JSON.parse(topicObj.messages[x])
                });
                socket.emit(topic, {
                    key: topicObj.batchId,
                    value: JSON.parse(topicObj.messages[x])
                });
            }
        });
    }
	   **/
    //socket.emit("hei","Connection established");

    socket.emit("disconnect", () => {
        console.log("Disconnected")
    })
});


//Asyncrounous code block exhausting consumer for messages and emitting them via websocket
const run = async () => {
    // Consuming
    await consumer.connect()
    //Topics
    await consumer.subscribe({
        topic: "bigrams",
        fromBeginning: true
    })
    await consumer.subscribe({
        topic: 'sentiments',
        fromBeginning: true
    })

    await consumer.run({

        eachMessage: async ({
            topic,
            partition,
            message
        }) => {
           
        console.log({
                partition,
                offset: message.offset,
                message,
                topic
	})
        

            socket.emit(topic, {
                key: message.key.toString(),
                value: JSON.parse(message.value.toString())
            })

	
	    //cache(message,topic);
	
        },
    })
}

//Notice that the async code block is run here
run().catch(e => console.error(`[example/consumer] ${e.message}`, e))


function cache(message,topic) {
            //Emit object with key and value to appropriate topic.
            value = topicCache.get(topic)

    if (value != undefined) {
        if (value.batchId < message.key.toString()) {
            success = topicCache.set(topic, {
                batchId: message.key.toString(),
                messages: [message.value.toString()]
            }, 60)
            console.log("Cleared old batch, new data incoming")
        } else {

            value.messages.push(message.value.toString())
            size = value.messages.length
            success = topicCache.set(topic, value, 60)
            console.log({
                "Operation": "Appending to topic",
                success,
                topic,
                "Size": size,
                batchId: value.batchId
            })
        }
    } else {
        console.log("Operation: First batch")
        success = topicCache.set(topic, {
            batchId: message.key.toString(),
            messages: [message.value.toString()]
        }, 60)
        console.log(success)
    }
}

//Declare exceptions for where code might "trip".
const errorTypes = ['unhandledRejection', 'uncaughtException']
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

errorTypes.map(type => {
    process.on(type, async e => {
        try {
            console.log(`process.on ${type}`)
            console.error(e)
            await consumer.disconnect()
            process.exit(0)
        } catch (_) {
            process.exit(1)
        }
    })
})

signalTraps.map(type => {
    process.once(type, async () => {
        try {
            await consumer.disconnect()
        } finally {
            process.kill(process.pid, type)
        }
    })
})

//Start streaming with API call
//app.use("/api/startstream", streamRouter);
app.use(express.static('public'))
//Start listening on port 9999
http.listen(port, () => {
    console.log("connected to port " + port)
});
