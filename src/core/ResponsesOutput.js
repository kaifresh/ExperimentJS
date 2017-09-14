
import { Trials } from "./Trials.js";
import { _responses } from "./ResponseHandler.js";
import { _pptName, _pptNo } from "./GetPptInfo.js";
import { createDownloadLink } from "../utils/CreateDownloadLink.js";
import { _FormatStoredResponses } from "./ResponseHandler.js";

var _ = require("lodash");                                                            // Browserify will resolve this package
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                                 Experiment Lifecycle - Output Responses
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

/**
 * Download participant's responses as a csv
 */
Trials.forceOutputResponses = function(){
    console.log("Forcing output of _responses");
    Trials.OutputResponses(_outputResponses(_responses, true));
};

var _is_outputting_csv_format = true;
Trials.DataOutputFormatModes = {"CSV": "csv", "DATA_ARRAY": "data_array"};
Trials.SetDataOutputFormatType = function(mode){
    _is_outputting_csv_format = mode === Trials.DataOutputFormatModes["CSV"];
};


export function _outputResponses(allResponses, log) {

    if (allResponses.length === 0) return;

    allResponses = _FormatStoredResponses( _.cloneDeep(allResponses) );

    return _is_outputting_csv_format ? _formatAllResponsesToCSV(allResponses) : allResponses;
}

export function _formatAllResponsesToCSV(allResponses, log = false){

    var csvString = "";

    var keys = Object.keys(allResponses[0]);            // These are all the columns in the output

    csvString += "Participant Name, Participant Number, "; // Add ppt info to header
    for (var i = 0; i < keys.length; i++) {
        csvString += keys[i] + ",";
    }
    csvString = csvString.slice(0, -1) + "\n";          // Cut trailing comma and put in a new row/line

    /* Fill the data - This time its an array of arrays not array of dictionaries */
    for (i = 0; i < allResponses.length; i++) {

        csvString += _pptName + "," + _pptNo + ",";     // Manaully add content

        for (var j = 0; j < keys.length; j++) {         // Iterate over the keys to get teh values
            var value = allResponses[i][keys[j]];
            csvString += value + ",";
        }

        csvString = csvString.slice(0, -1) + "\n"; //Cut trailing comma and put in a new row/line
    }

    if (log) console.log(csvString);
        
    return encodeURI("data:text/csv;charset=utf-8," + csvString);
}

export function _createCSVLinkAndDownload(csvContent){
    var a = createDownloadLink("results (" + _pptName + "," + _pptNo.toString() + ").csv", csvContent);
    a.innerHTML = "<h4>Click to download results!</h4>";
    a.className += " results-download";
    document.body.appendChild(a);
    a.click();
}