/** 
 * PHYSICS SERVICE
 * -----------
 * - DETECTS 2D COLLISSIONS / DETECTIONS
 * 
 **/

export class PhysicsService 
{
    constructor(engine) 
    {
        this.engine = engine;
        //this.runService = runService;

        this.collisionMethods = 
        {
            "square,square": this.checkSquareCollision.bind(this)
        }

    }

    checkSquareCollision(object1Size, object1Position, object2Size, object2Position) // Square against Square
    {
        // Functions
        // INIT
        if ((object1Position.x + (object1Size.x / 2)) < (object2Position.x - (object2Size.x / 2)) || (object1Position.x - (object1Size.x / 2)) > (object2Position.x + (object2Size.x / 2))) 
        {
            return false;
        }

        if ((object1Position.y + (object1Size.y / 2)) < (object2Position.y - (object2Size.y / 2)) || (object1Position.y - (object1Size.y / 2)) > (object2Position.y + (object2Size.y / 2))) 
        {
            return false;
        }

        return true;
    }

    getObjectsInside(primaryObject, predictedPosition) // Returns other 2D shapes inside of / intersecting this 2d shape
    {
        // CORE
        const primaryObjectPosition = predictedPosition || primaryObject.position;
        const primaryObjectSize = primaryObject.size;

        let insideObjects = [];

        // Functions
        // INIT
        for (let object of this.engine.runService.objects["walls"]) 
        {
            const objectPosition = object.position;
            const objectSize = object.size;

            const hasCollided = this.collisionMethods[primaryObject.shape + "," + object.shape](primaryObjectSize, primaryObjectPosition, objectSize, objectPosition);

            if (hasCollided) 
            {
                insideObjects.push(object);
            }
        }

        return insideObjects;
    }
}