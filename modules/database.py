# Modules
# INT
from modules.utilities import Utilities

# EXT
import os
from pymongo import MongoClient

# CORE
CurrentApp = None
SocketIO = None

client = None

# Functions
# MECHANICS
class Database:
    @staticmethod
    def Connect():
        # CORE
        global client

        # Functions
        # INIT
        client = MongoClient("mongodb+srv://" + CurrentApp.config["DBUsername"] + ":" + CurrentApp.config["DBKey"] + "@dissertationcluster.so7tm.mongodb.net/?retryWrites=true&w=majority&appName=dissertationCluster")

    @staticmethod
    def getDatabase():
        return client["dissertationDatabase"]
    
    @staticmethod
    def getAndUpdateCounter(collectionName): # FOR NUMBER BASED IDs ON RECORDS
        # CORE
        counterCollection = Database.getDatabase()["counter"]

        # Functions
        # INIT
        document = counterCollection.find_one_and_update( 
            {"collection": collectionName},
            {"$inc": {"count": 1}},
            upsert = True,
            return_document = True
        )

        return document["count"]
    
##
def Initialise(app, socketIO):
    # CORE
    global CurrentApp, SocketIO, client

    # Functions
    # INIT
    CurrentApp = app
    SocketIO = socketIO

    Utilities.tryFor(3, Database.Connect)
    