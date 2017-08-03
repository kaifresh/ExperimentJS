
// RunExperiment.js
// Adds core functionality facilitating the experimental life cycle to the Trials Object.
// Specifically:
//      - Getting participant info
//      - Running the next trial (setting IVs etc)
//      - Storing a response
//      - Outputting responses
//      - Mid/end callbacks

import { Trials, setFuncs, _allTrials, _didBuildTrials, _dvName, _isUsingPhases } from "./Trials.js";
import { _storeResponse, _FormatStoredResponses, _responses } from "./ResponseHandler.js";
import { _outputResponses, _createCSVLinkAndDownload } from "./ResponsesOutput.js";
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
var _didStartExperiment = false;

/**
 * Call Trials.runNextTrial both to start the experiment and to progress to the next trial.
 * To progress, an object with the field "dv_value" should be passed in as the first arg,
 * containing the participant's response to the trial that was just run.
 * @param {object} options - must contain field "dv_value"
 */
Trials.runNextTrial = function (options) {                                 // usage -> runNextTrial({shouldStoreResponse: true, dv_value: "inside"});

    if (!_didBuildTrials){
        throw new Error("runNextTrial(): Trial were not built");
    }

    if (!_didStartExperiment) _didStartExperiment = true;

    if (_shouldRunNextTrial) {

        if (_shouldRunStartCallback() && typeof  _startCallback === "function"){
            _startCallback();
        }

        if (_shouldRunMidCallback() && typeof _midCallback === "function") {
            _midCallback();
        }

        if (options !== undefined && options.hasOwnProperty("dv_value") ) {
            _storeResponse(options);                                       //Settings contains a field "dv_value" which is also read by _storeResponse
        }

        if (_allTrials.length > 0) {

            console.log("There are ", _allTrials.length, " trials remaining.");

            if (_shouldInterstimulusPause) {
                _interstimulusPause().then(function(){
                    _displayNextTrial();
                });
            } else {
                _displayNextTrial();
            }

        } else {

            Trials.OutputResponses(_outputResponses(_responses));

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
    var  _trial_to_run = _detokenizeTrial(_.cloneDeep( _allTrials.back() ));                // Trial is popped in ./ResponseHandler.js:_storeResponse

    console.log("Displaying next trial:", _trial_to_run);

    if (!_isUsingPhases){
        _displayTrialSimultaneously(_trial_to_run);
    } else {
        _displayTrialPhases(_trial_to_run);
    }

}

function _detokenizeTrial(_trial_to_run){
    return _trial_to_run.map(function(_tokenised_trial){
        return _Unserializable_Token2Var(_tokenised_trial);
    });
}

function _displayTrialSimultaneously(_trial_to_run){
    /** Iterate over each IV and set its pointer to its value for that trial */
    for (var i = 0; i < _trial_to_run.length; ++i) {
        console.log("Now displaying Unserialized IV", _trial_to_run[i]);
        _fireIVSetFuncWithArgs(_trial_to_run[i]);
    }
}

function _displayTrialPhases(_trial_to_run){

    var promise_array = [];

    Trials.Phases.map(function( current_phase, i ){                                 // Iterate over phases

        var phase_promise = function() {
            return new Promise(function (resolve, reject) {                        // Build promises chain of phases

                current_phase.phase_ivs.map(function (iv_description) {             // Iterate over IVs named in phase

                    _trial_to_run.map(function (iv_trial) {                         // Find those IVs in the trial array
                        if (iv_trial.description === iv_description) {
                            _fireIVSetFuncWithArgs(iv_trial);                           // Show them
                        }
                    });
                });

                if (current_phase.phase_transition_function !== undefined) {             // Set in ./Trials.s:Trials.setIvPhases()
                    current_phase.phase_transition_function(resolve);                   // Transition function must call resolve
                } else if (current_phase.phase_transition_delay !== undefined) {
                    setTimeout(function () {
                        resolve();                                                      // Resolve after delay
                    }, current_phase.phase_transition_delay);
                }
            });
        };

        promise_array.push(phase_promise);

    });

    promise_array.reduce((p, f) => p.then(f), Promise.resolve());                   // Run array of promises in a chain
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
/**
 * Set a callback to be run at the start of the experiment.
 * @param {function} start_callback
 */
Trials.setStartCallback = function (start_callback) {

    _ErrorIfDidStartExperiment();

    if (typeof start_callback === "function"){
        _startCallback = start_callback;
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
/**
 * Set a callback to be run at the midpoint of the experiment
 * @param fn
 */
Trials.setMidpointCallback = function (fn) {

    _ErrorIfDidStartExperiment();

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

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//             Experiment Lifecycle - Output responses
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

/**
 * Function to output URI encoded csv.
 * Can be re-assigned or overridden to provide additional
 * functionality (e.g. sending the CSV to a server).
 * Overriding this function must conform to the interface.
 * @param {string} uri_csv_string
 */
Trials.OutputResponses = function(uri_csv_string){
    _createCSVLinkAndDownload(uri_csv_string);
};

function _ErrorIfDidStartExperiment(){
    if (_didStartExperiment){
        var funcname = arguments.callee.caller.toString();
        throw new Error("[ "+funcname+" Error ] Experiment has already begun.");
    }
}

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//             Experiment Lifecycle - End Callback (a behaviour at the end of the experiment)
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

var _endCallBack = function(){                                                  // Default behaviour is to empty the DOM
    _ApplyFunctionToHTMLChildren(document.body, function(child){
        child.style.display = "none";
    });
};

/**
 * Set a callback to be run at the end of the experiment, after responses are output.
 * @param {function} end_callback
 */
Trials.setEndCallback = function (end_callback) {
    if (typeof end_callback === "function"){
        _endCallBack = end_callback;
    }   else {
        throw new Error("[ setEndCallback ERROR ] - First argument to setEndCallback must be a function");
    }
};
