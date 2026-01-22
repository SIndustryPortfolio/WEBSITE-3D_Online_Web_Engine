/** 
 * UTILITIES SERVICE
 * -----------------
 * - STATIC CLASS FOR GENERIC METHODS
 * 
 **/

class UtilitiesService
{
    constructor() 
    {
        
    }

    static isStringEmptyOrWhitespace(string) 
    {
        // Functions
        // INIT
        return !string || string.trim().length === 0;
    }

    static roundToDecimalPlace(number, decimals) {
        // Functions
        // INIT
        const factor = Math.pow(10, decimals);
        return Math.round(number * factor) / factor;
    }

    static tableToColour(table) // [R, G, B] -> P5 COLOR OBJECT
    {
        // Functions
        // INIT
        return color(table[0], table[1], table[2]);
    }

    static offsetToScale(vector) // Pixel size mapped to size on canvas
    {
        // Functions
        // INIT
        return createVector(vector.x / width, vector.y / height);
    }

    static scaleToOffset(vector) // Size on canvas to pixel size
    {
        // Functions
        // INIT
        return createVector(vector.x * width, vector.y * height);
    }

    static getDeltaTime() // Return delta time in milliseconds
    {
        // Functions
        // INIT
        return deltaTime / 1000;
    }

    static getTick() // Return tick in seconds
    {
        // Functions
        // INIT
        return performance.now() / 1000;
    }

    static clamp(number, min, max) 
    {
        // Functions
        // INIT
        return Math.max(min, Math.min(max, number));
    }
}

export default UtilitiesService;