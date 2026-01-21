# MODULES
# INTERNAL
from forms.settingsForm import SettingsForm

from modules.userHandler import UserHandler
from modules.utilities import Utilities
from modules.shortcuts import Shortcuts

from modules.google.recaptcha import Recaptcha

# EXTERNAL
import requests
import json
from flask import Blueprint, session, render_template, request, redirect, url_for, jsonify

# CORE
BluePrint = Blueprint("settings", __name__)
CurrentApp = None


# Functions
# MECHANICS
def Initialise(app):
    CurrentApp = app

#  Routes
@BluePrint.route("/settings")
def pageHandler():
    user = session.get("user", None)

    # IF NOT USER LOGGED IN
    if not user:
        return redirect(url_for("index.pageHandler"))


    #print(user["username"])

    user = UserHandler.getUserFromAttribute("username", user["username"], caseSensitive=False)
    form = SettingsForm(user=user)

    fieldNames = ["username", "password", "email", "deleteAccount"]

    return Shortcuts.renderPage("settings.html", "Settings", form=form, fieldNames=fieldNames)


@BluePrint.route("/settingChangeRequest", methods = ["POST"]) # AJAX
def settingsChangeRequest():
    # IF NOT ALREADY LOGGED IN
    if not session.get("user", None):
        return
    
    # CORE
    response = {
        "status": "failed",
        "redirect" : None
    }

    data = request.get_json()
    fieldName = data.get("fieldName", None)

    # Functions
    # INIT
    if fieldName == None:
        response["status"] = "failed"
        response["alert"] = {"type": "danger", "message": "No field name to update!"}
        response["redirect"] = None
        return jsonify(response)
    
    user = UserHandler.getUserFromAttribute("username", session.get("user", None)["username"], caseSensitive=False)
    print(data)

    if fieldName == "deleteAccount":
        deleteAccountResponse = UserHandler.deleteUser(user)

        response["alert"] = deleteAccountResponse["alert"]
        
        if deleteAccountResponse["success"]:
            response["status"] = "success"
            response["redirect"] = url_for("login.logoutRequestPageHandler")
        else:
            response["status"] = "failed"

        return jsonify(response)

    updateUserResponse = UserHandler.updateUser(user, data)
    response["alert"] = updateUserResponse["alert"]

    # IF FAILED TO REGISTER
    if not updateUserResponse["success"]:
        return jsonify(response) 

    # IF REGISTER SUCCESSFUL
    session["user"] = requests.get(request.host_url + "/api/v1/users/" + str(user.userId)).json() # API CALL FOR USER DATA

    response["status"] = "success"

    return jsonify(response) 

