(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.ExperimentJS = global.ExperimentJS || {})));
}(this, (function (exports) { 'use strict';

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

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                                      Interstimulus Pause
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

var _shouldInterstimulusPause = true;             //used in: RunExperiment.js
Pause.setShouldInterstimulusPause = function(value){
    if (typeof  value === "boolean"){
        _shouldInterstimulusPause = value;
    }
};

var _blackOut = $("<div>", {
    id: "interstimulus-pause",
    css: {
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        background: "black"
    }
});

$(document.body).append(_blackOut);
$("#interstimulus-pause").hide();

var _isInterstimulusPause = false;
function _interstimulusPause(duration) {         //used in: RunExperiment.js

    duration = duration === undefined ? _pause : duration; //Default to pause time unless an argument is supplied

    return new Promise(function (resolve, reject) {
        $("#interstimulus-pause").show();
        _isInterstimulusPause = true;
        _setShouldRunNextTrial(false);

        /*Prevent button mashing while the pause runs*/
        setTimeout(function () {
            $("#interstimulus-pause").hide();
            _isInterstimulusPause = false;
            _setShouldRunNextTrial(true);           //Cannot reassign imported values, so you need a setter

            resolve();                                              //Promise has resolved here
        }, duration);
    });
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

            if (_endCallBack !== undefined) _endCallBack();

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

//Order is important

//import "./2AFC.js";

/* global define */

// import {$,jQuery} from 'jquery';

exports.Trials = Trials;
exports.Pause = Pause;
exports.Saves = Saves;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwZXJpbWVudEpTLmpzIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMvQ3JlYXRlRG93bmxvYWRMaW5rLmpzIiwiLi4vc3JjL3V0aWxzL1NodWZmbGUuanMiLCIuLi9zcmMvdXRpbHMvU3RyaW5nVXRpbHMuanMiLCIuLi9zcmMvdXRpbHMvTnVtYmVyVXRpbHMuanMiLCIuLi9zcmMvdXRpbHMvdXRpbHMuanMiLCIuLi9zcmMvY29yZS9UcmlhbHMuanMiLCIuLi9zcmMvY29yZS9JbnRlcnN0aW11bHVzUGF1c2UuanMiLCIuLi9zcmMvY29yZS9SdW5FeHBlcmltZW50LmpzIiwiLi4vc3JjL2NvcmUvU2F2ZXMuanMiLCIuLi9zcmMvY29yZS9Db3JlLmpzIiwiLi4vc3JjL0V4cGVyaW1lbnRKUy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gY3JlYXRlRG93bmxvYWRMaW5rKGZpbGVuYW1lLCBkYXRhKXtcbiAgICAvLy8vaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNzgzNjI3My9leHBvcnQtamF2YXNjcmlwdC1kYXRhLXRvLWNzdi1maWxlLXdpdGhvdXQtc2VydmVyLWludGVyYWN0aW9uXG4gICAgdmFyIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICBhLmhyZWYgPSBkYXRhO1xuICAgIGEudGFyZ2V0ID0gXCJfYmxhbmtcIjtcbiAgICBhLmRvd25sb2FkID0gZmlsZW5hbWU7XG4gXG4gICAgcmV0dXJuIGE7XG59IiwiLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBGaXNjaGVyIFlhdGVzIFNodWZmbGVcbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbkFycmF5LnByb3RvdHlwZS5zaHVmZmxlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBjdXJyZW50SW5kZXggPSB0aGlzLmxlbmd0aCwgdGVtcG9yYXJ5VmFsdWUsIHJhbmRvbUluZGV4O1xuXG4gICAgLy8gV2hpbGUgdGhlcmUgcmVtYWluIGVsZW1lbnRzIHRvIHNodWZmbGUuLi5cbiAgICB3aGlsZSAoMCAhPT0gY3VycmVudEluZGV4KSB7XG5cbiAgICAgICAgLy8gUGljayBhIHJlbWFpbmluZyBlbGVtZW50Li4uXG4gICAgICAgIHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY3VycmVudEluZGV4KTtcbiAgICAgICAgY3VycmVudEluZGV4IC09IDE7XG5cbiAgICAgICAgLy8gQW5kIHN3YXAgaXQgd2l0aCB0aGUgY3VycmVudCBlbGVtZW50LlxuICAgICAgICB0ZW1wb3JhcnlWYWx1ZSA9IHRoaXNbY3VycmVudEluZGV4XTtcbiAgICAgICAgdGhpc1tjdXJyZW50SW5kZXhdID0gdGhpc1tyYW5kb21JbmRleF07XG4gICAgICAgIHRoaXNbcmFuZG9tSW5kZXhdID0gdGVtcG9yYXJ5VmFsdWU7XG4gICAgfVxufTsiLCJcbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3RyaW5nIFV0aWxzXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG5cbmV4cG9ydCBmdW5jdGlvbiBjYW1lbFRvU2VudGVuY2VDYXNlKHN0cikge1xuICAgIHJldHVybiBzdHIuc3BsaXQoLyg/PVtBLVpdKS8pLmpvaW4oXCIgXCIpLnRvTG93ZXJDYXNlKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQYXJhbU5hbWVzKGZuKXtcbiAgICAvL3dyYXAgdGhlc2Ugc28gYXMgbm90IHRvIHBvbGx1dGUgdGhlIG5hbWVzcGFjZVxuICAgIHZhciBTVFJJUF9DT01NRU5UUyA9IC8oKFxcL1xcLy4qJCl8KFxcL1xcKltcXHNcXFNdKj9cXCpcXC8pKS9tZztcbiAgICB2YXIgQVJHVU1FTlRfTkFNRVMgPSAvKFteXFxzLF0rKS9nO1xuICAgIGZ1bmN0aW9uIF9nZXRQYXJhbU5hbWVzKGZ1bmMpIHtcbiAgICAgICAgdmFyIGZuU3RyID0gZnVuYy50b1N0cmluZygpLnJlcGxhY2UoU1RSSVBfQ09NTUVOVFMsIFwiXCIpO1xuICAgICAgICB2YXIgcmVzdWx0ID0gZm5TdHIuc2xpY2UoZm5TdHIuaW5kZXhPZihcIihcIikrMSwgZm5TdHIuaW5kZXhPZihcIilcIikpLm1hdGNoKEFSR1VNRU5UX05BTUVTKTtcbiAgICAgICAgaWYocmVzdWx0ID09PSBudWxsKVxuICAgICAgICAgICAgcmVzdWx0ID0gW107XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIF9nZXRQYXJhbU5hbWVzKGZuKTtcbn0iLCIvKipcbiAqIENyZWF0ZWQgYnkga2FpIG9uIDUvMS8xNy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRmxvYXQobikge1xuICAgIHJldHVybiBOdW1iZXIobikgPT09IG4gJiYgbiAlIDEgIT09IDA7XG59IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGthaSBvbiA1LzEvMTcuXG4gKi9cblxuXG5pbXBvcnQgXCIuL0NyZWF0ZURvd25sb2FkTGluay5qc1wiO1xuaW1wb3J0IFwiLi9TaHVmZmxlLmpzXCI7XG5pbXBvcnQgXCIuL1N0cmluZ1V0aWxzLmpzXCI7XG5pbXBvcnQgXCIuL051bWJlclV0aWxzLmpzXCI7XG4iLCIvLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRyaWFscyAtIFNldHRpbmcgSVYgTGV2ZWxzICYgRnVuY3Rpb25zXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG5cbnZhciBUcmlhbHMgPSB7fTtcbmV4cG9ydCB2YXIgSVZzID0ge307XG5leHBvcnQgdmFyIHNldEZ1bmNzID0ge307XG5cbnZhciBleHBSZXBlYXRzID0gMTtcblxuLyoqIEV2ZXJ5IElWIHJlcXVpcmVzIDIgc3RlcHM6IGNyZWF0aW5nIHRoZSBsZXZlbHMgYW5kIHRoZW4sIHNldHRpbmcgdGhlIHRhcmdldCAqL1xuVHJpYWxzLnNldElWTGV2ZWxzID0gZnVuY3Rpb24gKGl2bmFtZSwgbGV2ZWxzKSB7XG4gICAgX3NldElWR2VuZXJpYyhpdm5hbWUsIFwibGV2ZWxzXCIsIGxldmVscyk7XG59O1xuXG5UcmlhbHMuc2V0SVZzZXRGdW5jID0gZnVuY3Rpb24oaXZuYW1lLCBzZXRGdW5jKSB7XG5cbiAgICAvL1RoaXMgaXMgbm93IGEgZmxhZyB0byBub3RpZnkgRXhwZXJpbWVudEpTIHRoYXQgeW91XCJyZSB1c2luZyBmdW5jdGlvbnNcbiAgICBfc2V0SVZHZW5lcmljKGl2bmFtZSwgXCJzZXRGdW5jXCIsIHRydWUpO1xuXG4gICAgLy9GdW5jdGlvbnMgYXJlIG5vdyBzdG9yZWQgaW4gdGhlaXIgb3duIG1hcCwga2V5ZWQgYnkgaXZuYW1lXG4gICAgX3NldFNldEZ1bmMoaXZuYW1lLCBzZXRGdW5jKTtcbn07XG5cbmV4cG9ydCB2YXIgX2R2TmFtZTtcblRyaWFscy5zZXREVk5hbWUgPSBmdW5jdGlvbihkdk5hbWUpe1xuICAgIGlmICh0eXBlb2YgZHZOYW1lID09PSBcInN0cmluZ1wiKXtcbiAgICAgICAgX2NzdklsbGVnYWxDaGFyQ2hlY2soZHZOYW1lKTtcbiAgICAgICAgX2R2TmFtZSA9IGR2TmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyAgbmV3IEVycm9yKFwiVGhlIHN1cHBsaWVkIERWIG5hbWUgbXVzdCBiZSBvZiB0eXBlIFN0cmluZ1wiKTtcbiAgICB9XG59O1xuXG4vKlxuIFRoZSB0cmlhbCB2YWx1ZSB3aWxsIGFsd2F5cyBiZSBwYXNzZWQgaW4gYXMgdGhlIGZpcnN0IGFyZ3VtZW50XG4gVGhlIHR5cGUgb2YgdGhhdCB0cmlhbCB2YWx1ZSB3aWxsIGJlIHRoZSBmaXJzdCBub24gYXJyYXktb2YtYXJyYXlzIGluIHRoZSBleHBlcmltZW50XG4gcGFyc2VyRnVuY3MgYXJlIHBhc3NlZCBhcmdzIGluIHRoaXMgb3JkZXIgKHRyaWFsSVYsIGkpXG4gcGFyc2VyRnVuY3MgbXVzdCByZXR1cm4gdGhlIGZvcm1hdHRlZCB2YWx1ZVxuIFRoaXMgYXNzdW1lcyB5b3Uga25vdyB0aGUgY29udGVudCBvZiB0aGUgdHJpYWwgdmFsdWUsIHdoaWNoIHlvdSBzaG91bGQuLi4uXG4gKi9cblRyaWFscy5zZXRJVlRyaWFsUGFyc2VyRnVuYyA9IGZ1bmN0aW9uIChpdm5hbWUsIHBhcnNlckZ1bmMpIHtcbiAgICBfc2V0SVZHZW5lcmljKGl2bmFtZSwgXCJwYXJzZXJGdW5jXCIsIHBhcnNlckZ1bmMpO1xufTtcblxuXG5UcmlhbHMuc2V0UmVwZWF0cyA9IGZ1bmN0aW9uIChuUmVwZWF0cykge1xuICAgIGV4cFJlcGVhdHMgPSBuUmVwZWF0cztcbn07XG5cblxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgVHJpYWxzIC0gU2V0dGluZyBJViBMZXZlbHMgJiBGdW5jdGlvbnMgKHByaXZhdGUpXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG4vKlxuKiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9zZXRJVkdlbmVyaWMoaXZOYW1lLCBmaWVsZE5hbWUsIGZpZWxkVmFsKSB7IC8vdXNlZCBieSAyQUZDLmpzXG4gICAgX2NzdklsbGVnYWxDaGFyQ2hlY2soaXZOYW1lKTtcbiAgICBfY3N2SWxsZWdhbENoYXJDaGVjayhmaWVsZE5hbWUpO1xuICAgIGlmICghSVZzLmhhc093blByb3BlcnR5KGl2TmFtZSkpIHsgLy9JZiBJViBkb2Vuc3QgZXhpc3RzIG1ha2UgaXQgYXMgYSByYXcgb2JqZWN0XG4gICAgICAgIElWc1tpdk5hbWVdID0ge307XG4gICAgfVxuXG4gICAgSVZzW2l2TmFtZV1bZmllbGROYW1lXSA9IGZpZWxkVmFsO1xufVxuXG5cbmZ1bmN0aW9uIF9zZXRTZXRGdW5jKGl2bmFtZSwgc2V0ZnVuYyl7XG4gICAgc2V0RnVuY3NbaXZuYW1lXSA9IHNldGZ1bmM7XG59XG5cbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUcmlhbHMgLSBCdWlsZGluZ1xuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuXG52YXIgX3RvdGFsVHJpYWxzID0gLTE7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9Bc3NpZ25lZCBidXQgbmV2ZXIgdXNlZFxuZXhwb3J0IHZhciBfYWxsVHJpYWxzID0gW107XG5leHBvcnQgZnVuY3Rpb24gX3NldEFsbFRyaWFscyhhbGx0cmlhbHMpe1xuICAgIGlmIChhbGx0cmlhbHMuY29uc3RydWN0b3IgPT09IEFycmF5KXtcbiAgICAgICAgX2FsbFRyaWFscyA9IGFsbHRyaWFscztcbiAgICB9XG59XG5cblRyaWFscy5nZXRUcmlhbHMgPSBmdW5jdGlvbigpe1xuICAgIGlmIChfYWxsVHJpYWxzLmxlbmd0aCA+IDApe1xuICAgICAgICByZXR1cm4gJC5leHRlbmQodHJ1ZSwgW10sIF9hbGxUcmlhbHMpO1xuICAgIH1cbn07XG5cbmV4cG9ydCB2YXIgX2RpZEJ1aWxkVHJpYWxzID0gZmFsc2U7XG5mdW5jdGlvbiBfYnVpbGRUcmlhbHMocHJpbnRUcmlhbHMpIHtcblxuICAgIGNvbnNvbGUubG9nKFwiQnVpbGQgVHJpYWxzLiBJVlM6XCIsIElWcyk7XG5cbiAgICB2YXIgYnVpbGRpbmdUcmlhbCwgdGVtcDtcblxuICAgIGZvciAodmFyIGl2IGluIElWcykgeyAvL0l0ZXJhdGUgb3ZlciBJVnNcblxuICAgICAgICBpZiAoSVZzW2l2XS5sZXZlbHMgPT09IHVuZGVmaW5lZCkgIHRocm93IG5ldyBFcnJvcihcIkxldmVscyBub3Qgc3VwcGxpZWQgZm9yIFwiICsgaXYpO1xuICAgICAgICBpZiAoSVZzW2l2XS5zZXRGdW5jID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihcIlNldHRlciBmdW5jdGlvbiBub3Qgc3VwcGxpZWQgZm9yIFwiICsgaXYpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwiRXh0ZW5kaW5nIGFsbCB0cmlhbHMgYXJyYXkgd2l0aDogXCIgKyBpdiArIFwiIChcIiArIElWc1tpdl0ubGV2ZWxzLmxlbmd0aCArIFwiIGxldmVscylcIik7XG5cbiAgICAgICAgaWYgKHNldEZ1bmNzW2l2XSA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoXCJTZXRGdW5jIG5vdCBkZWZpbmVkIGZvciBcIiArIGl2KTtcblxuICAgICAgICB0ZW1wID0gW107XG5cbiAgICAgICAgdmFyIGxlbiA9IF9hbGxUcmlhbHMubGVuZ3RoID09PSAwID8gMSA6IF9hbGxUcmlhbHMubGVuZ3RoOyAvLyBGb3IgdGhlIGZpcnN0IHBhc3NcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7IC8vRm9yIGFsbCB0cmlhbHMgYnVpbHQgc28gZmFyXG5cbiAgICAgICAgICAgIGJ1aWxkaW5nVHJpYWwgPSBfYWxsVHJpYWxzLnBvcCgpOyAvL1BvcCB0aGUgaW5jb21wbGV0ZSBhcnJheSBvZiBpdi12YWxzIChvYmplY3RzKSBhbmQgZXh0ZW5kXG5cbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgSVZzW2l2XS5sZXZlbHMubGVuZ3RoOyArK2opIHsgLy9FeHRlbmQgdGhlbSBieSBhbGwgdGhlIGxldmVscyBvZiB0aGUgbmV4dCBJVlxuXG5cbiAgICAgICAgICAgICAgICAvKiogU2V0IHRoZSB2YWx1ZSAmIGRlc2NyaXB0aW9uIG9mIHRoZSBjdXJyZW50IElWIG9iaiA0IHRoZSBjdXJyZW50IExldmVsICovXG4gICAgICAgICAgICAgICAgdmFyIGN1cklWTGV2ZWwgPSB7fTtcbiAgICAgICAgICAgICAgICBjdXJJVkxldmVsLmRlc2NyaXB0aW9uID0gaXY7IC8vY2FtZWxUb1NlbnRlbmNlQ2FzZShpdik7XG4gICAgICAgICAgICAgICAgY3VySVZMZXZlbC52YWx1ZSA9IElWc1tpdl0ubGV2ZWxzW2pdO1xuXG4gICAgICAgICAgICAgICAgLyoqIFN0b3JlIDJBRkMgc3RkIHdpdGggZWFjaCB0cmlhbCAoaWYgcHJlc2VudCkgKi9cbiAgICAgICAgICAgICAgICBpZiAoSVZzW2l2XS5oYXNPd25Qcm9wZXJ0eShcInN0ZF8yQUZDXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cklWTGV2ZWwuc3RkXzJBRkMgPSBJVnNbaXZdLnN0ZF8yQUZDO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8qKiBGb3IgMkFGQyB0aGF0IGlzIHNpbXVsdGFuZW91cyAoYXMgb3Bwb3NlZCB0byB0aGUgZmxpcHBpbmcga2luZCkqL1xuICAgICAgICAgICAgICAgIGlmIChJVnNbaXZdLmhhc093blByb3BlcnR5KFwic3RkXzJBRkNfc2ltdWx0YW5lb3VzX3RhcmdldFwiKSkge1xuICAgICAgICAgICAgICAgICAgICBjdXJJVkxldmVsLnN0ZF8yQUZDX3NpbXVsdGFuZW91c190YXJnZXQgPSBJVnNbaXZdLnN0ZF8yQUZDX3NpbXVsdGFuZW91c190YXJnZXQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8qKiBQYXJzZXIgZnVuY3Rpb24qL1xuICAgICAgICAgICAgICAgIGlmIChJVnNbaXZdLnBhcnNlckZ1bmMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBjdXJJVkxldmVsLnBhcnNlckZ1bmMgPSBJVnNbaXZdLnBhcnNlckZ1bmM7IC8vQ291bGQgd3JpdGUgYSBjb3B5aW5nIG1ldGhvZCBmb3IgYWxsIG9mIHRoZXNlICh0aGF0IGhhbmRsZXMgZGVlcCBjb3B5aW5nKVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBuZXdPckV4dGVuZGVkVHJpYWw7XG5cbiAgICAgICAgICAgICAgICBpZiAoYnVpbGRpbmdUcmlhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vbmV3T3JFeHRlbmRlZFRyaWFsID0gIGl2ICsgXCIgIFwiICsgbGV2ZWxWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgbmV3T3JFeHRlbmRlZFRyaWFsID0gW2N1cklWTGV2ZWxdO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChidWlsZGluZ1RyaWFsLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICAvL25ld09yRXh0ZW5kZWRUcmlhbCA9IGJ1aWxkaW5nVHJpYWwgKyBcIiB8IHwgXCIgKyBpdiArIFwiICBcIiArIGxldmVsVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIG5ld09yRXh0ZW5kZWRUcmlhbCA9IGJ1aWxkaW5nVHJpYWwuY29uY2F0KFtjdXJJVkxldmVsXSk7IC8vQ3JlYXRlcyBhIGJyYW5kIG5ldyBhcnJheSB3IHRoZSBuZXcgbGV2ZWxcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0ZW1wLnB1c2gobmV3T3JFeHRlbmRlZFRyaWFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKiBSZXBsYWNlIHlvdXIgcHJldmlvdXMgdHJpYWxzIHdpdGggVGVtcCAoZG9uXCJ0IGtub3cgd2hvIHRvIGRvIHRoaXMgaW4gcGxhY2UpICovXG4gICAgICAgIF9hbGxUcmlhbHMgPSB0ZW1wO1xuICAgIH1cblxuXG4gICAgLyoqIER1cGxpY2F0ZSB0aGUgY3VycmVudCBmYWN0b3JpYWwgdHJpYWxzICovXG4gICAgdmFyIHJlcGVhdHMgPSBleHBSZXBlYXRzO1xuICAgIHRlbXAgPSBbXTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgcmVwZWF0czsgaSsrKSB7XG4gICAgICAgIHRlbXAgPSB0ZW1wLmNvbmNhdChfYWxsVHJpYWxzKTtcbiAgICB9XG4gICAgX2FsbFRyaWFscyA9IHRlbXA7XG5cblxuICAgIGNvbnNvbGUubG9nKFwiVGhlcmUgYXJlIFwiLCBfYWxsVHJpYWxzLmxlbmd0aCwgXCJ0cmlhbHMgKHVzaW5nXCIsIHJlcGVhdHMsIFwicmVwZWF0cylcIik7XG4gICAgaWYgKHByaW50VHJpYWxzKXtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IF9hbGxUcmlhbHMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJUUklBTCBcIiwgaSk7XG4gICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgX2FsbFRyaWFsc1tpXS5sZW5ndGg7IGorKyl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coIF9hbGxUcmlhbHNbaV1bal0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiKioqKioqKiAqKioqKioqICoqKioqKiogKioqKioqKlwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChfc2hvdWxkU2h1ZmZsZSkgICAgIF9hbGxUcmlhbHMuc2h1ZmZsZSgpO1xuXG5cbiAgICBfdG90YWxUcmlhbHMgPSBfYWxsVHJpYWxzLmxlbmd0aDsgLy9Vc2VkIHRvIGRldGVybWluZSB3aGVyZSB5b3UgYXJlIGluIHRoZSB0cmlhbCBwcm9jZXNzXG4gICAgX2RpZEJ1aWxkVHJpYWxzID0gdHJ1ZTtcbn1cblxuXG4vKipcbiAqIE5PVEU6IFRoaXMgbW9kdWxlIGRvZXMgbm90IGxvbmdlciBoYW5kbGUgYXBwZWFyYW5jZSBvciBpbnB1dFxuICogVGhpcyBtb2R1bGUgbm93IG9ubHkgaGFuZGxlczpcbiAgICAqIC0gdGFraW5nIElWc1xuICAgICogLSBidWlsZGluZyBhbGwgdHJpYWxzXG4gKi9cblRyaWFscy5idWlsZEV4cGVyaW1lbnQgPSBmdW5jdGlvbiAocHJpbnRUcmlhbHMpIHtcbiAgICBfYnVpbGRUcmlhbHMoIChwcmludFRyaWFscyA9PT0gdW5kZWZpbmVkKSA/IGZhbHNlIDogcHJpbnRUcmlhbHMgKTtcbn07XG5cblxudmFyIF9zaG91bGRTaHVmZmxlID0gdHJ1ZTtcblRyaWFscy5zZXRTaHVmZmxlID0gZnVuY3Rpb24oc2hvdWxkU2h1ZmZsZSl7XG4gICAgaWYgKHR5cGVvZihzaG91bGRTaHVmZmxlKSA9PT0gXCJib29sZWFuXCIpe1xuICAgICAgICBfc2hvdWxkU2h1ZmZsZSA9ICBzaG91bGRTaHVmZmxlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcInNldFNodWZmbGUgb25seSBhY2NlcHRzIGJvb2xlYW4gYXJndW1lbnRcIik7XG4gICAgfVxufTtcblxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRyaWFscyAoc3ViZnVuY3Rpb25zKVxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuZnVuY3Rpb24gX2NzdklsbGVnYWxDaGFyQ2hlY2soc3RyaW5nKXtcblxuICAgIGlmICh0eXBlb2Ygc3RyaW5nICE9PSBcInN0cmluZ1wiKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc3VwcGx5IGEgdmFyaWFibGUgb2YgdHlwZSBTdHJpbmcgZm9yIHRoaXMgbWV0aG9kXCIpO1xuICAgIH1cblxuICAgIGlmIChzdHJpbmcuaW5kZXhPZihcIixcIikgIT09IC0xKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3RyaW5ncyB1c2VkIGJ5IEV4cGVyaW1lbnRKUyBtYXkgbm90IGNvbnRhaW4gY29tbWFzOiBcIiArIHN0cmluZyk7XG4gICAgfVxufVxuXG5leHBvcnQgeyBUcmlhbHMgfTsiLCJpbXBvcnQgeyBfc2hvdWxkUnVuTmV4dFRyaWFsLCBfc2V0U2hvdWxkUnVuTmV4dFRyaWFsIH0gZnJvbSBcIi4vUnVuRXhwZXJpbWVudC5qc1wiO1xuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEludGVyc3RpbXVsdXMgUGF1c2Vcbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cblxudmFyIFBhdXNlID0ge307XG5cblBhdXNlLnNob3dJbnRlcnN0aW11bHVzUGF1c2UgPSBmdW5jdGlvbiAoZHVyYXRpb24pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBfaW50ZXJzdGltdWx1c1BhdXNlKGR1cmF0aW9uKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG52YXIgX3BhdXNlID0gNTAwO1xuUGF1c2Uuc2V0UGF1c2VUaW1lID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSBwYXJzZUludCh2YWx1ZSwgMTApKSB7XG4gICAgICAgIF9wYXVzZSA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IFwic2V0UGF1c2VUaW1lIG9ubHkgdGFrZXMgaW50ZWdlcnNcIjtcbiAgICB9XG59O1xuXG5leHBvcnQgdmFyIF9zaG91bGRJbnRlcnN0aW11bHVzUGF1c2UgPSB0cnVlOyAgICAgICAgICAgICAvL3VzZWQgaW46IFJ1bkV4cGVyaW1lbnQuanNcblBhdXNlLnNldFNob3VsZEludGVyc3RpbXVsdXNQYXVzZSA9IGZ1bmN0aW9uKHZhbHVlKXtcbiAgICBpZiAodHlwZW9mICB2YWx1ZSA9PT0gXCJib29sZWFuXCIpe1xuICAgICAgICBfc2hvdWxkSW50ZXJzdGltdWx1c1BhdXNlID0gdmFsdWU7XG4gICAgfVxufTtcblxudmFyIF9ibGFja091dCA9ICQoXCI8ZGl2PlwiLCB7XG4gICAgaWQ6IFwiaW50ZXJzdGltdWx1cy1wYXVzZVwiLFxuICAgIGNzczoge1xuICAgICAgICBwb3NpdGlvbjogXCJmaXhlZFwiLFxuICAgICAgICBsZWZ0OiAwLFxuICAgICAgICB0b3A6IDAsXG4gICAgICAgIHdpZHRoOiBcIjEwMHZ3XCIsXG4gICAgICAgIGhlaWdodDogXCIxMDB2aFwiLFxuICAgICAgICBiYWNrZ3JvdW5kOiBcImJsYWNrXCJcbiAgICB9XG59KTtcblxuJChkb2N1bWVudC5ib2R5KS5hcHBlbmQoX2JsYWNrT3V0KTtcbiQoXCIjaW50ZXJzdGltdWx1cy1wYXVzZVwiKS5oaWRlKCk7XG5cbnZhciBfaXNJbnRlcnN0aW11bHVzUGF1c2UgPSBmYWxzZTtcbmV4cG9ydCBmdW5jdGlvbiBfaW50ZXJzdGltdWx1c1BhdXNlKGR1cmF0aW9uKSB7ICAgICAgICAgLy91c2VkIGluOiBSdW5FeHBlcmltZW50LmpzXG5cbiAgICBkdXJhdGlvbiA9IGR1cmF0aW9uID09PSB1bmRlZmluZWQgPyBfcGF1c2UgOiBkdXJhdGlvbjsgLy9EZWZhdWx0IHRvIHBhdXNlIHRpbWUgdW5sZXNzIGFuIGFyZ3VtZW50IGlzIHN1cHBsaWVkXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAkKFwiI2ludGVyc3RpbXVsdXMtcGF1c2VcIikuc2hvdygpO1xuICAgICAgICBfaXNJbnRlcnN0aW11bHVzUGF1c2UgPSB0cnVlO1xuICAgICAgICBfc2V0U2hvdWxkUnVuTmV4dFRyaWFsKGZhbHNlKTtcblxuICAgICAgICAvKlByZXZlbnQgYnV0dG9uIG1hc2hpbmcgd2hpbGUgdGhlIHBhdXNlIHJ1bnMqL1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICQoXCIjaW50ZXJzdGltdWx1cy1wYXVzZVwiKS5oaWRlKCk7XG4gICAgICAgICAgICBfaXNJbnRlcnN0aW11bHVzUGF1c2UgPSBmYWxzZTtcbiAgICAgICAgICAgIF9zZXRTaG91bGRSdW5OZXh0VHJpYWwodHJ1ZSk7ICAgICAgICAgICAvL0Nhbm5vdCByZWFzc2lnbiBpbXBvcnRlZCB2YWx1ZXMsIHNvIHlvdSBuZWVkIGEgc2V0dGVyXG5cbiAgICAgICAgICAgIHJlc29sdmUoKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9Qcm9taXNlIGhhcyByZXNvbHZlZCBoZXJlXG4gICAgICAgIH0sIGR1cmF0aW9uKTtcbiAgICB9KTtcbn1cblxuXG5leHBvcnQgeyBQYXVzZSB9OyIsIlxuLy8gUnVuRXhwZXJpbWVudC5qc1xuLy8gQWRkIGNvcmUgZnVuY3Rpb25hbGl0eSBmYWNpbGl0YXRpbmcgdGhlIGV4cGVyaW1lbnRhbCBsaWZlIGN5Y2xlIHRvIHRoZSBUcmlhbHMgT2JqZWN0LlxuLy8gU3VjaCBhczpcbi8vICAgICAgLSBHZXR0aW5nIHBhcnRpY2lwYW50IGluZm9cbi8vICAgICAgLSBSdW5uaW5nIHRoZSBuZXh0IHRyaWFsIChzZXR0aW5nIElWcyBldGMpXG4vLyAgICAgIC0gU3RvcmluZyBhIHJlc3BvbnNlXG4vLyAgICAgIC0gT3V0cHV0dGluZyByZXNwb25zZXNcbi8vICAgICAgLSBNaWQvZW5kIGNhbGxiYWNrc1xuXG5pbXBvcnQgeyBUcmlhbHMsIHNldEZ1bmNzLCBfYWxsVHJpYWxzLCBfZGlkQnVpbGRUcmlhbHMsIF9kdk5hbWUgfSBmcm9tIFwiLi9UcmlhbHMuanNcIjtcbmltcG9ydCB7IF9pbnRlcnN0aW11bHVzUGF1c2UsIF9zaG91bGRJbnRlcnN0aW11bHVzUGF1c2UgfSBmcm9tIFwiLi9JbnRlcnN0aW11bHVzUGF1c2UuanNcIjtcbmltcG9ydCB7IGNyZWF0ZURvd25sb2FkTGluayB9IGZyb20gXCIuLi91dGlscy9DcmVhdGVEb3dubG9hZExpbmsuanNcIjtcbmltcG9ydCB7IGdldFBhcmFtTmFtZXMgfSBmcm9tIFwiLi4vdXRpbHMvU3RyaW5nVXRpbHMuanNcIjtcblxuXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG4vLyAgICAgICAgICAgICAgICAgICAgICBFeHBlcmltZW50IExpZmVjeWNsZSAtIEdldCBQYXJ0aWNpcGFudCBJbmZvXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG5cbnZhciBfcHB0TmFtZSA9IFwidW5uYW1lZF9wcHRcIjtcbnZhciBfcHB0Tm8gPSAwO1xuXG5UcmlhbHMuZ2V0UHB0SW5mbyA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIF9wcHROYW1lID0gcHJvbXB0KFwiUGxlYXNlIGVudGVyIHlvdXIgbmFtZVwiKS50cmltKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibmFtZSB3YXNcIiwgX3BwdE5hbWUpO1xuICAgICAgICBpZiAoX3BwdE5hbWUgPT09IFwiXCIgfHwgX3BwdE5hbWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGFsZXJ0KFwiTmFtZSBjYW5ub3QgYmUgYmxhbmtcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIF9wcHRObyA9IHBhcnNlSW50KHByb21wdChcIlBsZWFzZSBlbnRlciB5b3VyIHBhcnRpY2lwYW50IG51bWJlclwiKSk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicHB0IG51bWJlciB3YXNcIiwgX3BwdE5vKTtcbiAgICAgICAgaWYgKGlzTmFOKF9wcHRObykpIHtcbiAgICAgICAgICAgIGFsZXJ0KFwiUGFydGljaXBhbnQgbnVtYmVyIG11c3QgYmUgYW4gaW50ZWdlclwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coXCJQYXJ0aWNpcGFudCBuYW1lOiBcIiwgX3BwdE5hbWUsIFwiXFx0UGFydGljaXBhbnQgbnVtYmVyOiBcIiwgX3BwdE5vKTtcbn07XG5cbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgIEV4cGVyaW1lbnQgTGlmZWN5Y2xlIC0gU3RhcnQgJiBHYW1lIExvb3Bcbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cblxuLy9DYW5ub3QgcmVhc3NpZ24gaW1wb3J0ZWQgdmFsdWVzLCBzbyB5b3UgbmVlZCBhIHNldHRlciAodXNlZCBpbiBJbnRlcnN0aW1sdXNQYXVzZS5qcylcbmV4cG9ydCBmdW5jdGlvbiBfc2V0U2hvdWxkUnVuTmV4dFRyaWFsKHZhbHVlKXtcbiAgICBpZiAodHlwZW9mKHZhbHVlKSA9PT0gXCJib29sZWFuXCIpe1xuICAgICAgICBfc2hvdWxkUnVuTmV4dFRyaWFsID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY2Fubm90IHNldCBfc2hvdWxkUnVuTmV4dFRyaWFsIHRvIGEgbm9uIGJvb2xlYW4gdmFsdWVcIik7XG4gICAgfVxufVxuXG5leHBvcnQgdmFyIF9zaG91bGRSdW5OZXh0VHJpYWwgPSB0cnVlOyAvL3VzZWQgYnk6IEludGVyc3RpbXVsdXNQYXVzZS5qc1xuVHJpYWxzLnJ1bk5leHRUcmlhbCA9IGZ1bmN0aW9uIChzZXR0aW5ncykgeyAvLyB1c2FnZSAtPiBydW5OZXh0VHJpYWwoe3Nob3VsZFN0b3JlUmVzcG9uc2U6IHRydWUsIGR2X3ZhbHVlOiBcImluc2lkZVwifSk7XG5cbiAgICBpZiAoIV9kaWRCdWlsZFRyaWFscyl7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcInJ1bk5leHRUcmlhbCgpOiBUcmlhbCB3ZXJlIG5vdCBidWlsdFwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChfc2hvdWxkUnVuTmV4dFRyaWFsKSB7XG5cbiAgICAgICAgLy8gVE9ETzogQ2hhbmdlIHRoZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgbWlkIGNhbGxiYWNrIC0gSnVzdCBjaGVjayB0aGUgbGVuZ3RoIG9mIHRoZSBfcmVzcG9uc2VzIGFycmF5IHZzIHRoZSBhbGx0cmlhbHMgYXJyYXkuLlxuXG4gICAgICAgIGlmIChfc2hvdWxkUnVuTWlkQ2FsbGJhY2soKSAmJiBfbWlkQ2FsbGJhY2sgIT09IG51bGwpIHtcbiAgICAgICAgICAgIF9taWRDYWxsYmFjaygpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF9zaG91bGRJbnRlcnN0aW11bHVzUGF1c2UpIHtcbiAgICAgICAgICAgIF9pbnRlcnN0aW11bHVzUGF1c2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZXR0aW5ncyAhPT0gdW5kZWZpbmVkICYmIHNldHRpbmdzLmhhc093blByb3BlcnR5KFwic2hvdWxkU3RvcmVSZXNwb25zZVwiKSAmJiBzZXR0aW5ncy5zaG91bGRTdG9yZVJlc3BvbnNlKSB7XG4gICAgICAgICAgICBfc3RvcmVSZXNwb25zZShzZXR0aW5ncyk7IC8vU2V0dGluZ3MgY29udGFpbnMgYSBmaWVsZCBcImR2X3ZhbHVlXCIgd2hpY2ggaXMgYWxzbyByZWFkIGJ5IF9zdG9yZVJlc3BvbnNlXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoX2FsbFRyaWFscy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBfZGlzcGxheU5leHRUcmlhbCgpO1xuXG4gICAgICAgICAgICAvLyBfY3VyMkFGQ0lzVGFyZ2V0ID0gdHJ1ZTtcbiAgICAgICAgICAgIC8qKiBBbHdheXMgcmVzZXQgdGhlIDJBRkMgdmFsdWUqL1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlRoZXJlIGFyZSBcIiwgX2FsbFRyaWFscy5sZW5ndGgsIFwiIHRyaWFscyByZW1haW5pbmcuXCIpO1xuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAvL1Bvc3NpYmx5IHRvbyBkZXN0cnVjdGl2ZVxuICAgICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5jaGlsZHJlbigpLmZhZGVPdXQoKTtcbiAgICAgICAgICAgIC8vICQoXCIjaW50ZXJzdGltdWx1cy1wYXVzZVwiKS5oaWRlKCk7XG4gICAgICAgICAgICBfb3V0cHV0UmVzcG9uc2VzKF9yZXNwb25zZXMpO1xuXG4gICAgICAgICAgICBpZiAoX2VuZENhbGxCYWNrICE9PSB1bmRlZmluZWQpIF9lbmRDYWxsQmFjaygpO1xuXG4gICAgICAgIH1cbiAgICB9XG5cbn07XG5cbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cbi8vICAgICAgICAgICAgICAgICAgRXhwZXJpbWVudCBMaWZlY3ljbGUgLSBNaWQgUG9pbnQgQ2FsbGJhY2sgKGkuZS4gdGhlIFwidGFrZSBhIGJyZWFrXCIgbWVzc2FnZSlcbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cblxudmFyIF9kaWRSdW5NaWRDYWxsYmFjayA9IGZhbHNlO1xudmFyIF9taWRDYWxsYmFjayA9IG51bGw7XG5UcmlhbHMuc2V0TWlkQ2FsbGJhY2sgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgICBfbWlkQ2FsbGJhY2sgPSB2YWx1ZTtcbiAgICB9ICAgZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk9ubHkgZnVuY3Rpb25zIG1heSBiZSBhc3NpZ25lZCB0byB0aGUgZW5kIGNhbGxiYWNrXCIpO1xuICAgIH1cbn07XG5cbmZ1bmN0aW9uIF9zaG91bGRSdW5NaWRDYWxsYmFjaygpIHtcbiAgICBpZiAoX2RpZFJ1bk1pZENhbGxiYWNrKSByZXR1cm4gZmFsc2U7XG5cbiAgICAvL01pZCBwb2ludCA9IHRoZXJlIGFyZSBhcyBtYW55IHJlc3BvbnNlcyBhcyB0cmlhbHMgKG9yIGEgZGlmZmVyZW5jZSBvZiBvbmUgZm9yIG9kZCBudW1iZXIgb2YgdHJpYWxzKVxuICAgIGlmIChfYWxsVHJpYWxzLmxlbmd0aCA9PT1fcmVzcG9uc2VzLmxlbmd0aCB8fCBNYXRoLmFicyhfYWxsVHJpYWxzLmxlbmd0aCAtX3Jlc3BvbnNlcy5sZW5ndGgpID09PSAxKXtcbiAgICAgICAgX2RpZFJ1bk1pZENhbGxiYWNrID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG4vLyAgICAgICAgICAgICBFeHBlcmltZW50IExpZmVjeWNsZSAtIEVuZCBDYWxsYmFjayAoYSBiZWhhdmlvdXIgYXQgdGhlIGVuZCBvZiB0aGUgZXhwZXJpbWVudClcbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cbnZhciBfZW5kQ2FsbEJhY2sgPSBudWxsO1xuVHJpYWxzLnNldEVuZENhbGxiYWNrID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKXtcbiAgICAgICAgX2VuZENhbGxCYWNrID0gdmFsdWU7XG4gICAgfSAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJPbmx5IGZ1bmN0aW9ucyBtYXkgYmUgYXNzaWduZWQgdG8gdGhlIGVuZCBjYWxsYmFja1wiKTtcbiAgICB9XG59O1xuXG5cbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRXhwZXJpbWVudCBMaWZlY3ljbGUgLSBEaXNwbGF5aW5nIFRoZSBOZXh0IFRyaWFsXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG5cbi8qKiBXaGVyZSB2aWV3LWxldmVsIGVsZW1lbnRzIGFyZSBzZXQgLSB0aGlzIGlzIGxpa2UgdGhlIENPTlRST0xMRVIgbWV0aG9kIGludGVyZmFjaW5nIGJldHdlZW4gTU9ERUwgYW5kIFZJRVcqL1xuZnVuY3Rpb24gX2Rpc3BsYXlOZXh0VHJpYWwoKSB7XG4gICAgdmFyIG5leHRUcmlhbCA9IF9hbGxUcmlhbHNbX2FsbFRyaWFscy5sZW5ndGggLSAxXTsgLy9BbHdheXMgZ28gZnJvbSB0aGUgYmFja1xuICAgIGNvbnNvbGUubG9nKFwiRGlzcGxheWluZyBuZXh0IHRyaWFsOlwiLCBuZXh0VHJpYWwpO1xuXG4gICAgLyoqIEl0ZXJhdGUgb3ZlciBlYWNoIElWIGFuZCBzZXQgaXRzIHBvaW50ZXIgdG8gaXRzIHZhbHVlIGZvciB0aGF0IHRyaWFsICovXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuZXh0VHJpYWwubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGN1cl9pdiA9IG5leHRUcmlhbFtpXTtcbiAgICAgICAgX2ZpcmVJVlNldEZ1bmNXaXRoQXJncyhjdXJfaXYpO1xuXG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gX2ZpcmVJVlNldEZ1bmNXaXRoQXJncyhjdXJfaXYpIHtcblxuICAgIC8qKiBVc2luZyBhIEZVTkNUSU9OIHRvIHNldCB0aGUgZGlzcGxheSovXG4gICAgaWYgKCBzZXRGdW5jc1tjdXJfaXYuZGVzY3JpcHRpb25dICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIHNldEZ1bmNzW2N1cl9pdi5kZXNjcmlwdGlvbl0uYXBwbHkobnVsbCwgY3VyX2l2LnZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBzZXR0ZXIgZnVuY3Rpb24gc3VwcGxpZWQgYnk6IFwiICsgY3VyX2l2KTtcbiAgICB9XG59XG5cblxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBFeHBlcmltZW50IExpZmVjeWNsZSAtIFN0b3JlIFJlc3BvbnNlXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG5leHBvcnQgdmFyIF9yZXNwb25zZXMgPSBbXTtcbmV4cG9ydCBmdW5jdGlvbiBfc2V0UmVzcG9uc2VzKHJlc3BvbnNlcyl7XG4gICAgaWYgKHJlc3BvbnNlcy5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpe1xuICAgICAgICBfcmVzcG9uc2VzID0gcmVzcG9uc2VzO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcInJlcG9uc2VzIGNhbiBvbmx5IGJlIHNldCB0byBhbiBhcnJheVwiKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIF9zdG9yZVJlc3BvbnNlKG9wdGlvbnMpIHtcblxuICAgIHZhciBsYXN0VHJpYWwgPSBfYWxsVHJpYWxzLnBvcCgpO1xuXG4gICAgdmFyIHJlc3BvbnNlRm9ybWF0dGVkID0ge307XG5cbiAgICAvKiogU3RvcmUgdGhlIElWIC0+IFdyaXRlIG91dCBlYWNoIElWICgxIElWIHBlciBhcnJheSBlbGVtZW50KSB0byBhIGZpZWxkICovXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0VHJpYWwubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGl2TnVtID0gXCJJVlwiICsgaTtcblxuICAgICAgICAvL0lmIGEgcGFyc2VyIGlzIGRlZmluZWQgdXNlIGl0cyBvdXRwdXQgYXMgdGhlIHZhbHVlIG9mIHRoZSByZXNwb25zZVxuICAgICAgICBpZiAobGFzdFRyaWFsW2ldLnBhcnNlckZ1bmMgIT09IHVuZGVmaW5lZCAmJiAkLmlzRnVuY3Rpb24obGFzdFRyaWFsW2ldLnBhcnNlckZ1bmMpKXtcbiAgICAgICAgICAgIHZhciBzdGROYW1lID0gaXZOdW0gKyBcIl9cIiArIGxhc3RUcmlhbFtpXS5kZXNjcmlwdGlvbiArIFwiX3ZhbHVlXCI7XG5cbiAgICAgICAgICAgIHJlc3BvbnNlRm9ybWF0dGVkW3N0ZE5hbWVdID0gbGFzdFRyaWFsW2ldLnBhcnNlckZ1bmMuYXBwbHkodGhpcywgbGFzdFRyaWFsW2ldLnZhbHVlLmNvbmNhdChpKSApOyAvL1RoZSBhcmdzIGFyZSBwYXNzZWQgdG8gdGhlIHBhcnNlciBmdW5jIHdpdGggdGhlIGluZGV4IGFzIHRoZSBsYXN0IGFyZ1xuXG4gICAgICAgIH0gZWxzZSBpZiAobGFzdFRyaWFsW2ldLnZhbHVlLmNvbnN0cnVjdG9yID09PSBBcnJheSkgeyAvL0NvbnNpZGVyIHRoZXNlIHRvIGJlIGRlZmF1bHRzIGZvciBqYXZhc2NyaXB0IHByaW1pdGl2ZSB0eXBlc1xuXG4gICAgICAgICAgICAvKiogTWFudWFsbHkgd3JpdGUgb3V0IGVhY2ggYXJndW1lbnQgKGZyb20gYW4gYXJyYXkpIHRvIGEgZmllbGQgaW4gdGhlIG9iamVjdFxuICAgICAgICAgICAgICogIE9ubHkgYXBwZW5kIGEgbnVtYmVyIGlmIHRoZXJlIGFyZSA+MSBhcmd1bWVudHMgcGFzc2VkIGluICovXG5cbiAgICAgICAgICAgIGlmIChsYXN0VHJpYWxbaV0udmFsdWUubGVuZ3RoID4gMSl7XG5cbiAgICAgICAgICAgICAgICAvL0lmIHVzaW5nIGEgc2V0RnVuYyBmdW5jdGlvbiB3aXRoIG11bHRpcGxlIGFyZ3MgLT4gdXNlIHRoZSBhcmcgbmFtZXMgdG8gZGVzY3JpYmUgdGhlIHZhbHVlcyB3cml0dGVuIHRvIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgIHZhciBhcmdfbmFtZXMsIGFyZ19uYW1lO1xuICAgICAgICAgICAgICAgIGFyZ19uYW1lcyA9IGdldFBhcmFtTmFtZXMoIHNldEZ1bmNzW2xhc3RUcmlhbFtpXS5kZXNjcmlwdGlvbl0gKTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbGFzdFRyaWFsW2ldLnZhbHVlLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ19uYW1lID0gYXJnX25hbWVzW2pdO1xuICAgICAgICAgICAgICAgICAgICByZXNwb25zZUZvcm1hdHRlZFtpdk51bSArIFwiX1wiICsgbGFzdFRyaWFsW2ldLmRlc2NyaXB0aW9uICsgXCJfdmFsdWVfXCIgKyBhcmdfbmFtZSBdID0gIGxhc3RUcmlhbFtpXS52YWx1ZVtqXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2VGb3JtYXR0ZWRbIGl2TnVtICsgXCJfXCIgKyBsYXN0VHJpYWxbaV0uZGVzY3JpcHRpb24gKyBcIl92YWx1ZVwiIF0gPSAgbGFzdFRyaWFsW2ldLnZhbHVlWzBdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNwb25zZUZvcm1hdHRlZFtpdk51bSArIFwiX1wiICsgbGFzdFRyaWFsW2ldLmRlc2NyaXB0aW9uICsgXCJfdmFsdWVcIl0gPSBsYXN0VHJpYWxbaV0udmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogQWRkIGEgdmFsdWUgb2YgdGhlIDJhZmMgc3RkIChmb3IgdGhlIHJlbGV2YW50IElWKSAqL1xuICAgICAgICBpZiAobGFzdFRyaWFsW2ldLmhhc093blByb3BlcnR5KFwic3RkXzJBRkNcIikpIHtcbiAgICAgICAgICAgIHJlc3BvbnNlRm9ybWF0dGVkW1wic3RkXzJBRkNcIl0gPSBsYXN0VHJpYWxbaV0uc3RkXzJBRkM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogQ2hlY2sgdGhhdCBhIDJhZmMgc3RkIHZhbHVlIHdhcyBhZGRlZCAtIGlmIG5vdCB5b3Ugd2FudCB0byBhZGQgYSBudWxsIHZhbHVlIG9yIGl0IHdpbGwgZnVjayB1cCB0aGUgY3N2IHdyaXRlKi9cbiAgICAvLyBpZiAoIXJlc3BvbnNlRm9ybWF0dGVkLmhhc093blByb3BlcnR5KFwic3RkXzJBRkNcIikgJiYgZGlkU2V0MkFGQykge1xuICAgIC8vICAgICByZXNwb25zZUZvcm1hdHRlZFtcInN0ZF8yQUZDXCJdID0gXCJudWxsXCI7XG4gICAgLy8gfVxuICAgIFxuXG4gICAgLyoqIFN0b3JlIHRoZSBEViovXG4gICAgaWYgKG9wdGlvbnMgIT09IHVuZGVmaW5lZCAmJiBvcHRpb25zLmhhc093blByb3BlcnR5KFwiZHZfdmFsdWVcIikpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gX2R2TmFtZSB8fCBcInZhbHVlXCI7XG4gICAgICAgIHJlc3BvbnNlRm9ybWF0dGVkW1wiRFZfXCIrdmFsdWVdID0gb3B0aW9ucy5kdl92YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBhbGVydChcIk5vIERWIHdhcyBzdXBwbGllZCBieSB0aGUgY2FsbGluZyBjb2RlLiBUaGlzIGlzIGFuIGVycm9yLlwiKTtcbiAgICAgICAgcmVzcG9uc2VGb3JtYXR0ZWRbXCJEVl92YWx1ZVwiXSA9IFwiRVJST1IgLSBObyBEViBzdXBwbGllZFwiO1xuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKFwiU1RPUkVEIFRISVMgUkVTUE9OU0U6IFwiLCByZXNwb25zZUZvcm1hdHRlZCk7XG5cbiAgICBfcmVzcG9uc2VzLnB1c2gocmVzcG9uc2VGb3JtYXR0ZWQpO1xufVxuXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEV4cGVyaW1lbnQgTGlmZWN5Y2xlIC0gT3V0cHV0IFJlc3BvbnNlc1xuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuXG5UcmlhbHMuZm9yY2VPdXRwdXRSZXNwb25zZXMgPSBmdW5jdGlvbigpe1xuICAgIGNvbnNvbGUubG9nKFwiRm9yY2luZyBvdXRwdXQgb2YgX3Jlc3BvbnNlc1wiKTtcbiAgICBfb3V0cHV0UmVzcG9uc2VzKF9yZXNwb25zZXMsIHRydWUpO1xufTtcblxuXG5mdW5jdGlvbiBfb3V0cHV0UmVzcG9uc2VzKGFsbFJlc3BvbnNlcywgbG9nKSB7XG5cbiAgICBpZiAoYWxsUmVzcG9uc2VzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgdmFyIGNzdlN0cmluZyA9IFwiXCI7XG5cbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGFsbFJlc3BvbnNlc1swXSk7XG4gICAgLyoqVGhlc2UgYXJlIGFsbCB0aGUgY29sdW1ucyBpbiB0aGUgb3V0cHV0Ki9cblxuICAgIC8qKiBNYWtlIHRoZSBoZWFkZXIqL1xuICAgIGNzdlN0cmluZyArPSBcIlBhcnRpY2lwYW50IE5hbWUsIFBhcnRpY2lwYW50IE51bWJlciwgXCI7IC8vTWFudWFsbHkgYWRkIGhlYWRlclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjc3ZTdHJpbmcgKz0ga2V5c1tpXSArIFwiLFwiO1xuICAgIH1cbiAgICBjc3ZTdHJpbmcgPSBjc3ZTdHJpbmcuc2xpY2UoMCwgLTEpICsgXCJcXG5cIjsvL0N1dCB0cmFpbGluZyBjb21tYSBhbmQgcHV0IGluIGEgbmV3IHJvdy9saW5lXG5cbiAgICAvKiogRmlsbCB0aGUgZGF0YSAtIFRoaXMgdGltZSBpdHMgYW4gYXJyYXkgb2YgYXJyYXlzIG5vdCBhcnJheSBvZiBkaWN0aW9uYXJpZXMgKi9cbiAgICBmb3IgKGkgPSAwOyBpIDwgYWxsUmVzcG9uc2VzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgY3N2U3RyaW5nICs9IF9wcHROYW1lICsgXCIsXCIgKyBfcHB0Tm8gKyBcIixcIjsgLy9NYW5hdWxseSBhZGQgY29udGVudFxuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwga2V5cy5sZW5ndGg7IGorKykgeyAvL0l0ZXJhdGUgb3ZlciB0aGUga2V5cyB0byBnZXQgdGVoIHZhbHVlc1xuXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBhbGxSZXNwb25zZXNbaV1ba2V5c1tqXV07XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIndyaXRpbmcgdGhpcyByYXcgdmFsdWUgXCIsIHZhbHVlLCBrZXlzW2pdKTtcbiAgICAgICAgICAgIC8vdmFsdWUgPSBjaGVja1JldHVyblByb3BzKCB2YWx1ZSwgdHJ1ZSApIHx8IHZhbHVlOyAgLy9QYXJzZSBvdXQgcmVsZXZhbnQgb2JqZWN0IGZpZWxkc1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIkFmZXIgaXQgd2FzIHBhcnNlZDpcIiwgdmFsdWUsIFwiXFxuKioqKioqKioqXCIpO1xuICAgICAgICAgICAgY3N2U3RyaW5nICs9IHZhbHVlICsgXCIsXCI7XG4gICAgICAgIH1cblxuICAgICAgICBjc3ZTdHJpbmcgPSBjc3ZTdHJpbmcuc2xpY2UoMCwgLTEpICsgXCJcXG5cIjsgLy9DdXQgdHJhaWxpbmcgY29tbWEgYW5kIHB1dCBpbiBhIG5ldyByb3cvbGluZVxuICAgIH1cblxuICAgIGlmIChsb2cpIHtcbiAgICAgICAgY29uc29sZS5sb2coY3N2U3RyaW5nKTtcbiAgICB9XG5cbiAgICAvKiogSGVscCBvdXQgYSBtYWNoaW5lIHRvZGF5Ki9cbiAgICB2YXIgY3N2Q29udGVudCA9IGVuY29kZVVSSShcImRhdGE6dGV4dC9jc3Y7Y2hhcnNldD11dGYtOCxcIiArIGNzdlN0cmluZyk7XG4gICAgdmFyIGEgPSBjcmVhdGVEb3dubG9hZExpbmsoXCJyZXN1bHRzIChcIiArIF9wcHROYW1lICsgXCIsXCIgKyBfcHB0Tm8udG9TdHJpbmcoKSArIFwiKS5jc3ZcIiwgY3N2Q29udGVudCk7XG4gICAgYS5pbm5lckhUTUwgPSBcIjxoND5DbGljayB0byBkb3dubG9hZCByZXN1bHRzITwvaDQ+XCI7XG4gICAgYS5jbGFzc05hbWUgKz0gXCIgcmVzdWx0cy1kb3dubG9hZFwiO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYSk7XG4gICAgYS5jbGljaygpO1xufVxuXG5cbiIsIlxuaW1wb3J0IHsgVHJpYWxzLF9hbGxUcmlhbHMsIF9zZXRBbGxUcmlhbHMsIF9kaWRCdWlsZFRyaWFsc30gZnJvbSBcIi4vVHJpYWxzLmpzXCI7XG5pbXBvcnQgeyBfcmVzcG9uc2VzLCBfc2V0UmVzcG9uc2VzIH0gZnJvbSBcIi4vUnVuRXhwZXJpbWVudC5qc1wiO1xuXG5cbnZhciBTYXZlcyA9IHt9O1xuXG5TYXZlcy5wYXJzZVRyaWFsc0ZvclNhdmluZyA9IHVuZGVmaW5lZDsgLy9pbnRlcmZhY2UgaXMgKF9hbGxUcmlhbHMpXG5TYXZlcy5wYXJzZVJlc3BvbnNlc0ZvclNhdmluZyA9IHVuZGVmaW5lZDsgLy9pbnRlcmZhY2UgaXMgKF9yZXNwb25zZXMpXG5TYXZlcy51bnBhcnNlU2F2ZWRUcmlhbHMgPSB1bmRlZmluZWQ7XG5TYXZlcy51bnBhcnNlU2F2ZWRSZXNwb25zZXMgPSB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGVycm9yQ2hlY2tTYXZpbmdQYXJzZXJzKCl7XG4gICAgaWYgKFNhdmVzLnBhcnNlVHJpYWxzRm9yU2F2aW5nID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCByZXN0b3JlIHRyaWFscyB3aXRob3V0IHBhcnNpbmcgZnVuY3Rpb25cIik7XG4gICAgaWYgKFNhdmVzLnBhcnNlUmVzcG9uc2VzRm9yU2F2aW5nID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCByZXN0b3JlIF9yZXNwb25zZXMgd2l0aG91dCBwYXJzaW5nIGZ1bmN0aW9uXCIpO1xuICAgIGlmIChTYXZlcy51bnBhcnNlU2F2ZWRUcmlhbHMgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHJlc3RvcmUgdHJpYWxzIHdpdGhvdXQgVU5wYXJzaW5nIGZ1bmN0aW9uXCIpO1xuICAgIGlmIChTYXZlcy51bnBhcnNlU2F2ZWRSZXNwb25zZXMgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHJlc3RvcmUgX3Jlc3BvbnNlcyB3aXRob3V0IFVOcGFyc2luZyBmdW5jdGlvblwiKTtcbn1cblxuXG5TYXZlcy5jbGVhclNhdmVzID0gZnVuY3Rpb24oKXtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcImV4cGVyaW1lbnRKU3NhdmVzXCIpOy8vLy8vXG59O1xuXG5cblNhdmVzLnNhdmVCdWlsdFRyaWFsc0FuZFJlc3BvbnNlcyA9IGZ1bmN0aW9uKCkge1xuICAgIFxuICAgIGVycm9yQ2hlY2tTYXZpbmdQYXJzZXJzKCk7XG5cbiAgICBpZiAodHlwZW9mKFN0b3JhZ2UpICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cbiAgICAgICAgLy8gbG9jYWxTdG9yYWdlLmV4cGVyaW1lbnRKU3NhdmVzID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIC8vUGFyc2UgeW91ciB0cmlhbHMsIHVzaW5nIHRoZSBjdXN0b20gc2VyaWFsaXplci4uXG4gICAgICAgIHZhciB0cmlhbHNGb3JTYXZpbmcgPSBTYXZlcy5wYXJzZVRyaWFsc0ZvclNhdmluZyhfYWxsVHJpYWxzKTtcbiAgICAgICAgdmFyIHJlc3BvbnNlc0ZvclNhdmluZyA9IFNhdmVzLnBhcnNlUmVzcG9uc2VzRm9yU2F2aW5nKF9yZXNwb25zZXMpO1xuXG4gICAgICAgIC8vSlNPTmlmeSB0aGUgdHJpYWxzIGFuZCBfcmVzcG9uc2VzXG4gICAgICAgIHZhciBleHBlcmltZW50SlNzYXZlcyA9IHt9O1xuICAgICAgICBleHBlcmltZW50SlNzYXZlc1tcInRyaWFsc1wiXSA9IHRyaWFsc0ZvclNhdmluZztcbiAgICAgICAgZXhwZXJpbWVudEpTc2F2ZXNbXCJyZXNwb25zZXNcIl0gPSByZXNwb25zZXNGb3JTYXZpbmc7XG5cbiAgICAgICAgdmFyIG1zZyA9IHByb21wdChcIkFkZCBhIG1lc3NhZ2UgdG8gdGhpcyBzYXZlIVwiKTtcblxuICAgICAgICBpZiAobXNnID09PSBudWxsKXtcbiAgICAgICAgICAgIGFsZXJ0KFwiVHJpYWxzIHdpbGwgbm90IGJlIHNhdmVkXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRhdGVLZXkgPSAobmV3IERhdGUoKSkudG9VVENTdHJpbmcoKTsgLy9WZXJ5IGNsZWFyIGRhdGVcblxuICAgICAgICAvL01ha2UgYSBuZXcgZGljdGlvbmFyeSBvciBnZXQgdGhlIG9sZCBvbmVcbiAgICAgICAgdmFyIGtleWVkX2J5X2RhdGVzID0gKGxvY2FsU3RvcmFnZS5leHBlcmltZW50SlNzYXZlcyA9PT0gdW5kZWZpbmVkKSA/IHt9IDogSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZXhwZXJpbWVudEpTc2F2ZXMpO1xuXG4gICAgICAgIC8vc2F2ZSB0byBpdFxuICAgICAgICBrZXllZF9ieV9kYXRlc1ttc2cgKyBcIiAtIFwiICtkYXRlS2V5XSA9IGV4cGVyaW1lbnRKU3NhdmVzO1xuXG4gICAgICAgIC8vc2VyaWFsaXplIVxuICAgICAgICBsb2NhbFN0b3JhZ2UuZXhwZXJpbWVudEpTc2F2ZXMgPSBKU09OLnN0cmluZ2lmeShrZXllZF9ieV9kYXRlcyk7XG5cbiAgICAgICAgY29uc29sZS5sb2coXCJTYXZlZCBUcmlhbHNcIiwgSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZXhwZXJpbWVudEpTc2F2ZXMpKTtcbiAgICB9XG59O1xuXG5cblNhdmVzLnNldFNhdmVkVHJpYWxzQW5kUmVzcG9uc2VzID0gZnVuY3Rpb24oKXtcbiAgICBlcnJvckNoZWNrU2F2aW5nUGFyc2VycygpO1xuXG4gICAgdmFyIGFsbF9zYXZlcyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmV4cGVyaW1lbnRKU3NhdmVzKTtcblxuICAgIGNvbnNvbGUubG9nKFwiYWxsIHNhdmVzKyBcIiwgYWxsX3NhdmVzKTtcblxuXG4gICAgdmFyIHNlbGVjdF9iaXRzID0gX2NyZWF0ZURyb3BEb3duU2VsZWN0KGFsbF9zYXZlcyk7XG4gICAgc2VsZWN0X2JpdHMuYnV0dG9uLmNsaWNrKGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgdmFyIHRlbXBfdXNpbmcgPSBzZWxlY3RfYml0cy5zZWxlY3QuZmluZChcIjpzZWxlY3RlZFwiKS50ZXh0KCk7XG5cbiAgICAgICAgdGVtcF91c2luZyA9IGFsbF9zYXZlc1t0ZW1wX3VzaW5nXTtcblxuICAgICAgICBfc2V0QWxsVHJpYWxzKCBTYXZlcy51bnBhcnNlU2F2ZWRUcmlhbHModGVtcF91c2luZ1tcInRyaWFsc1wiXSkgKTtcbiAgICAgICAgX3NldFJlc3BvbnNlcyggU2F2ZXMudW5wYXJzZVNhdmVkUmVzcG9uc2VzKHRlbXBfdXNpbmdbXCJyZXNwb25zZXNcIl0pICk7XG4gICAgICAgIGlmIChfcmVzcG9uc2VzID09PSB1bmRlZmluZWQgfHwgX3Jlc3BvbnNlcyA9PT0gbnVsbCkgX3NldFJlc3BvbnNlcyggW10gKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhcInJlc3RvcmVkIGFsbCB0cmlhbHM6IFwiLCBfYWxsVHJpYWxzKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJyZXN0b3JlZCBhbGwgX3Jlc3BvbnNlczogXCIsIF9yZXNwb25zZXMpO1xuXG4gICAgICAgIFRyaWFscy5ydW5OZXh0VHJpYWwoKTtcblxuICAgICAgICAvL1JlbW92ZSBzZWxlY3QgZnJvbSBkb21cbiAgICAgICAgc2VsZWN0X2JpdHMud3JhcC5yZW1vdmUoKTtcbiAgICB9KTtcblxuICAgIHNlbGVjdF9iaXRzLmJ1dHRvbl9jbGVhci5jbGljayhmdW5jdGlvbigpe1xuXG4gICAgICAgIGlmICh3aW5kb3cuY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgYWxsIHNhdmVkIGV4cGVyaW1lbnRzP1wiKSl7XG4gICAgICAgICAgICBTYXZlcy5jbGVhclNhdmVzKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvL1JlbW92ZSBzZWxlY3QgZnJvbSBkb21cbiAgICAgICAgc2VsZWN0X2JpdHMud3JhcC5yZW1vdmUoKTtcbiAgICB9KTtcblxufTtcblxuXG5mdW5jdGlvbiBfY3JlYXRlRHJvcERvd25TZWxlY3QoYWxsX3NhdmVzKXtcblxuICAgIHZhciBkaXYgPSAkKFwiPGRpdj5cIiwge1xuICAgICAgICBpZDogXCJzYXZlZF9pbmZvXCJcbiAgICB9KTtcblxuICAgIC8vTWFrZSBhIHNlbGVjdCB0byBjaG9vc2UgZnJvbSB0aGUgc2F2ZXNcbiAgICB2YXIgc2VsID0gJChcIjxzZWxlY3Q+XCIpO1xuICAgIE9iamVjdC5rZXlzKGFsbF9zYXZlcykubWFwKGZ1bmN0aW9uKGVsZW0sIGksIGFsbCl7XG4gICAgICAgIC8vVXNlIHRoZSBpbmRleCBhcyB0aGUga2V5XG4gICAgICAgIHNlbC5hcHBlbmQoJChcIjxvcHRpb24+XCIpLmF0dHIoXCJ2YWx1ZVwiLGkpLnRleHQoZWxlbSkpO1xuICAgIH0pO1xuXG5cbiAgICAvL0J1dHRvbiAtIG5vIGZ1bmN0aW9uYWxpdHkgaGVyZSwganVzdCB2aWV3XG4gICAgdmFyIGIgPSAkKFwiPGJ1dHRvbj5cIikudGV4dChcIkNob29zZVwiKTtcbiAgICB2YXIgYl9jbGVhciA9ICQoXCI8YnV0dG9uPlwiKS50ZXh0KFwiQ2xlYXJcIik7XG5cbiAgICBkaXYuYXBwZW5kKHNlbCk7XG4gICAgZGl2LmFwcGVuZCgkKFwiPGJyPlwiKSk7XG4gICAgZGl2LmFwcGVuZChiKTtcbiAgICBkaXYuYXBwZW5kKGJfY2xlYXIpO1xuICAgICQoZG9jdW1lbnQuYm9keSkuYXBwZW5kKGRpdik7XG5cbiAgICBkaXYuY3NzKHtcbiAgICAgICAgcG9zaXRpb246IFwiZml4ZWRcIixcbiAgICAgICAgdG9wOiBcIjQ1dmhcIixcbiAgICAgICAgbGVmdDogXCIyNXZ3XCIsXG4gICAgICAgIHdpZHRoOiBcIjUwdndcIixcbiAgICAgICAgaGVpZ2h0OiBcIjV2aFwiLFxuICAgICAgICBiYWNrZ3JvdW5kOiBcIndoaXRlXCIsXG4gICAgICAgIGJvcmRlcjogXCIydndcIixcbiAgICAgICAgXCJ0ZXh0LWFsaWduXCI6IFwiY2VudGVyXCJcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHNlbGVjdDogc2VsLFxuICAgICAgICBidXR0b246IGIsXG4gICAgICAgIGJ1dHRvbl9jbGVhcjogYl9jbGVhcixcbiAgICAgICAgd3JhcDogZGl2XG4gICAgfTtcbn1cblxuXG5leHBvcnQgeyBTYXZlcyB9OyIsIi8vT3JkZXIgaXMgaW1wb3J0YW50XG5cbmltcG9ydCB7IFRyaWFscyB9IGZyb20gIFwiLi9UcmlhbHMuanNcIjsgLy9OZWVkcyAuLyB0byB0cmVhdCBpdCBhcyBhbiBpbnRlcm5hbCAobm90IGV4dGVybmFsIGRlcGVuZGVuY3kpXG5pbXBvcnQgXCIuL1J1bkV4cGVyaW1lbnQuanNcIjsgICAgICAgICAgICAvLyBFeHRlbmRzIHRoZSBmdW5jdGlvbmFsaXR5IG9mIHRoZSBUcmlhbHMgb2JqZWN0XG4vL2ltcG9ydCBcIi4vMkFGQy5qc1wiO1xuXG5pbXBvcnQgeyBQYXVzZSB9IGZyb20gIFwiLi9JbnRlcnN0aW11bHVzUGF1c2UuanNcIjtcbmltcG9ydCB7IFNhdmVzIH0gZnJvbSBcIi4vU2F2ZXMuanNcIjtcblxuLy9UaGVzZSBhcmUgdGhlIGZpZWxkcyBvZiBFeHBlcmltZW50SlNcbmV4cG9ydCB7IFRyaWFscyB9O1xuZXhwb3J0IHsgUGF1c2UgfTtcbmV4cG9ydCB7IFNhdmVzIH07IiwiLyogZ2xvYmFsIGRlZmluZSAqL1xuXG4vLyBpbXBvcnQgeyQsalF1ZXJ5fSBmcm9tICdqcXVlcnknO1xuaW1wb3J0IFwiLi91dGlscy91dGlscy5qc1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vY29yZS9Db3JlLmpzXCI7Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFPLFNBQVMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQzs7SUFFOUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNkLENBQUMsQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDO0lBQ3BCLENBQUMsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDOztJQUV0QixPQUFPLENBQUMsQ0FBQzs7O0FDUGI7OztBQUdBLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFlBQVk7SUFDbEMsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsV0FBVyxDQUFDOzs7SUFHNUQsT0FBTyxDQUFDLEtBQUssWUFBWSxFQUFFOzs7UUFHdkIsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLFlBQVksQ0FBQyxDQUFDO1FBQ3ZELFlBQVksSUFBSSxDQUFDLENBQUM7OztRQUdsQixjQUFjLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLGNBQWMsQ0FBQztLQUN0QztDQUNKOztBQ2pCRDs7OztBQUlBLEFBQU8sQUFFTjs7QUFFRCxBQUFPLFNBQVMsYUFBYSxDQUFDLEVBQUUsQ0FBQzs7SUFFN0IsSUFBSSxjQUFjLEdBQUcsa0NBQWtDLENBQUM7SUFDeEQsSUFBSSxjQUFjLEdBQUcsWUFBWSxDQUFDO0lBQ2xD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
