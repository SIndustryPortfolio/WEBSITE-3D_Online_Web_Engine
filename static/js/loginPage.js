// Modules
import { ajaxResponseHandlerModule } from "./handlers/ajaxResponseHandler.js";
import { alertHandlerModule } from "./handlers/alertHandler.js";
import { utilitiesHandlerModule } from "./handlers/utilitiesHandler.js";

// CORE
var usernameInput = null;
var passwordInput = null;
var loginButton = null;
var loginForm = null;

var csrfToken = null;

export var pageModule = {}

// Functions
// MECHANICS
function onLoginClicked(token) 
{
    csrfToken = $('meta[name="csrf-token"]').attr('content');

    var formData = utilitiesHandlerModule.formToDict(document.getElementById("loginForm"));

    $.ajax({
        url: "/loginRequest",
        type: "POST",
        contentType: "application/json",
        headers: 
        {
            "X-CSRFToken":  csrfToken
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
}

function handleForm()
{
    // Functions
    // DIRECT
}

function initialise() 
{
 // CORE
 loginForm = $("#loginForm"); //document.getElementById("loginForm");
 usernameInput = document.getElementById("usernameInput1");
 passwordInput = document.getElementById("passwordInput1");
 loginButton = document.getElementById("formSubmit1");

 // Functions
 // INIT
 window.onLoginClicked = onLoginClicked;

 csrfToken = "{{ csrf_token() }}";

 utilitiesHandlerModule.runModules(alertHandlerModule);

 handleForm();
}

function end() 
{
    // Functions
    // INIT

}

// DIRECT
pageModule.initialise = initialise;
pageModule.end = end;
