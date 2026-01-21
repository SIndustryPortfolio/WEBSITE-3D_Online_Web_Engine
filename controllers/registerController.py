# MODULES
# INTERNAL
from forms.registerForm import RegisterForm

from modules.userHandler import UserHandler
from modules.utilities import Utilities
from modules.shortcuts import Shortcuts

from modules.google.recaptcha import Recaptcha

# EXTERNAL
import time
import requests
import json
from flask import Blueprint, session, request, redirect, url_for, jsonify

# CORE
BluePrint = Blueprint("register", __name__)
CurrentApp = None
GoogleSiteKey = None

# Functions
# MECHANICS
def Initialise(app):
    # CORE
    global CurrentApp, GoogleSiteKey
    
    # Functions
    # INIT
    CurrentApp = app
    GoogleSiteKey = app.config["RECAPTCHA_PUBLIC_KEY"]

#  Routes
@BluePrint.route("/register")
def pageHandler():
    # IF USER ALREADY LOGGED IN
    if session.get("user", None):
        return redirect(url_for("index.pageHandler"))
    
    form = RegisterForm()
    return Shortcuts.renderPage("register.html", "Register", form=form, siteKey=GoogleSiteKey)

    

@BluePrint.route("/registerRequest", methods = ["POST"]) # AJAX
def registerRequestPageHandler():
    # IF ALREADY LOGGED IN
    if session.get("user", None):
        return redirect(url_for("index.pageHandler"))
    
    # CORE
    response = {
        "status": "failed",
        "redirect" : None
    }

    data = request.get_json()
    requestIP = Shortcuts.getClientIP()

    # GOOGLE VERIFY
    print("Verifying Google")
    googleRecaptchaResponse = Recaptcha.verifyForm(data)
    print("Verified via Google")

    # IF USER NOT A BOT
    if not googleRecaptchaResponse["success"]:
        response["status"] = "failed"
        response["alert"] = googleRecaptchaResponse["alert"]
        return jsonify(response)

    username = data.get("username")
    email = data.get("email")

    password = data.get("password")

    # Functions
    # INIT        
    print("1")
    registerUserResponse = UserHandler.registerUser(username, email, password, requestIP)
    print("2")
    response["alert"] = registerUserResponse["alert"]

    # IF FAILED TO REGISTER
    if not registerUserResponse["success"]:
        return jsonify(response) 
    print("3")


    # IF REGISTER SUCCESSFUL
    user = UserHandler.getUserFromAttribute("username", username, caseSensitive=False)
    print("4")
    loginResponse = UserHandler.loginToUser(user.userId)
    print("5")
    #session["user"] = requests.get(request.host_url + "/api/v1/users/" + str(user.userId)).json() # API CALL FOR USER DATA

    if loginResponse["success"]:
        response["status"] = "success"
    else:
        response["status"] = "failed"
        
    response["alert"] = loginResponse["alert"]
    response["redirect"] = url_for("index.pageHandler")

    print("6")
    return jsonify(response) 

