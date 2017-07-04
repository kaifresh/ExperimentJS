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
//                                  Experiment Lifecycle - Start & Game Loop
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

exports.Trials = Trials;
exports.Pause = Pause;
exports.Saves = Saves;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwZXJpbWVudEpTLmpzIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMvQ3JlYXRlRG93bmxvYWRMaW5rLmpzIiwiLi4vc3JjL3V0aWxzL1NodWZmbGUuanMiLCIuLi9zcmMvdXRpbHMvU3RyaW5nVXRpbHMuanMiLCIuLi9zcmMvdXRpbHMvTnVtYmVyVXRpbHMuanMiLCIuLi9zcmMvdXRpbHMvdXRpbHMuanMiLCIuLi9zcmMvY29yZS9UcmlhbHMuanMiLCIuLi9zcmMvY29yZS9JbnRlcnN0aW11bHVzUGF1c2UuanMiLCIuLi9zcmMvY29yZS9SdW5FeHBlcmltZW50LmpzIiwiLi4vc3JjL2NvcmUvU2F2ZXMuanMiLCIuLi9zcmMvY29yZS9jb3JlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBjcmVhdGVEb3dubG9hZExpbmsoZmlsZW5hbWUsIGRhdGEpe1xuICAgIC8vLy9odHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE3ODM2MjczL2V4cG9ydC1qYXZhc2NyaXB0LWRhdGEtdG8tY3N2LWZpbGUtd2l0aG91dC1zZXJ2ZXItaW50ZXJhY3Rpb25cbiAgICB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgIGEuaHJlZiA9IGRhdGE7XG4gICAgYS50YXJnZXQgPSBcIl9ibGFua1wiO1xuICAgIGEuZG93bmxvYWQgPSBmaWxlbmFtZTtcbiBcbiAgICByZXR1cm4gYTtcbn0iLCIvLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEZpc2NoZXIgWWF0ZXMgU2h1ZmZsZVxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuQXJyYXkucHJvdG90eXBlLnNodWZmbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGN1cnJlbnRJbmRleCA9IHRoaXMubGVuZ3RoLCB0ZW1wb3JhcnlWYWx1ZSwgcmFuZG9tSW5kZXg7XG5cbiAgICAvLyBXaGlsZSB0aGVyZSByZW1haW4gZWxlbWVudHMgdG8gc2h1ZmZsZS4uLlxuICAgIHdoaWxlICgwICE9PSBjdXJyZW50SW5kZXgpIHtcblxuICAgICAgICAvLyBQaWNrIGEgcmVtYWluaW5nIGVsZW1lbnQuLi5cbiAgICAgICAgcmFuZG9tSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjdXJyZW50SW5kZXgpO1xuICAgICAgICBjdXJyZW50SW5kZXggLT0gMTtcblxuICAgICAgICAvLyBBbmQgc3dhcCBpdCB3aXRoIHRoZSBjdXJyZW50IGVsZW1lbnQuXG4gICAgICAgIHRlbXBvcmFyeVZhbHVlID0gdGhpc1tjdXJyZW50SW5kZXhdO1xuICAgICAgICB0aGlzW2N1cnJlbnRJbmRleF0gPSB0aGlzW3JhbmRvbUluZGV4XTtcbiAgICAgICAgdGhpc1tyYW5kb21JbmRleF0gPSB0ZW1wb3JhcnlWYWx1ZTtcbiAgICB9XG59OyIsIlxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdHJpbmcgVXRpbHNcbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbWVsVG9TZW50ZW5jZUNhc2Uoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5zcGxpdCgvKD89W0EtWl0pLykuam9pbihcIiBcIikudG9Mb3dlckNhc2UoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBhcmFtTmFtZXMoZm4pe1xuICAgIC8vd3JhcCB0aGVzZSBzbyBhcyBub3QgdG8gcG9sbHV0ZSB0aGUgbmFtZXNwYWNlXG4gICAgdmFyIFNUUklQX0NPTU1FTlRTID0gLygoXFwvXFwvLiokKXwoXFwvXFwqW1xcc1xcU10qP1xcKlxcLykpL21nO1xuICAgIHZhciBBUkdVTUVOVF9OQU1FUyA9IC8oW15cXHMsXSspL2c7XG4gICAgZnVuY3Rpb24gX2dldFBhcmFtTmFtZXMoZnVuYykge1xuICAgICAgICB2YXIgZm5TdHIgPSBmdW5jLnRvU3RyaW5nKCkucmVwbGFjZShTVFJJUF9DT01NRU5UUywgXCJcIik7XG4gICAgICAgIHZhciByZXN1bHQgPSBmblN0ci5zbGljZShmblN0ci5pbmRleE9mKFwiKFwiKSsxLCBmblN0ci5pbmRleE9mKFwiKVwiKSkubWF0Y2goQVJHVU1FTlRfTkFNRVMpO1xuICAgICAgICBpZihyZXN1bHQgPT09IG51bGwpXG4gICAgICAgICAgICByZXN1bHQgPSBbXTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICByZXR1cm4gX2dldFBhcmFtTmFtZXMoZm4pO1xufSIsIi8qKlxuICogQ3JlYXRlZCBieSBrYWkgb24gNS8xLzE3LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNGbG9hdChuKSB7XG4gICAgcmV0dXJuIE51bWJlcihuKSA9PT0gbiAmJiBuICUgMSAhPT0gMDtcbn0iLCIvKipcbiAqIENyZWF0ZWQgYnkga2FpIG9uIDUvMS8xNy5cbiAqL1xuXG5cbmltcG9ydCBcIi4vQ3JlYXRlRG93bmxvYWRMaW5rLmpzXCI7XG5pbXBvcnQgXCIuL1NodWZmbGUuanNcIjtcbmltcG9ydCBcIi4vU3RyaW5nVXRpbHMuanNcIjtcbmltcG9ydCBcIi4vTnVtYmVyVXRpbHMuanNcIjtcbiIsIi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUcmlhbHMgLSBDcmVhdGlvblxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuXG52YXIgVHJpYWxzID0ge307XG5leHBvcnQgdmFyIElWcyA9IHt9O1xuZXhwb3J0IHZhciBzZXRGdW5jcyA9IHt9O1xuXG52YXIgZXhwUmVwZWF0cyA9IDE7XG5cbi8qKiBFdmVyeSBJViByZXF1aXJlcyAyIHN0ZXBzOiBjcmVhdGluZyB0aGUgbGV2ZWxzIGFuZCB0aGVuLCBzZXR0aW5nIHRoZSB0YXJnZXQgKi9cblRyaWFscy5zZXRJVkxldmVscyA9IGZ1bmN0aW9uIChpdm5hbWUsIGxldmVscykge1xuICAgIF9zZXRJVkdlbmVyaWMoaXZuYW1lLCBcImxldmVsc1wiLCBsZXZlbHMpO1xufTtcblxuXG5UcmlhbHMuc2V0SVZzZXRGdW5jID0gZnVuY3Rpb24oaXZuYW1lLCBzZXRGdW5jKSB7XG5cbiAgICAvL1RoaXMgaXMgbm93IGEgZmxhZyB0byBub3RpZnkgRXhwZXJpbWVudEpTIHRoYXQgeW91XCJyZSB1c2luZyBmdW5jdGlvbnNcbiAgICBfc2V0SVZHZW5lcmljKGl2bmFtZSwgXCJzZXRGdW5jXCIsIHRydWUpO1xuXG4gICAgLy9GdW5jdGlvbnMgYXJlIG5vdyBzdG9yZWQgaW4gdGhlaXIgb3duIG1hcCwga2V5ZWQgYnkgaXZuYW1lXG4gICAgX3NldFNldEZ1bmMoaXZuYW1lLCBzZXRGdW5jKTtcbn07XG5cbmV4cG9ydCB2YXIgX2R2TmFtZTtcblRyaWFscy5zZXREVk5hbWUgPSBmdW5jdGlvbihkdk5hbWUpe1xuICAgIGlmICh0eXBlb2YgZHZOYW1lID09PSBcInN0cmluZ1wiKXtcbiAgICAgICAgX2NzdklsbGVnYWxDaGFyQ2hlY2soZHZOYW1lKTtcbiAgICAgICAgX2R2TmFtZSA9IGR2TmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyAgbmV3IEVycm9yKFwiVGhlIHN1cHBsaWVkIERWIG5hbWUgbXVzdCBiZSBvZiB0eXBlIFN0cmluZ1wiKTtcbiAgICB9XG59O1xuXG4vKlxuIFRoZSB0cmlhbCB2YWx1ZSB3aWxsIGFsd2F5cyBiZSBwYXNzZWQgaW4gYXMgdGhlIGZpcnN0IGFyZ3VtZW50XG4gVGhlIHR5cGUgb2YgdGhhdCB0cmlhbCB2YWx1ZSB3aWxsIGJlIHRoZSBmaXJzdCBub24gYXJyYXktb2YtYXJyYXlzIGluIHRoZSBleHBlcmltZW50XG4gcGFyc2VyRnVuY3MgYXJlIHBhc3NlZCBhcmdzIGluIHRoaXMgb3JkZXIgKHRyaWFsSVYsIGkpXG4gcGFyc2VyRnVuY3MgbXVzdCByZXR1cm4gdGhlIGZvcm1hdHRlZCB2YWx1ZVxuIFRoaXMgYXNzdW1lcyB5b3Uga25vdyB0aGUgY29udGVudCBvZiB0aGUgdHJpYWwgdmFsdWUsIHdoaWNoIHlvdSBzaG91bGQuLi4uXG4gKi9cblRyaWFscy5zZXRJVlRyaWFsUGFyc2VyRnVuYyA9IGZ1bmN0aW9uIChpdm5hbWUsIHBhcnNlckZ1bmMpIHtcbiAgICBfc2V0SVZHZW5lcmljKGl2bmFtZSwgXCJwYXJzZXJGdW5jXCIsIHBhcnNlckZ1bmMpO1xufTtcblxuXG5UcmlhbHMuc2V0UmVwZWF0cyA9IGZ1bmN0aW9uIChuUmVwZWF0cykge1xuICAgIGV4cFJlcGVhdHMgPSBuUmVwZWF0cztcbn07XG5cblxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRyaWFscyAtIENyZWF0aW9uIChwcml2YXRlKVxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuLypcbiogKi9cbmV4cG9ydCBmdW5jdGlvbiBfc2V0SVZHZW5lcmljKGl2TmFtZSwgZmllbGROYW1lLCBmaWVsZFZhbCkgeyAvL3VzZWQgYnkgMkFGQy5qc1xuICAgIF9jc3ZJbGxlZ2FsQ2hhckNoZWNrKGl2TmFtZSk7XG4gICAgX2NzdklsbGVnYWxDaGFyQ2hlY2soZmllbGROYW1lKTtcbiAgICBpZiAoIUlWcy5oYXNPd25Qcm9wZXJ0eShpdk5hbWUpKSB7IC8vSWYgSVYgZG9lbnN0IGV4aXN0cyBtYWtlIGl0IGFzIGEgcmF3IG9iamVjdFxuICAgICAgICBJVnNbaXZOYW1lXSA9IHt9O1xuICAgIH1cblxuICAgIElWc1tpdk5hbWVdW2ZpZWxkTmFtZV0gPSBmaWVsZFZhbDtcbn1cblxuXG5mdW5jdGlvbiBfc2V0U2V0RnVuYyhpdm5hbWUsIHNldGZ1bmMpe1xuICAgIHNldEZ1bmNzW2l2bmFtZV0gPSBzZXRmdW5jO1xufVxuXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVHJpYWxzIC0gQnVpbGRpbmdcbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cblxudmFyIF90b3RhbFRyaWFscyA9IC0xOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQXNzaWduZWQgYnV0IG5ldmVyIHVzZWRcbmV4cG9ydCB2YXIgX2FsbFRyaWFscyA9IFtdO1xuZXhwb3J0IGZ1bmN0aW9uIF9zZXRBbGxUcmlhbHMoYWxsdHJpYWxzKXtcbiAgICBpZiAoYWxsdHJpYWxzLmNvbnN0cnVjdG9yID09PSBBcnJheSl7XG4gICAgICAgIF9hbGxUcmlhbHMgPSBhbGx0cmlhbHM7XG4gICAgfVxufVxuXG5UcmlhbHMuZ2V0VHJpYWxzID0gZnVuY3Rpb24oKXtcbiAgICBpZiAoX2FsbFRyaWFscy5sZW5ndGggPiAwKXtcbiAgICAgICAgcmV0dXJuICQuZXh0ZW5kKHRydWUsIFtdLCBfYWxsVHJpYWxzKTtcbiAgICB9XG59O1xuXG5leHBvcnQgdmFyIF9kaWRCdWlsZFRyaWFscyA9IGZhbHNlO1xuZnVuY3Rpb24gX2J1aWxkVHJpYWxzKHByaW50VHJpYWxzKSB7XG5cbiAgICBjb25zb2xlLmxvZyhcIkJ1aWxkIFRyaWFscy4gSVZTOlwiLCBJVnMpO1xuXG4gICAgdmFyIGJ1aWxkaW5nVHJpYWwsIHRlbXA7XG5cbiAgICBmb3IgKHZhciBpdiBpbiBJVnMpIHsgLy9JdGVyYXRlIG92ZXIgSVZzXG5cbiAgICAgICAgaWYgKElWc1tpdl0ubGV2ZWxzID09PSB1bmRlZmluZWQpICB0aHJvdyBuZXcgRXJyb3IoXCJMZXZlbHMgbm90IHN1cHBsaWVkIGZvciBcIiArIGl2KTtcbiAgICAgICAgaWYgKElWc1tpdl0uc2V0RnVuYyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoXCJTZXR0ZXIgZnVuY3Rpb24gbm90IHN1cHBsaWVkIGZvciBcIiArIGl2KTtcblxuICAgICAgICBjb25zb2xlLmxvZyhcIkV4dGVuZGluZyBhbGwgdHJpYWxzIGFycmF5IHdpdGg6IFwiICsgaXYgKyBcIiAoXCIgKyBJVnNbaXZdLmxldmVscy5sZW5ndGggKyBcIiBsZXZlbHMpXCIpO1xuXG4gICAgICAgIGlmIChzZXRGdW5jc1tpdl0gPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKFwiU2V0RnVuYyBub3QgZGVmaW5lZCBmb3IgXCIgKyBpdik7XG5cbiAgICAgICAgdGVtcCA9IFtdO1xuXG4gICAgICAgIHZhciBsZW4gPSBfYWxsVHJpYWxzLmxlbmd0aCA9PT0gMCA/IDEgOiBfYWxsVHJpYWxzLmxlbmd0aDsgLy8gRm9yIHRoZSBmaXJzdCBwYXNzXG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkgeyAvL0ZvciBhbGwgdHJpYWxzIGJ1aWx0IHNvIGZhclxuXG4gICAgICAgICAgICBidWlsZGluZ1RyaWFsID0gX2FsbFRyaWFscy5wb3AoKTsgLy9Qb3AgdGhlIGluY29tcGxldGUgYXJyYXkgb2YgaXYtdmFscyAob2JqZWN0cykgYW5kIGV4dGVuZFxuXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IElWc1tpdl0ubGV2ZWxzLmxlbmd0aDsgKytqKSB7IC8vRXh0ZW5kIHRoZW0gYnkgYWxsIHRoZSBsZXZlbHMgb2YgdGhlIG5leHQgSVZcblxuXG4gICAgICAgICAgICAgICAgLyoqIFNldCB0aGUgdmFsdWUgJiBkZXNjcmlwdGlvbiBvZiB0aGUgY3VycmVudCBJViBvYmogNCB0aGUgY3VycmVudCBMZXZlbCAqL1xuICAgICAgICAgICAgICAgIHZhciBjdXJJVkxldmVsID0ge307XG4gICAgICAgICAgICAgICAgY3VySVZMZXZlbC5kZXNjcmlwdGlvbiA9IGl2OyAvL2NhbWVsVG9TZW50ZW5jZUNhc2UoaXYpO1xuICAgICAgICAgICAgICAgIGN1cklWTGV2ZWwudmFsdWUgPSBJVnNbaXZdLmxldmVsc1tqXTtcblxuICAgICAgICAgICAgICAgIC8qKiBTdG9yZSAyQUZDIHN0ZCB3aXRoIGVhY2ggdHJpYWwgKGlmIHByZXNlbnQpICovXG4gICAgICAgICAgICAgICAgaWYgKElWc1tpdl0uaGFzT3duUHJvcGVydHkoXCJzdGRfMkFGQ1wiKSkge1xuICAgICAgICAgICAgICAgICAgICBjdXJJVkxldmVsLnN0ZF8yQUZDID0gSVZzW2l2XS5zdGRfMkFGQztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvKiogRm9yIDJBRkMgdGhhdCBpcyBzaW11bHRhbmVvdXMgKGFzIG9wcG9zZWQgdG8gdGhlIGZsaXBwaW5nIGtpbmQpKi9cbiAgICAgICAgICAgICAgICBpZiAoSVZzW2l2XS5oYXNPd25Qcm9wZXJ0eShcInN0ZF8yQUZDX3NpbXVsdGFuZW91c190YXJnZXRcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VySVZMZXZlbC5zdGRfMkFGQ19zaW11bHRhbmVvdXNfdGFyZ2V0ID0gSVZzW2l2XS5zdGRfMkFGQ19zaW11bHRhbmVvdXNfdGFyZ2V0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvKiogUGFyc2VyIGZ1bmN0aW9uKi9cbiAgICAgICAgICAgICAgICBpZiAoSVZzW2l2XS5wYXJzZXJGdW5jICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VySVZMZXZlbC5wYXJzZXJGdW5jID0gSVZzW2l2XS5wYXJzZXJGdW5jOyAvL0NvdWxkIHdyaXRlIGEgY29weWluZyBtZXRob2QgZm9yIGFsbCBvZiB0aGVzZSAodGhhdCBoYW5kbGVzIGRlZXAgY29weWluZylcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgbmV3T3JFeHRlbmRlZFRyaWFsO1xuXG4gICAgICAgICAgICAgICAgaWYgKGJ1aWxkaW5nVHJpYWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAvL25ld09yRXh0ZW5kZWRUcmlhbCA9ICBpdiArIFwiICBcIiArIGxldmVsVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIG5ld09yRXh0ZW5kZWRUcmlhbCA9IFtjdXJJVkxldmVsXTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYnVpbGRpbmdUcmlhbC5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9uZXdPckV4dGVuZGVkVHJpYWwgPSBidWlsZGluZ1RyaWFsICsgXCIgfCB8IFwiICsgaXYgKyBcIiAgXCIgKyBsZXZlbFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBuZXdPckV4dGVuZGVkVHJpYWwgPSBidWlsZGluZ1RyaWFsLmNvbmNhdChbY3VySVZMZXZlbF0pOyAvL0NyZWF0ZXMgYSBicmFuZCBuZXcgYXJyYXkgdyB0aGUgbmV3IGxldmVsXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGVtcC5wdXNoKG5ld09yRXh0ZW5kZWRUcmlhbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiogUmVwbGFjZSB5b3VyIHByZXZpb3VzIHRyaWFscyB3aXRoIFRlbXAgKGRvblwidCBrbm93IHdobyB0byBkbyB0aGlzIGluIHBsYWNlKSAqL1xuICAgICAgICBfYWxsVHJpYWxzID0gdGVtcDtcbiAgICB9XG5cblxuICAgIC8qKiBEdXBsaWNhdGUgdGhlIGN1cnJlbnQgZmFjdG9yaWFsIHRyaWFscyAqL1xuICAgIHZhciByZXBlYXRzID0gZXhwUmVwZWF0cztcbiAgICB0ZW1wID0gW107XG4gICAgZm9yIChpID0gMDsgaSA8IHJlcGVhdHM7IGkrKykge1xuICAgICAgICB0ZW1wID0gdGVtcC5jb25jYXQoX2FsbFRyaWFscyk7XG4gICAgfVxuICAgIF9hbGxUcmlhbHMgPSB0ZW1wO1xuXG5cbiAgICBjb25zb2xlLmxvZyhcIlRoZXJlIGFyZSBcIiwgX2FsbFRyaWFscy5sZW5ndGgsIFwidHJpYWxzICh1c2luZ1wiLCByZXBlYXRzLCBcInJlcGVhdHMpXCIpO1xuICAgIGlmIChwcmludFRyaWFscyl7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBfYWxsVHJpYWxzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVFJJQUwgXCIsIGkpO1xuICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IF9hbGxUcmlhbHNbaV0ubGVuZ3RoOyBqKyspe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCBfYWxsVHJpYWxzW2ldW2pdICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIioqKioqKiogKioqKioqKiAqKioqKioqICoqKioqKipcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoX3Nob3VsZFNodWZmbGUpICAgICBfYWxsVHJpYWxzLnNodWZmbGUoKTtcblxuXG4gICAgX3RvdGFsVHJpYWxzID0gX2FsbFRyaWFscy5sZW5ndGg7IC8vVXNlZCB0byBkZXRlcm1pbmUgd2hlcmUgeW91IGFyZSBpbiB0aGUgdHJpYWwgcHJvY2Vzc1xuICAgIF9kaWRCdWlsZFRyaWFscyA9IHRydWU7XG59XG5cblxuLyoqXG4gKiBOT1RFOiBXZSBubyBsb25nZXIgaGFuZGxlIGFwcGVhcmFuY2Ugb3IgaW5wdXQuIFRoZXNlIGFyZSBvdXQgb2YgdGhlIHNjb3BlIG9mIHRoaXMgbW9kdWxlLlxuICogVGhpcyBtb2R1bGUgbm93IG9ubHkgaGFuZGxlcyB0aGUgZ2FtZSBsb29wIG9mXG4gKiAtIHRha2luZyBJVnNcbiAqIC0gYnVpbGRpbmcgYWxsIHRyaWFsc1xuICogLSBzZXR0aW5nIHRoZSBkaXNwbGF5IChhY2NvcmRpbmcgdG8gdGhlIHN1cHBsaWVkIElWcylcbiAqIC0gc3RvcmluZyAmIG91dHB1dHRpbmcgX3Jlc3BvbnNlc1xuICpcbiAqIEFsbCBvdGhlciBiZWhhdmlvdXIgc2hvdWxkIGJlIHBlcmZvcm1lZCBieSBhbm90aGVyIG1vZHVlbCB0aGF0IHdvcmtzIHdpdGggdGhpcyBvbmUuXG4gKiAqL1xuVHJpYWxzLmJ1aWxkRXhwZXJpbWVudCA9IGZ1bmN0aW9uIChwcmludFRyaWFscykge1xuICAgIF9idWlsZFRyaWFscyggKHByaW50VHJpYWxzID09PSB1bmRlZmluZWQpID8gZmFsc2UgOiBwcmludFRyaWFscyApO1xufTtcblxuXG52YXIgX3Nob3VsZFNodWZmbGUgPSB0cnVlO1xuVHJpYWxzLnNldFNodWZmbGUgPSBmdW5jdGlvbihzaG91bGRTaHVmZmxlKXtcbiAgICBpZiAodHlwZW9mKHNob3VsZFNodWZmbGUpID09PSBcImJvb2xlYW5cIil7XG4gICAgICAgIF9zaG91bGRTaHVmZmxlID0gIHNob3VsZFNodWZmbGU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwic2V0U2h1ZmZsZSBvbmx5IGFjY2VwdHMgYm9vbGVhbiBhcmd1bWVudFwiKTtcbiAgICB9XG59O1xuXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVHJpYWxzIChzdWJmdW5jdGlvbnMpXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG5mdW5jdGlvbiBfY3N2SWxsZWdhbENoYXJDaGVjayhzdHJpbmcpe1xuXG4gICAgaWYgKHR5cGVvZiBzdHJpbmcgIT09IFwic3RyaW5nXCIpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzdXBwbHkgYSB2YXJpYWJsZSBvZiB0eXBlIFN0cmluZyBmb3IgdGhpcyBtZXRob2RcIik7XG4gICAgfVxuXG4gICAgaWYgKHN0cmluZy5pbmRleE9mKFwiLFwiKSAhPT0gLTEpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTdHJpbmdzIHVzZWQgYnkgRXhwZXJpbWVudEpTIG1heSBub3QgY29udGFpbiBjb21tYXM6IFwiICsgc3RyaW5nKTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IFRyaWFscyB9OyIsImltcG9ydCB7IF9zaG91bGRSdW5OZXh0VHJpYWwsIF9zZXRTaG91bGRSdW5OZXh0VHJpYWwgfSBmcm9tIFwiLi9SdW5FeHBlcmltZW50LmpzXCI7XG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSW50ZXJzdGltdWx1cyBQYXVzZVxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuXG4gICAgXG4gICAgXG52YXIgUGF1c2UgPSB7fTtcblxuUGF1c2Uuc2hvd0ludGVyc3RpbXVsdXNQYXVzZSA9IGZ1bmN0aW9uIChkdXJhdGlvbikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIF9pbnRlcnN0aW11bHVzUGF1c2UoZHVyYXRpb24pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cbnZhciBfcGF1c2UgPSA1MDA7XG5QYXVzZS5zZXRQYXVzZVRpbWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09IHBhcnNlSW50KHZhbHVlLCAxMCkpIHtcbiAgICAgICAgX3BhdXNlID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgXCJzZXRQYXVzZVRpbWUgb25seSB0YWtlcyBpbnRlZ2Vyc1wiO1xuICAgIH1cbn07XG5cbmV4cG9ydCB2YXIgX3Nob3VsZEludGVyc3RpbXVsdXNQYXVzZSA9IHRydWU7ICAgICAgICAgICAgIC8vdXNlZCBpbjogUnVuRXhwZXJpbWVudC5qc1xuUGF1c2Uuc2V0U2hvdWxkSW50ZXJzdGltdWx1c1BhdXNlID0gZnVuY3Rpb24odmFsdWUpe1xuICAgIGlmICh0eXBlb2YgIHZhbHVlID09PSBcImJvb2xlYW5cIil7XG4gICAgICAgIF9zaG91bGRJbnRlcnN0aW11bHVzUGF1c2UgPSB2YWx1ZTtcbiAgICB9XG59O1xuXG52YXIgX2JsYWNrT3V0ID0gJChcIjxkaXY+XCIsIHtcbiAgICBpZDogXCJpbnRlcnN0aW11bHVzLXBhdXNlXCIsXG4gICAgY3NzOiB7XG4gICAgICAgIHBvc2l0aW9uOiBcImZpeGVkXCIsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIHRvcDogMCxcbiAgICAgICAgd2lkdGg6IFwiMTAwdndcIixcbiAgICAgICAgaGVpZ2h0OiBcIjEwMHZoXCIsXG4gICAgICAgIGJhY2tncm91bmQ6IFwiYmxhY2tcIlxuICAgIH1cbn0pO1xuXG4kKGRvY3VtZW50LmJvZHkpLmFwcGVuZChfYmxhY2tPdXQpO1xuJChcIiNpbnRlcnN0aW11bHVzLXBhdXNlXCIpLmhpZGUoKTtcblxudmFyIF9pc0ludGVyc3RpbXVsdXNQYXVzZSA9IGZhbHNlO1xuZXhwb3J0IGZ1bmN0aW9uIF9pbnRlcnN0aW11bHVzUGF1c2UoZHVyYXRpb24pIHsgICAgICAgICAvL3VzZWQgaW46IFJ1bkV4cGVyaW1lbnQuanNcblxuICAgIGR1cmF0aW9uID0gZHVyYXRpb24gPT09IHVuZGVmaW5lZCA/IF9wYXVzZSA6IGR1cmF0aW9uOyAvL0RlZmF1bHQgdG8gcGF1c2UgdGltZSB1bmxlc3MgYW4gYXJndW1lbnQgaXMgc3VwcGxpZWRcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICQoXCIjaW50ZXJzdGltdWx1cy1wYXVzZVwiKS5zaG93KCk7XG4gICAgICAgIF9pc0ludGVyc3RpbXVsdXNQYXVzZSA9IHRydWU7XG4gICAgICAgIF9zZXRTaG91bGRSdW5OZXh0VHJpYWwoZmFsc2UpO1xuXG4gICAgICAgIC8qUHJldmVudCBidXR0b24gbWFzaGluZyB3aGlsZSB0aGUgcGF1c2UgcnVucyovXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJChcIiNpbnRlcnN0aW11bHVzLXBhdXNlXCIpLmhpZGUoKTtcbiAgICAgICAgICAgIF9pc0ludGVyc3RpbXVsdXNQYXVzZSA9IGZhbHNlO1xuICAgICAgICAgICAgX3NldFNob3VsZFJ1bk5leHRUcmlhbCh0cnVlKTsgICAgICAgICAgIC8vQ2Fubm90IHJlYXNzaWduIGltcG9ydGVkIHZhbHVlcywgc28geW91IG5lZWQgYSBzZXR0ZXJcblxuICAgICAgICAgICAgcmVzb2x2ZSgpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1Byb21pc2UgaGFzIHJlc29sdmVkIGhlcmVcbiAgICAgICAgfSwgZHVyYXRpb24pO1xuICAgIH0pO1xufVxuXG5cbmV4cG9ydCB7IFBhdXNlIH07IiwiXG4vLyBSdW5FeHBlcmltZW50LmpzXG4vLyBBZGQgY29yZSBmdW5jdGlvbmFsaXR5IGZhY2lsaXRhdGluZyB0aGUgZXhwZXJpbWVudGFsIGxpZmUgY3ljbGUgdG8gdGhlIFRyaWFscyBPYmplY3QuXG4vLyBTdWNoIGFzOlxuLy8gICAgICAtIEdldHRpbmcgcGFydGljaXBhbnQgaW5mb1xuLy8gICAgICAtIFJ1bm5pbmcgdGhlIG5leHQgdHJpYWwgKHNldHRpbmcgSVZzIGV0Yylcbi8vICAgICAgLSBTdG9yaW5nIGEgcmVzcG9uc2Vcbi8vICAgICAgLSBPdXRwdXR0aW5nIHJlc3BvbnNlc1xuLy8gICAgICAtIE1pZC9lbmQgY2FsbGJhY2tzXG5cbmltcG9ydCB7IFRyaWFscywgc2V0RnVuY3MsIF9hbGxUcmlhbHMsIF9kaWRCdWlsZFRyaWFscywgX2R2TmFtZSB9IGZyb20gXCIuL1RyaWFscy5qc1wiO1xuaW1wb3J0IHsgX2ludGVyc3RpbXVsdXNQYXVzZSwgX3Nob3VsZEludGVyc3RpbXVsdXNQYXVzZSB9IGZyb20gXCIuL0ludGVyc3RpbXVsdXNQYXVzZS5qc1wiO1xuaW1wb3J0IHsgY3JlYXRlRG93bmxvYWRMaW5rIH0gZnJvbSBcIi4uL3V0aWxzL0NyZWF0ZURvd25sb2FkTGluay5qc1wiO1xuaW1wb3J0IHsgZ2V0UGFyYW1OYW1lcyB9IGZyb20gXCIuLi91dGlscy9TdHJpbmdVdGlscy5qc1wiO1xuXG5cblxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuLy8gICAgICAgICAgICAgICAgICAgICAgRXhwZXJpbWVudCBMaWZlY3ljbGUgLSBHZXQgUGFydGljaXBhbnQgSW5mb1xuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuXG52YXIgX3BwdE5hbWUgPSBcInVubmFtZWRfcHB0XCI7XG52YXIgX3BwdE5vID0gMDtcblxuVHJpYWxzLmdldFBwdEluZm8gPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBfcHB0TmFtZSA9IHByb21wdChcIlBsZWFzZSBlbnRlciB5b3VyIG5hbWVcIikudHJpbSgpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIm5hbWUgd2FzXCIsIF9wcHROYW1lKTtcbiAgICAgICAgaWYgKF9wcHROYW1lID09PSBcIlwiIHx8IF9wcHROYW1lID09PSBudWxsKSB7XG4gICAgICAgICAgICBhbGVydChcIk5hbWUgY2Fubm90IGJlIGJsYW5rXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBfcHB0Tm8gPSBwYXJzZUludChwcm9tcHQoXCJQbGVhc2UgZW50ZXIgeW91ciBwYXJ0aWNpcGFudCBudW1iZXJcIikpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInBwdCBudW1iZXIgd2FzXCIsIF9wcHRObyk7XG4gICAgICAgIGlmIChpc05hTihfcHB0Tm8pKSB7XG4gICAgICAgICAgICBhbGVydChcIlBhcnRpY2lwYW50IG51bWJlciBtdXN0IGJlIGFuIGludGVnZXJcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKFwiUGFydGljaXBhbnQgbmFtZTogXCIsIF9wcHROYW1lLCBcIlxcdFBhcnRpY2lwYW50IG51bWJlcjogXCIsIF9wcHRObyk7XG59O1xuXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBFeHBlcmltZW50IExpZmVjeWNsZSAtIFN0YXJ0ICYgR2FtZSBMb29wXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG5cbi8vQ2Fubm90IHJlYXNzaWduIGltcG9ydGVkIHZhbHVlcywgc28geW91IG5lZWQgYSBzZXR0ZXIgKHVzZWQgaW4gSW50ZXJzdGltbHVzUGF1c2UuanMpXG5leHBvcnQgZnVuY3Rpb24gX3NldFNob3VsZFJ1bk5leHRUcmlhbCh2YWx1ZSl7XG4gICAgaWYgKHR5cGVvZih2YWx1ZSkgPT09IFwiYm9vbGVhblwiKXtcbiAgICAgICAgX3Nob3VsZFJ1bk5leHRUcmlhbCA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImNhbm5vdCBzZXQgX3Nob3VsZFJ1bk5leHRUcmlhbCB0byBhIG5vbiBib29sZWFuIHZhbHVlXCIpO1xuICAgIH1cbn1cblxuZXhwb3J0IHZhciBfc2hvdWxkUnVuTmV4dFRyaWFsID0gdHJ1ZTsgLy91c2VkIGJ5OiBJbnRlcnN0aW11bHVzUGF1c2UuanNcblRyaWFscy5ydW5OZXh0VHJpYWwgPSBmdW5jdGlvbiAoc2V0dGluZ3MpIHsgLy8gdXNhZ2UgLT4gcnVuTmV4dFRyaWFsKHtzaG91bGRTdG9yZVJlc3BvbnNlOiB0cnVlLCBkdl92YWx1ZTogXCJpbnNpZGVcIn0pO1xuXG4gICAgaWYgKCFfZGlkQnVpbGRUcmlhbHMpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJydW5OZXh0VHJpYWwoKTogVHJpYWwgd2VyZSBub3QgYnVpbHRcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoX3Nob3VsZFJ1bk5leHRUcmlhbCkge1xuXG4gICAgICAgIC8vIFRPRE86IENoYW5nZSB0aGUgaW1wbGVtZW50YXRpb24gb2YgdGhlIG1pZCBjYWxsYmFjayAtIEp1c3QgY2hlY2sgdGhlIGxlbmd0aCBvZiB0aGUgX3Jlc3BvbnNlcyBhcnJheSB2cyB0aGUgYWxsdHJpYWxzIGFycmF5Li5cblxuICAgICAgICBpZiAoX3Nob3VsZFJ1bk1pZENhbGxiYWNrKCkgJiYgX21pZENhbGxiYWNrICE9PSBudWxsKSB7XG4gICAgICAgICAgICBfbWlkQ2FsbGJhY2soKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfc2hvdWxkSW50ZXJzdGltdWx1c1BhdXNlKSB7XG4gICAgICAgICAgICBfaW50ZXJzdGltdWx1c1BhdXNlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2V0dGluZ3MgIT09IHVuZGVmaW5lZCAmJiBzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eShcInNob3VsZFN0b3JlUmVzcG9uc2VcIikgJiYgc2V0dGluZ3Muc2hvdWxkU3RvcmVSZXNwb25zZSkge1xuICAgICAgICAgICAgX3N0b3JlUmVzcG9uc2Uoc2V0dGluZ3MpOyAvL1NldHRpbmdzIGNvbnRhaW5zIGEgZmllbGQgXCJkdl92YWx1ZVwiIHdoaWNoIGlzIGFsc28gcmVhZCBieSBfc3RvcmVSZXNwb25zZVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF9hbGxUcmlhbHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgX2Rpc3BsYXlOZXh0VHJpYWwoKTtcblxuICAgICAgICAgICAgLy8gX2N1cjJBRkNJc1RhcmdldCA9IHRydWU7XG4gICAgICAgICAgICAvKiogQWx3YXlzIHJlc2V0IHRoZSAyQUZDIHZhbHVlKi9cblxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJUaGVyZSBhcmUgXCIsIF9hbGxUcmlhbHMubGVuZ3RoLCBcIiB0cmlhbHMgcmVtYWluaW5nLlwiKTtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgLy9Qb3NzaWJseSB0b28gZGVzdHJ1Y3RpdmVcbiAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkuY2hpbGRyZW4oKS5mYWRlT3V0KCk7XG4gICAgICAgICAgICAvLyAkKFwiI2ludGVyc3RpbXVsdXMtcGF1c2VcIikuaGlkZSgpO1xuICAgICAgICAgICAgX291dHB1dFJlc3BvbnNlcyhfcmVzcG9uc2VzKTtcblxuICAgICAgICAgICAgaWYgKF9lbmRDYWxsQmFjayAhPT0gdW5kZWZpbmVkKSBfZW5kQ2FsbEJhY2soKTtcblxuICAgICAgICB9XG4gICAgfVxuXG59O1xuXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG4vLyAgICAgICAgICAgICAgICAgIEV4cGVyaW1lbnQgTGlmZWN5Y2xlIC0gTWlkIFBvaW50IENhbGxiYWNrIChpLmUuIHRoZSBcInRha2UgYSBicmVha1wiIG1lc3NhZ2UpXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG5cbnZhciBfZGlkUnVuTWlkQ2FsbGJhY2sgPSBmYWxzZTtcbnZhciBfbWlkQ2FsbGJhY2sgPSBudWxsO1xuVHJpYWxzLnNldE1pZENhbGxiYWNrID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKXtcbiAgICAgICAgX21pZENhbGxiYWNrID0gdmFsdWU7XG4gICAgfSAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJPbmx5IGZ1bmN0aW9ucyBtYXkgYmUgYXNzaWduZWQgdG8gdGhlIGVuZCBjYWxsYmFja1wiKTtcbiAgICB9XG59O1xuXG5mdW5jdGlvbiBfc2hvdWxkUnVuTWlkQ2FsbGJhY2soKSB7XG4gICAgaWYgKF9kaWRSdW5NaWRDYWxsYmFjaykgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy9NaWQgcG9pbnQgPSB0aGVyZSBhcmUgYXMgbWFueSByZXNwb25zZXMgYXMgdHJpYWxzIChvciBhIGRpZmZlcmVuY2Ugb2Ygb25lIGZvciBvZGQgbnVtYmVyIG9mIHRyaWFscylcbiAgICBpZiAoX2FsbFRyaWFscy5sZW5ndGggPT09X3Jlc3BvbnNlcy5sZW5ndGggfHwgTWF0aC5hYnMoX2FsbFRyaWFscy5sZW5ndGggLV9yZXNwb25zZXMubGVuZ3RoKSA9PT0gMSl7XG4gICAgICAgIF9kaWRSdW5NaWRDYWxsYmFjayA9IHRydWU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cblxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuLy8gICAgICAgICAgICAgRXhwZXJpbWVudCBMaWZlY3ljbGUgLSBFbmQgQ2FsbGJhY2sgKGEgYmVoYXZpb3VyIGF0IHRoZSBlbmQgb2YgdGhlIGV4cGVyaW1lbnQpXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG52YXIgX2VuZENhbGxCYWNrID0gbnVsbDtcblRyaWFscy5zZXRFbmRDYWxsYmFjayA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIil7XG4gICAgICAgIF9lbmRDYWxsQmFjayA9IHZhbHVlO1xuICAgIH0gICBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiT25seSBmdW5jdGlvbnMgbWF5IGJlIGFzc2lnbmVkIHRvIHRoZSBlbmQgY2FsbGJhY2tcIik7XG4gICAgfVxufTtcblxuXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEV4cGVyaW1lbnQgTGlmZWN5Y2xlIC0gRGlzcGxheWluZyBUaGUgTmV4dCBUcmlhbFxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuXG4vKiogV2hlcmUgdmlldy1sZXZlbCBlbGVtZW50cyBhcmUgc2V0IC0gdGhpcyBpcyBsaWtlIHRoZSBDT05UUk9MTEVSIG1ldGhvZCBpbnRlcmZhY2luZyBiZXR3ZWVuIE1PREVMIGFuZCBWSUVXKi9cbmZ1bmN0aW9uIF9kaXNwbGF5TmV4dFRyaWFsKCkge1xuICAgIHZhciBuZXh0VHJpYWwgPSBfYWxsVHJpYWxzW19hbGxUcmlhbHMubGVuZ3RoIC0gMV07IC8vQWx3YXlzIGdvIGZyb20gdGhlIGJhY2tcbiAgICBjb25zb2xlLmxvZyhcIkRpc3BsYXlpbmcgbmV4dCB0cmlhbDpcIiwgbmV4dFRyaWFsKTtcblxuICAgIC8qKiBJdGVyYXRlIG92ZXIgZWFjaCBJViBhbmQgc2V0IGl0cyBwb2ludGVyIHRvIGl0cyB2YWx1ZSBmb3IgdGhhdCB0cmlhbCAqL1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbmV4dFRyaWFsLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIF9zZXRPYmplY3RBcHBlYXJhbmNlUHJvcGVydGllcyhuZXh0VHJpYWxbaV0pO1xuXG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gX3NldE9iamVjdEFwcGVhcmFuY2VQcm9wZXJ0aWVzKGN1clByb3ApIHtcblxuICAgIC8qKiBVc2luZyBhIEZVTkNUSU9OIHRvIHNldCB0aGUgZGlzcGxheSovXG4gICAgaWYgKCBzZXRGdW5jc1tjdXJQcm9wLmRlc2NyaXB0aW9uXSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICBzZXRGdW5jc1tjdXJQcm9wLmRlc2NyaXB0aW9uXS5hcHBseShudWxsLCBjdXJQcm9wLnZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBzZXR0ZXIgZnVuY3Rpb24gc3VwcGxpZWQgYnk6IFwiICsgY3VyUHJvcCk7XG4gICAgfVxufVxuXG5cbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRXhwZXJpbWVudCBMaWZlY3ljbGUgLSBTdG9yZSBSZXNwb25zZVxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuZXhwb3J0IHZhciBfcmVzcG9uc2VzID0gW107XG5leHBvcnQgZnVuY3Rpb24gX3NldFJlc3BvbnNlcyhyZXNwb25zZXMpe1xuICAgIGlmIChyZXNwb25zZXMuY29uc3RydWN0b3IgPT09IEFycmF5KXtcbiAgICAgICAgX3Jlc3BvbnNlcyA9IHJlc3BvbnNlcztcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJyZXBvbnNlcyBjYW4gb25seSBiZSBzZXQgdG8gYW4gYXJyYXlcIik7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBfc3RvcmVSZXNwb25zZShvcHRpb25zKSB7XG5cbiAgICB2YXIgbGFzdFRyaWFsID0gX2FsbFRyaWFscy5wb3AoKTtcblxuICAgIHZhciByZXNwb25zZUZvcm1hdHRlZCA9IHt9O1xuXG4gICAgLyoqIFN0b3JlIHRoZSBJViAtPiBXcml0ZSBvdXQgZWFjaCBJViAoMSBJViBwZXIgYXJyYXkgZWxlbWVudCkgdG8gYSBmaWVsZCAqL1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdFRyaWFsLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBpdk51bSA9IFwiSVZcIiArIGk7XG5cbiAgICAgICAgLy9JZiBhIHBhcnNlciBpcyBkZWZpbmVkIHVzZSBpdHMgb3V0cHV0IGFzIHRoZSB2YWx1ZSBvZiB0aGUgcmVzcG9uc2VcbiAgICAgICAgaWYgKGxhc3RUcmlhbFtpXS5wYXJzZXJGdW5jICE9PSB1bmRlZmluZWQgJiYgJC5pc0Z1bmN0aW9uKGxhc3RUcmlhbFtpXS5wYXJzZXJGdW5jKSl7XG4gICAgICAgICAgICB2YXIgc3RkTmFtZSA9IGl2TnVtICsgXCJfXCIgKyBsYXN0VHJpYWxbaV0uZGVzY3JpcHRpb24gKyBcIl92YWx1ZVwiO1xuXG4gICAgICAgICAgICByZXNwb25zZUZvcm1hdHRlZFtzdGROYW1lXSA9IGxhc3RUcmlhbFtpXS5wYXJzZXJGdW5jLmFwcGx5KHRoaXMsIGxhc3RUcmlhbFtpXS52YWx1ZS5jb25jYXQoaSkgKTsgLy9UaGUgYXJncyBhcmUgcGFzc2VkIHRvIHRoZSBwYXJzZXIgZnVuYyB3aXRoIHRoZSBpbmRleCBhcyB0aGUgbGFzdCBhcmdcblxuICAgICAgICB9IGVsc2UgaWYgKGxhc3RUcmlhbFtpXS52YWx1ZS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHsgLy9Db25zaWRlciB0aGVzZSB0byBiZSBkZWZhdWx0cyBmb3IgamF2YXNjcmlwdCBwcmltaXRpdmUgdHlwZXNcblxuICAgICAgICAgICAgLyoqIE1hbnVhbGx5IHdyaXRlIG91dCBlYWNoIGFyZ3VtZW50IChmcm9tIGFuIGFycmF5KSB0byBhIGZpZWxkIGluIHRoZSBvYmplY3RcbiAgICAgICAgICAgICAqICBPbmx5IGFwcGVuZCBhIG51bWJlciBpZiB0aGVyZSBhcmUgPjEgYXJndW1lbnRzIHBhc3NlZCBpbiAqL1xuXG4gICAgICAgICAgICBpZiAobGFzdFRyaWFsW2ldLnZhbHVlLmxlbmd0aCA+IDEpe1xuXG4gICAgICAgICAgICAgICAgLy9JZiB1c2luZyBhIHNldEZ1bmMgZnVuY3Rpb24gd2l0aCBtdWx0aXBsZSBhcmdzIC0+IHVzZSB0aGUgYXJnIG5hbWVzIHRvIGRlc2NyaWJlIHRoZSB2YWx1ZXMgd3JpdHRlbiB0byB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICB2YXIgYXJnX25hbWVzLCBhcmdfbmFtZTtcbiAgICAgICAgICAgICAgICBhcmdfbmFtZXMgPSBnZXRQYXJhbU5hbWVzKCBzZXRGdW5jc1tsYXN0VHJpYWxbaV0uZGVzY3JpcHRpb25dICk7XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGxhc3RUcmlhbFtpXS52YWx1ZS5sZW5ndGg7ICsraikge1xuICAgICAgICAgICAgICAgICAgICBhcmdfbmFtZSA9IGFyZ19uYW1lc1tqXTtcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2VGb3JtYXR0ZWRbaXZOdW0gKyBcIl9cIiArIGxhc3RUcmlhbFtpXS5kZXNjcmlwdGlvbiArIFwiX3ZhbHVlX1wiICsgYXJnX25hbWUgXSA9ICBsYXN0VHJpYWxbaV0udmFsdWVbal07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlRm9ybWF0dGVkWyBpdk51bSArIFwiX1wiICsgbGFzdFRyaWFsW2ldLmRlc2NyaXB0aW9uICsgXCJfdmFsdWVcIiBdID0gIGxhc3RUcmlhbFtpXS52YWx1ZVswXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzcG9uc2VGb3JtYXR0ZWRbaXZOdW0gKyBcIl9cIiArIGxhc3RUcmlhbFtpXS5kZXNjcmlwdGlvbiArIFwiX3ZhbHVlXCJdID0gbGFzdFRyaWFsW2ldLnZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqIEFkZCBhIHZhbHVlIG9mIHRoZSAyYWZjIHN0ZCAoZm9yIHRoZSByZWxldmFudCBJVikgKi9cbiAgICAgICAgaWYgKGxhc3RUcmlhbFtpXS5oYXNPd25Qcm9wZXJ0eShcInN0ZF8yQUZDXCIpKSB7XG4gICAgICAgICAgICByZXNwb25zZUZvcm1hdHRlZFtcInN0ZF8yQUZDXCJdID0gbGFzdFRyaWFsW2ldLnN0ZF8yQUZDO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIENoZWNrIHRoYXQgYSAyYWZjIHN0ZCB2YWx1ZSB3YXMgYWRkZWQgLSBpZiBub3QgeW91IHdhbnQgdG8gYWRkIGEgbnVsbCB2YWx1ZSBvciBpdCB3aWxsIGZ1Y2sgdXAgdGhlIGNzdiB3cml0ZSovXG4gICAgLy8gaWYgKCFyZXNwb25zZUZvcm1hdHRlZC5oYXNPd25Qcm9wZXJ0eShcInN0ZF8yQUZDXCIpICYmIGRpZFNldDJBRkMpIHtcbiAgICAvLyAgICAgcmVzcG9uc2VGb3JtYXR0ZWRbXCJzdGRfMkFGQ1wiXSA9IFwibnVsbFwiO1xuICAgIC8vIH1cbiAgICBcblxuICAgIC8qKiBTdG9yZSB0aGUgRFYqL1xuICAgIGlmIChvcHRpb25zICE9PSB1bmRlZmluZWQgJiYgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShcImR2X3ZhbHVlXCIpKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IF9kdk5hbWUgfHwgXCJ2YWx1ZVwiO1xuICAgICAgICByZXNwb25zZUZvcm1hdHRlZFtcIkRWX1wiK3ZhbHVlXSA9IG9wdGlvbnMuZHZfdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYWxlcnQoXCJObyBEViB3YXMgc3VwcGxpZWQgYnkgdGhlIGNhbGxpbmcgY29kZS4gVGhpcyBpcyBhbiBlcnJvci5cIik7XG4gICAgICAgIHJlc3BvbnNlRm9ybWF0dGVkW1wiRFZfdmFsdWVcIl0gPSBcIkVSUk9SIC0gTm8gRFYgc3VwcGxpZWRcIjtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhcIlNUT1JFRCBUSElTIFJFU1BPTlNFOiBcIiwgcmVzcG9uc2VGb3JtYXR0ZWQpO1xuXG4gICAgX3Jlc3BvbnNlcy5wdXNoKHJlc3BvbnNlRm9ybWF0dGVkKTtcbn1cblxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBFeHBlcmltZW50IExpZmVjeWNsZSAtIE91dHB1dCBSZXNwb25zZXNcbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cblxuVHJpYWxzLmZvcmNlT3V0cHV0UmVzcG9uc2VzID0gZnVuY3Rpb24oKXtcbiAgICBjb25zb2xlLmxvZyhcIkZvcmNpbmcgb3V0cHV0IG9mIF9yZXNwb25zZXNcIik7XG4gICAgX291dHB1dFJlc3BvbnNlcyhfcmVzcG9uc2VzLCB0cnVlKTtcbn07XG5cblxuZnVuY3Rpb24gX291dHB1dFJlc3BvbnNlcyhhbGxSZXNwb25zZXMsIGxvZykge1xuXG4gICAgaWYgKGFsbFJlc3BvbnNlcy5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgIHZhciBjc3ZTdHJpbmcgPSBcIlwiO1xuXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhbGxSZXNwb25zZXNbMF0pO1xuICAgIC8qKlRoZXNlIGFyZSBhbGwgdGhlIGNvbHVtbnMgaW4gdGhlIG91dHB1dCovXG5cbiAgICAvKiogTWFrZSB0aGUgaGVhZGVyKi9cbiAgICBjc3ZTdHJpbmcgKz0gXCJQYXJ0aWNpcGFudCBOYW1lLCBQYXJ0aWNpcGFudCBOdW1iZXIsIFwiOyAvL01hbnVhbGx5IGFkZCBoZWFkZXJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY3N2U3RyaW5nICs9IGtleXNbaV0gKyBcIixcIjtcbiAgICB9XG4gICAgY3N2U3RyaW5nID0gY3N2U3RyaW5nLnNsaWNlKDAsIC0xKSArIFwiXFxuXCI7Ly9DdXQgdHJhaWxpbmcgY29tbWEgYW5kIHB1dCBpbiBhIG5ldyByb3cvbGluZVxuXG4gICAgLyoqIEZpbGwgdGhlIGRhdGEgLSBUaGlzIHRpbWUgaXRzIGFuIGFycmF5IG9mIGFycmF5cyBub3QgYXJyYXkgb2YgZGljdGlvbmFyaWVzICovXG4gICAgZm9yIChpID0gMDsgaSA8IGFsbFJlc3BvbnNlcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgIGNzdlN0cmluZyArPSBfcHB0TmFtZSArIFwiLFwiICsgX3BwdE5vICsgXCIsXCI7IC8vTWFuYXVsbHkgYWRkIGNvbnRlbnRcblxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGtleXMubGVuZ3RoOyBqKyspIHsgLy9JdGVyYXRlIG92ZXIgdGhlIGtleXMgdG8gZ2V0IHRlaCB2YWx1ZXNcblxuICAgICAgICAgICAgdmFyIHZhbHVlID0gYWxsUmVzcG9uc2VzW2ldW2tleXNbal1dO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJ3cml0aW5nIHRoaXMgcmF3IHZhbHVlIFwiLCB2YWx1ZSwga2V5c1tqXSk7XG4gICAgICAgICAgICAvL3ZhbHVlID0gY2hlY2tSZXR1cm5Qcm9wcyggdmFsdWUsIHRydWUgKSB8fCB2YWx1ZTsgIC8vUGFyc2Ugb3V0IHJlbGV2YW50IG9iamVjdCBmaWVsZHNcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJBZmVyIGl0IHdhcyBwYXJzZWQ6XCIsIHZhbHVlLCBcIlxcbioqKioqKioqKlwiKTtcbiAgICAgICAgICAgIGNzdlN0cmluZyArPSB2YWx1ZSArIFwiLFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgY3N2U3RyaW5nID0gY3N2U3RyaW5nLnNsaWNlKDAsIC0xKSArIFwiXFxuXCI7IC8vQ3V0IHRyYWlsaW5nIGNvbW1hIGFuZCBwdXQgaW4gYSBuZXcgcm93L2xpbmVcbiAgICB9XG5cbiAgICBpZiAobG9nKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGNzdlN0cmluZyk7XG4gICAgfVxuXG4gICAgLyoqIEhlbHAgb3V0IGEgbWFjaGluZSB0b2RheSovXG4gICAgdmFyIGNzdkNvbnRlbnQgPSBlbmNvZGVVUkkoXCJkYXRhOnRleHQvY3N2O2NoYXJzZXQ9dXRmLTgsXCIgKyBjc3ZTdHJpbmcpO1xuICAgIHZhciBhID0gY3JlYXRlRG93bmxvYWRMaW5rKFwicmVzdWx0cyAoXCIgKyBfcHB0TmFtZSArIFwiLFwiICsgX3BwdE5vLnRvU3RyaW5nKCkgKyBcIikuY3N2XCIsIGNzdkNvbnRlbnQpO1xuICAgIGEuaW5uZXJIVE1MID0gXCI8aDQ+Q2xpY2sgdG8gZG93bmxvYWQgcmVzdWx0cyE8L2g0PlwiO1xuICAgIGEuY2xhc3NOYW1lICs9IFwiIHJlc3VsdHMtZG93bmxvYWRcIjtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGEpO1xuICAgIGEuY2xpY2soKTtcbn1cblxuXG4iLCJcbmltcG9ydCB7IFRyaWFscyxfYWxsVHJpYWxzLCBfc2V0QWxsVHJpYWxzLCBfZGlkQnVpbGRUcmlhbHN9IGZyb20gXCIuL1RyaWFscy5qc1wiO1xuaW1wb3J0IHsgX3Jlc3BvbnNlcywgX3NldFJlc3BvbnNlcyB9IGZyb20gXCIuL1J1bkV4cGVyaW1lbnQuanNcIjtcblxuXG52YXIgU2F2ZXMgPSB7fTtcblxuU2F2ZXMucGFyc2VUcmlhbHNGb3JTYXZpbmcgPSB1bmRlZmluZWQ7IC8vaW50ZXJmYWNlIGlzIChfYWxsVHJpYWxzKVxuU2F2ZXMucGFyc2VSZXNwb25zZXNGb3JTYXZpbmcgPSB1bmRlZmluZWQ7IC8vaW50ZXJmYWNlIGlzIChfcmVzcG9uc2VzKVxuU2F2ZXMudW5wYXJzZVNhdmVkVHJpYWxzID0gdW5kZWZpbmVkO1xuU2F2ZXMudW5wYXJzZVNhdmVkUmVzcG9uc2VzID0gdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBlcnJvckNoZWNrU2F2aW5nUGFyc2Vycygpe1xuICAgIGlmIChTYXZlcy5wYXJzZVRyaWFsc0ZvclNhdmluZyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgcmVzdG9yZSB0cmlhbHMgd2l0aG91dCBwYXJzaW5nIGZ1bmN0aW9uXCIpO1xuICAgIGlmIChTYXZlcy5wYXJzZVJlc3BvbnNlc0ZvclNhdmluZyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgcmVzdG9yZSBfcmVzcG9uc2VzIHdpdGhvdXQgcGFyc2luZyBmdW5jdGlvblwiKTtcbiAgICBpZiAoU2F2ZXMudW5wYXJzZVNhdmVkVHJpYWxzID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCByZXN0b3JlIHRyaWFscyB3aXRob3V0IFVOcGFyc2luZyBmdW5jdGlvblwiKTtcbiAgICBpZiAoU2F2ZXMudW5wYXJzZVNhdmVkUmVzcG9uc2VzID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCByZXN0b3JlIF9yZXNwb25zZXMgd2l0aG91dCBVTnBhcnNpbmcgZnVuY3Rpb25cIik7XG59XG5cblxuU2F2ZXMuY2xlYXJTYXZlcyA9IGZ1bmN0aW9uKCl7XG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJleHBlcmltZW50SlNzYXZlc1wiKTsvLy8vL1xufTtcblxuXG5TYXZlcy5zYXZlQnVpbHRUcmlhbHNBbmRSZXNwb25zZXMgPSBmdW5jdGlvbigpIHtcbiAgICBcbiAgICBlcnJvckNoZWNrU2F2aW5nUGFyc2VycygpO1xuXG4gICAgaWYgKHR5cGVvZihTdG9yYWdlKSAhPT0gXCJ1bmRlZmluZWRcIikge1xuXG4gICAgICAgIC8vIGxvY2FsU3RvcmFnZS5leHBlcmltZW50SlNzYXZlcyA9IHVuZGVmaW5lZDtcblxuICAgICAgICAvL1BhcnNlIHlvdXIgdHJpYWxzLCB1c2luZyB0aGUgY3VzdG9tIHNlcmlhbGl6ZXIuLlxuICAgICAgICB2YXIgdHJpYWxzRm9yU2F2aW5nID0gU2F2ZXMucGFyc2VUcmlhbHNGb3JTYXZpbmcoX2FsbFRyaWFscyk7XG4gICAgICAgIHZhciByZXNwb25zZXNGb3JTYXZpbmcgPSBTYXZlcy5wYXJzZVJlc3BvbnNlc0ZvclNhdmluZyhfcmVzcG9uc2VzKTtcblxuICAgICAgICAvL0pTT05pZnkgdGhlIHRyaWFscyBhbmQgX3Jlc3BvbnNlc1xuICAgICAgICB2YXIgZXhwZXJpbWVudEpTc2F2ZXMgPSB7fTtcbiAgICAgICAgZXhwZXJpbWVudEpTc2F2ZXNbXCJ0cmlhbHNcIl0gPSB0cmlhbHNGb3JTYXZpbmc7XG4gICAgICAgIGV4cGVyaW1lbnRKU3NhdmVzW1wicmVzcG9uc2VzXCJdID0gcmVzcG9uc2VzRm9yU2F2aW5nO1xuXG4gICAgICAgIHZhciBtc2cgPSBwcm9tcHQoXCJBZGQgYSBtZXNzYWdlIHRvIHRoaXMgc2F2ZSFcIik7XG5cbiAgICAgICAgaWYgKG1zZyA9PT0gbnVsbCl7XG4gICAgICAgICAgICBhbGVydChcIlRyaWFscyB3aWxsIG5vdCBiZSBzYXZlZFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkYXRlS2V5ID0gKG5ldyBEYXRlKCkpLnRvVVRDU3RyaW5nKCk7IC8vVmVyeSBjbGVhciBkYXRlXG5cbiAgICAgICAgLy9NYWtlIGEgbmV3IGRpY3Rpb25hcnkgb3IgZ2V0IHRoZSBvbGQgb25lXG4gICAgICAgIHZhciBrZXllZF9ieV9kYXRlcyA9IChsb2NhbFN0b3JhZ2UuZXhwZXJpbWVudEpTc2F2ZXMgPT09IHVuZGVmaW5lZCkgPyB7fSA6IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmV4cGVyaW1lbnRKU3NhdmVzKTtcblxuICAgICAgICAvL3NhdmUgdG8gaXRcbiAgICAgICAga2V5ZWRfYnlfZGF0ZXNbbXNnICsgXCIgLSBcIiArZGF0ZUtleV0gPSBleHBlcmltZW50SlNzYXZlcztcblxuICAgICAgICAvL3NlcmlhbGl6ZSFcbiAgICAgICAgbG9jYWxTdG9yYWdlLmV4cGVyaW1lbnRKU3NhdmVzID0gSlNPTi5zdHJpbmdpZnkoa2V5ZWRfYnlfZGF0ZXMpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwiU2F2ZWQgVHJpYWxzXCIsIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmV4cGVyaW1lbnRKU3NhdmVzKSk7XG4gICAgfVxufTtcblxuXG5TYXZlcy5zZXRTYXZlZFRyaWFsc0FuZFJlc3BvbnNlcyA9IGZ1bmN0aW9uKCl7XG4gICAgZXJyb3JDaGVja1NhdmluZ1BhcnNlcnMoKTtcblxuICAgIHZhciBhbGxfc2F2ZXMgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5leHBlcmltZW50SlNzYXZlcyk7XG5cbiAgICBjb25zb2xlLmxvZyhcImFsbCBzYXZlcysgXCIsIGFsbF9zYXZlcyk7XG5cblxuICAgIHZhciBzZWxlY3RfYml0cyA9IF9jcmVhdGVEcm9wRG93blNlbGVjdChhbGxfc2F2ZXMpO1xuICAgIHNlbGVjdF9iaXRzLmJ1dHRvbi5jbGljayhmdW5jdGlvbigpe1xuXG4gICAgICAgIHZhciB0ZW1wX3VzaW5nID0gc2VsZWN0X2JpdHMuc2VsZWN0LmZpbmQoXCI6c2VsZWN0ZWRcIikudGV4dCgpO1xuXG4gICAgICAgIHRlbXBfdXNpbmcgPSBhbGxfc2F2ZXNbdGVtcF91c2luZ107XG5cbiAgICAgICAgX3NldEFsbFRyaWFscyggU2F2ZXMudW5wYXJzZVNhdmVkVHJpYWxzKHRlbXBfdXNpbmdbXCJ0cmlhbHNcIl0pICk7XG4gICAgICAgIF9zZXRSZXNwb25zZXMoIFNhdmVzLnVucGFyc2VTYXZlZFJlc3BvbnNlcyh0ZW1wX3VzaW5nW1wicmVzcG9uc2VzXCJdKSApO1xuICAgICAgICBpZiAoX3Jlc3BvbnNlcyA9PT0gdW5kZWZpbmVkIHx8IF9yZXNwb25zZXMgPT09IG51bGwpIF9zZXRSZXNwb25zZXMoIFtdICk7XG5cbiAgICAgICAgY29uc29sZS5sb2coXCJyZXN0b3JlZCBhbGwgdHJpYWxzOiBcIiwgX2FsbFRyaWFscyk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicmVzdG9yZWQgYWxsIF9yZXNwb25zZXM6IFwiLCBfcmVzcG9uc2VzKTtcblxuICAgICAgICBUcmlhbHMucnVuTmV4dFRyaWFsKCk7XG5cbiAgICAgICAgLy9SZW1vdmUgc2VsZWN0IGZyb20gZG9tXG4gICAgICAgIHNlbGVjdF9iaXRzLndyYXAucmVtb3ZlKCk7XG4gICAgfSk7XG5cbiAgICBzZWxlY3RfYml0cy5idXR0b25fY2xlYXIuY2xpY2soZnVuY3Rpb24oKXtcblxuICAgICAgICBpZiAod2luZG93LmNvbmZpcm0oXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIGFsbCBzYXZlZCBleHBlcmltZW50cz9cIikpe1xuICAgICAgICAgICAgU2F2ZXMuY2xlYXJTYXZlcygpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9SZW1vdmUgc2VsZWN0IGZyb20gZG9tXG4gICAgICAgIHNlbGVjdF9iaXRzLndyYXAucmVtb3ZlKCk7XG4gICAgfSk7XG5cbn07XG5cblxuZnVuY3Rpb24gX2NyZWF0ZURyb3BEb3duU2VsZWN0KGFsbF9zYXZlcyl7XG5cbiAgICB2YXIgZGl2ID0gJChcIjxkaXY+XCIsIHtcbiAgICAgICAgaWQ6IFwic2F2ZWRfaW5mb1wiXG4gICAgfSk7XG5cbiAgICAvL01ha2UgYSBzZWxlY3QgdG8gY2hvb3NlIGZyb20gdGhlIHNhdmVzXG4gICAgdmFyIHNlbCA9ICQoXCI8c2VsZWN0PlwiKTtcbiAgICBPYmplY3Qua2V5cyhhbGxfc2F2ZXMpLm1hcChmdW5jdGlvbihlbGVtLCBpLCBhbGwpe1xuICAgICAgICAvL1VzZSB0aGUgaW5kZXggYXMgdGhlIGtleVxuICAgICAgICBzZWwuYXBwZW5kKCQoXCI8b3B0aW9uPlwiKS5hdHRyKFwidmFsdWVcIixpKS50ZXh0KGVsZW0pKTtcbiAgICB9KTtcblxuXG4gICAgLy9CdXR0b24gLSBubyBmdW5jdGlvbmFsaXR5IGhlcmUsIGp1c3Qgdmlld1xuICAgIHZhciBiID0gJChcIjxidXR0b24+XCIpLnRleHQoXCJDaG9vc2VcIik7XG4gICAgdmFyIGJfY2xlYXIgPSAkKFwiPGJ1dHRvbj5cIikudGV4dChcIkNsZWFyXCIpO1xuXG4gICAgZGl2LmFwcGVuZChzZWwpO1xuICAgIGRpdi5hcHBlbmQoJChcIjxicj5cIikpO1xuICAgIGRpdi5hcHBlbmQoYik7XG4gICAgZGl2LmFwcGVuZChiX2NsZWFyKTtcbiAgICAkKGRvY3VtZW50LmJvZHkpLmFwcGVuZChkaXYpO1xuXG4gICAgZGl2LmNzcyh7XG4gICAgICAgIHBvc2l0aW9uOiBcImZpeGVkXCIsXG4gICAgICAgIHRvcDogXCI0NXZoXCIsXG4gICAgICAgIGxlZnQ6IFwiMjV2d1wiLFxuICAgICAgICB3aWR0aDogXCI1MHZ3XCIsXG4gICAgICAgIGhlaWdodDogXCI1dmhcIixcbiAgICAgICAgYmFja2dyb3VuZDogXCJ3aGl0ZVwiLFxuICAgICAgICBib3JkZXI6IFwiMnZ3XCIsXG4gICAgICAgIFwidGV4dC1hbGlnblwiOiBcImNlbnRlclwiXG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBzZWxlY3Q6IHNlbCxcbiAgICAgICAgYnV0dG9uOiBiLFxuICAgICAgICBidXR0b25fY2xlYXI6IGJfY2xlYXIsXG4gICAgICAgIHdyYXA6IGRpdlxuICAgIH07XG59XG5cblxuZXhwb3J0IHsgU2F2ZXMgfTsiLCIvL09yZGVyIGlzIGltcG9ydGFudFxuXG5pbXBvcnQgeyBUcmlhbHMgfSBmcm9tICBcIi4vVHJpYWxzLmpzXCI7IC8vTmVlZHMgLi8gdG8gdHJlYXQgaXQgYXMgYW4gaW50ZXJuYWwgKG5vdCBleHRlcm5hbCBkZXBlbmRlbmN5KVxuaW1wb3J0IFwiLi9SdW5FeHBlcmltZW50LmpzXCI7XG4vL2ltcG9ydCBcIi4vMkFGQy5qc1wiO1xuXG5pbXBvcnQgeyBQYXVzZSB9IGZyb20gIFwiLi9JbnRlcnN0aW11bHVzUGF1c2UuanNcIjtcbmltcG9ydCB7IFNhdmVzIH0gZnJvbSBcIi4vU2F2ZXMuanNcIjtcblxuLy9UaGVzZSBhcmUgdGhlIGZpZWxkcyBvZiBFeHBlcmltZW50SlNcbmV4cG9ydCB7IFRyaWFscyB9O1xuZXhwb3J0IHsgUGF1c2UgfTtcbmV4cG9ydCB7IFNhdmVzIH07Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFPLFNBQVMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQzs7SUFFOUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNkLENBQUMsQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDO0lBQ3BCLENBQUMsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDOztJQUV0QixPQUFPLENBQUMsQ0FBQzs7O0FDUGI7OztBQUdBLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFlBQVk7SUFDbEMsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsV0FBVyxDQUFDOzs7SUFHNUQsT0FBTyxDQUFDLEtBQUssWUFBWSxFQUFFOzs7UUFHdkIsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLFlBQVksQ0FBQyxDQUFDO1FBQ3ZELFlBQVksSUFBSSxDQUFDLENBQUM7OztRQUdsQixjQUFjLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLGNBQWMsQ0FBQztLQUN0QztDQUNKOztBQ2pCRDs7OztBQUlBLEFBQU8sQUFFTjs7QUFFRCxBQUFPLFNBQVMsYUFBYSxDQUFDLEVBQUUsQ0FBQzs7SUFFN0IsSUFBSSxjQUFjLEdBQUcsa0NBQWtDLENBQUM7SUFDeEQsSUFBSSxjQUFjLEdBQUcsWUFBWSxDQUFD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
