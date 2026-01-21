# Modules
# INT
import os

from modules.utilities import Utilities

# EXT
from pymongo import MongoClient
from flask import current_app

# CORE
CurrentApp = None
client = None

# Functions
# MECHANICS
def Initialise(app):
    # CORE
    global CurrentApp, client

    # Functions
    # INIT
    CurrentApp = app

    print("Connecting to MONGO")
    client = MongoClient("mongodb+srv://" + app.config["DBUsername"] + ":" + app.config["DBKey"] + "@dissertationcluster.so7tm.mongodb.net/?retryWrites=true&w=majority&appName=dissertationCluster")
    print("Connected to MONGO")

class Database:
    def getDatabase():
        return client
    
    def getDatabaseCluster():
        return client["dissertationDatabase"]
    
    def getAndUpdateCounter(collectionName): # FOR NUMBER BASED IDs ON RECORDS
        databaseCluster = Database.getDatabaseCluster()
        counterCollection = databaseCluster["counter"]

        document = counterCollection.find_one_and_update( 
            {"collection": collectionName},
            {"$inc": {"count": 1}},
            upsert = True,
            return_document = True
        )

        return document["count"]