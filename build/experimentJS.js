(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ExperimentJS = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _core = require("./core/core.js");

Object.keys(_core).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _core[key];
    }
  });
});

require("./utils/utils.js");

},{"./core/core.js":10,"./utils/utils.js":18}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports._pptNo = exports._pptName = undefined;

var _Trials = require("./Trials.js");

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                      Experiment Lifecycle - Get Participant Info
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

var _pptName = exports._pptName = "unnamed_ppt"; /**
                                                  * Created by kai on 6/7/17.
                                                  */
var _pptNo = exports._pptNo = 0;

_Trials.Trials.getPptInfo = function () {

    while (true) {
        exports._pptName = _pptName = prompt("Please enter your name").trim();
        console.log("name was", _pptName);
        if (_pptName === "" || _pptName === null) {
            alert("Name cannot be blank");
        } else {
            break;
        }
    }

    while (true) {
        exports._pptNo = _pptNo = parseInt(prompt("Please enter your participant number"));
        console.log("ppt number was", _pptNo);
        if (isNaN(_pptNo)) {
            alert("Participant number must be an integer");
        } else {
            break;
        }
    }

    console.log("Participant name: ", _pptName, "\tParticipant number: ", _pptNo);
};

},{"./Trials.js":8}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Pause = exports._shouldInterstimulusPause = undefined;
exports._interstimulusPause = _interstimulusPause;

var _RunExperiment = require("./RunExperiment.js");

var _SetCSSOnElement = require("../utils/SetCSSOnElement.js");

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                                  Interstimulus Pause - creation
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

function _createInterstimulusPause() {
    var blackout = document.createElement("div");
    blackout.id = "interstimulus-pause";

    var css = { // Set blackout style
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        background: "black",
        display: "none" // block when visible
    };

    (0, _SetCSSOnElement.SetCSSOnElement)(blackout, css);

    return blackout;
} // _shouldRunNextTrial,


var _blackOut = _createInterstimulusPause();
document.body.appendChild(_blackOut);

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                                  Interstimulus Pause - use
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

var Pause = {};

Pause.showInterstimulusPause = function (duration) {
    return new Promise(function (resolve, reject) {
        _interstimulusPause(duration).then(function () {
            resolve();
        });
    });
};

var _pause = 500;
Pause.setPauseTime = function (value) {
    if (value === parseInt(value, 10)) {
        _pause = value;
    } else {
        throw new Error("setPauseTime only takes integers");
    }
};

var _shouldInterstimulusPause = exports._shouldInterstimulusPause = true; //used in: RunExperiment.js
Pause.setShouldInterstimulusPause = function (value) {
    if (typeof value === "boolean") {
        exports._shouldInterstimulusPause = _shouldInterstimulusPause = value;
    }
};

var _isInterstimulusPause = false;
function _interstimulusPause(duration) {
    // used in: RunExperiment.js

    duration = duration === undefined ? _pause : duration; //Default to pause time unless an argument is supplied

    return new Promise(function (resolve, reject) {

        if (!_shouldInterstimulusPause) reject(); // Dont show the pause if it hasnt been set. This check is also performed in RunExperiment.js

        _showInterstimulusPause(_blackOut);
        _isInterstimulusPause = true;
        (0, _RunExperiment._setShouldRunNextTrial)(false);

        /* Prevent button mashing while the pause runs */
        setTimeout(function () {

            _hideInterstimulusPause(_blackOut);
            _isInterstimulusPause = false;
            (0, _RunExperiment._setShouldRunNextTrial)(true); // Cannot reassign imported values, so you need a setter

            resolve(); // Promise has resolved here
        }, duration);
    });
}

function _hideInterstimulusPause(blackout) {
    blackout.style.display = "none";
}

function _showInterstimulusPause(blackout) {
    blackout.style.display = "block";
}

exports.Pause = Pause;

},{"../utils/SetCSSOnElement.js":14,"./RunExperiment.js":6}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports._outputResponses = _outputResponses;

var _Trials = require("./Trials.js");

var _ResponseHandler = require("./ResponseHandler.js");

var _GetPptInfo = require("./GetPptInfo.js");

var _CreateDownloadLink = require("../utils/CreateDownloadLink.js");

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                                 Experiment Lifecycle - Output Responses
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

_Trials.Trials.forceOutputResponses = function () {
    console.log("Forcing output of _responses");
    _outputResponses(_ResponseHandler._responses, true);
};

function _outputResponses(allResponses, log) {

    if (allResponses.length === 0) return;

    var csvString = "";

    var keys = Object.keys(allResponses[0]);
    /**These are all the columns in the output*/

    /** Make the header*/
    csvString += "Participant Name, Participant Number, "; //Manually add header
    for (var i = 0; i < keys.length; i++) {
        csvString += keys[i] + ",";
    }
    csvString = csvString.slice(0, -1) + "\n"; //Cut trailing comma and put in a new row/line

    /** Fill the data - This time its an array of arrays not array of dictionaries */
    for (i = 0; i < allResponses.length; i++) {

        csvString += _GetPptInfo._pptName + "," + _GetPptInfo._pptNo + ","; //Manaully add content

        for (var j = 0; j < keys.length; j++) {
            //Iterate over the keys to get teh values

            var value = allResponses[i][keys[j]];
            // console.log("writing this raw value ", value, keys[j]);
            //value = checkReturnProps( value, true ) || value;  //Parse out relevant object fields
            //console.log("Afer it was parsed:", value, "\n*********");
            csvString += value + ",";
        }

        csvString = csvString.slice(0, -1) + "\n"; //Cut trailing comma and put in a new row/line
    }

    if (log) {
        console.log(csvString);
    }

    /** Help out a machine today*/
    var csvContent = encodeURI("data:text/csv;charset=utf-8," + csvString);
    var a = (0, _CreateDownloadLink.createDownloadLink)("results (" + _GetPptInfo._pptName + "," + _GetPptInfo._pptNo.toString() + ").csv", csvContent);
    a.innerHTML = "<h4>Click to download results!</h4>";
    a.className += " results-download";
    document.body.appendChild(a);
    a.click();
}

},{"../utils/CreateDownloadLink.js":11,"./GetPptInfo.js":2,"./ResponseHandler.js":5,"./Trials.js":8}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports._responses = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /**
                                                                                                                                                                                                                                                                               * Created by kai on 6/7/17.
                                                                                                                                                                                                                                                                               */

