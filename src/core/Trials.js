import { extend } from "../utils/jQueryUtils.js";
import { _Unserializable_Var2Token, _Unserializable_ParserFunc2Token } from "./UnserializableMap.js";

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
export var IVs = {};
export var setFuncs = {};

var expRepeats = 1;

/** Every IV requires 2 steps: creating the levels and then, setting the target */
Trials.setIVLevels = function ( ivname, levels) {

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

Trials.setIVsetFunc = function(ivname, setFunc) {

    if (typeof setFunc !== "function"){
        throw new Error("[ setIVsetFunc Error ] - parser function for "+ivname+" was not a function");
    }

    //This is now a flag to notify ExperimentJS that you"re using functions
    _setIVGeneric(ivname, "setFunc", true);

    //Functions are now stored in their own map, keyed by ivname
    _setSetFunc(ivname, setFunc);
};

export var _dvName;
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
 * */
Trials.setIVResponseParserFunc = function (ivname, parserFunc) {

    if (typeof parserFunc !== "function"){
        throw new Error("[ setIVResponseParserFunc Error ] - parser function for "+ivname+" was not a function: ", typeof parserFunc);
    }

    _setIVGeneric(ivname, "parserFunc", parserFunc);
};


Trials.setRepeats = function (nRepeats) {

    if (!Number.isInteger(nRepeats)){
        throw new Error("[ setRepeats Error ] - 1st argument to this function must be an integer");
    }

    expRepeats = nRepeats;
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
//                                      Trials - Building
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =


export var _allTrials = [];
var _totalTrials = -1;                                          //Assigned but never used
export var _didBuildTrials = false;

export function _setAllTrials(alltrials){                      // Used in ./Saves.js. Has to live here as it redefines _allTrials
    if (alltrials.constructor === Array){
        _allTrials = alltrials;
    }
}

var _ = require("lodash");
// Returns a deep copy of the trials
Trials.getTrials = function(){
    if (_allTrials.length > 0){
        // TODO: determine if this can be replaced with lodash
        return _.cloneDeep(_allTrials);
        // return extend(true, [], _allTrials);
    }
};


function _buildTrials(printTrials) {

    console.log("Build Trials. IVS:", IVs);

    var buildingTrial, temp;

    for (var iv in IVs) { //Iterate over IVs

        if (IVs[iv].levels === undefined)  throw new Error("Levels not supplied for " + iv);
        if (IVs[iv].setFunc === undefined) throw new Error("Setter function not supplied for " + iv);   // TODO: two setfunc checks? this seems wrong
        
        console.log("Extending all trials array with: " + iv + " (" + IVs[iv].levels.length + " levels)");
        
        // TODO: FIX Add object serialisation
        var _tokenized_iv_levels = _Unserializable_Var2Token(IVs[iv].levels, iv);         // From UnserializableMap.js - replace unserializable object with token

        var _tokenized_parser_func = _Unserializable_ParserFunc2Token(IVs[iv].parserFunc, iv);
        

        if (setFuncs[iv] === undefined) throw new Error("SetFunc not defined for " + iv);               // TODO: two setfunc checks? this seems wrong

        temp = [];

        var len = _allTrials.length === 0 ? 1 : _allTrials.length; // For the first pass

        for (var i = 0; i < len; ++i) {                                                     // For all trials built so far

            buildingTrial = _allTrials.pop();                                               // Pop the incomplete array of iv-vals (objects) and extend it

            // for (var j = 0; j < IVs[iv].levels.length; ++j) { //Extend them by all the levels of the next IV
            for (var j = 0; j < _tokenized_iv_levels.length; ++j) {                         //Extend trials so far by all the levels of the next IV

                var curIVLevel = {};

                curIVLevel.description = iv;                                                // Set the description of the current IV obj 4 the current Level
                curIVLevel.value = _tokenized_iv_levels[j];                                 // Create a factorial combination of the current IV level

                // if (IVs[iv].parserFunc !== undefined) {                                     // Parser functions
                //     curIVLevel.parserFunc = IVs[iv].parserFunc;
                // }
                if (_tokenized_parser_func !== undefined) {                                     // Parser functions
                    curIVLevel.parserFunc = _tokenized_parser_func;                             // Replaced with a string, keyed by IV name
                }

                // = = = = = = = = = = = Extending the trial = = = = = = = = = = = = = =

                var newOrExtendedTrial;

                if (buildingTrial === undefined) {
                    newOrExtendedTrial = [ curIVLevel ];

                } else if (buildingTrial.constructor === Array) {
                    newOrExtendedTrial = buildingTrial.concat([ curIVLevel ]);                // The incomplete trial is extended by creating a brand new array FROM it
                }

                temp.push(newOrExtendedTrial);
            }
        }

        _allTrials = temp;                                                                  // /** Replace your previous trials with Temp (don"t know who to do this in place) */
    }


    /** Duplicate the current factorial trials */
    var repeats = expRepeats;
    temp = [];
    for (i = 0; i < repeats; i++) {
        temp = temp.concat(_allTrials);
    }
    _allTrials = temp;


    console.log("There are ", _allTrials.length, "trials (using", repeats, "repeats)");
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

    if (_shouldShuffle)     _allTrials.shuffle();

    _totalTrials = _allTrials.length; //Used to determine where you are in the trial process
    _didBuildTrials = true;
}


Trials.buildExperiment = function (printTrials) {
    if (typeof printTrials !== "boolean"){
        throw new Error("[ buildExperiment ERROR ] - first arg to buildExperiment must be a boolean");
    } else {
        _buildTrials( (printTrials === undefined) ? false : printTrials );
    }
};


var _shouldShuffle = true;
Trials.setShuffle = function(shouldShuffle){
    if (typeof(shouldShuffle) === "boolean"){
        _shouldShuffle =  shouldShuffle;
    } else {
        throw new Error("setShuffle only accepts boolean argument");
    }
};

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                                      Trials - sub functions
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
function _csvIllegalCharCheck(string){

    if (typeof string !== "string"){
        throw new Error("You must supply a variable of type String for this method");
    }

    if (string.indexOf(",") !== -1){
        throw new Error("Strings used by ExperimentJS may not contain commas: " + string);
    }
}

export { Trials };