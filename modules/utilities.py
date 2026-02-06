# Modules
# EXT
import os
import json
import math
import re
from datetime import datetime
import time

# CORE
successToStatus = {
    True: "success",
    False: "failed"
}

CurrentApp = None
SocketIO = None

# Functions
#

class Utilities:
    @staticmethod
    def loadJson(path): # RETURN PARSED JSON DATA FROM FILE
        data = {}

        success, jsonFile = Utilities.pcall(open, "r", encoding="utf-8")

        if success:
            data = json.load(jsonFile)

        return data

    @staticmethod
    def isValidEmail(emailString):
        # Functions
        # INIT
        pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        return re.match(pattern, emailString) is not None

    @staticmethod
    def secondsToDays(seconds):
        # Functions
        # INIT
        return math.floor(seconds / 86400)

    @staticmethod
    def getSuccessToStatus(key):
        return successToStatus[key]

    @staticmethod
    def minutesToSeconds(minutes):
        return minutes * 60

    @staticmethod
    def dictHasKeys(dict, keys): # CHECK IF KEYS EXIST WITHIN DICTIONARY
        # CORE
        response = {"success": True, "missingKeys": []}

        # Functions
        # INIT
        for key in keys:
            if not key in dict:
                response["missingKeys"].append(key)
                response["success"] = False
            
        return response
    
    @staticmethod
    def tryFor(tries, function, *args, **kwargs):
        # CORE
        success, response = None, None

        # Functions
        # INIT
        for x in range(0, tries):
            success, response = Utilities.pcall(function, *args, **kwargs)

            if success:
                break
            else:
                time.sleep(1)
        
        return success, response
    
    @staticmethod
    def pcall(method, *args, **kwargs): # TRY CATCH WITH DEBUG LOG TO DISCORD
        # CORE
        formattedStartTime = datetime.now().strftime("%H:%M")
        error = None

        success = False
        response = None

        # Functions
        # INIT
        try:
            response = method(*args, **kwargs)
            success = True
        except (KeyboardInterrupt, SystemExit): # NO POINTLESS LOG ON SHUTDOWN
            pass
        except Exception as e:
            success = False
            response = None
            
            error = e

        formattedEndTime = datetime.now().strftime("%H:%M")

        if not success:
            DebugService = None
            
            if CurrentApp and ("Debug" in CurrentApp.config["Required"]):
                DebugService = CurrentApp.config["Required"]["Debug"]

            if DebugService:
                DebugService.Debug.logError(error, formattedStartTime, formattedEndTime)
            else:
                print(error)

        return success, response
    
    @staticmethod
    def stringAddList(string, list): # ["Hello", "World"] (ARRAY) ==>> "Hello, World" (STRING)
        # CORE
        count = 0
        listSize = len(list)
        stringToReturn = string

        # Functions
        ## INIT
        for element in list:
            count += 1

            stringToReturn += element
            if count != listSize:
                stringToReturn += ", "
    
        return stringToReturn
    
#
def Initialise(app, socketIO):
    # CORE
    global CurrentApp, SocketIO

    # Functions
    # INIT
    CurrentApp = app
    SocketIO = socketIO