exports._setResponses = _setResponses;
exports._storeResponse = _storeResponse;

var _Trials = require("./Trials");

var _StringUtils = require("../utils/StringUtils.js");

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                                 Experiment Lifecycle - Store Response
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
var _responses = exports._responses = [];
function _setResponses(responses) {
    // Used in ./Saves.js. Has to live here as it redefines _responses
    if (responses.constructor === Array) {
        exports._responses = _responses = responses;
    } else {
        throw new Error("reponses can only be set to an array");
    }
}

// Responsible for changing hte lengths of _allTrials and _responses
function _storeResponse(options) {
    // Used in ./RunExperiment.js

    var lastTrial = _Trials._allTrials.pop(); // allTrials decreases by one

    // TODO: FIX Serialise objects into .value

    var responseFormatted = {};

    /** Store the IV -> Write out each IV (1 IV per array element) to a field */
    for (var i = 0; i < lastTrial.length; ++i) {
        var ivNum = "IV" + i;

        // If a parser is defined use its output as the value of the response
        if (lastTrial[i].parserFunc !== undefined && typeof lastTrial[i].parserFunc === "function") {
            //$.isFunction(lastTrial[i].parserFunc)){

            var stdName = ivNum + "_" + lastTrial[i].description;

            /**
             * Parser function interface:
             *                  function ( args_passed_to_this_IV_for_this_trial..., index) {}
             *                  return
             *                          string -    processed version of the data
             *                          object -    values are the processed version of parts of the data,
             *                                      keys are names given to each portion of the parsed data
             * */

            var parsed_data = lastTrial[i].parserFunc.apply(this, lastTrial[i].value.concat(i)); // Refer to interface description above

            if (typeof parsed_data === "string" || parsed_data instanceof String) {
                responseFormatted[stdName + "_value"] = parsed_data; // Add parsed IV data to response
            } else if (parsed_data !== null && (typeof parsed_data === "undefined" ? "undefined" : _typeof(parsed_data)) === "object") {

                // TODO: See if keys output by the parser function can be cached for a performance improvement
                var keys = Object.keys(parsed_data);
                for (var k = 0; k < keys.length; k++) {
                    var key_and_data_description = keys[k];
                    responseFormatted[stdName + "_" + key_and_data_description + "_value"] = parsed_data[key_and_data_description]; // Add parsed data for this key to response
                }
            } else {
                throw new Error("[ Parser Function Error ] - Parser function for " + stdName + " must output either a string or an object. You output:", typeof parsed_data === "undefined" ? "undefined" : _typeof(parsed_data));
            }
        } else if (lastTrial[i].value.constructor === Array) {
            // Default behaviour: array of args passed to the IV's set function

            /** Manually write out each argument (from an array) to a field in the object
             *  Only append a number if there are >1 arguments passed in */

            if (lastTrial[i].value.length > 1) {

                //If using a setFunc function with multiple args -> use the arg names to describe the values written to the response
                var arg_names, arg_name;
                arg_names = (0, _StringUtils.getParamNames)(_Trials.setFuncs[lastTrial[i].description]);

                for (var j = 0; j < lastTrial[i].value.length; ++j) {
                    arg_name = arg_names[j];
                    responseFormatted[ivNum + "_" + lastTrial[i].description + "_value_" + arg_name] = lastTrial[i].value[j];
                }
            } else {
                responseFormatted[ivNum + "_" + lastTrial[i].description + "_value"] = lastTrial[i].value[0];
            }
        } else {
            // TODO: Determine if this can be deleted...
            responseFormatted[ivNum + "_" + lastTrial[i].description + "_value"] = lastTrial[i].value;
        }
    }

    /** Store the DV*/
    if (options !== undefined && options.hasOwnProperty("dv_value")) {
        var value = _Trials._dvName || "value";
        responseFormatted["DV_" + value] = options.dv_value;
    } else {
        responseFormatted["DV_value"] = "ERROR - No DV supplied";
        throw new Error("A dependent variable (DV) must be supplied by the calling code. This is an error."); // Do not continue if DV is not supplied
    }

    console.log("STORED THIS RESPONSE: ", responseFormatted);

    _responses.push(responseFormatted); // _responses by one
}

},{"../utils/StringUtils.js":16,"./Trials":8}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports._shouldRunNextTrial = undefined;
exports._setShouldRunNextTrial = _setShouldRunNextTrial;

var _Trials = require("./Trials.js");

var _ResponseHandler = require("./ResponseHandler.js");

