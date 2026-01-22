var pageModule = {}

// Modules
import ajaxResponseHandlerModule from "./handlers/ajaxResponseHandler.js";
import alertHandlerModule from "./handlers/alertHandler.js";
import utilitiesHandlerModule from "./handlers/utilitiesHandler.js";

// CORE
var recaptchaWidgetId = null;

var usernameInput = null;
var passwordInput = null;
var loginButton = null;
var loginForm = null;

var Options = null;

// Functions
// MECHANICS
function onLoginClicked(token) 
{
    var formData = utilitiesHandlerModule.formToDict(document.getElementById("loginForm"));

    grecaptcha.execute(Options["SiteKey"], { action: 'login' }).then(responseToken => 
    {
        // Functions
        // INIT

        formData["g-recaptcha-response"] = responseToken;

        $.ajax({
            url: "/loginRequest",
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            headers: 
            {
                "X-CSRFToken":  Options["CSRFToken"]
            },
            //dataType: "json",
            data: JSON.stringify(formData),
            success: function(response){
                ajaxResponseHandlerModule.handleResponse(response);
            },
            error: function(error){
                console.log("Error: ", error);
            }
        });
    })
}

function handleForm()
{
    // Functions
    // DIRECT
    console.log(Options);

    loginForm.addEventListener("submit", function(event) 
    {
        event.preventDefault();

        grecaptcha.ready(async () => {
         return onLoginClicked();
        });
    });
    
    // INIT
    console.log("Running Login Form");

    var loginButtonHolderDiv = document.getElementById("loginButtonHolder");

    var button = document.createElement("button");
    button.innerHTML = "LOGIN";

    button["data-sitekey"] = Options["SiteKey"];
    button["data-callback"] = "onLoginClicked";
    button["data-action"] = "submit";
    button.classList.add("g-recpatcha", "btn", "btn-success");

    loginButtonHolderDiv.appendChild(button);
}

function initialise(_Options) 
{
    // CORE
    Options = _Options;

    loginForm = document.getElementById("loginForm");
    usernameInput = document.getElementById("usernameInput1");
    passwordInput = document.getElementById("passwordInput1");
    loginButton = document.getElementById("formSubmit1");

    // Functions
    // INIT
    window.onLoginClicked = onLoginClicked;

    handleForm();

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


export default pageModule;