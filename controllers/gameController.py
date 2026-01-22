# MODULES
# INTERNAL
from modules.utilities import Utilities
from modules.shortcuts import Shortcuts

from controllers.api.caches.mapServiceCache import MapServiceCache
from controllers.api.caches.textureServiceCache import TextureServiceCache

from controllers.worldController import servers

# EXTERNAL
import requests
import json
from flask import Blueprint, session, request, redirect, url_for

# CORE
BluePrint = Blueprint("game", __name__)
CurrentApp = None


# MECHANICS
def Initialise(app):
    # CORE
    global CurrentApp
    
    # Functions
    # INIT
    CurrentApp = app

#  Routes
@BluePrint.route("/game/<int:_serverId>")
def pageHandler(_serverId):
    # Functions
    # INIT
    user = session.get("user", None)

    if not user: # IF USER NOT LOGGED IN
        return redirect(url_for("login.pageHandler"))
    
    if not str(_serverId) in servers: # IF SERVER DOESN'T EXIST
        return redirect(url_for("index.pageHandler"))
    

    server = servers[str(_serverId)]

    # MAP RAW GRID DATA
    mapData = MapServiceCache.get(server.map) #requests.get(request.host_url + "/api/v1/game/maps/" + server.map).json()
    
    # TEXTURE RGB DATA
    textures = TextureServiceCache.get() #requests.get(request.host_url + "/api/v1/game/textures/raw").json()

    # MAP META DATA (TRANSLATE GRID TO RENDERABLE INFORMATION)
    mapMeta = MapServiceCache.get("meta") #requests.get(request.host_url + "/api/v1/game/maps/meta").json()

    return Shortcuts.renderPage("game.html", "Game", serverId=str(_serverId), mapData=mapData, textures=textures, mapMeta=mapMeta)

