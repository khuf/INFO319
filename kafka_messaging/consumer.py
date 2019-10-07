from kafka import KafkaConsumer

hostname = "10.111.48.124:9092"
consumer = KafkaConsumer("test", bootstrap_servers=hostname)

for msg in consumer:
    print(msg)
