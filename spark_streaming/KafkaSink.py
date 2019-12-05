import json

from pyspark.sql.streaming import DataStreamWriter
from kafka import KafkaProducer


class KafkaSink(DataStreamWriter):
    def __init__(self, config):
        self.config = config
        self.producer = None
        self._version = None
    def open(self, partitionId, version):
        self._version = version
        props = {"bootstrap_servers": self.config["bootstrap_servers"],\
                "value_serializer": lambda v: json.dumps(v).encode("UTF-8"),\
                 "key_serializer": lambda v: json.dumps(v).encode("UTF-8"),\
                #"key_serializer": bytes(key, "UTF-8"),
                "acks": 1}
        self.producer = KafkaProducer(**props)
        return True
    def process(self,row):
        print(row)
        self.producer.send(self.config["topic"], value=row.value, key=self._version)
    def close(self, error):
        try:
            self.producer.close()
        except Exception:
            print("Exception raised")

