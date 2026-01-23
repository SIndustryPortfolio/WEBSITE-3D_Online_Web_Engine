# MODULES
# INTERNAL
from modules.utilities import Utilities
from modules.userHandler import UserHandler

from modules.game.server import Server

# EXTERNAL
from flask_socketio import emit

# CORE
coreInfo = Utilities.loadJson("static/json/core.json")
userCache = {}

servers = {}

CurrentApp = None
SocketIO = None


# MECHANICS
def setupServer(serverId):
    # Functions
    # INIT
    servers[str(serverId)] = Server(str(serverId), SocketIO, servers)

def clientRequest(data):
    # Functions
    # INIT
    if not data["userId"] in userCache:
        userCache[data["userId"]] = UserHandler.getUserFromUserId(data["userId"])

    user = userCache[data["userId"]]    

    if not str(data["serverId"]) in servers or user == None:
        return None

    # Client action with rate-limitting / debounce
    response = servers[str(data["serverId"])].performAction(data["methodName"], user, *data["args"])

    if not response["success"]:
        return None

    toBroadcast = False

    if "broadcast" in response:
        toBroadcast = response["broadcast"]

    return emit("serverRequest", [response], broadcast=toBroadcast)


def Initialise(app, socketIO):
    # CORE
    global CurrentApp, SocketIO
    
    # Functions
    # INIT
    CurrentApp = app
    SocketIO = socketIO

    for serverId, serverInfo in coreInfo["servers"]["worlds"].items():
        setupServer(serverId)

    #  Routes
    @socketIO.on("clientRequest")
    def onClientRequest(*args):
        return clientRequest(*args)
  






