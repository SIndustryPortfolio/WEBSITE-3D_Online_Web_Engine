# MODULES
# EXT
import threading
import time
from flask import Blueprint, session, render_template, request, redirect, url_for, jsonify

# INT
from modules.userHandler import UserHandler
from modules.utilities import Utilities

from controllers.api.v1.userService import userServiceBlueprint, UserServiceCache
from controllers.api.v1.gameService import gameServiceBlueprint, MapServiceCache, TextureServiceCache

# CORE
coreInfo = Utilities.loadJson("static/json/core.json")
caches = [UserServiceCache, MapServiceCache, TextureServiceCache]

URLPrefix = "/api/v1"

BluePrint = Blueprint("apiV1", __name__)

CurrentApp = None
SocketIO = None

# Functions
# MECHANICS
def runtime(): # RUNNING THREAD FOR CACHE TIME OUTS

    # Functions
    # MECHANICS
    def getTimedOut(timeNow, cacheDict):
        # CORE
        timedOutKeys = []

        # Functions
        # INIT
        for key, value in cacheDict.items():
            if timeNow - value["time"] > CurrentApp.config["APICacheTimeOut"]: #secureInfo["api"]["cacheTimeOut"]:
                timedOutKeys.append(key)

        return timedOutKeys
    
    # INIT
    while True:
        timeNow = time.time()

        for cacheObject in caches:
            timedOutKeys = getTimedOut(timeNow, cacheObject.getAll())

            # REMOVE TIMED OUT CACHE KEYS
            for key in timedOutKeys:
                cacheObject.remove(key) 

        time.sleep(5)

def Initialise(app, socketIO):
    # CORE
    global CurrentApp, SocketIO
    
    # Functions
    # INIT
    CurrentApp = app
    SocketIO = socketIO

    BluePrint.register_blueprint(userServiceBlueprint, url_prefix="/users")
    BluePrint.register_blueprint(gameServiceBlueprint, url_prefix="/game")


    thread = threading.Thread(target=runtime)
    thread.daemon = True
    thread.start()

# INIT