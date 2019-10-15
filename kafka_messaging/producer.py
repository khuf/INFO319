from kafka import KafkaProducer
import json

#hostname = "10.111.48.124:9092"
hostname = "67.205.161.104:9092"
producer = KafkaProducer(bootstrap_servers=hostname, value_serializer=lambda v: json.dumps(v).encode("UTF-8"))

with open("./data/data.jsonl", "r", encoding="UTF-8") as f:
    for line in f:
        future = producer.send("test", line)
        result = future.get(timeout=60)
        print(result)
