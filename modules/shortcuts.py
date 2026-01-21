# MODULES
# INTERNAL
from modules.utilities import Utilities

# EXT
import json
from flask import session, request, render_template, make_response

# CORE
CurrentApp = None

# Functions
# MECHANICS
def Initialise(app):
    # CORE
    global CurrentApp

    # Functions
    # INIT
    CurrentApp = app

# CLASS
class Shortcuts:
    def getHostURL():
        # Functions
        # INIT
        host = CurrentApp.config.get("HOST", "127.0.0.1")
        port = CurrentApp.config.get("PORT", 5000)
        scheme = "http"

        hostURL = f"{scheme}://{host}:{port}"

        return hostURL

    def getPageEssentials():
        # Functions
        # INIT
        return { 
        "pages" : Utilities.loadJson("static/json/pages.json"), 
        "core" : Utilities.loadJson("static/json/core.json"),
        "hostURL": request.host_url,
        "user" : session.get("user", None),
        "alert": session.get("alert", None)
        }
    
    def getClientIP():
        # Functions
        # INIT
        requestIP = None

        if request.headers.getlist("X-Forwarded-For"):
            requestIP = request.headers.getlist("X-Forwarded-For")[0].split(',')[0]
        else:
            requestIP = request.remote_addr

        return requestIP

    def renderPage(htmlFileName, currentPageName, **kwargs):
        # Functions
        # INIT
        response = make_response(render_template(
        htmlFileName, 
        currentPage = currentPageName,
        **kwargs or {},
        **Shortcuts.getPageEssentials()
        ))

        user = session.get("user", None)
        logoutValue = session.get("logout", False)

        if (user != None):
            if "userId" in user:
                response.set_cookie("userId", str(user["userId"]))

            if ("authToken" in user) and (not logoutValue):
                response.set_cookie("userAuthToken", str(user["authToken"]))


        if logoutValue == True:
            response.delete_cookie("userAuthToken")
            session["logout"] = None

        session["alert"] = None # RESET ALERT

        return response


    def isFormValid(form, requiredFields):
        # CORE
        response = {"success": True,  "alert": {"type": "danger", "message": ""}}
        emptyFields = []

        # Functions
        # INIT
        formDict = form.to_dict()
        #formFields = formDict.items()

        dictKeysResponse = Utilities.dictHasKeys(formDict, requiredFields)

        if not dictKeysResponse["success"]:
            response["success"] = False
            
            for emptyFieldName in dictKeysResponse["missingKeys"]:
                emptyFields.append(emptyFieldName)
        
        for essentialFieldName in requiredFields:
            if essentialFieldName in emptyFields:
                continue

            if len(str(formDict[essentialFieldName])) <= 0:
                response["success"] = False
                emptyFields.append(essentialFieldName)
        
        response["alert"]["message"] = Utilities.stringAddList("Please fill in: ", emptyFields)

        return response

