var pageModule = {};

// Modules
import ajaxResponseHandlerModule from "./handlers/ajaxResponseHandler.js";
import alertHandlerModule from "./handlers/alertHandler.js";
import utilitiesHandlerModule from "./handlers/utilitiesHandler.js";

// CORE
var usernameInput = null;
var passwordInput = null;
var registerForm = null;
var registerButton = null;

var Options = null;

// Functions
// MECHANICS
function onRegisterClicked(token) 
{
    var formData = utilitiesHandlerModule.formToDict(document.getElementById("registerForm"));

    grecaptcha.execute(Options["SiteKey"]).then(responseToken => 
    {
        // Functions
        // INIT

        formData["g-recaptcha-response"] = responseToken;

        $.ajax({
            url: "/registerRequest",
            type: "POST",
            contentType: "application/json",
            headers: 
            {
                "X-CSRFToken":  Options["CSRFToken"]
            },
            dataType: "json",
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
    registerForm.addEventListener("submit", function(event) 
    {
        event.preventDefault();

        grecaptcha.ready(async () => {
         return onRegisterClicked();
        });
    });
}

function initialise(_Options) 
{
    // CORE
    Options = _Options;

    registerForm = document.getElementById("loginForm");
    usernameInput = document.getElementById("usernameInput1");
    passwordInput = document.getElementById("passwordInput1");
    registerButton = document.getElementById("formSubmit1");
    
    // Functions
    // INIT
    window.onRegisterClicked = onRegisterClicked;
    
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