# MODULES
# EXT
import os
import requests

# CORE
recaptchaVerifyURL = "https://www.google.com/recaptcha/api/siteverify"

CurrentApp = None
SocketIO = None

# Functions
# MECHANICS
class Recaptcha:
    def verifyForm(formDict): # CHECK IF FORM WAS COMPLETED BY HUMAN
        # CORE
        response = {"success": True, "alert": {"type": "danger", "message": ""}}
        secretResponse = formDict["g-recaptcha-response"]

        verifyResponse = requests.post(url=f'{recaptchaVerifyURL}?secret={CurrentApp.config["RECAPTCHA_PRIVATE_KEY"]}&response={secretResponse}').json()

        if not verifyResponse["success"] or (verifyResponse["score"] < 0.5 and not CurrentApp.config["Debug"]):
            response["success"] = False
            response["alert"]["type"] = "danger"
            response["alert"]["message"] = "Failed google recaptcha"
            return response
        
        response["success"] = True
        response["alert"]["type"] = "success"
        response["alert"]["message"] = "successfully passed google recaptcha"

        return response

##
def Initialise(app, socketIO):
    # CORE
    global CurrentApp, SocketIO

    # Functions
    # INIT
    CurrentApp = app
    SocketIO = socketIO