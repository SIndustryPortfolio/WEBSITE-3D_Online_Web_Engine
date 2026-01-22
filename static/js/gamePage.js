// Modules
import { ajaxResponseHandlerModule } from "./handlers/ajaxResponseHandler.js";
import { alertHandlerModule } from "./handlers/alertHandler.js";
import { utilitiesHandlerModule } from "./handlers/utilitiesHandler.js";

//
import { engineModule } from "./engine/engine.js"

// CORE
export default pageModule = {}

// Functions
// MECHANICS
function initialise(...args) 
{
    // CORE

    // Functions
    // INIT
    utilitiesHandlerModule.runModules(alertHandlerModule);
    engineModule.initialise(...args);
}

function end() 
{
    // Functions
    // INIT

}

// DIRECT
pageModule.initialise = initialise;
pageModule.end = end;
