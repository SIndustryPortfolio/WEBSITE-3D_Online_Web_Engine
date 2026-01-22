/** 
 * BOUNDARY
 * -----------
 * - STRAIGHT LINE FROM POINT A TO POINT B FOR RAYS TO CAST AGAINST
 * 
 **/

class Boundary 
{
    constructor(parent, startPosition, endPosition, canQuery, colour, textureName, type) 
    {
        this.parent = parent; // Object that holds it : Wall
        this.colour = colour; // Colour of the boundary : P5 color
        this.textureName = textureName; // Name of texture to map against : String
        this.startPosition = startPosition; // Start position of line : P5 Vector
        this.endPosition = endPosition; // End position of line : P5 Vector
        this.canQuery = canQuery; // Can ray cast against : Bool
        this.type = type; // Vertical or Horizontal
    }

    draw() // For Minimap (DEPRECATED)
    {
        push();
        colorMode(RGB);
        stroke(this.colour || 255);
        line(this.startPosition.x, this.startPosition.y, this.endPosition.x, this.endPosition.y);
        pop();
    }
}

export default Boundary;
