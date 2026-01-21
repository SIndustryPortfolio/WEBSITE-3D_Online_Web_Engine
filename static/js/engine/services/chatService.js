/** 
 * PLAYERS SERVICE
 * -----------
 * - HANDLES OTHER PLAYERS IN SERVER FOR REALTIME ONLINE MULTIPLAYER
 **/

// MODULES
import { utilitiesHandlerModule } from "../../handlers/utilitiesHandler.js";

// SERVICES
import { UtilitiesService } from "./utilitiesService.js";

//
export class ChatService 
{
    constructor(engine) 
    {
        // Functions
        // INIT
        this.engine = engine;

        //this.localUser = localUser;
        //this.soundService = soundService;
        //this.replicationService = replicationService;
        //this.coreInfo = coreInfo;
        this.chatInput = document.getElementById("chatInput");
        this.chatListDiv = document.getElementById("chatList");
        this.chatForm = document.getElementById("chatForm");
        //
        this.clientChatCount = 0;

        this.serverRequests = // Subscriptable methods for server to access
        {
            "addChat": this.addChat,
            "addPreviousChats": this.addPreviousChats
        }

        //
        this.setup();
    }

    setup() 
    {
        // CORE
        let parentObject = this;

        // Functions
        // INIT
        this.engine.replicationService.bindToRespondTo("chatService", this); // Bind to network replicator

        this.chatForm.addEventListener("submit", function(event) { // ON CHAT SUBMITTED
            // Functions
            // INIT
            event.preventDefault();
            var formData = utilitiesHandlerModule.formToDict(parentObject.chatForm); 
            let chatText = formData["chatText"];
            
            if (UtilitiesService.isStringEmptyOrWhitespace(chatText)) // Check if message is suitable
            {
                return;
            }

            parentObject.engine.replicationService.send("addChat", chatText);
            this.chatInput.value = "";
        });

        //
        this.engine.replicationService.send("getPreviousChats");

    }

    serverRequest(methodName, ...args) // HANDLE REQUESTS SENT BY SERVER
    {
        // Functions
        // INIT
        let method = this.serverRequests[methodName].bind(this);
        return method(...args);
    }

    addChat(chatInfo, isOldChat) // Add other pre-existing players to game
    {
        // CORE
        isOldChat = isOldChat || false;

        const userType = chatInfo["userType"];
        const username = chatInfo["username"];
        const message = chatInfo["message"];

        const userTypeInfo = this.engine.serverCoreInfo["userTypes"][chatInfo["userType"]];

        // Functions
        // INIT
        this.clientChatCount += 1;

        let chatParentDiv = document.createElement("div");
        chatParentDiv.style.width = "100%";

        // TIME
        chatParentDiv.innerHTML = "<p style='display: inline-block;' class='text-light fw-bold'>" + chatInfo["time"] + " |  ";

        // USER + TAG + SPECIAL COLOUR

        chatParentDiv.innerHTML += "<p style='display: inline-block;' class='text-" + userTypeInfo["colour"] + "'>" + " [" + userTypeInfo["name"] + "] " + username + ":</p></p>";

        // MESSAGE
        chatParentDiv.innerHTML += " <p class='text-secondary'>" + message + "</p>";
        
        // SPLITTER
        chatParentDiv.innerHTML += "<hr class='border-secondary'></hr>"; 

        this.chatListDiv.appendChild(chatParentDiv);
        this.chatListDiv.scrollTop = this.chatListDiv.scrollHeight;

        if (!isOldChat && username != this.engine.localUser["username"]) 
        {
            this.engine.soundService.playSound("misc", "notification");
        }
        
    }

    addPreviousChats(chatTable) 
    {
        // Functions
        // INIT
        for (let chatInfo of chatTable) 
        {
            this.addChat(chatInfo, true);
        }
    }

}