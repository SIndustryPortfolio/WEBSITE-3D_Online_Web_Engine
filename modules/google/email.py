# Modules
# EXT
import os
from flask_mail import Message
from flask import current_app
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart

# INT
from modules.utilities import Utilities

# CORE
coreInfo = Utilities.loadJson("static/json/core.json")

##

##
class Email:
    def send(receiverEmailAddress, subject, htmlBody): # SEND EMAIL THROUGH GMAIL BOT
        # CORE
        response = {"success": True, "alert": {"type": "success", "message": ""}}
        mail = current_app.extensions["mail"]

        # Functions
        # INIT
        _message = Message(subject, recipients=[receiverEmailAddress])
        _message.html = htmlBody

        success, pcallResponse = Utilities.pcall(mail.send, _message)

        if success:
            response["success"] = True
            response["alert"]["type"] = "success"
            response["alert"]["message"] = "SUCCESSFULLY SENT MAIL"
        else:
            response["success"] = False
            response["alert"]["type"] = "danger"
            response["alert"]["message"] = "FAILED TO SEND MAIL"

        return response


        
