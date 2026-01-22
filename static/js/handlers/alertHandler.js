var alertHandlerModule = {}

/** 
 * ALERT HANDLER
 * -------------
 * - CREATES BOOTSTRAP NOTIFICATIONS FOR SERVER ALERTS
 * 
 **/


// Modules

// CORE
var mainAlertContainerDiv = document.getElementById("mainAlertContainer");
var hiddenMainAlertDumpDiv = document.getElementById("hiddenMainAlertDump");

// Functions
// MECHANICS
function createMainAlert(type, message) { // BIG ALERT UNDERNEATH TOP BAR
    // CORE
    var styleClassesToAdd = ["alert", "bg-dark", "mx-auto", "shadow", "border-" + type, "mainAlert"]

    // Functions
    // INIT
    var mainAlertBackingDiv = document.createElement("div");
    mainAlertBackingDiv.setAttribute("role", "alert");
    mainAlertBackingDiv.style.height = "60%";
    mainAlertBackingDiv.classList.add(...styleClassesToAdd);

    var mainAlertRowDiv = document.createElement("div");
    mainAlertRowDiv.classList.add("row");
    mainAlertRowDiv.style.display = "flex";
    mainAlertRowDiv.style.alignItems = "center";

    var mainAlertTypeImg = document.createElement("img");
    mainAlertTypeImg.src = "/static/images/icons/" + type + ".png";
    mainAlertTypeImg.style.maxWidth = "7.5%";
    mainAlertTypeImg.style.display = "inline-block";
    mainAlertTypeImg.alt = type;

    var mainAlertMessageH5 = document.createElement("h5");
    mainAlertMessageH5.classList.add("text-secondary");
    mainAlertMessageH5.style.display = "inline-block";
    mainAlertMessageH5.style.width = "75%";
    mainAlertMessageH5.innerHTML = message;

    mainAlertRowDiv.append(mainAlertTypeImg, mainAlertMessageH5);
    mainAlertBackingDiv.appendChild(mainAlertRowDiv);

    return mainAlertBackingDiv
}

function addMainAlert(...args) {
    // Functions
    // INIT
    var alert = createMainAlert(...args);
    mainAlertContainerDiv.appendChild(alert);
}

// SPLIT
var typeToAlert = // NOTIFICATION TYPE FILTER
{
    "main": addMainAlert
}

// MECHANICS
function addAlert(alertType, ...args) { // PUSH NEW NOTIFICATION
    // Functions
    // INIT
    return typeToAlert[alertType](...args)
}

function handleObserver() { // CHECK FOR MANUAL ALERT DIVS ARE ADDED TO THE DOCUMENT
    // Functions
    // INIT
    const config = { childList: true, subtree: false };

   function childAdded (alertType, mutationsList, observer) {
        for (const mutation of mutationsList) {
            if (mutation.type == "childList" && mutation.addedNodes.length > 0) {
                for (var node of mutation.addedNodes) {
                    addAlert(alertType, node.getAttribute("type"), node.innerHTML);
                }
            }
        }
    }

    const mainAlertObserver = new MutationObserver((mutationsList, observer) => {
        childAdded("main", mutationsList, observer);
    });

    mainAlertObserver.observe(hiddenMainAlertDump, config);
}

function initialise() 
{
    // Functions
    // INIT
    mainAlertContainerDiv = document.getElementById("mainAlertContainer");
    hiddenMainAlertDumpDiv = document.getElementById("hiddenMainAlertDump");

    for (var mainAlertElement of hiddenMainAlertDumpDiv.children) {
        addAlert("main", mainAlertElement.getAttribute("type"), mainAlertElement.innerHTML);
    }

    handleObserver();
}

function end() 
{
    // Functions
    // INIT
}

// DIRECT
alertHandlerModule.addAlert = addAlert;
alertHandlerModule.initialise = initialise;
alertHandlerModule.end = end;


export default alertHandlerModule;


