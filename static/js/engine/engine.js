/** 
 * ENGINE
 * ------
 * - THE MAIN RUNTIME
 **/

var engineModule = {}

// Modules
import Camera from "./modules/camera.js";
import Character from "./modules/character.js";
import Map from "./modules/map.js";
import FPS from "./modules/fps.js";

// Services
import ReplicationService from "./services/replicationService.js";
import LightingService from "./services/lightingService.js";
import RunService from "./services/runService.js";
import CharacterController from "./controllers/characterController.js";
import PhysicsService from "./services/physicsService.js";
import UtilitiesService from "./services/utilitiesService.js";
import PlayersService from "./services/playersService.js";
import ChatService from "./services/chatService.js";
import SoundService from "./services/soundService.js";

// CORE
let _staticFolderLocation;
let _serverCoreInfo;
let _serverPagesInfo;
let _serverId;
let _localUser;
let _serverMapData;
let _serverTextures;
let _serverMapMeta;


var gameEngine;

//
class Engine
{
    // Services
    //chatService; // HANDLES TEXT CHAT BOX
    //playersService; // HANDLES OTHER PLAYERS -> Multiplayer
    //replicationService; // WEB SOCKET COMMUNICATION
    //runService; // CENTRALISED RENDER METHODS / OBJECTS
    //lightingService; // SKY AND FLOOR COLOURS
    //physicsService; // COLLISION DETECTION
    //soundService; // AUDIO

    // CORE
    //staticFolderLocation;

    //serverCoreInfo;
    //serverPagesInfo;

    //serverId; // ID of connected server
    //localUser; // USER DICT from session

    //serverMap; // RAW MAP CONTENT AND SKY
    //serverMapMeta; // MAP GRID NUMBER TO INFO

    //serverTextures; // RAW IMAGE PIXEL DATA

    //containerName = "gameContainer";


    //fps; // FPS CALCULATOR OBJECT

    //map; // MAP OBJECT
    //mapHeight; // ACTUAL MAP HEIGHT
    //mapWidth; // ACTUAL MAP WIDTH

    //gameContainer;
    //canvas; // VIEWPORT
    //height; // VIEWPORT HEIGHT
    //width; // VIEWPORT WIDTH

    //character; // LOCAL CHARACTER (CLIENT)
    //; // LOCAL CHARACTER CONTROLLER -> INPUT HANDLER (CLIENT)

    //camera; // LOCAL CAMERA (CLIENT)

    // Functions
    // MECHANICS
    resize() 
    {
        const cardSize = createVector(this.cardContentDiv.offsetWidth, this.cardContentDiv.offsetHeight);
        const chatDiv = this.cardChildren[0];
        const chatSize = createVector(chatDiv.offsetWidth, this.offsetHeight);

        const gameplayAreaSize = createVector(cardSize.x - chatSize.x, cardSize.y);

        this.viewportSize.x = gameplayAreaSize.x + 1;
        this.viewportSize.y = gameplayAreaSize.y + 1;

        if (this.canvas) 
        {
            resizeCanvas(this.viewportSize.x, this.viewportSize.y);
        }

        this.viewportLongestLength = Math.sqrt(Math.pow(this.viewportSize.x, 2) + Math.pow(this.viewportSize.y, 2));
    }

