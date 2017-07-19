
// RunExperiment.js
// Adds core functionality facilitating the experimental life cycle to the Trials Object.
// Specifically:
//      - Getting participant info
//      - Running the next trial (setting IVs etc)
//      - Storing a response
//      - Outputting responses
//      - Mid/end callbacks

import { Trials, setFuncs, _allTrials, _didBuildTrials, _dvName } from "./Trials.js";
import { _storeResponse, _FormatStoredResponses, _responses } from "./ResponseHandler.js";
import { _outputResponses } from "./ResponsesOutput.js";
import { _interstimulusPause, _shouldInterstimulusPause } from "./InterstimulusPause.js";
import { getParamNames } from "../utils/StringUtils.js";
import { _ApplyFunctionToHTMLChildren } from "../utils/DOMUtils.js";
import { _Unserializable_Token2Var } from "./UnserializableMap.js";

var _ = require("lodash");                                                            // Browserify will resolve this package

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

Trials.runNextTrial = function (options) {                                 // usage -> runNextTrial({shouldStoreResponse: true, dv_value: "inside"});

    if (!_didBuildTrials){
        throw new Error("runNextTrial(): Trial were not built");
    }

    if (_shouldRunNextTrial) {

        if (_shouldRunStartCallback() && typeof  _startCallback === "function"){
            _startCallback();
        }

        if (_shouldRunMidCallback() && typeof _midCallback === "function") {
            _midCallback();
        }

        if (_shouldInterstimulusPause) {
            _interstimulusPause();
        }

        if (options !== undefined && options.hasOwnProperty("dv_value") ) {
            _storeResponse(options);                                       //Settings contains a field "dv_value" which is also read by _storeResponse
        }

        if (_allTrials.length > 0) {
            _displayNextTrial();
            console.log("There are ", _allTrials.length, " trials remaining.");

        } else {

            _outputResponses( _responses );
            
            if ( typeof _endCallBack === "function") _endCallBack();
        }
    }

};

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                        Experiment Lifecycle - Displaying The Next Trial
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

/** Where view-level elements are set - this is like the CONTROLLER method interfacing between MODEL and VIEW*/
function _displayNextTrial() {

    // Deep copy the trial before you replace its tokens.
    // This is because the tokens themselves are just references thus,
    // detokenizing a reference will also detokenize trials elsewhere in _allTrials !!
    var  _trial_to_run = _.cloneDeep( _allTrials.back() );                                // Trial is popped in ./ResponseHandler.js:_storeResponse

    console.log("Displaying next trial:", _trial_to_run);

    // TODO: Support PROMISES -> Facilitates PHASES of EXPERIMENTS
    /** Iterate over each IV and set its pointer to its value for that trial */
    for (var i = 0; i < _trial_to_run.length; ++i) {

        _trial_to_run[i] = _Unserializable_Token2Var( _trial_to_run[i] );               // UnserializableMap.js - DeTokenize

        console.log("Now displaying Unserialized IV", _trial_to_run[i]);

        _fireIVSetFuncWithArgs(_trial_to_run[i]);
    }

}

function _fireIVSetFuncWithArgs(cur_iv) {

    /** Using a FUNCTION to set the display*/
    if ( setFuncs[cur_iv.description] !== undefined ) {
        setFuncs[cur_iv.description].apply(null, cur_iv.value);
    } else {
        throw new Error("No setter function supplied by: " + cur_iv);
    }
}


// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                  Experiment Lifecycle - Star Point Callback (i.e. the "instructions" message)
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

var _startCallback = null;
Trials.setStartCallback = function (fn) {
    if (typeof fn === "function"){
        _startCallback = fn;
    }   else {
        throw new Error("[ setStartCallback ERROR ] - First argument to setStartCallback must be a function");
    }
};

var _didRunStartCallback = false;
function _shouldRunStartCallback() {
    if (_didRunMidCallback) return false;

    // As trials are popped, responses are pushed.
    // Mid point = there are as many responses as trials (or a difference of one for odd number of trials)
    if (_responses.length === 0 ){
        _didRunStartCallback = true;
        return true;
    }
}


// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                  Experiment Lifecycle - Mid Point Callback (i.e. the "take a break" message)
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =


var _midCallback = null;
Trials.setMidpointCallback = function (fn) {
    if (typeof fn === "function"){
        _midCallback = fn;
    }   else {
        throw new Error("[ setMidCallback ERROR ] - First argument to setMidCallback must be a function");
    }
};

var _didRunMidCallback = false;
function _shouldRunMidCallback() {
    if (_didRunMidCallback) return false;

    // As trials are popped, responses are pushed.
    // Mid point = there are as many responses as trials (or a difference of one for odd number of trials)
    if (_allTrials.length ===_responses.length || Math.abs(_allTrials.length -_responses.length) === 1){
        _didRunMidCallback = true;
        return true;
    }
}
///
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//             Experiment Lifecycle - End Callback (a behaviour at the end of the experiment)
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

var _endCallBack = function(){                                                  // Default behaviour is to empty the DOM
    _ApplyFunctionToHTMLChildren(document.body, function(child){
        child.style.display = "none";
    });
};
Trials.setEndCallback = function (value) {
    if (typeof value === "function"){
        _endCallBack = value;
    }   else {
        throw new Error("[ setEndCallback ERROR ] - First argument to setEndCallback must be a function");
    }
};
