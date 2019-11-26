from kafka import KafkaConsumer

#10.111.48.124:9092
hostname = "localhost:9092"
consumer = KafkaConsumer("trigrams", bootstrap_servers=hostname)

count = 0
for msg in consumer:
    count = count + 1
    print(msg)
