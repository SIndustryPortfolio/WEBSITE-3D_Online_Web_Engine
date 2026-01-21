# Modules
# INT
from modules.utilities import Utilities

# EXT
import json
from pymongo import MongoClient

from flask import current_app

# CORE
#coreInfo = Utilities.loadJson("static/json/core.json")

#secureInfo = Utilities.loadJson("secure/json/secure.json")


# 
class Database:
    def getDatabase():
        client = MongoClient("mongodb+srv://" + current_app.config["DBUsername"] + ":" + current_app.config["DBKey"] + "@dissertationcluster.so7tm.mongodb.net/?retryWrites=true&w=majority&appName=dissertationCluster")
        return client
    
    def getAndUpdateCounter(collectionName): # FOR NUMBER BASED IDs ON RECORDS
        client = Database.getDatabase()

        databaseCluster = client["dissertationDatabase"]
        counterCollection = databaseCluster["counter"]

        document = counterCollection.find_one_and_update( 
            {"collection": collectionName},
            {"$inc": {"count": 1}},
            upsert = True,
            return_document = True
        )

        return document["count"]