/** 
 * CAMERA
 * ------
 * - RENDERS 3D VISUALS WITH:
 *      - DEPTH SHADING
 *      - TEXTURE MAPPING
 *      - FIELD OF VIEW CONTROL
 *      - RESOLUTION CONTROL
 *      - DISTANCE LAYERING
 *      - SKY RENDERING
 *      - WALL RENDERING
 **/

import { Ray } from "./ray.js";
import { Instance } from "./instance.js";
import { UtilitiesService } from "../services/utilitiesService.js";

class Camera extends Instance
{
    constructor(engine) 
    {
        super("Camera");

        this.engine = engine;

        //this.gameMap = gameMap;
        this.position = createVector();
        this.bobOffset = createVector();
        this.focusSubject = null;
        this.fieldOfView = 60;
        this.stickyCamera = true;
        this.heading = 0;
        
        this.range = null; //0.65;
        this.resolution =  null; //2; //2.5;
        this.projectBy = 35; // 25
        //
        this.textureSize = 32;

        //
        this.bobAmount = 1;
        this.bobHeight = this.projectBy / 2.5; //15;
        this.bobSmooth = 20;
        //this.bobSpeed = 6.25;

        //

        //this.runService = runService;
        //this.lightingService = lightingService;
        //
        this.shadeTo = color(0, 0, 0);

        //
        this.verticalShaderCache = [];
        this.skyShaderCache = [];
        //
        this.entities = [];
        this.lookRays = 
        {
            //"floors": [],
            "walls": []
        }

        this.qualityPresetToRange = 
        {
            1: 0.4, // LOW QUALITY
            2: 0.6, // MEDIUM QUALITY
            3: 0.75 // HIGH QUALITY
            
        }

        this.qualityPresetToLevelOfDetail = { 
            1: { // LOW QUALITY
                0.75: 4, // Higher is lower graphics fidelity! (4 = Lowest)
                0.4: 4,
                0.2: 2,
            },
            2: { // MEDIUM QUALITY
                0.75: 4, // Higher is lower graphics fidelity! (4 = Lowest)
                0.4: 2,
                0.2: 1,
            },
            3: { // HIGH QUALITY
                0.75: 2, // Higher is lower graphics fidelity! (4 = Lowest)
                0.4: 1,
                0.2: 1,
            }
        };

        this.qualityPresetToResolution = 
        {
            1: 1, // LOW QUALITY
            2: 2, // MEDIUM QUALITY
            3: 3, // HIGH QUALITY
        }

        this.levelToFOV = 
        {
            1: 30,
            2: 60,
            3: 90,
        }


        this.qualityLevel = 2; // Medium preset
        this.maxQualityLevel = 3;

        this.FOVLevel = 2;
        this.maxFOVLevel = 3;

        this.updateQualityLevel(false);
        this.updateFOVLevel(false)
        this.setup();
    }

    setup() 
    {
        // Functions
        // INIT
        this.rays = [];
        this.lookRays = [];

        // Create rays from FOV and resolution
        const halfFOV = (this.fieldOfView / 2);
        const increment = (1 / this.resolution);

        let count = 0;

        for (let i = -halfFOV; i < halfFOV; i+= increment)
        {
            this.rays.push(new Ray(count, this.position, 0, radians(i), this.engine.viewportLongestLength * this.range, color(64, 64, 64)));
            count += 1;
        }

    }

    updateQualityLevel(doSetup) 
    {
        // Functions
        // INIT
        this.resolution = this.qualityPresetToResolution[this.qualityLevel];
        this.range = this.qualityPresetToRange[this.qualityLevel];

        if (doSetup) 
        {
            this.setup();
        }
    }

    updateFOVLevel(doSetup) 
    {
        // Functions
        // INIT
        this.fieldOfView = this.levelToFOV[this.FOVLevel];

        if (doSetup) 
        {
            this.setup();
        }
    }

