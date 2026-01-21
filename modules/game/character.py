class Character:
    def __init__(self, player):
        self.player = player # PLAYER OBJECT
        ##
        self.subscriptable = {
            "position": [],
            "heading": 0
        }

    def __getitem__(self, key): # GET SUBSCRIPTABLE
        return self.subscriptable[key]
    
    def __setitem__(self, key, value): # SET SUBSCRIPTABLE
        self.subscriptable[key] = value

    def getDict(self): # Return whats necessary to client
        return {
            "position": self.subscriptable["position"],
            "heading": self.subscriptable["heading"]
        } 