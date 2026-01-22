/** 
 * CHARACTER
 * ---------
 * - HANDLES CHARACTER IN THE WORLD WITH PHYSICS AND CLIENT / SERVER REPLICATION
 * 
 **/

import UtilitiesService from "../services/utilitiesService.js";
import Instance from "./instance.js";

class Character extends Instance
{
    constructor(engine, isOtherPlayer, speed) 
    {   
        super("Character");

        this.engine = engine;

        this.size = createVector(12, 12);
        this.rotateSmooth = 25;
        this.colour = color(255);
        this.shape = "square";
        this.canCollide = true;

        //this.physicsService = physicsService
        //this.replicationService = replicationService;
        //this.soundService = soundService;
        
        if (isOtherPlayer) 
        {
            this.isOtherPlayer = true;
        }

        //this.map = map;
        this.position = this.engine.gameMap.spawnPosition || createVector();
        this.speed = speed || 0;
        
        this.sprint = false;
        this.sprintMultiplier = 1.5;

        this.heading = 0;
        //
        this.lastNetworkUpdateTime = 0;
        this.replicateEvery = 0.05; // Seconds
        //
        this.isMoving = false;
        
        this.lastThudTime = UtilitiesService.getTick();
        this.thudDebounce = 1;

        this.lastFootstepTime = UtilitiesService.getTick();
        this.lastFootstep = "left";
        this.footstepEvery = .5;

        this.footstepToAudio = 
        {
            "left": "footstep1",
            "right": "footstep2"
        }

    }

    replicate(timeNow) 
    {
        // Functions
        // INIT
        if (timeNow - this.lastNetworkUpdateTime < this.replicateEvery) 
        {
            return;
        }
    
        this.lastNetworkUpdateTime = timeNow;
    
        this.engine.replicationService.send("updateCharacter", 
        {
            "position": {"x": this.position.x, "y": this.position.y},
            "heading": this.heading
        });
    }

    footstep(timeNow) 
    {
        // CORE
        let footstepEvery = this.footstepEvery;
        let soundSpeed = 1;

        // Functions
        // INIT
        if (!this.isMoving) 
        {
            return;
        }

        if (this.sprint) 
        {
            footstepEvery /= 2;
            soundSpeed = 2;
        }

        if (timeNow - this.lastFootstepTime < footstepEvery) 
        {
            return;
        }

        const swapTable = {"left": "right", "right": "left"};
        const footToUse = swapTable[this.lastFootstep];

        this.engine.soundService.playSound("character", this.footstepToAudio[footToUse], undefined, undefined, soundSpeed);

        this.lastFootstepTime = timeNow;
        this.lastFootstep = footToUse;
    }

    lateUpdate() 
    {
        // Functions
        // INIT
        if (this.isOtherPlayer) 
        {
            return;
        }

        const timeNow = UtilitiesService.getTick();

        this.replicate(timeNow);
        this.footstep(timeNow);
        
    }

    draw() 
    {
        // CORE
        const mappedXPosition = map(this.position.x, 0, this.engine.gameMap.actualSize.x, 0, this.engine.gameMap.canvasSize.x);
        const mappedYPosition = map(this.position.y, 0, this.engine.gameMap.actualSize.y, 0, this.engine.gameMap.canvasSize.y);
        const mappedXSize = map(this.size.x, 0, this.engine.gameMap.actualSize.x, 0, this.engine.gameMap.canvasSize.x);
        const mappedYSize = map(this.size.y, 0, this.engine.gameMap.actualSize.y, 0, this.engine.gameMap.canvasSize.y);

        push();
        translate(this.engine.gameMap.position);
        fill(this.colour);
        rectMode(CENTER)
        rect(mappedXPosition, mappedYPosition, mappedXSize, mappedYSize);
        pop();
    }

    stopMove() 
    {
        // Functions
        // INIT
        this.isMoving = false;
        this.sprint = false;
    }

    move(type) 
    {
        // CORE
        let timeNow = UtilitiesService.getTick();
        let angle = this.heading;
        let speed = this.speed * UtilitiesService.getDeltaTime();

        if (this.sprint) 
        {
            speed *= this.sprintMultiplier;
        }
        
        // Functions
        // INIT
        if (type == "forward") 
        {
            angle = this.heading;
        }

        if (type == "backward")
        {
            angle = this.heading + radians(180);
        }
        
        if (type == "left") 
        {
            angle = this.heading - radians(90);
        }

        if (type == "right") 
        {
            angle = this.heading + radians(90);
        }

        const predictedPosition = createVector(this.position.x + (cos(angle) * speed), this.position.y + (sin(angle) * speed));

        const objectsCollidedWith = this.engine.physicsService.getObjectsInside(this, predictedPosition);
        
        if (objectsCollidedWith.length == 0) 
        {
            this.position = predictedPosition;
            this.isMoving = true;
        }
        else 
        {
            if (this.isMoving) 
            {
                this.stopMove();

                if (timeNow - this.lastThudTime >= this.thudDebounce) 
                {
                    this.lastThudTime = timeNow;
                    this.engine.soundService.playSound("character", "thud");
                }
            }
        }
    }

    rotate(mouseXDelta) 
    {
        // Functions
        // INIT
        this.heading = lerp(this.heading, this.heading + radians(mouseXDelta), this.rotateSmooth * UtilitiesService.getDeltaTime());
    }
}

export default Character;