    previousFOV() 
    {
        // Functions
        // INIT
        if (this.FOVLevel <= 1) 
        {
            this.FOVLevel = this.maxFOVLevel;
        }
        else 
        {
            this.FOVLevel--;
        }

        this.updateFOVLevel(true);
    }

    nextFOV() 
    {
        // Functions
        // INIT
        if (this.FOVLevel >= this.maxFOVLevel) 
        {
            this.FOVLevel = 1;
        }
        else 
        {
            this.FOVLevel++;
        }

        this.updateFOVLevel(true);
    }

    previousQualityLevel() 
    {
        // Functions
        // INIT
        if (this.qualityLevel <= 1) 
        {
            this.qualityLevel = this.maxQualityLevel;
        }
        else 
        {
            this.qualityLevel--;
        }

        this.updateQualityLevel(true);
    }

    nextQualityLevel() 
    {
        // Functions
        // INIT
        if (this.qualityLevel >= this.maxQualityLevel) 
        {
            this.qualityLevel = 1;
        }
        else 
        {
            this.qualityLevel++;
        }

        this.updateQualityLevel(true);
    }

    changeFieldOfView(newFOV) 
    {
        // Functions
        // INIT
        this.fieldOfView = newFOV;
        this.rays.length = 0;

        this.setup();
    }

    getLevelOfDetailFromDistance(distance) 
    {
        // CORE
        let currentLowestPercentage = 0.75;

        // Functions
        // INIT
        for (let distancePercentage in this.qualityPresetToLevelOfDetail[this.qualityLevel]) 
        {
            const rawDistance = this.engine.viewportLongestLength * distancePercentage;

            if ((distance < rawDistance) && (distancePercentage < currentLowestPercentage))
            {
                currentLowestPercentage = distancePercentage;
            }
        }

        return this.qualityPresetToLevelOfDetail[this.qualityLevel][currentLowestPercentage];
    }

    entityLook() // Get sprites in view
    {
        // CORE
        let entitiesInView = [];
        const cameraPosition = this.position;
        const cameraHeading = this.heading;

        // Functions
        // INIT
        for (let character of Object.values(this.engine.runService.objects["characters"])) 
        {
            if (character.position.x == null || character.position.y == null) 
            {
                continue;
            }

            const characterPosition = createVector(character.position.x, character.position.y);
            const entityDistance = cameraPosition.dist(characterPosition);
            const entityOffset = createVector(character.position.x - cameraPosition.x, character.position.y - cameraPosition.y);
            
            let correctedOffset = createVector();
            
            correctedOffset.x = (entityOffset.x * (Math.cos(cameraHeading))) - (entityOffset.y * (Math.sin(cameraHeading)));
            correctedOffset.y = (entityOffset.x * (Math.sin(cameraHeading))) + (entityOffset.y * (Math.cos(cameraHeading)));

            entitiesInView.push({"object": character, "offset": correctedOffset, "distance": entityDistance, "type": "character"});
        }

        this.entities = entitiesInView;
    }

    look(type, table) // CAST RAYS AGAINST AND STORE
    {
        // Functions
        // INIT
        let lookRays = [];
        
        for (let ray of this.rays) 
        {
            let closestDistance = Infinity;
            let closestBoundary = null;

            let closestRaycastResult = null;

            for (let object of table) 
            {
                for (let boundary of (object.boundaries || [])) 
                {
                    let raycastResult = ray.cast(boundary);
                    
                    if (raycastResult == null)
                    {
                        continue;
                    }

                    const fixedAngle = (ray.angle + ray.offsetAngle) - this.heading;

                    const rawDistance = p5.Vector.dist(this.position, raycastResult["endPosition"]);
                    
                    let correctedDistance = rawDistance * Math.cos(fixedAngle); // Reduce curvature on rays by equally displacing them

                    if (correctedDistance > radians(360)) // Limits for corrected distance
                    {
                        correctedDistance -= radians(360);
                    }
                    else if (correctedDistance < radians(0)) // Limits for corrected distance
                    {
                        correctedDistance += radians(360);
                    }

                    raycastResult["distance"] = correctedDistance;
                    raycastResult["rawDistance"] = rawDistance;

                    if (correctedDistance < closestDistance) 
                    {
                        closestDistance = correctedDistance;
                        closestBoundary = boundary;
                        closestRaycastResult = raycastResult;
                    }
                }
            }


            if (closestRaycastResult == null) // Ray hit nothing
            {
                const infIntersect = p5.Vector.fromAngle(ray.angle).mult(Number.MAX_VALUE);       
                closestRaycastResult = {"startPosition": this.position, "endPosition": infIntersect, "rawDistance": closestDistance, "distance": closestDistance, "boundary": null, "type": type, "index": ray.index};
            }

            lookRays.push(closestRaycastResult);
        }

        this.lookRays[type] = lookRays;

        return lookRays;
    }

