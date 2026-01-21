# MODULES
import os
import importlib

# EXT

#from apscheduler.schedulers.background import BackgroundScheduler

from flask import Flask, render_template, url_for
from flask_socketio import SocketIO
from flask_mail import Mail
from flask_wtf import recaptcha
from flask_wtf.csrf import CSRFProtect

# INT
from modules.google.recaptcha import Recaptcha, recaptchaSecretKey
from modules.utilities import Utilities
from modules.debug import Debug


# CORE
coreInfo = Utilities.loadJson("static/json/core.json")
#secureInfo = Utilities.loadJson("secure/json/secure.json")

#scheduler = BackgroundScheduler()

app = Flask(__name__)

## RESERVED CONFIG
app.config['SECRET_KEY'] = os.environ.get('SecretKey')
##
app.config["RECAPTCHA_PUBLIC_KEY"] = os.environ.get("GoogleSiteKey") #secureInfo["google"]["recaptcha"]["siteKey"]
app.config["RECAPTCHA_PRIVATE_KEY"] = recaptchaSecretKey  #recaptchaSecretKey
##
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 465
app.config["MAIL_USE_SSL"] = True
app.config["MAIL_PASSWORD"] = os.environ.get("EmailPassword") #secureInfo["google"]["email"]["appPassword"]
app.config["MAIL_USERNAME"] = os.environ.get("EmailAddress") #secureInfo["google"]["email"]["address"]
app.config["MAIL_DEFAULT_SENDER"] = os.environ.get("EmailAddress") #secureInfo["google"]["email"]["address"]


## MY CONFIG
app.config["DBUsername"] = os.environ.get("DBUsername")
app.config["DBKey"] = os.environ.get("DBKey")
##
app.config["APICacheTimeout"] = os.environ.get("APICacheTimeout")
app.config["APIKey"] = os.environ.get("APIKey")
##

mail = Mail(app)
csrf = CSRFProtect(app)
socketIO = SocketIO(app, async_mode="threading")

# CONTROLLERS
ControllerRegistry = {
    "controllers.api.apiV1",
    "controllers.worldController",
    "controllers.indexController",
    "controllers.homeController",
    "controllers.loginController",
    "controllers.registerController",
    "controllers.settingsController",
    "controllers.gameController",
    "controllers.multiFactorAuthenticationController"
}

RequiredModules = {} #CONTROLLERS

#from controllers.api.apiV1 import apiV1Blueprint
#from controllers.worldController import socketIO, servers
#from controllers.indexController import indexBlueprint
#from controllers.homeController import homeBlueprint
#from controllers.loginController import loginBlueprint
#from controllers.registerController import registerBlueprint
#from controllers.settingsController import settingsBlueprint
#from controllers.gameController import gameBlueprint
#from controllers.multiFactorAuthenticationController import multiFactorAuthenticationBlueprint


# Functions
# MECHANICS
def initialise():
    # Functions
    # INIT
    with app.app_context():
        for ModuleName in ControllerRegistry:
            RequiredModule = importlib.import_module(ModuleName)
            URLPrefix = None

            if hasattr(RequiredModule, "url_prefix"):
                URLPrefix = RequiredModule.url_prefix

            if hasattr(RequiredModule, "initialise"):
                RequiredModule.initialise(app)

            if hasattr(RequiredModule, "BluePrint"):
                app.register_blueprint(RequiredModule.BluePrint, url_prefix = URLPrefix)
            
            RequiredModules[ModuleName] = RequiredModule

        DiscordURLKeys = ["errors", "joins", "server1", "server2", "server3"]

        for ChannelKey in DiscordURLKeys:
            EnvironmentKey = "Discord" + ChannelKey + "URL"
            app.config[EnvironmentKey] = os.environ.get(EnvironmentKey)

        #scheduler.start()
        socketIO.run(app, host='0.0.0.0', port=os.environ["PORT"], debug=False, allow_unsafe_werkzeug=True)

def end():
    # Functions
    # INIT
   #scheduler.shutdown()
   pass

# INIT
#app.register_blueprint(apiV1Blueprint, url_prefix="/api/v1")

#app.register_blueprint(indexBlueprint)
#app.register_blueprint(homeBlueprint)
#app.register_blueprint(loginBlueprint)
#app.register_blueprint(multiFactorAuthenticationBlueprint)
#app.register_blueprint(registerBlueprint)
#app.register_blueprint(settingsBlueprint)
#app.register_blueprint(gameBlueprint)

if __name__ == "__main__":
    #success, response = Debug.pcall(initialise)
    initialise()
    end()

    #try:
    #    scheduler.start()
    #    socketIO.run(app, debug=True)
    #except (KeyboardInterrupt, SystemExit):
    #    pass
    #finally:
    #    scheduler.shutdown()