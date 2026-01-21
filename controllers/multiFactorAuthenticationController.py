# MODULES
# INTERNAL
from modules.otp import OTP

from modules.debug import Debug
from modules.token import Token
from modules.userHandler import UserHandler
from modules.utilities import Utilities
from modules.shortcuts import Shortcuts

from forms.mfaForm import MFAForm

# EXTERNAL
import requests
import json
from flask import Blueprint, session, render_template, request, redirect, url_for, jsonify

# CORE
BluePrint = Blueprint("mfa", __name__)
CurrentApp = None

# FUNCTIONS
# MECHANICS
def Initialise(app):
    # CORE
    global CurrentApp
    
    # Functions
    # INIT
    CurrentApp = app

def userLoginAuthorised(userId):
    # Functions
    # INIT

    # GENERATE RANDOM STRING TOKEN FOR USER
    postAuthResponse, token = UserHandler.postAuthorisation(userId)

    return token

#  Routes
@BluePrint.route("/mfa/cancelRequest", methods=["POST"]) # AJAX
def cancelMFA():
    # CORE
    mfaUserId = session.get("mfaUserId", None)
    
    # Functions
    # INIT

    # IF NO MFA PROCESS
    if (mfaUserId == None):
        return None

    response = {
        "status": None,
        "redirect": None
    }

    cancelResponse = OTP.cancelOtp(mfaUserId)

    # IF SUCCESSFULY CANCELLED AND DELETED OTP FROM DATABASE
    if (cancelResponse["success"]):
        session["mfaUserId"] = None
        response["redirect"] = url_for("index.pageHandler")

    response["status"] = Utilities.getSuccessToStatus(cancelResponse["success"])
    response["alert"] = cancelResponse["alert"]

    return jsonify(response)


@BluePrint.route("/mfa/authoriseRequest", methods = ["POST"]) # AJAX
def authoriseMFA():
    # CORE
    mfaUserId = session.get("mfaUserId", None)

    # Functions
    # INIT
    response = {
        "status": None,
        "redirect": None
    }

    # IF NO MULTI-FACTOR-AUTHENTICATION PROCESS
    if (mfaUserId == None):
        response["status"] = "failed"
        response["alert"] = {"type": "danger", "message": "No user found for OTP verification!"}
        response["redirect"] =  url_for("index.pageHandler")
        return jsonify(response)

    data = request.get_json()

    receivedOTP = data.get("otp")
    otpResponse = OTP.checkOtp(mfaUserId, receivedOTP)

    response["status"] = Utilities.getSuccessToStatus(otpResponse["success"])
    response["alert"] = otpResponse["alert"]

    # IF PASSED MFA PROCESS
    if (otpResponse["success"]):
        endOTPResponse = OTP.cancelOtp(mfaUserId)

        # IF SUCCESSFULLY DELETED OTP ENTRY IN DATA BASE
        if (endOTPResponse["success"]):
            #session["user"] = requests.get(request.host_url + "/api/v1/users/" + str(mfaUserId)).json()
            loginResponse = UserHandler.loginToUser(mfaUserId)

            if loginResponse["success"]:
                response["status"] = "success"
                response["redirect"] = url_for("index.pageHandler")
            else:
                response["status"] = "failed"
                response["alert"] = loginResponse["alert"]
        else:
            response["status"] = "failed"
            response["alert"] = endOTPResponse["alert"]
 
    return jsonify(response)


@BluePrint.route("/mfa/resendRequest", methods=["POST"]) # AJAX
def resendMFA():
    # CORE
    mfaUserId = session.get("mfaUserId", None)
    response = {
        "status": None,
        "redirect" : None
    }

    # IF USER IS NOT IN MULTI FACTOR AUTHENTICATION PROCESS
    if (mfaUserId == None):
        return None
        
    success, otpResponse = Debug.pcall(OTP.startOtp, mfaUserId)

    if not success:
        response["status"] = "failed"
    else:
        response["alert"] = otpResponse["alert"]
        response["status"] = "success"

    return jsonify(response)


@BluePrint.route("/mfa")
def pageHandler():
    # CORE
    mfaUserId = session.get("mfaUserId", None)

    # Functions
    # INIT

    # IF USER ALREADY LOGGED IN OR MULTI-FACTOR-AUTHENTICATION NOT IN PROCESS
    if (session.get("user", None) != None) or (mfaUserId == None):
        return redirect(url_for("index.pageHandler"))

    response = OTP.startOtp(mfaUserId)

    form = MFAForm()
    return Shortcuts.renderPage("mfa.html", "MFA", form=form)



