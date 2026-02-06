/** 
 * PLAYERS SERVICE
 * -----------
 * - HANDLES OTHER PLAYERS IN SERVER FOR REALTIME ONLINE MULTIPLAYER
 **/

// MODULES
import utilitiesHandlerModule from "../../handlers/utilitiesHandler.js";

// SERVICES
import UtilitiesService from "./utilitiesService.js";

//
class ChatService 
{
    constructor(engine) 
    {
        // Functions
        // INIT
        this.engine = engine;
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

        let chatHolderDiv = document.createElement("div");
        chatHolderDiv.classList.add("Chat");
        chatHolderDiv.style.display = "flex";
        chatHolderDiv.style.flexDirection = "column";

        let firstRow = document.createElement("row");

        /* TIME */
        let chatMetaText = document.createElement("p");
        chatMetaText.style.display = "inline-block";
        chatMetaText.classList.add("text-light", "fw-bold");
        chatMetaText.innerHTML = chatInfo["time"] + " |  ";

        /* TAG + Username */
        let chatUsernameText = document.createElement("p");
        chatUsernameText.style.display = "inline-block";
        chatUsernameText.classList.add("text-sm", "text-" + userTypeInfo["colour"])
        chatUsernameText.innerHTML = "[" + userTypeInfo["name"] + "] " + username + ":"

        firstRow.append(chatMetaText, chatUsernameText);

        let secondRow = document.createElement("row");

        let messageHolderDiv = document.createElement("div");
        messageHolderDiv.classList.add("shadow-sm");
        messageHolderDiv.style.borderRadius = "8px";
        messageHolderDiv.style.padding = "5px";

        let messageText = document.createElement("p");
        messageText.classList.add("text-sm", "text-light");
        messageText.innerHTML = message;


        // MESSAGE
        
        // SPLITTER

        messageHolderDiv.appendChild(messageText);
        secondRow.appendChild(messageHolderDiv);

        chatHolderDiv.append(firstRow, secondRow);

        this.chatListDiv.appendChild(chatHolderDiv);
        this.chatListDiv.scrollTop = this.chatListDiv.scrollHeight;

        if (username != this.engine.localUser["username"]) 
        {
            messageHolderDiv.classList.add("bg-secondary");
            messageHolderDiv.style.float = "left";
        }
        else 
        {
            messageHolderDiv.classList.add("bg-primary");
            messageHolderDiv.style.float = "right";
        }

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


export default ChatService