from kafka import KafkaProducer
import json
import time

hostname = "localhost:9092"
producer = KafkaProducer(bootstrap_servers=hostname, value_serializer=lambda v: json.dumps(v).encode("UTF-8"))


the_files = ["mini_json_data_1000_records.jsonl","results1.jsonl"]

with open("./tweets/sample.json", "r", encoding="UTF-8") as f:
    for line in f:
        line = json.loads(line)
        future = producer.send("tweets", line)
        result = future.get(timeout=60)
        print(result)
        time.sleep(2)
        #print(result)
