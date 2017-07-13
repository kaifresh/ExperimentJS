/* = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
 *
 *   Store repsonses in localStorage.
 *   Localstorage converts everything to JSON so object types that cannot be converted will be lost
 *   To preserve these unconvertble data, you need to specify a PARSER and UNPARSER for trials and for responses
 *   On Save: the setter replaces the unconvertible data with a token
 *   On Load: The getter checks the token and replaces it with the correct unconvertible object.
 *
 *  = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = */


import { Trials,_allTrials, _setAllTrials, _didBuildTrials} from "./Trials.js";
import { _responses, _setResponses } from "./ResponseHandler.js";
import { SetCSSOnElement } from "../utils/SetCSSOnElement.js";

var Saves = {};

Saves.clearSaves = function(){
    localStorage.removeItem("experimentJSsaves");
};

Saves.saveBuiltTrialsAndResponses = function() {

    if (typeof(Storage) !== "undefined") {

        var experimentJSsaves = {};
        experimentJSsaves["trials"] = _allTrials;                                           // Safely tokenized
        experimentJSsaves["responses"] = _responses;

        var msg = prompt("Add a message to this save!");

        if (msg === null){
            alert("Trials will not be saved");
            return;
        }

        var dateKey = (new Date()).toUTCString(); //Very clear date

        var saves_keyed_by_dates = (localStorage.experimentJSsaves === undefined) ? {} : JSON.parse(localStorage.experimentJSsaves);

        saves_keyed_by_dates[msg + " - " +dateKey] = experimentJSsaves;                       //save to it

        localStorage.experimentJSsaves = JSON.stringify(saves_keyed_by_dates);                //serialize!

        console.log("Saved Trials", JSON.parse(localStorage.experimentJSsaves));
    }
};


Saves.loadSavedTrialsAndResponses = function(){

    if (document.getElementById(saves_dialog_id) !== null) return;                      // Dont display dialog if its already in the DOM

    var experimentJSsaves = JSON.parse(localStorage.experimentJSsaves);

    console.log("all saves: ", experimentJSsaves);

    var select_dropdown_components = _createDropDownSelect(experimentJSsaves);          // Display the saves in a dropdown select

    select_dropdown_components.button.addEventListener("click", function(){            // TODO reimplement as a js onClick event handler

        // var saves_from_seleced_date = select_dropdown_components.select.find(":selected").text();
        var select = select_dropdown_components.select;
        var saves_from_seleced_date = select.options[select.selectedIndex].text;

        saves_from_seleced_date = experimentJSsaves[saves_from_seleced_date];

        _setAllTrials( saves_from_seleced_date["trials"] );                                             // Unparse your trials using custom unserialiser
        _setResponses( saves_from_seleced_date["responses"] );
        if (_responses === undefined || _responses === null) _setResponses( [] );

        console.log("restored trials: ", _allTrials);
        console.log("restored responses: ", _responses);

        Trials.runNextTrial();


        select_dropdown_components.wrap.parentNode.removeChild(select_dropdown_components.wrap);        //Remove select from dom
    });

    select_dropdown_components.button_clear.addEventListener("click", function(){

        if (window.confirm("Are you sure you want to delete all saved experiments?")){
            Saves.clearSaves();
        }

        select_dropdown_components.wrap.parentNode.removeChild(select_dropdown_components.wrap);         //Remove select from DOM
    });

    select_dropdown_components.button_cancel.addEventListener("click", function(){
        select_dropdown_components.wrap.parentNode.removeChild(select_dropdown_components.wrap);
    });


};

// Remove this functionality if Storage isnt supported
if (typeof(Storage) === "undefined"){
    var localStorageIsUnsupported = function(){alert("Your browser does not support local storage or experiment result saving")};
    Saves.loadSavedTrialsAndResponses = Saves.saveBuiltTrialsAndResponses = localStorageIsUnsupported;
}



// TODO: Verify that no jQuery is being used!
const saves_dialog_id = "ExperimentJS_Saved_Info";
function _createDropDownSelect(all_saves){

    var saves_dialog_wrap = document.createElement("saves_dialog_wrap");
    saves_dialog_wrap.id = saves_dialog_id;

    //Make a select to choose from the saves
    var sel = document.createElement("select");

    Object.keys(all_saves).map(function(elem, i, all){

        var option = document.createElement("option");
        option.value = i;                                           // Use the all_saves index as the key
        option.text = elem;
        sel.appendChild(option);
        // sel.append($("<option>").attr("value",i).text(elem));
    });


    //Button - no functionality here, just view
    // var b = $("<button>").text("Choose");
    var b = document.createElement("button");
    b.innerHTML = "Choose";


    // var b_clear = $("<button>").text("Clear");
    var b_clear = document.createElement("button");
    b_clear.innerHTML = "Clear";

    var b_cancel = document.createElement("button");
    b_cancel.innerHTML = "Cancel";

    
    saves_dialog_wrap.appendChild(sel);
    saves_dialog_wrap.appendChild(document.createElement("br"));
    saves_dialog_wrap.appendChild(b);
    saves_dialog_wrap.appendChild(b_clear);
    saves_dialog_wrap.appendChild(b_cancel);
    document.body.appendChild(saves_dialog_wrap);

    var css = {
        position: "fixed",
        top: "45vh",
        left: "25vw",
        width: "50vw",
        height: "5vh",
        background: "white",
        border: "2vw",
        "text-align": "center"
    };
    SetCSSOnElement(saves_dialog_wrap, css);


    return {
        select: sel,
        button: b,
        button_clear: b_clear,
        button_cancel: b_cancel,
        wrap: saves_dialog_wrap
    };
}


export { Saves };