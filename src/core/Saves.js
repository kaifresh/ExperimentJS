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

// TODO: Set these to temp_trial_parser
Saves.parseTrialsForSaving = undefined;                     //interface is function(_allTrials){...} return a parsed copy of `modified` _allTrials
Saves.parseResponsesForSaving = undefined;                  //interface is function(_responses){...} return a parsed copy of `modified` _responses
Saves.unparseSavedTrials = undefined;
Saves.unparseSavedResponses = undefined;

// TODO: write a default parser that checks whether an object can be serialised. If not throw an error that requests a serialiser to be written
function temp_trial_parser(allTrials, err){

    // Check for the presence of undefined, function, symbol => these cause the JSON.stringify func to fail
    allTrials.map(function(elem, i, all){
        var cur_child_elem = elem; // Recurse over elements and check them for the bad datatypes
        if (typeof cur_child_elem === "function" || cur_child_elem === undefined){
            throw err;
            return;
        }
    });

    return allTrials;                                                                   // Can be safely serialised
}

function errorCheckSavingParsers(){
    if (Saves.parseTrialsForSaving === undefined) throw new Error("Cannot restore trials without parsing function");
    if (Saves.parseResponsesForSaving === undefined) throw new Error("Cannot restore _responses without parsing function");
    if (Saves.unparseSavedTrials === undefined) throw new Error("Cannot restore trials without UNparsing function");
    if (Saves.unparseSavedResponses === undefined) throw new Error("Cannot restore _responses without UNparsing function");
}

Saves.clearSaves = function(){
    localStorage.removeItem("experimentJSsaves");
};

Saves.saveBuiltTrialsAndResponses = function() {

    errorCheckSavingParsers();

    if (typeof(Storage) !== "undefined") {

        // localStorage.experimentJSsaves = undefined;

        var trialsForSaving = Saves.parseTrialsForSaving(_allTrials);                   //Parse your trials, using the custom serializer..
        var responsesForSaving = Saves.parseResponsesForSaving(_responses);

        var experimentJSsaves = {};                                                     //JSONify the trials and _responses
        experimentJSsaves["trials"] = trialsForSaving;
        experimentJSsaves["responses"] = responsesForSaving;

        var msg = prompt("Add a message to this save!");

        if (msg === null){
            alert("Trials will not be saved");
            return;
        }

        var dateKey = (new Date()).toUTCString(); //Very clear date

        //Make a new dictionary or get the old one
        var keyed_by_dates = (localStorage.experimentJSsaves === undefined) ? {} : JSON.parse(localStorage.experimentJSsaves);

        keyed_by_dates[msg + " - " +dateKey] = experimentJSsaves;                       //save to it

        localStorage.experimentJSsaves = JSON.stringify(keyed_by_dates);                //serialize!

        console.log("Saved Trials", JSON.parse(localStorage.experimentJSsaves));
    }
};


Saves.loadSavedTrialsAndResponses = function(){
    
    errorCheckSavingParsers();

    var experimentJSsaves = JSON.parse(localStorage.experimentJSsaves);

    console.log("all saves: ", experimentJSsaves);


    var select_dropdown_components = _createDropDownSelect(experimentJSsaves);          // Display the saves in a dropdown select

    select_dropdown_components.button.addEventListener("click", function(){            // TODO reimplement as a js onClick event handler

        // var saves_from_seleced_date = select_dropdown_components.select.find(":selected").text();
        var select = select_dropdown_components.select;
        var saves_from_seleced_date = select.options[select.selectedIndex].text;

        saves_from_seleced_date = experimentJSsaves[saves_from_seleced_date];

        _setAllTrials( Saves.unparseSavedTrials( saves_from_seleced_date["trials"]) );                // Unparse your trials using custom unserialiser
        _setResponses( Saves.unparseSavedResponses( saves_from_seleced_date["responses"]) );
        if (_responses === undefined || _responses === null) _setResponses( [] );

        console.log("restored all trials: ", _allTrials);
        console.log("restored all _responses: ", _responses);

        Trials.runNextTrial();

        //Remove select from dom

        // select_dropdown_components.wrap.remove();
        select_dropdown_components.wrap.parentNode.removeChild(select_dropdown_components.wrap);
    });

    select_dropdown_components.button_clear.addEventListener("click", function(){

        if (window.confirm("Are you sure you want to delete all saved experiments?")){
            Saves.clearSaves();
        }

        //Remove select from DOM
        // select_dropdown_components.wrap.remove();
        select_dropdown_components.wrap.parentNode.removeChild(select_dropdown_components.wrap);
    });

};



// TODO: Verify that no jQuery is being used!
function _createDropDownSelect(all_saves){

    // var saves_dialog_wrap = $("<saves_dialog_wrap>", {
    //     id: "saved_info"
    // });

    var saves_dialog_wrap = document.createElement("saves_dialog_wrap");
    saves_dialog_wrap.id = "saved_info";

    //Make a select to choose from the saves
    // var sel = $("<select>");
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


    // saves_dialog_wrap.append(sel);
    saves_dialog_wrap.appendChild(sel);
    // saves_dialog_wrap.append($("<br>"));
    saves_dialog_wrap.appendChild(document.createElement("br"));
    // saves_dialog_wrap.append(b);
    saves_dialog_wrap.appendChild(b);
    // saves_dialog_wrap.append(b_clear);
    saves_dialog_wrap.appendChild(b_clear);
    // $(document.body).append(saves_dialog_wrap);
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
    // saves_dialog_wrap.css({
    //     position: "fixed",
    //     top: "45vh",
    //     left: "25vw",
    //     width: "50vw",
    //     height: "5vh",
    //     background: "white",
    //     border: "2vw",
    //     "text-align": "center"
    // });

    return {
        select: sel,
        button: b,
        button_clear: b_clear,
        wrap: saves_dialog_wrap
    };
}


export { Saves };