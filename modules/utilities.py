# Modules
import os
import json
import math
import re

# CORE
successToStatus = {
    True: "success",
    False: "failed"
}

class Utilities:
    def loadJson(path): # RETURN PARSED JSON DATA FROM FILE
        data = None

        with open(path, "r", encoding = "utf-8") as file:
            data = json.load(file)

        return data

    def isValidEmail(emailString):
        # Functions
        # INIT
        pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        return re.match(pattern, emailString) is not None

    def secondsToDays(seconds):
        # Functions
        # INIT
        return math.floor(seconds / 86400)

    def getSuccessToStatus(key):
        return successToStatus[key]

    def minutesToSeconds(minutes):
        return minutes * 60

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