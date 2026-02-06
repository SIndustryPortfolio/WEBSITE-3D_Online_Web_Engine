var pageModule = {}

// Functions
// MECHANICS
async function initialise() 
{
    // CORE
    let {default: currentPageModule} = await import(window.Config["staticFolder"] + "js/pages/" + window.Config["currentPage"] + "Page.js");

    // Functions
    // DIRECT
    window.addEventListener("beforeUnload", () => 
    {
        // Functions
        // INIT
        return currentPageModule.end();
    });

    if (document.readyState === 'loading') {
        document.addEventListener("DOMContentLoaded", () => 
        {
            // Functions
            // INIT
            return currentPageModule.initialise();
        });
    }
    else 
    {
        currentPageModule.initialise();
    }
}

function end() 
{

}

// DIRECT
pageModule.initialise = initialise;
pageModule.end = end;

export default pageModule;