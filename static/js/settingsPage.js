var pageModule = {};

// Modules
import { ajaxResponseHandlerModule } from "./handlers/ajaxResponseHandler.js";
import { alertHandlerModule } from "./handlers/alertHandler.js";
import { utilitiesHandlerModule } from "./handlers/utilitiesHandler.js";

// CORE

// Functions
// MECHANICS
function handleForm(fieldNames)
{
    // Functions
    // DIRECT
    for (let fieldName of fieldNames) 
    {
        console.log(fieldName);

        let fieldForm = document.getElementById(fieldName + "Form");

        fieldForm.addEventListener("submit", function(event){
            // Functions
            // INIT
            event.preventDefault();

            var formData = utilitiesHandlerModule.formToDict(fieldForm);

            $.ajax({
                url: "/settingChangeRequest",
                type: "POST",
                contentType: "application/json",
                headers: 
                {
                    "X-CSRFToken":  formData["csrf_token"]
                },
                data: JSON.stringify(formData),
                success: function(response){
                    ajaxResponseHandlerModule.handleResponse(response);
                },
                error: function(error){
                    console.log("Error: ", error);
                }
            });


        });
    }


}

function initialise(fieldNames) 
{
  // CORE
  utilitiesHandlerModule.runModules(alertHandlerModule);
 
  handleForm(fieldNames);
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