    //
    updateBop() 
    {
        // CORE
        const timeNow = UtilitiesService.getTick();
        let finalBob = 0;
        
        // Functions
        // INIT
        if (this.focusSubject.isMoving) 
        {
            let bobSpeed = (this.focusSubject.speed / 8);

            if (this.focusSubject.sprint) 
            {
                bobSpeed *= this.focusSubject.sprintMultiplier;
            }
    
            finalBob = Math.sin(timeNow * bobSpeed) * this.bobAmount * this.bobHeight;
        }
        
        this.bobOffset.y = lerp(this.bobOffset.y, finalBob, this.bobSmooth * UtilitiesService.getDeltaTime());
    }

    update() // CAST RAYS
    {
        // Functions
        // INIT
        if (this.focusSubject != null && this.stickyCamera) 
        {
            this.position = this.focusSubject.position;
            this.heading = this.focusSubject.heading;
        }

        for (let ray of this.rays) 
        {
            ray.position = this.position;
            ray.angle = this.heading;
        }

        this.look("walls", this.engine.runService.objects["walls"]); // Wall Objects
        this.entityLook();
        this.updateBop();
    }


    drawLookRays() // DRAW RAYS ON MINI MAP
    {
        // CORE
        const wallRays = this.lookRays["walls"];

        // Functions
        // INIT
        for (let lookRayInfo of wallRays) // 2D Mini Map Ray drawing
        {
            if (!("boundary" in lookRayInfo)) 
            {
                continue;
            }

            // CORE
            const mappedXStartPosition = map(lookRayInfo.startPosition.x, 0, this.engine.gameMap.actualSize.x, 0, this.engine.gameMap.canvasSize.x);
            const mappedYStartPosition = map(lookRayInfo.startPosition.y, 0, this.engine.gameMap.actualSize.y, 0, this.engine.gameMap.canvasSize.y);

            const mappedXEndPosition = map(lookRayInfo.endPosition.x, 0, this.engine.gameMap.actualSize.x, 0, this.engine.gameMap.canvasSize.x);
            const mappedYEndPosition = map(lookRayInfo.endPosition.y, 0, this.engine.gameMap.actualSize.y, 0, this.engine.gameMap.canvasSize.y);

            push();
            colorMode(RGB);
            stroke(255);
            line(mappedXStartPosition, mappedYStartPosition, mappedXEndPosition, mappedYEndPosition);
            pop();
        }
    }

