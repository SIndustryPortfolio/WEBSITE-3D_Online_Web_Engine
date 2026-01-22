// Modules
import { ajaxResponseHandlerModule } from "./handlers/ajaxResponseHandler.js";
import { alertHandlerModule } from "./handlers/alertHandler.js";
import { utilitiesHandlerModule } from "./handlers/utilitiesHandler.js";

// CORE
var otpForm = null;
var otpResendForm = null;
var otpCancelForm = null;

var csrfToken = null;

export default pageModule = {}

// Functions
// MECHANICS
function onOTPCancelClicked(event) 
{
    // CORE
    csrfToken = $('meta[name="csrf-token"]').attr('content');
    event.preventDefault();

    // Functions
    // INIT
    $.ajax({
        url: "/mfa/cancelRequest",
        type: "POST",
        contentType: "application/json",
        headers: 
        {
            "X-CSRFToken":  csrfToken
        },
        data: JSON.stringify(null),
        success: function(response){
            ajaxResponseHandlerModule.handleResponse(response);
        },
        error: function(error){
            console.log("Error: ", error);
        }
    });
}

function onOTPResendClicked(event) 
{
    // CORE
    csrfToken = $('meta[name="csrf-token"]').attr('content');
    event.preventDefault();

    // Functions
    // INIT
    $.ajax({
        url: "/mfa/resendRequest",
        type: "POST",
        contentType: "application/json",
        headers: 
        {
            "X-CSRFToken":  csrfToken
        },
        data: JSON.stringify(null),
        success: function(response){
            ajaxResponseHandlerModule.handleResponse(response);
        },
        error: function(error){
            console.log("Error: ", error);
        }
    });
}

function onOTPSubmitClicked(event)
{
    // CORE
    csrfToken = $('meta[name="csrf-token"]').attr('content');
    event.preventDefault();

    // Functions
    // INIT
    var formData = utilitiesHandlerModule.formToDict(otpForm);

    $.ajax({
        url: "/mfa/authoriseRequest",
        type: "POST",
        contentType: "application/json",
        headers: 
        {
            "X-CSRFToken":  csrfToken
        },
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
 otpForm = document.getElementById("otpForm");
 otpResendForm = document.getElementById("otpResendForm"); 
 otpCancelForm = document.getElementById("otpCancelForm");
 
 // Functions
 // INIT
 otpCancelForm.addEventListener("submit", onOTPCancelClicked);
 otpResendForm.addEventListener("submit", onOTPResendClicked);
 otpForm.addEventListener("submit", onOTPSubmitClicked);

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
