# MODULES
# INTERNAL
from modules.utilities import Utilities

# EXTERNAL
import json
from flask import Blueprint, session, request, redirect, url_for

# CORE
BluePrint = Blueprint("index", __name__)
CurrentApp = None

# FUNCTIONS
# MECHANICS
def Initialise(app):
    CurrentApp = app

#  Routes
@BluePrint.route("/")
def pageHandler():
    # CORE
    user = session.get("user", None) # GET USER IF LOGGED IN
    mfaUserId = session.get("mfaUserId", None) # IF USER AT MULTI-FACTOR AUTHENTICATION STAGE

    if user == None: # NOT LOGGED IN
        if mfaUserId == None:
            # REDIRECT TO LOGIN PHASE 1 PAGE
            return redirect(url_for("login.pageHandler", **request.args))
        else:
            # REDIRCT TO LOGIN PHASE 2 PAGE -> MULTI FACTOR AUTHENTICATION
            return redirect(url_for("mfa.pageHandler", **request.args))
        
    else: # LOGGED IN
        # REDIRECT TO HOME PAGE
        return redirect(url_for("home.pageHandler", **request.args))

