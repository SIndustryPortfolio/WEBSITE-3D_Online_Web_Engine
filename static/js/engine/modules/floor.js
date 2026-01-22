/** 
 * FLOOR
 * -----
 * - DEPRECATED (REDUCES FRAMERATE TOO MUCH ON BROWSER)
 * - HANDLES FLOOR TILES BENEATH WALLS
 **/

import { Boundary } from "./boundary.js";

class Floor 
{
    constructor(engine, position, size, colour, textureName) 
    {
        this.engine = engine;

        this.position = position;
        this.size = size;
        this.colour = colour;
        this.textureName = textureName;
        //this.runService = runService;
        this.shape = "square";
        this.canCollide = false;
        this.canQuery = true;

        this.boundaries = [];
        this.setup();
    }

    setup() 
    {

    }

    setup() 
    {
        // CORE

        // Functions
        // INIT
        push();
        colorMode(RGB);
        this.secondaryColour = this.colour;
        pop();

        let tableOfPoints = 
        {
            1: createVector(this.position.x - (this.size.x / 2), this.position.y - (this.size.y / 2)),
            3: createVector(this.position.x + (this.size.x / 2), this.position.y + (this.size.y / 2)),

            2: createVector(this.position.x - (this.size.x / 2), this.position.y + (this.size.y / 2)),
            4: createVector(this.position.x + (this.size.x / 2), this.position.y - (this.size.y / 2))
        }

        this.boundaries.push(new Boundary(tableOfPoints[1], tableOfPoints[2], this.canQuery, this.colour, this.textureName, "Horizontal"));
        this.boundaries.push(new Boundary(tableOfPoints[2], tableOfPoints[3], this.canQuery, this.secondaryColour, this.textureName, "Vertical"));
        this.boundaries.push(new Boundary(tableOfPoints[3], tableOfPoints[4], this.canQuery, this.colour, this.textureName, "Horizontal"));
        this.boundaries.push(new Boundary(tableOfPoints[4], tableOfPoints[1], this.canQuery, this.secondaryColour, this.textureName, "Vertical"));
    }

    draw(mappedPosition, mappedSize) 
    {
        // Functions
        // INIT
        if (this.textureName == null) 
        {
            return null;
        }

        push();
        rectMode(CENTER);
        noStroke();
        fill(this.colour);
        rect(mappedPosition.x, mappedPosition.y, mappedSize.x, mappedSize.y);
        pop();
    }
}

export default Floor;