var _OutputResponses = require("./OutputResponses.js");

var _InterstimulusPause = require("./InterstimulusPause.js");

var _StringUtils = require("../utils/StringUtils.js");

var _DOMUtils = require("../utils/DOMUtils.js");

var _UnserializableMap = require("./UnserializableMap.js");

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                         Experiment Lifecycle - Start & Game Loop
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

//Cannot reassign imported values, so you need a setter (used in InterstimlusPause.js)
function _setShouldRunNextTrial(value) {
    if (typeof value === "boolean") {
        exports._shouldRunNextTrial = _shouldRunNextTrial = value;
    } else {
        throw new Error("cannot set _shouldRunNextTrial to a non boolean value");
    }
}
// RunExperiment.js
// Adds core functionality facilitating the experimental life cycle to the Trials Object.
// Specifically:
//      - Getting participant info
//      - Running the next trial (setting IVs etc)
//      - Storing a response
//      - Outputting responses
//      - Mid/end callbacks


var _shouldRunNextTrial = exports._shouldRunNextTrial = true; //used by: InterstimulusPause.js
_Trials.Trials.runNextTrial = function (settings) {
    // usage -> runNextTrial({shouldStoreResponse: true, dv_value: "inside"});

    if (!_Trials._didBuildTrials) {
        throw new Error("runNextTrial(): Trial were not built");
        return;
    }

    if (_shouldRunNextTrial) {

        if (_shouldRunMidCallback() && _midCallback !== null) {
            _midCallback();
        }

        if (_InterstimulusPause._shouldInterstimulusPause) {
            (0, _InterstimulusPause._interstimulusPause)();
        }

        if (settings !== undefined && settings.hasOwnProperty("shouldStoreResponse") && settings.shouldStoreResponse) {
            (0, _ResponseHandler._storeResponse)(settings); //Settings contains a field "dv_value" which is also read by _storeResponse
        }

        if (_Trials._allTrials.length > 0) {
            _displayNextTrial();
            console.log("There are ", _Trials._allTrials.length, " trials remaining.");
        } else {

            //Possibly too destructive
            // $(document.body).children().fadeOut();
            (0, _DOMUtils._ApplyFunctionToHTMLChildren)(document.body, function (child) {
                child.style.display = "none";
            });

            (0, _OutputResponses._outputResponses)(_ResponseHandler._responses);

            if (typeof _endCallBack === "function") _endCallBack();
        }
    }
};

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                  Experiment Lifecycle - Mid Point Callback (i.e. the "take a break" message)
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =


var _midCallback = null;
_Trials.Trials.setMidCallback = function (fn) {
    if (typeof fn === "function") {
        _midCallback = fn;
    } else {
        throw new Error("[ setMidCallback ERROR ] - First argument to setMidCallback must be a function");
    }
};

var _didRunMidCallback = false;
function _shouldRunMidCallback() {
    if (_didRunMidCallback) return false;

    // Trials are popped, responses are pushed.
    // Mid point = there are as many responses as trials (or a difference of one for odd number of trials)
    if (_Trials._allTrials.length === _ResponseHandler._responses.length || Math.abs(_Trials._allTrials.length - _ResponseHandler._responses.length) === 1) {
        _didRunMidCallback = true;
        return true;
    }
}

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//             Experiment Lifecycle - End Callback (a behaviour at the end of the experiment)
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
var _endCallBack = null;
_Trials.Trials.setEndCallback = function (value) {
    if (typeof value === "function") {
        _endCallBack = value;
    } else {
        throw new Error("[ setEndCallback ERROR ] - First argument to setEndCallback must be a function");
    }
};

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                                 Experiment Lifecycle - Displaying The Next Trial
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

/** Where view-level elements are set - this is like the CONTROLLER method interfacing between MODEL and VIEW*/
function _displayNextTrial() {
    var nextTrial = _Trials._allTrials[_Trials._allTrials.length - 1]; // Always go from the back. allTrials is decreased by _storeResponse() 
    console.log("Displaying next trial:", nextTrial);

    /** Iterate over each IV and set its pointer to its value for that trial */
    for (var i = 0; i < nextTrial.length; ++i) {
        var cur_iv = nextTrial[i];

        cur_iv = (0, _UnserializableMap._ReplaceTokenWithUnserializableIV)(cur_iv); // From UnserializableMap.js - replace tokens with the actual unserializable object

        _fireIVSetFuncWithArgs(cur_iv);
    }
}

function _fireIVSetFuncWithArgs(cur_iv) {

    /** Using a FUNCTION to set the display*/
    if (_Trials.setFuncs[cur_iv.description] !== undefined) {
        // TODO: FIX Serialise objects into .value
        _Trials.setFuncs[cur_iv.description].apply(null, cur_iv.value);
    } else {
        throw new Error("No setter function supplied by: " + cur_iv);
    }
}

},{"../utils/DOMUtils.js":12,"../utils/StringUtils.js":16,"./InterstimulusPause.js":3,"./OutputResponses.js":4,"./ResponseHandler.js":5,"./Trials.js":8,"./UnserializableMap.js":9}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Saves = undefined;

var _Trials = require("./Trials.js");

var _ResponseHandler = require("./ResponseHandler.js");

var _SetCSSOnElement = require("../utils/SetCSSOnElement.js");

var Saves = {};

// TODO: Remove parser functions. When the trials are built, if any of htem contains unseralizable shit, create a map internal to ExperimentJS & Handle the tokens yourself!

