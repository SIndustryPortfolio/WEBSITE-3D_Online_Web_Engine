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

var csrfToken = null;
var siteKey = null;

// Functions
// MECHANICS
function onLoginClicked(token) 
{
    csrfToken = $('meta[name="csrf-token"]').attr('content');

    var formData = utilitiesHandlerModule.formToDict(document.getElementById("loginForm"));

    if (recaptchaWidgetId === undefined) 
    {
        console.log("recaptcha not loaded yet!");
    }

    const recaptchaResponse = grecaptcha.getResponse(recaptchaWidgetId);
    if (!recaptchaResponse) {
      alert('Please complete the reCAPTCHA.');
      return;
    }

    formData["g-recaptcha-response"] = recaptchaResponse;

    $.ajax({
        url: "/loginRequest",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
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
    recaptchaWidgetId = grecaptcha.render('recaptcha-container', {
        'sitekey': sitekey
    });

    loginForm.addEventListener("submit", function(event) 
    {
        event.preventDefault();
        return onLoginClicked();
    });
    
    // INIT
    console.log("Running Login Form");

    var loginButtonHolderDiv = document.getElementById("loginButtonHolder");

    var button = document.createElement("button");
    button.innerHTML = "LOGIN";

    button["data-sitekey"] = sitekey;
    button["data-callback"] = "onLoginClicked";
    button["data-action"] = "submit";
    button.classList.add("g-recpatcha", "btn", "btn-success");

    loginButtonHolderDiv.appendChild(button);
}

function initialise() 
{
    // CORE
    csrfToken = "{{csrf_token()}}";
    siteKey = "{{siteKey}}";
    
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