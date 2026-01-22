/** 
 * REPLICATION SERVICE
 * -----------
 * - HANDLES QUICK CLIENT / SERVER WEB SOCKET COMMUNICATION (UDP)
 **/

export class ReplicationService 
{
    constructor(engine) 
    {
        // CORE
        this.engine = engine;

        this.connected = false;
        //this.viewportSize = viewportSize;

        // V DEFAULT HEADERS V
        //this.serverId = serverId;
        //this.userId = userId;

        // SOCKET
        this.socket = io();

        // TABLE OF BINDS FOR SERVER REQUESTS
        this.respondTo = {};

        //
        this.setup();
    }

    bindToRespondTo(objectName, object) 
    {
        // Functions
        // INIT
        //console.log("BINDING TO RESPOND TO");
        this.respondTo[objectName] = object;
        //console.log("UPDATED RESPOND TO");
        //console.log(this.respondTo);
    }

    send(methodName, ...args) 
    {
        // Functions
        // INIT

        const toSend = // Packaged args with necessary headers (server id, user id, etc)
        {
            "methodName": methodName, 
            "serverId": this.engine.serverId,
            "userId": this.engine.localUser.userId,
            "args": [...args]
        };

        console.log("Sending");
        console.log(toSend);
        this.socket.emit("clientRequest", toSend);
    }

    disconnect() 
    {
        // Functions
        // INIT
        try 
        {
            this.socket.disconnect();
        }
        catch 
        {
            console.log("Unable to disconnect!");
        }
    }

    draw() 
    {
        if (this.connected) 
        {
            return;
        }

        push();
        colorMode(RGB);
        rectMode(CENTER);
        translate(0, 0);

        const position = createVector(this.engine.viewportSize.x / 2, this.engine.viewportSize.y / 2);
        const size = this.engine.viewportSize;
        
        fill(0, 0, 0, 127);
        noStroke();
        rect(position.x, position.y, size.x, size.y);


        fill(255, 255, 255, 255);
        textSize(32);
        textAlign(CENTER, CENTER);
        text("DISCONNECTED! REJOIN WORLD :{", position.x, position.y);
        pop();
    }

    setup() 
    {
        // CORE
        let parentObject = this;

        // Functions
        // INIT
        this.socket.on("connect", function() {
            // Functions
            // INIT
            parentObject.connected = true;

        });

        this.socket.on("disconnect", function() {
            // Functions
            // INIT
            parentObject.connected = false;
        });

        this.socket.on("serverRequest", function(data)  // Server requesting from client
        {
            /**
             * STRUCTURE
             * ---------
             * data: 
             * {
             *      "respondTo": 
             *      {
             *          "object": OBJECT NAME DICTIONARY KEY IN this.respondTo
             *          "args": [ TABLE OF ARGUMENTS ]
             *      }
             * }
             * 
             **/


            // Functions
            // INIT

            console.log("Response received");
            console.log(data);

            if (data == null || data === undefined) 
            {
                return;
            }

            for (let responseData of data) 
            {
                if (responseData["serverId"] != parentObject.engine.serverId) // Make sure request lines up with current connected server
                {
                    continue;
                }
    
                if (responseData["respondTo"] != null) 
                {
                    //console.log("RESPOND TO");
                    //console.log(parentObject.respondTo);

                    //console.log("RESPONSE!!!");
                    //console.log(responseData);

                    const respondToObject = parentObject.respondTo[responseData["respondTo"]["object"]];
                    let method = respondToObject.serverRequest.bind(respondToObject);
    
                    return method(...responseData["respondTo"]["args"]);
                }
            }
        });
    }
}