/** Saving Parser Function Interface:
 *              function( array of all trials) { }
 *              return
 *                      array of all parsed trials
 *
 *  Trial array has the following format:
 *      [
 *          {
 *              description:    string -    IV_description
 *              value:          array -     arguments passed to IV's setter function (these must be parsed to JSON serialisable values)
 *              parserFunc:     func  -     TODO: will this be lost? parser function supplied by the user. This will be lost in
 *          }
 *      ]
 * */
/* = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
 *
 *   Store repsonses in localStorage.
 *   Localstorage converts everything to JSON so object types that cannot be converted will be lost
 *   To preserve these unconvertble data, you need to specify a PARSER and UNPARSER for trials and for responses
 *   On Save: the setter replaces the unconvertible data with a token
 *   On Load: The getter checks the token and replaces it with the correct unconvertible object.
 *
 *  = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = */

Saves.parseTrialsForSaving = undefined; //interface is function(_allTrials){...} return a parsed copy of `modified` _allTrials
Saves.parseResponsesForSaving = undefined; //interface is function(_responses){...} return a parsed copy of `modified` _responses
Saves.unparseSavedTrials = undefined;
Saves.unparseSavedResponses = undefined;

// TODO: COMPLETE THIS. write a default parser that checks whether an object can be serialised. If not throw an error that requests a serialiser to be written

function DefaultTrialAndResponseParser(allTrials, err) {

    // var args_to_check;//, serialization_result;

    console.log("ALL TRIALLS/RESPOSNES!");
    console.log(allTrials);

    // Check for the presence of undefined, function, symbol => these cause the JSON.stringify func to fail
    allTrials.map(function (arg_to_check, i, all) {

        console.log(arg_to_check);

        // serialization_result = JSON.stringify(current_arg_to_iv_setter_function)     // TODO: alt approach is to actually serialise

        if (typeof arg_to_check === "function" || arg_to_check === undefined) {
            throw err;
        }
    });

    return allTrials; // Can be safely serialised
}

function errorCheckSavingParsers() {
    if (typeof Saves.parseTrialsForSaving !== "function") throw new Error("Cannot restore trials without parsing function");
    if (typeof Saves.parseResponsesForSaving !== "function") throw new Error("Cannot restore responses without parsing function");
    if (typeof Saves.unparseSavedTrials !== "function") throw new Error("Cannot restore trials without unparsing function");
    if (typeof Saves.unparseSavedResponses !== "function") throw new Error("Cannot restore responses without unparsing function");
}

Saves.clearSaves = function () {
    localStorage.removeItem("experimentJSsaves");
};

// var serially = require("serially");

Saves.saveBuiltTrialsAndResponses = function () {

    errorCheckSavingParsers();

    if (typeof Storage !== "undefined") {

        // localStorage.experimentJSsaves = undefined;
        // TODO: FIX - parse these trials

        var trialsForSaving = Saves.parseTrialsForSaving(_Trials._allTrials); //Parse your trials, using the custom serializer..
        var responsesForSaving = Saves.parseResponsesForSaving(_ResponseHandler._responses);

        var experimentJSsaves = {}; //JSONify the trials and _responses
        experimentJSsaves["trials"] = trialsForSaving;
        experimentJSsaves["responses"] = responsesForSaving;

        var msg = prompt("Add a message to this save!");

        if (msg === null) {
            alert("Trials will not be saved");
            return;
        }

        var dateKey = new Date().toUTCString(); //Very clear date

        //Make a new dictionary or get the old one
        var keyed_by_dates = localStorage.experimentJSsaves === undefined ? {} : JSON.parse(localStorage.experimentJSsaves);

        keyed_by_dates[msg + " - " + dateKey] = experimentJSsaves; //save to it

        localStorage.experimentJSsaves = JSON.stringify(keyed_by_dates); //serialize!

        console.log("Saved Trials", JSON.parse(localStorage.experimentJSsaves));
    } else {
        alert("Your browser does not support trial saving.");
    }
};

Saves.loadSavedTrialsAndResponses = function () {

    errorCheckSavingParsers();

    var experimentJSsaves = JSON.parse(localStorage.experimentJSsaves);

    console.log("all saves: ", experimentJSsaves);

    var select_dropdown_components = _createDropDownSelect(experimentJSsaves); // Display the saves in a dropdown select

    select_dropdown_components.button.addEventListener("click", function () {
        // TODO reimplement as a js onClick event handler

        // var saves_from_seleced_date = select_dropdown_components.select.find(":selected").text();
        var select = select_dropdown_components.select;
        var saves_from_seleced_date = select.options[select.selectedIndex].text;

        saves_from_seleced_date = experimentJSsaves[saves_from_seleced_date];

        (0, _Trials._setAllTrials)(Saves.unparseSavedTrials(saves_from_seleced_date["trials"])); // Unparse your trials using custom unserialiser
        (0, _ResponseHandler._setResponses)(Saves.unparseSavedResponses(saves_from_seleced_date["responses"]));
        if (_ResponseHandler._responses === undefined || _ResponseHandler._responses === null) (0, _ResponseHandler._setResponses)([]);

        console.log("restored trials: ", _Trials._allTrials);
        console.log("restored responses: ", _ResponseHandler._responses);

        _Trials.Trials.runNextTrial();

        //Remove select from dom

        // select_dropdown_components.wrap.remove();
        select_dropdown_components.wrap.parentNode.removeChild(select_dropdown_components.wrap);
    });

    select_dropdown_components.button_clear.addEventListener("click", function () {

        if (window.confirm("Are you sure you want to delete all saved experiments?")) {
            Saves.clearSaves();
        }

        //Remove select from DOM
        // select_dropdown_components.wrap.remove();
        select_dropdown_components.wrap.parentNode.removeChild(select_dropdown_components.wrap);
    });
};

