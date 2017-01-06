(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.ExperimentJS = global.ExperimentJS || {})));
}(this, (function (exports) { 'use strict';

/**
 * Created by kai on 5/1/17.
 */
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

/**
 * Created by kai on 5/1/17.
 */
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                                          String Utils
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -

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

/**
 * Created by kai on 5/1/17.
 */
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

        if (_shouldRunMidCallback()) {
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
var _midCallback;
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
var _endCallBack;
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
            responseFormatted[stdName] = lastTrial[i].parserFunc(lastTrial[i], i);

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
    a.innerHTML = "<h4>Click to download results!</h4> <p>(if they didn't download already)</p>";
    a.className += " results-download";
    document.body.appendChild(a);
    a.click();
}

/**
 * Created by kai on 5/1/17.
 */
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

/**
 * Created by kai on 5/1/17.
 *
 * Join together all the trials submodules
 */

//Order is important
//import "./2AFC.js";

exports.Trials = Trials;
exports.Pause = Pause;
exports.Saves = Saves;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwZXJpbWVudEpTLmpzIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMvQ3JlYXRlRG93bmxvYWRMaW5rLmpzIiwiLi4vc3JjL3V0aWxzL1NodWZmbGUuanMiLCIuLi9zcmMvdXRpbHMvU3RyaW5nVXRpbHMuanMiLCIuLi9zcmMvdXRpbHMvTnVtYmVyVXRpbHMuanMiLCIuLi9zcmMvdXRpbHMvdXRpbHMuanMiLCIuLi9zcmMvY29yZS9UcmlhbHMuanMiLCIuLi9zcmMvY29yZS9JbnRlcnN0aW11bHVzUGF1c2UuanMiLCIuLi9zcmMvY29yZS9SdW5FeHBlcmltZW50LmpzIiwiLi4vc3JjL2NvcmUvU2F2ZXMuanMiLCIuLi9zcmMvY29yZS9jb3JlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSBrYWkgb24gNS8xLzE3LlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRG93bmxvYWRMaW5rKGZpbGVuYW1lLCBkYXRhKXtcbiAgICAvLy8vaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNzgzNjI3My9leHBvcnQtamF2YXNjcmlwdC1kYXRhLXRvLWNzdi1maWxlLXdpdGhvdXQtc2VydmVyLWludGVyYWN0aW9uXG4gICAgdmFyIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICBhLmhyZWYgPSBkYXRhO1xuICAgIGEudGFyZ2V0ID0gXCJfYmxhbmtcIjtcbiAgICBhLmRvd25sb2FkID0gZmlsZW5hbWU7XG4gXG4gICAgcmV0dXJuIGE7XG59IiwiLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBGaXNjaGVyIFlhdGVzIFNodWZmbGVcbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbkFycmF5LnByb3RvdHlwZS5zaHVmZmxlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBjdXJyZW50SW5kZXggPSB0aGlzLmxlbmd0aCwgdGVtcG9yYXJ5VmFsdWUsIHJhbmRvbUluZGV4O1xuXG4gICAgLy8gV2hpbGUgdGhlcmUgcmVtYWluIGVsZW1lbnRzIHRvIHNodWZmbGUuLi5cbiAgICB3aGlsZSAoMCAhPT0gY3VycmVudEluZGV4KSB7XG5cbiAgICAgICAgLy8gUGljayBhIHJlbWFpbmluZyBlbGVtZW50Li4uXG4gICAgICAgIHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY3VycmVudEluZGV4KTtcbiAgICAgICAgY3VycmVudEluZGV4IC09IDE7XG5cbiAgICAgICAgLy8gQW5kIHN3YXAgaXQgd2l0aCB0aGUgY3VycmVudCBlbGVtZW50LlxuICAgICAgICB0ZW1wb3JhcnlWYWx1ZSA9IHRoaXNbY3VycmVudEluZGV4XTtcbiAgICAgICAgdGhpc1tjdXJyZW50SW5kZXhdID0gdGhpc1tyYW5kb21JbmRleF07XG4gICAgICAgIHRoaXNbcmFuZG9tSW5kZXhdID0gdGVtcG9yYXJ5VmFsdWU7XG4gICAgfVxufTsiLCIvKipcbiAqIENyZWF0ZWQgYnkga2FpIG9uIDUvMS8xNy5cbiAqL1xuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdHJpbmcgVXRpbHNcbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbWVsVG9TZW50ZW5jZUNhc2Uoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5zcGxpdCgvKD89W0EtWl0pLykuam9pbihcIiBcIikudG9Mb3dlckNhc2UoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBhcmFtTmFtZXMoZm4pe1xuICAgIC8vd3JhcCB0aGVzZSBzbyBhcyBub3QgdG8gcG9sbHV0ZSB0aGUgbmFtZXNwYWNlXG4gICAgdmFyIFNUUklQX0NPTU1FTlRTID0gLygoXFwvXFwvLiokKXwoXFwvXFwqW1xcc1xcU10qP1xcKlxcLykpL21nO1xuICAgIHZhciBBUkdVTUVOVF9OQU1FUyA9IC8oW15cXHMsXSspL2c7XG4gICAgZnVuY3Rpb24gX2dldFBhcmFtTmFtZXMoZnVuYykge1xuICAgICAgICB2YXIgZm5TdHIgPSBmdW5jLnRvU3RyaW5nKCkucmVwbGFjZShTVFJJUF9DT01NRU5UUywgXCJcIik7XG4gICAgICAgIHZhciByZXN1bHQgPSBmblN0ci5zbGljZShmblN0ci5pbmRleE9mKFwiKFwiKSsxLCBmblN0ci5pbmRleE9mKFwiKVwiKSkubWF0Y2goQVJHVU1FTlRfTkFNRVMpO1xuICAgICAgICBpZihyZXN1bHQgPT09IG51bGwpXG4gICAgICAgICAgICByZXN1bHQgPSBbXTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICByZXR1cm4gX2dldFBhcmFtTmFtZXMoZm4pO1xufSIsIi8qKlxuICogQ3JlYXRlZCBieSBrYWkgb24gNS8xLzE3LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNGbG9hdChuKSB7XG4gICAgcmV0dXJuIE51bWJlcihuKSA9PT0gbiAmJiBuICUgMSAhPT0gMDtcbn0iLCIvKipcbiAqIENyZWF0ZWQgYnkga2FpIG9uIDUvMS8xNy5cbiAqL1xuXG5cbmltcG9ydCBcIi4vQ3JlYXRlRG93bmxvYWRMaW5rLmpzXCI7XG5pbXBvcnQgXCIuL1NodWZmbGUuanNcIjtcbmltcG9ydCBcIi4vU3RyaW5nVXRpbHMuanNcIjtcbmltcG9ydCBcIi4vTnVtYmVyVXRpbHMuanNcIjtcbiIsIi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUcmlhbHMgLSBDcmVhdGlvblxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuXG52YXIgVHJpYWxzID0ge307XG5leHBvcnQgdmFyIElWcyA9IHt9O1xuZXhwb3J0IHZhciBzZXRGdW5jcyA9IHt9O1xuXG52YXIgZXhwUmVwZWF0cyA9IDE7XG5cbi8qKiBFdmVyeSBJViByZXF1aXJlcyAyIHN0ZXBzOiBjcmVhdGluZyB0aGUgbGV2ZWxzIGFuZCB0aGVuLCBzZXR0aW5nIHRoZSB0YXJnZXQgKi9cblRyaWFscy5zZXRJVkxldmVscyA9IGZ1bmN0aW9uIChpdm5hbWUsIGxldmVscykge1xuICAgIF9zZXRJVkdlbmVyaWMoaXZuYW1lLCBcImxldmVsc1wiLCBsZXZlbHMpO1xufTtcblxuXG5UcmlhbHMuc2V0SVZzZXRGdW5jID0gZnVuY3Rpb24oaXZuYW1lLCBzZXRGdW5jKSB7XG5cbiAgICAvL1RoaXMgaXMgbm93IGEgZmxhZyB0byBub3RpZnkgRXhwZXJpbWVudEpTIHRoYXQgeW91XCJyZSB1c2luZyBmdW5jdGlvbnNcbiAgICBfc2V0SVZHZW5lcmljKGl2bmFtZSwgXCJzZXRGdW5jXCIsIHRydWUpO1xuXG4gICAgLy9GdW5jdGlvbnMgYXJlIG5vdyBzdG9yZWQgaW4gdGhlaXIgb3duIG1hcCwga2V5ZWQgYnkgaXZuYW1lXG4gICAgX3NldFNldEZ1bmMoaXZuYW1lLCBzZXRGdW5jKTtcbn07XG5cbmV4cG9ydCB2YXIgX2R2TmFtZTtcblRyaWFscy5zZXREVk5hbWUgPSBmdW5jdGlvbihkdk5hbWUpe1xuICAgIGlmICh0eXBlb2YgZHZOYW1lID09PSBcInN0cmluZ1wiKXtcbiAgICAgICAgX2NzdklsbGVnYWxDaGFyQ2hlY2soZHZOYW1lKTtcbiAgICAgICAgX2R2TmFtZSA9IGR2TmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyAgbmV3IEVycm9yKFwiVGhlIHN1cHBsaWVkIERWIG5hbWUgbXVzdCBiZSBvZiB0eXBlIFN0cmluZ1wiKTtcbiAgICB9XG59O1xuXG4vKlxuIFRoZSB0cmlhbCB2YWx1ZSB3aWxsIGFsd2F5cyBiZSBwYXNzZWQgaW4gYXMgdGhlIGZpcnN0IGFyZ3VtZW50XG4gVGhlIHR5cGUgb2YgdGhhdCB0cmlhbCB2YWx1ZSB3aWxsIGJlIHRoZSBmaXJzdCBub24gYXJyYXktb2YtYXJyYXlzIGluIHRoZSBleHBlcmltZW50XG4gcGFyc2VyRnVuY3MgYXJlIHBhc3NlZCBhcmdzIGluIHRoaXMgb3JkZXIgKHRyaWFsSVYsIGkpXG4gcGFyc2VyRnVuY3MgbXVzdCByZXR1cm4gdGhlIGZvcm1hdHRlZCB2YWx1ZVxuIFRoaXMgYXNzdW1lcyB5b3Uga25vdyB0aGUgY29udGVudCBvZiB0aGUgdHJpYWwgdmFsdWUsIHdoaWNoIHlvdSBzaG91bGQuLi4uXG4gKi9cblRyaWFscy5zZXRJVlRyaWFsUGFyc2VyRnVuYyA9IGZ1bmN0aW9uIChpdm5hbWUsIHBhcnNlckZ1bmMpIHtcbiAgICBfc2V0SVZHZW5lcmljKGl2bmFtZSwgXCJwYXJzZXJGdW5jXCIsIHBhcnNlckZ1bmMpO1xufTtcblxuXG5UcmlhbHMuc2V0UmVwZWF0cyA9IGZ1bmN0aW9uIChuUmVwZWF0cykge1xuICAgIGV4cFJlcGVhdHMgPSBuUmVwZWF0cztcbn07XG5cblxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRyaWFscyAtIENyZWF0aW9uIChwcml2YXRlKVxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuLypcbiogKi9cbmV4cG9ydCBmdW5jdGlvbiBfc2V0SVZHZW5lcmljKGl2TmFtZSwgZmllbGROYW1lLCBmaWVsZFZhbCkgeyAvL3VzZWQgYnkgMkFGQy5qc1xuICAgIF9jc3ZJbGxlZ2FsQ2hhckNoZWNrKGl2TmFtZSk7XG4gICAgX2NzdklsbGVnYWxDaGFyQ2hlY2soZmllbGROYW1lKTtcbiAgICBpZiAoIUlWcy5oYXNPd25Qcm9wZXJ0eShpdk5hbWUpKSB7IC8vSWYgSVYgZG9lbnN0IGV4aXN0cyBtYWtlIGl0IGFzIGEgcmF3IG9iamVjdFxuICAgICAgICBJVnNbaXZOYW1lXSA9IHt9O1xuICAgIH1cblxuICAgIElWc1tpdk5hbWVdW2ZpZWxkTmFtZV0gPSBmaWVsZFZhbDtcbn1cblxuXG5mdW5jdGlvbiBfc2V0U2V0RnVuYyhpdm5hbWUsIHNldGZ1bmMpe1xuICAgIHNldEZ1bmNzW2l2bmFtZV0gPSBzZXRmdW5jO1xufVxuXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVHJpYWxzIC0gQnVpbGRpbmdcbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cblxudmFyIF90b3RhbFRyaWFscyA9IC0xOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQXNzaWduZWQgYnV0IG5ldmVyIHVzZWRcbmV4cG9ydCB2YXIgX2FsbFRyaWFscyA9IFtdO1xuZXhwb3J0IGZ1bmN0aW9uIF9zZXRBbGxUcmlhbHMoYWxsdHJpYWxzKXtcbiAgICBpZiAoYWxsdHJpYWxzLmNvbnN0cnVjdG9yID09PSBBcnJheSl7XG4gICAgICAgIF9hbGxUcmlhbHMgPSBhbGx0cmlhbHM7XG4gICAgfVxufVxuXG5UcmlhbHMuZ2V0VHJpYWxzID0gZnVuY3Rpb24oKXtcbiAgICBpZiAoX2FsbFRyaWFscy5sZW5ndGggPiAwKXtcbiAgICAgICAgcmV0dXJuICQuZXh0ZW5kKHRydWUsIFtdLCBfYWxsVHJpYWxzKTtcbiAgICB9XG59O1xuXG5leHBvcnQgdmFyIF9kaWRCdWlsZFRyaWFscyA9IGZhbHNlO1xuZnVuY3Rpb24gX2J1aWxkVHJpYWxzKHByaW50VHJpYWxzKSB7XG5cbiAgICB2YXIgYnVpbGRpbmdUcmlhbCwgdGVtcDtcblxuICAgIGZvciAodmFyIGl2IGluIElWcykgeyAvL0l0ZXJhdGUgb3ZlciBJVnNcblxuICAgICAgICBjb25zb2xlLmxvZyhcIkV4dGVuZGluZyBhbGwgdHJpYWxzIGFycmF5IHdpdGg6XCIsIGl2LCBcIi4gTGV2ZWxzID1cIiwgSVZzW2l2XS5sZXZlbHMubGVuZ3RoKTtcblxuICAgICAgICBpZiAoc2V0RnVuY3NbaXZdID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihcIlNldEZ1bmMgbm90IGRlZmluZWQgZm9yIFwiICsgaXYpO1xuXG4gICAgICAgIHRlbXAgPSBbXTtcblxuICAgICAgICB2YXIgbGVuID0gX2FsbFRyaWFscy5sZW5ndGggPT09IDAgPyAxIDogX2FsbFRyaWFscy5sZW5ndGg7IC8vIEZvciB0aGUgZmlyc3QgcGFzc1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpIHsgLy9Gb3IgYWxsIHRyaWFscyBidWlsdCBzbyBmYXJcblxuICAgICAgICAgICAgYnVpbGRpbmdUcmlhbCA9IF9hbGxUcmlhbHMucG9wKCk7IC8vUG9wIHRoZSBpbmNvbXBsZXRlIGFycmF5IG9mIGl2LXZhbHMgKG9iamVjdHMpIGFuZCBleHRlbmRcblxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBJVnNbaXZdLmxldmVscy5sZW5ndGg7ICsraikgeyAvL0V4dGVuZCB0aGVtIGJ5IGFsbCB0aGUgbGV2ZWxzIG9mIHRoZSBuZXh0IElWXG5cblxuICAgICAgICAgICAgICAgIC8qKiBTZXQgdGhlIHZhbHVlICYgZGVzY3JpcHRpb24gb2YgdGhlIGN1cnJlbnQgSVYgb2JqIDQgdGhlIGN1cnJlbnQgTGV2ZWwgKi9cbiAgICAgICAgICAgICAgICB2YXIgY3VySVZMZXZlbCA9IHt9O1xuICAgICAgICAgICAgICAgIGN1cklWTGV2ZWwuZGVzY3JpcHRpb24gPSBpdjsgLy9jYW1lbFRvU2VudGVuY2VDYXNlKGl2KTtcbiAgICAgICAgICAgICAgICBjdXJJVkxldmVsLnZhbHVlID0gSVZzW2l2XS5sZXZlbHNbal07XG5cbiAgICAgICAgICAgICAgICAvKiogU3RvcmUgMkFGQyBzdGQgd2l0aCBlYWNoIHRyaWFsIChpZiBwcmVzZW50KSAqL1xuICAgICAgICAgICAgICAgIGlmIChJVnNbaXZdLmhhc093blByb3BlcnR5KFwic3RkXzJBRkNcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VySVZMZXZlbC5zdGRfMkFGQyA9IElWc1tpdl0uc3RkXzJBRkM7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLyoqIEZvciAyQUZDIHRoYXQgaXMgc2ltdWx0YW5lb3VzIChhcyBvcHBvc2VkIHRvIHRoZSBmbGlwcGluZyBraW5kKSovXG4gICAgICAgICAgICAgICAgaWYgKElWc1tpdl0uaGFzT3duUHJvcGVydHkoXCJzdGRfMkFGQ19zaW11bHRhbmVvdXNfdGFyZ2V0XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cklWTGV2ZWwuc3RkXzJBRkNfc2ltdWx0YW5lb3VzX3RhcmdldCA9IElWc1tpdl0uc3RkXzJBRkNfc2ltdWx0YW5lb3VzX3RhcmdldDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLyoqIFBhcnNlciBmdW5jdGlvbiovXG4gICAgICAgICAgICAgICAgaWYgKElWc1tpdl0ucGFyc2VyRnVuYyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cklWTGV2ZWwucGFyc2VyRnVuYyA9IElWc1tpdl0ucGFyc2VyRnVuYzsgLy9Db3VsZCB3cml0ZSBhIGNvcHlpbmcgbWV0aG9kIGZvciBhbGwgb2YgdGhlc2UgKHRoYXQgaGFuZGxlcyBkZWVwIGNvcHlpbmcpXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIG5ld09yRXh0ZW5kZWRUcmlhbDtcblxuICAgICAgICAgICAgICAgIGlmIChidWlsZGluZ1RyaWFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9uZXdPckV4dGVuZGVkVHJpYWwgPSAgaXYgKyBcIiAgXCIgKyBsZXZlbFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBuZXdPckV4dGVuZGVkVHJpYWwgPSBbY3VySVZMZXZlbF07XG5cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJ1aWxkaW5nVHJpYWwuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vbmV3T3JFeHRlbmRlZFRyaWFsID0gYnVpbGRpbmdUcmlhbCArIFwiIHwgfCBcIiArIGl2ICsgXCIgIFwiICsgbGV2ZWxWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgbmV3T3JFeHRlbmRlZFRyaWFsID0gYnVpbGRpbmdUcmlhbC5jb25jYXQoW2N1cklWTGV2ZWxdKTsgLy9DcmVhdGVzIGEgYnJhbmQgbmV3IGFycmF5IHcgdGhlIG5ldyBsZXZlbFxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRlbXAucHVzaChuZXdPckV4dGVuZGVkVHJpYWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqIFJlcGxhY2UgeW91ciBwcmV2aW91cyB0cmlhbHMgd2l0aCBUZW1wIChkb25cInQga25vdyB3aG8gdG8gZG8gdGhpcyBpbiBwbGFjZSkgKi9cbiAgICAgICAgX2FsbFRyaWFscyA9IHRlbXA7XG4gICAgfVxuXG5cbiAgICAvKiogRHVwbGljYXRlIHRoZSBjdXJyZW50IGZhY3RvcmlhbCB0cmlhbHMgKi9cbiAgICB2YXIgcmVwZWF0cyA9IGV4cFJlcGVhdHM7XG4gICAgdGVtcCA9IFtdO1xuICAgIGZvciAoaSA9IDA7IGkgPCByZXBlYXRzOyBpKyspIHtcbiAgICAgICAgdGVtcCA9IHRlbXAuY29uY2F0KF9hbGxUcmlhbHMpO1xuICAgIH1cbiAgICBfYWxsVHJpYWxzID0gdGVtcDtcblxuXG4gICAgY29uc29sZS5sb2coXCJUaGVyZSBhcmUgXCIsIF9hbGxUcmlhbHMubGVuZ3RoLCBcInRyaWFscyAodXNpbmdcIiwgcmVwZWF0cywgXCJyZXBlYXRzKVwiKTtcbiAgICBpZiAocHJpbnRUcmlhbHMpe1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgX2FsbFRyaWFscy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlRSSUFMIFwiLCBpKTtcbiAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBfYWxsVHJpYWxzW2ldLmxlbmd0aDsgaisrKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggX2FsbFRyaWFsc1tpXVtqXSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2coXCIqKioqKioqICoqKioqKiogKioqKioqKiAqKioqKioqXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2FsbFRyaWFscy5zaHVmZmxlKCk7XG5cbiAgICBfdG90YWxUcmlhbHMgPSBfYWxsVHJpYWxzLmxlbmd0aDsgLy9Vc2VkIHRvIGRldGVybWluZSB3aGVyZSB5b3UgYXJlIGluIHRoZSB0cmlhbCBwcm9jZXNzXG4gICAgX2RpZEJ1aWxkVHJpYWxzID0gdHJ1ZTtcbn1cblxuXG4vKipcbiAqIE5PVEU6IFdlIG5vIGxvbmdlciBoYW5kbGUgYXBwZWFyYW5jZSBvciBpbnB1dC4gVGhlc2UgYXJlIG91dCBvZiB0aGUgc2NvcGUgb2YgdGhpcyBtb2R1bGUuXG4gKiBUaGlzIG1vZHVsZSBub3cgb25seSBoYW5kbGVzIHRoZSBnYW1lIGxvb3Agb2ZcbiAqIC0gdGFraW5nIElWc1xuICogLSBidWlsZGluZyBhbGwgdHJpYWxzXG4gKiAtIHNldHRpbmcgdGhlIGRpc3BsYXkgKGFjY29yZGluZyB0byB0aGUgc3VwcGxpZWQgSVZzKVxuICogLSBzdG9yaW5nICYgb3V0cHV0dGluZyBfcmVzcG9uc2VzXG4gKlxuICogQWxsIG90aGVyIGJlaGF2aW91ciBzaG91bGQgYmUgcGVyZm9ybWVkIGJ5IGFub3RoZXIgbW9kdWVsIHRoYXQgd29ya3Mgd2l0aCB0aGlzIG9uZS5cbiAqICovXG5UcmlhbHMuYnVpbGRFeHBlcmltZW50ID0gZnVuY3Rpb24gKHByaW50VHJpYWxzKSB7XG4gICAgX2J1aWxkVHJpYWxzKCAocHJpbnRUcmlhbHMgPT09IHVuZGVmaW5lZCkgPyBmYWxzZSA6IHByaW50VHJpYWxzICk7XG59O1xuXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVHJpYWxzIChzdWJmdW5jdGlvbnMpXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG5mdW5jdGlvbiBfY3N2SWxsZWdhbENoYXJDaGVjayhzdHJpbmcpe1xuXG4gICAgaWYgKHR5cGVvZiBzdHJpbmcgIT09IFwic3RyaW5nXCIpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzdXBwbHkgYSB2YXJpYWJsZSBvZiB0eXBlIFN0cmluZyBmb3IgdGhpcyBtZXRob2RcIik7XG4gICAgfVxuXG4gICAgaWYgKHN0cmluZy5pbmRleE9mKFwiLFwiKSAhPT0gLTEpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTdHJpbmdzIHVzZWQgYnkgRXhwZXJpbWVudEpTIG1heSBub3QgY29udGFpbiBjb21tYXM6IFwiICsgc3RyaW5nKTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IFRyaWFscyB9OyIsImltcG9ydCB7IF9zaG91bGRSdW5OZXh0VHJpYWwsIF9zZXRTaG91bGRSdW5OZXh0VHJpYWwgfSBmcm9tIFwiLi9SdW5FeHBlcmltZW50LmpzXCI7XG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSW50ZXJzdGltdWx1cyBQYXVzZVxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuXG4gICAgXG4gICAgXG52YXIgUGF1c2UgPSB7fTtcblxuUGF1c2Uuc2hvd0ludGVyc3RpbXVsdXNQYXVzZSA9IGZ1bmN0aW9uIChkdXJhdGlvbikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIF9pbnRlcnN0aW11bHVzUGF1c2UoZHVyYXRpb24pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cbnZhciBfcGF1c2UgPSA1MDA7XG5QYXVzZS5zZXRQYXVzZVRpbWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09IHBhcnNlSW50KHZhbHVlLCAxMCkpIHtcbiAgICAgICAgX3BhdXNlID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgXCJzZXRQYXVzZVRpbWUgb25seSB0YWtlcyBpbnRlZ2Vyc1wiO1xuICAgIH1cbn07XG5cbmV4cG9ydCB2YXIgX3Nob3VsZEludGVyc3RpbXVsdXNQYXVzZSA9IHRydWU7ICAgICAgICAgICAgIC8vdXNlZCBpbjogUnVuRXhwZXJpbWVudC5qc1xuUGF1c2Uuc2V0U2hvdWxkSW50ZXJzdGltdWx1c1BhdXNlID0gZnVuY3Rpb24odmFsdWUpe1xuICAgIGlmICh0eXBlb2YgIHZhbHVlID09PSBcImJvb2xlYW5cIil7XG4gICAgICAgIF9zaG91bGRJbnRlcnN0aW11bHVzUGF1c2UgPSB2YWx1ZTtcbiAgICB9XG59O1xuXG52YXIgX2JsYWNrT3V0ID0gJChcIjxkaXY+XCIsIHtcbiAgICBpZDogXCJpbnRlcnN0aW11bHVzLXBhdXNlXCIsXG4gICAgY3NzOiB7XG4gICAgICAgIHBvc2l0aW9uOiBcImZpeGVkXCIsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIHRvcDogMCxcbiAgICAgICAgd2lkdGg6IFwiMTAwdndcIixcbiAgICAgICAgaGVpZ2h0OiBcIjEwMHZoXCIsXG4gICAgICAgIGJhY2tncm91bmQ6IFwiYmxhY2tcIlxuICAgIH1cbn0pO1xuXG4kKGRvY3VtZW50LmJvZHkpLmFwcGVuZChfYmxhY2tPdXQpO1xuJChcIiNpbnRlcnN0aW11bHVzLXBhdXNlXCIpLmhpZGUoKTtcblxudmFyIF9pc0ludGVyc3RpbXVsdXNQYXVzZSA9IGZhbHNlO1xuZXhwb3J0IGZ1bmN0aW9uIF9pbnRlcnN0aW11bHVzUGF1c2UoZHVyYXRpb24pIHsgICAgICAgICAvL3VzZWQgaW46IFJ1bkV4cGVyaW1lbnQuanNcblxuICAgIGR1cmF0aW9uID0gZHVyYXRpb24gPT09IHVuZGVmaW5lZCA/IF9wYXVzZSA6IGR1cmF0aW9uOyAvL0RlZmF1bHQgdG8gcGF1c2UgdGltZSB1bmxlc3MgYW4gYXJndW1lbnQgaXMgc3VwcGxpZWRcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICQoXCIjaW50ZXJzdGltdWx1cy1wYXVzZVwiKS5zaG93KCk7XG4gICAgICAgIF9pc0ludGVyc3RpbXVsdXNQYXVzZSA9IHRydWU7XG4gICAgICAgIF9zZXRTaG91bGRSdW5OZXh0VHJpYWwoZmFsc2UpO1xuXG4gICAgICAgIC8qUHJldmVudCBidXR0b24gbWFzaGluZyB3aGlsZSB0aGUgcGF1c2UgcnVucyovXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJChcIiNpbnRlcnN0aW11bHVzLXBhdXNlXCIpLmhpZGUoKTtcbiAgICAgICAgICAgIF9pc0ludGVyc3RpbXVsdXNQYXVzZSA9IGZhbHNlO1xuICAgICAgICAgICAgX3NldFNob3VsZFJ1bk5leHRUcmlhbCh0cnVlKTsgICAgICAgICAgIC8vQ2Fubm90IHJlYXNzaWduIGltcG9ydGVkIHZhbHVlcywgc28geW91IG5lZWQgYSBzZXR0ZXJcblxuICAgICAgICAgICAgcmVzb2x2ZSgpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1Byb21pc2UgaGFzIHJlc29sdmVkIGhlcmVcbiAgICAgICAgfSwgZHVyYXRpb24pO1xuICAgIH0pO1xufVxuXG5cbmV4cG9ydCB7IFBhdXNlIH07IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGthaSBvbiA1LzEvMTcuXG4gKi9cbmltcG9ydCB7IFRyaWFscywgc2V0RnVuY3MsIF9hbGxUcmlhbHMsIF9kaWRCdWlsZFRyaWFscywgX2R2TmFtZSB9IGZyb20gXCIuL1RyaWFscy5qc1wiO1xuaW1wb3J0IHsgX2ludGVyc3RpbXVsdXNQYXVzZSwgX3Nob3VsZEludGVyc3RpbXVsdXNQYXVzZSB9IGZyb20gXCIuL0ludGVyc3RpbXVsdXNQYXVzZS5qc1wiO1xuaW1wb3J0IHsgY3JlYXRlRG93bmxvYWRMaW5rIH0gZnJvbSBcIi4uL3V0aWxzL0NyZWF0ZURvd25sb2FkTGluay5qc1wiO1xuXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUnVuIEV4cGVyaW1lbnQgLSBHZXQgUGFydGljaXBhbnQgSW5mb1xuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuXG52YXIgX3BwdE5hbWUgPSBcInVubmFtZWRfcHB0XCI7XG52YXIgX3BwdE5vID0gMDtcblxuVHJpYWxzLmdldFBwdEluZm8gPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBfcHB0TmFtZSA9IHByb21wdChcIlBsZWFzZSBlbnRlciB5b3VyIG5hbWVcIikudHJpbSgpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIm5hbWUgd2FzXCIsIF9wcHROYW1lKTtcbiAgICAgICAgaWYgKF9wcHROYW1lID09PSBcIlwiIHx8IF9wcHROYW1lID09PSBudWxsKSB7XG4gICAgICAgICAgICBhbGVydChcIk5hbWUgY2Fubm90IGJlIGJsYW5rXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBfcHB0Tm8gPSBwYXJzZUludChwcm9tcHQoXCJQbGVhc2UgZW50ZXIgeW91ciBwYXJ0aWNpcGFudCBudW1iZXJcIikpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInBwdCBudW1iZXIgd2FzXCIsIF9wcHRObyk7XG4gICAgICAgIGlmIChpc05hTihfcHB0Tm8pKSB7XG4gICAgICAgICAgICBhbGVydChcIlBhcnRpY2lwYW50IG51bWJlciBtdXN0IGJlIGFuIGludGVnZXJcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKFwiUGFydGljaXBhbnQgbmFtZTogXCIsIF9wcHROYW1lLCBcIlxcdFBhcnRpY2lwYW50IG51bWJlcjogXCIsIF9wcHRObyk7XG59O1xuXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUnVuIEV4cGVyaW1lbnQgLSBHYW1lIExvb3Bcbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cblxuLy9DYW5ub3QgcmVhc3NpZ24gaW1wb3J0ZWQgdmFsdWVzLCBzbyB5b3UgbmVlZCBhIHNldHRlciAodXNlZCBpbiBJbnRlcnN0aW1sdXNQYXVzZS5qcylcbmV4cG9ydCBmdW5jdGlvbiBfc2V0U2hvdWxkUnVuTmV4dFRyaWFsKHZhbHVlKXtcbiAgICBpZiAodHlwZW9mKHZhbHVlKSA9PT0gXCJib29sZWFuXCIpe1xuICAgICAgICBfc2hvdWxkUnVuTmV4dFRyaWFsID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY2Fubm90IHNldCBfc2hvdWxkUnVuTmV4dFRyaWFsIHRvIGEgbm9uIGJvb2xlYW4gdmFsdWVcIik7XG4gICAgfVxufVxuXG5leHBvcnQgdmFyIF9zaG91bGRSdW5OZXh0VHJpYWwgPSB0cnVlOyAvL3VzZWQgYnk6IEludGVyc3RpbXVsdXNQYXVzZS5qc1xuVHJpYWxzLnJ1bk5leHRUcmlhbCA9IGZ1bmN0aW9uIChzZXR0aW5ncykgeyAvLyB1c2FnZSAtPiBydW5OZXh0VHJpYWwoe3Nob3VsZFN0b3JlUmVzcG9uc2U6IHRydWUsIGR2X3ZhbHVlOiBcImluc2lkZVwifSk7XG5cbiAgICBpZiAoIV9kaWRCdWlsZFRyaWFscyl7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcInJ1bk5leHRUcmlhbCgpOiBUcmlhbCB3ZXJlIG5vdCBidWlsdFwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChfc2hvdWxkUnVuTmV4dFRyaWFsKSB7XG5cbiAgICAgICAgLy8gVE9ETzogQ2hhbmdlIHRoZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgbWlkIGNhbGxiYWNrIC0gSnVzdCBjaGVjayB0aGUgbGVuZ3RoIG9mIHRoZSBfcmVzcG9uc2VzIGFycmF5IHZzIHRoZSBhbGx0cmlhbHMgYXJyYXkuLlxuXG4gICAgICAgIGlmIChfc2hvdWxkUnVuTWlkQ2FsbGJhY2soKSkge1xuICAgICAgICAgICAgX21pZENhbGxiYWNrKCk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmIChfc2hvdWxkSW50ZXJzdGltdWx1c1BhdXNlKSB7XG4gICAgICAgICAgICBfaW50ZXJzdGltdWx1c1BhdXNlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2V0dGluZ3MgIT09IHVuZGVmaW5lZCAmJiBzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eShcInNob3VsZFN0b3JlUmVzcG9uc2VcIikgJiYgc2V0dGluZ3Muc2hvdWxkU3RvcmVSZXNwb25zZSkge1xuICAgICAgICAgICAgX3N0b3JlUmVzcG9uc2Uoc2V0dGluZ3MpOyAvL1NldHRpbmdzIGNvbnRhaW5zIGEgZmllbGQgXCJkdl92YWx1ZVwiIHdoaWNoIGlzIGFsc28gcmVhZCBieSBfc3RvcmVSZXNwb25zZVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF9hbGxUcmlhbHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgX2Rpc3BsYXlOZXh0VHJpYWwoKTtcblxuICAgICAgICAgICAgLy8gX2N1cjJBRkNJc1RhcmdldCA9IHRydWU7XG4gICAgICAgICAgICAvKiogQWx3YXlzIHJlc2V0IHRoZSAyQUZDIHZhbHVlKi9cblxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJUaGVyZSBhcmUgXCIsIF9hbGxUcmlhbHMubGVuZ3RoLCBcIiB0cmlhbHMgcmVtYWluaW5nLlwiKTtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgLy9Qb3NzaWJseSB0b28gZGVzdHJ1Y3RpdmVcbiAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkuY2hpbGRyZW4oKS5mYWRlT3V0KCk7XG4gICAgICAgICAgICAvLyAkKFwiI2ludGVyc3RpbXVsdXMtcGF1c2VcIikuaGlkZSgpO1xuICAgICAgICAgICAgX291dHB1dFJlc3BvbnNlcyhfcmVzcG9uc2VzKTtcblxuICAgICAgICAgICAgaWYgKF9lbmRDYWxsQmFjayAhPT0gdW5kZWZpbmVkKSBfZW5kQ2FsbEJhY2soKTtcblxuXG4gICAgICAgIH1cbiAgICB9XG5cbn07XG5cbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbi8vICAgICAgICAgICAgICAgICAgUnVuIEV4cGVyaW1lbnQgLSBNaWQgUG9pbnQgQ2FsbGJhY2sgKGkuZS4gdGhlIFwidGFrZSBhIGJyZWFrXCIgbWVzc2FnZSlcbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cblxuXG52YXIgX2RpZFJ1bk1pZENhbGxiYWNrID0gZmFsc2U7XG52YXIgX21pZENhbGxiYWNrO1xuVHJpYWxzLnNldE1pZENhbGxiYWNrID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKXtcbiAgICAgICAgX21pZENhbGxiYWNrID0gdmFsdWU7XG4gICAgfSAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJPbmx5IGZ1bmN0aW9ucyBtYXkgYmUgYXNzaWduZWQgdG8gdGhlIGVuZCBjYWxsYmFja1wiKTtcbiAgICB9XG59O1xuXG5mdW5jdGlvbiBfc2hvdWxkUnVuTWlkQ2FsbGJhY2soKSB7XG5cbiAgICBpZiAoX2RpZFJ1bk1pZENhbGxiYWNrKSByZXR1cm4gZmFsc2U7XG5cbiAgICAvL01pZCBwb2ludCA9IHRoZXJlIGFyZSBhcyBtYW55IHJlc3BvbnNlcyBhcyB0cmlhbHMgKG9yIGEgZGlmZmVyZW5jZSBvZiBvbmUgZm9yIG9kZCBudW1iZXIgb2YgdHJpYWxzKVxuICAgIGlmIChfYWxsVHJpYWxzLmxlbmd0aCA9PT1fcmVzcG9uc2VzLmxlbmd0aCB8fCBNYXRoLmFicyhfYWxsVHJpYWxzLmxlbmd0aCAtX3Jlc3BvbnNlcy5sZW5ndGgpID09PSAxKXtcbiAgICAgICAgX2RpZFJ1bk1pZENhbGxiYWNrID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSdW4gRXhwZXJpbWVudCAtIEVuZCBDYWxsYmFja1xuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxudmFyIF9lbmRDYWxsQmFjaztcblRyaWFscy5zZXRFbmRDYWxsYmFjayA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIil7XG4gICAgICAgIF9lbmRDYWxsQmFjayA9IHZhbHVlO1xuICAgIH0gICBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiT25seSBmdW5jdGlvbnMgbWF5IGJlIGFzc2lnbmVkIHRvIHRoZSBlbmQgY2FsbGJhY2tcIik7XG4gICAgfVxuXG59O1xuXG5cbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUnVuIEV4cGVyaW1lbnQgLSBEaXNwbGF5aW5nIFRoZSBOZXh0IFRyaWFsXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG5cbi8qKiBXaGVyZSB2aWV3LWxldmVsIGVsZW1lbnRzIGFyZSBzZXQgLSB0aGlzIGlzIGxpa2UgdGhlIENPTlRST0xMRVIgbWV0aG9kIGludGVyZmFjaW5nIGJldHdlZW4gTU9ERUwgYW5kIFZJRVcqL1xuZnVuY3Rpb24gX2Rpc3BsYXlOZXh0VHJpYWwoKSB7XG4gICAgdmFyIG5leHRUcmlhbCA9IF9hbGxUcmlhbHNbX2FsbFRyaWFscy5sZW5ndGggLSAxXTsgLy9BbHdheXMgZ28gZnJvbSB0aGUgYmFja1xuICAgIGNvbnNvbGUubG9nKFwibmV4dCB0cmlhbDpcIiwgbmV4dFRyaWFsKTtcblxuICAgIC8qKiBJdGVyYXRlIG92ZXIgZWFjaCBJViBhbmQgc2V0IGl0cyBwb2ludGVyIHRvIGl0cyB2YWx1ZSBmb3IgdGhhdCB0cmlhbCAqL1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbmV4dFRyaWFsLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIF9zZXRPYmplY3RBcHBlYXJhbmNlUHJvcGVydGllcyhuZXh0VHJpYWxbaV0pO1xuXG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gX3NldE9iamVjdEFwcGVhcmFuY2VQcm9wZXJ0aWVzKGN1clByb3ApIHtcblxuICAgIC8qKiBVc2luZyBhIEZVTkNUSU9OIHRvIHNldCB0aGUgZGlzcGxheSovXG4gICAgaWYgKCBzZXRGdW5jc1tjdXJQcm9wLmRlc2NyaXB0aW9uXSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICBzZXRGdW5jc1tjdXJQcm9wLmRlc2NyaXB0aW9uXS5hcHBseShudWxsLCBjdXJQcm9wLnZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBzZXR0ZXIgZnVuY3Rpb24gc3VwcGxpZWQgYnk6IFwiICsgY3VyUHJvcCk7XG4gICAgfVxufVxuXG5cbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUnVuIEV4cGVyaW1lbnQgLSBTdG9yZSBSZXNwb25zZVxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuZXhwb3J0IHZhciBfcmVzcG9uc2VzID0gW107XG5leHBvcnQgZnVuY3Rpb24gX3NldFJlc3BvbnNlcyhyZXNwb25zZXMpe1xuICAgIGlmIChyZXNwb25zZXMuY29uc3RydWN0b3IgPT09IEFycmF5KXtcbiAgICAgICAgX3Jlc3BvbnNlcyA9IHJlc3BvbnNlcztcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJyZXBvbnNlcyBjYW4gb25seSBiZSBzZXQgdG8gYW4gYXJyYXlcIik7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBfc3RvcmVSZXNwb25zZShvcHRpb25zKSB7XG5cbiAgICB2YXIgbGFzdFRyaWFsID0gX2FsbFRyaWFscy5wb3AoKTtcblxuICAgIHZhciByZXNwb25zZUZvcm1hdHRlZCA9IHt9O1xuXG4gICAgLyoqIFN0b3JlIHRoZSBJViAtPiBXcml0ZSBvdXQgZWFjaCBJViAoMSBJViBwZXIgYXJyYXkgZWxlbWVudCkgdG8gYSBmaWVsZCAqL1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdFRyaWFsLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBpdk51bSA9IFwiSVZcIiArIGk7XG5cbiAgICAgICAgLy9JZiBhIHBhcnNlciBpcyBkZWZpbmVkIHVzZSBpdHMgb3V0cHV0IGFzIHRoZSB2YWx1ZSBvZiB0aGUgcmVzcG9uc2VcbiAgICAgICAgaWYgKGxhc3RUcmlhbFtpXS5wYXJzZXJGdW5jICE9PSB1bmRlZmluZWQgJiYgJC5pc0Z1bmN0aW9uKGxhc3RUcmlhbFtpXS5wYXJzZXJGdW5jKSl7XG4gICAgICAgICAgICB2YXIgc3RkTmFtZSA9IGl2TnVtICsgXCJfXCIgKyBsYXN0VHJpYWxbaV0uZGVzY3JpcHRpb24gKyBcIl92YWx1ZVwiO1xuICAgICAgICAgICAgcmVzcG9uc2VGb3JtYXR0ZWRbc3RkTmFtZV0gPSBsYXN0VHJpYWxbaV0ucGFyc2VyRnVuYyhsYXN0VHJpYWxbaV0sIGkpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAobGFzdFRyaWFsW2ldLnZhbHVlLmNvbnN0cnVjdG9yID09PSBBcnJheSkgeyAvL0NvbnNpZGVyIHRoZXNlIHRvIGJlIGRlZmF1bHRzIGZvciBqYXZhc2NyaXB0IHByaW1pdGl2ZSB0eXBlc1xuXG4gICAgICAgICAgICAvKiogTWFudWFsbHkgd3JpdGUgb3V0IGVhY2ggYXJndW1lbnQgKGZyb20gYW4gYXJyYXkpIHRvIGEgZmllbGQgaW4gdGhlIG9iamVjdFxuICAgICAgICAgICAgICogIE9ubHkgYXBwZW5kIGEgbnVtYmVyIGlmIHRoZXJlIGFyZSA+MSBhcmd1bWVudHMgcGFzc2VkIGluICovXG5cbiAgICAgICAgICAgIGlmIChsYXN0VHJpYWxbaV0udmFsdWUubGVuZ3RoID4gMSl7XG5cbiAgICAgICAgICAgICAgICAvL0lmIHVzaW5nIGEgc2V0RnVuYyBmdW5jdGlvbiB3aXRoIG11bHRpcGxlIGFyZ3MgLT4gdXNlIHRoZSBhcmcgbmFtZXMgdG8gZGVzY3JpYmUgdGhlIHZhbHVlcyB3cml0dGVuIHRvIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgIHZhciBhcmdfbmFtZXMsIGFyZ19uYW1lO1xuICAgICAgICAgICAgICAgIGFyZ19uYW1lcyA9IGdldFBhcmFtTmFtZXMoIHNldEZ1bmNzW2xhc3RUcmlhbFtpXS5kZXNjcmlwdGlvbl0gKTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbGFzdFRyaWFsW2ldLnZhbHVlLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ19uYW1lID0gYXJnX25hbWVzW2pdO1xuICAgICAgICAgICAgICAgICAgICByZXNwb25zZUZvcm1hdHRlZFtpdk51bSArIFwiX1wiICsgbGFzdFRyaWFsW2ldLmRlc2NyaXB0aW9uICsgXCJfdmFsdWVfXCIgKyBhcmdfbmFtZSBdID0gIGxhc3RUcmlhbFtpXS52YWx1ZVtqXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2VGb3JtYXR0ZWRbIGl2TnVtICsgXCJfXCIgKyBsYXN0VHJpYWxbaV0uZGVzY3JpcHRpb24gKyBcIl92YWx1ZVwiIF0gPSAgbGFzdFRyaWFsW2ldLnZhbHVlWzBdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNwb25zZUZvcm1hdHRlZFtpdk51bSArIFwiX1wiICsgbGFzdFRyaWFsW2ldLmRlc2NyaXB0aW9uICsgXCJfdmFsdWVcIl0gPSBsYXN0VHJpYWxbaV0udmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogQWRkIGEgdmFsdWUgb2YgdGhlIDJhZmMgc3RkIChmb3IgdGhlIHJlbGV2YW50IElWKSAqL1xuICAgICAgICBpZiAobGFzdFRyaWFsW2ldLmhhc093blByb3BlcnR5KFwic3RkXzJBRkNcIikpIHtcbiAgICAgICAgICAgIHJlc3BvbnNlRm9ybWF0dGVkW1wic3RkXzJBRkNcIl0gPSBsYXN0VHJpYWxbaV0uc3RkXzJBRkM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogQ2hlY2sgdGhhdCBhIDJhZmMgc3RkIHZhbHVlIHdhcyBhZGRlZCAtIGlmIG5vdCB5b3Ugd2FudCB0byBhZGQgYSBudWxsIHZhbHVlIG9yIGl0IHdpbGwgZnVjayB1cCB0aGUgY3N2IHdyaXRlKi9cbiAgICAvLyBpZiAoIXJlc3BvbnNlRm9ybWF0dGVkLmhhc093blByb3BlcnR5KFwic3RkXzJBRkNcIikgJiYgZGlkU2V0MkFGQykge1xuICAgIC8vICAgICByZXNwb25zZUZvcm1hdHRlZFtcInN0ZF8yQUZDXCJdID0gXCJudWxsXCI7XG4gICAgLy8gfVxuXG4gICAgXG5cbiAgICAvKiogU3RvcmUgdGhlIERWKi9cbiAgICBpZiAob3B0aW9ucyAhPT0gdW5kZWZpbmVkICYmIG9wdGlvbnMuaGFzT3duUHJvcGVydHkoXCJkdl92YWx1ZVwiKSkge1xuICAgICAgICB2YXIgdmFsdWUgPSBfZHZOYW1lIHx8IFwidmFsdWVcIjtcbiAgICAgICAgcmVzcG9uc2VGb3JtYXR0ZWRbXCJEVl9cIit2YWx1ZV0gPSBvcHRpb25zLmR2X3ZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGFsZXJ0KFwiTm8gRFYgd2FzIHN1cHBsaWVkIGJ5IHRoZSBjYWxsaW5nIGNvZGUuIFRoaXMgaXMgYW4gZXJyb3IuXCIpO1xuICAgICAgICByZXNwb25zZUZvcm1hdHRlZFtcIkRWX3ZhbHVlXCJdID0gXCJFUlJPUiAtIE5vIERWIHN1cHBsaWVkXCI7XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coXCJTVE9SRUQgVEhJUyBSRVNQT05TRTogXCIsIHJlc3BvbnNlRm9ybWF0dGVkKTtcblxuICAgIF9yZXNwb25zZXMucHVzaChyZXNwb25zZUZvcm1hdHRlZCk7XG59XG5cbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUnVuIEV4cGVyaW1lbnQgLSBPdXRwdXQgUmVzcG9uc2VzXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG5cblRyaWFscy5mb3JjZU91dHB1dFJlc3BvbnNlcyA9IGZ1bmN0aW9uKCl7XG4gICAgY29uc29sZS5sb2coXCJGb3JjaW5nIG91dHB1dCBvZiBfcmVzcG9uc2VzXCIpO1xuICAgIF9vdXRwdXRSZXNwb25zZXMoX3Jlc3BvbnNlcywgdHJ1ZSk7XG59O1xuXG5cbmZ1bmN0aW9uIF9vdXRwdXRSZXNwb25zZXMoYWxsUmVzcG9uc2VzLCBsb2cpIHtcblxuICAgIGlmIChhbGxSZXNwb25zZXMubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICB2YXIgY3N2U3RyaW5nID0gXCJcIjtcblxuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWxsUmVzcG9uc2VzWzBdKTtcbiAgICAvKipUaGVzZSBhcmUgYWxsIHRoZSBjb2x1bW5zIGluIHRoZSBvdXRwdXQqL1xuXG4gICAgLyoqIE1ha2UgdGhlIGhlYWRlciovXG4gICAgY3N2U3RyaW5nICs9IFwiUGFydGljaXBhbnQgTmFtZSwgUGFydGljaXBhbnQgTnVtYmVyLCBcIjsgLy9NYW51YWxseSBhZGQgaGVhZGVyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNzdlN0cmluZyArPSBrZXlzW2ldICsgXCIsXCI7XG4gICAgfVxuICAgIGNzdlN0cmluZyA9IGNzdlN0cmluZy5zbGljZSgwLCAtMSkgKyBcIlxcblwiOy8vQ3V0IHRyYWlsaW5nIGNvbW1hIGFuZCBwdXQgaW4gYSBuZXcgcm93L2xpbmVcblxuICAgIC8qKiBGaWxsIHRoZSBkYXRhIC0gVGhpcyB0aW1lIGl0cyBhbiBhcnJheSBvZiBhcnJheXMgbm90IGFycmF5IG9mIGRpY3Rpb25hcmllcyAqL1xuICAgIGZvciAoaSA9IDA7IGkgPCBhbGxSZXNwb25zZXMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICBjc3ZTdHJpbmcgKz0gX3BwdE5hbWUgKyBcIixcIiArIF9wcHRObyArIFwiLFwiOyAvL01hbmF1bGx5IGFkZCBjb250ZW50XG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBrZXlzLmxlbmd0aDsgaisrKSB7IC8vSXRlcmF0ZSBvdmVyIHRoZSBrZXlzIHRvIGdldCB0ZWggdmFsdWVzXG5cbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGFsbFJlc3BvbnNlc1tpXVtrZXlzW2pdXTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwid3JpdGluZyB0aGlzIHJhdyB2YWx1ZSBcIiwgdmFsdWUsIGtleXNbal0pO1xuICAgICAgICAgICAgLy92YWx1ZSA9IGNoZWNrUmV0dXJuUHJvcHMoIHZhbHVlLCB0cnVlICkgfHwgdmFsdWU7ICAvL1BhcnNlIG91dCByZWxldmFudCBvYmplY3QgZmllbGRzXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiQWZlciBpdCB3YXMgcGFyc2VkOlwiLCB2YWx1ZSwgXCJcXG4qKioqKioqKipcIik7XG4gICAgICAgICAgICBjc3ZTdHJpbmcgKz0gdmFsdWUgKyBcIixcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNzdlN0cmluZyA9IGNzdlN0cmluZy5zbGljZSgwLCAtMSkgKyBcIlxcblwiOyAvL0N1dCB0cmFpbGluZyBjb21tYSBhbmQgcHV0IGluIGEgbmV3IHJvdy9saW5lXG4gICAgfVxuXG4gICAgaWYgKGxvZykge1xuICAgICAgICBjb25zb2xlLmxvZyhjc3ZTdHJpbmcpO1xuICAgIH1cblxuICAgIC8qKiBIZWxwIG91dCBhIG1hY2hpbmUgdG9kYXkqL1xuICAgIHZhciBjc3ZDb250ZW50ID0gZW5jb2RlVVJJKFwiZGF0YTp0ZXh0L2NzdjtjaGFyc2V0PXV0Zi04LFwiICsgY3N2U3RyaW5nKTtcbiAgICB2YXIgYSA9IGNyZWF0ZURvd25sb2FkTGluayhcInJlc3VsdHMgKFwiICsgX3BwdE5hbWUgKyBcIixcIiArIF9wcHROby50b1N0cmluZygpICsgXCIpLmNzdlwiLCBjc3ZDb250ZW50KTtcbiAgICBhLmlubmVySFRNTCA9IFwiPGg0PkNsaWNrIHRvIGRvd25sb2FkIHJlc3VsdHMhPC9oND4gPHA+KGlmIHRoZXkgZGlkbid0IGRvd25sb2FkIGFscmVhZHkpPC9wPlwiO1xuICAgIGEuY2xhc3NOYW1lICs9IFwiIHJlc3VsdHMtZG93bmxvYWRcIjtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGEpO1xuICAgIGEuY2xpY2soKTtcbn1cblxuXG4iLCIvKipcbiAqIENyZWF0ZWQgYnkga2FpIG9uIDUvMS8xNy5cbiAqL1xuaW1wb3J0IHsgVHJpYWxzLF9hbGxUcmlhbHMsIF9zZXRBbGxUcmlhbHMsIF9kaWRCdWlsZFRyaWFsc30gZnJvbSBcIi4vVHJpYWxzLmpzXCI7XG5pbXBvcnQgeyBfcmVzcG9uc2VzLCBfc2V0UmVzcG9uc2VzIH0gZnJvbSBcIi4vUnVuRXhwZXJpbWVudC5qc1wiO1xuXG5cbnZhciBTYXZlcyA9IHt9O1xuXG5TYXZlcy5wYXJzZVRyaWFsc0ZvclNhdmluZyA9IHVuZGVmaW5lZDsgLy9pbnRlcmZhY2UgaXMgKF9hbGxUcmlhbHMpXG5TYXZlcy5wYXJzZVJlc3BvbnNlc0ZvclNhdmluZyA9IHVuZGVmaW5lZDsgLy9pbnRlcmZhY2UgaXMgKF9yZXNwb25zZXMpXG5TYXZlcy51bnBhcnNlU2F2ZWRUcmlhbHMgPSB1bmRlZmluZWQ7XG5TYXZlcy51bnBhcnNlU2F2ZWRSZXNwb25zZXMgPSB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGVycm9yQ2hlY2tTYXZpbmdQYXJzZXJzKCl7XG4gICAgaWYgKFNhdmVzLnBhcnNlVHJpYWxzRm9yU2F2aW5nID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCByZXN0b3JlIHRyaWFscyB3aXRob3V0IHBhcnNpbmcgZnVuY3Rpb25cIik7XG4gICAgaWYgKFNhdmVzLnBhcnNlUmVzcG9uc2VzRm9yU2F2aW5nID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCByZXN0b3JlIF9yZXNwb25zZXMgd2l0aG91dCBwYXJzaW5nIGZ1bmN0aW9uXCIpO1xuICAgIGlmIChTYXZlcy51bnBhcnNlU2F2ZWRUcmlhbHMgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHJlc3RvcmUgdHJpYWxzIHdpdGhvdXQgVU5wYXJzaW5nIGZ1bmN0aW9uXCIpO1xuICAgIGlmIChTYXZlcy51bnBhcnNlU2F2ZWRSZXNwb25zZXMgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHJlc3RvcmUgX3Jlc3BvbnNlcyB3aXRob3V0IFVOcGFyc2luZyBmdW5jdGlvblwiKTtcbn1cblxuXG5TYXZlcy5jbGVhclNhdmVzID0gZnVuY3Rpb24oKXtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcImV4cGVyaW1lbnRKU3NhdmVzXCIpOy8vLy8vXG59O1xuXG5cblNhdmVzLnNhdmVCdWlsdFRyaWFsc0FuZFJlc3BvbnNlcyA9IGZ1bmN0aW9uKCkge1xuICAgIFxuICAgIGVycm9yQ2hlY2tTYXZpbmdQYXJzZXJzKCk7XG5cbiAgICBpZiAodHlwZW9mKFN0b3JhZ2UpICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cbiAgICAgICAgLy8gbG9jYWxTdG9yYWdlLmV4cGVyaW1lbnRKU3NhdmVzID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIC8vUGFyc2UgeW91ciB0cmlhbHMsIHVzaW5nIHRoZSBjdXN0b20gc2VyaWFsaXplci4uXG4gICAgICAgIHZhciB0cmlhbHNGb3JTYXZpbmcgPSBTYXZlcy5wYXJzZVRyaWFsc0ZvclNhdmluZyhfYWxsVHJpYWxzKTtcbiAgICAgICAgdmFyIHJlc3BvbnNlc0ZvclNhdmluZyA9IFNhdmVzLnBhcnNlUmVzcG9uc2VzRm9yU2F2aW5nKF9yZXNwb25zZXMpO1xuXG4gICAgICAgIC8vSlNPTmlmeSB0aGUgdHJpYWxzIGFuZCBfcmVzcG9uc2VzXG4gICAgICAgIHZhciBleHBlcmltZW50SlNzYXZlcyA9IHt9O1xuICAgICAgICBleHBlcmltZW50SlNzYXZlc1tcInRyaWFsc1wiXSA9IHRyaWFsc0ZvclNhdmluZztcbiAgICAgICAgZXhwZXJpbWVudEpTc2F2ZXNbXCJyZXNwb25zZXNcIl0gPSByZXNwb25zZXNGb3JTYXZpbmc7XG5cbiAgICAgICAgdmFyIG1zZyA9IHByb21wdChcIkFkZCBhIG1lc3NhZ2UgdG8gdGhpcyBzYXZlIVwiKTtcblxuICAgICAgICBpZiAobXNnID09PSBudWxsKXtcbiAgICAgICAgICAgIGFsZXJ0KFwiVHJpYWxzIHdpbGwgbm90IGJlIHNhdmVkXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRhdGVLZXkgPSAobmV3IERhdGUoKSkudG9VVENTdHJpbmcoKTsgLy9WZXJ5IGNsZWFyIGRhdGVcblxuICAgICAgICAvL01ha2UgYSBuZXcgZGljdGlvbmFyeSBvciBnZXQgdGhlIG9sZCBvbmVcbiAgICAgICAgdmFyIGtleWVkX2J5X2RhdGVzID0gKGxvY2FsU3RvcmFnZS5leHBlcmltZW50SlNzYXZlcyA9PT0gdW5kZWZpbmVkKSA/IHt9IDogSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZXhwZXJpbWVudEpTc2F2ZXMpO1xuXG4gICAgICAgIC8vc2F2ZSB0byBpdFxuICAgICAgICBrZXllZF9ieV9kYXRlc1ttc2cgKyBcIiAtIFwiICtkYXRlS2V5XSA9IGV4cGVyaW1lbnRKU3NhdmVzO1xuXG4gICAgICAgIC8vc2VyaWFsaXplIVxuICAgICAgICBsb2NhbFN0b3JhZ2UuZXhwZXJpbWVudEpTc2F2ZXMgPSBKU09OLnN0cmluZ2lmeShrZXllZF9ieV9kYXRlcyk7XG5cbiAgICAgICAgY29uc29sZS5sb2coXCJTYXZlZCBUcmlhbHNcIiwgSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZXhwZXJpbWVudEpTc2F2ZXMpKTtcbiAgICB9XG59O1xuXG5cblNhdmVzLnNldFNhdmVkVHJpYWxzQW5kUmVzcG9uc2VzID0gZnVuY3Rpb24oKXtcbiAgICBlcnJvckNoZWNrU2F2aW5nUGFyc2VycygpO1xuXG4gICAgdmFyIGFsbF9zYXZlcyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmV4cGVyaW1lbnRKU3NhdmVzKTtcblxuICAgIGNvbnNvbGUubG9nKFwiYWxsIHNhdmVzKyBcIiwgYWxsX3NhdmVzKTtcblxuXG4gICAgdmFyIHNlbGVjdF9iaXRzID0gX2NyZWF0ZURyb3BEb3duU2VsZWN0KGFsbF9zYXZlcyk7XG4gICAgc2VsZWN0X2JpdHMuYnV0dG9uLmNsaWNrKGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgdmFyIHRlbXBfdXNpbmcgPSBzZWxlY3RfYml0cy5zZWxlY3QuZmluZChcIjpzZWxlY3RlZFwiKS50ZXh0KCk7XG5cbiAgICAgICAgdGVtcF91c2luZyA9IGFsbF9zYXZlc1t0ZW1wX3VzaW5nXTtcblxuICAgICAgICBfc2V0QWxsVHJpYWxzKCBTYXZlcy51bnBhcnNlU2F2ZWRUcmlhbHModGVtcF91c2luZ1tcInRyaWFsc1wiXSkgKTtcbiAgICAgICAgX3NldFJlc3BvbnNlcyggU2F2ZXMudW5wYXJzZVNhdmVkUmVzcG9uc2VzKHRlbXBfdXNpbmdbXCJyZXNwb25zZXNcIl0pICk7XG4gICAgICAgIGlmIChfcmVzcG9uc2VzID09PSB1bmRlZmluZWQgfHwgX3Jlc3BvbnNlcyA9PT0gbnVsbCkgX3NldFJlc3BvbnNlcyggW10gKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhcInJlc3RvcmVkIGFsbCB0cmlhbHM6IFwiLCBfYWxsVHJpYWxzKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJyZXN0b3JlZCBhbGwgX3Jlc3BvbnNlczogXCIsIF9yZXNwb25zZXMpO1xuXG4gICAgICAgIFRyaWFscy5ydW5OZXh0VHJpYWwoKTtcblxuICAgICAgICAvL1JlbW92ZSBzZWxlY3QgZnJvbSBkb21cbiAgICAgICAgc2VsZWN0X2JpdHMud3JhcC5yZW1vdmUoKTtcbiAgICB9KTtcblxuICAgIHNlbGVjdF9iaXRzLmJ1dHRvbl9jbGVhci5jbGljayhmdW5jdGlvbigpe1xuXG4gICAgICAgIGlmIChjb25maXJtKFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSBhbGwgc2F2ZWQgZXhwZXJpbWVudHM/XCIpKXtcbiAgICAgICAgICAgIFNhdmVzLmNsZWFyU2F2ZXMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vUmVtb3ZlIHNlbGVjdCBmcm9tIGRvbVxuICAgICAgICBzZWxlY3RfYml0cy53cmFwLnJlbW92ZSgpO1xuICAgIH0pO1xuXG59O1xuXG5cbmZ1bmN0aW9uIF9jcmVhdGVEcm9wRG93blNlbGVjdChhbGxfc2F2ZXMpe1xuXG4gICAgdmFyIGRpdiA9ICQoXCI8ZGl2PlwiLCB7XG4gICAgICAgIGlkOiBcInNhdmVkX2luZm9cIlxuICAgIH0pO1xuXG4gICAgLy9NYWtlIGEgc2VsZWN0IHRvIGNob29zZSBmcm9tIHRoZSBzYXZlc1xuICAgIHZhciBzZWwgPSAkKFwiPHNlbGVjdD5cIik7XG4gICAgT2JqZWN0LmtleXMoYWxsX3NhdmVzKS5tYXAoZnVuY3Rpb24oZWxlbSwgaSwgYWxsKXtcbiAgICAgICAgLy9Vc2UgdGhlIGluZGV4IGFzIHRoZSBrZXlcbiAgICAgICAgc2VsLmFwcGVuZCgkKFwiPG9wdGlvbj5cIikuYXR0cihcInZhbHVlXCIsaSkudGV4dChlbGVtKSk7XG4gICAgfSk7XG5cblxuICAgIC8vQnV0dG9uIC0gbm8gZnVuY3Rpb25hbGl0eSBoZXJlLCBqdXN0IHZpZXdcbiAgICB2YXIgYiA9ICQoXCI8YnV0dG9uPlwiKS50ZXh0KFwiQ2hvb3NlXCIpO1xuICAgIHZhciBiX2NsZWFyID0gJChcIjxidXR0b24+XCIpLnRleHQoXCJDbGVhclwiKTtcblxuICAgIGRpdi5hcHBlbmQoc2VsKTtcbiAgICBkaXYuYXBwZW5kKCQoXCI8YnI+XCIpKTtcbiAgICBkaXYuYXBwZW5kKGIpO1xuICAgIGRpdi5hcHBlbmQoYl9jbGVhcik7XG4gICAgJChkb2N1bWVudC5ib2R5KS5hcHBlbmQoZGl2KTtcblxuICAgIGRpdi5jc3Moe1xuICAgICAgICBwb3NpdGlvbjogXCJmaXhlZFwiLFxuICAgICAgICB0b3A6IFwiNDV2aFwiLFxuICAgICAgICBsZWZ0OiBcIjI1dndcIixcbiAgICAgICAgd2lkdGg6IFwiNTB2d1wiLFxuICAgICAgICBoZWlnaHQ6IFwiNXZoXCIsXG4gICAgICAgIGJhY2tncm91bmQ6IFwid2hpdGVcIixcbiAgICAgICAgYm9yZGVyOiBcIjJ2d1wiLFxuICAgICAgICBcInRleHQtYWxpZ25cIjogXCJjZW50ZXJcIlxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2VsZWN0OiBzZWwsXG4gICAgICAgIGJ1dHRvbjogYixcbiAgICAgICAgYnV0dG9uX2NsZWFyOiBiX2NsZWFyLFxuICAgICAgICB3cmFwOiBkaXZcbiAgICB9O1xufVxuXG5cbmV4cG9ydCB7IFNhdmVzIH07IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGthaSBvbiA1LzEvMTcuXG4gKlxuICogSm9pbiB0b2dldGhlciBhbGwgdGhlIHRyaWFscyBzdWJtb2R1bGVzXG4gKi9cblxuLy9PcmRlciBpcyBpbXBvcnRhbnRcbmltcG9ydCB7IFRyaWFscyB9IGZyb20gIFwiLi9UcmlhbHMuanNcIjsgLy9OZWVkcyAuLyB0byB0cmVhdCBpdCBhcyBhbiBpbnRlcm5hbCAobm90IGV4dGVybmFsIGRlcGVuZGVuY3kpXG5pbXBvcnQgXCIuL1J1bkV4cGVyaW1lbnQuanNcIjtcbi8vaW1wb3J0IFwiLi8yQUZDLmpzXCI7XG5cbmltcG9ydCB7IFBhdXNlIH0gZnJvbSAgXCIuL0ludGVyc3RpbXVsdXNQYXVzZS5qc1wiO1xuaW1wb3J0IHsgU2F2ZXMgfSBmcm9tIFwiLi9TYXZlcy5qc1wiO1xuXG5cbi8vVGhlc2UgYXJlIHRoZSBmaWVsZHMgb2YgRXhwZXJpbWVudEpTXG5leHBvcnQgeyBUcmlhbHMgfTtcbmV4cG9ydCB7IFBhdXNlIH07XG5leHBvcnQgeyBTYXZlcyB9OyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7O0FBR0EsQUFBTyxTQUFTLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUM7O0lBRTlDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDcEMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDZCxDQUFDLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQztJQUNwQixDQUFDLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQzs7SUFFdEIsT0FBTyxDQUFDLENBQUM7OztBQ1ZiOzs7QUFHQSxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxZQUFZO0lBQ2xDLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLFdBQVcsQ0FBQzs7O0lBRzVELE9BQU8sQ0FBQyxLQUFLLFlBQVksRUFBRTs7O1FBR3ZCLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxZQUFZLENBQUMsQ0FBQztRQUN2RCxZQUFZLElBQUksQ0FBQyxDQUFDOzs7UUFHbEIsY0FBYyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxjQUFjLENBQUM7S0FDdEM7Q0FDSjs7QUNsQkQ7Ozs7O29HQUtvRyxBQUVwRyxBQUFPLEFBRU4sQUFFRCxBQUFPOztBQ1hQ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Z0JBQWdCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQ3RDLENBQUM7OztBQUdGLFNBQVMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRTs7SUFFekMsSUFBSSxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxPQUFPOztJQUV0QyxJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7O0lBRW5CLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7SUFJeEMsU0FBUyxJQUFJLHdDQUF3QyxDQUFDO0lBQ3RELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ2xDLFNBQVMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0tBQzlCO0lBQ0QsU0FBUyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDOzs7SUFHMUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFOztRQUV0QyxTQUFTLElBQUksUUFBUSxHQUFHLEdBQUcsR0FBRyxNQUFNLEdBQUcsR0FBRyxDQUFDOztRQUUzQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTs7WUFFbEMsSUFBSSxLQUFLLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7O1lBSXJDLFNBQVMsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDO1NBQzVCOztRQUVELFNBQVMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FB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
