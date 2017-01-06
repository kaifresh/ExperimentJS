// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                                      Trials - Creation
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -

var Trials = {};
export var IVs = {};
export var setFuncs = {};

var expRepeats = 1;

/** Every IV requires 2 steps: creating the levels and then, setting the target */
Trials.setIVLevels = function (ivname, levels) {
    _setIVGeneric(ivname, 'levels', levels);
};


Trials.setIVsetFunc = function(ivname, setFunc) {

    //This is now a flag to notify ExperimentJS that you're using functions
    _setIVGeneric(ivname, 'setFunc', true);

    //Functions are now stored in their own map, keyed by ivname
    _setSetFunc(ivname, setFunc);
};

export var _dvName;
Trials.setDVName = function(dvName){
    if (typeof dvName === "string"){
        _csvFodderCheck(dvName);
        _dvName = dvName;
    } else {
        throw  new Error("The supplied DV name must be of type String");
    }
};

/*
 The trial value will always be passed in as the first argument
 The type of that trial value will be the first non array-of-arrays in the experiment
 parserFuncs are passed args in this order (trialIV, i)
 parserFuncs must return the formatted value
 This assumes you know the content of the trial value, which you should....
 */
Trials.setIVTrialParserFunc = function (ivname, parserFunc) {
    _setIVGeneric(ivname, 'parserFunc', parserFunc);
};


Trials.setRepeats = function (nRepeats) {
    expRepeats = nRepeats;
};


// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                                      Trials - Creation (private)
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
/*
* */
export function _setIVGeneric(ivName, fieldName, fieldVal) { //used by 2AFC.js
    _csvFodderCheck(ivName);
    _csvFodderCheck(fieldName);
    if (!IVs.hasOwnProperty(ivName)) { //If IV doenst exists make it as a raw object
        IVs[ivName] = {};
    }

    IVs[ivName][fieldName] = fieldVal;
}


function _setSetFunc(ivname, setfunc){
    setFuncs[ivname] = setfunc;
}

// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                                      Trials - Building
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -

var _totalTrials = -1;
export var _allTrials = [];
export function _setAllTrials(alltrials){
    if (alltrials.constructor === Array){
        _allTrials = alltrials
    }
}


export var _didBuildTrials = false;
function _buildTrials(printTrials) {

    var buildingTrial, temp;

    for (var iv in IVs) { //Iterate over IVs

        console.log("Extending all trials array with:", iv, ". Levels =", IVs[iv].levels.length);

        if (setFuncs[iv] === undefined) throw new Error("SetFunc not defined for " + iv);

        temp = [];

        var len = _allTrials.length === 0 ? 1 : _allTrials.length; // For the first pass

        for (var i = 0; i < len; ++i) { //For all trials built so far

            buildingTrial = _allTrials.pop(); //Pop the incomplete array of iv-vals (objects) and extend

            for (var j = 0; j < IVs[iv].levels.length; ++j) { //Extend them by all the levels of the next IV


                /** Set the value & description of the current IV obj 4 the current Level */
                var curIVLevel = {};
                curIVLevel.description = iv; //camelToSentenceCase(iv);
                curIVLevel.value = IVs[iv].levels[j];

                /** Store 2AFC std with each trial (if present) */
                if (IVs[iv].hasOwnProperty('std_2AFC')) {
                    curIVLevel.std_2AFC = IVs[iv].std_2AFC;
                }

                /** For 2AFC that is simultaneous (as opposed to the flipping kind)*/
                if (IVs[iv].hasOwnProperty('std_2AFC_simultaneous_target')) {
                    curIVLevel.std_2AFC_simultaneous_target = IVs[iv].std_2AFC_simultaneous_target;
                }

                /** SETTER FUNTIONS - Setting display properties via a function
                 * These are only storing a boolean True flag. */
                // if (IVs[iv].setFunc !== undefined) {
                //     curIVLevel.setFunc = IVs[iv].setFunc;
                // }

                /** Parser function*/
                if (IVs[iv].parserFunc !== undefined) {
                    curIVLevel.parserFunc = IVs[iv].parserFunc; //Could write a copying method for all of these (that handles deep copying)
                }

                var newOrExtendedTrial;

                if (buildingTrial === undefined) {
                    //newOrExtendedTrial =  iv + "  " + levelValue;
                    newOrExtendedTrial = [curIVLevel];

                } else if (buildingTrial.constructor === Array) {
                    //newOrExtendedTrial = buildingTrial + " | | " + iv + "  " + levelValue;
                    newOrExtendedTrial = buildingTrial.concat([curIVLevel]); //Creates a brand new array w the new level
                }

                temp.push(newOrExtendedTrial);
            }
        }

        /** Replace your previous trials with Temp (don't know who to do this in place) */
        _allTrials = temp;
    }


    /** Duplicate the current factorial trials */
    var repeats = expRepeats;
    temp = [];
    for (var i = 0; i < repeats; i++) {
        temp = temp.concat(_allTrials);
    }
    _allTrials = temp;


    console.log("There are ", _allTrials.length, "trials (using", repeats, "repeats)");
    if (printTrials){
        for (var i = 0; i < _allTrials.length; i++){
            console.log("TRIAL ", i);
            for (var j = 0; j < _allTrials[i].length; j++){
                console.log( _allTrials[i][j] );
            }
            console.log("******* ******* ******* *******");
        }
    }

    _allTrials.shuffle();

    _totalTrials = _allTrials.length; //Used to determine where you are in the trial process
    _didBuildTrials = true;
}


/**
 * NOTE: We no longer handle appearance or input. These are out of the scope of this module.
 * This module now only handles the game loop of
 * - taking IVs
 * - building all trials
 * - setting the display (according to the supplied IVs)
 * - storing & outputting _responses
 *
 * All other behaviour should be performed by another moduel that works with this one.
 * */
Trials.buildExperiment = function (printTrials) {
    _buildTrials( (printTrials === undefined) ? false : printTrials );
};

// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                                      Trials (subfunctions)
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
function _csvFodderCheck(string){

    if (typeof string !== "string"){
        throw new Error("You must supply a variable of type String for this method");
    }

    if (string.indexOf(",") !== -1){
        throw new Error("Strings used by ExperimentJS may not contain commas: " + string);
    }
}

// Trials.prototype = Object.assign( Object.create )

// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -

// var Trials = {
//     IVs: IVs,
//     setFuncs: setFuncs,
//     setIVGeneric: _setIVGeneric,
//     setIVLevels: setIVLevels,
//     setSetFunc: _setSetFunc,
//     csvFodderCHeck: _csvFodderCheck
// };


export { Trials };