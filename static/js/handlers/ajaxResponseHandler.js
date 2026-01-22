var ajaxResponseHandlerModule = {}

/** 
 * AJAX HANDLER
 * -------------
 * - PROCESSES AJAX RESPONSES FROM SERVER
 *      - REDIRECTS
 *      - ALERTS
 **/

// Modules
import { alertHandlerModule } from "./alertHandler.js";

// CORE

// Functions
// MECHANICS
function handleResponse(responseTable) 
{
    // Functions
    // MECHANICS
    function handleAlerts()
    {
        // Functions
        // INIT
        if ("alert" in responseTable) {
            var alertInfo = responseTable["alert"];

            alertHandlerModule.addAlert("main", alertInfo["type"], alertInfo["message"])
        }
    }

    function handleRedirects() 
    {
        // Functions
        // INIT
        if ("redirect" in responseTable && responseTable.redirect) 
        {
            window.location.href = responseTable.redirect;
            return true;
        }

        return false;
    }
    // INIT
    var redirectedResponse = handleRedirects();

    if (redirectedResponse) // IF REDIRECT PREVENT FURTHER CODE EXECUTION
    {
        return;
    }

    handleAlerts();
}


// DIRECT
ajaxResponseHandlerModule.handleResponse = handleResponse;

export default ajaxResponseHandlerModule;
