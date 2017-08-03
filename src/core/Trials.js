import * as NumUtils from "../utils/NumberUtils";
import { _Unserializable_Var2Token, _Unserializable_ParserFunc2Token } from "./UnserializableMap.js";
var _ = require("lodash");

/**
 * To set Trial IVs
 *      1. Set the setter function:                 this is a function `fn` that will manipulate the display
 *      2. Set the args passed to the setter:       these are the varying args passed to `fn` used to vary the IV
 *      3. Call Trials.BuildExperiment()
 *
 *  Optional:
 *      4. Set a response parser function:          format passed arguments into a desired output format
 * */

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                                 Trials - Setting IV Levels & Functions
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

var Trials = {};
export var IVs = {};
export var setFuncs = {};

var _expRepeats = 1;

/**
 * Generating every IV requires 2 steps: creating the levels and creating a set function.
 * setIVLevels sets the levels used by IV.
 * @param {string} ivname - The name of the IV.
 * @param {array} levels - Array of arrays of arguments passed to the set function.
 */
Trials.setIVLevels = function ( ivname, levels) {

    _ErrorIfTrialsAreBuilt();

    if (Array.isArray(levels)){                                     // Enforce the type system: Levels must be an array of arrays

        levels.map(function(elem, i){
            if (!Array.isArray( elem )){
                throw new Error("[ setIVLevels Error ] - Level "+i+" must be an array of args passed to the set function for "+ ivname);
            }
        });

        _setIVGeneric(ivname, "levels", levels);                    // Actually do the setting

    } else{
        throw new Error("[ setIVLevels Error ] - The second argument to setIVLevels must be an array of arrays, containing the arguments passsed to the set function for "+ ivname);
    }
};

/**
 * Generating every IV requires 2 steps: creating the levels and creating a set function.
 * setIVsetFunc stores the function that is used to set those levels in the display.
 * The arguments that this function takes must correspond to the arguments assigned in Trials.setIVLevels.
 * @param {string} ivname - The name of the IV.
 * @param {function} setFunc - Function used to set levels in the display.
 */
Trials.setIVsetFunc = function(ivname, setFunc) {

    _ErrorIfTrialsAreBuilt();

    if (typeof setFunc !== "function"){
        throw new Error("[ setIVsetFunc Error ] - parser function for "+ivname+" was not a function");
    }

    //This is now a flag to notify ExperimentJS that you"re using functions
    _setIVGeneric(ivname, "setFunc", true);

    //Functions are now stored in their own map, keyed by ivname
    _setSetFunc(ivname, setFunc);
};

export var _dvName;
/**
 * Set the name of the DV
 * @param {string} dvName
 */
Trials.setDVName = function(dvName){
    if (typeof dvName === "string"){
        _csvIllegalCharCheck(dvName);
        _dvName = dvName;
    } else {
        throw  new Error("The supplied DV name must be of type String");
    }
};

/**
 * Parser function interface:
 *                  function ( args_passed_to_this_IV_for_this_trial..., index) {}
 *                  return
 *                          string -    processed/formatted version of the data
 *                          object -    values are the processed version of parts of the data,
 *                                      keys are names given to each portion of the parsed data
 * @param {string} ivname - The name of the IV.
 * @param {function} parserFunc - Function to parse responses. Must conform to the interface above
 */
Trials.setIVResponseParserFunc = function (ivname, parserFunc) {

    _ErrorIfTrialsAreBuilt();

    if (typeof parserFunc !== "function"){
        throw new Error("[ setIVResponseParserFunc Error ] - parser function for "+ivname+" was not a function: ", typeof parserFunc);
    }

    _setIVGeneric(ivname, "parserFunc", parserFunc);
};

/**
 * Set the number of repeats in the experiment.
 * @param {int} nRepeats
 */
Trials.setRepeats = function (nRepeats) {

    _ErrorIfTrialsAreBuilt();

    if (!Number.isInteger(nRepeats)){
        throw new Error("[ setRepeats Error ] - 1st argument to this function must be an integer");
    }

    _expRepeats = nRepeats;
};


// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                            Trials - Setting IV Levels & Functions (private)
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
/*
 * */
