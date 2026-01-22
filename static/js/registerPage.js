var pageModule = {};

// Modules
import { ajaxResponseHandlerModule } from "./handlers/ajaxResponseHandler.js";
import { alertHandlerModule } from "./handlers/alertHandler.js";
import { utilitiesHandlerModule } from "./handlers/utilitiesHandler.js";

// CORE
var usernameInput = null;
var passwordInput = null;
var registerForm = null;
var registerButton = null;

var csrfToken = null;

// Functions
// MECHANICS
function onRegisterClicked(token) 
{
    csrfToken = $('meta[name="csrf-token"]').attr('content');

    var formData = utilitiesHandlerModule.formToDict(document.getElementById("registerForm"));

    $.ajax({
        url: "/registerRequest",
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
  registerForm = $("#registerForm"); //document.getElementById("loginForm");
  usernameInput = document.getElementById("usernameInput1");
  passwordInput = document.getElementById("passwordInput1");
  registerButton = document.getElementById("formSubmit1");
 
  // Functions
  // INIT
  window.onRegisterClicked = onRegisterClicked;
 
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


export default pageModule;