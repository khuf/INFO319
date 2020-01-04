from pyspark.sql import SparkSession
from kafka import KafkaConsumer
from pyspark.sql.functions import *  
from pyspark.sql.types import *
from pyspark.sql.streaming import *
from schema import schema
import pyspark
from pyspark.ml.feature import NGram, StopWordsRemover
import numpy as np
import sparknlp
from pyspark.ml import PipelineModel
from sparknlp.pretrained import PretrainedPipeline
from KafkaSink import KafkaSink

spark = SparkSession\
        .builder\
        .appName("TwitterStreaming")\
        .getOrCreate()


locale = spark._jvm.java.util.Locale
locale.setDefault(locale.forLanguageTag("en-US"))
# Enable FAIR scheduler to handle multiple queries concurrently (By default the first query received all cluster resources during execution)
# See: https://spark.apache.org/docs/latest/job-scheduling.html#scheduling-within-an-application
spark.conf.set("spark.scheduler.mode", "FAIR")

# Enable console monitoring
spark.conf.set("spark.sql.streaming.metricsEnabled", "true")

# Read from Kafka source
ds = spark.readStream.format("kafka").\
        option("kafka.bootstrap.servers", "localhost:9092").\
        option("subscribe", "tweets").\
        option("includeTimestamp", "true").\
        option("failOnDataLoss", False).\
        load()

# Read value column as json string
df = ds.select(from_json(col("value").cast("string"), schema).alias("parsed_values"))


# Remove occurences of links, twitter handles and "RT" from the tweet (regex expression).
df = df.select(trim(regexp_replace(col("parsed_values.full_text"), r'(https:|http:|www.|@(\w){1,15}:|RT )\S*',"")).alias("text"), col("parsed_values.id_str").alias("id_str"))

df = df.select(regexp_replace(col("text"), r'[.]', u'\u002E').alias("text"), col("id_str"))

# Added support accented characters (commonly used in spanish language). (unicode characters") (-;&$)
df = df.select(regexp_replace(col("text"), r'[^0-9A-z\u00C0-\u00FF -,]',"").alias("text"), col("id_str"))

# Setup pretrained pipeline for sentiment analysis
sentiment_analysis_pipeline = PretrainedPipeline("analyze_sentiment")
sentiments = sentiment_analysis_pipeline.transform(df.select(col("text").alias("text"), col("id_str")))

# Alternative pipeline with model trained using a spanish corpus dataset. Model is saved to the "pretrained" folder.
# The pipeline is find within the training.py file and uses the Vivekn sentiment apparoach. See http://arxiv.org/abs/1305.6143 for more information
# on this approach. 
#model = PipelineModel.load("pretrained/")
#sentiments = model.transform(df.select(col("text")))

# Tokenize sentences as words
tokenized = df.select(split(col("text"), " ").alias("words"))

# StopWordsRemover from Spark MLib
swRm = StopWordsRemover(inputCol="words", outputCol="filtered")

# Transform df (remove stopwords)
bigram_df = swRm.transform(tokenized)

# Declare columns to select
sentiments = sentiments.withColumn("combinedResult", arrays_zip(col("sentence.result"), col("sentiment.result"), col("sentiment.metadata"))).\
        withColumn("timestamp", lit(current_timestamp()))

#sentiments = sentiments.withColumnRenamed("combinedResult", "finished_sentiment")
# NGram transformer from Spark MLLib
ngram_transformer = NGram(n=2, inputCol="filtered", outputCol="bigrams")
bigram_df = ngram_transformer.transform(bigram_df).select("bigrams")

# Accumulation window set to 3 minute (current). Can also use the timestamp of the tweets. That way, we can analyse tweets
# stretching over multiple days. However, for testing purposes we used the current timestamp.
bigram_df = bigram_df.withColumn("text", explode("bigrams")).\
        withColumn("timestamp", lit(current_timestamp())).\
        withWatermark("timestamp", "3 minute").\
        groupBy("text", window(col("timestamp"), "30 seconds")).\
        count().\
        withColumnRenamed("count", "value")


# Stringify json and assign it to value column. This is necessary because Kafka transports data in payload with "key/value" pairs
bigram_df = bigram_df.selectExpr("CAST(window AS STRING) AS key", "to_json(struct(*))  AS value")
# Same as above...
sentiments = sentiments.selectExpr("CAST(text AS STRING) AS key", "to_json(struct(*)) AS value")

sentiment_config = {"bootstrap_servers": "localhost:9092", "topic": "sentiments"}
bigram_config = {"bootstrap_servers": "localhost:9092", "topic": "bigrams"}

# Queries. Note that we are using a custom sink (KafkaSink.py) to be able to include the batch id for each query.
sentiment_query = sentiments.writeStream.\
        trigger(processingTime = "10 seconds").\
        queryName("sentimentQuery").\
        foreach(KafkaSink(sentiment_config)).\
        option("checkpointLocation", "checkpoint/sentiments").\
        start()

bigram_query = bigram_df.writeStream.\
        trigger(processingTime = "10 seconds").\
        queryName("bigramQuery").\
        foreach(KafkaSink(bigram_config)).\
        option("checkpointLocation", "checkpoint/bigrams").\
        start()

spark.streams.awaitAnyTermination()

# Write to console (Be cautios of awaitTermination() as it blocks other queries from starting)
        
#query = sentiments.writeStream.trigger(processingTime = "10 seconds").queryName("query1").outputMode("append").format("console").option("truncate", "false").start().awaitTermination()

#query = df.writeStream.trigger(processingTime = "10 seconds").queryName("query1").format("kafka").option("checkpointLocation", "data/").option("kafka.bootstrap.servers", "localhost:9092").option("topic", "trigrams").start().awaitTermination()


