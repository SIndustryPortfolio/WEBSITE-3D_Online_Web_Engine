# Modules
# EXT
import time
import os
from PIL import Image

# INT
from modules.utilities import Utilities

# CORE
cache = {}

CurrentApp = None
SocketIO = None

# Functions
## MECHANICS
class TextureServiceCache:
    def remove(key):
        # Functions
        # INIT
        cache.pop(key)

    def getAll():
        # Functions
        # INIT
        return cache

    def get():
        # Functions
        # INIT
        if not "textures" in cache:
            textures = {}
        
            texturesDirectory = os.path.join(CurrentApp.root_path, "static", "images", "textures")
            filesInDirectory = os.listdir(texturesDirectory)

            for folder in filesInDirectory:
                folderPath = os.path.join(texturesDirectory, folder)
                folderName = os.path.splitext(os.path.basename(folderPath))[0]

                textures[folderName] = {}

                for file in os.listdir(folderPath):
                    fullPath = os.path.join(folderPath, file)
                    fileBaseName = os.path.splitext(os.path.basename(fullPath))[0]
                    if os.path.isfile(fullPath):
                        textureRows = []

                        textureImage = Image.open(fullPath)
                        textureImage = textureImage.convert("RGB")

                        imageWidth, imageHeight = textureImage.size

                        for row in range(imageHeight):
                            rowData = []
                            for column in range(imageWidth):
                                rgbValue = textureImage.getpixel((column, row))
                                rowData.append(rgbValue)

                            textureRows.append(rowData)
                            
                        textures[folderName][fileBaseName] = textureRows

            TextureServiceCache.set("textures", textures)


        return cache["textures"]["value"]

    def set(key, value):
        # CORE
        timeNow = time.time()

        # Functions
        # INIT
        cache[key] = {"time": timeNow, "value": value}

##
def Initialise(app, socketIO):
    # CORE
    global CurrentApp, SocketIO

    # Functions
    # INIT
    CurrentApp = app
    SocketIO = socketIO