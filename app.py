# MODULES
import os
import importlib

# EXT
from dotenv import load_dotenv, dotenv_values

from flask import Flask, render_template, url_for
from flask_socketio import SocketIO
from flask_mail import Mail
from flask_wtf import recaptcha
from flask_wtf.csrf import CSRFProtect

# INT
from modules.environment import Environment
from modules.utilities import Utilities

# CORE
coreInfo = Utilities.loadJson("static/json/core.json")

app = Flask(__name__)

## RESERVED CONFIG
app.config['SECRET_KEY'] = Environment.get("SecretKey")
##
app.config["RECAPTCHA_PUBLIC_KEY"] = Environment.get("GoogleSiteKey")
app.config["RECAPTCHA_PRIVATE_KEY"] = Environment.get("GoogleSecretKey")
##
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 465
app.config["MAIL_USE_SSL"] = True
app.config["MAIL_PASSWORD"] = Environment.get("EmailPassword")
app.config["MAIL_USERNAME"] = Environment.get("EmailAddress")
app.config["MAIL_DEFAULT_SENDER"] = Environment.get("EmailAddress")
##
app.config["CoreInfo"] = coreInfo

## MY CONFIG
app.config["DBUsername"] = Environment.get("DBUsername")
app.config["DBKey"] = Environment.get("DBKey")
##
app.config["APICacheTimeOut"] = Environment.get("APICacheTimeOut")
app.config["APIKey"] = Environment.get("APIKey")
##
app.config["Debug"] = True

print(Environment.get("APICacheTimeout"))

mail = Mail(app)
csrf = CSRFProtect(app)
socketIO = SocketIO(app, async_mode="threading")

# CONTROLLERS
ModuleRegistry = {
    # API
    "mapServiceCache" : "controllers.api.caches.mapServiceCache",
    "textureServiceCache" : "controllers.api.caches.textureServiceCache",
    "userServiceCache" : "controllers.api.caches.userServiceCache",

    # SERVICES
    "environment" : "modules.environment",
    "debug" : "modules.debug",
    "utilities" : "modules.utilities",
    "shortcuts" : "modules.shortcuts",
    "database" : "modules.database",
    "discordBot" : "modules.discordBot",
    "token" : "modules.token",
    "otp" : "modules.otp",
    "user" : "modules.user",
    "userHandler" : "modules.userHandler",

    # game
    "character" : "modules.game.character",
    "player" : "modules.game.player",
    "server" : "modules.game.server",

    # google
    "email" : "modules.google.email",
    "recaptcha" : "modules.google.recaptcha",

    # CONTROLLERS
    "apiV1" : "controllers.api.apiV1",
    "worldController" : "controllers.worldController",
    "indexController" :  "controllers.indexController",
    "homeController" :  "controllers.homeController",
    "loginController" :  "controllers.loginController",
    "registerController"  : "controllers.registerController",
    "settingsController" :  "controllers.settingsController",
    "gameController" : "controllers.gameController",
    "multiFactorAuthenticationController" : "controllers.multiFactorAuthenticationController"
}

app.config["Required"] = {} # ALL LOADED SERVICES

# Functions
# MECHANICS
def LoadModules():
    # Functions
    # INIT
    for ModuleName, ModulePath in ModuleRegistry.items():
        RequiredModule = importlib.import_module(ModulePath)
        URLPrefix = None

        if hasattr(RequiredModule, "url_prefix"):
            URLPrefix = RequiredModule.url_prefix

        if hasattr(RequiredModule, "Initialise"):
            RequiredModule.Initialise(app, socketIO)

        if hasattr(RequiredModule, "BluePrint"):
            app.register_blueprint(RequiredModule.BluePrint, url_prefix = URLPrefix)
        
        app.config["Required"][ModuleName] = RequiredModule


def Initialise():
    # Functions
    # INIT
    with app.app_context():
        LoadModules()
        
        DiscordURLKeys = ["errors", "joins", "server1", "server2", "server3"]

        for ChannelKey in DiscordURLKeys:
            EnvironmentKey = "Discord" + ChannelKey + "URL"
            app.config[EnvironmentKey] = Environment.get(EnvironmentKey)

        socketIO.run(app, host='0.0.0.0', port=Environment.get("PORT"), debug=app.config["Debug"], allow_unsafe_werkzeug=True)

def end():
    # Functions
    # INIT
   pass

# INIT
if __name__ == "__main__":
    Utilities.pcall(Initialise)
    end()
