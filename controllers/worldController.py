# MODULES
# INTERNAL
from app import socketIO

from modules.utilities import Utilities
from modules.shortcuts import Shortcuts
from modules.userHandler import UserHandler

from modules.game.server import Server

# EXTERNAL
import requests
import json
from flask_socketio import SocketIO, send, emit

# CORE
coreInfo = Utilities.loadJson("static/json/core.json")
userCache = {}

servers = {}

CurrentApp = None


# MECHANICS
def setupServer(serverId):
    # Functions
    # INIT
    servers[str(serverId)] = Server(str(serverId), socketIO, servers)

def Initialise(app):
    # CORE
    global CurrentApp
    
    # Functions
    # INIT
    CurrentApp = app

    for serverId, serverInfo in coreInfo["servers"]["worlds"].items():
        setupServer(serverId)

#  Routes
@socketIO.on("clientRequest")
def handle_invoke(data): # CLIENT REQUEST
    # CORE

    # Functions
    # INIT
    if not data["userId"] in userCache:
        userCache[data["userId"]] = UserHandler.getUserFromUserId(data["userId"])

    user = userCache[data["userId"]]    

    if not str(data["serverId"]) in servers or user == None:
        return None

    response = servers[str(data["serverId"])].performAction(data["methodName"], user, *data["args"])

    if not response["success"]:
        return None

    toBroadcast = False

    if "broadcast" in response:
        toBroadcast = response["broadcast"]

    return emit("serverRequest", [response], broadcast=toBroadcast)