// TODO: Verify that no jQuery is being used!
function _createDropDownSelect(all_saves) {

    // var saves_dialog_wrap = $("<saves_dialog_wrap>", {
    //     id: "saved_info"
    // });

    var saves_dialog_wrap = document.createElement("saves_dialog_wrap");
    saves_dialog_wrap.id = "saved_info";

    //Make a select to choose from the saves
    // var sel = $("<select>");
    var sel = document.createElement("select");

    Object.keys(all_saves).map(function (elem, i, all) {

        var option = document.createElement("option");
        option.value = i; // Use the all_saves index as the key
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

    saves_dialog_wrap.appendChild(sel);
    saves_dialog_wrap.appendChild(document.createElement("br"));
    saves_dialog_wrap.appendChild(b);
    saves_dialog_wrap.appendChild(b_clear);
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
    (0, _SetCSSOnElement.SetCSSOnElement)(saves_dialog_wrap, css);

    return {
        select: sel,
        button: b,
        button_clear: b_clear,
        wrap: saves_dialog_wrap
    };
}

exports.Saves = Saves;

},{"../utils/SetCSSOnElement.js":14,"./ResponseHandler.js":5,"./Trials.js":8}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Trials = exports._didBuildTrials = exports._allTrials = exports._dvName = exports.setFuncs = exports.IVs = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports._setIVGeneric = _setIVGeneric;
exports._setAllTrials = _setAllTrials;

var _jQueryUtils = require("../utils/jQueryUtils.js");

var _UnserializableMap = require("./UnserializableMap.js");

/**
 * To set Trial IVs
 *      1. Set the setter function:                 this is a function `fn` that will manipulate the display
 *      2. Set the args passed to the setter:       these are the varying args passed to `fn` used to vary the IV
 *      3. Call Trials.buildExperiment()
 *
 *  Optional:
 *      4. Set a response parser function:          format passed arguments into a desired output format
 * */

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                                 Trials - Setting IV Levels & Functions
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

var Trials = {};
var IVs = exports.IVs = {};
var setFuncs = exports.setFuncs = {};

var expRepeats = 1;

/** Every IV requires 2 steps: creating the levels and then, setting the target */
Trials.setIVLevels = function (ivname, levels) {

    if (Array.isArray(levels)) {
        // Enforce the type system: Levels must be an array of arrays

        levels.map(function (elem, i) {
            if (!Array.isArray(elem)) {
                throw new Error("[ setIVLevels Error ] - Level " + i + " must be an array of args passed to the set function for " + ivname);
            }
        });

        _setIVGeneric(ivname, "levels", levels); // Actually do the setting
    } else {
        throw new Error("[ setIVLevels Error ] - The second argument to setIVLevels must be an array of arrays, containing the arguments passsed to the set function for " + ivname);
    }
};

Trials.setIVsetFunc = function (ivname, setFunc) {

    if (typeof setFunc !== "function") {
        throw new Error("[ setIVsetFunc Error ] - parser function for " + ivname + " was not a function");
    }

    //This is now a flag to notify ExperimentJS that you"re using functions
    _setIVGeneric(ivname, "setFunc", true);

    //Functions are now stored in their own map, keyed by ivname
    _setSetFunc(ivname, setFunc);
};

var _dvName = exports._dvName = undefined;
Trials.setDVName = function (dvName) {
    if (typeof dvName === "string") {
        _csvIllegalCharCheck(dvName);
        exports._dvName = _dvName = dvName;
    } else {
        throw new Error("The supplied DV name must be of type String");
    }
};

/**
 * Parser function interface:
 *                  function ( args_passed_to_this_IV_for_this_trial..., index) {}
 *                  return
 *                          string -    processed/formatted version of the data
 *                          object -    values are the processed version of parts of the data,
 *                                      keys are names given to each portion of the parsed data
 * */
Trials.setIVResponseParserFunc = function (ivname, parserFunc) {

    if (typeof parserFunc !== "function") {
        throw new Error("[ setIVResponseParserFunc Error ] - parser function for " + ivname + " was not a function: ", typeof parserFunc === "undefined" ? "undefined" : _typeof(parserFunc));
    }

    _setIVGeneric(ivname, "parserFunc", parserFunc);
};

Trials.setRepeats = function (nRepeats) {

    if (!Number.isInteger(nRepeats)) {
        throw new Error("[ setRepeats Error ] - 1st argument to this function must be an integer");
    }

    expRepeats = nRepeats;
};

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                            Trials - Setting IV Levels & Functions (private)
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
/*
* */
function _setIVGeneric(ivName, fieldName, fieldVal) {
    _csvIllegalCharCheck(ivName);
    _csvIllegalCharCheck(fieldName);

    if (!IVs.hasOwnProperty(ivName)) {
        // If IV doesn't exist yet, create it
        IVs[ivName] = {};
    }

    IVs[ivName][fieldName] = fieldVal;
}

function _setSetFunc(ivname, setfunc) {
    setFuncs[ivname] = setfunc;
}

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                                      Trials - Building
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =


var _allTrials = exports._allTrials = [];
var _totalTrials = -1; //Assigned but never used
var _didBuildTrials = exports._didBuildTrials = false;

function _setAllTrials(alltrials) {
    // Used in ./Saves.js. Has to live here as it redefines _allTrials
    if (alltrials.constructor === Array) {
        exports._allTrials = _allTrials = alltrials;
    }
}

// Returns a deep copy of the trials
Trials.getTrials = function () {
    if (_allTrials.length > 0) {
        return (0, _jQueryUtils.extend)(true, [], _allTrials);
    }
};

function _buildTrials(printTrials) {

    console.log("Build Trials. IVS:", IVs);

    var buildingTrial, temp;

    for (var iv in IVs) {
        //Iterate over IVs

        if (IVs[iv].levels === undefined) throw new Error("Levels not supplied for " + iv);
        if (IVs[iv].setFunc === undefined) throw new Error("Setter function not supplied for " + iv);

        // TODO: FIX Add object serialisation

        console.log("Extending all trials array with: " + iv + " (" + IVs[iv].levels.length + " levels)");

        // console.log(IVs[iv].levels);

        var _tokenized_iv_levels = (0, _UnserializableMap._ReplaceUnserializabletWithTokenIV)(IVs[iv].levels, iv); // From UnserializableMap.js - replace actual unserializable object with the  tokens

        if (setFuncs[iv] === undefined) throw new Error("SetFunc not defined for " + iv);

        temp = [];

        var len = _allTrials.length === 0 ? 1 : _allTrials.length; // For the first pass

        for (var i = 0; i < len; ++i) {
            // For all trials built so far

            buildingTrial = _allTrials.pop(); // Pop the incomplete array of iv-vals (objects) and extend it

            // for (var j = 0; j < IVs[iv].levels.length; ++j) { //Extend them by all the levels of the next IV
            for (var j = 0; j < _tokenized_iv_levels.length; ++j) {
                //Extend them by all the levels of the next IV

                var curIVLevel = {};

                curIVLevel.description = iv; // Set the description of the current IV obj 4 the current Level
                curIVLevel.value = _tokenized_iv_levels[j].slice(); // Create a factorial combination of the current IV level

                if (IVs[iv].parserFunc !== undefined) {
                    // Parser functions
                    curIVLevel.parserFunc = IVs[iv].parserFunc;
                }

                // = = = = = = = = = = = Extending the trial = = = = = = = = = = = = = =

                var newOrExtendedTrial;

                if (buildingTrial === undefined) {
                    newOrExtendedTrial = [curIVLevel];
                } else if (buildingTrial.constructor === Array) {
                    newOrExtendedTrial = buildingTrial.concat([curIVLevel]); // The incomplete trial is extended by creating a brand new array FROM it
                }

                temp.push(newOrExtendedTrial);
            }
        }

        exports._allTrials = _allTrials = temp; // /** Replace your previous trials with Temp (don"t know who to do this in place) */
    }

    /** Duplicate the current factorial trials */
    var repeats = expRepeats;
    temp = [];
    for (i = 0; i < repeats; i++) {
        temp = temp.concat(_allTrials);
    }
    exports._allTrials = _allTrials = temp;

    console.log("There are ", _allTrials.length, "trials (using", repeats, "repeats)");
    if (printTrials) {
        console.log(_allTrials);
        for (i = 0; i < _allTrials.length; i++) {
            console.log("TRIAL ", i);
            for (j = 0; j < _allTrials[i].length; j++) {
                console.log(_allTrials[i][j]);
            }
            console.log("******* ******* ******* *******");
        }
    }

    if (_shouldShuffle) _allTrials.shuffle();

    _totalTrials = _allTrials.length; //Used to determine where you are in the trial process
    exports._didBuildTrials = _didBuildTrials = true;
}

Trials.buildExperiment = function (printTrials) {
    if (typeof printTrials !== "boolean") {
        throw new Error("[ buildExperiment ERROR ] - first arg to buildExperiment must be a boolean");
    } else {
        _buildTrials(printTrials === undefined ? false : printTrials);
    }
};

var _shouldShuffle = true;
Trials.setShuffle = function (shouldShuffle) {
    if (typeof shouldShuffle === "boolean") {
        _shouldShuffle = shouldShuffle;
    } else {
        throw new Error("setShuffle only accepts boolean argument");
    }
};

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                                      Trials - sub functions
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
function _csvIllegalCharCheck(string) {

    if (typeof string !== "string") {
        throw new Error("You must supply a variable of type String for this method");
    }

    if (string.indexOf(",") !== -1) {
        throw new Error("Strings used by ExperimentJS may not contain commas: " + string);
    }
}

exports.Trials = Trials;

},{"../utils/jQueryUtils.js":17,"./UnserializableMap.js":9}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports._ReplaceTokenWithUnserializableIV = _ReplaceTokenWithUnserializableIV;
exports._ReplaceUnserializabletWithTokenIV = _ReplaceUnserializabletWithTokenIV;
/**
 * Created by kai on 10/7/17.
 */

