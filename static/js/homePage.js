// Modules
import { ajaxResponseHandlerModule } from "./handlers/ajaxResponseHandler.js";
import { alertHandlerModule } from "./handlers/alertHandler.js";
import { utilitiesHandlerModule } from "./handlers/utilitiesHandler.js";

// CORE

export default pageModule = {}

// Functions
// MECHANICS
function initialise() 
{
 // CORE

 // Functions
 // INIT
 utilitiesHandlerModule.runModules(alertHandlerModule);

}

function end() 
{
    // Functions
    // INIT

}

// DIRECT
pageModule.initialise = initialise;
pageModule.end = end;
