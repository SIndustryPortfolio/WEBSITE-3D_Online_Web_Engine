# Modules
# INT
import os

from modules.utilities import Utilities

# EXT
from pymongo import MongoClient
from flask import current_app

# CORE
CurrentApp = None
SocketIO = None

client = None

# Functions
# MECHANICS
def Initialise(app, socketIO):
    # CORE
    global CurrentApp, SocketIO, client

    # Functions
    # INIT
    CurrentApp = app
    SocketIO = socketIO

    print("Connecting to MONGO")
    client = MongoClient("mongodb+srv://" + app.config["DBUsername"] + ":" + app.config["DBKey"] + "@dissertationcluster.so7tm.mongodb.net/?retryWrites=true&w=majority&appName=dissertationCluster")
    print("Connected to MONGO")

class Database:
    def getDatabase():
        return client["dissertationDatabase"]
    
    def getAndUpdateCounter(collectionName): # FOR NUMBER BASED IDs ON RECORDS
        counterCollection = Database.getDatabase()["counter"]

        document = counterCollection.find_one_and_update( 
            {"collection": collectionName},
            {"$inc": {"count": 1}},
            upsert = True,
            return_document = True
        )

        return document["count"]