    setup() // THE FIRST FRAME BEFORE DRAW, UPDATE, LATE UPDATE
    {
        // Functions
        // INIT
        this.setupFinishedCalled = false;

        this.staticFolderLocation = _staticFolderLocation;
        this.serverCoreInfo = _serverCoreInfo;
        this.serverPagesInfo = _serverPagesInfo;
        this.serverId = _serverId;
        this.localUser = _localUser;
        this.serverMapData = _serverMapData;
        this.serverMapMeta = _serverMapMeta;
        this.serverTextures = _serverTextures;
        //

        //this.height = 720;
        //this.width = 1280;

        this.gameMapWidth = 1000;
        this.gameMapHeight = 500;

        this.containerName = "gameContainer";
 
        this.viewportSize = createVector(this.width, this.height);
        this.viewportPosition = createVector(0, 0);

        this.cardContentDiv = document.getElementById("CardContent");
        this.cardChildren = this.cardContentDiv.children;

        this.gameContainer = document.getElementById(this.containerName);
        this.gameContainer.style.aspectRatio = "1;";

        this.resize();

        this.canvas = createCanvas(this.viewportSize.x, this.viewportSize.y);
        this.canvas.parent(this.containerName);

        this.gameMapSize = createVector(this.gameMapWidth, this.gameMapHeight);
        this.gameMapCanvasSize = UtilitiesService.scaleToOffset(createVector(.2, .2));

        this.fps = new FPS(32); // 32 -> Text Size

        this.soundService = new SoundService(this);
        this.replicationService = new ReplicationService(this);
        this.runService = new RunService(this);

        this.lightingService = new LightingService(this);
        this.physicsService = new PhysicsService(this);
        this.chatService = new ChatService(this);

        this.gameMap = new Map(this);

        this.playersService = new PlayersService(this);

        this.camera = new Camera(this, this.gameMap);

        this.character = new Character(this, false, 85);
        this.characterController = new CharacterController(this, this.character, this.camera);

        this.camera.focusSubject = this.character;

        // RENDER ORDER
        // ------------
        // UPDATE ORDER
        this.runService.bindToRunService("stepped", {"object": this.characterController, "method": "update"});
        this.runService.bindToRunService("stepped", {"object": this.character, "method": "update"});
        this.runService.bindToRunService("stepped", {"object": this.camera, "method": "update"});

        // DRAW ORDER
        this.runService.bindToRunService("renderStepped", {"object": this.camera, "method":  "draw"});
        this.runService.bindToRunService("renderStepped", {"object": this.gameMap, "method": "draw"});
        this.runService.bindToRunService("renderStepped", {"object": this.character, "method": "draw"});
        this.runService.bindToRunService("renderStepped", {"object": this.camera, "method":  "drawLookRays"});
        this.runService.bindToRunService("renderStepped", {"object": this.characterController, "method": "draw"});
        this.runService.bindToRunService("renderStepped", {"object": this.replicationService, "method": "draw"});

        // AFTER DRAW AND UPDATE
        this.runService.bindToRunService("lateStepped", {"object": this.fps, method: "lateUpdate"});
        this.runService.bindToRunService("lateStepped", {"object": this.character, method: "lateUpdate"});
        
        // NETWORK
        this.runService.bindToRunService("lateStepped", {"object": this.playersService, method: "lateUpdate"});

        // INIT
        frameRate(60);

        this.replicationService.send("getPlayers");
        this.replicationService.send("playerAdded");

        let parent = this;

        // DIRECT (EVENTS)
        window.addEventListener("resize", this.resize.bind(this));

        document.addEventListener("mouseLocked", function(event) {
            parent.soundService.playMusic("ambience", parent.serverMapData["sound"]["ambience"]);
        });

        document.addEventListener("mouseFreed", function(event) {
            parent.soundService.stopMusic(true);
        });
        
        window.addEventListener("beforeunload", function(event) {
            // Functions
            // INIT
            if (parent.playersService.localUserLeft)  
            {
                return;
            }

            parent.playersService.localUserLeft = true;

            parent.replicationService.send("playerRemoved");
            parent.replicationService.disconnect();

            event.preventDefault();
            event.returnValue = "";
            return "";
        });

        window.addEventListener("unload", function() {
            // Functions
            // INIT
            noLoop(); // END P5.JS SKETCH -> STOP RENDER DRAW LOOP
            parent.playersService.localUserLeft = true;
        });
    }

    setupFinished() // FIRE ON FIRST FRAME
    {
        // Functions
        // INIT
        if (!this.setupFinishedCalled) 
        {
            this.setupFinishedCalled = true;

            let setupFinishedCallback = window.setupFinishedCallback;

            setupFinishedCallback();
        }
    }

    drawStats() 
    {
        // Functions
        // INIT
        push();
        rectMode(CENTER);
        textAlign(CENTER, CENTER);
        textSize(this.fps.textSize);

        const stringToDisplay = "FPS: " + this.fps.fps;
        const textSizeVector = createVector(textWidth(stringToDisplay), textAscent() + textDescent());

        text(stringToDisplay, width - (textSizeVector.x / 2), (textSizeVector.y / 2));
        pop();
    }

    draw() 
    {
        /**
         * ORDER
         * -----
         *  - 1 | FIRST: UPDATE
         *  - 2 | SECOND : DRAW
         *  - 3 | LAST: LATE UPDATE
         **/

        // Functions
        // INIT
        if (this.playersService.localUserJoinedServer != true) 
        {
            //console.log(this.playersService.localUserJoinedServer);
            return;
        }

        this.runService.update();
        this.runService.draw();
        this.runService.lateUpdate();

        this.drawStats();
        this.setupFinished();
    }
}
//

async function initialise(SERVERID, MAPMETA, MAPDATA, TEXTURES) 
{
    // CORE
    let Config = window.Config;

    // Functions
    // INIT

    /**
     * STORE DATA GIVEN FROM SERVER (GAME CONTROLLER.py)
     */

    _staticFolderLocation = Config["staticFolder"];
    _serverCoreInfo = Config["coreInfo"];
    _serverPagesInfo = Config["pagesInfo"];
    _serverId = SERVERID;
    _localUser = Config["user"];
    _serverMapData = MAPDATA;
    _serverTextures = TEXTURES;
    _serverMapMeta = MAPMETA;

    // SETUP GLOBALS FOR P5 SKETCH
    gameEngine = new Engine();

    window.setup = gameEngine.setup.bind(gameEngine);
    window.draw = gameEngine.draw.bind(gameEngine);

    // IMPORT P5 LIB -> Auto Runs
    let {default: p5Module} = await import(window.Config["staticFolder"] + "js/libraries/p5.js");
}

function end() 
{

}

// DIRECT
engineModule.initialise = initialise
engineModule.end = end


export default engineModule;