    drawCharacter(entityInfo) // Draw character sprites on viewport
    {
        // CORE
        const character = entityInfo["object"];
        const distance = entityInfo["distance"];
        const cameraOffset = entityInfo["offset"];
        const characterTextureRGB = this.engine.runService.textures["character"]["character"];
        const textureWidth = characterTextureRGB[0].length;
        const textureHeight = characterTextureRGB.length;


        // Functions
        // INIT
        const brightness = 1- map(distance, 0, this.engine.viewportLongestLength * this.range, 1, 0);
        const height = (this.engine.viewportLongestLength / distance) * this.projectBy;
        const pixelSize = createVector(height / textureWidth, height / textureHeight);

        const screenX = cameraOffset.x / cameraOffset.y * (this.engine.viewportSize.x / 2);
        const screenY = cameraOffset.y / distance * (this.engine.viewportSize.y / 2);

        const finalX = (this.engine.viewportSize.x / 2) + screenX;
        const finalY = (this.engine.viewportSize.y / 2) - screenY + this.offset.y; 

        let xPos = finalX;
        let yPos = finalY;

        push();
        
        noStroke();
        colorMode(RGB);
        rectMode(CENTER);
        translate(this.engine.viewportPosition.x + (this.engine.viewportSize.x / 2), this.engine.viewportPosition.y + (this.engine.viewportSize.y / 2));
        //translate(this.viewportPosition.x + (this.viewportSize.x / 2), this.viewportPosition.y + (this.viewportSize.y / 2));
        noSmooth();

        for (let y = 0; y < textureHeight; y++) 
        {

            for (let x = 0; x < textureWidth; x++) 
            {
                const pixelColourTable = characterTextureRGB[y][x];
                
                fill(UtilitiesService.tableToColour(pixelColourTable));
                rect(xPos, yPos, pixelSize.x, pixelSize.y);

                xPos += pixelSize.x;
            }

            xPos = finalX; //(cameraOffset.x - (height / 2) + (pixelSize.x / 2));
            yPos += pixelSize.y;
        }

        pop();
    }

    drawWall(wallWidth, rayInfo) // Draw wall strip on viewport
    {
        // Functions
        // INIT
        let boundary = rayInfo["boundary"];

        if (boundary == null) 
        {
            return;
        }

        // KEEP THE NUMBER ROUNDED TO 2 DECIMAL PLACES
        const brightness = UtilitiesService.roundToDecimalPlace(1- map(rayInfo["distance"], 0, this.engine.viewportLongestLength * this.range, 1, 0), 2);
        const height = (this.engine.viewportLongestLength / rayInfo["distance"]) * this.projectBy;
        const levelOfDetail = this.getLevelOfDetailFromDistance(rayInfo["distance"]);

        //console.log("Distance: " + rayInfo["distance"]);
        //console.log("LOD: " + levelOfDetail);

        noStroke(); // No outline on rectangles
        colorMode(RGB); // Red, Green, Blue colour values
        rectMode(CENTER); // Position and Size from the centre of the rectangle

        // X, Y, WIDTH, HEIGHT
        //rect((i * wallWidth) + (wallWidth / 2), this.viewportSize.y / 2, wallWidth + 1, height);

        const textureName = boundary.textureName; // Texture image name to display
        const textureRGBData = this.engine.runService.textures["map"][textureName]; // ALL rgb texture data
        const textureHeight = textureRGBData.length; // Texture rows
        const textureWidth = textureRGBData[0].length; // Texture columns

        const textureOffsetX = Math.floor((((rayInfo["endPosition"].x + rayInfo["endPosition"].y) / this.textureSize) % 1) * textureWidth);
        
        const xPos = (rayInfo["index"] * wallWidth) + (wallWidth / 2) + this.bobOffset.x;

        const finalWidth = wallWidth + 1; // To fill in the gap left for where the stroke would be

        const pixelSize = createVector(finalWidth, (height / textureHeight) * levelOfDetail);
        let yPos = (this.engine.viewportSize.y / 2) - (height / 2) + (pixelSize.y / 2) + this.bobOffset.y;

        let quickColourCache = {}; // Less lerping needed for groups of pixel colour
        
        let iterations = 0;
        for (let y = 0; y < textureHeight; /**y++**/ y += levelOfDetail) 
        {
            const pixelColourTable = textureRGBData[y][textureOffsetX];
            let pixelColour = color(pixelColourTable[0], pixelColourTable[1], pixelColourTable[2]);

            if (boundary.type == "Vertical")  // Vertical boundary adds extra shading
            {
                if (!(pixelColour in this.verticalShaderCache)) 
                {
                    // Interpolate to 50% darker
                    this.verticalShaderCache[pixelColour] = lerpColor(pixelColour, this.shadeTo, 0.5);
                }

                pixelColour = this.verticalShaderCache[pixelColour];
            }

            push();
            translate(this.engine.viewportPosition.x, this.engine.viewportPosition.y); // Position from Top Left of viewport
            noSmooth(); // Optimised interpolation

            let shadedPixelColour = pixelColour;

            if (brightness != 0) 
            {
                if (!(shadedPixelColour in quickColourCache))
                {
                    // Interpolate to a darker colour depending on brightness and quick cache (textures will have "relative" colours)
                    quickColourCache[shadedPixelColour] = lerpColor(pixelColour, this.shadeTo, brightness);
                }

                shadedPixelColour = quickColourCache[shadedPixelColour]
            }

            let newPixelSize = pixelSize;
            
            let currentAccumulatedHeight = (iterations) * (pixelSize.y);

            let NextAccumulatedHeight = (iterations + 1) * (pixelSize.y);

            if (currentAccumulatedHeight < height) 
            {
                if (NextAccumulatedHeight > height) 
                {
                    newPixelSize.y = UtilitiesService.clamp(NextAccumulatedHeight - height, 0, pixelSize.y);
                    yPos -= newPixelSize.y  / 2;
                }

                fill(shadedPixelColour);
                rect(xPos, yPos, newPixelSize.x, newPixelSize.y + 1);
                pop(); // Reset drawing state
            }

            yPos += pixelSize.y; // Increment Y Position for next texture pixel
            iterations ++;
        }

        quickColourCache = null;
    }

