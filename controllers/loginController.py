# MODULES
# INTERNAL

from modules.userHandler import UserHandler
from modules.debug import Debug
from modules.utilities import Utilities
from modules.shortcuts import Shortcuts
from modules.otp import OTP
from modules.google.recaptcha import Recaptcha

from forms.loginForm import LoginForm

# EXTERNAL
import time
from flask import Blueprint, session, request, redirect, url_for, jsonify
# CORE
BluePrint = Blueprint("login", __name__)

CurrentApp = None
GoogleSiteKey = None


# MECHANICS
def Initialise(app):
    # Functions
    # INIT
    CurrentApp = app
    GoogleSiteKey = app.config["RECAPTCHA_PUBLIC_KEY"]

    print("SETTING KEY")
    print(app.config["RECAPTCHA_PUBLIC_KEY"])

#  Routes
@BluePrint.route("/login")
def pageHandler():
    # Functions
    # INIT

    # IF ALREADY LOGGED IN
    if session.get("user", None) != None: 
        return redirect(url_for("index.pageHandler"))
    
    # IF STILL ON MULTI-FACTOR-AUTHENTICATION
    if session.get("mfaUserId", None) != None:
        return redirect(url_for("mfa.pageHandler"))

    userIdCookie = request.cookies.get("userId", None)
    userAuthTokenCookie = request.cookies.get("userAuthToken", None) # AUTHENTICATION TOKEN STRING

    if (userIdCookie != None and userAuthTokenCookie != None): # IF AUTH TOKEN EXISTS
        print("Attempting to authorise from token!")
        print(userAuthTokenCookie)
        authResponse = UserHandler.authoriseUserFromToken(userIdCookie, userAuthTokenCookie)

        if authResponse["success"]: # SUCCESSFUL LOGIN WITH AUTH
            print("Authorised from token!")

            loginResponse = UserHandler.loginToUser(userIdCookie)
            #session["user"] = requests.get(request.host_url + "/api/v1/users/" + str(userIdCookie)).json()

            if loginResponse["success"]:
                session["user"]["authToken"] = authResponse["token"]

                return redirect(url_for("index.pageHandler"))

    # IF NOT TOKEN AUTH
    form = LoginForm()

    print("GOOGLE SITE KEY")
    print(GoogleSiteKey)

    return Shortcuts.renderPage("login.html", "Login", form=form, siteKey=GoogleSiteKey)
    
@BluePrint.route("/logout", methods = ["POST", "GET"])
def logoutRequestPageHandler(): 
    # CORE
    mfaUserId = session.get("mfaUserId", None)
    userInfo = session.get("user", None)

    # IF USER IS LOGGED IN
    if (userInfo != None):
        otpCancelSuccess, otpCancelResponse = Debug.pcall(OTP.cancelOtp, userInfo["userId"]) # CANCEL MULTI-FACTOR-AUTHENTICATION -> SAVE DB SPACE
        resetUserIdSuccess, resetUserIdResponse = Debug.pcall(UserHandler.resetUserToken, userInfo["userId"]) # RESET TOKEN

    session["user"] = None # UNSET USER
    session["mfaUserId"] = None # UNSET MFA 
    session["logout"] = True 

    # IF MFA IS IN PROCESS
    if (mfaUserId != None):
        otpCancelSuccess, otpCancelResponse = Debug.pcall(OTP.cancelOtp, mfaUserId) # CANCEL MULTI-FACTOR-AUTHENTICATION -> SAVE DB SPACE

    return redirect(url_for("index.pageHandler"))

@BluePrint.route("/loginRequest", methods = ["POST"]) # AJAX REQUEST
def loginRequestPageHandler():
    # IF USER IS LOGGED IN
    if session.get("user", None):
        return redirect(url_for("index.pageHandler"))
    
    # CORE
    response = {
        "status": None,
        "redirect" : None
    }

    data = request.get_json()
    clientIP = Shortcuts.getClientIP()
    timeNow = time.time()

    # GOOGLE RECAPTCHA PROCESS
    googleRecaptchaResponse = Recaptcha.verifyForm(data)

    # IF USER IS A BOT (VERIFIED BY GOOGLE)
    if not googleRecaptchaResponse["success"]:
        response["status"] = "failed"
        response["alert"] = googleRecaptchaResponse["alert"]
        return jsonify(response)

    username = data.get("username") 
    password = data.get("password") 

    authoriseUserResponse = UserHandler.authoriseUser(username, password)
    session["alert"] = authoriseUserResponse["alert"]

    # IF USER AUTHORISED
    if authoriseUserResponse["success"]:
        user = UserHandler.getUserFromAttribute("username", username, caseSensitive=False)

        if (user.IP == clientIP) and (timeNow - user.lastLoginTime < 259200): # IF SIGN IN HAPPENS IN UNDER 3 DAYS OF LAST SIGN IN UNDER SAME IP
            loginResponse = UserHandler.loginToUser(user.userId)
        
        session["mfaUserId"] = user.userId
        response["redirect"] = url_for("mfa.pageHandler") 
        response["status"] = "success"
        
        return jsonify(response)

    # IF FAILED AUTHORISATION
    response["status"] = "failed"
    response["alert"] = authoriseUserResponse["alert"]

    return jsonify(response)