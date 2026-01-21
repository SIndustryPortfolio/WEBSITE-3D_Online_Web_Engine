# Modules
# EXT
import time

# INT
from modules.game.character import Character

#
class Player:
    def __init__(self, user):
        self.user = user # USER OBJECT
        self.character = Character(self)
        self.lastActionTime = time.time()

    def getDict(self): # Return whats necessary to client
        return {
            "user": self.user.getDict(),
            "character": self.character.getDict()
        }