# MODULES
# INT
from modules.discordBot import DiscordBot

# EXT
import asyncio
import time
from datetime import datetime

###
class Debug:
    @staticmethod
    def logError(exception, startFormattedTime, endFormattedTime):
        # Functions
        # INIT

        # DISCORD WEB HOOK EMBED MESSAGE
        messageEmbed = {
            "title": "Error Caught!",
            "description": "",
            "color": 0xff0000,
            "fields": [
                {
                    "name": "Start Time: " + str(startFormattedTime) + " | End Time: " + str(endFormattedTime),
                    "value": str(exception)
                },
            ]
        }

        packagedToSend = {
            "content": "",
            "embeds": [messageEmbed]
        }

        botResponse = asyncio.run(DiscordBot.send("errors", packagedToSend))

        return botResponse

