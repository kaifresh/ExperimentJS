/**
 * Created by kai on 5/1/17.
 */
import { Trials,_allTrials, _setAllTrials, _didBuildTrials} from './Trials.js';
import { _responses, _setResponses } from "./RunExperiment.js";


var Saves = {};

Saves.parseTrialsForSaving = undefined;
Saves.parseResponsesForSaving = undefined;
Saves.unparseSavedTrials = undefined;
Saves.unparseSavedResponses = undefined;

function errorCheckSavingParsers(){
    if (Saves.parseTrialsForSaving === undefined) throw new Error("Cannot restore trials without parsing function");
    if (Saves.parseResponsesForSaving === undefined) throw new Error("Cannot restore _responses without parsing function");
    if (Saves.unparseSavedTrials === undefined) throw new Error("Cannot restore trials without UNparsing function");
    if (Saves.unparseSavedResponses === undefined) throw new Error("Cannot restore _responses without UNparsing function");
}



Saves.clearSaves = function(){
    localStorage.removeItem("experimentJSsaves");/////
};


Saves.saveBuiltTrialsAndResponses = function(key) {

    // localStorage.clear();

    errorCheckSavingParsers();

    if (typeof(Storage) !== "undefined") {

        // localStorage.experimentJSsaves = undefined;

        //Parse your trials, using the custom serializer..
        var trialsForSaving = exports.parseTrialsForSaving(_allTrials);
        var responsesForSaving = exports.parseResponsesForSaving(_responses);

        //JSONify the trials and _responses
        var experimentJSsaves = {};
        experimentJSsaves['trials'] = trialsForSaving;
        experimentJSsaves['responses'] = responsesForSaving;

        var msg = prompt("Add a message to this save!");

        if (msg === null){
            alert("Trials will not be saved");
            return;
        }

        var dateKey = (new Date()).toUTCString(); //Very clear date

        //Make a new dictionary or get the old one
        var keyed_by_dates = (localStorage.experimentJSsaves === undefined) ? {} : JSON.parse(localStorage.experimentJSsaves);

        //save to it
        keyed_by_dates[msg + " - " +dateKey] = experimentJSsaves;

        //serialize!
        localStorage.experimentJSsaves = JSON.stringify(keyed_by_dates);

        console.log("SAVED THE SHIT", JSON.parse(localStorage.experimentJSsaves));
    }
};


Saves.setSavedTrialsAndResponses = function(){
    errorCheckSavingParsers();

    var all_saves = JSON.parse(localStorage.experimentJSsaves);

    console.log("all saves+ ", all_saves);


    var select_bits = _createDropDownSelect(all_saves);
    select_bits.button.click(function(){

        var temp_using = select_bits.select.find(":selected").text();

        temp_using = all_saves[temp_using];

        _setAllTrials( Saves.unparseSavedTrials(temp_using['trials']) );
        _setResponses( Saves.unparseSavedResponses(temp_using['responses']) );
        if (_responses === undefined || _responses === null) _setResponses( [] );

        console.log("restored all trials: ", _allTrials);
        console.log("restored all _responses: ", _responses);

        Trials.runNextTrial();

        //Remove select from dom
        select_bits.wrap.remove();
    });

    select_bits.button_clear.click(function(){

        if (confirm("Are you sure you want to delete all saved experiments?")){
            exports.clearSaves();
        }

        //Remove select from dom
        select_bits.wrap.remove();
    });

};


function _createDropDownSelect(all_saves){

    var div = $("<div>", {
        id: "saved_info"
    });

    //Make a select to choose from the saves
    var sel = $('<select>');
    Object.keys(all_saves).map(function(elem, i, all){
        //Use the index as the key
        sel.append($("<option>").attr("value",i).text(elem));
    });


    //Button - no functionality here, just view
    var b = $("<button>").text("Choose");
    var b_clear = $("<button>").text("Clear");

    div.append(sel);
    div.append($("<br>"));
    div.append(b);
    div.append(b_clear);
    $(document.body).append(div);

    div.css({
        position: "fixed",
        top: "45vh",
        left: "25vw",
        width: "50vw",
        height: "5vh",
        background: "white",
        border: "2vw",
        "text-align": "center"
    });

    return {
        select: sel,
        button: b,
        button_clear: b_clear,
        wrap: div
    }
}


export { Saves };