    drawSky() // Draw Sky on viewport
    {
        // Functions
        // INIT
        const colourTable = 
        [
            this.engine.lightingService.skyColour,
            this.engine.lightingService.floorColour
        ];


        let chunkSize = 8;
        let index = 0;
        let screenYSpace = this.engine.viewportSize.y / (colourTable.length - 1);


        push();
        colorMode(RGB);
        translate(this.engine.viewportPosition.x, this.engine.viewportPosition.y);
        for(let y = 0; y < colourTable.length; y+= chunkSize)
        {
            const colour1 = colourTable[y];
            const colour2 = colourTable[y + 1] || colour1;

            for (let x = 0; x < screenYSpace; x++) // FOR THE VERTICAL SPACE CONSUMED BY EACH GRADIENT COLOUR
            {
                const percentage = map(x, 0, screenYSpace, 0, 1);
                let currentColour = null;

                if (colour1 == colour2) 
                {
                    currentColour = colour1;
                }
                else {
                    if (!(percentage in this.skyShaderCache))
                    {
                        this.skyShaderCache[percentage] = lerpColor(colour1, colour2, percentage);
                    }

                    currentColour = this.skyShaderCache[percentage];
                }

                noSmooth();
                rectMode(CENTER);
                fill(currentColour);
                rect(this.engine.viewportSize.x / 2, x + (y * screenYSpace) + (chunkSize / 2), this.engine.viewportSize.x, chunkSize);
                index++;
            }


            translate(0, screenYSpace);  
        }
        pop();

    }

    draw() 
    {
        // Functions
        // INIT
        this.drawSky();
        //this.drawFloors();
        //this.drawWalls();

        let toDraw = []

        const drawable = 
        {
            "wall": this.drawWall.bind(this)
        };

        toDraw = toDraw.concat(this.lookRays["walls"], this.entities); // COMBINE ALL DRAW / RAY INFO's
        toDraw.sort((drawInfo1, drawInfo2) => drawInfo2["distance"] - drawInfo1["distance"]); // RE-ORDER RAYS BY DISTANCE FOR BETTER LAYERING

        const wallWidth = this.engine.viewportSize.x / this.lookRays["walls"].length;

        for (let drawInfo of toDraw) 
        {
            const drawMethod = drawable[drawInfo["type"]];

            if (drawMethod == null) 
            {
                continue;
            }

            drawMethod(wallWidth, drawInfo);
        }
    }

}

export default Camera;