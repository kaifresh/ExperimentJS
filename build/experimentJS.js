(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('jquery')) :
    typeof define === 'function' && define.amd ? define(['exports', 'jquery'], factory) :
    (factory((global.ExperimentJS = global.ExperimentJS || {}),global.jquery));
}(this, (function (exports,jquery) { 'use strict';

function createDownloadLink(filename, data){
    ////http://stackoverflow.com/questions/17836273/export-javascript-data-to-csv-file-without-server-interaction
    var a = document.createElement("a");
    a.href = data;
    a.target = "_blank";
    a.download = filename;
 
    return a;
}

// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                                          Fischer Yates Shuffle
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
Array.prototype.shuffle = function () {
    var currentIndex = this.length, temporaryValue, randomIndex;

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

// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                                          String Utils
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -



function getParamNames(fn){
    //wrap these so as not to pollute the namespace
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var ARGUMENT_NAMES = /([^\s,]+)/g;
    function _getParamNames(func) {
        var fnStr = func.toString().replace(STRIP_COMMENTS, "");
        var result = fnStr.slice(fnStr.indexOf("(")+1, fnStr.indexOf(")")).match(ARGUMENT_NAMES);
        if(result === null)
            result = [];
        return result;
    }

    return _getParamNames(fn);
}

/**
 * Created by kai on 5/1/17.
 */

/**
 * Created by kai on 5/1/17.
 */

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                                 Trials - Setting IV Levels & Functions
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

var Trials = {};
var IVs = {};
var setFuncs = {};

var expRepeats = 1;

/** Every IV requires 2 steps: creating the levels and then, setting the target */
Trials.setIVLevels = function (ivname, levels) {
    _setIVGeneric(ivname, "levels", levels);
};

Trials.setIVsetFunc = function(ivname, setFunc) {

    //This is now a flag to notify ExperimentJS that you"re using functions
    _setIVGeneric(ivname, "setFunc", true);

    //Functions are now stored in their own map, keyed by ivname
    _setSetFunc(ivname, setFunc);
};

var _dvName;
Trials.setDVName = function(dvName){
    if (typeof dvName === "string"){
        _csvIllegalCharCheck(dvName);
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
    _setIVGeneric(ivname, "parserFunc", parserFunc);
};


Trials.setRepeats = function (nRepeats) {
    expRepeats = nRepeats;
};


// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                            Trials - Setting IV Levels & Functions (private)
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
/*
* */
function _setIVGeneric(ivName, fieldName, fieldVal) { //used by 2AFC.js
    _csvIllegalCharCheck(ivName);
    _csvIllegalCharCheck(fieldName);
    if (!IVs.hasOwnProperty(ivName)) { //If IV doenst exists make it as a raw object
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

var _totalTrials = -1;                                          //Assigned but never used
var _allTrials = [];
function _setAllTrials(alltrials){
    if (alltrials.constructor === Array){
        _allTrials = alltrials;
    }
}

Trials.getTrials = function(){
    if (_allTrials.length > 0){
        return $.extend(true, [], _allTrials);
    }
};

var _didBuildTrials = false;
function _buildTrials(printTrials) {

    console.log("Build Trials. IVS:", IVs);

    var buildingTrial, temp;

    for (var iv in IVs) { //Iterate over IVs

        if (IVs[iv].levels === undefined)  throw new Error("Levels not supplied for " + iv);
        if (IVs[iv].setFunc === undefined) throw new Error("Setter function not supplied for " + iv);

        console.log("Extending all trials array with: " + iv + " (" + IVs[iv].levels.length + " levels)");

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
                if (IVs[iv].hasOwnProperty("std_2AFC")) {
                    curIVLevel.std_2AFC = IVs[iv].std_2AFC;
                }

                /** For 2AFC that is simultaneous (as opposed to the flipping kind)*/
                if (IVs[iv].hasOwnProperty("std_2AFC_simultaneous_target")) {
                    curIVLevel.std_2AFC_simultaneous_target = IVs[iv].std_2AFC_simultaneous_target;
                }
                
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

        /** Replace your previous trials with Temp (don"t know who to do this in place) */
        _allTrials = temp;
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
        for (i = 0; i < _allTrials.length; i++){
            console.log("TRIAL ", i);
            for (j = 0; j < _allTrials[i].length; j++){
                console.log( _allTrials[i][j] );
            }
            console.log("******* ******* ******* *******");
        }
    }

    if (_shouldShuffle)     _allTrials.shuffle();


    _totalTrials = _allTrials.length; //Used to determine where you are in the trial process
    _didBuildTrials = true;
}


/**
 * NOTE: This module does not longer handle appearance or input
 * This module now only handles:
    * - taking IVs
    * - building all trials
 */
Trials.buildExperiment = function (printTrials) {
    _buildTrials( (printTrials === undefined) ? false : printTrials );
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
//                                      Trials (subfunctions)
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
function _csvIllegalCharCheck(string){

    if (typeof string !== "string"){
        throw new Error("You must supply a variable of type String for this method");
    }

    if (string.indexOf(",") !== -1){
        throw new Error("Strings used by ExperimentJS may not contain commas: " + string);
    }
}

/**
 * Created by kai on 6/7/17.
 */
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                      Experiment Lifecycle - Get Participant Info
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

var _pptName = "unnamed_ppt";
var _pptNo = 0;

Trials.getPptInfo = function () {

    while (true) {
        _pptName = prompt("Please enter your name").trim();
        console.log("name was", _pptName);
        if (_pptName === "" || _pptName === null) {
            alert("Name cannot be blank");
        } else {
            break;
        }
    }

    while (true) {
        _pptNo = parseInt(prompt("Please enter your participant number"));
        console.log("ppt number was", _pptNo);
        if (isNaN(_pptNo)) {
            alert("Participant number must be an integer");
        } else {
            break;
        }
    }

    console.log("Participant name: ", _pptName, "\tParticipant number: ", _pptNo);
};

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                                 Experiment Lifecycle - Output Responses
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

Trials.forceOutputResponses = function(){
    console.log("Forcing output of _responses");
    _outputResponses(_responses, true);
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
    csvString = csvString.slice(0, -1) + "\n";//Cut trailing comma and put in a new row/line

    /** Fill the data - This time its an array of arrays not array of dictionaries */
    for (i = 0; i < allResponses.length; i++) {

        csvString += _pptName + "," + _pptNo + ","; //Manaully add content

        for (var j = 0; j < keys.length; j++) { //Iterate over the keys to get teh values

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
    var a = createDownloadLink("results (" + _pptName + "," + _pptNo.toString() + ").csv", csvContent);
    a.innerHTML = "<h4>Click to download results!</h4>";
    a.className += " results-download";
    document.body.appendChild(a);
    a.click();
}

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                                  Interstimulus Pause - creation
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =


function _createInterstimulusPause(){
    var blackout = document.createElement("div");
    blackout.id = "interstimulus-pause";

    var css = {                             // Set blackout style
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        background: "black",
        display: "none"                     // block
    };

    var keys = Object.keys(css);
    for (var i = 0; i < keys.length; i++){
        var attribute = keys[i];
        blackout.style[attribute] = css[attribute];
    }
    // for (var attribute of ){
    //     blackout.style[attribute] = css[attribute];
    // }

    return blackout;

}

// var _blackOut = $("<div>", {
//     id: "interstimulus-pause",
//     css: {
//         position: "fixed",
//         left: 0,
//         top: 0,
//         width: "100vw",
//         height: "100vh",
//         background: "black"
//     }
// });

// $(document.body).append(_blackOut);
// $("#interstimulus-pause").hide();

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
        throw "setPauseTime only takes integers";
    }
};

var _shouldInterstimulusPause = true;                        //used in: RunExperiment.js
Pause.setShouldInterstimulusPause = function(value){
    if (typeof  value === "boolean"){
        _shouldInterstimulusPause = value;
    }
};




var _isInterstimulusPause = false;
function _interstimulusPause(duration) {                     // used in: RunExperiment.js

    duration = duration === undefined ? _pause : duration;          //Default to pause time unless an argument is supplied

    return new Promise(function (resolve, reject) {
        // $("#interstimulus-pause").show();
        _showInterstimulusPause(_blackOut);
        _isInterstimulusPause = true;
        _setShouldRunNextTrial(false);

        /* Prevent button mashing while the pause runs */
        setTimeout(function () {
            // $("#interstimulus-pause").hide();
            _hideInterstimulusPause(_blackOut);
            _isInterstimulusPause = false;
            _setShouldRunNextTrial(true);                           // Cannot reassign imported values, so you need a setter

            resolve();                                              // Promise has resolved here
        }, duration);
    });
}


function _hideInterstimulusPause(blackout){
    blackout.style.display = "none";
}

function _showInterstimulusPause(blackout){
    blackout.style.display = "block";
}

// RunExperiment.js
// Add core functionality facilitating the experimental life cycle to the Trials Object.
// Such as:
//      - Getting participant info
//      - Running the next trial (setting IVs etc)
//      - Storing a response
//      - Outputting responses
//      - Mid/end callbacks


// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                         Experiment Lifecycle - Start & Game Loop
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

//Cannot reassign imported values, so you need a setter (used in InterstimlusPause.js)
function _setShouldRunNextTrial(value){
    if (typeof(value) === "boolean"){
        _shouldRunNextTrial = value;
    } else {
        throw new Error("cannot set _shouldRunNextTrial to a non boolean value");
    }
}

var _shouldRunNextTrial = true; //used by: InterstimulusPause.js
Trials.runNextTrial = function (settings) { // usage -> runNextTrial({shouldStoreResponse: true, dv_value: "inside"});

    if (!_didBuildTrials){
        throw new Error("runNextTrial(): Trial were not built");
        return;
    }

    if (_shouldRunNextTrial) {

        // TODO: Change the implementation of the mid callback - Just check the length of the _responses array vs the alltrials array..

        if (_shouldRunMidCallback() && _midCallback !== null) {
            _midCallback();
        }

        if (_shouldInterstimulusPause) {
            _interstimulusPause();
        }

        if (settings !== undefined && settings.hasOwnProperty("shouldStoreResponse") && settings.shouldStoreResponse) {
            _storeResponse(settings); //Settings contains a field "dv_value" which is also read by _storeResponse
        }

        if (_allTrials.length > 0) {
            _displayNextTrial();

            // _cur2AFCIsTarget = true;
            /** Always reset the 2AFC value*/

            console.log("There are ", _allTrials.length, " trials remaining.");
        } else {

            //Possibly too destructive
            $(document.body).children().fadeOut();
            // $("#interstimulus-pause").hide();
            _outputResponses(_responses);

            if ( typeof _endCallBack === "function") _endCallBack();

        }
    }

};

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                  Experiment Lifecycle - Mid Point Callback (i.e. the "take a break" message)
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

var _didRunMidCallback = false;
var _midCallback = null;
Trials.setMidCallback = function (value) {
    if (typeof value === "function"){
        _midCallback = value;
    }   else {
        throw new Error("Only functions may be assigned to the end callback");
    }
};

function _shouldRunMidCallback() {
    if (_didRunMidCallback) return false;

    //Mid point = there are as many responses as trials (or a difference of one for odd number of trials)
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
        throw new Error("Only functions may be assigned to the end callback");
    }
};


// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                                 Experiment Lifecycle - Displaying The Next Trial
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

/** Where view-level elements are set - this is like the CONTROLLER method interfacing between MODEL and VIEW*/
function _displayNextTrial() {
    var nextTrial = _allTrials[_allTrials.length - 1]; //Always go from the back
    console.log("Displaying next trial:", nextTrial);

    /** Iterate over each IV and set its pointer to its value for that trial */
    for (var i = 0; i < nextTrial.length; ++i) {
        var cur_iv = nextTrial[i];
        _fireIVSetFuncWithArgs(cur_iv);

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
//                                 Experiment Lifecycle - Store Response
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
var _responses = [];
function _setResponses(responses){
    if (responses.constructor === Array){
        _responses = responses;
    } else {
        throw new Error("reponses can only be set to an array");
    }
}

function _storeResponse(options) {

    var lastTrial = _allTrials.pop();

    var responseFormatted = {};

    /** Store the IV -> Write out each IV (1 IV per array element) to a field */
    for (var i = 0; i < lastTrial.length; ++i) {
        var ivNum = "IV" + i;

        //If a parser is defined use its output as the value of the response
        if (lastTrial[i].parserFunc !== undefined && $.isFunction(lastTrial[i].parserFunc)){
            var stdName = ivNum + "_" + lastTrial[i].description + "_value";

            responseFormatted[stdName] = lastTrial[i].parserFunc.apply(this, lastTrial[i].value.concat(i) ); //The args are passed to the parser func with the index as the last arg

        } else if (lastTrial[i].value.constructor === Array) { //Consider these to be defaults for javascript primitive types

            /** Manually write out each argument (from an array) to a field in the object
             *  Only append a number if there are >1 arguments passed in */

            if (lastTrial[i].value.length > 1){

                //If using a setFunc function with multiple args -> use the arg names to describe the values written to the response
                var arg_names, arg_name;
                arg_names = getParamNames( setFuncs[lastTrial[i].description] );

                for (var j = 0; j < lastTrial[i].value.length; ++j) {
                    arg_name = arg_names[j];
                    responseFormatted[ivNum + "_" + lastTrial[i].description + "_value_" + arg_name ] =  lastTrial[i].value[j];
                }

            } else {
                responseFormatted[ ivNum + "_" + lastTrial[i].description + "_value" ] =  lastTrial[i].value[0];
            }

        } else {
            responseFormatted[ivNum + "_" + lastTrial[i].description + "_value"] = lastTrial[i].value;
        }

        /** Add a value of the 2afc std (for the relevant IV) */
        if (lastTrial[i].hasOwnProperty("std_2AFC")) {
            responseFormatted["std_2AFC"] = lastTrial[i].std_2AFC;
        }
    }

    /** Check that a 2afc std value was added - if not you want to add a null value or it will fuck up the csv write*/
    // if (!responseFormatted.hasOwnProperty("std_2AFC") && didSet2AFC) {
    //     responseFormatted["std_2AFC"] = "null";
    // }
    

    /** Store the DV*/
    if (options !== undefined && options.hasOwnProperty("dv_value")) {
        var value = _dvName || "value";
        responseFormatted["DV_"+value] = options.dv_value;
    } else {
        alert("No DV was supplied by the calling code. This is an error.");
        responseFormatted["DV_value"] = "ERROR - No DV supplied";
    }

    console.log("STORED THIS RESPONSE: ", responseFormatted);

    _responses.push(responseFormatted);
}
//
// // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
// //                                 Experiment Lifecycle - Output Responses
// // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//
// Trials.forceOutputResponses = function(){
//     console.log("Forcing output of _responses");
//     _outputResponses(_responses, true);
// };
//
//
// function _outputResponses(allResponses, log) {
//
//     if (allResponses.length === 0) return;
//
//     var csvString = "";
//
//     var keys = Object.keys(allResponses[0]);
//     /**These are all the columns in the output*/
//
//     /** Make the header*/
//     csvString += "Participant Name, Participant Number, "; //Manually add header
//     for (var i = 0; i < keys.length; i++) {
//         csvString += keys[i] + ",";
//     }
//     csvString = csvString.slice(0, -1) + "\n";//Cut trailing comma and put in a new row/line
//
//     /** Fill the data - This time its an array of arrays not array of dictionaries */
//     for (i = 0; i < allResponses.length; i++) {
//
//         csvString += _pptName + "," + _pptNo + ","; //Manaully add content
//
//         for (var j = 0; j < keys.length; j++) { //Iterate over the keys to get teh values
//
//             var value = allResponses[i][keys[j]];
//             // console.log("writing this raw value ", value, keys[j]);
//             //value = checkReturnProps( value, true ) || value;  //Parse out relevant object fields
//             //console.log("Afer it was parsed:", value, "\n*********");
//             csvString += value + ",";
//         }
//
//         csvString = csvString.slice(0, -1) + "\n"; //Cut trailing comma and put in a new row/line
//     }
//
//     if (log) {
//         console.log(csvString);
//     }
//
//     /** Help out a machine today*/
//     var csvContent = encodeURI("data:text/csv;charset=utf-8," + csvString);
//     var a = createDownloadLink("results (" + _pptName + "," + _pptNo.toString() + ").csv", csvContent);
//     a.innerHTML = "<h4>Click to download results!</h4>";
//     a.className += " results-download";
//     document.body.appendChild(a);
//     a.click();
// }

var Saves = {};

Saves.parseTrialsForSaving = undefined; //interface is (_allTrials)
Saves.parseResponsesForSaving = undefined; //interface is (_responses)
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


Saves.saveBuiltTrialsAndResponses = function() {
    
    errorCheckSavingParsers();

    if (typeof(Storage) !== "undefined") {

        // localStorage.experimentJSsaves = undefined;

        //Parse your trials, using the custom serializer..
        var trialsForSaving = Saves.parseTrialsForSaving(_allTrials);
        var responsesForSaving = Saves.parseResponsesForSaving(_responses);

        //JSONify the trials and _responses
        var experimentJSsaves = {};
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

        //save to it
        keyed_by_dates[msg + " - " +dateKey] = experimentJSsaves;

        //serialize!
        localStorage.experimentJSsaves = JSON.stringify(keyed_by_dates);

        console.log("Saved Trials", JSON.parse(localStorage.experimentJSsaves));
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

        _setAllTrials( Saves.unparseSavedTrials(temp_using["trials"]) );
        _setResponses( Saves.unparseSavedResponses(temp_using["responses"]) );
        if (_responses === undefined || _responses === null) _setResponses( [] );

        console.log("restored all trials: ", _allTrials);
        console.log("restored all _responses: ", _responses);

        Trials.runNextTrial();

        //Remove select from dom
        select_bits.wrap.remove();
    });

    select_bits.button_clear.click(function(){

        if (window.confirm("Are you sure you want to delete all saved experiments?")){
            Saves.clearSaves();
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
    var sel = $("<select>");
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
    };
}

//Order of imports is important

// Import Trials and extend it
//import "./2AFC.js";

exports.Trials = Trials;
exports.Pause = Pause;
exports.Saves = Saves;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwZXJpbWVudEpTLmpzIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMvQ3JlYXRlRG93bmxvYWRMaW5rLmpzIiwiLi4vc3JjL3V0aWxzL1NodWZmbGUuanMiLCIuLi9zcmMvdXRpbHMvU3RyaW5nVXRpbHMuanMiLCIuLi9zcmMvdXRpbHMvTnVtYmVyVXRpbHMuanMiLCIuLi9zcmMvdXRpbHMvdXRpbHMuanMiLCIuLi9zcmMvY29yZS9UcmlhbHMuanMiLCIuLi9zcmMvY29yZS9HZXRQcHRJbmZvLmpzIiwiLi4vc3JjL2NvcmUvT3V0cHV0UmVzcG9uc2VzLmpzIiwiLi4vc3JjL2NvcmUvSW50ZXJzdGltdWx1c1BhdXNlLmpzIiwiLi4vc3JjL2NvcmUvUnVuRXhwZXJpbWVudC5qcyIsIi4uL3NyYy9jb3JlL1NhdmVzLmpzIiwiLi4vc3JjL2NvcmUvY29yZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gY3JlYXRlRG93bmxvYWRMaW5rKGZpbGVuYW1lLCBkYXRhKXtcbiAgICAvLy8vaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNzgzNjI3My9leHBvcnQtamF2YXNjcmlwdC1kYXRhLXRvLWNzdi1maWxlLXdpdGhvdXQtc2VydmVyLWludGVyYWN0aW9uXG4gICAgdmFyIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICBhLmhyZWYgPSBkYXRhO1xuICAgIGEudGFyZ2V0ID0gXCJfYmxhbmtcIjtcbiAgICBhLmRvd25sb2FkID0gZmlsZW5hbWU7XG4gXG4gICAgcmV0dXJuIGE7XG59IiwiLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBGaXNjaGVyIFlhdGVzIFNodWZmbGVcbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbkFycmF5LnByb3RvdHlwZS5zaHVmZmxlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBjdXJyZW50SW5kZXggPSB0aGlzLmxlbmd0aCwgdGVtcG9yYXJ5VmFsdWUsIHJhbmRvbUluZGV4O1xuXG4gICAgLy8gV2hpbGUgdGhlcmUgcmVtYWluIGVsZW1lbnRzIHRvIHNodWZmbGUuLi5cbiAgICB3aGlsZSAoMCAhPT0gY3VycmVudEluZGV4KSB7XG5cbiAgICAgICAgLy8gUGljayBhIHJlbWFpbmluZyBlbGVtZW50Li4uXG4gICAgICAgIHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY3VycmVudEluZGV4KTtcbiAgICAgICAgY3VycmVudEluZGV4IC09IDE7XG5cbiAgICAgICAgLy8gQW5kIHN3YXAgaXQgd2l0aCB0aGUgY3VycmVudCBlbGVtZW50LlxuICAgICAgICB0ZW1wb3JhcnlWYWx1ZSA9IHRoaXNbY3VycmVudEluZGV4XTtcbiAgICAgICAgdGhpc1tjdXJyZW50SW5kZXhdID0gdGhpc1tyYW5kb21JbmRleF07XG4gICAgICAgIHRoaXNbcmFuZG9tSW5kZXhdID0gdGVtcG9yYXJ5VmFsdWU7XG4gICAgfVxufTsiLCJcbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3RyaW5nIFV0aWxzXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG5cbmV4cG9ydCBmdW5jdGlvbiBjYW1lbFRvU2VudGVuY2VDYXNlKHN0cikge1xuICAgIHJldHVybiBzdHIuc3BsaXQoLyg/PVtBLVpdKS8pLmpvaW4oXCIgXCIpLnRvTG93ZXJDYXNlKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQYXJhbU5hbWVzKGZuKXtcbiAgICAvL3dyYXAgdGhlc2Ugc28gYXMgbm90IHRvIHBvbGx1dGUgdGhlIG5hbWVzcGFjZVxuICAgIHZhciBTVFJJUF9DT01NRU5UUyA9IC8oKFxcL1xcLy4qJCl8KFxcL1xcKltcXHNcXFNdKj9cXCpcXC8pKS9tZztcbiAgICB2YXIgQVJHVU1FTlRfTkFNRVMgPSAvKFteXFxzLF0rKS9nO1xuICAgIGZ1bmN0aW9uIF9nZXRQYXJhbU5hbWVzKGZ1bmMpIHtcbiAgICAgICAgdmFyIGZuU3RyID0gZnVuYy50b1N0cmluZygpLnJlcGxhY2UoU1RSSVBfQ09NTUVOVFMsIFwiXCIpO1xuICAgICAgICB2YXIgcmVzdWx0ID0gZm5TdHIuc2xpY2UoZm5TdHIuaW5kZXhPZihcIihcIikrMSwgZm5TdHIuaW5kZXhPZihcIilcIikpLm1hdGNoKEFSR1VNRU5UX05BTUVTKTtcbiAgICAgICAgaWYocmVzdWx0ID09PSBudWxsKVxuICAgICAgICAgICAgcmVzdWx0ID0gW107XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIF9nZXRQYXJhbU5hbWVzKGZuKTtcbn0iLCIvKipcbiAqIENyZWF0ZWQgYnkga2FpIG9uIDUvMS8xNy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRmxvYXQobikge1xuICAgIHJldHVybiBOdW1iZXIobikgPT09IG4gJiYgbiAlIDEgIT09IDA7XG59IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGthaSBvbiA1LzEvMTcuXG4gKi9cblxuaW1wb3J0IFwiLi9DcmVhdGVEb3dubG9hZExpbmsuanNcIjtcbmltcG9ydCBcIi4vU2h1ZmZsZS5qc1wiO1xuaW1wb3J0IFwiLi9TdHJpbmdVdGlscy5qc1wiO1xuaW1wb3J0IFwiLi9OdW1iZXJVdGlscy5qc1wiOyIsIi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVHJpYWxzIC0gU2V0dGluZyBJViBMZXZlbHMgJiBGdW5jdGlvbnNcbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cblxudmFyIFRyaWFscyA9IHt9O1xuZXhwb3J0IHZhciBJVnMgPSB7fTtcbmV4cG9ydCB2YXIgc2V0RnVuY3MgPSB7fTtcblxudmFyIGV4cFJlcGVhdHMgPSAxO1xuXG4vKiogRXZlcnkgSVYgcmVxdWlyZXMgMiBzdGVwczogY3JlYXRpbmcgdGhlIGxldmVscyBhbmQgdGhlbiwgc2V0dGluZyB0aGUgdGFyZ2V0ICovXG5UcmlhbHMuc2V0SVZMZXZlbHMgPSBmdW5jdGlvbiAoaXZuYW1lLCBsZXZlbHMpIHtcbiAgICBfc2V0SVZHZW5lcmljKGl2bmFtZSwgXCJsZXZlbHNcIiwgbGV2ZWxzKTtcbn07XG5cblRyaWFscy5zZXRJVnNldEZ1bmMgPSBmdW5jdGlvbihpdm5hbWUsIHNldEZ1bmMpIHtcblxuICAgIC8vVGhpcyBpcyBub3cgYSBmbGFnIHRvIG5vdGlmeSBFeHBlcmltZW50SlMgdGhhdCB5b3VcInJlIHVzaW5nIGZ1bmN0aW9uc1xuICAgIF9zZXRJVkdlbmVyaWMoaXZuYW1lLCBcInNldEZ1bmNcIiwgdHJ1ZSk7XG5cbiAgICAvL0Z1bmN0aW9ucyBhcmUgbm93IHN0b3JlZCBpbiB0aGVpciBvd24gbWFwLCBrZXllZCBieSBpdm5hbWVcbiAgICBfc2V0U2V0RnVuYyhpdm5hbWUsIHNldEZ1bmMpO1xufTtcblxuZXhwb3J0IHZhciBfZHZOYW1lO1xuVHJpYWxzLnNldERWTmFtZSA9IGZ1bmN0aW9uKGR2TmFtZSl7XG4gICAgaWYgKHR5cGVvZiBkdk5hbWUgPT09IFwic3RyaW5nXCIpe1xuICAgICAgICBfY3N2SWxsZWdhbENoYXJDaGVjayhkdk5hbWUpO1xuICAgICAgICBfZHZOYW1lID0gZHZOYW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93ICBuZXcgRXJyb3IoXCJUaGUgc3VwcGxpZWQgRFYgbmFtZSBtdXN0IGJlIG9mIHR5cGUgU3RyaW5nXCIpO1xuICAgIH1cbn07XG5cbi8qXG4gVGhlIHRyaWFsIHZhbHVlIHdpbGwgYWx3YXlzIGJlIHBhc3NlZCBpbiBhcyB0aGUgZmlyc3QgYXJndW1lbnRcbiBUaGUgdHlwZSBvZiB0aGF0IHRyaWFsIHZhbHVlIHdpbGwgYmUgdGhlIGZpcnN0IG5vbiBhcnJheS1vZi1hcnJheXMgaW4gdGhlIGV4cGVyaW1lbnRcbiBwYXJzZXJGdW5jcyBhcmUgcGFzc2VkIGFyZ3MgaW4gdGhpcyBvcmRlciAodHJpYWxJViwgaSlcbiBwYXJzZXJGdW5jcyBtdXN0IHJldHVybiB0aGUgZm9ybWF0dGVkIHZhbHVlXG4gVGhpcyBhc3N1bWVzIHlvdSBrbm93IHRoZSBjb250ZW50IG9mIHRoZSB0cmlhbCB2YWx1ZSwgd2hpY2ggeW91IHNob3VsZC4uLi5cbiAqL1xuVHJpYWxzLnNldElWVHJpYWxQYXJzZXJGdW5jID0gZnVuY3Rpb24gKGl2bmFtZSwgcGFyc2VyRnVuYykge1xuICAgIF9zZXRJVkdlbmVyaWMoaXZuYW1lLCBcInBhcnNlckZ1bmNcIiwgcGFyc2VyRnVuYyk7XG59O1xuXG5cblRyaWFscy5zZXRSZXBlYXRzID0gZnVuY3Rpb24gKG5SZXBlYXRzKSB7XG4gICAgZXhwUmVwZWF0cyA9IG5SZXBlYXRzO1xufTtcblxuXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICBUcmlhbHMgLSBTZXR0aW5nIElWIExldmVscyAmIEZ1bmN0aW9ucyAocHJpdmF0ZSlcbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cbi8qXG4qICovXG5leHBvcnQgZnVuY3Rpb24gX3NldElWR2VuZXJpYyhpdk5hbWUsIGZpZWxkTmFtZSwgZmllbGRWYWwpIHsgLy91c2VkIGJ5IDJBRkMuanNcbiAgICBfY3N2SWxsZWdhbENoYXJDaGVjayhpdk5hbWUpO1xuICAgIF9jc3ZJbGxlZ2FsQ2hhckNoZWNrKGZpZWxkTmFtZSk7XG4gICAgaWYgKCFJVnMuaGFzT3duUHJvcGVydHkoaXZOYW1lKSkgeyAvL0lmIElWIGRvZW5zdCBleGlzdHMgbWFrZSBpdCBhcyBhIHJhdyBvYmplY3RcbiAgICAgICAgSVZzW2l2TmFtZV0gPSB7fTtcbiAgICB9XG5cbiAgICBJVnNbaXZOYW1lXVtmaWVsZE5hbWVdID0gZmllbGRWYWw7XG59XG5cblxuZnVuY3Rpb24gX3NldFNldEZ1bmMoaXZuYW1lLCBzZXRmdW5jKXtcbiAgICBzZXRGdW5jc1tpdm5hbWVdID0gc2V0ZnVuYztcbn1cblxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRyaWFscyAtIEJ1aWxkaW5nXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG5cbnZhciBfdG90YWxUcmlhbHMgPSAtMTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0Fzc2lnbmVkIGJ1dCBuZXZlciB1c2VkXG5leHBvcnQgdmFyIF9hbGxUcmlhbHMgPSBbXTtcbmV4cG9ydCBmdW5jdGlvbiBfc2V0QWxsVHJpYWxzKGFsbHRyaWFscyl7XG4gICAgaWYgKGFsbHRyaWFscy5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpe1xuICAgICAgICBfYWxsVHJpYWxzID0gYWxsdHJpYWxzO1xuICAgIH1cbn1cblxuVHJpYWxzLmdldFRyaWFscyA9IGZ1bmN0aW9uKCl7XG4gICAgaWYgKF9hbGxUcmlhbHMubGVuZ3RoID4gMCl7XG4gICAgICAgIHJldHVybiAkLmV4dGVuZCh0cnVlLCBbXSwgX2FsbFRyaWFscyk7XG4gICAgfVxufTtcblxuZXhwb3J0IHZhciBfZGlkQnVpbGRUcmlhbHMgPSBmYWxzZTtcbmZ1bmN0aW9uIF9idWlsZFRyaWFscyhwcmludFRyaWFscykge1xuXG4gICAgY29uc29sZS5sb2coXCJCdWlsZCBUcmlhbHMuIElWUzpcIiwgSVZzKTtcblxuICAgIHZhciBidWlsZGluZ1RyaWFsLCB0ZW1wO1xuXG4gICAgZm9yICh2YXIgaXYgaW4gSVZzKSB7IC8vSXRlcmF0ZSBvdmVyIElWc1xuXG4gICAgICAgIGlmIChJVnNbaXZdLmxldmVscyA9PT0gdW5kZWZpbmVkKSAgdGhyb3cgbmV3IEVycm9yKFwiTGV2ZWxzIG5vdCBzdXBwbGllZCBmb3IgXCIgKyBpdik7XG4gICAgICAgIGlmIChJVnNbaXZdLnNldEZ1bmMgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKFwiU2V0dGVyIGZ1bmN0aW9uIG5vdCBzdXBwbGllZCBmb3IgXCIgKyBpdik7XG5cbiAgICAgICAgY29uc29sZS5sb2coXCJFeHRlbmRpbmcgYWxsIHRyaWFscyBhcnJheSB3aXRoOiBcIiArIGl2ICsgXCIgKFwiICsgSVZzW2l2XS5sZXZlbHMubGVuZ3RoICsgXCIgbGV2ZWxzKVwiKTtcblxuICAgICAgICBpZiAoc2V0RnVuY3NbaXZdID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihcIlNldEZ1bmMgbm90IGRlZmluZWQgZm9yIFwiICsgaXYpO1xuXG4gICAgICAgIHRlbXAgPSBbXTtcblxuICAgICAgICB2YXIgbGVuID0gX2FsbFRyaWFscy5sZW5ndGggPT09IDAgPyAxIDogX2FsbFRyaWFscy5sZW5ndGg7IC8vIEZvciB0aGUgZmlyc3QgcGFzc1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpIHsgLy9Gb3IgYWxsIHRyaWFscyBidWlsdCBzbyBmYXJcblxuICAgICAgICAgICAgYnVpbGRpbmdUcmlhbCA9IF9hbGxUcmlhbHMucG9wKCk7IC8vUG9wIHRoZSBpbmNvbXBsZXRlIGFycmF5IG9mIGl2LXZhbHMgKG9iamVjdHMpIGFuZCBleHRlbmRcblxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBJVnNbaXZdLmxldmVscy5sZW5ndGg7ICsraikgeyAvL0V4dGVuZCB0aGVtIGJ5IGFsbCB0aGUgbGV2ZWxzIG9mIHRoZSBuZXh0IElWXG5cblxuICAgICAgICAgICAgICAgIC8qKiBTZXQgdGhlIHZhbHVlICYgZGVzY3JpcHRpb24gb2YgdGhlIGN1cnJlbnQgSVYgb2JqIDQgdGhlIGN1cnJlbnQgTGV2ZWwgKi9cbiAgICAgICAgICAgICAgICB2YXIgY3VySVZMZXZlbCA9IHt9O1xuICAgICAgICAgICAgICAgIGN1cklWTGV2ZWwuZGVzY3JpcHRpb24gPSBpdjsgLy9jYW1lbFRvU2VudGVuY2VDYXNlKGl2KTtcbiAgICAgICAgICAgICAgICBjdXJJVkxldmVsLnZhbHVlID0gSVZzW2l2XS5sZXZlbHNbal07XG5cbiAgICAgICAgICAgICAgICAvKiogU3RvcmUgMkFGQyBzdGQgd2l0aCBlYWNoIHRyaWFsIChpZiBwcmVzZW50KSAqL1xuICAgICAgICAgICAgICAgIGlmIChJVnNbaXZdLmhhc093blByb3BlcnR5KFwic3RkXzJBRkNcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VySVZMZXZlbC5zdGRfMkFGQyA9IElWc1tpdl0uc3RkXzJBRkM7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLyoqIEZvciAyQUZDIHRoYXQgaXMgc2ltdWx0YW5lb3VzIChhcyBvcHBvc2VkIHRvIHRoZSBmbGlwcGluZyBraW5kKSovXG4gICAgICAgICAgICAgICAgaWYgKElWc1tpdl0uaGFzT3duUHJvcGVydHkoXCJzdGRfMkFGQ19zaW11bHRhbmVvdXNfdGFyZ2V0XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cklWTGV2ZWwuc3RkXzJBRkNfc2ltdWx0YW5lb3VzX3RhcmdldCA9IElWc1tpdl0uc3RkXzJBRkNfc2ltdWx0YW5lb3VzX3RhcmdldDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLyoqIFBhcnNlciBmdW5jdGlvbiovXG4gICAgICAgICAgICAgICAgaWYgKElWc1tpdl0ucGFyc2VyRnVuYyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cklWTGV2ZWwucGFyc2VyRnVuYyA9IElWc1tpdl0ucGFyc2VyRnVuYzsgLy9Db3VsZCB3cml0ZSBhIGNvcHlpbmcgbWV0aG9kIGZvciBhbGwgb2YgdGhlc2UgKHRoYXQgaGFuZGxlcyBkZWVwIGNvcHlpbmcpXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIG5ld09yRXh0ZW5kZWRUcmlhbDtcblxuICAgICAgICAgICAgICAgIGlmIChidWlsZGluZ1RyaWFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9uZXdPckV4dGVuZGVkVHJpYWwgPSAgaXYgKyBcIiAgXCIgKyBsZXZlbFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBuZXdPckV4dGVuZGVkVHJpYWwgPSBbY3VySVZMZXZlbF07XG5cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJ1aWxkaW5nVHJpYWwuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vbmV3T3JFeHRlbmRlZFRyaWFsID0gYnVpbGRpbmdUcmlhbCArIFwiIHwgfCBcIiArIGl2ICsgXCIgIFwiICsgbGV2ZWxWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgbmV3T3JFeHRlbmRlZFRyaWFsID0gYnVpbGRpbmdUcmlhbC5jb25jYXQoW2N1cklWTGV2ZWxdKTsgLy9DcmVhdGVzIGEgYnJhbmQgbmV3IGFycmF5IHcgdGhlIG5ldyBsZXZlbFxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRlbXAucHVzaChuZXdPckV4dGVuZGVkVHJpYWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqIFJlcGxhY2UgeW91ciBwcmV2aW91cyB0cmlhbHMgd2l0aCBUZW1wIChkb25cInQga25vdyB3aG8gdG8gZG8gdGhpcyBpbiBwbGFjZSkgKi9cbiAgICAgICAgX2FsbFRyaWFscyA9IHRlbXA7XG4gICAgfVxuXG5cbiAgICAvKiogRHVwbGljYXRlIHRoZSBjdXJyZW50IGZhY3RvcmlhbCB0cmlhbHMgKi9cbiAgICB2YXIgcmVwZWF0cyA9IGV4cFJlcGVhdHM7XG4gICAgdGVtcCA9IFtdO1xuICAgIGZvciAoaSA9IDA7IGkgPCByZXBlYXRzOyBpKyspIHtcbiAgICAgICAgdGVtcCA9IHRlbXAuY29uY2F0KF9hbGxUcmlhbHMpO1xuICAgIH1cbiAgICBfYWxsVHJpYWxzID0gdGVtcDtcblxuXG4gICAgY29uc29sZS5sb2coXCJUaGVyZSBhcmUgXCIsIF9hbGxUcmlhbHMubGVuZ3RoLCBcInRyaWFscyAodXNpbmdcIiwgcmVwZWF0cywgXCJyZXBlYXRzKVwiKTtcbiAgICBpZiAocHJpbnRUcmlhbHMpe1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgX2FsbFRyaWFscy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlRSSUFMIFwiLCBpKTtcbiAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBfYWxsVHJpYWxzW2ldLmxlbmd0aDsgaisrKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggX2FsbFRyaWFsc1tpXVtqXSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2coXCIqKioqKioqICoqKioqKiogKioqKioqKiAqKioqKioqXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKF9zaG91bGRTaHVmZmxlKSAgICAgX2FsbFRyaWFscy5zaHVmZmxlKCk7XG5cblxuICAgIF90b3RhbFRyaWFscyA9IF9hbGxUcmlhbHMubGVuZ3RoOyAvL1VzZWQgdG8gZGV0ZXJtaW5lIHdoZXJlIHlvdSBhcmUgaW4gdGhlIHRyaWFsIHByb2Nlc3NcbiAgICBfZGlkQnVpbGRUcmlhbHMgPSB0cnVlO1xufVxuXG5cbi8qKlxuICogTk9URTogVGhpcyBtb2R1bGUgZG9lcyBub3QgbG9uZ2VyIGhhbmRsZSBhcHBlYXJhbmNlIG9yIGlucHV0XG4gKiBUaGlzIG1vZHVsZSBub3cgb25seSBoYW5kbGVzOlxuICAgICogLSB0YWtpbmcgSVZzXG4gICAgKiAtIGJ1aWxkaW5nIGFsbCB0cmlhbHNcbiAqL1xuVHJpYWxzLmJ1aWxkRXhwZXJpbWVudCA9IGZ1bmN0aW9uIChwcmludFRyaWFscykge1xuICAgIF9idWlsZFRyaWFscyggKHByaW50VHJpYWxzID09PSB1bmRlZmluZWQpID8gZmFsc2UgOiBwcmludFRyaWFscyApO1xufTtcblxuXG52YXIgX3Nob3VsZFNodWZmbGUgPSB0cnVlO1xuVHJpYWxzLnNldFNodWZmbGUgPSBmdW5jdGlvbihzaG91bGRTaHVmZmxlKXtcbiAgICBpZiAodHlwZW9mKHNob3VsZFNodWZmbGUpID09PSBcImJvb2xlYW5cIil7XG4gICAgICAgIF9zaG91bGRTaHVmZmxlID0gIHNob3VsZFNodWZmbGU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwic2V0U2h1ZmZsZSBvbmx5IGFjY2VwdHMgYm9vbGVhbiBhcmd1bWVudFwiKTtcbiAgICB9XG59O1xuXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVHJpYWxzIChzdWJmdW5jdGlvbnMpXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG5mdW5jdGlvbiBfY3N2SWxsZWdhbENoYXJDaGVjayhzdHJpbmcpe1xuXG4gICAgaWYgKHR5cGVvZiBzdHJpbmcgIT09IFwic3RyaW5nXCIpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzdXBwbHkgYSB2YXJpYWJsZSBvZiB0eXBlIFN0cmluZyBmb3IgdGhpcyBtZXRob2RcIik7XG4gICAgfVxuXG4gICAgaWYgKHN0cmluZy5pbmRleE9mKFwiLFwiKSAhPT0gLTEpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTdHJpbmdzIHVzZWQgYnkgRXhwZXJpbWVudEpTIG1heSBub3QgY29udGFpbiBjb21tYXM6IFwiICsgc3RyaW5nKTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IFRyaWFscyB9OyIsIi8qKlxuICogQ3JlYXRlZCBieSBrYWkgb24gNi83LzE3LlxuICovXG5pbXBvcnQgeyBUcmlhbHMgfSBmcm9tIFwiLi9UcmlhbHMuanNcIjtcblxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuLy8gICAgICAgICAgICAgICAgICAgICAgRXhwZXJpbWVudCBMaWZlY3ljbGUgLSBHZXQgUGFydGljaXBhbnQgSW5mb1xuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuXG5leHBvcnQgdmFyIF9wcHROYW1lID0gXCJ1bm5hbWVkX3BwdFwiO1xuZXhwb3J0IHZhciBfcHB0Tm8gPSAwO1xuXG5UcmlhbHMuZ2V0UHB0SW5mbyA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIF9wcHROYW1lID0gcHJvbXB0KFwiUGxlYXNlIGVudGVyIHlvdXIgbmFtZVwiKS50cmltKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibmFtZSB3YXNcIiwgX3BwdE5hbWUpO1xuICAgICAgICBpZiAoX3BwdE5hbWUgPT09IFwiXCIgfHwgX3BwdE5hbWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGFsZXJ0KFwiTmFtZSBjYW5ub3QgYmUgYmxhbmtcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIF9wcHRObyA9IHBhcnNlSW50KHByb21wdChcIlBsZWFzZSBlbnRlciB5b3VyIHBhcnRpY2lwYW50IG51bWJlclwiKSk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicHB0IG51bWJlciB3YXNcIiwgX3BwdE5vKTtcbiAgICAgICAgaWYgKGlzTmFOKF9wcHRObykpIHtcbiAgICAgICAgICAgIGFsZXJ0KFwiUGFydGljaXBhbnQgbnVtYmVyIG11c3QgYmUgYW4gaW50ZWdlclwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coXCJQYXJ0aWNpcGFudCBuYW1lOiBcIiwgX3BwdE5hbWUsIFwiXFx0UGFydGljaXBhbnQgbnVtYmVyOiBcIiwgX3BwdE5vKTtcbn07IiwiXG5pbXBvcnQgeyBUcmlhbHMgfSBmcm9tIFwiLi9UcmlhbHMuanNcIjtcbmltcG9ydCB7IF9yZXNwb25zZXMgfSBmcm9tIFwiLi9SdW5FeHBlcmltZW50LmpzXCI7XG5pbXBvcnQgeyBfcHB0TmFtZSwgX3BwdE5vIH0gZnJvbSBcIi4vR2V0UHB0SW5mby5qc1wiO1xuaW1wb3J0IHsgY3JlYXRlRG93bmxvYWRMaW5rIH0gZnJvbSBcIi4uL3V0aWxzL0NyZWF0ZURvd25sb2FkTGluay5qc1wiO1xuXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEV4cGVyaW1lbnQgTGlmZWN5Y2xlIC0gT3V0cHV0IFJlc3BvbnNlc1xuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuXG5UcmlhbHMuZm9yY2VPdXRwdXRSZXNwb25zZXMgPSBmdW5jdGlvbigpe1xuICAgIGNvbnNvbGUubG9nKFwiRm9yY2luZyBvdXRwdXQgb2YgX3Jlc3BvbnNlc1wiKTtcbiAgICBfb3V0cHV0UmVzcG9uc2VzKF9yZXNwb25zZXMsIHRydWUpO1xufTtcblxuXG5leHBvcnQgZnVuY3Rpb24gX291dHB1dFJlc3BvbnNlcyhhbGxSZXNwb25zZXMsIGxvZykge1xuXG4gICAgaWYgKGFsbFJlc3BvbnNlcy5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgIHZhciBjc3ZTdHJpbmcgPSBcIlwiO1xuXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhbGxSZXNwb25zZXNbMF0pO1xuICAgIC8qKlRoZXNlIGFyZSBhbGwgdGhlIGNvbHVtbnMgaW4gdGhlIG91dHB1dCovXG5cbiAgICAvKiogTWFrZSB0aGUgaGVhZGVyKi9cbiAgICBjc3ZTdHJpbmcgKz0gXCJQYXJ0aWNpcGFudCBOYW1lLCBQYXJ0aWNpcGFudCBOdW1iZXIsIFwiOyAvL01hbnVhbGx5IGFkZCBoZWFkZXJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY3N2U3RyaW5nICs9IGtleXNbaV0gKyBcIixcIjtcbiAgICB9XG4gICAgY3N2U3RyaW5nID0gY3N2U3RyaW5nLnNsaWNlKDAsIC0xKSArIFwiXFxuXCI7Ly9DdXQgdHJhaWxpbmcgY29tbWEgYW5kIHB1dCBpbiBhIG5ldyByb3cvbGluZVxuXG4gICAgLyoqIEZpbGwgdGhlIGRhdGEgLSBUaGlzIHRpbWUgaXRzIGFuIGFycmF5IG9mIGFycmF5cyBub3QgYXJyYXkgb2YgZGljdGlvbmFyaWVzICovXG4gICAgZm9yIChpID0gMDsgaSA8IGFsbFJlc3BvbnNlcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgIGNzdlN0cmluZyArPSBfcHB0TmFtZSArIFwiLFwiICsgX3BwdE5vICsgXCIsXCI7IC8vTWFuYXVsbHkgYWRkIGNvbnRlbnRcblxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGtleXMubGVuZ3RoOyBqKyspIHsgLy9JdGVyYXRlIG92ZXIgdGhlIGtleXMgdG8gZ2V0IHRlaCB2YWx1ZXNcblxuICAgICAgICAgICAgdmFyIHZhbHVlID0gYWxsUmVzcG9uc2VzW2ldW2tleXNbal1dO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJ3cml0aW5nIHRoaXMgcmF3IHZhbHVlIFwiLCB2YWx1ZSwga2V5c1tqXSk7XG4gICAgICAgICAgICAvL3ZhbHVlID0gY2hlY2tSZXR1cm5Qcm9wcyggdmFsdWUsIHRydWUgKSB8fCB2YWx1ZTsgIC8vUGFyc2Ugb3V0IHJlbGV2YW50IG9iamVjdCBmaWVsZHNcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJBZmVyIGl0IHdhcyBwYXJzZWQ6XCIsIHZhbHVlLCBcIlxcbioqKioqKioqKlwiKTtcbiAgICAgICAgICAgIGNzdlN0cmluZyArPSB2YWx1ZSArIFwiLFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgY3N2U3RyaW5nID0gY3N2U3RyaW5nLnNsaWNlKDAsIC0xKSArIFwiXFxuXCI7IC8vQ3V0IHRyYWlsaW5nIGNvbW1hIGFuZCBwdXQgaW4gYSBuZXcgcm93L2xpbmVcbiAgICB9XG5cbiAgICBpZiAobG9nKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGNzdlN0cmluZyk7XG4gICAgfVxuXG4gICAgLyoqIEhlbHAgb3V0IGEgbWFjaGluZSB0b2RheSovXG4gICAgdmFyIGNzdkNvbnRlbnQgPSBlbmNvZGVVUkkoXCJkYXRhOnRleHQvY3N2O2NoYXJzZXQ9dXRmLTgsXCIgKyBjc3ZTdHJpbmcpO1xuICAgIHZhciBhID0gY3JlYXRlRG93bmxvYWRMaW5rKFwicmVzdWx0cyAoXCIgKyBfcHB0TmFtZSArIFwiLFwiICsgX3BwdE5vLnRvU3RyaW5nKCkgKyBcIikuY3N2XCIsIGNzdkNvbnRlbnQpO1xuICAgIGEuaW5uZXJIVE1MID0gXCI8aDQ+Q2xpY2sgdG8gZG93bmxvYWQgcmVzdWx0cyE8L2g0PlwiO1xuICAgIGEuY2xhc3NOYW1lICs9IFwiIHJlc3VsdHMtZG93bmxvYWRcIjtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGEpO1xuICAgIGEuY2xpY2soKTtcbn1cbiIsIlxuXG5pbXBvcnQgeyBfc2hvdWxkUnVuTmV4dFRyaWFsLCBfc2V0U2hvdWxkUnVuTmV4dFRyaWFsIH0gZnJvbSBcIi4vUnVuRXhwZXJpbWVudC5qc1wiO1xuXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJbnRlcnN0aW11bHVzIFBhdXNlIC0gY3JlYXRpb25cbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cblxuXG5mdW5jdGlvbiBfY3JlYXRlSW50ZXJzdGltdWx1c1BhdXNlKCl7XG4gICAgdmFyIGJsYWNrb3V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBibGFja291dC5pZCA9IFwiaW50ZXJzdGltdWx1cy1wYXVzZVwiO1xuXG4gICAgdmFyIGNzcyA9IHsgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNldCBibGFja291dCBzdHlsZVxuICAgICAgICBwb3NpdGlvbjogXCJmaXhlZFwiLFxuICAgICAgICBsZWZ0OiAwLFxuICAgICAgICB0b3A6IDAsXG4gICAgICAgIHdpZHRoOiBcIjEwMHZ3XCIsXG4gICAgICAgIGhlaWdodDogXCIxMDB2aFwiLFxuICAgICAgICBiYWNrZ3JvdW5kOiBcImJsYWNrXCIsXG4gICAgICAgIGRpc3BsYXk6IFwibm9uZVwiICAgICAgICAgICAgICAgICAgICAgLy8gYmxvY2tcbiAgICB9O1xuXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhjc3MpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKyl7XG4gICAgICAgIHZhciBhdHRyaWJ1dGUgPSBrZXlzW2ldO1xuICAgICAgICBibGFja291dC5zdHlsZVthdHRyaWJ1dGVdID0gY3NzW2F0dHJpYnV0ZV07XG4gICAgfVxuICAgIC8vIGZvciAodmFyIGF0dHJpYnV0ZSBvZiApe1xuICAgIC8vICAgICBibGFja291dC5zdHlsZVthdHRyaWJ1dGVdID0gY3NzW2F0dHJpYnV0ZV07XG4gICAgLy8gfVxuXG4gICAgcmV0dXJuIGJsYWNrb3V0O1xuXG59XG5cbi8vIHZhciBfYmxhY2tPdXQgPSAkKFwiPGRpdj5cIiwge1xuLy8gICAgIGlkOiBcImludGVyc3RpbXVsdXMtcGF1c2VcIixcbi8vICAgICBjc3M6IHtcbi8vICAgICAgICAgcG9zaXRpb246IFwiZml4ZWRcIixcbi8vICAgICAgICAgbGVmdDogMCxcbi8vICAgICAgICAgdG9wOiAwLFxuLy8gICAgICAgICB3aWR0aDogXCIxMDB2d1wiLFxuLy8gICAgICAgICBoZWlnaHQ6IFwiMTAwdmhcIixcbi8vICAgICAgICAgYmFja2dyb3VuZDogXCJibGFja1wiXG4vLyAgICAgfVxuLy8gfSk7XG5cbi8vICQoZG9jdW1lbnQuYm9keSkuYXBwZW5kKF9ibGFja091dCk7XG4vLyAkKFwiI2ludGVyc3RpbXVsdXMtcGF1c2VcIikuaGlkZSgpO1xuXG52YXIgX2JsYWNrT3V0ID0gX2NyZWF0ZUludGVyc3RpbXVsdXNQYXVzZSgpO1xuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChfYmxhY2tPdXQpO1xuXG5cbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEludGVyc3RpbXVsdXMgUGF1c2UgLSB1c2Vcbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cblxudmFyIFBhdXNlID0ge307XG5cblBhdXNlLnNob3dJbnRlcnN0aW11bHVzUGF1c2UgPSBmdW5jdGlvbiAoZHVyYXRpb24pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBfaW50ZXJzdGltdWx1c1BhdXNlKGR1cmF0aW9uKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG52YXIgX3BhdXNlID0gNTAwO1xuUGF1c2Uuc2V0UGF1c2VUaW1lID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSBwYXJzZUludCh2YWx1ZSwgMTApKSB7XG4gICAgICAgIF9wYXVzZSA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IFwic2V0UGF1c2VUaW1lIG9ubHkgdGFrZXMgaW50ZWdlcnNcIjtcbiAgICB9XG59O1xuXG5leHBvcnQgdmFyIF9zaG91bGRJbnRlcnN0aW11bHVzUGF1c2UgPSB0cnVlOyAgICAgICAgICAgICAgICAgICAgICAgIC8vdXNlZCBpbjogUnVuRXhwZXJpbWVudC5qc1xuUGF1c2Uuc2V0U2hvdWxkSW50ZXJzdGltdWx1c1BhdXNlID0gZnVuY3Rpb24odmFsdWUpe1xuICAgIGlmICh0eXBlb2YgIHZhbHVlID09PSBcImJvb2xlYW5cIil7XG4gICAgICAgIF9zaG91bGRJbnRlcnN0aW11bHVzUGF1c2UgPSB2YWx1ZTtcbiAgICB9XG59O1xuXG5cblxuXG52YXIgX2lzSW50ZXJzdGltdWx1c1BhdXNlID0gZmFsc2U7XG5leHBvcnQgZnVuY3Rpb24gX2ludGVyc3RpbXVsdXNQYXVzZShkdXJhdGlvbikgeyAgICAgICAgICAgICAgICAgICAgIC8vIHVzZWQgaW46IFJ1bkV4cGVyaW1lbnQuanNcblxuICAgIGR1cmF0aW9uID0gZHVyYXRpb24gPT09IHVuZGVmaW5lZCA/IF9wYXVzZSA6IGR1cmF0aW9uOyAgICAgICAgICAvL0RlZmF1bHQgdG8gcGF1c2UgdGltZSB1bmxlc3MgYW4gYXJndW1lbnQgaXMgc3VwcGxpZWRcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIC8vICQoXCIjaW50ZXJzdGltdWx1cy1wYXVzZVwiKS5zaG93KCk7XG4gICAgICAgIF9zaG93SW50ZXJzdGltdWx1c1BhdXNlKF9ibGFja091dCk7XG4gICAgICAgIF9pc0ludGVyc3RpbXVsdXNQYXVzZSA9IHRydWU7XG4gICAgICAgIF9zZXRTaG91bGRSdW5OZXh0VHJpYWwoZmFsc2UpO1xuXG4gICAgICAgIC8qIFByZXZlbnQgYnV0dG9uIG1hc2hpbmcgd2hpbGUgdGhlIHBhdXNlIHJ1bnMgKi9cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyAkKFwiI2ludGVyc3RpbXVsdXMtcGF1c2VcIikuaGlkZSgpO1xuICAgICAgICAgICAgX2hpZGVJbnRlcnN0aW11bHVzUGF1c2UoX2JsYWNrT3V0KTtcbiAgICAgICAgICAgIF9pc0ludGVyc3RpbXVsdXNQYXVzZSA9IGZhbHNlO1xuICAgICAgICAgICAgX3NldFNob3VsZFJ1bk5leHRUcmlhbCh0cnVlKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDYW5ub3QgcmVhc3NpZ24gaW1wb3J0ZWQgdmFsdWVzLCBzbyB5b3UgbmVlZCBhIHNldHRlclxuXG4gICAgICAgICAgICByZXNvbHZlKCk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByb21pc2UgaGFzIHJlc29sdmVkIGhlcmVcbiAgICAgICAgfSwgZHVyYXRpb24pO1xuICAgIH0pO1xufVxuXG5cbmZ1bmN0aW9uIF9oaWRlSW50ZXJzdGltdWx1c1BhdXNlKGJsYWNrb3V0KXtcbiAgICBibGFja291dC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG59XG5cbmZ1bmN0aW9uIF9zaG93SW50ZXJzdGltdWx1c1BhdXNlKGJsYWNrb3V0KXtcbiAgICBibGFja291dC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xufVxuXG5leHBvcnQgeyBQYXVzZSB9OyIsIlxuLy8gUnVuRXhwZXJpbWVudC5qc1xuLy8gQWRkIGNvcmUgZnVuY3Rpb25hbGl0eSBmYWNpbGl0YXRpbmcgdGhlIGV4cGVyaW1lbnRhbCBsaWZlIGN5Y2xlIHRvIHRoZSBUcmlhbHMgT2JqZWN0LlxuLy8gU3VjaCBhczpcbi8vICAgICAgLSBHZXR0aW5nIHBhcnRpY2lwYW50IGluZm9cbi8vICAgICAgLSBSdW5uaW5nIHRoZSBuZXh0IHRyaWFsIChzZXR0aW5nIElWcyBldGMpXG4vLyAgICAgIC0gU3RvcmluZyBhIHJlc3BvbnNlXG4vLyAgICAgIC0gT3V0cHV0dGluZyByZXNwb25zZXNcbi8vICAgICAgLSBNaWQvZW5kIGNhbGxiYWNrc1xuXG5cbmltcG9ydCB7IFRyaWFscywgc2V0RnVuY3MsIF9hbGxUcmlhbHMsIF9kaWRCdWlsZFRyaWFscywgX2R2TmFtZSB9IGZyb20gXCIuL1RyaWFscy5qc1wiO1xuaW1wb3J0IHsgX291dHB1dFJlc3BvbnNlcyB9IGZyb20gXCIuL091dHB1dFJlc3BvbnNlcy5qc1wiO1xuaW1wb3J0IHsgX2ludGVyc3RpbXVsdXNQYXVzZSwgX3Nob3VsZEludGVyc3RpbXVsdXNQYXVzZSB9IGZyb20gXCIuL0ludGVyc3RpbXVsdXNQYXVzZS5qc1wiO1xuXG5pbXBvcnQgeyBnZXRQYXJhbU5hbWVzIH0gZnJvbSBcIi4uL3V0aWxzL1N0cmluZ1V0aWxzLmpzXCI7XG5cblxuXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICBFeHBlcmltZW50IExpZmVjeWNsZSAtIFN0YXJ0ICYgR2FtZSBMb29wXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG5cbi8vQ2Fubm90IHJlYXNzaWduIGltcG9ydGVkIHZhbHVlcywgc28geW91IG5lZWQgYSBzZXR0ZXIgKHVzZWQgaW4gSW50ZXJzdGltbHVzUGF1c2UuanMpXG5leHBvcnQgZnVuY3Rpb24gX3NldFNob3VsZFJ1bk5leHRUcmlhbCh2YWx1ZSl7XG4gICAgaWYgKHR5cGVvZih2YWx1ZSkgPT09IFwiYm9vbGVhblwiKXtcbiAgICAgICAgX3Nob3VsZFJ1bk5leHRUcmlhbCA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImNhbm5vdCBzZXQgX3Nob3VsZFJ1bk5leHRUcmlhbCB0byBhIG5vbiBib29sZWFuIHZhbHVlXCIpO1xuICAgIH1cbn1cblxuZXhwb3J0IHZhciBfc2hvdWxkUnVuTmV4dFRyaWFsID0gdHJ1ZTsgLy91c2VkIGJ5OiBJbnRlcnN0aW11bHVzUGF1c2UuanNcblRyaWFscy5ydW5OZXh0VHJpYWwgPSBmdW5jdGlvbiAoc2V0dGluZ3MpIHsgLy8gdXNhZ2UgLT4gcnVuTmV4dFRyaWFsKHtzaG91bGRTdG9yZVJlc3BvbnNlOiB0cnVlLCBkdl92YWx1ZTogXCJpbnNpZGVcIn0pO1xuXG4gICAgaWYgKCFfZGlkQnVpbGRUcmlhbHMpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJydW5OZXh0VHJpYWwoKTogVHJpYWwgd2VyZSBub3QgYnVpbHRcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoX3Nob3VsZFJ1bk5leHRUcmlhbCkge1xuXG4gICAgICAgIC8vIFRPRE86IENoYW5nZSB0aGUgaW1wbGVtZW50YXRpb24gb2YgdGhlIG1pZCBjYWxsYmFjayAtIEp1c3QgY2hlY2sgdGhlIGxlbmd0aCBvZiB0aGUgX3Jlc3BvbnNlcyBhcnJheSB2cyB0aGUgYWxsdHJpYWxzIGFycmF5Li5cblxuICAgICAgICBpZiAoX3Nob3VsZFJ1bk1pZENhbGxiYWNrKCkgJiYgX21pZENhbGxiYWNrICE9PSBudWxsKSB7XG4gICAgICAgICAgICBfbWlkQ2FsbGJhY2soKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfc2hvdWxkSW50ZXJzdGltdWx1c1BhdXNlKSB7XG4gICAgICAgICAgICBfaW50ZXJzdGltdWx1c1BhdXNlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2V0dGluZ3MgIT09IHVuZGVmaW5lZCAmJiBzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eShcInNob3VsZFN0b3JlUmVzcG9uc2VcIikgJiYgc2V0dGluZ3Muc2hvdWxkU3RvcmVSZXNwb25zZSkge1xuICAgICAgICAgICAgX3N0b3JlUmVzcG9uc2Uoc2V0dGluZ3MpOyAvL1NldHRpbmdzIGNvbnRhaW5zIGEgZmllbGQgXCJkdl92YWx1ZVwiIHdoaWNoIGlzIGFsc28gcmVhZCBieSBfc3RvcmVSZXNwb25zZVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF9hbGxUcmlhbHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgX2Rpc3BsYXlOZXh0VHJpYWwoKTtcblxuICAgICAgICAgICAgLy8gX2N1cjJBRkNJc1RhcmdldCA9IHRydWU7XG4gICAgICAgICAgICAvKiogQWx3YXlzIHJlc2V0IHRoZSAyQUZDIHZhbHVlKi9cblxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJUaGVyZSBhcmUgXCIsIF9hbGxUcmlhbHMubGVuZ3RoLCBcIiB0cmlhbHMgcmVtYWluaW5nLlwiKTtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgLy9Qb3NzaWJseSB0b28gZGVzdHJ1Y3RpdmVcbiAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkuY2hpbGRyZW4oKS5mYWRlT3V0KCk7XG4gICAgICAgICAgICAvLyAkKFwiI2ludGVyc3RpbXVsdXMtcGF1c2VcIikuaGlkZSgpO1xuICAgICAgICAgICAgX291dHB1dFJlc3BvbnNlcyhfcmVzcG9uc2VzKTtcblxuICAgICAgICAgICAgaWYgKCB0eXBlb2YgX2VuZENhbGxCYWNrID09PSBcImZ1bmN0aW9uXCIpIF9lbmRDYWxsQmFjaygpO1xuXG4gICAgICAgIH1cbiAgICB9XG5cbn07XG5cbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cbi8vICAgICAgICAgICAgICAgICAgRXhwZXJpbWVudCBMaWZlY3ljbGUgLSBNaWQgUG9pbnQgQ2FsbGJhY2sgKGkuZS4gdGhlIFwidGFrZSBhIGJyZWFrXCIgbWVzc2FnZSlcbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cblxudmFyIF9kaWRSdW5NaWRDYWxsYmFjayA9IGZhbHNlO1xudmFyIF9taWRDYWxsYmFjayA9IG51bGw7XG5UcmlhbHMuc2V0TWlkQ2FsbGJhY2sgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgICBfbWlkQ2FsbGJhY2sgPSB2YWx1ZTtcbiAgICB9ICAgZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk9ubHkgZnVuY3Rpb25zIG1heSBiZSBhc3NpZ25lZCB0byB0aGUgZW5kIGNhbGxiYWNrXCIpO1xuICAgIH1cbn07XG5cbmZ1bmN0aW9uIF9zaG91bGRSdW5NaWRDYWxsYmFjaygpIHtcbiAgICBpZiAoX2RpZFJ1bk1pZENhbGxiYWNrKSByZXR1cm4gZmFsc2U7XG5cbiAgICAvL01pZCBwb2ludCA9IHRoZXJlIGFyZSBhcyBtYW55IHJlc3BvbnNlcyBhcyB0cmlhbHMgKG9yIGEgZGlmZmVyZW5jZSBvZiBvbmUgZm9yIG9kZCBudW1iZXIgb2YgdHJpYWxzKVxuICAgIGlmIChfYWxsVHJpYWxzLmxlbmd0aCA9PT1fcmVzcG9uc2VzLmxlbmd0aCB8fCBNYXRoLmFicyhfYWxsVHJpYWxzLmxlbmd0aCAtX3Jlc3BvbnNlcy5sZW5ndGgpID09PSAxKXtcbiAgICAgICAgX2RpZFJ1bk1pZENhbGxiYWNrID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG4vLyAgICAgICAgICAgICBFeHBlcmltZW50IExpZmVjeWNsZSAtIEVuZCBDYWxsYmFjayAoYSBiZWhhdmlvdXIgYXQgdGhlIGVuZCBvZiB0aGUgZXhwZXJpbWVudClcbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cbnZhciBfZW5kQ2FsbEJhY2sgPSBudWxsO1xuVHJpYWxzLnNldEVuZENhbGxiYWNrID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKXtcbiAgICAgICAgX2VuZENhbGxCYWNrID0gdmFsdWU7XG4gICAgfSAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJPbmx5IGZ1bmN0aW9ucyBtYXkgYmUgYXNzaWduZWQgdG8gdGhlIGVuZCBjYWxsYmFja1wiKTtcbiAgICB9XG59O1xuXG5cbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRXhwZXJpbWVudCBMaWZlY3ljbGUgLSBEaXNwbGF5aW5nIFRoZSBOZXh0IFRyaWFsXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG5cbi8qKiBXaGVyZSB2aWV3LWxldmVsIGVsZW1lbnRzIGFyZSBzZXQgLSB0aGlzIGlzIGxpa2UgdGhlIENPTlRST0xMRVIgbWV0aG9kIGludGVyZmFjaW5nIGJldHdlZW4gTU9ERUwgYW5kIFZJRVcqL1xuZnVuY3Rpb24gX2Rpc3BsYXlOZXh0VHJpYWwoKSB7XG4gICAgdmFyIG5leHRUcmlhbCA9IF9hbGxUcmlhbHNbX2FsbFRyaWFscy5sZW5ndGggLSAxXTsgLy9BbHdheXMgZ28gZnJvbSB0aGUgYmFja1xuICAgIGNvbnNvbGUubG9nKFwiRGlzcGxheWluZyBuZXh0IHRyaWFsOlwiLCBuZXh0VHJpYWwpO1xuXG4gICAgLyoqIEl0ZXJhdGUgb3ZlciBlYWNoIElWIGFuZCBzZXQgaXRzIHBvaW50ZXIgdG8gaXRzIHZhbHVlIGZvciB0aGF0IHRyaWFsICovXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuZXh0VHJpYWwubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGN1cl9pdiA9IG5leHRUcmlhbFtpXTtcbiAgICAgICAgX2ZpcmVJVlNldEZ1bmNXaXRoQXJncyhjdXJfaXYpO1xuXG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gX2ZpcmVJVlNldEZ1bmNXaXRoQXJncyhjdXJfaXYpIHtcblxuICAgIC8qKiBVc2luZyBhIEZVTkNUSU9OIHRvIHNldCB0aGUgZGlzcGxheSovXG4gICAgaWYgKCBzZXRGdW5jc1tjdXJfaXYuZGVzY3JpcHRpb25dICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIHNldEZ1bmNzW2N1cl9pdi5kZXNjcmlwdGlvbl0uYXBwbHkobnVsbCwgY3VyX2l2LnZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBzZXR0ZXIgZnVuY3Rpb24gc3VwcGxpZWQgYnk6IFwiICsgY3VyX2l2KTtcbiAgICB9XG59XG5cblxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBFeHBlcmltZW50IExpZmVjeWNsZSAtIFN0b3JlIFJlc3BvbnNlXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG5leHBvcnQgdmFyIF9yZXNwb25zZXMgPSBbXTtcbmV4cG9ydCBmdW5jdGlvbiBfc2V0UmVzcG9uc2VzKHJlc3BvbnNlcyl7XG4gICAgaWYgKHJlc3BvbnNlcy5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpe1xuICAgICAgICBfcmVzcG9uc2VzID0gcmVzcG9uc2VzO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcInJlcG9uc2VzIGNhbiBvbmx5IGJlIHNldCB0byBhbiBhcnJheVwiKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIF9zdG9yZVJlc3BvbnNlKG9wdGlvbnMpIHtcblxuICAgIHZhciBsYXN0VHJpYWwgPSBfYWxsVHJpYWxzLnBvcCgpO1xuXG4gICAgdmFyIHJlc3BvbnNlRm9ybWF0dGVkID0ge307XG5cbiAgICAvKiogU3RvcmUgdGhlIElWIC0+IFdyaXRlIG91dCBlYWNoIElWICgxIElWIHBlciBhcnJheSBlbGVtZW50KSB0byBhIGZpZWxkICovXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0VHJpYWwubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGl2TnVtID0gXCJJVlwiICsgaTtcblxuICAgICAgICAvL0lmIGEgcGFyc2VyIGlzIGRlZmluZWQgdXNlIGl0cyBvdXRwdXQgYXMgdGhlIHZhbHVlIG9mIHRoZSByZXNwb25zZVxuICAgICAgICBpZiAobGFzdFRyaWFsW2ldLnBhcnNlckZ1bmMgIT09IHVuZGVmaW5lZCAmJiAkLmlzRnVuY3Rpb24obGFzdFRyaWFsW2ldLnBhcnNlckZ1bmMpKXtcbiAgICAgICAgICAgIHZhciBzdGROYW1lID0gaXZOdW0gKyBcIl9cIiArIGxhc3RUcmlhbFtpXS5kZXNjcmlwdGlvbiArIFwiX3ZhbHVlXCI7XG5cbiAgICAgICAgICAgIHJlc3BvbnNlRm9ybWF0dGVkW3N0ZE5hbWVdID0gbGFzdFRyaWFsW2ldLnBhcnNlckZ1bmMuYXBwbHkodGhpcywgbGFzdFRyaWFsW2ldLnZhbHVlLmNvbmNhdChpKSApOyAvL1RoZSBhcmdzIGFyZSBwYXNzZWQgdG8gdGhlIHBhcnNlciBmdW5jIHdpdGggdGhlIGluZGV4IGFzIHRoZSBsYXN0IGFyZ1xuXG4gICAgICAgIH0gZWxzZSBpZiAobGFzdFRyaWFsW2ldLnZhbHVlLmNvbnN0cnVjdG9yID09PSBBcnJheSkgeyAvL0NvbnNpZGVyIHRoZXNlIHRvIGJlIGRlZmF1bHRzIGZvciBqYXZhc2NyaXB0IHByaW1pdGl2ZSB0eXBlc1xuXG4gICAgICAgICAgICAvKiogTWFudWFsbHkgd3JpdGUgb3V0IGVhY2ggYXJndW1lbnQgKGZyb20gYW4gYXJyYXkpIHRvIGEgZmllbGQgaW4gdGhlIG9iamVjdFxuICAgICAgICAgICAgICogIE9ubHkgYXBwZW5kIGEgbnVtYmVyIGlmIHRoZXJlIGFyZSA+MSBhcmd1bWVudHMgcGFzc2VkIGluICovXG5cbiAgICAgICAgICAgIGlmIChsYXN0VHJpYWxbaV0udmFsdWUubGVuZ3RoID4gMSl7XG5cbiAgICAgICAgICAgICAgICAvL0lmIHVzaW5nIGEgc2V0RnVuYyBmdW5jdGlvbiB3aXRoIG11bHRpcGxlIGFyZ3MgLT4gdXNlIHRoZSBhcmcgbmFtZXMgdG8gZGVzY3JpYmUgdGhlIHZhbHVlcyB3cml0dGVuIHRvIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgIHZhciBhcmdfbmFtZXMsIGFyZ19uYW1lO1xuICAgICAgICAgICAgICAgIGFyZ19uYW1lcyA9IGdldFBhcmFtTmFtZXMoIHNldEZ1bmNzW2xhc3RUcmlhbFtpXS5kZXNjcmlwdGlvbl0gKTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbGFzdFRyaWFsW2ldLnZhbHVlLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ19uYW1lID0gYXJnX25hbWVzW2pdO1xuICAgICAgICAgICAgICAgICAgICByZXNwb25zZUZvcm1hdHRlZFtpdk51bSArIFwiX1wiICsgbGFzdFRyaWFsW2ldLmRlc2NyaXB0aW9uICsgXCJfdmFsdWVfXCIgKyBhcmdfbmFtZSBdID0gIGxhc3RUcmlhbFtpXS52YWx1ZVtqXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2VGb3JtYXR0ZWRbIGl2TnVtICsgXCJfXCIgKyBsYXN0VHJpYWxbaV0uZGVzY3JpcHRpb24gKyBcIl92YWx1ZVwiIF0gPSAgbGFzdFRyaWFsW2ldLnZhbHVlWzBdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNwb25zZUZvcm1hdHRlZFtpdk51bSArIFwiX1wiICsgbGFzdFRyaWFsW2ldLmRlc2NyaXB0aW9uICsgXCJfdmFsdWVcIl0gPSBsYXN0VHJpYWxbaV0udmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogQWRkIGEgdmFsdWUgb2YgdGhlIDJhZmMgc3RkIChmb3IgdGhlIHJlbGV2YW50IElWKSAqL1xuICAgICAgICBpZiAobGFzdFRyaWFsW2ldLmhhc093blByb3BlcnR5KFwic3RkXzJBRkNcIikpIHtcbiAgICAgICAgICAgIHJlc3BvbnNlRm9ybWF0dGVkW1wic3RkXzJBRkNcIl0gPSBsYXN0VHJpYWxbaV0uc3RkXzJBRkM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogQ2hlY2sgdGhhdCBhIDJhZmMgc3RkIHZhbHVlIHdhcyBhZGRlZCAtIGlmIG5vdCB5b3Ugd2FudCB0byBhZGQgYSBudWxsIHZhbHVlIG9yIGl0IHdpbGwgZnVjayB1cCB0aGUgY3N2IHdyaXRlKi9cbiAgICAvLyBpZiAoIXJlc3BvbnNlRm9ybWF0dGVkLmhhc093blByb3BlcnR5KFwic3RkXzJBRkNcIikgJiYgZGlkU2V0MkFGQykge1xuICAgIC8vICAgICByZXNwb25zZUZvcm1hdHRlZFtcInN0ZF8yQUZDXCJdID0gXCJudWxsXCI7XG4gICAgLy8gfVxuICAgIFxuXG4gICAgLyoqIFN0b3JlIHRoZSBEViovXG4gICAgaWYgKG9wdGlvbnMgIT09IHVuZGVmaW5lZCAmJiBvcHRpb25zLmhhc093blByb3BlcnR5KFwiZHZfdmFsdWVcIikpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gX2R2TmFtZSB8fCBcInZhbHVlXCI7XG4gICAgICAgIHJlc3BvbnNlRm9ybWF0dGVkW1wiRFZfXCIrdmFsdWVdID0gb3B0aW9ucy5kdl92YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBhbGVydChcIk5vIERWIHdhcyBzdXBwbGllZCBieSB0aGUgY2FsbGluZyBjb2RlLiBUaGlzIGlzIGFuIGVycm9yLlwiKTtcbiAgICAgICAgcmVzcG9uc2VGb3JtYXR0ZWRbXCJEVl92YWx1ZVwiXSA9IFwiRVJST1IgLSBObyBEViBzdXBwbGllZFwiO1xuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKFwiU1RPUkVEIFRISVMgUkVTUE9OU0U6IFwiLCByZXNwb25zZUZvcm1hdHRlZCk7XG5cbiAgICBfcmVzcG9uc2VzLnB1c2gocmVzcG9uc2VGb3JtYXR0ZWQpO1xufVxuLy9cbi8vIC8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cbi8vIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRXhwZXJpbWVudCBMaWZlY3ljbGUgLSBPdXRwdXQgUmVzcG9uc2VzXG4vLyAvLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG4vL1xuLy8gVHJpYWxzLmZvcmNlT3V0cHV0UmVzcG9uc2VzID0gZnVuY3Rpb24oKXtcbi8vICAgICBjb25zb2xlLmxvZyhcIkZvcmNpbmcgb3V0cHV0IG9mIF9yZXNwb25zZXNcIik7XG4vLyAgICAgX291dHB1dFJlc3BvbnNlcyhfcmVzcG9uc2VzLCB0cnVlKTtcbi8vIH07XG4vL1xuLy9cbi8vIGZ1bmN0aW9uIF9vdXRwdXRSZXNwb25zZXMoYWxsUmVzcG9uc2VzLCBsb2cpIHtcbi8vXG4vLyAgICAgaWYgKGFsbFJlc3BvbnNlcy5sZW5ndGggPT09IDApIHJldHVybjtcbi8vXG4vLyAgICAgdmFyIGNzdlN0cmluZyA9IFwiXCI7XG4vL1xuLy8gICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWxsUmVzcG9uc2VzWzBdKTtcbi8vICAgICAvKipUaGVzZSBhcmUgYWxsIHRoZSBjb2x1bW5zIGluIHRoZSBvdXRwdXQqL1xuLy9cbi8vICAgICAvKiogTWFrZSB0aGUgaGVhZGVyKi9cbi8vICAgICBjc3ZTdHJpbmcgKz0gXCJQYXJ0aWNpcGFudCBOYW1lLCBQYXJ0aWNpcGFudCBOdW1iZXIsIFwiOyAvL01hbnVhbGx5IGFkZCBoZWFkZXJcbi8vICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbi8vICAgICAgICAgY3N2U3RyaW5nICs9IGtleXNbaV0gKyBcIixcIjtcbi8vICAgICB9XG4vLyAgICAgY3N2U3RyaW5nID0gY3N2U3RyaW5nLnNsaWNlKDAsIC0xKSArIFwiXFxuXCI7Ly9DdXQgdHJhaWxpbmcgY29tbWEgYW5kIHB1dCBpbiBhIG5ldyByb3cvbGluZVxuLy9cbi8vICAgICAvKiogRmlsbCB0aGUgZGF0YSAtIFRoaXMgdGltZSBpdHMgYW4gYXJyYXkgb2YgYXJyYXlzIG5vdCBhcnJheSBvZiBkaWN0aW9uYXJpZXMgKi9cbi8vICAgICBmb3IgKGkgPSAwOyBpIDwgYWxsUmVzcG9uc2VzLmxlbmd0aDsgaSsrKSB7XG4vL1xuLy8gICAgICAgICBjc3ZTdHJpbmcgKz0gX3BwdE5hbWUgKyBcIixcIiArIF9wcHRObyArIFwiLFwiOyAvL01hbmF1bGx5IGFkZCBjb250ZW50XG4vL1xuLy8gICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGtleXMubGVuZ3RoOyBqKyspIHsgLy9JdGVyYXRlIG92ZXIgdGhlIGtleXMgdG8gZ2V0IHRlaCB2YWx1ZXNcbi8vXG4vLyAgICAgICAgICAgICB2YXIgdmFsdWUgPSBhbGxSZXNwb25zZXNbaV1ba2V5c1tqXV07XG4vLyAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIndyaXRpbmcgdGhpcyByYXcgdmFsdWUgXCIsIHZhbHVlLCBrZXlzW2pdKTtcbi8vICAgICAgICAgICAgIC8vdmFsdWUgPSBjaGVja1JldHVyblByb3BzKCB2YWx1ZSwgdHJ1ZSApIHx8IHZhbHVlOyAgLy9QYXJzZSBvdXQgcmVsZXZhbnQgb2JqZWN0IGZpZWxkc1xuLy8gICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIkFmZXIgaXQgd2FzIHBhcnNlZDpcIiwgdmFsdWUsIFwiXFxuKioqKioqKioqXCIpO1xuLy8gICAgICAgICAgICAgY3N2U3RyaW5nICs9IHZhbHVlICsgXCIsXCI7XG4vLyAgICAgICAgIH1cbi8vXG4vLyAgICAgICAgIGNzdlN0cmluZyA9IGNzdlN0cmluZy5zbGljZSgwLCAtMSkgKyBcIlxcblwiOyAvL0N1dCB0cmFpbGluZyBjb21tYSBhbmQgcHV0IGluIGEgbmV3IHJvdy9saW5lXG4vLyAgICAgfVxuLy9cbi8vICAgICBpZiAobG9nKSB7XG4vLyAgICAgICAgIGNvbnNvbGUubG9nKGNzdlN0cmluZyk7XG4vLyAgICAgfVxuLy9cbi8vICAgICAvKiogSGVscCBvdXQgYSBtYWNoaW5lIHRvZGF5Ki9cbi8vICAgICB2YXIgY3N2Q29udGVudCA9IGVuY29kZVVSSShcImRhdGE6dGV4dC9jc3Y7Y2hhcnNldD11dGYtOCxcIiArIGNzdlN0cmluZyk7XG4vLyAgICAgdmFyIGEgPSBjcmVhdGVEb3dubG9hZExpbmsoXCJyZXN1bHRzIChcIiArIF9wcHROYW1lICsgXCIsXCIgKyBfcHB0Tm8udG9TdHJpbmcoKSArIFwiKS5jc3ZcIiwgY3N2Q29udGVudCk7XG4vLyAgICAgYS5pbm5lckhUTUwgPSBcIjxoND5DbGljayB0byBkb3dubG9hZCByZXN1bHRzITwvaDQ+XCI7XG4vLyAgICAgYS5jbGFzc05hbWUgKz0gXCIgcmVzdWx0cy1kb3dubG9hZFwiO1xuLy8gICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYSk7XG4vLyAgICAgYS5jbGljaygpO1xuLy8gfVxuXG5cbiIsIlxuaW1wb3J0IHsgVHJpYWxzLF9hbGxUcmlhbHMsIF9zZXRBbGxUcmlhbHMsIF9kaWRCdWlsZFRyaWFsc30gZnJvbSBcIi4vVHJpYWxzLmpzXCI7XG5pbXBvcnQgeyBfcmVzcG9uc2VzLCBfc2V0UmVzcG9uc2VzIH0gZnJvbSBcIi4vUnVuRXhwZXJpbWVudC5qc1wiO1xuXG5cbnZhciBTYXZlcyA9IHt9O1xuXG5TYXZlcy5wYXJzZVRyaWFsc0ZvclNhdmluZyA9IHVuZGVmaW5lZDsgLy9pbnRlcmZhY2UgaXMgKF9hbGxUcmlhbHMpXG5TYXZlcy5wYXJzZVJlc3BvbnNlc0ZvclNhdmluZyA9IHVuZGVmaW5lZDsgLy9pbnRlcmZhY2UgaXMgKF9yZXNwb25zZXMpXG5TYXZlcy51bnBhcnNlU2F2ZWRUcmlhbHMgPSB1bmRlZmluZWQ7XG5TYXZlcy51bnBhcnNlU2F2ZWRSZXNwb25zZXMgPSB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGVycm9yQ2hlY2tTYXZpbmdQYXJzZXJzKCl7XG4gICAgaWYgKFNhdmVzLnBhcnNlVHJpYWxzRm9yU2F2aW5nID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCByZXN0b3JlIHRyaWFscyB3aXRob3V0IHBhcnNpbmcgZnVuY3Rpb25cIik7XG4gICAgaWYgKFNhdmVzLnBhcnNlUmVzcG9uc2VzRm9yU2F2aW5nID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCByZXN0b3JlIF9yZXNwb25zZXMgd2l0aG91dCBwYXJzaW5nIGZ1bmN0aW9uXCIpO1xuICAgIGlmIChTYXZlcy51bnBhcnNlU2F2ZWRUcmlhbHMgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHJlc3RvcmUgdHJpYWxzIHdpdGhvdXQgVU5wYXJzaW5nIGZ1bmN0aW9uXCIpO1xuICAgIGlmIChTYXZlcy51bnBhcnNlU2F2ZWRSZXNwb25zZXMgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHJlc3RvcmUgX3Jlc3BvbnNlcyB3aXRob3V0IFVOcGFyc2luZyBmdW5jdGlvblwiKTtcbn1cblxuXG5TYXZlcy5jbGVhclNhdmVzID0gZnVuY3Rpb24oKXtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcImV4cGVyaW1lbnRKU3NhdmVzXCIpOy8vLy8vXG59O1xuXG5cblNhdmVzLnNhdmVCdWlsdFRyaWFsc0FuZFJlc3BvbnNlcyA9IGZ1bmN0aW9uKCkge1xuICAgIFxuICAgIGVycm9yQ2hlY2tTYXZpbmdQYXJzZXJzKCk7XG5cbiAgICBpZiAodHlwZW9mKFN0b3JhZ2UpICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cbiAgICAgICAgLy8gbG9jYWxTdG9yYWdlLmV4cGVyaW1lbnRKU3NhdmVzID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIC8vUGFyc2UgeW91ciB0cmlhbHMsIHVzaW5nIHRoZSBjdXN0b20gc2VyaWFsaXplci4uXG4gICAgICAgIHZhciB0cmlhbHNGb3JTYXZpbmcgPSBTYXZlcy5wYXJzZVRyaWFsc0ZvclNhdmluZyhfYWxsVHJpYWxzKTtcbiAgICAgICAgdmFyIHJlc3BvbnNlc0ZvclNhdmluZyA9IFNhdmVzLnBhcnNlUmVzcG9uc2VzRm9yU2F2aW5nKF9yZXNwb25zZXMpO1xuXG4gICAgICAgIC8vSlNPTmlmeSB0aGUgdHJpYWxzIGFuZCBfcmVzcG9uc2VzXG4gICAgICAgIHZhciBleHBlcmltZW50SlNzYXZlcyA9IHt9O1xuICAgICAgICBleHBlcmltZW50SlNzYXZlc1tcInRyaWFsc1wiXSA9IHRyaWFsc0ZvclNhdmluZztcbiAgICAgICAgZXhwZXJpbWVudEpTc2F2ZXNbXCJyZXNwb25zZXNcIl0gPSByZXNwb25zZXNGb3JTYXZpbmc7XG5cbiAgICAgICAgdmFyIG1zZyA9IHByb21wdChcIkFkZCBhIG1lc3NhZ2UgdG8gdGhpcyBzYXZlIVwiKTtcblxuICAgICAgICBpZiAobXNnID09PSBudWxsKXtcbiAgICAgICAgICAgIGFsZXJ0KFwiVHJpYWxzIHdpbGwgbm90IGJlIHNhdmVkXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRhdGVLZXkgPSAobmV3IERhdGUoKSkudG9VVENTdHJpbmcoKTsgLy9WZXJ5IGNsZWFyIGRhdGVcblxuICAgICAgICAvL01ha2UgYSBuZXcgZGljdGlvbmFyeSBvciBnZXQgdGhlIG9sZCBvbmVcbiAgICAgICAgdmFyIGtleWVkX2J5X2RhdGVzID0gKGxvY2FsU3RvcmFnZS5leHBlcmltZW50SlNzYXZlcyA9PT0gdW5kZWZpbmVkKSA/IHt9IDogSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZXhwZXJpbWVudEpTc2F2ZXMpO1xuXG4gICAgICAgIC8vc2F2ZSB0byBpdFxuICAgICAgICBrZXllZF9ieV9kYXRlc1ttc2cgKyBcIiAtIFwiICtkYXRlS2V5XSA9IGV4cGVyaW1lbnRKU3NhdmVzO1xuXG4gICAgICAgIC8vc2VyaWFsaXplIVxuICAgICAgICBsb2NhbFN0b3JhZ2UuZXhwZXJpbWVudEpTc2F2ZXMgPSBKU09OLnN0cmluZ2lmeShrZXllZF9ieV9kYXRlcyk7XG5cbiAgICAgICAgY29uc29sZS5sb2coXCJTYXZlZCBUcmlhbHNcIiwgSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZXhwZXJpbWVudEpTc2F2ZXMpKTtcbiAgICB9XG59O1xuXG5cblNhdmVzLnNldFNhdmVkVHJpYWxzQW5kUmVzcG9uc2VzID0gZnVuY3Rpb24oKXtcbiAgICBlcnJvckNoZWNrU2F2aW5nUGFyc2VycygpO1xuXG4gICAgdmFyIGFsbF9zYXZlcyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmV4cGVyaW1lbnRKU3NhdmVzKTtcblxuICAgIGNvbnNvbGUubG9nKFwiYWxsIHNhdmVzKyBcIiwgYWxsX3NhdmVzKTtcblxuXG4gICAgdmFyIHNlbGVjdF9iaXRzID0gX2NyZWF0ZURyb3BEb3duU2VsZWN0KGFsbF9zYXZlcyk7XG4gICAgc2VsZWN0X2JpdHMuYnV0dG9uLmNsaWNrKGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgdmFyIHRlbXBfdXNpbmcgPSBzZWxlY3RfYml0cy5zZWxlY3QuZmluZChcIjpzZWxlY3RlZFwiKS50ZXh0KCk7XG5cbiAgICAgICAgdGVtcF91c2luZyA9IGFsbF9zYXZlc1t0ZW1wX3VzaW5nXTtcblxuICAgICAgICBfc2V0QWxsVHJpYWxzKCBTYXZlcy51bnBhcnNlU2F2ZWRUcmlhbHModGVtcF91c2luZ1tcInRyaWFsc1wiXSkgKTtcbiAgICAgICAgX3NldFJlc3BvbnNlcyggU2F2ZXMudW5wYXJzZVNhdmVkUmVzcG9uc2VzKHRlbXBfdXNpbmdbXCJyZXNwb25zZXNcIl0pICk7XG4gICAgICAgIGlmIChfcmVzcG9uc2VzID09PSB1bmRlZmluZWQgfHwgX3Jlc3BvbnNlcyA9PT0gbnVsbCkgX3NldFJlc3BvbnNlcyggW10gKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhcInJlc3RvcmVkIGFsbCB0cmlhbHM6IFwiLCBfYWxsVHJpYWxzKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJyZXN0b3JlZCBhbGwgX3Jlc3BvbnNlczogXCIsIF9yZXNwb25zZXMpO1xuXG4gICAgICAgIFRyaWFscy5ydW5OZXh0VHJpYWwoKTtcblxuICAgICAgICAvL1JlbW92ZSBzZWxlY3QgZnJvbSBkb21cbiAgICAgICAgc2VsZWN0X2JpdHMud3JhcC5yZW1vdmUoKTtcbiAgICB9KTtcblxuICAgIHNlbGVjdF9iaXRzLmJ1dHRvbl9jbGVhci5jbGljayhmdW5jdGlvbigpe1xuXG4gICAgICAgIGlmICh3aW5kb3cuY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgYWxsIHNhdmVkIGV4cGVyaW1lbnRzP1wiKSl7XG4gICAgICAgICAgICBTYXZlcy5jbGVhclNhdmVzKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvL1JlbW92ZSBzZWxlY3QgZnJvbSBkb21cbiAgICAgICAgc2VsZWN0X2JpdHMud3JhcC5yZW1vdmUoKTtcbiAgICB9KTtcblxufTtcblxuXG5mdW5jdGlvbiBfY3JlYXRlRHJvcERvd25TZWxlY3QoYWxsX3NhdmVzKXtcblxuICAgIHZhciBkaXYgPSAkKFwiPGRpdj5cIiwge1xuICAgICAgICBpZDogXCJzYXZlZF9pbmZvXCJcbiAgICB9KTtcblxuICAgIC8vTWFrZSBhIHNlbGVjdCB0byBjaG9vc2UgZnJvbSB0aGUgc2F2ZXNcbiAgICB2YXIgc2VsID0gJChcIjxzZWxlY3Q+XCIpO1xuICAgIE9iamVjdC5rZXlzKGFsbF9zYXZlcykubWFwKGZ1bmN0aW9uKGVsZW0sIGksIGFsbCl7XG4gICAgICAgIC8vVXNlIHRoZSBpbmRleCBhcyB0aGUga2V5XG4gICAgICAgIHNlbC5hcHBlbmQoJChcIjxvcHRpb24+XCIpLmF0dHIoXCJ2YWx1ZVwiLGkpLnRleHQoZWxlbSkpO1xuICAgIH0pO1xuXG5cbiAgICAvL0J1dHRvbiAtIG5vIGZ1bmN0aW9uYWxpdHkgaGVyZSwganVzdCB2aWV3XG4gICAgdmFyIGIgPSAkKFwiPGJ1dHRvbj5cIikudGV4dChcIkNob29zZVwiKTtcbiAgICB2YXIgYl9jbGVhciA9ICQoXCI8YnV0dG9uPlwiKS50ZXh0KFwiQ2xlYXJcIik7XG5cbiAgICBkaXYuYXBwZW5kKHNlbCk7XG4gICAgZGl2LmFwcGVuZCgkKFwiPGJyPlwiKSk7XG4gICAgZGl2LmFwcGVuZChiKTtcbiAgICBkaXYuYXBwZW5kKGJfY2xlYXIpO1xuICAgICQoZG9jdW1lbnQuYm9keSkuYXBwZW5kKGRpdik7XG5cbiAgICBkaXYuY3NzKHtcbiAgICAgICAgcG9zaXRpb246IFwiZml4ZWRcIixcbiAgICAgICAgdG9wOiBcIjQ1dmhcIixcbiAgICAgICAgbGVmdDogXCIyNXZ3XCIsXG4gICAgICAgIHdpZHRoOiBcIjUwdndcIixcbiAgICAgICAgaGVpZ2h0OiBcIjV2aFwiLFxuICAgICAgICBiYWNrZ3JvdW5kOiBcIndoaXRlXCIsXG4gICAgICAgIGJvcmRlcjogXCIydndcIixcbiAgICAgICAgXCJ0ZXh0LWFsaWduXCI6IFwiY2VudGVyXCJcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHNlbGVjdDogc2VsLFxuICAgICAgICBidXR0b246IGIsXG4gICAgICAgIGJ1dHRvbl9jbGVhcjogYl9jbGVhcixcbiAgICAgICAgd3JhcDogZGl2XG4gICAgfTtcbn1cblxuXG5leHBvcnQgeyBTYXZlcyB9OyIsIi8vT3JkZXIgb2YgaW1wb3J0cyBpcyBpbXBvcnRhbnRcblxuLy8gSW1wb3J0IFRyaWFscyBhbmQgZXh0ZW5kIGl0XG5pbXBvcnQgeyBUcmlhbHMgfSBmcm9tICBcIi4vVHJpYWxzLmpzXCI7IC8vTmVlZHMgLi8gdG8gdHJlYXQgaXQgYXMgYW4gaW50ZXJuYWwgKG5vdCBleHRlcm5hbCBkZXBlbmRlbmN5KVxuaW1wb3J0IFwiLi9SdW5FeHBlcmltZW50LmpzXCI7ICAgICAgICAgICAvLyBFeHRlbmRzIHRoZSBmdW5jdGlvbmFsaXR5IG9mIHRoZSBUcmlhbHMgb2JqZWN0XG5pbXBvcnQgXCIuL091dHB1dFJlc3BvbnNlcy5qc1wiO1xuaW1wb3J0IFwiLi9HZXRQcHRJbmZvLmpzXCI7XG4vL2ltcG9ydCBcIi4vMkFGQy5qc1wiO1xuXG5pbXBvcnQgeyBQYXVzZSB9IGZyb20gIFwiLi9JbnRlcnN0aW11bHVzUGF1c2UuanNcIjtcbmltcG9ydCB7IFNhdmVzIH0gZnJvbSBcIi4vU2F2ZXMuanNcIjtcblxuLy9UaGVzZSBhcmUgdGhlIGZpZWxkcyBvZiBFeHBlcmltZW50SlNcbmV4cG9ydCB7IFRyaWFscyB9O1xuZXhwb3J0IHsgUGF1c2UgfTtcbmV4cG9ydCB7IFNhdmVzIH07Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFPLFNBQVMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQzs7SUFFOUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNkLENBQUMsQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDO0lBQ3BCLENBQUMsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDOztJQUV0QixPQUFPLENBQUMsQ0FBQzs7O0FDUGI7OztBQUdBLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFlBQVk7SUFDbEMsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsV0FBVyxDQUFDOzs7SUFHNUQsT0FBTyxDQUFDLEtBQUssWUFBWSxFQUFFOzs7UUFHdkIsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLFlBQVksQ0FBQyxDQUFDO1FBQ3ZELFlBQVksSUFBSSxDQUFDLENBQUM7OztRQUdsQixjQUFjLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLGNBQWMsQ0FBQztLQUN0QztDQUNKOztBQ2pCRDs7OztBQUlBLEFBQU8sQUFFTjs7QUFFRCxBQUFPLFNBQVMsYUFBYSxDQUFDLEVBQUUsQ0FBQzs7SUFFN0IsSUFBSSxjQUFjLEdBQUcsa0NBQWtDLENBQUM7SUFDeEQsSUFBSSxjQUFjLEdBQUcsWUFBWSxDQUFDO0lBQ2xDLFNBQVMsY0FBYyxDQUFDLElBQUksRUFBRTtRQUMxQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN4RCxJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDekYsR0FBRyxNQUFNLEtBQUssSUFBSTtZQUNkLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEIsT0FBTyxNQUFNLENBQUM7S0FDakI7O0lBRUQsT0FBTyxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUM7OztBQ3JCOUI7O0dBRUcsQUFDSCxBQUFPOztBQ0hQOztHQUVHLEFBRUgsQUFDQSxBQUNBLEFBQ0E7O0FDUEE7Ozs7QUFJQSxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDaEIsQUFBTyxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDcEIsQUFBTyxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7O0FBRXpCLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQzs7O0FBR25CLE1BQU0sQ0FBQyxXQUFXLEdBQUcsVUFBVSxNQUFNLEVBQUUsTUFBTSxFQUFFO0lBQzNDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0NBQzNDLENBQUM7O0FBRUYsTUFBTSxDQUFDLFlBQVksR0FBRyxTQUFTLE1BQU0sRUFBRSxPQUFPLEVBQUU7OztJQUc1QyxhQUFhLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQzs7O0lBR3ZDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDaEMsQ0FBQzs7QUFFRixBQUFPLElBQUksT0FBTyxDQUFDO0FBQ25CLE1BQU0sQ0FBQyxTQUFTLEdBQUcsU0FBUyxNQUFNLENBQUM7SUFDL0IsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLENBQUM7UUFDM0Isb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDN0IsT0FBTyxHQUFHLE1BQU0sQ0FBQztLQUNwQixNQUFNO1FBQ0gsT0FBTyxJQUFJLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO0tBQ25FO0NBQ0osQ0FBQzs7Ozs7Ozs7O0FBU0YsTUFBTSxDQUFDLG9CQUFvQixHQUFHLFVBQVUsTUFBTSxFQUFFLFVBQVUsRUFBRTtJQUN4RCxhQUFhLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztDQUNuRCxDQUFDOzs7QUFHRixNQUFNLENBQUMsVUFBVSxHQUFHLFVBQVUsUUFBUSxFQUFFO0lBQ3BDLFVBQVUsR0FBRyxRQUFRLENBQUM7Q0FDekIsQ0FBQzs7Ozs7Ozs7QUFRRixBQUFPLFNBQVMsYUFBYSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFO0lBQ3ZELG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzdCLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2hDLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQzdCLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7S0FDcEI7O0lBRUQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLFFBQVEsQ0FBQztDQUNyQzs7O0FBR0QsU0FBUyxXQUFXLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQztJQUNqQyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDO0NBQzlCOzs7Ozs7QUFNRCxJQUFJLFlBQVksR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN0QixBQUFPLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUMzQixBQUFPLFNBQVMsYUFBYSxDQUFDLFNBQVMsQ0FBQztJQUNwQyxJQUFJLFNBQVMsQ0FBQyxXQUFXLEtBQUssS0FBSyxDQUFDO1FBQ2hDLFVBQVUsR0FBRyxTQUFTLENBQUM7S0FDMUI7Q0FDSjs7QUFFRCxNQUFNLENBQUMsU0FBUyxHQUFHLFVBQVU7SUFDekIsSUFBSSxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUN0QixPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQztLQUN6QztDQUNKLENBQUM7O0FBRUYsQUFBTyxJQUFJLGVBQWUsR0FBRyxLQUFLLENBQUM7QUFDbkMsU0FBUyxZQUFZLENBQUMsV0FBVyxFQUFFOztJQUUvQixPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLEdBQUcsQ0FBQyxDQUFDOztJQUV2QyxJQUFJLGFBQWEsRUFBRSxJQUFJLENBQUM7O0lBRXhCLEtBQUssSUFBSSxFQUFFLElBQUksR0FBRyxFQUFFOztRQUVoQixJQUFJLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLEtBQUssU0FBUyxHQUFHLE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDcEYsSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLFNBQVMsRUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxHQUFHLEVBQUUsQ0FBQyxDQUFDOztRQUU3RixPQUFPLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLENBQUM7O1FBRWxHLElBQUksUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLFNBQVMsRUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixHQUFHLEVBQUUsQ0FBQyxDQUFDOztRQUVqRixJQUFJLEdBQUcsRUFBRSxDQUFDOztRQUVWLElBQUksR0FBRyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDOztRQUUxRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFOztZQUUxQixhQUFhLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDOztZQUVqQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUU7Ozs7Z0JBSTVDLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztnQkFDcEIsVUFBVSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7Z0JBQzVCLFVBQVUsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O2dCQUdyQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLEVBQUU7b0JBQ3BDLFVBQVUsQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQztpQkFDMUM7OztnQkFHRCxJQUFJLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxjQUFjLENBQUMsOEJBQThCLENBQUMsRUFBRTtvQkFDeEQsVUFBVSxDQUFDLDRCQUE0QixHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyw0QkFBNEIsQ0FBQztpQkFDbEY7OztnQkFHRCxJQUFJLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLEtBQUssU0FBUyxFQUFFO29CQUNsQyxVQUFVLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUM7aUJBQzlDOztnQkFFRCxJQUFJLGtCQUFrQixDQUFDOztnQkFFdkIsSUFBSSxhQUFhLEtBQUssU0FBUyxFQUFFOztvQkFFN0Isa0JBQWtCLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQzs7aUJBRXJDLE1BQU0sSUFBSSxhQUFhLENBQUMsV0FBVyxLQUFLLEtBQUssRUFBRTs7b0JBRTVDLGtCQUFrQixHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2lCQUMzRDs7Z0JBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2FBQ2pDO1NBQ0o7OztRQUdELFVBQVUsR0FBRyxJQUFJLENBQUM7S0FDckI7Ozs7SUFJRCxJQUFJLE9BQU8sR0FBRyxVQUFVLENBQUM7SUFDekIsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNWLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQzFCLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQ2xDO0lBQ0QsVUFBVSxHQUFHLElBQUksQ0FBQzs7O0lBR2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxNQUFNLEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNuRixJQUFJLFdBQVcsQ0FBQztRQUNaLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN6QixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ3RDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7YUFDbkM7WUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7U0FDbEQ7S0FDSjs7SUFFRCxJQUFJLGNBQWMsTUFBTSxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7OztJQUc3QyxZQUFZLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztJQUNqQyxlQUFlLEdBQUcsSUFBSSxDQUFDO0NBQzFCOzs7Ozs7Ozs7QUFTRCxNQUFNLENBQUMsZUFBZSxHQUFHLFVBQVUsV0FBVyxFQUFFO0lBQzVDLFlBQVksRUFBRSxDQUFDLFdBQVcsS0FBSyxTQUFTLENBQUMsR0FBRyxLQUFLLEdBQUcsV0FBVyxFQUFFLENBQUM7Q0FDckUsQ0FBQzs7O0FBR0YsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDO0FBQzFCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsU0FBUyxhQUFhLENBQUM7SUFDdkMsSUFBSSxNQUFNLENBQUMsYUFBYSxDQUFDLEtBQUssU0FBUyxDQUFDO1FBQ3BDLGNBQWMsSUFBSSxhQUFhLENBQUM7S0FDbkMsTUFBTTtRQUNILE1BQU0sSUFBSSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztLQUMvRDtDQUNKLENBQUM7Ozs7O0FBS0YsU0FBUyxvQkFBb0IsQ0FBQyxNQUFNLENBQUM7O0lBRWpDLElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxDQUFDO1FBQzNCLE1BQU0sSUFBSSxLQUFLLENBQUMsMkRBQTJELENBQUMsQ0FBQztLQUNoRjs7SUFFRCxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDM0IsTUFBTSxJQUFJLEtBQUssQ0FBQyx1REFBdUQsR0FBRyxNQUFNLENBQUMsQ0FBQztLQUNyRjtDQUNKLEFBRUQ7O0FDMU5BOzs7QUFHQSxBQUVBOzs7O0FBSUEsQUFBTyxJQUFJLFFBQVEsR0FBRyxhQUFhLENBQUM7QUFDcEMsQUFBTyxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7O0FBRXRCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsWUFBWTs7SUFFNUIsT0FBTyxJQUFJLEVBQUU7UUFDVCxRQUFRLEdBQUcsTUFBTSxDQUFDLHdCQUF3QixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDbkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDbEMsSUFBSSxRQUFRLEtBQUssRUFBRSxJQUFJLFFBQVEsS0FBSyxJQUFJLEVBQUU7WUFDdEMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUM7U0FDakMsTUFBTTtZQUNILE1BQU07U0FDVDtLQUNKOztJQUVELE9BQU8sSUFBSSxFQUFFO1FBQ1QsTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsc0NBQXNDLENBQUMsQ0FBQyxDQUFDO1FBQ2xFLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdEMsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDZixLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQztTQUNsRCxNQUFNO1lBQ0gsTUFBTTtTQUNUO0tBQ0o7O0lBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxDQUFDLENBQUM7Q0FDakY7O0FDN0JEOzs7O0FBSUEsTUFBTSxDQUFDLG9CQUFvQixHQUFHLFVBQVU7SUFDcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0lBQzVDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztDQUN0QyxDQUFDOzs7QUFHRixBQUFPLFNBQVMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRTs7SUFFaEQsSUFBSSxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxPQUFPOztJQUV0QyxJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7O0lBRW5CLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7SUFJeEMsU0FBUyxJQUFJLHdDQUF3QyxDQUFDO0lBQ3RELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ2xDLFNBQVMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0tBQzlCO0lBQ0QsU0FBUyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDOzs7SUFHMUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFOztRQUV0QyxTQUFTLElBQUksUUFBUSxHQUFHLEdBQUcsR0FBRyxNQUFNLEdBQUcsR0FBRyxDQUFDOztRQUUzQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTs7WUFFbEMsSUFBSSxLQUFLLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7O1lBSXJDLFNBQVMsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDO1NBQzVCOztRQUVELFNBQVMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztLQUM3Qzs7SUFFRCxJQUFJLEdBQUcsRUFBRTtRQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDMUI7OztJQUdELElBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQyw4QkFBOEIsR0FBRyxTQUFTLENBQUMsQ0FBQztJQUN2RSxJQUFJLENBQUMsR0FBRyxrQkFBa0IsQ0FBQyxXQUFXLEdBQUcsUUFBUSxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLEdBQUcsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ25HLENBQUMsQ0FBQyxTQUFTLEdBQUcscUNBQXFDLENBQUM7SUFDcEQsQ0FBQyxDQUFDLFNBQVMsSUFBSSxtQkFBbUIsQ0FBQztJQUNuQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM3QixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7Q0FDYjs7QUN4REQ7Ozs7O0FBS0EsU0FBUyx5QkFBeUIsRUFBRTtJQUNoQyxJQUFJLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzdDLFFBQVEsQ0FBQyxFQUFFLEdBQUcscUJBQXFCLENBQUM7O0lBRXBDLElBQUksR0FBRyxHQUFHO1FBQ04sUUFBUSxFQUFFLE9BQU87UUFDakIsSUFBSSxFQUFFLENBQUM7UUFDUCxHQUFHLEVBQUUsQ0FBQztRQUNOLEtBQUssRUFBRSxPQUFPO1FBQ2QsTUFBTSxFQUFFLE9BQU87UUFDZixVQUFVLEVBQUUsT0FBTztRQUNuQixPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOztJQUVGLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDNUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDakMsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQzlDOzs7OztJQUtELE9BQU8sUUFBUSxDQUFDOztDQUVuQjs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQkQsSUFBSSxTQUFTLEdBQUcseUJBQXlCLEVBQUUsQ0FBQztBQUM1QyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7Ozs7OztBQU9yQyxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7O0FBRWYsS0FBSyxDQUFDLHNCQUFzQixHQUFHLFVBQVUsUUFBUSxFQUFFO0lBQy9DLE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTSxFQUFFO1FBQzFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZO1lBQzNDLE9BQU8sRUFBRSxDQUFDO1NBQ2IsQ0FBQyxDQUFDO0tBQ04sQ0FBQyxDQUFDO0NBQ04sQ0FBQzs7QUFFRixJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUM7QUFDakIsS0FBSyxDQUFDLFlBQVksR0FBRyxVQUFVLEtBQUssRUFBRTtJQUNsQyxJQUFJLEtBQUssS0FBSyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxFQUFFO1FBQy9CLE1BQU0sR0FBRyxLQUFLLENBQUM7S0FDbEIsTUFBTTtRQUNILE1BQU0sa0NBQWtDLENBQUM7S0FDNUM7Q0FDSixDQUFDOztBQUVGLEFBQU8sSUFBSSx5QkFBeUIsR0FBRyxJQUFJLENBQUM7QUFDNUMsS0FBSyxDQUFDLDJCQUEyQixHQUFHLFNBQVMsS0FBSyxDQUFDO0lBQy9DLElBQUksUUFBUSxLQUFLLEtBQUssU0FBUyxDQUFDO1FBQzVCLHlCQUF5QixHQUFHLEtBQUssQ0FBQztLQUNyQztDQUNKLENBQUM7Ozs7O0FBS0YsSUFBSSxxQkFBcUIsR0FBRyxLQUFLLENBQUM7QUFDbEMsQUFBTyxTQUFTLG1CQUFtQixDQUFDLFFBQVEsRUFBRTs7SUFFMUMsUUFBUSxHQUFHLFFBQVEsS0FBSyxTQUFTLEdBQUcsTUFBTSxHQUFHLFFBQVEsQ0FBQzs7SUFFdEQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFVLE9BQU8sRUFBRSxNQUFNLEVBQUU7O1FBRTFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25DLHFCQUFxQixHQUFHLElBQUksQ0FBQztRQUM3QixzQkFBc0IsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7O1FBRzlCLFVBQVUsQ0FBQyxZQUFZOztZQUVuQix1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNuQyxxQkFBcUIsR0FBRyxLQUFLLENBQUM7WUFDOUIsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7O1lBRTdCLE9BQU8sRUFBRSxDQUFDO1NBQ2IsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUNoQixDQUFDLENBQUM7Q0FDTjs7O0FBR0QsU0FBUyx1QkFBdUIsQ0FBQyxRQUFRLENBQUM7SUFDdEMsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0NBQ25DOztBQUVELFNBQVMsdUJBQXVCLENBQUMsUUFBUSxDQUFDO0lBQ3RDLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztDQUNwQyxBQUVEOztBQ3ZIQTs7Ozs7Ozs7OztBQVVBLEFBQ0EsQUFDQSxBQUVBLEFBSUE7Ozs7O0FBS0EsQUFBTyxTQUFTLHNCQUFzQixDQUFDLEtBQUssQ0FBQztJQUN6QyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxTQUFTLENBQUM7UUFDNUIsbUJBQW1CLEdBQUcsS0FBSyxDQUFDO0tBQy9CLE1BQU07UUFDSCxNQUFNLElBQUksS0FBSyxDQUFDLHVEQUF1RCxDQUFDLENBQUM7S0FDNUU7Q0FDSjs7QUFFRCxBQUFPLElBQUksbUJBQW1CLEdBQUcsSUFBSSxDQUFDO0FBQ3RDLE1BQU0sQ0FBQyxZQUFZLEdBQUcsVUFBVSxRQUFRLEVBQUU7O0lBRXRDLElBQUksQ0FBQyxlQUFlLENBQUM7UUFDakIsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1FBQ3hELE9BQU87S0FDVjs7SUFFRCxJQUFJLG1CQUFtQixFQUFFOzs7O1FBSXJCLElBQUkscUJBQXFCLEVBQUUsSUFBSSxZQUFZLEtBQUssSUFBSSxFQUFFO1lBQ2xELFlBQVksRUFBRSxDQUFDO1NBQ2xCOztRQUVELElBQUkseUJBQXlCLEVBQUU7WUFDM0IsbUJBQW1CLEVBQUUsQ0FBQztTQUN6Qjs7UUFFRCxJQUFJLFFBQVEsS0FBSyxTQUFTLElBQUksUUFBUSxDQUFDLGNBQWMsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRTtZQUMxRyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDNUI7O1FBRUQsSUFBSSxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUN2QixpQkFBaUIsRUFBRSxDQUFDOzs7OztZQUtwQixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsTUFBTSxFQUFFLG9CQUFvQixDQUFDLENBQUM7U0FDdEUsTUFBTTs7O1lBR0gsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7WUFFdEMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7O1lBRTdCLEtBQUssT0FBTyxZQUFZLEtBQUssVUFBVSxFQUFFLFlBQVksRUFBRSxDQUFDOztTQUUzRDtLQUNKOztDQUVKLENBQUM7Ozs7OztBQU1GLElBQUksa0JBQWtCLEdBQUcsS0FBSyxDQUFDO0FBQy9CLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQztBQUN4QixNQUFNLENBQUMsY0FBYyxHQUFHLFVBQVUsS0FBSyxFQUFFO0lBQ3JDLElBQUksT0FBTyxLQUFLLEtBQUssVUFBVSxDQUFDO1FBQzVCLFlBQVksR0FBRyxLQUFLLENBQUM7S0FDeEIsUUFBUTtRQUNMLE1BQU0sSUFBSSxLQUFLLENBQUMsb0RBQW9ELENBQUMsQ0FBQztLQUN6RTtDQUNKLENBQUM7O0FBRUYsU0FBUyxxQkFBcUIsR0FBRztJQUM3QixJQUFJLGtCQUFrQixFQUFFLE9BQU8sS0FBSyxDQUFDOzs7SUFHckMsSUFBSSxVQUFVLENBQUMsTUFBTSxJQUFJLFVBQVUsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDL0Ysa0JBQWtCLEdBQUcsSUFBSSxDQUFDO1FBQzFCLE9BQU8sSUFBSSxDQUFDO0tBQ2Y7Q0FDSjs7Ozs7QUFLRCxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUM7QUFDeEIsTUFBTSxDQUFDLGNBQWMsR0FBRyxVQUFVLEtBQUssRUFBRTtJQUNyQyxJQUFJLE9BQU8sS0FBSyxLQUFLLFVBQVUsQ0FBQztRQUM1QixZQUFZLEdBQUcsS0FBSyxDQUFDO0tBQ3hCLFFBQVE7UUFDTCxNQUFNLElBQUksS0FBSyxDQUFDLG9EQUFvRCxDQUFDLENBQUM7S0FDekU7Q0FDSixDQUFDOzs7Ozs7OztBQVFGLFNBQVMsaUJBQWlCLEdBQUc7SUFDekIsSUFBSSxTQUFTLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDbEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxTQUFTLENBQUMsQ0FBQzs7O0lBR2pELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFO1FBQ3ZDLElBQUksTUFBTSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQixzQkFBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7S0FFbEM7Q0FDSjs7QUFFRCxBQUFPLFNBQVMsc0JBQXNCLENBQUMsTUFBTSxFQUFFOzs7SUFHM0MsS0FBSyxRQUFRLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLFNBQVMsR0FBRztRQUM5QyxRQUFRLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzFELE1BQU07UUFDSCxNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO0tBQ2hFO0NBQ0o7Ozs7OztBQU1ELEFBQU8sSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQzNCLEFBQU8sU0FBUyxhQUFhLENBQUMsU0FBUyxDQUFDO0lBQ3BDLElBQUksU0FBUyxDQUFDLFdBQVcsS0FBSyxLQUFLLENBQUM7UUFDaEMsVUFBVSxHQUFHLFNBQVMsQ0FBQztLQUMxQixNQUFNO1FBQ0gsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO0tBQzNEO0NBQ0o7O0FBRUQsU0FBUyxjQUFjLENBQUMsT0FBTyxFQUFFOztJQUU3QixJQUFJLFNBQVMsR0FBRyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUM7O0lBRWpDLElBQUksaUJBQWlCLEdBQUcsRUFBRSxDQUFDOzs7SUFHM0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUU7UUFDdkMsSUFBSSxLQUFLLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQzs7O1FBR3JCLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDL0UsSUFBSSxPQUFPLEdBQUcsS0FBSyxHQUFHLEdBQUcsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQzs7WUFFaEUsaUJBQWlCLENBQUMsT0FBTyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7O1NBRW5HLE1BQU0sSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVcsS0FBSyxLQUFLLEVBQUU7Ozs7O1lBS2pELElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDOzs7Z0JBRzlCLElBQUksU0FBUyxFQUFFLFFBQVEsQ0FBQztnQkFDeEIsU0FBUyxHQUFHLGFBQWEsRUFBRSxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUM7O2dCQUVoRSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUU7b0JBQ2hELFFBQVEsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3hCLGlCQUFpQixDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxTQUFTLEdBQUcsUUFBUSxFQUFFLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDOUc7O2FBRUosTUFBTTtnQkFDSCxpQkFBaUIsRUFBRSxLQUFLLEdBQUcsR0FBRyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsUUFBUSxFQUFFLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNuRzs7U0FFSixNQUFNO1lBQ0gsaUJBQWlCLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7U0FDN0Y7OztRQUdELElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUN6QyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1NBQ3pEO0tBQ0o7Ozs7Ozs7OztJQVNELElBQUksT0FBTyxLQUFLLFNBQVMsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1FBQzdELElBQUksS0FBSyxHQUFHLE9BQU8sSUFBSSxPQUFPLENBQUM7UUFDL0IsaUJBQWlCLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7S0FDckQsTUFBTTtRQUNILEtBQUssQ0FBQywyREFBMkQsQ0FBQyxDQUFDO1FBQ25FLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxHQUFHLHdCQUF3QixDQUFDO0tBQzVEOztJQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQzs7SUFFekQsVUFBVSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0NBQ3RDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQXdERzs7QUM3UUosSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDOztBQUVmLEtBQUssQ0FBQyxvQkFBb0IsR0FBRyxTQUFTLENBQUM7QUFDdkMsS0FBSyxDQUFDLHVCQUF1QixHQUFHLFNBQVMsQ0FBQztBQUMxQyxLQUFLLENBQUMsa0JBQWtCLEdBQUcsU0FBUyxDQUFDO0FBQ3JDLEtBQUssQ0FBQyxxQkFBcUIsR0FBRyxTQUFTLENBQUM7O0FBRXhDLFNBQVMsdUJBQXVCLEVBQUU7SUFDOUIsSUFBSSxLQUFLLENBQUMsb0JBQW9CLEtBQUssU0FBUyxFQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQztJQUNoSCxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsS0FBSyxTQUFTLEVBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxvREFBb0QsQ0FBQyxDQUFDO0lBQ3ZILElBQUksS0FBSyxDQUFDLGtCQUFrQixLQUFLLFNBQVMsRUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLGtEQUFrRCxDQUFDLENBQUM7SUFDaEgsSUFBSSxLQUFLLENBQUMscUJBQXFCLEtBQUssU0FBUyxFQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsc0RBQXNELENBQUMsQ0FBQztDQUMxSDs7O0FBR0QsS0FBSyxDQUFDLFVBQVUsR0FBRyxVQUFVO0lBQ3pCLFlBQVksQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUMsQ0FBQztDQUNoRCxDQUFDOzs7QUFHRixLQUFLLENBQUMsMkJBQTJCLEdBQUcsV0FBVzs7SUFFM0MsdUJBQXVCLEVBQUUsQ0FBQzs7SUFFMUIsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssV0FBVyxFQUFFOzs7OztRQUtqQyxJQUFJLGVBQWUsR0FBRyxLQUFLLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDN0QsSUFBSSxrQkFBa0IsR0FBRyxLQUFLLENBQUMsdUJBQXVCLENBQUMsVUFBVSxDQUFDLENBQUM7OztRQUduRSxJQUFJLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztRQUMzQixpQkFBaUIsQ0FBQyxRQUFRLENBQUMsR0FBRyxlQUFlLENBQUM7UUFDOUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLEdBQUcsa0JBQWtCLENBQUM7O1FBRXBELElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDOztRQUVoRCxJQUFJLEdBQUcsS0FBSyxJQUFJLENBQUM7WUFDYixLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztZQUNsQyxPQUFPO1NBQ1Y7O1FBRUQsSUFBSSxPQUFPLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7OztRQUd6QyxJQUFJLGNBQWMsR0FBRyxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsS0FBSyxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsQ0FBQzs7O1FBR3RILGNBQWMsQ0FBQyxHQUFHLEdBQUcsS0FBSyxFQUFFLE9BQU8sQ0FBQyxHQUFHLGlCQUFpQixDQUFDOzs7UUFHekQsWUFBWSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUM7O1FBRWhFLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztLQUMzRTtDQUNKLENBQUM7OztBQUdGLEtBQUssQ0FBQywwQkFBMEIsR0FBRyxVQUFVO0lBQ3pDLHVCQUF1QixFQUFFLENBQUM7O0lBRTFCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDLENBQUM7O0lBRTNELE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDOzs7SUFHdEMsSUFBSSxXQUFXLEdBQUcscUJBQXFCLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbkQsV0FBVyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVTs7UUFFL0IsSUFBSSxVQUFVLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7O1FBRTdELFVBQVUsR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7O1FBRW5DLGFBQWEsRUFBRSxLQUFLLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNoRSxhQUFhLEVBQUUsS0FBSyxDQUFDLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDdEUsSUFBSSxVQUFVLEtBQUssU0FBUyxJQUFJLFVBQVUsS0FBSyxJQUFJLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxDQUFDOztRQUV6RSxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2pELE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLEVBQUUsVUFBVSxDQUFDLENBQUM7O1FBRXJELE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQzs7O1FBR3RCLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDN0IsQ0FBQyxDQUFDOztJQUVILFdBQVcsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLFVBQVU7O1FBRXJDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyx3REFBd0QsQ0FBQyxDQUFDO1lBQ3pFLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQztTQUN0Qjs7O1FBR0QsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUM3QixDQUFDLENBQUM7O0NBRU4sQ0FBQzs7O0FBR0YsU0FBUyxxQkFBcUIsQ0FBQyxTQUFTLENBQUM7O0lBRXJDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUU7UUFDakIsRUFBRSxFQUFFLFlBQVk7S0FDbkIsQ0FBQyxDQUFDOzs7SUFHSCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQzs7UUFFN0MsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztLQUN4RCxDQUFDLENBQUM7Ozs7SUFJSCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3JDLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7O0lBRTFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDaEIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUN0QixHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2QsR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNwQixDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzs7SUFFN0IsR0FBRyxDQUFDLEdBQUcsQ0FBQztRQUNKLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLEdBQUcsRUFBRSxNQUFNO1FBQ1gsSUFBSSxFQUFFLE1BQU07UUFDWixLQUFLLEVBQUUsTUFBTTtRQUNiLE1BQU0sRUFBRSxLQUFLO1FBQ2IsVUFBVSxFQUFFLE9BQU87UUFDbkIsTUFBTSxFQUFFLEtBQUs7UUFDYixZQUFZLEVBQUUsUUFBUTtLQUN6QixDQUFDLENBQUM7O0lBRUgsT0FBTztRQUNILE1BQU0sRUFBRSxHQUFHO1FBQ1gsTUFBTSxFQUFFLENBQUM7UUFDVCxZQUFZLEVBQUUsT0FBTztRQUNyQixJQUFJLEVBQUUsR0FBRztLQUNaLENBQUM7Q0FDTCxBQUdEOztBQ3RKQTs7O0FBR0EsQUFDQSxBQUNBLEFBQ0EsQUFDQSxxQkFBcUIsQUFFckIsQUFDQSxBQUVBLEFBRUEsQUFDQSw7Ozs7LDs7LDs7In0=
