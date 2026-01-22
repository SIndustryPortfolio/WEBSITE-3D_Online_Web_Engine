/** 
 * PLAYERS SERVICE
 * -----------
 * - HANDLES OTHER PLAYERS IN SERVER FOR REALTIME ONLINE MULTIPLAYER
 **/

import Character from "../modules/character.js";

class PlayersService 
{
    constructor(engine) 
    {
        // Functions
        // INIT
        this.engine = engine;

        //this.pagesInfo = pagesInfo;
        
        //this.localUser = localUser;
        this.localUserLeft = false;
        this.localUserJoinedServer = false;

        //this.map = map;
        //this.replicationService = replicationService;
        //this.runService = runService;
        //this.physicsService = physicsService;
        //

        this.players = 
        {
            [this.engine.localUser.userId]: this.engine.localUser
        }

        this.serverRequests = // Subscriptable methods for server to access
        {
            "updateCharacters": this.updateCharacters,
            "addPlayers": this.addPlayers,
            "playerAdded": this.playerAdded,
            "playerRemoved": this.playerRemoved
        }

        //
        this.setup();
    }

    setup() 
    {
        // Functions
        // INIT
        this.engine.replicationService.bindToRespondTo("playersService", this); // Bind to network replicator
    }

    serverRequest(methodName, ...args) // HANDLE REQUESTS SENT BY SERVER
    {
        // Functions
        // INIT
        let method = this.serverRequests[methodName].bind(this);
        return method(...args);
    }

    addPlayers(tableOfPlayers) // Add other pre-existing players to game
    {
        // Functions
        // INIT
        for (let userId in tableOfPlayers) 
        {
            this.playerAdded(tableOfPlayers[userId]);
        }
    }

    playerAdded(playerTable) // New player joined
    {
        // Functions
        // INIT
        if (playerTable["user"]["userId"] == this.engine.localUser["userId"]) 
        {
            this.localUserJoinedServer = true;
            return;
        }

        this.players[playerTable["user"]["userId"]] = playerTable["user"];

        let character = new Character(this, true, null);
        this.engine.runService.objects["characters"][playerTable["user"]["userId"]] = character;
    }

    playerRemoved(playerTable) // Player left / timed out
    {
        // Functions
        // INIT
        if (playerTable["user"]["userId"] == this.engine.localUser["userId"]) 
        {
            if (this.localUserLeft != false)
            {
                return;
            }

            this.localUserLeft = true;
            window.location.href = window.location.origin + this.engine.serverPagesInfo["home"]["redirectLink"];
            return;
        }

        delete this.players[playerTable["user"]["userId"]];
        delete this.engine.runService.objects["characters"][playerTable["user"]["userId"]];
    }

    updateCharacters(updateTable) // Update all character properties
    {
        // Functions
        // INIT
        for (const userId in this.engine.runService.objects["characters"]) 
        {
            if (userId == this.engine.localUser.userId || userId == null || userId === undefined) 
            {
                continue;
            }

            const toReplaceWith = updateTable[userId];

            if (toReplaceWith == null) 
            {
                continue;
            }

            for (const propertyName in toReplaceWith) 
            {
                this.engine.runService.objects["characters"][userId][propertyName] = toReplaceWith[propertyName];
            }
        }
    }

    lateUpdate() 
    {
        // Functions
        // INIT
        //this.replicationService.send("getCharacters"); // Request to -> updateCharacters
    }
}

export default PlayersService;