//
var UnserializableMap = {};

var unserializable_token = "%%UNSERIALIZABLE%%";

// ========================================================================================

// TOKEN -> Unserializable
function _ReplaceTokenWithUnserializableIV(iv_for_trial) {

    if (!Array.isArray(iv_for_trial.value) || typeof iv_for_trial.description !== "string") {
        throw new Error("_ReplaceTokenWithUnserializableIV", iv_for_trial);
    }

    // {description, value}

    var __unserialise_key,
        __arg_value,
        __iv_args = iv_for_trial.value; // Should be an array

    for (var i = 0; i < __iv_args.length; i++) {

        __arg_value = __iv_args[i];

        if (typeof __arg_value === "string" && __arg_value.includes(unserializable_token)) {

            console.log("FOUND A THING TO UNSERIALISE: ", __arg_value);
            console.log("iv_for_trial", iv_for_trial);

            __unserialise_key = +__arg_value.replace(unserializable_token, "");

            console.log("UnserializableMap", UnserializableMap[iv_for_trial.description], " ==>", __unserialise_key);

            iv_for_trial.value[i] = UnserializableMap[iv_for_trial.description][__unserialise_key];
        }
    }

    return iv_for_trial;
}

// Unserialisable -> Token
function _ReplaceUnserializabletWithTokenIV(array_of_iv_args, iv_name) {

    console.log("******\t_ReplaceUnserializabletWithTokenIV\t*******");

    if (!Array.isArray(array_of_iv_args) || typeof iv_name !== "string") {
        throw new Error("_ReplaceUnserializabletWithTokenIV usage: (array iv_args, string iv_name)");
    }

    var __ctr = 0,
        __val,
        __iv_args,
        __did_tokenize = false;

    var tokenized_arg_array = array_of_iv_args; //.slice();                     // deep copy?

    for (var i = 0; i < tokenized_arg_array.length; i++) {

        __iv_args = tokenized_arg_array[i];

        for (var j = 0; j < __iv_args.length; j++) {

            __val = __iv_args[j];

            if (typeof __val === "function" || (typeof __val === "undefined" ? "undefined" : _typeof(__val)) === "object" || Array.isArray(__val)) {

                if (UnserializableMap[iv_name] === undefined) UnserializableMap[iv_name] = {};

                UnserializableMap[iv_name][__ctr.toString()] = __val; // Save the unserializable

                tokenized_arg_array[i][j] = __ctr + unserializable_token; // Replace unserializable with token

                console.log(iv_name, "\t <== FOUND A THING TO TURN INTO A TOKEN!");
                console.log("\tWhat is being stored: ", __val);
                console.log("\twhat its being replaced with ", tokenized_arg_array[i][j]);
                console.log("\tThe TOKENSIZED arg array: ", tokenized_arg_array[i]);
                console.log("\t\tALL: ", JSON.stringify(tokenized_arg_array));

                __ctr++; // increment the counter

                __did_tokenize = true;
            }
        }

        console.log("\t\t\tPost ALL: ", JSON.stringify(tokenized_arg_array));
    }
    //
    // console.log("========", iv_name, "We have tokenised the arg array now!!");

    if (__did_tokenize) {
        console.log("\t^^^^^^^", tokenized_arg_array, JSON.stringify(tokenized_arg_array));
    }

    // console.log("========================================");


    return tokenized_arg_array;
}

