
// RunExperiment.js
// Adds core functionality facilitating the experimental life cycle to the Trials Object.
// Specifically:
//      - Getting participant info
//      - Running the next trial (setting IVs etc)
//      - Storing a response
//      - Outputting responses
//      - Mid/end callbacks


import { Trials, setFuncs, _allTrials, _didBuildTrials, _dvName } from "./Trials.js";
import { _storeResponse, _responses } from "./ResponseHandler.js";
import { _outputResponses } from "./OutputResponses.js";
import { _interstimulusPause, _shouldInterstimulusPause } from "./InterstimulusPause.js";
import { getParamNames } from "../utils/StringUtils.js";
import { _ApplyFunctionToHTMLChildren } from "../utils/DOMUtils.js";
import { _Unserializable_Token2Var } from "./UnserializableMap.js";

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                         Experiment Lifecycle - Start & Game Loop
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

//Cannot reassign imported values, so you need a setter (used in InterstimlusPause.js)
export function _setShouldRunNextTrial(value){
    if (typeof(value) === "boolean"){
        _shouldRunNextTrial = value;
    } else {
        throw new Error("cannot set _shouldRunNextTrial to a non boolean value");
    }
}

export var _shouldRunNextTrial = true;                                      // used by: InterstimulusPause.js

Trials.runNextTrial = function (settings) {                                 // usage -> runNextTrial({shouldStoreResponse: true, dv_value: "inside"});

    if (!_didBuildTrials){
        throw new Error("runNextTrial(): Trial were not built");
        return;
    }

    if (_shouldRunNextTrial) {
        
        if (_shouldRunMidCallback() && _midCallback !== null) {
            _midCallback();
        }

        if (_shouldInterstimulusPause) {
            _interstimulusPause();
        }

        if (settings !== undefined && settings.hasOwnProperty("shouldStoreResponse") && settings.shouldStoreResponse) {
            _storeResponse(settings);                                       //Settings contains a field "dv_value" which is also read by _storeResponse
        }

        if (_allTrials.length > 0) {
            _displayNextTrial();
            console.log("There are ", _allTrials.length, " trials remaining.");
            
        } else {

            //Possibly too destructive
            // $(document.body).children().fadeOut();
            _ApplyFunctionToHTMLChildren(document.body, function(child){
                child.style.display = "none";
            });

            _outputResponses(_responses);

            if ( typeof _endCallBack === "function") _endCallBack();

        }
    }

};

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                                 Experiment Lifecycle - Displaying The Next Trial
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

var _ = require("lodash");                                                            // Browserify will add this package

/** Where view-level elements are set - this is like the CONTROLLER method interfacing between MODEL and VIEW*/
export var _next_trial;
function _displayNextTrial() {

    // If you Pop here and store the trial, then you use it in store response

    var nextTrial = _allTrials[_allTrials.length - 1]; // Always go from the back. allTrials is decreased by _storeResponse() 
    console.log("Displaying next trial:", nextTrial);
    
    /** Iterate over each IV and set its pointer to its value for that trial */
    for (var i = 0; i < nextTrial.length; ++i) {

        // Deep copy the trial before you replace its tokens. This is because the tokens themselves are passed by reference and you will have replaced tokens in other shit too 
        var cur_iv_unserialized = _Unserializable_Token2Var( _.cloneDeep( nextTrial[i] ) );         // UnserializableMap.js

        console.log("Now displaying Unserialized IV", cur_iv_unserialized);

        _fireIVSetFuncWithArgs(cur_iv_unserialized);
    }
}

function _fireIVSetFuncWithArgs(cur_iv) {

    /** Using a FUNCTION to set the display*/
    if ( setFuncs[cur_iv.description] !== undefined ) {
        // TODO: FIX Serialise objects into .value
        setFuncs[cur_iv.description].apply(null, cur_iv.value);
    } else {
        throw new Error("No setter function supplied by: " + cur_iv);
    }
}



// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                  Experiment Lifecycle - Mid Point Callback (i.e. the "take a break" message)
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =


var _midCallback = null;
Trials.setMidCallback = function (fn) {
    if (typeof fn === "function"){
        _midCallback = fn;
    }   else {
        throw new Error("[ setMidCallback ERROR ] - First argument to setMidCallback must be a function");
    }
};

var _didRunMidCallback = false;
function _shouldRunMidCallback() {
    if (_didRunMidCallback) return false;

    // Trials are popped, responses are pushed.
    // Mid point = there are as many responses as trials (or a difference of one for odd number of trials)
    if (_allTrials.length ===_responses.length || Math.abs(_allTrials.length -_responses.length) === 1){
        _didRunMidCallback = true;
        return true;
    }
}

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//             Experiment Lifecycle - End Callback (a behaviour at the end of the experiment)
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

var _endCallBack = null;
Trials.setEndCallback = function (value) {
    if (typeof value === "function"){
        _endCallBack = value;
    }   else {
        throw new Error("[ setEndCallback ERROR ] - First argument to setEndCallback must be a function");
    }
};
