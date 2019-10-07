from pyspark import SparkContext
from pyspark.streaming import StreamingContext
from pyspark.streaming.kafka import KafkaUtils

sc = SparkContext(appName = "SparkTweetStreaming")
ssc = StreamingContext(sc, 5)

kafka_stream = KafkaUtils.createStream(ssc, "192.168.10.125:2181", "group-tweet", {"test": 1})

ssc.start()
