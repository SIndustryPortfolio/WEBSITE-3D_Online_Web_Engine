# MODULES
# EXT
import time
import re
import requests

from flask import session, request
from werkzeug.security import generate_password_hash, check_password_hash

# INT
from modules.utilities import Utilities
from modules.database import Database
from modules.user import User
from modules.token import Token
from modules.debug import Debug
from modules.shortcuts import Shortcuts

# CORE
registerInfo = Utilities.loadJson("static/json/register.json")

# 
class UserHandler:

    def getValidators():
        # Functions
        # INIT
        validators = {
            "username": UserHandler.isValidUsername,
            "password": UserHandler.isValidPassword,
            "email": UserHandler.isValidEmail
        }

        return validators
    
    def isValidEmail(email): #IF EMAIL IS CORRECT FORMAT
        # CORE
        response = {"success": False, "alert": {"type": "danger", "message": ""}, "formattedString": ""}

        # Functions
        # INIT
        response["formattedString"] = email.strip()

        email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'  # Regular expression for validating an email
        
        # Match the email with the regex pattern
        if re.match(email_regex, email):
            response["success"] = True
            response["alert"]["type"] = "success"
            response["alert"]["message"] = "Valid email!"

            return response
        else:
            response["success"] = False
            response["alert"]["type"] = "danger"
            response["alert"]["message"] = "Invalid email!"
            return response


    def isValidPassword(password): #IF PASSWORD IS CORRECT FORMAT
        # CORE
        response = {"success": False, "alert": {"type": "danger", "message": ""}, "formattedString": ""}
        passwordLength = len(password)

        # Functions
        # INIT
        response["formattedString"] = password

        if passwordLength > registerInfo["maxPasswordLength"]:
            response["success"] = False
            response["alert"]["type"] = "danger"
            response["alert"]["message"] = "Password too long!"
            return response
        elif passwordLength < registerInfo["minPasswordLength"]:
            response["success"] = False
            response["alert"]["type"] = "danger"
            response["alert"]["message"] = "Password too short!"
            return response
        
        response["success"] = True
        response["alert"]["type"] = "success"
        response["alert"]["message"] = "Valid password!"

        return response

    def isValidUsername(username): # IF USERNAME IS CORRECT FORMAT
        # CORE
        response = {"success": False, "alert": {"type": "danger", "message": ""}, "formattedString": ""}
        usernameLength = len(username)
        
        # Functions
        # INIT
        response["formattedString"] = username.strip()

        if usernameLength > registerInfo["maxUsernameLength"]:
            response["success"] = False
            response["alert"]["type"] = "danger"
            response["alert"]["message"] = "Username too long!"
            return response
        elif usernameLength < registerInfo["minUsernameLength"]:
            response["success"] = False
            response["alert"]["type"] = "danger"
            response["alert"]["message"] = "Username too short!"
            return response

        userAlreadyExists = UserHandler.getUserFromAttribute("username", username, caseSensitive=False)

        if userAlreadyExists != None:
            response["success"] = False
            response["alert"]["type"] = "danger"
            response["alert"]["message"] = "User already exists!"
            return response

        response["success"] = True
        response["alert"]["type"] = "success"
        response["alert"]["message"] = "Valid username!"

        return response

    # ACCESSORS
    def getUserFromRecord(userRecord): # CREATE USER OBJECT FROM DATABASE DOCUMENT RECORD
        # Functions
        # INIT
        return User(userRecord["userId"], userRecord["username"], userRecord["userType"], userRecord["email"], userRecord["emailVerified"], userRecord["registerTime"], userRecord["lastLoginTime"], userRecord["IP"])

    def getUserFromUserId(userId): # RETURN USER FROM USER ID
        # Functions
        # INIT
        userCollection = Database.getDatabase()["user"]
        userRecord = userCollection.find_one({"userId": str(userId)})

        if userRecord != None:
            return UserHandler.getUserFromRecord(userRecord)
        else:
            return None

    def getUserFromAttribute(attributeName, value, caseSensitive=True): # RETURN USER FROM USERNAME
        # Functions
        # INIT
        userCollection = Database.getDatabase()["user"]
        userRecord = None
        
        success = None

        if caseSensitive == True:
            success, userRecord = Debug.pcall(userCollection.find_one, {attributeName: value})
        else:
            success, userRecord = Debug.pcall(userCollection.find_one, {attributeName : {"$regex" : "^" + value + "$", "$options": "i"}})

        if not success:
            #print("GET " + attributeName + " FAILED")
            return None

        if userRecord == None:
            #print("NO " + attributeName + " FOUND")
            return None
        else:
            return UserHandler.getUserFromRecord(userRecord)
    

    # MUTATORS
    def resetUserToken(userId): # REGEN USER AUTHENTIACTION TOKEN
        #CORE
        response = {"success": False, "alert": {"type": "danger", "message": ""}, "token": None}

        # GENERATE RANDOM TOKEN STRING
        token = Token.generate()
        userCollection = Database.getDatabase()["user"]
        recordFilter = {"userId": userId}

        # Functions
        # MECHANICS
        def replace():
            # Functions
            # INIT
            foundUserRecord = userCollection.find_one(recordFilter)
            foundUserRecord["token"] = token

            # REPLACE USER TOKEN STRING
            userCollection.replace_one(recordFilter, foundUserRecord)


        # INIT
        success, pcallResponse = Debug.pcall(replace)

        if success:
            response["success"] = True
            response["alert"]["type"] = "success"
            response["alert"]["message"] = "Successfully created auth token!"
            response["token"] = token
        else:
            response["success"] = False
            response["alert"]["type"] = "danger"
            response["alert"]["message"] = "Failed to create auth token!"

        return response

    def postAuthorisation(userId):
        # CORE
        response = {"success": True, "alert": {"type": "success", "message": ""}}

        # Functions
        # INIT
        return response


    def authoriseUserFromToken(userId, token): # CHECK IF CLIENT AUTHENTICATION TOKEN MATCHES
        # CORE
        response = {"success": False, "alert": {"type": "", "message": ""}, "token": ""}

        # Functions
        # INIT
        userCollection = Database.getDatabase()["user"]
        userRecord = userCollection.find_one({"userId": userId})

        if userRecord == None:
            response["success"] = False
            response["alert"]["type"] = "danger"
            response["alert"]["message"] = "No user found!"
            return response
        
        if token != userRecord["token"]:
            response["success"] = False
            response["alert"]["type"] = "danger"
            response["alert"]["message"] = "Invalid user auth token!"
            return response

        response["success"] = True
        response["alert"]["type"] = "success"
        response["alert"]["message"] = "Successful login!"
        response["token"] = userRecord["token"]

        return response

    def authoriseUser(username, password): # STANDARD AUTHORISATION CHECK FOR USERNAME PASSWORD COMBO LOGIN
        # CORE
        response = {"success": False, "alert": {"type": "", "message": ""}}

        # Functions
        # INIT
        userCollection = Database.getDatabase()["user"]
        userRecord = userCollection.find_one({"username": username})

        if userRecord == None:
            response["success"] = False
            response["alert"]["type"] = "danger"
            response["alert"]["message"] = "User doesn't exist!"
            return response
        
        if not check_password_hash(userRecord["password"], password):
            response["success"] = False
            response["alert"]["type"] = "danger"
            response["alert"]["message"] = "Incorrect login details!"
            return response

        response["success"] = True
        response["alert"]["type"] = "success"
        response["alert"]["message"] = "Successful login!"

        return response    

    def deleteUser(user):
        # CORE
        response = {"success": False, "alert": {"type": "danger", "message": ""}}
        userCollection = Database.getDatabase()["user"]

        # Functions
        # INIT
        success, error = Debug.pcall(userCollection.delete_one, {"userId": str(user.userId)})

        response["success"] = success
        if success:
            response["alert"]["type"] = "success"
            response["alert"]["message"] = "Successfully deleted account!"
        else:
            response["alert"]["type"] = "danger"
            response["alert"]["message"] = "Connection failed! Please retry.."

        return response
    
    def updateUser(user, data):
        # CORE
        response = {"success": False, "alert": {"type": "danger", "message": ""}}
        userCollection = Database.getDatabase()["user"]

        # Functions
        # INIT
        input1Data = data.get("input1", None)
        input2Data = data.get("input2", None)

        if input1Data != input2Data:
            response["success"] = False
            response["alert"]["type"] = "danger"
            response["alert"]["message"] = "Fields don't match!"
            return response

        fieldToUpdate = data.get("fieldName", None)

        if fieldToUpdate == None:
            response["success"] = False
            response["alert"]["type"] = "danger"
            response["alert"]["message"] = "No field to update!"
            return response
        
        validInputResponse = UserHandler.getValidators()[fieldToUpdate](input1Data)
        input1Data = validInputResponse["formattedString"]

        if not validInputResponse["success"]:
            return validInputResponse
        
        success, pcallResponse = Debug.pcall(userCollection.update_one, {"userId": str(user.userId)}, {"$set": {fieldToUpdate: input1Data}})

        if success:
            response["success"] = True
            response["alert"]["type"] = "success"
            response["alert"]["message"] = "Successfully updated " + fieldToUpdate + "!"

            requests.post(Shortcuts.getHostURL() + "/api/v1/users/update", {"userId": str(user.userId)})
        else:
            response["success"] = False
            response["alert"]["type"] = "danger"
            response["alert"]["message"] = "Connection failed! Please retry.."

        return response

        
    def registerUser(username, email, password, IP): # REGISTER USER BASED ON CREDENTIALS
        # CORE
        timeNow = time.time()
        response = {"success": True, "alert": {"type": "", "message": ""}}

        # Functions
        # INIT
        #username = username.strip() # REMOVE EXCESS WHITESPACE
        #email = email.strip() # REMOVE EXCESS WHITESPACE

        print("a")
        userCollection = Database.getDatabase()["user"]
        print("b")
        emailResponse = UserHandler.isValidEmail(email)
        print("c")

        if not emailResponse["success"]:
            return emailResponse

        email = emailResponse["formattedString"]
        emailAlreadyExists = UserHandler.getUserFromAttribute("email", email, caseSensitive=False)
        print("d")

        if emailAlreadyExists:
            response["success"] = False
            response["alert"]["type"] = "danger"
            response["alert"]["message"] = "Email already in use!"
            return response

        print("e")
        usernameResponse = UserHandler.isValidUsername(username)
        print("f")

        if not usernameResponse["success"]:
            return usernameResponse

        print("g")
        username = usernameResponse["formattedString"]
        
        passwordResponse = UserHandler.isValidPassword(password)

        print("h")
        if not passwordResponse["success"]:
            return passwordResponse
        
        password = passwordResponse["formattedString"]

        print("i")
        nextUserId = Database.getAndUpdateCounter("user")

        print("j")
        hashedPassword = generate_password_hash(password)
        print("k")

        if nextUserId == None:
            response["success"] = False 
            response["alert"]["type"] = "danger"
            response["alert"]["message"] = "Failed to connect!"
            return response

        print("l")
        success, pcallResponse = Debug.pcall(userCollection.insert_one, {
            "userId": str(nextUserId),
            "username": username, 
            "email": email, 
            "emailVerified": False, 
            "password": hashedPassword, 
            "registerTime": timeNow,
            "lastLoginTime": timeNow,
            "IP": str(IP),
            "userType": str(1)
        })
        print("m")

        if success:
            response["success"] = True
            response["alert"]["type"] = "success"
            response["alert"]["message"] = "Successfully registered user!"
        else:
            response["success"] = False
            response["alert"]["type"] = "danger"
            response["alert"]["message"] = "Connection failed! Please retry.."

        print("n")
        return response
    

    def loginToUser(userId):
        # CORE
        userCollection = Database.getDatabase()["user"]
        timeNow = time.time()
        response = {"success": True, "alert": {"type": "", "message": ""}}

        # Functions
        # INIT
        requestIP = Shortcuts.getClientIP()

        success1, pcallResponse1 = Debug.pcall(userCollection.update_one, {"userId": str(userId)}, {"$set": {"lastLoginTime": timeNow, "IP": str(requestIP)}}) # UPDATE LAST LOGIN TIME
        success, pcallResponse = Debug.pcall(UserHandler.getUserFromUserId, userId) #Debug.pcall(requests.get, request.host_url + "/api/v1/users/" + str(userId)) # API CALL FOR USER DATA

        if success:
            session["user"] = pcallResponse.getDict() #pcallResponse.json() #requests.get(request.host_url + "/api/v1/users/" + str(userId)).json() # API CALL FOR USER DATA

            response = UserHandler.resetUserToken(session["user"]["userId"]) #userLoginAuthorised(session["user"]["userId"])

            if response["success"]:
                session["user"]["authToken"] = response["token"]

                print("Set Token to: ")
                print(response["token"])

            response["success"] = True
            response["alert"]["type"] = "success"
            response["alert"]["message"] = "Successful login!"
        else:
            response["success"] = False
            response["alert"]["type"] = "danger"
            response["alert"]["message"] = "Failed to login!"

        return response
            
        