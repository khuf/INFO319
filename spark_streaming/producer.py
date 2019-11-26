from kafka import KafkaProducer
import json
import time

hostname = "localhost:9092"
producer = KafkaProducer(bootstrap_servers=hostname, value_serializer=lambda v: json.dumps(v).encode("UTF-8"))


with open("./tweets/sample.json", "r", encoding="UTF-8") as f:
    tweets = json.load(f)
    for tweet in tweets:
        future = producer.send("tweets", tweet)
        result = future.get(timeout=60)
        time.sleep(2)
        print(result)
