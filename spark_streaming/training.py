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
from sparknlp import Finisher
from pyspark.ml import Pipeline
from sparknlp.pretrained import PretrainedPipeline
from sparknlp.annotator import SentenceDetector, Tokenizer, Normalizer, ViveknSentimentApproach, NorvigSweetingApproach
from sparknlp.base import DocumentAssembler

# These are only needed when outputting to console
import sys
reload(sys)
sys.setdefaultencoding('utf-8')

spark = SparkSession\
        .builder\
        .appName("Training model")\
        .getOrCreate()

'''Training data
data = spark.\
         read.\
         csv("./labelled_dataset/sentiment140.csv").\
         withColumn("sentiment_label", when(col("_c0") == 0, "negative").otherwise("positive")).\
         withColumnRenamed("_c5", "text").\
         limit(6000).cache()'''


data  = spark.\
        read.\
        json("./labelled_dataset/compact.json").\
        withColumn("review", explode(arrays_zip(col("review.evaluation"), col("review.text")))).\
        withColumn("sentiment_label", when((col("review")["0"] == "-2") | (col("review")["0"] == "-1"), "negative").\
        when((col("review")["0"] == "1") | (col("review")["0"] == "2"), "positive")).\
        withColumn("text", col("review")["1"]).\
        limit(1000).cache()

# Tweet data for determining accuracy of model
df = spark.read.json("./data/snippet.json")

# Remove occurences of links, twitter handles and "RT" from the tweet (regex expression). 
df = df.select(to_date(col("created_at"), "EEE MMM dd HH:mm:ss ZZZZZ yyyy")\
        .alias("created_at"), trim(regexp_replace(col("full_text"), "(((https:|http:|www.)\S*)|@(\w){1,15}:|RT)", ""))\
        .alias("text"))

# Document assembler (annotates column)
document_assembler = DocumentAssembler().\
        setInputCol("text").\
        setOutputCol("document")

# Sentence detector
sentence_detector = SentenceDetector().\
        setInputCols(["document"]).\
        setOutputCol("sentence")

# Tokeneizer
tokenizer = Tokenizer().\
        setInputCols(["sentence"]).\
        setOutputCol("token")

# Normalizer
normalizer = Normalizer().\
        setInputCols(["token"]).\
        setOutputCol("normal")

# words.txt is a list of newline separated words
spell_checker = NorvigSweetingApproach().\
        setInputCols(["normal"]).\
        setOutputCol("spell").\
        setDictionary("/tmp/words.txt")

# Vivekn sentiment approach
sentiment_detector = ViveknSentimentApproach().\
        setInputCols(["spell", "sentence"]).\
        setOutputCol("sentiment").\
        setSentimentCol("sentiment_label").\
        setPruneCorpus(0)

# Remove metadata column
finisher = Finisher().\
        setInputCols(["sentiment"]).\
        setIncludeMetadata(False)

pipeline = Pipeline(stages=[
    document_assembler,
    sentence_detector,
    tokenizer,
    normalizer,
    spell_checker,
    sentiment_detector,
#    finisher
])

# Fit model with the labelled data
model = pipeline.fit(data)

# Save model to pretrained folder. That way we can import it into our project
model.write().save("./pretrained")

#sentiment_data.write.format("json").\
#        save("results/")
#sentiment_data.write.format("json")\
#        .save("./results/")
#annotations_finished_df.write.format("json")\
#        .save("sentiments")