//
// //Just do work on the arg array, make it easy on yourself!
// export function _ReplaceUnserializabletWithToken(iv_arg_array, iv_name){
//
//     if (!Array.isArray(iv_arg_array) || typeof iv_name !== "string"){
//         throw new Error("_ReplaceUnserializabletWithToken usage: (array iv_args, string iv_name)");
//     }
//
//     var __token = 0, __val;
//
//     var tokenized_arg_array = iv_arg_array.slice();                     // deep copy?
//
//     for (var __idx_in_map = 0;  __idx_in_map < tokenized_arg_array.length; __idx_in_map++){
//
//         __val = tokenized_arg_array[__idx_in_map];
//
//         if (typeof __val === "function" || typeof __val === "object" || Array.isArray(__val) ){
//
//             if (UnserializableMap[iv_name] === undefined) UnserializableMap[iv_name] = {};
//
//             __token = __idx_in_map + unserializable_token;          // create token
//
//             UnserializableMap[iv_name][__token ] = __val;           // store the unseralizable in the map
//
//             tokenized_arg_array[__idx_in_map] = __token ;           // replace the unserializable with the token
//         }
//     }
//
//     return tokenized_arg_array;
// }
//
//
//
// export function _ReplaceTokenWithUnserializable(iv_arg_array_parsed, iv_name){
//
//     if (!Array.isArray(iv_arg_array_parsed) || typeof iv_name !== "string"){
//         throw new Error("_ReplaceTokenWithUnserializable usage: (array iv_args, string iv_name)");
//     }
//
//     var __idx_in_array;
//
//     var de_tokenized_arg_array = iv_arg_array_parsed.slice();
//
//     // console.log("iv_arg_array_parsed", iv_arg_array_parsed);
//
//     var to_replace = Object.keys(UnserializableMap[iv_name]);               // Iterate over unserializable
//
//     for (var i = 0; i < to_replace.length; i++){
//
//         __idx_in_array = +to_replace[i].replace(unserializable_token, "");  // remove token, coerce to number
//
//         de_tokenized_arg_array[__idx_in_array] =  UnserializableMap[iv_name][ to_replace[i] ];
//
//     }
//
//     // console.log("de_tokenized_arg_array", de_tokenized_arg_array);
//
//     return de_tokenized_arg_array;
// }
// //
// // function _GetUnserializableForToken(iv_name, token){
// //     return UnserializableMap[iv_name][token];
// // }

},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Saves = exports.Pause = exports.Trials = undefined;

var _Trials = require("./Trials.js");

require("./RunExperiment.js");

require("./OutputResponses.js");

