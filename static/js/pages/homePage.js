var pageModule = {};

// Modules
import alertHandlerModule from "../handlers/alertHandler.js";
import utilitiesHandlerModule from "../handlers/utilitiesHandler.js";

// CORE
let changedEvent = new CustomEvent("worldCardChanged");

let worldImage;
let worldName;
let worldDescription;
let worldJoin;
let worldMetaTable;

let worldCards;

let midSection;

let selectedServerId;

// Functions
// MECHANICS
function joinWorld(event) 
{
    // Functions
    // INIT
    
}

function updateView(serverId) 
{
    // CORE
    const PageData = window.PageData;
    const serverInfo = PageData["servers"][serverId];
    const mapData = serverInfo["mapData"];

    const playersOnline = utilitiesHandlerModule.getSizeOfDict(serverInfo['players']);
    const serverRegion = serverInfo["region"];

    // Functions
    // INIT
    worldImage.src = window.Config["staticFolder"] + "images/maps/" + mapData["name"] + ".png";
    worldName.innerHTML = mapData["name"];
    worldDescription.innerHTML = mapData["description"] || "<i>No valid map description given!</i>";

    worldMetaTable.innerHTML = "";

    let tableRow0 = document.createElement("tr");
    tableRow0.innerHTML = "<td><b>Server Id: </b></td> <td>" + serverId + "</td>";

    let tableRow1 = document.createElement("tr");
    tableRow1.innerHTML = "<td><b>Server Region: </b></td> <td>" + window.Config["countryInfo"][serverRegion] + "</td>";
    

    let tableRow2 = document.createElement("tr");
    tableRow2.innerHTML = "<td><b>Players Online: </b></td>";

    let playersOnlineTD = document.createElement("td");
    playersOnlineTD.innerHTML = playersOnline;

    if (playersOnline > 0) 
    {
        playersOnlineTD.classList.add("text-success");
    }

    tableRow2.append(playersOnlineTD);

    let tableRow3 = document.createElement("tr");
    tableRow3.innerHTML = "<td><b>Map Size: </b></td> <td>" + mapData["size"]["x"] + " x " + mapData["size"]["y"] + " blocks";

    worldMetaTable.append(tableRow0, tableRow1, tableRow2, tableRow3);

    selectedServerId = serverId;
    worldJoin.action = "/game/" + serverId;

    // EFFECT
    midSection.classList.remove("LoadItem");
    void midSection.offsetWidth; // DOM Reflow for "refresh"
    midSection.classList.add("LoadItem");
    
    document.dispatchEvent(changedEvent);
}

function handleCards() 
{   
    // CORE
    let cards = worldCards.children;

    // Functions
    // INIT
    for (let index in cards) {
        // CORE
        let cardButton = cards[index];

        if (cardButton.tagName !== "BUTTON") 
        {
            continue;
        }

        let cardDiv = cardButton.children[0];

        const serverId = cardDiv.getAttribute("name");
        //let viewButton = document.getElementById(serverId + "ViewButton");

        // Functions
        // MECHANICS
        function UpdateHighlight(event) 
        {
            // Functions
            // INIT
            if (selectedServerId == serverId) 
            {
                cardDiv.classList.add("OutlineHighlight");
            }
            else 
            {
                cardDiv.classList.remove("OutlineHighlight");
            }
        }

        // DIRECT
        document.addEventListener("worldCardChanged", UpdateHighlight);

        cardButton.onclick = () => 
        {
            // Functions
            // INIT
            updateView(serverId);
        };

        UpdateHighlight();
    };

    updateView(1);
}

function initialise() 
{
    // CORE
    worldImage = document.getElementById("WorldImage");
    worldName = document.getElementById("WorldName");
    worldDescription = document.getElementById("WorldDescription");
    worldJoin = document.getElementById("WorldJoin");
    worldCards = document.getElementById("WorldCards");
    worldMetaTable = document.getElementById("WorldMetaTable");
    midSection = document.getElementById("MidSection");

    // Functions
    // DIRECT
    worldJoin.onsubmit = joinWorld;

    // INIT
    utilitiesHandlerModule.runModules(alertHandlerModule);

    handleCards();
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