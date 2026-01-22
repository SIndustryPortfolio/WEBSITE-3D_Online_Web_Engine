import Boundary from "./boundary.js";
import Instance from "./instance.js";

class Wall extends Instance
{
    constructor(engine, position, size, boundariesToRemove, colour, textureName) 
    {
        super("wall");

        this.engine = engine;

        this.position = position;
        this.size = size;
        this.boundariesToRemove = boundariesToRemove;
        this.colour = colour;
        this.textureName = textureName;
        //this.runService = runService;
        this.shape = "square";
        this.canCollide = true;
        this.canQuery = true;

        this.boundaries = [];

        this.setup();
    }

    setup() 
    {
        // CORE

        // Functions
        // INIT
        push();
        colorMode(RGB);
        this.secondaryColour = lerpColor(this.colour, color(0, 0, 0), 0.5);
        pop();

        let tableOfPoints = 
        {
            1: createVector(this.position.x - (this.size.x / 2), this.position.y - (this.size.y / 2)),
            3: createVector(this.position.x + (this.size.x / 2), this.position.y + (this.size.y / 2)),

            2: createVector(this.position.x - (this.size.x / 2), this.position.y + (this.size.y / 2)),
            4: createVector(this.position.x + (this.size.x / 2), this.position.y - (this.size.y / 2))
        }

        let lines = 
        {
            "left": {"start": 1, "end": 2, "colour": this.colour, "type": "Horizontal"},
            "right": {"start": 3, "end": 4, "colour": this.colour, "type": "Horizontal"},
            "bottom": {"start": 2, "end": 3, "colour": this.secondaryColour, "type": "Vertical"},
            "top": {"start": 4, "end": 1, "colour": this.secondaryColour, "type": "Vertical"}
        }

        for (let lineName in lines) 
        {
            if (this.boundariesToRemove.includes(lineName)) 
            {
                continue;
            }

            const lineInfo = lines[lineName];
            const startPoint = tableOfPoints[lineInfo["start"]];
            const endPoint = tableOfPoints[lineInfo["end"]];

            this.boundaries.push(new Boundary(this, startPoint, endPoint, this.canQuery, lineInfo["colour"], this.textureName, lineInfo["type"]));
        }

        //this.boundaries.push(new Boundary(tableOfPoints[1], tableOfPoints[2], this.canQuery, this.colour, this.textureName, "Horizontal"));
        //this.boundaries.push(new Boundary(tableOfPoints[2], tableOfPoints[3], this.canQuery, this.secondaryColour, this.textureName, "Vertical"));
        //this.boundaries.push(new Boundary(tableOfPoints[3], tableOfPoints[4], this.canQuery, this.colour, this.textureName, "Horizontal"));
        //this.boundaries.push(new Boundary(tableOfPoints[4], tableOfPoints[1], this.canQuery, this.secondaryColour, this.textureName, "Vertical"));
    }

    draw(mappedPosition, mappedSize) 
    {
        // Functions
        // INIT
        //for (let boundary of this.boundaries) 
        //{
        //    boundary.draw();
        //}

        if (this.textureName == null) 
        {
            return null;
        }

        push();
        rectMode(CENTER);
        noStroke();
        fill(this.colour);
        //rect(this.position.x, this.position.y, this.size.x, this.size.y);
        rect(mappedPosition.x, mappedPosition.y, mappedSize.x, mappedSize.y);
        pop();

        // TEXTURE MAPPING TO UI vv -> VERY EXPENSIVE

        /**const textureRGBData = this.runService.textures[this.textureName];
        const drawEvery = 6; // 4th Pixel
        const textureHeight = textureRGBData.length;
        const textureWidth = textureRGBData[0].length;
        const pixelSize = createVector((this.size.x / textureWidth) * drawEvery, (this.size.y / textureHeight) * drawEvery);

        let xPos = this.position.x + ((this.size.x / 2) - (pixelSize.x / 2));
        let yPos = this.position.y + ((this.size.y / 2) - (pixelSize.y / 2));

        for (let y = 0; y < textureHeight; y+=drawEvery) 
        {

            for (let x  = 0; x < textureWidth; x+=drawEvery) 
            {
                const pixelColourTable = textureRGBData[y][x];
                const pixelColour = color(pixelColourTable[0], pixelColourTable[1], pixelColourTable[2]);

                push();
                rectMode(CENTER);
                noStroke();
                fill(pixelColour);
                rect(xPos, yPos, pixelSize.x, pixelSize.y);
                pop();

                xPos += pixelSize.x / 2;
            }

            yPos += pixelSize.y / 2;
            xPos = this.position.x + ((this.size.x / 2) - (pixelSize.x / 2));
        }**/

        
    }
}


export default Wall;