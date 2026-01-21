/** 
 * FPS
 * ---
 * - COUNTS AND STORES FRAMERATE OF SKETCH / RENDER
 * 
 **/

// Modules
import { UtilitiesService } from "../services/utilitiesService.js";

//
export class FPS 
{
    constructor(textSize) 
    {
        this.textSize = textSize || 32;
        //
        this.x = 1;
        this.fpsCounter = 0;
        this.fps = 0;
        this.startTime = UtilitiesService.getTick();
    }

    lateUpdate() 
    {
        // CORE
        const timeNow = UtilitiesService.getTick();
        const timeSpan = timeNow - this.startTime;

        // Functions
        // INIT
        this.fpsCounter += 1;
        if (timeSpan >= this.x) 
        {    
            this.fps = Math.floor(this.fpsCounter / (timeNow - this.startTime));
            this.fpsCounter = 0;
            this.startTime = timeNow;
        }
    }

    draw() 
    {
       
    }
}