require("./GetPptInfo.js");

var _InterstimulusPause = require("./InterstimulusPause.js");

var _Saves = require("./Saves.js");

//These are the fields of ExperimentJS
// Extends the functionality of the Trials object
//Order of imports is important

/* Import Trials and extend it with additional functionality*/
exports.Trials = _Trials.Trials; //Needs ./ to treat it as an internal (not external dependency)

exports.Pause = _InterstimulusPause.Pause;
exports.Saves = _Saves.Saves;

},{"./GetPptInfo.js":2,"./InterstimulusPause.js":3,"./OutputResponses.js":4,"./RunExperiment.js":6,"./Saves.js":7,"./Trials.js":8}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createDownloadLink = createDownloadLink;
function createDownloadLink(filename, data) {
    ////http://stackoverflow.com/questions/17836273/export-javascript-data-to-csv-file-without-server-interaction
    var a = document.createElement("a");
    a.href = data;
    a.target = "_blank";
    a.download = filename;

    return a;
}

},{}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports._ApplyFunctionToHTMLChildren = _ApplyFunctionToHTMLChildren;
/**
 * Created by kai on 6/7/17.
 */

function _ApplyFunctionToHTMLChildren(elem, func) {

    if (elem.children === undefined || typeof func !== "function") {
        throw new Error("_ApplyFunctionToChildren accepts args (html_element, func)");
    }

    for (var i = 0; i < elem.children.length; i++) {
        func(elem.children[i]);
    }
}

},{}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isFloat = isFloat;
/**
 * Created by kai on 5/1/17.
 */
function isFloat(n) {
  return Number(n) === n && n % 1 !== 0;
}

},{}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SetCSSOnElement = SetCSSOnElement;
/**
 * Created by kai on 6/7/17.
 */
function SetCSSOnElement(elem, css) {
    var keys = Object.keys(css);
    for (var i = 0; i < keys.length; i++) {
        var attribute = keys[i];
        elem.style[attribute] = css[attribute];
    }
}

},{}],15:[function(require,module,exports){
"use strict";

// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                                          Fischer Yates Shuffle
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
Array.prototype.shuffle = function () {
    var currentIndex = this.length,
        temporaryValue,
        randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = this[currentIndex];
        this[currentIndex] = this[randomIndex];
        this[randomIndex] = temporaryValue;
    }
};

},{}],16:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.camelToSentenceCase = camelToSentenceCase;
exports.getParamNames = getParamNames;

// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                                          String Utils
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -

function camelToSentenceCase(str) {
    return str.split(/(?=[A-Z])/).join(" ").toLowerCase();
}

function getParamNames(fn) {
    //wrap these so as not to pollute the namespace
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var ARGUMENT_NAMES = /([^\s,]+)/g;
    function _getParamNames(func) {
        var fnStr = func.toString().replace(STRIP_COMMENTS, "");
        var result = fnStr.slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")")).match(ARGUMENT_NAMES);
        if (result === null) result = [];
        return result;
    }

    return _getParamNames(fn);
}

},{}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.extend = extend;
exports.isPlainObject = isPlainObject;
/**
 * Created by kai on 6/7/17.
 */

// var arr = [];

// var document = window.document;

var getProto = Object.getPrototypeOf;

// var slice = arr.slice;

// var concat = arr.concat;

// var push = arr.push;

// var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var fnToString = hasOwn.toString;

var ObjectFunctionString = fnToString.call(Object);

var support = {};

// Taken from Jquery
function extend() {
    var options,
        name,
        src,
        copy,
        copyIsArray,
        clone,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;

    // Handle a deep copy situation
    if (typeof target === "boolean") {
        deep = target;

        // Skip the boolean and the target
        target = arguments[i] || {};
        i++;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if ((typeof target === "undefined" ? "undefined" : _typeof(target)) !== "object" && !(typeof target === "function")) {
        target = {};
    }

    // Extend jQuery itself if only one argument is passed
    if (i === length) {
        target = this;
        i--;
    }

    for (; i < length; i++) {

        // Only deal with non-null/undefined values
        if ((options = arguments[i]) != null) {

            // Extend the base object
            for (name in options) {
                src = target[name];
                copy = options[name];

                // Prevent never-ending loop
                if (target === copy) {
                    continue;
                }

                // Recurse if we're merging plain objects or arrays
                if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {

                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && Array.isArray(src) ? src : [];
                    } else {
                        clone = src && isPlainObject(src) ? src : {};
                    }

                    // Never move original objects, clone them
                    target[name] = extend(deep, clone, copy);

                    // Don't bring in undefined values
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }

    // Return the modified object
    return target;
}

function isPlainObject(obj) {
    var proto, Ctor;

    // Detect obvious negatives
    // Use toString instead of jQuery.type to catch host objects
    if (!obj || toString.call(obj) !== "[object Object]") {
        return false;
    }

    proto = getProto(obj);

    // Objects with no prototype (e.g., `Object.create( null )`) are plain
    if (!proto) {
        return true;
    }

    // Objects with prototype are plain iff they were constructed by a global Object function
    Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
    return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
}

},{}],18:[function(require,module,exports){
"use strict";

require("./CreateDownloadLink.js");

require("./Shuffle.js");

require("./NumberUtils.js");

require("./StringUtils.js");

},{"./CreateDownloadLink.js":11,"./NumberUtils.js":13,"./Shuffle.js":15,"./StringUtils.js":16}]},{},[1])(1)
});