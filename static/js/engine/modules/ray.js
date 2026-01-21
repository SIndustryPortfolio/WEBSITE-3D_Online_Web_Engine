// MODULES
import { Instance } from "./instance.js";

//
export class Ray extends Instance
{
    constructor(index, position, angle, offsetAngle, maxDistance, colour) 
    {
        super("Ray");
        this.index = index; // Position / Layout Order
        this.colour = colour || color(255);
        this.position = position || createVector();
        this.angle = angle || 0;
        this.offsetAngle = offsetAngle || 0;
        this.maxDistance = maxDistance || Infinity;
    }

    draw() 
    {
        /**push();
        colorMode(RGB);
        stroke(this.colour);
        translate(this.position.x, this.position.y);
        line(0, 0, this.direction.x, this.direction.y);
        pop();**/
    }

    cast(boundary) 
    {
        // CORE
        let toReturn = null;

        const direction = p5.Vector.fromAngle(this.angle + this.offsetAngle);

        // Functions
        // INIT
        if (!boundary.canQuery) 
        {
            return null;
        }

        const wallStartPositionX = boundary.startPosition.x;
        const wallStartPositionY = boundary.startPosition.y;

        const wallEndPositionX = boundary.endPosition.x;
        const wallEndPositionY = boundary.endPosition.y;

        const rayOriginPositionX = this.position.x;
        const rayOriginPositionY = this.position.y;

        const rayEndPositionX = this.position.x + direction.x;
        const rayEndPositionY = this.position.y + direction.y;
        
        const denominator = (wallStartPositionX - wallEndPositionX) * (rayOriginPositionY - rayEndPositionY) - (wallStartPositionY - wallEndPositionY) * (rayOriginPositionX - rayEndPositionX);

        if (denominator == 0) 
        {
            return;
        }

        const t = ((wallStartPositionX - rayOriginPositionX) * (rayOriginPositionY - rayEndPositionY) - (wallStartPositionY - rayOriginPositionY) * (rayOriginPositionX - rayEndPositionX)) / denominator;
        const u = -((wallStartPositionX - wallEndPositionX) * (wallStartPositionY - rayOriginPositionY) - (wallStartPositionY - wallEndPositionY) * (wallStartPositionX - rayOriginPositionX)) / denominator;
    
        if (t > 0 && t < 1 && u > 0) 
        {
            let intersectPosition = createVector();
            intersectPosition.x = wallStartPositionX + t * (wallEndPositionX - wallStartPositionX);
            intersectPosition.y = wallStartPositionY + t * (wallEndPositionY - wallStartPositionY);      
            
            const intersectionDistance = this.position.dist(intersectPosition);

            if (intersectionDistance <= this.maxDistance) 
            {
                toReturn = {"startPosition": this.position, "endPosition": intersectPosition, "boundary": boundary, "direction": direction, "distance": intersectionDistance, "type": boundary.parent.className, "index": this.index};
            }
        }
       
        return toReturn || null;
    }

}