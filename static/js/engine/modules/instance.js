/** 
 * INSTANCE
 * --------
 * - SUPER CLASS OF MANY RENDERABLE OBJECT WHICH HOLDS DEFAULT PROPERTIES SUCH AS:
 *      - SIZE
 *      - POSITION
 *      - DIRECTION
 *      - CLASS NAME
 * 
 **/

class Instance 
{
    constructor(className) 
    {
        this.originPosition = createVector(width / 2, height / 2);

        //
        this.size = createVector(0, 0);
        this.position = this.originPosition;
        this.direction = p5.Vector.fromAngle(0);
        this.className = className || "None";
    }

    // MECHANICS
    
    isA(className) 
    {
        if (this.className == className) 
        {
            return true;
        }
    
        return false;
    }

    lookAt(position) 
    {
        this.direction.x = position.x - this.position.x;
        this.direction.y = position.y - this.position.y;
        this.direction.normalize();
    }

    // STUBS

    update() 
    {

    }

    draw() 
    {

    }
}

export default Instance;