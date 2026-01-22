# Modules
# EXT
import math
import random
import time

from flask import render_template, session
from werkzeug.security import generate_password_hash, check_password_hash

# INT
from modules.userHandler import UserHandler
from modules.utilities import Utilities
from modules.database import Database
from modules.google.email import Email
from modules.debug import Debug

# CORE
coreInfo = Utilities.loadJson("static/json/core.json")

length = 6 # LENGTH OF OTP CODE
numbers = ("0", "1", "2", "3", "4", "5", "6", "7", "8", "9") # NUMBERS FOR OTP CODE

#
class OTP:
    def getRandomOTP(): # GENERATE RANDOM ONE TIME PASS CODE
        # Functions
        # INIT
        string = ""
        
        for x in range(0, length):
            string += numbers[random.randint(0, len(numbers) - 1)]
        
        return string
    

    def checkOtp(userId, requestOTP): # CHECK IF USER SENT OTP MATCHES
        # CORE
        timeNow = time.time()
        response = {"success": False, "alert": {"type": "danger", "message": ""}}
        recordFilter = {"userId": userId}
        otpCollection = Database.getDatabase()["otp"]

        # Functions
        # INIT
        otpRecord = otpCollection.find_one(recordFilter)

        if (otpRecord == None):
            response["success"] = False
            response["alert"]["type"] = "danger"
            response["alert"]["message"] = "No OTP available!"
            return response
        
        timeSpan = timeNow - otpRecord["time"]
        
        if (timeSpan > Utilities.minutesToSeconds(10)):
            response["success"] = False
            response["alert"]["type"] = "danger"
            response["alert"]["message"] = "OTP timed out!"
            return response
    
        if not check_password_hash(otpRecord["code"], requestOTP):
            response["success"] = False
            response["alert"]["type"] = "danger"
            response["alert"]["message"] = "OTP incorrect!"
            return response
    
        response["success"] = True
        response["alert"]["type"] = "success"
        response["alert"]["message"] = "Successfully verified!"

        return response

    def cancelOtp(userId): # DELETE ONE TIME PASSCODE
        # Core
        response = {"success": True, "alert": {"type": "success", "message": ""}}
        recordFilter = {"userId": userId}
        otpCollection = Database.getDatabase()["otp"]
        foundOTPRecord = otpCollection.find_one(recordFilter)

        if (foundOTPRecord != None):
            success, pcallResponse = Debug.pcall(otpCollection.delete_one, recordFilter)

            if success:
                response["success"] = True
                response["alert"]["type"] = "success"
                response["alert"]["message"] = "Successfully cancelled OTP!"
            else:
                response["success"] = False
                response["alert"]["type"] = "danger"
                response["alert"]["message"] = "Failed to cancel OTP!"

        return response

    def startOtp(userId): # START AND STORE THE ONE TIME PASSCODE
        # CORE
        response = {"success": False, "alert": {"type": "danger", "message": ""}}
        timeNow = time.time()

        otpPlainString = OTP.getRandomOTP()
        otpCollection = Database.getDatabase()["otp"]
        timeNow = time.time()

        subject = "Email 2FA for: " + coreInfo["name"]

        userInfo = UserHandler.getUserFromUserId(userId).getDict() #requests.get(request.host_url + "/api/v1/users/" + str(userId)).json()

        if userInfo == None:
            response["success"] = False
            response["alert"]["type"] = "danger"
            response["alert"]["message"] = "Failed to start OTP"
            return response

        recordFilter = {"userId": userId}

        # Functions
        # INIT
        overwrittenRecord = {"userId": userId, "time": timeNow, "code": generate_password_hash(otpPlainString)}
        oldOTPRecord = otpCollection.find_one(recordFilter)

        if (oldOTPRecord != None):
            timeSpan = timeNow - oldOTPRecord["time"]

            if (timeSpan < Utilities.minutesToSeconds(.5)):
                response["success"] = False
                response["alert"]["type"] = "danger"
                response["alert"]["message"] = "OTP already started: " + str(math.floor(timeSpan)) + " seconds ago!"
                return response
                
            otpCollection.replace_one(recordFilter, overwrittenRecord)
        else:
            otpCollection.insert_one(overwrittenRecord)

        htmlContent = render_template("email/otp.html", otp=otpPlainString)
        emailResponse = Email.send(userInfo["email"], subject, htmlContent)

        response["success"] = True
        response["alert"]["type"] = "success"
        response["alert"]["message"] = "Successfully sent OTP email"


        return response





