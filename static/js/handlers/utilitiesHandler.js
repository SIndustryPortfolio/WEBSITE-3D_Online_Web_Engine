var utilitiesHandlerModule = {}

/** 
 * UTILITIES HANDLER
 * -----------------
 * - GENERIC PAGE METHODS
 **/


// Functions
// MECHANICS
function runModules(...modules) // EXECUTES RUNTIME "MAIN" JS FILES
{
    // Functions
    // INIT

    for (var index in modules) 
    {
        modules.at(index).initialise();
    }
}

function formToDict(form) // FORM INPUT NAMES AND VALUES TO DICTIONARY
{
    // Functions
    // INIT
    const formData = new FormData(form);
    const formDict = {};

    formData.forEach((value, key) => 
    {
        formDict[key] = value;
    });

    return formDict;
}

// DIRECT
utilitiesHandlerModule.runModules = runModules;
utilitiesHandlerModule.formToDict = formToDict;


export default utilitiesHandlerModule;
