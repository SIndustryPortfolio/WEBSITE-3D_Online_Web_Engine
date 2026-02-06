var pageModule = {}

// Modules
import alertHandlerModule from "../handlers/alertHandler.js";
import utilitiesHandlerModule from "../handlers/utilitiesHandler.js";

//
import engineModule from "../engine/engine.js"

// CORE
let containerLoadDiv;

// Functions
// MECHANICS
function initialise() 
{
    // CORE
    let pageData = window.PageData;
    containerLoadDiv = document.getElementById("ContainerLoad");

    // Functions
    // INIT
    utilitiesHandlerModule.runModules(alertHandlerModule);

    engineModule.initialise(
        pageData["serverId"], 
        pageData["mapMeta"], 
        pageData["mapData"], 
        pageData["textures"]
    );

    window.setupFinishedCallback = function() 
    {
        // Functions
        // INIT
        containerLoadDiv.classList.add("LoadingHidden");

        containerLoadDiv.addEventListener("animationend", () => 
        {
            // Functions
            // INIT
            containerLoadDiv.parent.removeChild(containerLoadDiv);
        });
    };
}

function end() 
{
    // Functions
    // INIT

}

// DIRECT
pageModule.initialise = initialise;
pageModule.end = end;


export default pageModule;