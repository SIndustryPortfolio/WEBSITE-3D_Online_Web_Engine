# MODULES
# EXT
from flask import Flask, jsonify, Blueprint, url_for
import os

# INT
from modules.utilities import Utilities

# CACHES
from controllers.api.caches.mapServiceCache import MapServiceCache
from controllers.api.caches.textureServiceCache import TextureServiceCache

# CORE
gameServiceBlueprint = Blueprint("gameService", __name__)

# ROUTES
@gameServiceBlueprint.route("maps", methods=["GET"])
def getAllMapDicts(): # RETURN ALL MAPS AS GRID DATA STRUCTURES
    # Functions
    # INIT
    return jsonify(MapServiceCache.getAll())

@gameServiceBlueprint.route("maps/<string:mapName>", methods=["GET"])
def getMapDict(mapName): # RETURN MAP AS GRID DATA STRUCTURES
    # Functions
    # INIT
    return jsonify(MapServiceCache.get(mapName))

@gameServiceBlueprint.route("textures/raw", methods = ["GET"])
def getTextures(): # RETURN ALL TEXTURE IMAGE RGB DATA
    # Functions
    # INIT
    return jsonify(TextureServiceCache.get())

@gameServiceBlueprint.route("maps/meta", methods = ["GET"])
def getMeta(DontJSON): # RETURN META TO TRANSLATE MAP GRID VALUES
    # Functions
    # INIT
    metaDict = {
        "entities": Utilities.loadJson("static/json/maps/meta/entities.json"),
        "floors": Utilities.loadJson("static/json/maps/meta/floors.json"),
        "walls": Utilities.loadJson("static/json/maps/meta/walls.json")
    }

    if DontJSON:
        return metaDict
    else:
        return jsonify(metaDict) 
