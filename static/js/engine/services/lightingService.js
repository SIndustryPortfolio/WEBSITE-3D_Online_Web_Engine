/** 
 * LIGHTING SERVICE
 * -----------
 * - BACKGROUND COLOUR OF SKY / FLOOR
 * 
 **/

class LightingService
{
    constructor(engine) 
    {
        this.engine = engine;

        // CORE
        const skyColourTable = engine.serverMapData["lighting"]["skyColour"];
        const floorColourTable = engine.serverMapData["lighting"]["floorColour"];

        this.skyColour = color(skyColourTable[0], skyColourTable[1], skyColourTable[2]); 
        this.floorColour = color(floorColourTable[0], floorColourTable[1], floorColourTable[2]);
    }
}

export default LightingService;