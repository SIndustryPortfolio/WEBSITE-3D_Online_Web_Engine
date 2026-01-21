/** 
 * MAP
 * ---
 * - PARSES RAW MAP AND ENTITY DATA
 * - RENDERS VISUALS OF 2D MINI MAP
 **/

// MODULES
import { Wall } from "./wall.js";
import { Floor } from "./floor.js";
import { UtilitiesService } from "../services/utilitiesService.js";

//
export class Map 
{
    constructor(engine) 
    {
        //this.mapContent = mapDict["data"]; // Meta
        
        this.engine = engine;

        this.gameMapContent = {
            "entities": engine.serverMapData["entities"],
            "floors": engine.serverMapData["floors"],
            "walls": engine.serverMapData["walls"]
        }
        
        this.tiles = createVector(engine.serverMapData["size"]["x"], engine.serverMapData["size"]["y"]);
        this.position = createVector(0, 0);

        this.actualSize = this.engine.gameMapSize; //actualSize || canvasSize;
        this.canvasSize = this.engine.gameMapCanvasSize;

        this.backgroundColour = color(0, 0, 0);
        //this.runService = runService;
        //this.lightingService = lightingService;
        this.gameMapMeta = engine.serverMapMeta;

        this.walls = [];
        this.floors = [];
        this.entities = [];

        this.setupMap();
    }

    setupMap()
    {
        // Functions
        // INIT    
        this.tileSize = createVector(this.actualSize.x / this.tiles.x, this.actualSize.y / this.tiles.y);

        let currentPositionX = (this.tileSize.x / 2);
        let currentPositionY = (this.tileSize.y / 2);

        for (let y = 0; y < this.tiles.y; y++) 
        {
            for (let x = 0; x < this.tiles.x; x++) 
            {
                // CORE
                const wallTileValue = this.gameMapContent["walls"][y][x];
                const rightWallTileInfo = {"name": "right", "value": this.gameMapContent["walls"][y][x + 1]};
                const leftWallTileInfo = {"name": "left", "value": this.gameMapContent["walls"][y][x - 1]};

                let topWallTileInfo = null; 
                let bottomWallTileInfo = null;

                if (this.gameMapContent["walls"][y - 1] != null) 
                {
                    topWallTileInfo = {"name": "top", "value": this.gameMapContent["walls"][y - 1][x]};
                }

                if (this.gameMapContent["walls"][y + 1] != null) 
                {
                    bottomWallTileInfo = {"name": "bottom", "value": this.gameMapContent["walls"][y + 1][x]};
                }

                const entityTileValue = this.gameMapContent["entities"][y][x];

                // FLOOR

                // WALLS
                const wallInfo = this.gameMapMeta["walls"][wallTileValue];

                if (wallInfo != null) 
                {
                    const adjacentWalls = [rightWallTileInfo, leftWallTileInfo, topWallTileInfo, bottomWallTileInfo];
                    let boundariesToRemove = [];
                    
                    for (let wallTileInfo of adjacentWalls) 
                    {
                        if (wallTileInfo == null || wallTileInfo["value"] == null) 
                        {
                            continue;
                        }

                        const adjacentWallInfo = this.gameMapMeta["walls"][wallTileInfo["value"]]

                        if (adjacentWallInfo == null) 
                        {
                            continue;
                        }

                        boundariesToRemove.push(wallTileInfo["name"]);
                    }

                    let wall = new Wall(this.engine, createVector(currentPositionX, currentPositionY), this.tileSize, boundariesToRemove, UtilitiesService.tableToColour(wallInfo["args"]["colour"]), wallInfo["args"]["textureName"]);
                    this.walls.push(wall);
                    this.engine.runService.objects["walls"].push(wall);
                }

                // ENTITIES
                const entityInfo = this.gameMapMeta["entities"][entityTileValue];
            
                if (entityInfo != null) 
                {
                    if (entityInfo["type"] == "spawnLocation") 
                    {
                        this.spawnPosition = createVector(currentPositionX, currentPositionY);
                    }
                }

                currentPositionX += this.tileSize.x;
            }

            currentPositionY += this.tileSize.y;
            currentPositionX = (this.tileSize.x / 2);
        }

    }

    drawMapBackground() 
    {
        // Functions
        // INIT
        if (this.floorColour == null) 
        {
            if (this.engine.lightingService.floorColour != null && this.backgroundColour == null) 
            {  
                this.floorColour = lerpColor(this.engine.lightingService.floorColour, color(0, 0, 0), 0.3);
            }
            else 
            {
                this.floorColour = this.backgroundColour;
            }
        }
        
        push(); 
        translate(this.position.x, this.position.y);
        rectMode(CENTER);
        fill(this.floorColour);
        rect(this.canvasSize.x / 2, this.canvasSize.y / 2, this.canvasSize.x, this.canvasSize.y);
        
        pop();
    }

    drawMapBorder() 
    {
        // Functions
        // INIT
        push();
        noFill();
        stroke(255);
        strokeWeight(5);
        rectMode(CENTER);
        rect(this.canvasSize.x / 2, this.canvasSize.y / 2, this.canvasSize.x, this.canvasSize.y);
        pop();
    }

    drawMapEntities() 
    {
        // Functions
        // INIT
        for (let userId in this.engine.runService.objects["characters"]) 
        {
            let character = this.engine.runService.objects["characters"][userId];
            const method = character.draw.bind(character);

            method();
        }
    }

    drawMapForeground() 
    {
        // Functions
        // INIT
        this.drawMapBorder();        
        this.drawMapEntities();
        
    }

    getMappedPosition(position) 
    {
        // Functions
        // INIT
        const mappedXPosition = map(position.x, 0, this.actualSize.x, 0, this.canvasSize.x);
        const mappedYPosition = map(position.y, 0, this.actualSize.y, 0, this.canvasSize.y);

        return createVector(mappedXPosition, mappedYPosition);
    }

    getMappedSize(size) 
    {
        // Functions
        // INIT
        const mappedXSize = map(size.x, 0, this.actualSize.x, 0, this.canvasSize.x);
        const mappedYSize = map(size.y, 0, this.actualSize.y, 0, this.canvasSize.y);

        return createVector(mappedXSize, mappedYSize);
    }

    draw()
    {
        // Functions
        // INIT

        this.drawMapBackground();
        const drawOrder = [this.walls, this.entities];


        for (let drawArray of drawOrder) 
        {
            for (let object of drawArray) 
            {
                if (object.draw == null) 
                {
                    continue;
                }
        
                const mappedPosition = this.getMappedPosition(object.position);
                const mappedSize = this.getMappedSize(object.size);
                    
                object.draw(mappedPosition, mappedSize);
            }
        }

        this.drawMapForeground();
    }
}