export function _setIVGeneric(ivName, fieldName, fieldVal) {
    _csvIllegalCharCheck(ivName);
    _csvIllegalCharCheck(fieldName);

    if (!IVs.hasOwnProperty(ivName)) {                      // If IV doesn't exist yet, create it
        IVs[ivName] = {};
    }

    IVs[ivName][fieldName] = fieldVal;
}


function _setSetFunc(ivname, setfunc){
    setFuncs[ivname] = setfunc;
}

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                                      Trials - Phases
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

export var _isUsingPhases = false;
Trials.Phases = [];

/**
 * Present IVs sequentially by assigning each IV name to an ordinally numbered phase.
 * To transition between phases, a function or a delay (in milliseconds) must be provided.
 * If a function is provided, its first argument is the callback that should be called
 * to transition to the next phase.
 * @param {int} phase_num - ordinal number of the phase
 * @param {array} array_of_iv_names - array of IV names for this phase
 * @param {function, number} transition_func_or_delay - function to handle transition between phases, or duration until next phase
 */
Trials.setIVPhases = function(phase_num, array_of_iv_names, transition_func_or_delay = 0){

    if (!NumUtils.isInt(phase_num) || phase_num < 0 || !Array.isArray(array_of_iv_names) || typeof array_of_iv_names[0] !== "string"
        || (typeof transition_func_or_delay !== "function" && !NumUtils.isFloat(transition_func_or_delay) && !NumUtils.isInt(transition_func_or_delay))){
        throw new Error("[ setIVPhases ERROR ] : Usage (int, array, function/int)" );
    }

    _isUsingPhases = true;

    /*
    Confirm that:
    1. The transition function conforms to the interface (receives a Promise resolve(), and calls it internally)
            - call function.toString() & regex for a call to resolve()

    2. The IV names are right
     */
    var current_iv_names = Object.keys(IVs);
    array_of_iv_names.map(function(iv_name){                    // Confirm IV name exists
        if (_.indexOf(current_iv_names, iv_name) == -1){
            throw new Error ("[ setIVPhases ERROR ] - iv name {0} in phase {1} has not been defined".formatUnicorn(iv_name, phase_num));
        }
    });

    var phase = { phase_ivs:  array_of_iv_names };

    if (typeof transition_func_or_delay === "function"){                    // Used in ./RunExperiment.js:_displayTrialPhases()
        phase['phase_transition_function'] = transition_func_or_delay;
    } else {
        phase['phase_transition_delay'] = transition_func_or_delay;
    }

    if (phase_num > Trials.Phases.length){
        Trials.Phases.push(phase);
    } else {
        Trials.Phases.splice(phase_num, 0, phase);
    }
};


// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                                      Trials - Building
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =


export var _allTrials = [];
var _totalTrials = -1;                                          // Assigned but never used
export var _didBuildTrials = false;

export function _setAllTrials(alltrials){                       // Used in ./Saves.js. Has to live here as it redefines _allTrials
    if (alltrials.constructor === Array){
        _allTrials = alltrials;
    }
}

/**
 * Returns a deep copy of the trials array
 * @returns {array} - a copy of the trials array
 */
Trials.getTrials = function(){
    if (_allTrials.length > 0){
        return _.cloneDeep(_allTrials);
    }
};

/**
 * BuildExperiment must be called to generate the trial array from the supplied IVs,
 * prior to running the experiment.
 * @param {bool} printTrials - flag to print the trials as they are built.
 */
Trials.BuildExperiment = function (printTrials = false) {
    if (typeof printTrials !== "boolean") {
        throw new Error("[ buildExperiment ERROR ] - first arg to buildExperiment must be a boolean");
    } else if (_didBuildTrials){
        throw new Error("[ buildExperiment ERROR ] - buildExperiment should only be called once!");
    } else {
        _buildTrials( printTrials );
    }
};


