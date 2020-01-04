from kafka import KafkaProducer
import json
import time

# Change this to the server ip if producing to external IP, otherwise, keep localhost
hostname = "localhost:9092"
# Instansiate a KafkaProducer. The lambda function serializes value as a string (Kafka only accepts key, value pairs as strings)
producer = KafkaProducer(bootstrap_servers=hostname, value_serializer=lambda v: json.dumps(v).encode("UTF-8"))

# Read dataset and publish records to the tweets topic.
with open("./tweets/results1.jsonl", "r", encoding="UTF-8") as f:
    for line in f:
        line = json.loads(line)
        future = producer.send("tweets", line)
        result = future.get(timeout=60)
        print(result)
        time.sleep(1.5)
