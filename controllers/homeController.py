# MODULES
# INTERNAL
from modules.utilities import Utilities
from modules.shortcuts import Shortcuts

from controllers.worldController import servers

# EXTERNAL
import json
from flask import Blueprint, session, redirect, url_for

# CORE
BluePrint = Blueprint("home", __name__)
CurrentApp = None
SocketIO = None

# FUNCTIONS
# MECHANICS
def Initialise(app, socketIO):
    # CORE
    global CurrentApp, SocketIO

    # Functions
    # INIT
    CurrentApp = app
    socketIO = socketIO

#  Routes
@BluePrint.route("/home")
def pageHandler():
    # Functions
    # INIT
    if not session.get("user", None): # IF NOT USER LOGGED IN
        return redirect(url_for("login.pageHandler"))


    return Shortcuts.renderPage("home.html", "Home", servers = servers)

