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

// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                                      Trials - Creation
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -

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


// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                                      Trials - Creation (private)
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
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

// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                                      Trials - Building
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -

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

    console.log("IVS:", IVs);

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


var _shouldShuffle = true;
Trials.setShuffle = function(shouldShuffle){
    if (typeof(shouldShuffle) === "boolean"){
        _shouldShuffle =  shouldShuffle;
    } else {
        throw new Error("setShuffle only accepts boolean argument");
    }
};

// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                                      Trials (subfunctions)
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
function _csvIllegalCharCheck(string){

    if (typeof string !== "string"){
        throw new Error("You must supply a variable of type String for this method");
    }

    if (string.indexOf(",") !== -1){
        throw new Error("Strings used by ExperimentJS may not contain commas: " + string);
    }
}

// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                                      Interstimulus Pause
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -

    
    
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

// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                                      Run Experiment - Get Participant Info
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -

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

// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                                      Run Experiment - Game Loop
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -

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

// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                  Run Experiment - Mid Point Callback (i.e. the "take a break" message)
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -


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

// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                                  Run Experiment - End Callback
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
var _endCallBack = null;
Trials.setEndCallback = function (value) {
    if (typeof value === "function"){
        _endCallBack = value;
    }   else {
        throw new Error("Only functions may be assigned to the end callback");
    }
};


// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                                 Run Experiment - Displaying The Next Trial
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -

/** Where view-level elements are set - this is like the CONTROLLER method interfacing between MODEL and VIEW*/
function _displayNextTrial() {
    var nextTrial = _allTrials[_allTrials.length - 1]; //Always go from the back
    console.log("next trial:", nextTrial);

    /** Iterate over each IV and set its pointer to its value for that trial */
    for (var i = 0; i < nextTrial.length; ++i) {
        _setObjectAppearanceProperties(nextTrial[i]);

    }
}

function _setObjectAppearanceProperties(curProp) {

    /** Using a FUNCTION to set the display*/
    if ( setFuncs[curProp.description] !== undefined ) {
        setFuncs[curProp.description].apply(null, curProp.value);
    } else {
        throw new Error("No setter function supplied by: " + curProp);
    }
}


// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                                 Run Experiment - Store Response
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
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

// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                                 Run Experiment - Output Responses
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -

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

        if (confirm("Are you sure you want to delete all saved experiments?")){
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

exports.Trials = Trials;
exports.Pause = Pause;
exports.Saves = Saves;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwZXJpbWVudEpTLmpzIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMvQ3JlYXRlRG93bmxvYWRMaW5rLmpzIiwiLi4vc3JjL3V0aWxzL1NodWZmbGUuanMiLCIuLi9zcmMvdXRpbHMvU3RyaW5nVXRpbHMuanMiLCIuLi9zcmMvdXRpbHMvTnVtYmVyVXRpbHMuanMiLCIuLi9zcmMvdXRpbHMvdXRpbHMuanMiLCIuLi9zcmMvY29yZS9UcmlhbHMuanMiLCIuLi9zcmMvY29yZS9JbnRlcnN0aW11bHVzUGF1c2UuanMiLCIuLi9zcmMvY29yZS9SdW5FeHBlcmltZW50LmpzIiwiLi4vc3JjL2NvcmUvU2F2ZXMuanMiLCIuLi9zcmMvY29yZS9jb3JlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBjcmVhdGVEb3dubG9hZExpbmsoZmlsZW5hbWUsIGRhdGEpe1xuICAgIC8vLy9odHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE3ODM2MjczL2V4cG9ydC1qYXZhc2NyaXB0LWRhdGEtdG8tY3N2LWZpbGUtd2l0aG91dC1zZXJ2ZXItaW50ZXJhY3Rpb25cbiAgICB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgIGEuaHJlZiA9IGRhdGE7XG4gICAgYS50YXJnZXQgPSBcIl9ibGFua1wiO1xuICAgIGEuZG93bmxvYWQgPSBmaWxlbmFtZTtcbiBcbiAgICByZXR1cm4gYTtcbn0iLCIvLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEZpc2NoZXIgWWF0ZXMgU2h1ZmZsZVxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuQXJyYXkucHJvdG90eXBlLnNodWZmbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGN1cnJlbnRJbmRleCA9IHRoaXMubGVuZ3RoLCB0ZW1wb3JhcnlWYWx1ZSwgcmFuZG9tSW5kZXg7XG5cbiAgICAvLyBXaGlsZSB0aGVyZSByZW1haW4gZWxlbWVudHMgdG8gc2h1ZmZsZS4uLlxuICAgIHdoaWxlICgwICE9PSBjdXJyZW50SW5kZXgpIHtcblxuICAgICAgICAvLyBQaWNrIGEgcmVtYWluaW5nIGVsZW1lbnQuLi5cbiAgICAgICAgcmFuZG9tSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjdXJyZW50SW5kZXgpO1xuICAgICAgICBjdXJyZW50SW5kZXggLT0gMTtcblxuICAgICAgICAvLyBBbmQgc3dhcCBpdCB3aXRoIHRoZSBjdXJyZW50IGVsZW1lbnQuXG4gICAgICAgIHRlbXBvcmFyeVZhbHVlID0gdGhpc1tjdXJyZW50SW5kZXhdO1xuICAgICAgICB0aGlzW2N1cnJlbnRJbmRleF0gPSB0aGlzW3JhbmRvbUluZGV4XTtcbiAgICAgICAgdGhpc1tyYW5kb21JbmRleF0gPSB0ZW1wb3JhcnlWYWx1ZTtcbiAgICB9XG59OyIsIlxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdHJpbmcgVXRpbHNcbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbWVsVG9TZW50ZW5jZUNhc2Uoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5zcGxpdCgvKD89W0EtWl0pLykuam9pbihcIiBcIikudG9Mb3dlckNhc2UoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBhcmFtTmFtZXMoZm4pe1xuICAgIC8vd3JhcCB0aGVzZSBzbyBhcyBub3QgdG8gcG9sbHV0ZSB0aGUgbmFtZXNwYWNlXG4gICAgdmFyIFNUUklQX0NPTU1FTlRTID0gLygoXFwvXFwvLiokKXwoXFwvXFwqW1xcc1xcU10qP1xcKlxcLykpL21nO1xuICAgIHZhciBBUkdVTUVOVF9OQU1FUyA9IC8oW15cXHMsXSspL2c7XG4gICAgZnVuY3Rpb24gX2dldFBhcmFtTmFtZXMoZnVuYykge1xuICAgICAgICB2YXIgZm5TdHIgPSBmdW5jLnRvU3RyaW5nKCkucmVwbGFjZShTVFJJUF9DT01NRU5UUywgXCJcIik7XG4gICAgICAgIHZhciByZXN1bHQgPSBmblN0ci5zbGljZShmblN0ci5pbmRleE9mKFwiKFwiKSsxLCBmblN0ci5pbmRleE9mKFwiKVwiKSkubWF0Y2goQVJHVU1FTlRfTkFNRVMpO1xuICAgICAgICBpZihyZXN1bHQgPT09IG51bGwpXG4gICAgICAgICAgICByZXN1bHQgPSBbXTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICByZXR1cm4gX2dldFBhcmFtTmFtZXMoZm4pO1xufSIsIi8qKlxuICogQ3JlYXRlZCBieSBrYWkgb24gNS8xLzE3LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNGbG9hdChuKSB7XG4gICAgcmV0dXJuIE51bWJlcihuKSA9PT0gbiAmJiBuICUgMSAhPT0gMDtcbn0iLCIvKipcbiAqIENyZWF0ZWQgYnkga2FpIG9uIDUvMS8xNy5cbiAqL1xuXG5cbmltcG9ydCBcIi4vQ3JlYXRlRG93bmxvYWRMaW5rLmpzXCI7XG5pbXBvcnQgXCIuL1NodWZmbGUuanNcIjtcbmltcG9ydCBcIi4vU3RyaW5nVXRpbHMuanNcIjtcbmltcG9ydCBcIi4vTnVtYmVyVXRpbHMuanNcIjtcbiIsIi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUcmlhbHMgLSBDcmVhdGlvblxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuXG52YXIgVHJpYWxzID0ge307XG5leHBvcnQgdmFyIElWcyA9IHt9O1xuZXhwb3J0IHZhciBzZXRGdW5jcyA9IHt9O1xuXG52YXIgZXhwUmVwZWF0cyA9IDE7XG5cbi8qKiBFdmVyeSBJViByZXF1aXJlcyAyIHN0ZXBzOiBjcmVhdGluZyB0aGUgbGV2ZWxzIGFuZCB0aGVuLCBzZXR0aW5nIHRoZSB0YXJnZXQgKi9cblRyaWFscy5zZXRJVkxldmVscyA9IGZ1bmN0aW9uIChpdm5hbWUsIGxldmVscykge1xuICAgIF9zZXRJVkdlbmVyaWMoaXZuYW1lLCBcImxldmVsc1wiLCBsZXZlbHMpO1xufTtcblxuXG5UcmlhbHMuc2V0SVZzZXRGdW5jID0gZnVuY3Rpb24oaXZuYW1lLCBzZXRGdW5jKSB7XG5cbiAgICAvL1RoaXMgaXMgbm93IGEgZmxhZyB0byBub3RpZnkgRXhwZXJpbWVudEpTIHRoYXQgeW91XCJyZSB1c2luZyBmdW5jdGlvbnNcbiAgICBfc2V0SVZHZW5lcmljKGl2bmFtZSwgXCJzZXRGdW5jXCIsIHRydWUpO1xuXG4gICAgLy9GdW5jdGlvbnMgYXJlIG5vdyBzdG9yZWQgaW4gdGhlaXIgb3duIG1hcCwga2V5ZWQgYnkgaXZuYW1lXG4gICAgX3NldFNldEZ1bmMoaXZuYW1lLCBzZXRGdW5jKTtcbn07XG5cbmV4cG9ydCB2YXIgX2R2TmFtZTtcblRyaWFscy5zZXREVk5hbWUgPSBmdW5jdGlvbihkdk5hbWUpe1xuICAgIGlmICh0eXBlb2YgZHZOYW1lID09PSBcInN0cmluZ1wiKXtcbiAgICAgICAgX2NzdklsbGVnYWxDaGFyQ2hlY2soZHZOYW1lKTtcbiAgICAgICAgX2R2TmFtZSA9IGR2TmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyAgbmV3IEVycm9yKFwiVGhlIHN1cHBsaWVkIERWIG5hbWUgbXVzdCBiZSBvZiB0eXBlIFN0cmluZ1wiKTtcbiAgICB9XG59O1xuXG4vKlxuIFRoZSB0cmlhbCB2YWx1ZSB3aWxsIGFsd2F5cyBiZSBwYXNzZWQgaW4gYXMgdGhlIGZpcnN0IGFyZ3VtZW50XG4gVGhlIHR5cGUgb2YgdGhhdCB0cmlhbCB2YWx1ZSB3aWxsIGJlIHRoZSBmaXJzdCBub24gYXJyYXktb2YtYXJyYXlzIGluIHRoZSBleHBlcmltZW50XG4gcGFyc2VyRnVuY3MgYXJlIHBhc3NlZCBhcmdzIGluIHRoaXMgb3JkZXIgKHRyaWFsSVYsIGkpXG4gcGFyc2VyRnVuY3MgbXVzdCByZXR1cm4gdGhlIGZvcm1hdHRlZCB2YWx1ZVxuIFRoaXMgYXNzdW1lcyB5b3Uga25vdyB0aGUgY29udGVudCBvZiB0aGUgdHJpYWwgdmFsdWUsIHdoaWNoIHlvdSBzaG91bGQuLi4uXG4gKi9cblRyaWFscy5zZXRJVlRyaWFsUGFyc2VyRnVuYyA9IGZ1bmN0aW9uIChpdm5hbWUsIHBhcnNlckZ1bmMpIHtcbiAgICBfc2V0SVZHZW5lcmljKGl2bmFtZSwgXCJwYXJzZXJGdW5jXCIsIHBhcnNlckZ1bmMpO1xufTtcblxuXG5UcmlhbHMuc2V0UmVwZWF0cyA9IGZ1bmN0aW9uIChuUmVwZWF0cykge1xuICAgIGV4cFJlcGVhdHMgPSBuUmVwZWF0cztcbn07XG5cblxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRyaWFscyAtIENyZWF0aW9uIChwcml2YXRlKVxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuLypcbiogKi9cbmV4cG9ydCBmdW5jdGlvbiBfc2V0SVZHZW5lcmljKGl2TmFtZSwgZmllbGROYW1lLCBmaWVsZFZhbCkgeyAvL3VzZWQgYnkgMkFGQy5qc1xuICAgIF9jc3ZJbGxlZ2FsQ2hhckNoZWNrKGl2TmFtZSk7XG4gICAgX2NzdklsbGVnYWxDaGFyQ2hlY2soZmllbGROYW1lKTtcbiAgICBpZiAoIUlWcy5oYXNPd25Qcm9wZXJ0eShpdk5hbWUpKSB7IC8vSWYgSVYgZG9lbnN0IGV4aXN0cyBtYWtlIGl0IGFzIGEgcmF3IG9iamVjdFxuICAgICAgICBJVnNbaXZOYW1lXSA9IHt9O1xuICAgIH1cblxuICAgIElWc1tpdk5hbWVdW2ZpZWxkTmFtZV0gPSBmaWVsZFZhbDtcbn1cblxuXG5mdW5jdGlvbiBfc2V0U2V0RnVuYyhpdm5hbWUsIHNldGZ1bmMpe1xuICAgIHNldEZ1bmNzW2l2bmFtZV0gPSBzZXRmdW5jO1xufVxuXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVHJpYWxzIC0gQnVpbGRpbmdcbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cblxudmFyIF90b3RhbFRyaWFscyA9IC0xOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQXNzaWduZWQgYnV0IG5ldmVyIHVzZWRcbmV4cG9ydCB2YXIgX2FsbFRyaWFscyA9IFtdO1xuZXhwb3J0IGZ1bmN0aW9uIF9zZXRBbGxUcmlhbHMoYWxsdHJpYWxzKXtcbiAgICBpZiAoYWxsdHJpYWxzLmNvbnN0cnVjdG9yID09PSBBcnJheSl7XG4gICAgICAgIF9hbGxUcmlhbHMgPSBhbGx0cmlhbHM7XG4gICAgfVxufVxuXG5UcmlhbHMuZ2V0VHJpYWxzID0gZnVuY3Rpb24oKXtcbiAgICBpZiAoX2FsbFRyaWFscy5sZW5ndGggPiAwKXtcbiAgICAgICAgcmV0dXJuICQuZXh0ZW5kKHRydWUsIFtdLCBfYWxsVHJpYWxzKTtcbiAgICB9XG59O1xuXG5leHBvcnQgdmFyIF9kaWRCdWlsZFRyaWFscyA9IGZhbHNlO1xuZnVuY3Rpb24gX2J1aWxkVHJpYWxzKHByaW50VHJpYWxzKSB7XG5cbiAgICBjb25zb2xlLmxvZyhcIklWUzpcIiwgSVZzKTtcblxuICAgIHZhciBidWlsZGluZ1RyaWFsLCB0ZW1wO1xuXG4gICAgZm9yICh2YXIgaXYgaW4gSVZzKSB7IC8vSXRlcmF0ZSBvdmVyIElWc1xuXG4gICAgICAgIGlmIChJVnNbaXZdLmxldmVscyA9PT0gdW5kZWZpbmVkKSAgdGhyb3cgbmV3IEVycm9yKFwiTGV2ZWxzIG5vdCBzdXBwbGllZCBmb3IgXCIgKyBpdik7XG4gICAgICAgIGlmIChJVnNbaXZdLnNldEZ1bmMgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKFwiU2V0dGVyIGZ1bmN0aW9uIG5vdCBzdXBwbGllZCBmb3IgXCIgKyBpdik7XG5cbiAgICAgICAgY29uc29sZS5sb2coXCJFeHRlbmRpbmcgYWxsIHRyaWFscyBhcnJheSB3aXRoOiBcIiArIGl2ICsgXCIgKFwiICsgSVZzW2l2XS5sZXZlbHMubGVuZ3RoICsgXCIgbGV2ZWxzKVwiKTtcblxuICAgICAgICBpZiAoc2V0RnVuY3NbaXZdID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihcIlNldEZ1bmMgbm90IGRlZmluZWQgZm9yIFwiICsgaXYpO1xuXG4gICAgICAgIHRlbXAgPSBbXTtcblxuICAgICAgICB2YXIgbGVuID0gX2FsbFRyaWFscy5sZW5ndGggPT09IDAgPyAxIDogX2FsbFRyaWFscy5sZW5ndGg7IC8vIEZvciB0aGUgZmlyc3QgcGFzc1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpIHsgLy9Gb3IgYWxsIHRyaWFscyBidWlsdCBzbyBmYXJcblxuICAgICAgICAgICAgYnVpbGRpbmdUcmlhbCA9IF9hbGxUcmlhbHMucG9wKCk7IC8vUG9wIHRoZSBpbmNvbXBsZXRlIGFycmF5IG9mIGl2LXZhbHMgKG9iamVjdHMpIGFuZCBleHRlbmRcblxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBJVnNbaXZdLmxldmVscy5sZW5ndGg7ICsraikgeyAvL0V4dGVuZCB0aGVtIGJ5IGFsbCB0aGUgbGV2ZWxzIG9mIHRoZSBuZXh0IElWXG5cblxuICAgICAgICAgICAgICAgIC8qKiBTZXQgdGhlIHZhbHVlICYgZGVzY3JpcHRpb24gb2YgdGhlIGN1cnJlbnQgSVYgb2JqIDQgdGhlIGN1cnJlbnQgTGV2ZWwgKi9cbiAgICAgICAgICAgICAgICB2YXIgY3VySVZMZXZlbCA9IHt9O1xuICAgICAgICAgICAgICAgIGN1cklWTGV2ZWwuZGVzY3JpcHRpb24gPSBpdjsgLy9jYW1lbFRvU2VudGVuY2VDYXNlKGl2KTtcbiAgICAgICAgICAgICAgICBjdXJJVkxldmVsLnZhbHVlID0gSVZzW2l2XS5sZXZlbHNbal07XG5cbiAgICAgICAgICAgICAgICAvKiogU3RvcmUgMkFGQyBzdGQgd2l0aCBlYWNoIHRyaWFsIChpZiBwcmVzZW50KSAqL1xuICAgICAgICAgICAgICAgIGlmIChJVnNbaXZdLmhhc093blByb3BlcnR5KFwic3RkXzJBRkNcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VySVZMZXZlbC5zdGRfMkFGQyA9IElWc1tpdl0uc3RkXzJBRkM7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLyoqIEZvciAyQUZDIHRoYXQgaXMgc2ltdWx0YW5lb3VzIChhcyBvcHBvc2VkIHRvIHRoZSBmbGlwcGluZyBraW5kKSovXG4gICAgICAgICAgICAgICAgaWYgKElWc1tpdl0uaGFzT3duUHJvcGVydHkoXCJzdGRfMkFGQ19zaW11bHRhbmVvdXNfdGFyZ2V0XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cklWTGV2ZWwuc3RkXzJBRkNfc2ltdWx0YW5lb3VzX3RhcmdldCA9IElWc1tpdl0uc3RkXzJBRkNfc2ltdWx0YW5lb3VzX3RhcmdldDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLyoqIFBhcnNlciBmdW5jdGlvbiovXG4gICAgICAgICAgICAgICAgaWYgKElWc1tpdl0ucGFyc2VyRnVuYyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cklWTGV2ZWwucGFyc2VyRnVuYyA9IElWc1tpdl0ucGFyc2VyRnVuYzsgLy9Db3VsZCB3cml0ZSBhIGNvcHlpbmcgbWV0aG9kIGZvciBhbGwgb2YgdGhlc2UgKHRoYXQgaGFuZGxlcyBkZWVwIGNvcHlpbmcpXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIG5ld09yRXh0ZW5kZWRUcmlhbDtcblxuICAgICAgICAgICAgICAgIGlmIChidWlsZGluZ1RyaWFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9uZXdPckV4dGVuZGVkVHJpYWwgPSAgaXYgKyBcIiAgXCIgKyBsZXZlbFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBuZXdPckV4dGVuZGVkVHJpYWwgPSBbY3VySVZMZXZlbF07XG5cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJ1aWxkaW5nVHJpYWwuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vbmV3T3JFeHRlbmRlZFRyaWFsID0gYnVpbGRpbmdUcmlhbCArIFwiIHwgfCBcIiArIGl2ICsgXCIgIFwiICsgbGV2ZWxWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgbmV3T3JFeHRlbmRlZFRyaWFsID0gYnVpbGRpbmdUcmlhbC5jb25jYXQoW2N1cklWTGV2ZWxdKTsgLy9DcmVhdGVzIGEgYnJhbmQgbmV3IGFycmF5IHcgdGhlIG5ldyBsZXZlbFxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRlbXAucHVzaChuZXdPckV4dGVuZGVkVHJpYWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqIFJlcGxhY2UgeW91ciBwcmV2aW91cyB0cmlhbHMgd2l0aCBUZW1wIChkb25cInQga25vdyB3aG8gdG8gZG8gdGhpcyBpbiBwbGFjZSkgKi9cbiAgICAgICAgX2FsbFRyaWFscyA9IHRlbXA7XG4gICAgfVxuXG5cbiAgICAvKiogRHVwbGljYXRlIHRoZSBjdXJyZW50IGZhY3RvcmlhbCB0cmlhbHMgKi9cbiAgICB2YXIgcmVwZWF0cyA9IGV4cFJlcGVhdHM7XG4gICAgdGVtcCA9IFtdO1xuICAgIGZvciAoaSA9IDA7IGkgPCByZXBlYXRzOyBpKyspIHtcbiAgICAgICAgdGVtcCA9IHRlbXAuY29uY2F0KF9hbGxUcmlhbHMpO1xuICAgIH1cbiAgICBfYWxsVHJpYWxzID0gdGVtcDtcblxuXG4gICAgY29uc29sZS5sb2coXCJUaGVyZSBhcmUgXCIsIF9hbGxUcmlhbHMubGVuZ3RoLCBcInRyaWFscyAodXNpbmdcIiwgcmVwZWF0cywgXCJyZXBlYXRzKVwiKTtcbiAgICBpZiAocHJpbnRUcmlhbHMpe1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgX2FsbFRyaWFscy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlRSSUFMIFwiLCBpKTtcbiAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBfYWxsVHJpYWxzW2ldLmxlbmd0aDsgaisrKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggX2FsbFRyaWFsc1tpXVtqXSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2coXCIqKioqKioqICoqKioqKiogKioqKioqKiAqKioqKioqXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKF9zaG91bGRTaHVmZmxlKSAgICAgX2FsbFRyaWFscy5zaHVmZmxlKCk7XG5cblxuICAgIF90b3RhbFRyaWFscyA9IF9hbGxUcmlhbHMubGVuZ3RoOyAvL1VzZWQgdG8gZGV0ZXJtaW5lIHdoZXJlIHlvdSBhcmUgaW4gdGhlIHRyaWFsIHByb2Nlc3NcbiAgICBfZGlkQnVpbGRUcmlhbHMgPSB0cnVlO1xufVxuXG5cbi8qKlxuICogTk9URTogV2Ugbm8gbG9uZ2VyIGhhbmRsZSBhcHBlYXJhbmNlIG9yIGlucHV0LiBUaGVzZSBhcmUgb3V0IG9mIHRoZSBzY29wZSBvZiB0aGlzIG1vZHVsZS5cbiAqIFRoaXMgbW9kdWxlIG5vdyBvbmx5IGhhbmRsZXMgdGhlIGdhbWUgbG9vcCBvZlxuICogLSB0YWtpbmcgSVZzXG4gKiAtIGJ1aWxkaW5nIGFsbCB0cmlhbHNcbiAqIC0gc2V0dGluZyB0aGUgZGlzcGxheSAoYWNjb3JkaW5nIHRvIHRoZSBzdXBwbGllZCBJVnMpXG4gKiAtIHN0b3JpbmcgJiBvdXRwdXR0aW5nIF9yZXNwb25zZXNcbiAqXG4gKiBBbGwgb3RoZXIgYmVoYXZpb3VyIHNob3VsZCBiZSBwZXJmb3JtZWQgYnkgYW5vdGhlciBtb2R1ZWwgdGhhdCB3b3JrcyB3aXRoIHRoaXMgb25lLlxuICogKi9cblRyaWFscy5idWlsZEV4cGVyaW1lbnQgPSBmdW5jdGlvbiAocHJpbnRUcmlhbHMpIHtcbiAgICBfYnVpbGRUcmlhbHMoIChwcmludFRyaWFscyA9PT0gdW5kZWZpbmVkKSA/IGZhbHNlIDogcHJpbnRUcmlhbHMgKTtcbn07XG5cblxudmFyIF9zaG91bGRTaHVmZmxlID0gdHJ1ZTtcblRyaWFscy5zZXRTaHVmZmxlID0gZnVuY3Rpb24oc2hvdWxkU2h1ZmZsZSl7XG4gICAgaWYgKHR5cGVvZihzaG91bGRTaHVmZmxlKSA9PT0gXCJib29sZWFuXCIpe1xuICAgICAgICBfc2hvdWxkU2h1ZmZsZSA9ICBzaG91bGRTaHVmZmxlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcInNldFNodWZmbGUgb25seSBhY2NlcHRzIGJvb2xlYW4gYXJndW1lbnRcIik7XG4gICAgfVxufTtcblxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRyaWFscyAoc3ViZnVuY3Rpb25zKVxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuZnVuY3Rpb24gX2NzdklsbGVnYWxDaGFyQ2hlY2soc3RyaW5nKXtcblxuICAgIGlmICh0eXBlb2Ygc3RyaW5nICE9PSBcInN0cmluZ1wiKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc3VwcGx5IGEgdmFyaWFibGUgb2YgdHlwZSBTdHJpbmcgZm9yIHRoaXMgbWV0aG9kXCIpO1xuICAgIH1cblxuICAgIGlmIChzdHJpbmcuaW5kZXhPZihcIixcIikgIT09IC0xKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3RyaW5ncyB1c2VkIGJ5IEV4cGVyaW1lbnRKUyBtYXkgbm90IGNvbnRhaW4gY29tbWFzOiBcIiArIHN0cmluZyk7XG4gICAgfVxufVxuXG5leHBvcnQgeyBUcmlhbHMgfTsiLCJpbXBvcnQgeyBfc2hvdWxkUnVuTmV4dFRyaWFsLCBfc2V0U2hvdWxkUnVuTmV4dFRyaWFsIH0gZnJvbSBcIi4vUnVuRXhwZXJpbWVudC5qc1wiO1xuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEludGVyc3RpbXVsdXMgUGF1c2Vcbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cblxuICAgIFxuICAgIFxudmFyIFBhdXNlID0ge307XG5cblBhdXNlLnNob3dJbnRlcnN0aW11bHVzUGF1c2UgPSBmdW5jdGlvbiAoZHVyYXRpb24pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBfaW50ZXJzdGltdWx1c1BhdXNlKGR1cmF0aW9uKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG52YXIgX3BhdXNlID0gNTAwO1xuUGF1c2Uuc2V0UGF1c2VUaW1lID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSBwYXJzZUludCh2YWx1ZSwgMTApKSB7XG4gICAgICAgIF9wYXVzZSA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IFwic2V0UGF1c2VUaW1lIG9ubHkgdGFrZXMgaW50ZWdlcnNcIjtcbiAgICB9XG59O1xuXG5leHBvcnQgdmFyIF9zaG91bGRJbnRlcnN0aW11bHVzUGF1c2UgPSB0cnVlOyAgICAgICAgICAgICAvL3VzZWQgaW46IFJ1bkV4cGVyaW1lbnQuanNcblBhdXNlLnNldFNob3VsZEludGVyc3RpbXVsdXNQYXVzZSA9IGZ1bmN0aW9uKHZhbHVlKXtcbiAgICBpZiAodHlwZW9mICB2YWx1ZSA9PT0gXCJib29sZWFuXCIpe1xuICAgICAgICBfc2hvdWxkSW50ZXJzdGltdWx1c1BhdXNlID0gdmFsdWU7XG4gICAgfVxufTtcblxudmFyIF9ibGFja091dCA9ICQoXCI8ZGl2PlwiLCB7XG4gICAgaWQ6IFwiaW50ZXJzdGltdWx1cy1wYXVzZVwiLFxuICAgIGNzczoge1xuICAgICAgICBwb3NpdGlvbjogXCJmaXhlZFwiLFxuICAgICAgICBsZWZ0OiAwLFxuICAgICAgICB0b3A6IDAsXG4gICAgICAgIHdpZHRoOiBcIjEwMHZ3XCIsXG4gICAgICAgIGhlaWdodDogXCIxMDB2aFwiLFxuICAgICAgICBiYWNrZ3JvdW5kOiBcImJsYWNrXCJcbiAgICB9XG59KTtcblxuJChkb2N1bWVudC5ib2R5KS5hcHBlbmQoX2JsYWNrT3V0KTtcbiQoXCIjaW50ZXJzdGltdWx1cy1wYXVzZVwiKS5oaWRlKCk7XG5cbnZhciBfaXNJbnRlcnN0aW11bHVzUGF1c2UgPSBmYWxzZTtcbmV4cG9ydCBmdW5jdGlvbiBfaW50ZXJzdGltdWx1c1BhdXNlKGR1cmF0aW9uKSB7ICAgICAgICAgLy91c2VkIGluOiBSdW5FeHBlcmltZW50LmpzXG5cbiAgICBkdXJhdGlvbiA9IGR1cmF0aW9uID09PSB1bmRlZmluZWQgPyBfcGF1c2UgOiBkdXJhdGlvbjsgLy9EZWZhdWx0IHRvIHBhdXNlIHRpbWUgdW5sZXNzIGFuIGFyZ3VtZW50IGlzIHN1cHBsaWVkXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAkKFwiI2ludGVyc3RpbXVsdXMtcGF1c2VcIikuc2hvdygpO1xuICAgICAgICBfaXNJbnRlcnN0aW11bHVzUGF1c2UgPSB0cnVlO1xuICAgICAgICBfc2V0U2hvdWxkUnVuTmV4dFRyaWFsKGZhbHNlKTtcblxuICAgICAgICAvKlByZXZlbnQgYnV0dG9uIG1hc2hpbmcgd2hpbGUgdGhlIHBhdXNlIHJ1bnMqL1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICQoXCIjaW50ZXJzdGltdWx1cy1wYXVzZVwiKS5oaWRlKCk7XG4gICAgICAgICAgICBfaXNJbnRlcnN0aW11bHVzUGF1c2UgPSBmYWxzZTtcbiAgICAgICAgICAgIF9zZXRTaG91bGRSdW5OZXh0VHJpYWwodHJ1ZSk7ICAgICAgICAgICAvL0Nhbm5vdCByZWFzc2lnbiBpbXBvcnRlZCB2YWx1ZXMsIHNvIHlvdSBuZWVkIGEgc2V0dGVyXG5cbiAgICAgICAgICAgIHJlc29sdmUoKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9Qcm9taXNlIGhhcyByZXNvbHZlZCBoZXJlXG4gICAgICAgIH0sIGR1cmF0aW9uKTtcbiAgICB9KTtcbn1cblxuXG5leHBvcnQgeyBQYXVzZSB9OyIsIlxuaW1wb3J0IHsgVHJpYWxzLCBzZXRGdW5jcywgX2FsbFRyaWFscywgX2RpZEJ1aWxkVHJpYWxzLCBfZHZOYW1lIH0gZnJvbSBcIi4vVHJpYWxzLmpzXCI7XG5pbXBvcnQgeyBfaW50ZXJzdGltdWx1c1BhdXNlLCBfc2hvdWxkSW50ZXJzdGltdWx1c1BhdXNlIH0gZnJvbSBcIi4vSW50ZXJzdGltdWx1c1BhdXNlLmpzXCI7XG5pbXBvcnQgeyBjcmVhdGVEb3dubG9hZExpbmsgfSBmcm9tIFwiLi4vdXRpbHMvQ3JlYXRlRG93bmxvYWRMaW5rLmpzXCI7XG5pbXBvcnQgeyBnZXRQYXJhbU5hbWVzIH0gZnJvbSBcIi4uL3V0aWxzL1N0cmluZ1V0aWxzLmpzXCI7XG5cbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSdW4gRXhwZXJpbWVudCAtIEdldCBQYXJ0aWNpcGFudCBJbmZvXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG5cbnZhciBfcHB0TmFtZSA9IFwidW5uYW1lZF9wcHRcIjtcbnZhciBfcHB0Tm8gPSAwO1xuXG5UcmlhbHMuZ2V0UHB0SW5mbyA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIF9wcHROYW1lID0gcHJvbXB0KFwiUGxlYXNlIGVudGVyIHlvdXIgbmFtZVwiKS50cmltKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibmFtZSB3YXNcIiwgX3BwdE5hbWUpO1xuICAgICAgICBpZiAoX3BwdE5hbWUgPT09IFwiXCIgfHwgX3BwdE5hbWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGFsZXJ0KFwiTmFtZSBjYW5ub3QgYmUgYmxhbmtcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIF9wcHRObyA9IHBhcnNlSW50KHByb21wdChcIlBsZWFzZSBlbnRlciB5b3VyIHBhcnRpY2lwYW50IG51bWJlclwiKSk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicHB0IG51bWJlciB3YXNcIiwgX3BwdE5vKTtcbiAgICAgICAgaWYgKGlzTmFOKF9wcHRObykpIHtcbiAgICAgICAgICAgIGFsZXJ0KFwiUGFydGljaXBhbnQgbnVtYmVyIG11c3QgYmUgYW4gaW50ZWdlclwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coXCJQYXJ0aWNpcGFudCBuYW1lOiBcIiwgX3BwdE5hbWUsIFwiXFx0UGFydGljaXBhbnQgbnVtYmVyOiBcIiwgX3BwdE5vKTtcbn07XG5cbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSdW4gRXhwZXJpbWVudCAtIEdhbWUgTG9vcFxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuXG4vL0Nhbm5vdCByZWFzc2lnbiBpbXBvcnRlZCB2YWx1ZXMsIHNvIHlvdSBuZWVkIGEgc2V0dGVyICh1c2VkIGluIEludGVyc3RpbWx1c1BhdXNlLmpzKVxuZXhwb3J0IGZ1bmN0aW9uIF9zZXRTaG91bGRSdW5OZXh0VHJpYWwodmFsdWUpe1xuICAgIGlmICh0eXBlb2YodmFsdWUpID09PSBcImJvb2xlYW5cIil7XG4gICAgICAgIF9zaG91bGRSdW5OZXh0VHJpYWwgPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjYW5ub3Qgc2V0IF9zaG91bGRSdW5OZXh0VHJpYWwgdG8gYSBub24gYm9vbGVhbiB2YWx1ZVwiKTtcbiAgICB9XG59XG5cbmV4cG9ydCB2YXIgX3Nob3VsZFJ1bk5leHRUcmlhbCA9IHRydWU7IC8vdXNlZCBieTogSW50ZXJzdGltdWx1c1BhdXNlLmpzXG5UcmlhbHMucnVuTmV4dFRyaWFsID0gZnVuY3Rpb24gKHNldHRpbmdzKSB7IC8vIHVzYWdlIC0+IHJ1bk5leHRUcmlhbCh7c2hvdWxkU3RvcmVSZXNwb25zZTogdHJ1ZSwgZHZfdmFsdWU6IFwiaW5zaWRlXCJ9KTtcblxuICAgIGlmICghX2RpZEJ1aWxkVHJpYWxzKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwicnVuTmV4dFRyaWFsKCk6IFRyaWFsIHdlcmUgbm90IGJ1aWx0XCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKF9zaG91bGRSdW5OZXh0VHJpYWwpIHtcblxuICAgICAgICAvLyBUT0RPOiBDaGFuZ2UgdGhlIGltcGxlbWVudGF0aW9uIG9mIHRoZSBtaWQgY2FsbGJhY2sgLSBKdXN0IGNoZWNrIHRoZSBsZW5ndGggb2YgdGhlIF9yZXNwb25zZXMgYXJyYXkgdnMgdGhlIGFsbHRyaWFscyBhcnJheS4uXG5cbiAgICAgICAgaWYgKF9zaG91bGRSdW5NaWRDYWxsYmFjaygpICYmIF9taWRDYWxsYmFjayAhPT0gbnVsbCkge1xuICAgICAgICAgICAgX21pZENhbGxiYWNrKCk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmIChfc2hvdWxkSW50ZXJzdGltdWx1c1BhdXNlKSB7XG4gICAgICAgICAgICBfaW50ZXJzdGltdWx1c1BhdXNlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2V0dGluZ3MgIT09IHVuZGVmaW5lZCAmJiBzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eShcInNob3VsZFN0b3JlUmVzcG9uc2VcIikgJiYgc2V0dGluZ3Muc2hvdWxkU3RvcmVSZXNwb25zZSkge1xuICAgICAgICAgICAgX3N0b3JlUmVzcG9uc2Uoc2V0dGluZ3MpOyAvL1NldHRpbmdzIGNvbnRhaW5zIGEgZmllbGQgXCJkdl92YWx1ZVwiIHdoaWNoIGlzIGFsc28gcmVhZCBieSBfc3RvcmVSZXNwb25zZVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF9hbGxUcmlhbHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgX2Rpc3BsYXlOZXh0VHJpYWwoKTtcblxuICAgICAgICAgICAgLy8gX2N1cjJBRkNJc1RhcmdldCA9IHRydWU7XG4gICAgICAgICAgICAvKiogQWx3YXlzIHJlc2V0IHRoZSAyQUZDIHZhbHVlKi9cblxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJUaGVyZSBhcmUgXCIsIF9hbGxUcmlhbHMubGVuZ3RoLCBcIiB0cmlhbHMgcmVtYWluaW5nLlwiKTtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgLy9Qb3NzaWJseSB0b28gZGVzdHJ1Y3RpdmVcbiAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkuY2hpbGRyZW4oKS5mYWRlT3V0KCk7XG4gICAgICAgICAgICAvLyAkKFwiI2ludGVyc3RpbXVsdXMtcGF1c2VcIikuaGlkZSgpO1xuICAgICAgICAgICAgX291dHB1dFJlc3BvbnNlcyhfcmVzcG9uc2VzKTtcblxuICAgICAgICAgICAgaWYgKF9lbmRDYWxsQmFjayAhPT0gdW5kZWZpbmVkKSBfZW5kQ2FsbEJhY2soKTtcblxuXG4gICAgICAgIH1cbiAgICB9XG5cbn07XG5cbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbi8vICAgICAgICAgICAgICAgICAgUnVuIEV4cGVyaW1lbnQgLSBNaWQgUG9pbnQgQ2FsbGJhY2sgKGkuZS4gdGhlIFwidGFrZSBhIGJyZWFrXCIgbWVzc2FnZSlcbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cblxuXG52YXIgX2RpZFJ1bk1pZENhbGxiYWNrID0gZmFsc2U7XG52YXIgX21pZENhbGxiYWNrID0gbnVsbDtcblRyaWFscy5zZXRNaWRDYWxsYmFjayA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIil7XG4gICAgICAgIF9taWRDYWxsYmFjayA9IHZhbHVlO1xuICAgIH0gICBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiT25seSBmdW5jdGlvbnMgbWF5IGJlIGFzc2lnbmVkIHRvIHRoZSBlbmQgY2FsbGJhY2tcIik7XG4gICAgfVxufTtcblxuZnVuY3Rpb24gX3Nob3VsZFJ1bk1pZENhbGxiYWNrKCkge1xuICAgIGlmIChfZGlkUnVuTWlkQ2FsbGJhY2spIHJldHVybiBmYWxzZTtcblxuICAgIC8vTWlkIHBvaW50ID0gdGhlcmUgYXJlIGFzIG1hbnkgcmVzcG9uc2VzIGFzIHRyaWFscyAob3IgYSBkaWZmZXJlbmNlIG9mIG9uZSBmb3Igb2RkIG51bWJlciBvZiB0cmlhbHMpXG4gICAgaWYgKF9hbGxUcmlhbHMubGVuZ3RoID09PV9yZXNwb25zZXMubGVuZ3RoIHx8IE1hdGguYWJzKF9hbGxUcmlhbHMubGVuZ3RoIC1fcmVzcG9uc2VzLmxlbmd0aCkgPT09IDEpe1xuICAgICAgICBfZGlkUnVuTWlkQ2FsbGJhY2sgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG5cbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJ1biBFeHBlcmltZW50IC0gRW5kIENhbGxiYWNrXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG52YXIgX2VuZENhbGxCYWNrID0gbnVsbDtcblRyaWFscy5zZXRFbmRDYWxsYmFjayA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIil7XG4gICAgICAgIF9lbmRDYWxsQmFjayA9IHZhbHVlO1xuICAgIH0gICBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiT25seSBmdW5jdGlvbnMgbWF5IGJlIGFzc2lnbmVkIHRvIHRoZSBlbmQgY2FsbGJhY2tcIik7XG4gICAgfVxufTtcblxuXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJ1biBFeHBlcmltZW50IC0gRGlzcGxheWluZyBUaGUgTmV4dCBUcmlhbFxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuXG4vKiogV2hlcmUgdmlldy1sZXZlbCBlbGVtZW50cyBhcmUgc2V0IC0gdGhpcyBpcyBsaWtlIHRoZSBDT05UUk9MTEVSIG1ldGhvZCBpbnRlcmZhY2luZyBiZXR3ZWVuIE1PREVMIGFuZCBWSUVXKi9cbmZ1bmN0aW9uIF9kaXNwbGF5TmV4dFRyaWFsKCkge1xuICAgIHZhciBuZXh0VHJpYWwgPSBfYWxsVHJpYWxzW19hbGxUcmlhbHMubGVuZ3RoIC0gMV07IC8vQWx3YXlzIGdvIGZyb20gdGhlIGJhY2tcbiAgICBjb25zb2xlLmxvZyhcIm5leHQgdHJpYWw6XCIsIG5leHRUcmlhbCk7XG5cbiAgICAvKiogSXRlcmF0ZSBvdmVyIGVhY2ggSVYgYW5kIHNldCBpdHMgcG9pbnRlciB0byBpdHMgdmFsdWUgZm9yIHRoYXQgdHJpYWwgKi9cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5leHRUcmlhbC5sZW5ndGg7ICsraSkge1xuICAgICAgICBfc2V0T2JqZWN0QXBwZWFyYW5jZVByb3BlcnRpZXMobmV4dFRyaWFsW2ldKTtcblxuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9zZXRPYmplY3RBcHBlYXJhbmNlUHJvcGVydGllcyhjdXJQcm9wKSB7XG5cbiAgICAvKiogVXNpbmcgYSBGVU5DVElPTiB0byBzZXQgdGhlIGRpc3BsYXkqL1xuICAgIGlmICggc2V0RnVuY3NbY3VyUHJvcC5kZXNjcmlwdGlvbl0gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgc2V0RnVuY3NbY3VyUHJvcC5kZXNjcmlwdGlvbl0uYXBwbHkobnVsbCwgY3VyUHJvcC52YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gc2V0dGVyIGZ1bmN0aW9uIHN1cHBsaWVkIGJ5OiBcIiArIGN1clByb3ApO1xuICAgIH1cbn1cblxuXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJ1biBFeHBlcmltZW50IC0gU3RvcmUgUmVzcG9uc2Vcbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbmV4cG9ydCB2YXIgX3Jlc3BvbnNlcyA9IFtdO1xuZXhwb3J0IGZ1bmN0aW9uIF9zZXRSZXNwb25zZXMocmVzcG9uc2VzKXtcbiAgICBpZiAocmVzcG9uc2VzLmNvbnN0cnVjdG9yID09PSBBcnJheSl7XG4gICAgICAgIF9yZXNwb25zZXMgPSByZXNwb25zZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwicmVwb25zZXMgY2FuIG9ubHkgYmUgc2V0IHRvIGFuIGFycmF5XCIpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gX3N0b3JlUmVzcG9uc2Uob3B0aW9ucykge1xuXG4gICAgdmFyIGxhc3RUcmlhbCA9IF9hbGxUcmlhbHMucG9wKCk7XG5cbiAgICB2YXIgcmVzcG9uc2VGb3JtYXR0ZWQgPSB7fTtcblxuICAgIC8qKiBTdG9yZSB0aGUgSVYgLT4gV3JpdGUgb3V0IGVhY2ggSVYgKDEgSVYgcGVyIGFycmF5IGVsZW1lbnQpIHRvIGEgZmllbGQgKi9cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhc3RUcmlhbC5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgaXZOdW0gPSBcIklWXCIgKyBpO1xuXG4gICAgICAgIC8vSWYgYSBwYXJzZXIgaXMgZGVmaW5lZCB1c2UgaXRzIG91dHB1dCBhcyB0aGUgdmFsdWUgb2YgdGhlIHJlc3BvbnNlXG4gICAgICAgIGlmIChsYXN0VHJpYWxbaV0ucGFyc2VyRnVuYyAhPT0gdW5kZWZpbmVkICYmICQuaXNGdW5jdGlvbihsYXN0VHJpYWxbaV0ucGFyc2VyRnVuYykpe1xuICAgICAgICAgICAgdmFyIHN0ZE5hbWUgPSBpdk51bSArIFwiX1wiICsgbGFzdFRyaWFsW2ldLmRlc2NyaXB0aW9uICsgXCJfdmFsdWVcIjtcblxuICAgICAgICAgICAgcmVzcG9uc2VGb3JtYXR0ZWRbc3RkTmFtZV0gPSBsYXN0VHJpYWxbaV0ucGFyc2VyRnVuYy5hcHBseSh0aGlzLCBsYXN0VHJpYWxbaV0udmFsdWUuY29uY2F0KGkpICk7IC8vVGhlIGFyZ3MgYXJlIHBhc3NlZCB0byB0aGUgcGFyc2VyIGZ1bmMgd2l0aCB0aGUgaW5kZXggYXMgdGhlIGxhc3QgYXJnXG5cbiAgICAgICAgfSBlbHNlIGlmIChsYXN0VHJpYWxbaV0udmFsdWUuY29uc3RydWN0b3IgPT09IEFycmF5KSB7IC8vQ29uc2lkZXIgdGhlc2UgdG8gYmUgZGVmYXVsdHMgZm9yIGphdmFzY3JpcHQgcHJpbWl0aXZlIHR5cGVzXG5cbiAgICAgICAgICAgIC8qKiBNYW51YWxseSB3cml0ZSBvdXQgZWFjaCBhcmd1bWVudCAoZnJvbSBhbiBhcnJheSkgdG8gYSBmaWVsZCBpbiB0aGUgb2JqZWN0XG4gICAgICAgICAgICAgKiAgT25seSBhcHBlbmQgYSBudW1iZXIgaWYgdGhlcmUgYXJlID4xIGFyZ3VtZW50cyBwYXNzZWQgaW4gKi9cblxuICAgICAgICAgICAgaWYgKGxhc3RUcmlhbFtpXS52YWx1ZS5sZW5ndGggPiAxKXtcblxuICAgICAgICAgICAgICAgIC8vSWYgdXNpbmcgYSBzZXRGdW5jIGZ1bmN0aW9uIHdpdGggbXVsdGlwbGUgYXJncyAtPiB1c2UgdGhlIGFyZyBuYW1lcyB0byBkZXNjcmliZSB0aGUgdmFsdWVzIHdyaXR0ZW4gdG8gdGhlIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgdmFyIGFyZ19uYW1lcywgYXJnX25hbWU7XG4gICAgICAgICAgICAgICAgYXJnX25hbWVzID0gZ2V0UGFyYW1OYW1lcyggc2V0RnVuY3NbbGFzdFRyaWFsW2ldLmRlc2NyaXB0aW9uXSApO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBsYXN0VHJpYWxbaV0udmFsdWUubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICAgICAgICAgICAgYXJnX25hbWUgPSBhcmdfbmFtZXNbal07XG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlRm9ybWF0dGVkW2l2TnVtICsgXCJfXCIgKyBsYXN0VHJpYWxbaV0uZGVzY3JpcHRpb24gKyBcIl92YWx1ZV9cIiArIGFyZ19uYW1lIF0gPSAgbGFzdFRyaWFsW2ldLnZhbHVlW2pdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZUZvcm1hdHRlZFsgaXZOdW0gKyBcIl9cIiArIGxhc3RUcmlhbFtpXS5kZXNjcmlwdGlvbiArIFwiX3ZhbHVlXCIgXSA9ICBsYXN0VHJpYWxbaV0udmFsdWVbMF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3BvbnNlRm9ybWF0dGVkW2l2TnVtICsgXCJfXCIgKyBsYXN0VHJpYWxbaV0uZGVzY3JpcHRpb24gKyBcIl92YWx1ZVwiXSA9IGxhc3RUcmlhbFtpXS52YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKiBBZGQgYSB2YWx1ZSBvZiB0aGUgMmFmYyBzdGQgKGZvciB0aGUgcmVsZXZhbnQgSVYpICovXG4gICAgICAgIGlmIChsYXN0VHJpYWxbaV0uaGFzT3duUHJvcGVydHkoXCJzdGRfMkFGQ1wiKSkge1xuICAgICAgICAgICAgcmVzcG9uc2VGb3JtYXR0ZWRbXCJzdGRfMkFGQ1wiXSA9IGxhc3RUcmlhbFtpXS5zdGRfMkFGQztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBDaGVjayB0aGF0IGEgMmFmYyBzdGQgdmFsdWUgd2FzIGFkZGVkIC0gaWYgbm90IHlvdSB3YW50IHRvIGFkZCBhIG51bGwgdmFsdWUgb3IgaXQgd2lsbCBmdWNrIHVwIHRoZSBjc3Ygd3JpdGUqL1xuICAgIC8vIGlmICghcmVzcG9uc2VGb3JtYXR0ZWQuaGFzT3duUHJvcGVydHkoXCJzdGRfMkFGQ1wiKSAmJiBkaWRTZXQyQUZDKSB7XG4gICAgLy8gICAgIHJlc3BvbnNlRm9ybWF0dGVkW1wic3RkXzJBRkNcIl0gPSBcIm51bGxcIjtcbiAgICAvLyB9XG5cbiAgICBcblxuICAgIC8qKiBTdG9yZSB0aGUgRFYqL1xuICAgIGlmIChvcHRpb25zICE9PSB1bmRlZmluZWQgJiYgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShcImR2X3ZhbHVlXCIpKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IF9kdk5hbWUgfHwgXCJ2YWx1ZVwiO1xuICAgICAgICByZXNwb25zZUZvcm1hdHRlZFtcIkRWX1wiK3ZhbHVlXSA9IG9wdGlvbnMuZHZfdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYWxlcnQoXCJObyBEViB3YXMgc3VwcGxpZWQgYnkgdGhlIGNhbGxpbmcgY29kZS4gVGhpcyBpcyBhbiBlcnJvci5cIik7XG4gICAgICAgIHJlc3BvbnNlRm9ybWF0dGVkW1wiRFZfdmFsdWVcIl0gPSBcIkVSUk9SIC0gTm8gRFYgc3VwcGxpZWRcIjtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhcIlNUT1JFRCBUSElTIFJFU1BPTlNFOiBcIiwgcmVzcG9uc2VGb3JtYXR0ZWQpO1xuXG4gICAgX3Jlc3BvbnNlcy5wdXNoKHJlc3BvbnNlRm9ybWF0dGVkKTtcbn1cblxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSdW4gRXhwZXJpbWVudCAtIE91dHB1dCBSZXNwb25zZXNcbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cblxuVHJpYWxzLmZvcmNlT3V0cHV0UmVzcG9uc2VzID0gZnVuY3Rpb24oKXtcbiAgICBjb25zb2xlLmxvZyhcIkZvcmNpbmcgb3V0cHV0IG9mIF9yZXNwb25zZXNcIik7XG4gICAgX291dHB1dFJlc3BvbnNlcyhfcmVzcG9uc2VzLCB0cnVlKTtcbn07XG5cblxuZnVuY3Rpb24gX291dHB1dFJlc3BvbnNlcyhhbGxSZXNwb25zZXMsIGxvZykge1xuXG4gICAgaWYgKGFsbFJlc3BvbnNlcy5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgIHZhciBjc3ZTdHJpbmcgPSBcIlwiO1xuXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhbGxSZXNwb25zZXNbMF0pO1xuICAgIC8qKlRoZXNlIGFyZSBhbGwgdGhlIGNvbHVtbnMgaW4gdGhlIG91dHB1dCovXG5cbiAgICAvKiogTWFrZSB0aGUgaGVhZGVyKi9cbiAgICBjc3ZTdHJpbmcgKz0gXCJQYXJ0aWNpcGFudCBOYW1lLCBQYXJ0aWNpcGFudCBOdW1iZXIsIFwiOyAvL01hbnVhbGx5IGFkZCBoZWFkZXJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY3N2U3RyaW5nICs9IGtleXNbaV0gKyBcIixcIjtcbiAgICB9XG4gICAgY3N2U3RyaW5nID0gY3N2U3RyaW5nLnNsaWNlKDAsIC0xKSArIFwiXFxuXCI7Ly9DdXQgdHJhaWxpbmcgY29tbWEgYW5kIHB1dCBpbiBhIG5ldyByb3cvbGluZVxuXG4gICAgLyoqIEZpbGwgdGhlIGRhdGEgLSBUaGlzIHRpbWUgaXRzIGFuIGFycmF5IG9mIGFycmF5cyBub3QgYXJyYXkgb2YgZGljdGlvbmFyaWVzICovXG4gICAgZm9yIChpID0gMDsgaSA8IGFsbFJlc3BvbnNlcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgIGNzdlN0cmluZyArPSBfcHB0TmFtZSArIFwiLFwiICsgX3BwdE5vICsgXCIsXCI7IC8vTWFuYXVsbHkgYWRkIGNvbnRlbnRcblxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGtleXMubGVuZ3RoOyBqKyspIHsgLy9JdGVyYXRlIG92ZXIgdGhlIGtleXMgdG8gZ2V0IHRlaCB2YWx1ZXNcblxuICAgICAgICAgICAgdmFyIHZhbHVlID0gYWxsUmVzcG9uc2VzW2ldW2tleXNbal1dO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJ3cml0aW5nIHRoaXMgcmF3IHZhbHVlIFwiLCB2YWx1ZSwga2V5c1tqXSk7XG4gICAgICAgICAgICAvL3ZhbHVlID0gY2hlY2tSZXR1cm5Qcm9wcyggdmFsdWUsIHRydWUgKSB8fCB2YWx1ZTsgIC8vUGFyc2Ugb3V0IHJlbGV2YW50IG9iamVjdCBmaWVsZHNcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJBZmVyIGl0IHdhcyBwYXJzZWQ6XCIsIHZhbHVlLCBcIlxcbioqKioqKioqKlwiKTtcbiAgICAgICAgICAgIGNzdlN0cmluZyArPSB2YWx1ZSArIFwiLFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgY3N2U3RyaW5nID0gY3N2U3RyaW5nLnNsaWNlKDAsIC0xKSArIFwiXFxuXCI7IC8vQ3V0IHRyYWlsaW5nIGNvbW1hIGFuZCBwdXQgaW4gYSBuZXcgcm93L2xpbmVcbiAgICB9XG5cbiAgICBpZiAobG9nKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGNzdlN0cmluZyk7XG4gICAgfVxuXG4gICAgLyoqIEhlbHAgb3V0IGEgbWFjaGluZSB0b2RheSovXG4gICAgdmFyIGNzdkNvbnRlbnQgPSBlbmNvZGVVUkkoXCJkYXRhOnRleHQvY3N2O2NoYXJzZXQ9dXRmLTgsXCIgKyBjc3ZTdHJpbmcpO1xuICAgIHZhciBhID0gY3JlYXRlRG93bmxvYWRMaW5rKFwicmVzdWx0cyAoXCIgKyBfcHB0TmFtZSArIFwiLFwiICsgX3BwdE5vLnRvU3RyaW5nKCkgKyBcIikuY3N2XCIsIGNzdkNvbnRlbnQpO1xuICAgIGEuaW5uZXJIVE1MID0gXCI8aDQ+Q2xpY2sgdG8gZG93bmxvYWQgcmVzdWx0cyE8L2g0PlwiO1xuICAgIGEuY2xhc3NOYW1lICs9IFwiIHJlc3VsdHMtZG93bmxvYWRcIjtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGEpO1xuICAgIGEuY2xpY2soKTtcbn1cblxuXG4iLCJpbXBvcnQgeyBUcmlhbHMsX2FsbFRyaWFscywgX3NldEFsbFRyaWFscywgX2RpZEJ1aWxkVHJpYWxzfSBmcm9tIFwiLi9UcmlhbHMuanNcIjtcbmltcG9ydCB7IF9yZXNwb25zZXMsIF9zZXRSZXNwb25zZXMgfSBmcm9tIFwiLi9SdW5FeHBlcmltZW50LmpzXCI7XG5cblxudmFyIFNhdmVzID0ge307XG5cblNhdmVzLnBhcnNlVHJpYWxzRm9yU2F2aW5nID0gdW5kZWZpbmVkOyAvL2ludGVyZmFjZSBpcyAoX2FsbFRyaWFscylcblNhdmVzLnBhcnNlUmVzcG9uc2VzRm9yU2F2aW5nID0gdW5kZWZpbmVkOyAvL2ludGVyZmFjZSBpcyAoX3Jlc3BvbnNlcylcblNhdmVzLnVucGFyc2VTYXZlZFRyaWFscyA9IHVuZGVmaW5lZDtcblNhdmVzLnVucGFyc2VTYXZlZFJlc3BvbnNlcyA9IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gZXJyb3JDaGVja1NhdmluZ1BhcnNlcnMoKXtcbiAgICBpZiAoU2F2ZXMucGFyc2VUcmlhbHNGb3JTYXZpbmcgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHJlc3RvcmUgdHJpYWxzIHdpdGhvdXQgcGFyc2luZyBmdW5jdGlvblwiKTtcbiAgICBpZiAoU2F2ZXMucGFyc2VSZXNwb25zZXNGb3JTYXZpbmcgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHJlc3RvcmUgX3Jlc3BvbnNlcyB3aXRob3V0IHBhcnNpbmcgZnVuY3Rpb25cIik7XG4gICAgaWYgKFNhdmVzLnVucGFyc2VTYXZlZFRyaWFscyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgcmVzdG9yZSB0cmlhbHMgd2l0aG91dCBVTnBhcnNpbmcgZnVuY3Rpb25cIik7XG4gICAgaWYgKFNhdmVzLnVucGFyc2VTYXZlZFJlc3BvbnNlcyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgcmVzdG9yZSBfcmVzcG9uc2VzIHdpdGhvdXQgVU5wYXJzaW5nIGZ1bmN0aW9uXCIpO1xufVxuXG5cblNhdmVzLmNsZWFyU2F2ZXMgPSBmdW5jdGlvbigpe1xuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwiZXhwZXJpbWVudEpTc2F2ZXNcIik7Ly8vLy9cbn07XG5cblxuU2F2ZXMuc2F2ZUJ1aWx0VHJpYWxzQW5kUmVzcG9uc2VzID0gZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgZXJyb3JDaGVja1NhdmluZ1BhcnNlcnMoKTtcblxuICAgIGlmICh0eXBlb2YoU3RvcmFnZSkgIT09IFwidW5kZWZpbmVkXCIpIHtcblxuICAgICAgICAvLyBsb2NhbFN0b3JhZ2UuZXhwZXJpbWVudEpTc2F2ZXMgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgLy9QYXJzZSB5b3VyIHRyaWFscywgdXNpbmcgdGhlIGN1c3RvbSBzZXJpYWxpemVyLi5cbiAgICAgICAgdmFyIHRyaWFsc0ZvclNhdmluZyA9IFNhdmVzLnBhcnNlVHJpYWxzRm9yU2F2aW5nKF9hbGxUcmlhbHMpO1xuICAgICAgICB2YXIgcmVzcG9uc2VzRm9yU2F2aW5nID0gU2F2ZXMucGFyc2VSZXNwb25zZXNGb3JTYXZpbmcoX3Jlc3BvbnNlcyk7XG5cbiAgICAgICAgLy9KU09OaWZ5IHRoZSB0cmlhbHMgYW5kIF9yZXNwb25zZXNcbiAgICAgICAgdmFyIGV4cGVyaW1lbnRKU3NhdmVzID0ge307XG4gICAgICAgIGV4cGVyaW1lbnRKU3NhdmVzW1widHJpYWxzXCJdID0gdHJpYWxzRm9yU2F2aW5nO1xuICAgICAgICBleHBlcmltZW50SlNzYXZlc1tcInJlc3BvbnNlc1wiXSA9IHJlc3BvbnNlc0ZvclNhdmluZztcblxuICAgICAgICB2YXIgbXNnID0gcHJvbXB0KFwiQWRkIGEgbWVzc2FnZSB0byB0aGlzIHNhdmUhXCIpO1xuXG4gICAgICAgIGlmIChtc2cgPT09IG51bGwpe1xuICAgICAgICAgICAgYWxlcnQoXCJUcmlhbHMgd2lsbCBub3QgYmUgc2F2ZWRcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGF0ZUtleSA9IChuZXcgRGF0ZSgpKS50b1VUQ1N0cmluZygpOyAvL1ZlcnkgY2xlYXIgZGF0ZVxuXG4gICAgICAgIC8vTWFrZSBhIG5ldyBkaWN0aW9uYXJ5IG9yIGdldCB0aGUgb2xkIG9uZVxuICAgICAgICB2YXIga2V5ZWRfYnlfZGF0ZXMgPSAobG9jYWxTdG9yYWdlLmV4cGVyaW1lbnRKU3NhdmVzID09PSB1bmRlZmluZWQpID8ge30gOiBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5leHBlcmltZW50SlNzYXZlcyk7XG5cbiAgICAgICAgLy9zYXZlIHRvIGl0XG4gICAgICAgIGtleWVkX2J5X2RhdGVzW21zZyArIFwiIC0gXCIgK2RhdGVLZXldID0gZXhwZXJpbWVudEpTc2F2ZXM7XG5cbiAgICAgICAgLy9zZXJpYWxpemUhXG4gICAgICAgIGxvY2FsU3RvcmFnZS5leHBlcmltZW50SlNzYXZlcyA9IEpTT04uc3RyaW5naWZ5KGtleWVkX2J5X2RhdGVzKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhcIlNhdmVkIFRyaWFsc1wiLCBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5leHBlcmltZW50SlNzYXZlcykpO1xuICAgIH1cbn07XG5cblxuU2F2ZXMuc2V0U2F2ZWRUcmlhbHNBbmRSZXNwb25zZXMgPSBmdW5jdGlvbigpe1xuICAgIGVycm9yQ2hlY2tTYXZpbmdQYXJzZXJzKCk7XG5cbiAgICB2YXIgYWxsX3NhdmVzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZXhwZXJpbWVudEpTc2F2ZXMpO1xuXG4gICAgY29uc29sZS5sb2coXCJhbGwgc2F2ZXMrIFwiLCBhbGxfc2F2ZXMpO1xuXG5cbiAgICB2YXIgc2VsZWN0X2JpdHMgPSBfY3JlYXRlRHJvcERvd25TZWxlY3QoYWxsX3NhdmVzKTtcbiAgICBzZWxlY3RfYml0cy5idXR0b24uY2xpY2soZnVuY3Rpb24oKXtcblxuICAgICAgICB2YXIgdGVtcF91c2luZyA9IHNlbGVjdF9iaXRzLnNlbGVjdC5maW5kKFwiOnNlbGVjdGVkXCIpLnRleHQoKTtcblxuICAgICAgICB0ZW1wX3VzaW5nID0gYWxsX3NhdmVzW3RlbXBfdXNpbmddO1xuXG4gICAgICAgIF9zZXRBbGxUcmlhbHMoIFNhdmVzLnVucGFyc2VTYXZlZFRyaWFscyh0ZW1wX3VzaW5nW1widHJpYWxzXCJdKSApO1xuICAgICAgICBfc2V0UmVzcG9uc2VzKCBTYXZlcy51bnBhcnNlU2F2ZWRSZXNwb25zZXModGVtcF91c2luZ1tcInJlc3BvbnNlc1wiXSkgKTtcbiAgICAgICAgaWYgKF9yZXNwb25zZXMgPT09IHVuZGVmaW5lZCB8fCBfcmVzcG9uc2VzID09PSBudWxsKSBfc2V0UmVzcG9uc2VzKCBbXSApO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwicmVzdG9yZWQgYWxsIHRyaWFsczogXCIsIF9hbGxUcmlhbHMpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInJlc3RvcmVkIGFsbCBfcmVzcG9uc2VzOiBcIiwgX3Jlc3BvbnNlcyk7XG5cbiAgICAgICAgVHJpYWxzLnJ1bk5leHRUcmlhbCgpO1xuXG4gICAgICAgIC8vUmVtb3ZlIHNlbGVjdCBmcm9tIGRvbVxuICAgICAgICBzZWxlY3RfYml0cy53cmFwLnJlbW92ZSgpO1xuICAgIH0pO1xuXG4gICAgc2VsZWN0X2JpdHMuYnV0dG9uX2NsZWFyLmNsaWNrKGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgaWYgKGNvbmZpcm0oXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIGFsbCBzYXZlZCBleHBlcmltZW50cz9cIikpe1xuICAgICAgICAgICAgU2F2ZXMuY2xlYXJTYXZlcygpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9SZW1vdmUgc2VsZWN0IGZyb20gZG9tXG4gICAgICAgIHNlbGVjdF9iaXRzLndyYXAucmVtb3ZlKCk7XG4gICAgfSk7XG5cbn07XG5cblxuZnVuY3Rpb24gX2NyZWF0ZURyb3BEb3duU2VsZWN0KGFsbF9zYXZlcyl7XG5cbiAgICB2YXIgZGl2ID0gJChcIjxkaXY+XCIsIHtcbiAgICAgICAgaWQ6IFwic2F2ZWRfaW5mb1wiXG4gICAgfSk7XG5cbiAgICAvL01ha2UgYSBzZWxlY3QgdG8gY2hvb3NlIGZyb20gdGhlIHNhdmVzXG4gICAgdmFyIHNlbCA9ICQoXCI8c2VsZWN0PlwiKTtcbiAgICBPYmplY3Qua2V5cyhhbGxfc2F2ZXMpLm1hcChmdW5jdGlvbihlbGVtLCBpLCBhbGwpe1xuICAgICAgICAvL1VzZSB0aGUgaW5kZXggYXMgdGhlIGtleVxuICAgICAgICBzZWwuYXBwZW5kKCQoXCI8b3B0aW9uPlwiKS5hdHRyKFwidmFsdWVcIixpKS50ZXh0KGVsZW0pKTtcbiAgICB9KTtcblxuXG4gICAgLy9CdXR0b24gLSBubyBmdW5jdGlvbmFsaXR5IGhlcmUsIGp1c3Qgdmlld1xuICAgIHZhciBiID0gJChcIjxidXR0b24+XCIpLnRleHQoXCJDaG9vc2VcIik7XG4gICAgdmFyIGJfY2xlYXIgPSAkKFwiPGJ1dHRvbj5cIikudGV4dChcIkNsZWFyXCIpO1xuXG4gICAgZGl2LmFwcGVuZChzZWwpO1xuICAgIGRpdi5hcHBlbmQoJChcIjxicj5cIikpO1xuICAgIGRpdi5hcHBlbmQoYik7XG4gICAgZGl2LmFwcGVuZChiX2NsZWFyKTtcbiAgICAkKGRvY3VtZW50LmJvZHkpLmFwcGVuZChkaXYpO1xuXG4gICAgZGl2LmNzcyh7XG4gICAgICAgIHBvc2l0aW9uOiBcImZpeGVkXCIsXG4gICAgICAgIHRvcDogXCI0NXZoXCIsXG4gICAgICAgIGxlZnQ6IFwiMjV2d1wiLFxuICAgICAgICB3aWR0aDogXCI1MHZ3XCIsXG4gICAgICAgIGhlaWdodDogXCI1dmhcIixcbiAgICAgICAgYmFja2dyb3VuZDogXCJ3aGl0ZVwiLFxuICAgICAgICBib3JkZXI6IFwiMnZ3XCIsXG4gICAgICAgIFwidGV4dC1hbGlnblwiOiBcImNlbnRlclwiXG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBzZWxlY3Q6IHNlbCxcbiAgICAgICAgYnV0dG9uOiBiLFxuICAgICAgICBidXR0b25fY2xlYXI6IGJfY2xlYXIsXG4gICAgICAgIHdyYXA6IGRpdlxuICAgIH07XG59XG5cblxuZXhwb3J0IHsgU2F2ZXMgfTsiLCIvL09yZGVyIGlzIGltcG9ydGFudFxuaW1wb3J0IHsgVHJpYWxzIH0gZnJvbSAgXCIuL1RyaWFscy5qc1wiOyAvL05lZWRzIC4vIHRvIHRyZWF0IGl0IGFzIGFuIGludGVybmFsIChub3QgZXh0ZXJuYWwgZGVwZW5kZW5jeSlcbmltcG9ydCBcIi4vUnVuRXhwZXJpbWVudC5qc1wiO1xuLy9pbXBvcnQgXCIuLzJBRkMuanNcIjtcblxuaW1wb3J0IHsgUGF1c2UgfSBmcm9tICBcIi4vSW50ZXJzdGltdWx1c1BhdXNlLmpzXCI7XG5pbXBvcnQgeyBTYXZlcyB9IGZyb20gXCIuL1NhdmVzLmpzXCI7XG5cblxuLy9UaGVzZSBhcmUgdGhlIGZpZWxkcyBvZiBFeHBlcmltZW50SlNcbmV4cG9ydCB7IFRyaWFscyB9O1xuZXhwb3J0IHsgUGF1c2UgfTtcbmV4cG9ydCB7IFNhdmVzIH07Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFPLFNBQVMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQzs7SUFFOUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNkLENBQUMsQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDO0lBQ3BCLENBQUMsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDOztJQUV0QixPQUFPLENBQUMsQ0FBQzs7O0FDUGI7OztB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
