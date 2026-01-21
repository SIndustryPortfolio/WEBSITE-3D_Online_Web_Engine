# MODULES
import os

# EXT
import requests

from modules.debug import Debug

# CORE
recaptchaVerifyURL = "https://www.google.com/recaptcha/api/siteverify"
recaptchaSecretKey = os.environ.get("GoogleSecretKey")

class Recaptcha:
    def verifyForm(formDict): # CHECK IF FORM WAS COMPLETED BY HUMAN
        # CORE
        response = {"success": True, "alert": {"type": "danger", "message": ""}}

        secretResponse = formDict["g-recaptcha-response"]
        #verifyResponse = requests.post(url=f'{recaptchaVerifyURL}?secret={recaptchaSecretKey}&response={secretResponse}').json()

        verifyResponse = requests.post(url=f'{recaptchaVerifyURL}?secret={recaptchaSecretKey}&response={secretResponse}').json()
        
        if not verifyResponse["success"] or verifyResponse["score"] < 0.5:
            response["success"] = False
            response["alert"]["type"] = "danger"
            response["alert"]["message"] = "Failed google recaptcha"
            return response
        
        response["success"] = True
        response["alert"]["type"] = "success"
        response["alert"]["message"] = "successfully passed google recaptcha"

        return response