function _buildTrials(printTrials = false) {

    console.log("Build Trials. IVS:", IVs);

    var buildingTrial, temp;

    for (var iv in IVs) {                                                                       //Iterate over IVs

        if (IVs[iv].levels === undefined)  throw new Error("Levels not supplied for " + iv);
        if (IVs[iv].setFunc === undefined) throw new Error("Setter function not supplied for " + iv);   // TODO: two setfunc checks? this seems wrong

        console.log("Extending all trials array with: " + iv + " (" + IVs[iv].levels.length + " levels)");

        // Serialise functions & objects stored in the map
        var _tokenized_iv_levels = _Unserializable_Var2Token(IVs[iv].levels, iv);               // From UnserializableMap.js - replace unserializable object with token
        var _tokenized_parser_func = _Unserializable_ParserFunc2Token(IVs[iv].parserFunc, iv);

        if (setFuncs[iv] === undefined) throw new Error("SetFunc not defined for " + iv);               // TODO: two setfunc checks? this seems wrong

        temp = [];

        var len = _allTrials.length === 0 ? 1 : _allTrials.length; // For the first pass

        for (var i = 0; i < len; ++i) {                                                         // For all trials built so far

            buildingTrial = _allTrials.pop();                                                   // Pop the incomplete array of iv-vals (objects) and extend it

            for (var j = 0; j < _tokenized_iv_levels.length; ++j) {                             //Extend trials so far by all the levels of the next IV

                var curIVLevel = {};

                // = = = = = = = = = = = IV name and Args passed to setter = = = = = = = = = = = = = =

                curIVLevel.description = iv;                                                    // Set the description of the current IV obj 4 the current Level
                curIVLevel.value = _tokenized_iv_levels[j];                                     // Create a factorial combination of the current IV level

                // = = = = = = = = = = = Parser Func = = = = = = = = = = = = = =

                if (_tokenized_parser_func !== undefined) {                                     // Parser functions
                    curIVLevel.parserFunc = _tokenized_parser_func;                             // Replaced with a string, keyed by IV name
                }

                // = = = = = = = = = = = Extending the trial = = = = = = = = = = = = = =

                var newOrExtendedTrial;

                if (buildingTrial === undefined) {
                    newOrExtendedTrial = [ curIVLevel ];
                } else if (buildingTrial.constructor === Array) {
                    newOrExtendedTrial = buildingTrial.concat([ curIVLevel ]);                  // The incomplete trial is extended by creating a brand new array FROM it
                }

                temp.push(newOrExtendedTrial);
            }
        }

        _allTrials = temp;                                                                      // /** Replace your previous trials with Temp (don"t know who to do this in place) */
    }


    temp = [];
    for (i = 0; i < _expRepeats; i++) {
        temp = temp.concat(_allTrials);
    }
    _allTrials = temp;

    if (_shouldShuffle)    Trials.shuffleTrials( _allTrials );

    _totalTrials = _allTrials.length; //Used to determine where you are in the trial process
    _didBuildTrials = true;

    // = = = = = = = = = = = debugging... = = = = = = = = = = = = = =

    console.log("There are ", _allTrials.length, "trials (using", _expRepeats, "_expRepeats)");
    if (printTrials){
        console.log(_allTrials);
        for (i = 0; i < _allTrials.length; i++){
            console.log("TRIAL ", i);
            for (j = 0; j < _allTrials[i].length; j++){
                console.log( _allTrials[i][j], "\t==>", _allTrials[i][j].value );
            }
            console.log("******* ******* ******* *******");
        }
    }
}




// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                                      Trials - sub functions
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

var _shouldShuffle = true;
/**
 * Determine which
 * @param {bool} - shouldShuffle
 */
Trials.setShuffle = function(shouldShuffle){
    if (typeof(shouldShuffle) === "boolean"){
        _shouldShuffle =  shouldShuffle;
    } else {
        throw new Error("setShuffle only accepts boolean argument");
    }
};

/**
 * Shuffles trials using the Fisher Yates algorithm.
 * This function can be replaced with a custom shuffling function, as long as the interface is maintained.
 * Trials must be shuffled in place.
 * @param {array} - unshuffled trials
 */
Trials.shuffleTrials = function(trials){

    if (!Array.isArray(trials)){
        throw new Error("Trial Shuffling Function Usage (array trials)");
    }

    trials.shuffle();
};


function _csvIllegalCharCheck(string){

    if (typeof string !== "string"){
        throw new Error("You must supply a variable of type String for this method");
    }

    if (string.indexOf(",") !== -1){
        throw new Error("Strings used by ExperimentJS may not contain commas: " + string);
    }
}

function _ErrorIfTrialsAreBuilt(){
    if (_didBuildTrials){
        var funcname = arguments.callee.caller.toString();
        throw new Error("[ "+funcname+" Error ] Trials have already been built.");
    }
}

export { Trials };
