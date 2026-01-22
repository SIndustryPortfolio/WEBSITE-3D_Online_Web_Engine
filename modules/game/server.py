# Modules
# EXT
import requests
import time
import threading
from datetime import datetime
from flask import current_app, url_for
from types import SimpleNamespace

# INT
from controllers.api.v1.gameService import MapServiceCache

from modules.debug import Debug
from modules.utilities import Utilities
from modules.discordBot import DiscordBot
from modules.game.player import Player
from modules.shortcuts import Shortcuts

# CORE
coreInfo = Utilities.loadJson("static/json/core.json")
hexInfo = Utilities.loadJson("static/json/hex.json")

#
class Server:
    def __init__(self, serverId, socketIO, servers):
        self.serverId = serverId
        self.socketIO = socketIO
        self.servers = servers

        self.serverInfo = coreInfo["servers"]["meta"]
        self.worldInfo = coreInfo["servers"]["worlds"][str(serverId)]
        self.startTime = time.time()
        self.mapData = None

        self.playerTimeOut = self.serverInfo["playerTimeOut"] # TIME OUT IN SECONDS
        self.maxChats = self.serverInfo["maxChats"] # NUMBER OF CHATS TO BE STORED

        self.serverUser = SimpleNamespace(**{ # CONVERT TO INDEXABLE OBJECT
            "userId": "-1",
            "username": "AUTO",
            "userType": "4"
        })

        self.map = self.worldInfo["map"] # NAME OF MAP
        self.mapData = MapServiceCache.get(self.map) # MAP DATA: LIGHTING, CONTENT, NAME, ETC
        
        self.name = self.worldInfo["name"] #serverInfo["name"]
        self.players = {}
        self.chat = []

        self.subscriptableMethods =  { # CLIENT REQUESTS
            # GET
            "getNumberOfPlayers": self.getNumberOfPlayers,
            "getPlayerFromServer": self.getPlayerFromServer,
            "getCharacters": self.getCharacters,
            "getPlayers": self.getPlayers,
            "getPreviousChats": self.getPreviousChats,

            # SET
            "updatePlayer": self.updatePlayer,
            "updateCharacter": self.updateCharacter,
            
            # DIRECT
            "addChat": self.addChat,
            "playerAdded": self.playerAdded,
            "playerRemoved": self.playerRemoved
            
        }

        self.mainThread = threading.Thread(target=self.runtime)
        self.mainThread.daemon = True
        self.mainThread.start()

    def __getitem__(self, key):
        return self.subscriptableMethods[key]
    
    ##########################################

    
    
    ##########################################

    def formatResponse(self, response):
        # Functions
        # INIT
        response["serverId"] = self.serverId

        return response

    def performAction(self, methodName, user, *args):
        # CORE
        player = None
        
        if user != None:
            player = self.getPlayerFromServer(str(user.userId))
        else:
            return None
        
        timeNow = time.time()

        # Functions
        # INIT
        if player != None:
            player.lastActionTime = timeNow

        return self.formatResponse(self[methodName](user, *args))

    ##########################################

    def runtime(self): # SEPARATE THREAD - SERVER RUNTIME
        # FUNCTIONS
        # MECHANICS
        def getTimedOutUserIds(): # RETURNS USER IDS IDLING FOR X AMOUNT OF SECONDS
            # CORE
            timeNow = time.time()
            timedOut = []

            # Functions
            # INIT
            for userId, player in self.players.items():
                if player == None:
                    continue

                timeSpan = timeNow - player.lastActionTime

                if timeSpan > self.playerTimeOut:
                    timedOut.append(userId)

            return timedOut

        # CORE

        # INIT
        while True: # HEARTBEAT
            timedOutUserIds = getTimedOutUserIds()

            responses = []

            for userId in timedOutUserIds: # Remove timed out players
                playerRemovedResponse = self.formatResponse(self.playerRemoved(self.players[str(userId)].user))
                responses.append(playerRemovedResponse)

            responses.append(self.formatResponse(self.getCharacters(None)))
            self.socketIO.emit("serverRequest", responses)

            time.sleep(.05)

    ##########################################

    def getNumberOfPlayers(self):
        return len(self.players)
    
    def getPlayerFromServer(self, userId):
        # Functions
        # INIT
        if (str(userId) in self.players):
            return self.players[str(userId)]

        return None
    
    ##########################################

    def addChat(self, user, message, logInDiscord=True):
        # CORE
        response = {"success": False, "respondTo": {"object": "chatService", "args": ["addChat"]}}
        formattedTime = datetime.now().strftime("%H:%M") # HOURS , MINUTES

        # FUNCTIONS
        # INIT
        userId = user.userId
        username = user.username 
        userType = user.userType
        
        chatToAdd = {"userId": userId, "username": username, "userType": userType, "message": message, "time": formattedTime}
        
        if len(self.chat) > self.maxChats:
            self.chat.pop(0)

        self.chat.append(chatToAdd)
        response["respondTo"]["args"].append(chatToAdd)

        response["success"] = True
        response["broadcast"] = True

        # DISCORD WEB HOOK EMBED MESSAGE
        userTypeInfo = coreInfo["userTypes"][userType]
        userTypeHexColour = int(hexInfo[userTypeInfo["colour"]], 16)

        messageEmbed = {
            "title": "[" + userTypeInfo["name"] + "] " + username + ":",
            "description": "",
            "color": userTypeHexColour,
            "fields": [
                {
                    "name": "",
                    "value": message
                }
            ],
            "footer": {
                "text": "Time: " + str(formattedTime)
            }
        }

        packagedToSend = {
            "content": "",
            "embeds": [messageEmbed]
        }

        if logInDiscord:
            botResponse = DiscordBot.send("server" + self.serverId, packagedToSend)

        return response
        
        
    def updatePlayer(self, user, updateTable):
        # CORE
        response = {"success": False}

        # Functions
        # INIT
        userId = user.userId

        if self.getPlayerFromServer(userId) == None:
            response["success"] = False
            return response
        
        #self.players[str(userId)] = user

        for propertyName, propertyValue in updateTable.items():
            self.players[str(userId)][propertyName] = propertyValue

        response["success"] = True

        return response

    def getPreviousChats(self, user): # RETURNS ALL CHATS
        # CORE
        response = {"success": True, "respondTo": {"object": "chatService", "args": ["addPreviousChats"]}}

        # Functions
        # INIT
        response["respondTo"]["args"].append(self.chat)

        return response

    def getPlayers(self, excludeUser): # RETURNS ALL PLAYERS
        # CORE
        response = {"success": False, "respondTo": {"object": "playersService", "args": ["addPlayers"]}}

        # Functions
        # INIT
        players = {}

        for playerUserId, player in self.players.items():
            if playerUserId == str(excludeUser.userId):
                continue

            players[playerUserId] = player.getDict()

        response["success"] = True
        response["respondTo"]["args"].append(players)

        return response

    def getCharacters(self, exlcudeUser): # RETURNS ALL CHARACTERS
        # CORE
        response = {"success": False, "respondTo": {"object": "playersService", "args": ["updateCharacters"]}}

        # Functions
        # INIT
        characters = {}

        for playerUserId, player in self.players.items():
            if exlcudeUser != None:
                if playerUserId == str(exlcudeUser.userId):
                    continue
            
            characters[playerUserId] = player.character.getDict() 

        response["success"] = True
        response["respondTo"]["args"].append(characters)

        return response
        

    def updateCharacter(self, user, characterProperties): # CHANGES CHARACTER PROPERTIES: POSITION, HEADING
        # CORE
        response = {"success": False}

        # Functions
        # INIT
        userId = user.userId

        if self.getPlayerFromServer(userId) == None:
            return response
        
        for propertyName, propertyValue in characterProperties.items():
            self.players[str(userId)].character[propertyName] = propertyValue

        response["success"] = True
        return response
 
    def playerAdded(self, user): # ADD USER TO SERVER
        # CORE
        response = {"success": False, "broadcast": False, "respondTo": {"object": "playersService", "args": ["playerAdded"]}}
        timeNow = time.time()
        rejoin = False

        # Functions
        # INIT
        userId = str(user.userId)
        userTypeInfo = coreInfo["userTypes"][user.userType]

        for serverId, server in self.servers.items():
            if serverId == self.serverId:
                continue
            
            server.playerRemoved(user)


        if self.getPlayerFromServer(userId) == None:
            self.players[userId] = Player(user) # Add New Player
        else:
            rejoin = True # Player Rejoin / Refresh

        response["success"] = True
        response["broadcast"] = True
        response["respondTo"]["args"].append(self.players[userId].getDict())

        # DISCORD WEB HOOK EMBED MESSAGE
        messageEmbed = {
            "title": "Player Joined!",
            "description": "",
            "color": 0x00ff00,
            "fields": [
                {
                    "name": "Username: " + str(user.username),
                    "value": "User type: " + userTypeInfo["name"] + "\n" + "Account age: " + str(Utilities.secondsToDays(timeNow - user.registerTime)) + " days"
                },
                {
                    "name": "Server: " + str(self.serverId),
                    "value": "Map: " + str(self.map) + "\n" + "Player Count: " + str(len(self.players))
                }
            ]
        }

        packagedToSend = {
            "content": "",
            "embeds": [messageEmbed]
        }

        if not rejoin:
            botResponse = DiscordBot.send("joins", packagedToSend)

            # SERVER MESSAGE
            serverMessage = self.players[userId].user.username + " has joined the world!"
            self.socketIO.emit("serverRequest", [self.formatResponse(self.addChat(self.serverUser, serverMessage, logInDiscord=False))])

        return response

    def playerRemoved(self, user): # REMOVE PLAYER FROM SERVER
        # CORE
        response = {"success": False, "broadcast": True, "respondTo": {"object": "playersService", "args": ["playerRemoved"]}}
        timeNow = time.time()

        # Functions
        # INIT
        userId = user.userId

        if self.getPlayerFromServer(userId) == None:
            response["success"] = False
            return response

        response["success"] = True
        response["respondTo"]["args"].append(self.players[userId].getDict())
        response["broadcast"] = True
        self.players.pop(str(userId))
        
        # DISCORD WEB HOOK EMBED MESSAGE
        messageEmbed = {
            "title": "Player Left!",
            "description": "",
            "color": 0xff0000,
            "fields": [
                {
                    "name": "Username: " + str(user.username),
                    "value": "Account age: " + str(Utilities.secondsToDays(timeNow - user.registerTime)) + " days"
                },
                {
                    "name": "Server: " + str(self.serverId),
                    "value": "Map: " + str(self.map) + "\n" + "Player Count: " + str(len(self.players))
                }
            ]
        }

        packagedToSend = {
            "content": "",
            "embeds": [messageEmbed]
        }

        botResponse = DiscordBot.send("joins", packagedToSend)
        
        # SERVER MESSAGE
        serverMessage = user.username + " has left the world!"
        self.socketIO.emit("serverRequest", [self.formatResponse(self.addChat(self.serverUser, serverMessage, logInDiscord=False))])

        return response

        