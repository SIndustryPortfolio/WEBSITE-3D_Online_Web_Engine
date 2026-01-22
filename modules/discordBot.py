# Modules

# EXT
import requests
import json

# CORE
CurrentApp = None
SocketIO = None

# Functions
# MECHANICS
def Initialise(app, socketIO):
    # CORE
    global CurrentApp, SocketIO

    # Functions
    # INIT
    CurrentApp = app
    SocketIO = socketIO

#
class DiscordBot:
    def send(channel, message): # SEND WEBHOOK TO DISCORD SERVER CHANNEL THROUGH PACKAGED JSON MESSAGE
        response = {"success": False, "alert": {"type": "danger", "message": ""}}

        try:
            postResponse = requests.post(CurrentApp.config["Discord" + channel + "URL"], data=json.dumps(message), headers={"Content-Type": "application/json"})
        
            if postResponse.status_code == 204:
                response["success"] = True
                response["alert"]["type"] = "success"
                response["alert"]["message"] = "Successfully sent discord message!"
            else:
                print(postResponse.text)

                response["success"] = False
                response["alert"]["type"] = "danger"
                response["alert"]["message"] = "Failed to send discord message!"
        except Exception as e:
            response["success"] = False
            response["alert"]["type"] = "danger"
            response["alert"]["message"] = "Failed to send discord message!"
        
        return response
