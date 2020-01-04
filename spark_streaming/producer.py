from kafka import KafkaProducer
import json
import time

# Change to server if if producing to external ip, otherwise, keep localhost.
hostname = "localhost:9092"
# Instansiates a KafkaProducer. Serializes values as string, since Kafka only accept key/value pairs as strings
producer = KafkaProducer(bootstrap_servers=hostname, value_serializer=lambda v: json.dumps(v).encode("UTF-8"))


# Publish messages to tweets topic from file stream
with open("./tweets/sample.json", "r", encoding="UTF-8") as f:
    tweets = json.load(f)
    for tweet in tweets:
        future = producer.send("tweets", tweet)
        result = future.get(timeout=60)
        time.sleep(2)
        print(result)
