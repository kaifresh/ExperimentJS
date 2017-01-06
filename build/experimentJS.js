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
    var a = document.createElement('a');
    a.href = data;
    a.target = '_blank';
    a.download = filename;
 
    return a;
}

/**
 * Created by kai on 5/1/17.
 */
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
    _setIVGeneric(ivname, 'levels', levels);
};


Trials.setIVsetFunc = function(ivname, setFunc) {

    //This is now a flag to notify ExperimentJS that you're using functions
    _setIVGeneric(ivname, 'setFunc', true);

    //Functions are now stored in their own map, keyed by ivname
    _setSetFunc(ivname, setFunc);
};

var _dvName;
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
function _setIVGeneric(ivName, fieldName, fieldVal) { //used by 2AFC.js
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
var _allTrials = [];
function _setAllTrials(alltrials){
    if (alltrials.constructor === Array){
        _allTrials = alltrials;
    }
}


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
        throw 'setPauseTime only takes integers';
    }
};

var _shouldInterstimulusPause = true;             //used in: RunExperiment.js
Pause.setShouldInterstimulusPause = function(value){
    if (typeof  value === 'boolean'){
        _shouldInterstimulusPause = value;
    }
};

var _blackOut = $('<div>', {
    id: 'interstimulus-pause',
    css: {
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        background: 'black'
    }
});

$(document.body).append(_blackOut);
$('#interstimulus-pause').hide();

var _isInterstimulusPause = false;
function _interstimulusPause(duration) {         //used in: RunExperiment.js

    duration = duration === undefined ? _pause : duration; //Default to pause time unless an argument is supplied

    return new Promise(function (resolve, reject) {
        $('#interstimulus-pause').show();
        _isInterstimulusPause = true;
        _setShouldRunNextTrial(false);

        /*Prevent button mashing while the pause runs*/
        setTimeout(function () {
            $('#interstimulus-pause').hide();
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

var _pptName = 'unnamed_ppt';
var _pptNo = 0;

Trials.getPptInfo = function () {

    while (true) {
        _pptName = prompt('Please enter your name').trim();
        console.log('name was', _pptName);
        if (_pptName === '' || _pptName === null) {
            alert('Name cannot be blank');
        } else {
            break;
        }
    }

    while (true) {
        _pptNo = parseInt(prompt('Please enter your participant number'));
        console.log('ppt number was', _pptNo);
        if (isNaN(_pptNo)) {
            alert('Participant number must be an integer');
        } else {
            break;
        }
    }

    console.log('Participant name: ', _pptName, '\tParticipant number: ', _pptNo);
    // }
};

// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                                      Run Experiment - Game Loop
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -

//Cannot reassign imported values, so you need a setter
function _setShouldRunNextTrial(value){
    if (typeof(value) === "boolean"){
        _shouldRunNextTrial = value;
    } else {
        throw new Error("cannot set _shouldRunNextTrial to a non boolean value");
    }
}

var _shouldRunNextTrial = true; //used by: InterstimulusPause.js
Trials.runNextTrial = function (settings) { // usage -> runNextTrial({shouldStoreResponse: true, dv_value: 'inside'});

    if (!_didBuildTrials){
        throw new Error("runNextTrial(): Trial were not built");
        return;
    }

    if (_shouldRunNextTrial) {

        //TODO: Remove this  [[ DONE ]] 
        // TODO: Change the implementation of the mid callback - Just check the length of the _responses array vs the alltrials array..
        // if (midTrialCallBack !== undefined) {
        _checkRunMidCallback(); //See if you need to run the callback yet
        // }

        //TODO: Remove this  [[ DONE ]] 
        if (_shouldInterstimulusPause) {
            _interstimulusPause();
        }

        //TODO: Remove this  [[ DONE ]]
        if (settings !== undefined && settings.hasOwnProperty('shouldStoreResponse') && settings.shouldStoreResponse) {
            _storeResponse(settings); //Settings contains a field 'dv_value' which is also read by _storeResponse
        }

        if (_allTrials.length > 0) {
            _displayNextTrial();

            // _cur2AFCIsTarget = true;
            /** Always reset the 2AFC value*/

            console.log('There are ', _allTrials.length, ' trials remaining.');
            $('#messages-text-three').html('<p>There are ' + _allTrials.length + ' trials remaining.</p>################<br>');
        } else {

            //Possibly too destructive
            $(document.body).children().fadeOut();
            // $('#interstimulus-pause').hide();
            _outputResponses(_responses);

            if (typeof _endCallBack === 'function') {
                _endCallBack();
            }
        }
    }

};

// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                  Run Experiment - Mid Point Callback (i.e. the "take a break" message)
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -


function _checkRunMidCallback() {

    console.log("Compare lengths of alltrials & _responses ", _allTrials.length);

}

// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                                  Run Experiment - End Callback
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
var _endCallBack;
Trials.setEndCalback = function (value) {
    _endCallBack = value;
};


// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                                 Run Experiment - Displaying The Next Trial
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -

/** Where view-level elements are set - this is like the CONTROLLER method interfacing between MODEL and VIEW*/
function _displayNextTrial() {
    var nextTrial = _allTrials[_allTrials.length - 1]; //Always go from the back
    console.log('next trial:', nextTrial);

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
        throw new Error("No setter function supplied by: ");
        console.log(curProp);
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
        var ivNum = 'IV' + i;

        //If a parser is defined use its output as the value of the response
        if (lastTrial[i].parserFunc !== undefined && $.isFunction(lastTrial[i].parserFunc)){
            var stdName = ivNum + '_' + lastTrial[i].description + '_value';
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
                    responseFormatted[ivNum + '_' + lastTrial[i].description + '_value_' + arg_name ] =  lastTrial[i].value[j];
                }

            } else {
                responseFormatted[ ivNum + '_' + lastTrial[i].description + '_value' ] =  lastTrial[i].value[0];
            }

        } else {
            responseFormatted[ivNum + '_' + lastTrial[i].description + '_value'] = lastTrial[i].value;
        }

        /** Add a value of the 2afc std (for the relevant IV) */
        if (lastTrial[i].hasOwnProperty('std_2AFC')) {
            responseFormatted['std_2AFC'] = lastTrial[i].std_2AFC;
        }
    }

    /** Check that a 2afc std value was added - if not you want to add a null value or it will fuck up the csv write*/
    // if (!responseFormatted.hasOwnProperty('std_2AFC') && didSet2AFC) {
    //     responseFormatted['std_2AFC'] = 'null';
    // }

    

    /** Store the DV*/
    if (options !== undefined && options.hasOwnProperty('dv_value')) {
        var value = _dvName || 'value';
        responseFormatted['DV_'+value] = options.dv_value;
    } else {
        alert('No DV was supplied by the calling code. This is an error.');
        responseFormatted['DV_value'] = 'ERROR - No DV supplied';
    }

    console.log('STORED THIS RESPONSE: ', responseFormatted);

    _responses.push(responseFormatted);
}

// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                                 Run Experiment - Output Responses
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -

Trials.forceOutputResponses = function(){
    console.log("Forcing output of _responses");
    _outputResponses(responses, true);
};


function _outputResponses(allResponses, log) {

    if (allResponses.length === 0) return;

    var csvString = '';

    var keys = Object.keys(allResponses[0]);
    /**These are all the columns in the output*/

    /** Make the header*/
    csvString += 'Participant Name, Participant Number, '; //Manually add header
    for (var i = 0; i < keys.length; i++) {
        csvString += keys[i] + ',';
    }
    csvString = csvString.slice(0, -1) + '\n';//Cut trailing comma and put in a new row/line

    /** Fill the data - This time its an array of arrays not array of dictionaries */
    for (i = 0; i < allResponses.length; i++) {

        csvString += _pptName + ',' + _pptNo + ','; //Manaully add content

        for (var j = 0; j < keys.length; j++) { //Iterate over the keys to get teh values

            var value = allResponses[i][keys[j]];
            // console.log('writing this raw value ', value, keys[j]);
            //value = checkReturnProps( value, true ) || value;  //Parse out relevant object fields
            //console.log('Afer it was parsed:', value, '\n*********');
            csvString += value + ',';
        }

        csvString = csvString.slice(0, -1) + '\n'; //Cut trailing comma and put in a new row/line
    }

    if (log) {
        console.log(csvString);
    }

    /** Help out a machine today*/
    var csvContent = encodeURI('data:text/csv;charset=utf-8,' + csvString);
    var a = createDownloadLink('results (' + _pptName + ',' + _pptNo.toString() + ').csv', csvContent);
    a.innerHTML = "<h4>Click to download results!</h4> <p>(if they didn't download already)</p>";
    a.className += ' results-download';

    document.body.appendChild(a);
    a.click();
}

/**
 * Created by kai on 5/1/17.
 */
var Saves = {};

Saves.parseTrialsForSaving = undefined;
Saves.parseResponsesForSaving = undefined;
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


Saves.saveBuiltTrialsAndResponses = function(key) {

    // localStorage.clear();

    errorCheckSavingParsers();

    if (typeof(Storage) !== "undefined") {

        // localStorage.experimentJSsaves = undefined;

        //Parse your trials, using the custom serializer..
        var trialsForSaving = exports.parseTrialsForSaving(_allTrials);
        var responsesForSaving = exports.parseResponsesForSaving(_responses);

        //JSONify the trials and _responses
        var experimentJSsaves = {};
        experimentJSsaves['trials'] = trialsForSaving;
        experimentJSsaves['responses'] = responsesForSaving;

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

        console.log("SAVED THE SHIT", JSON.parse(localStorage.experimentJSsaves));
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

        _setAllTrials( Saves.unparseSavedTrials(temp_using['trials']) );
        _setResponses( Saves.unparseSavedResponses(temp_using['responses']) );
        if (_responses === undefined || _responses === null) _setResponses( [] );

        console.log("restored all trials: ", _allTrials);
        console.log("restored all _responses: ", _responses);

        Trials.runNextTrial();

        //Remove select from dom
        select_bits.wrap.remove();
    });

    select_bits.button_clear.click(function(){

        if (confirm("Are you sure you want to delete all saved experiments?")){
            exports.clearSaves();
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
    var sel = $('<select>');
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
    }
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

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwZXJpbWVudEpTLmpzIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMvQ3JlYXRlRG93bmxvYWRMaW5rLmpzIiwiLi4vc3JjL3V0aWxzL1NodWZmbGUuanMiLCIuLi9zcmMvdXRpbHMvU3RyaW5nVXRpbHMuanMiLCIuLi9zcmMvdXRpbHMvTnVtYmVyVXRpbHMuanMiLCIuLi9zcmMvdXRpbHMvdXRpbHMuanMiLCIuLi9zcmMvY29yZS9UcmlhbHMuanMiLCIuLi9zcmMvY29yZS9JbnRlcnN0aW11bHVzUGF1c2UuanMiLCIuLi9zcmMvY29yZS9SdW5FeHBlcmltZW50LmpzIiwiLi4vc3JjL2NvcmUvU2F2ZXMuanMiLCIuLi9zcmMvY29yZS9jb3JlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSBrYWkgb24gNS8xLzE3LlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRG93bmxvYWRMaW5rKGZpbGVuYW1lLCBkYXRhKXtcbiAgICAvLy8vaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNzgzNjI3My9leHBvcnQtamF2YXNjcmlwdC1kYXRhLXRvLWNzdi1maWxlLXdpdGhvdXQtc2VydmVyLWludGVyYWN0aW9uXG4gICAgdmFyIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgYS5ocmVmID0gZGF0YTtcbiAgICBhLnRhcmdldCA9ICdfYmxhbmsnO1xuICAgIGEuZG93bmxvYWQgPSBmaWxlbmFtZTtcbiBcbiAgICByZXR1cm4gYTtcbn0iLCIvKipcbiAqIENyZWF0ZWQgYnkga2FpIG9uIDUvMS8xNy5cbiAqL1xuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBGaXNjaGVyIFlhdGVzIFNodWZmbGVcbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbkFycmF5LnByb3RvdHlwZS5zaHVmZmxlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBjdXJyZW50SW5kZXggPSB0aGlzLmxlbmd0aCwgdGVtcG9yYXJ5VmFsdWUsIHJhbmRvbUluZGV4O1xuXG4gICAgLy8gV2hpbGUgdGhlcmUgcmVtYWluIGVsZW1lbnRzIHRvIHNodWZmbGUuLi5cbiAgICB3aGlsZSAoMCAhPT0gY3VycmVudEluZGV4KSB7XG5cbiAgICAgICAgLy8gUGljayBhIHJlbWFpbmluZyBlbGVtZW50Li4uXG4gICAgICAgIHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY3VycmVudEluZGV4KTtcbiAgICAgICAgY3VycmVudEluZGV4IC09IDE7XG5cbiAgICAgICAgLy8gQW5kIHN3YXAgaXQgd2l0aCB0aGUgY3VycmVudCBlbGVtZW50LlxuICAgICAgICB0ZW1wb3JhcnlWYWx1ZSA9IHRoaXNbY3VycmVudEluZGV4XTtcbiAgICAgICAgdGhpc1tjdXJyZW50SW5kZXhdID0gdGhpc1tyYW5kb21JbmRleF07XG4gICAgICAgIHRoaXNbcmFuZG9tSW5kZXhdID0gdGVtcG9yYXJ5VmFsdWU7XG4gICAgfVxufTsiLCIvKipcbiAqIENyZWF0ZWQgYnkga2FpIG9uIDUvMS8xNy5cbiAqL1xuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdHJpbmcgVXRpbHNcbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbWVsVG9TZW50ZW5jZUNhc2Uoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5zcGxpdCgvKD89W0EtWl0pLykuam9pbignICcpLnRvTG93ZXJDYXNlKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQYXJhbU5hbWVzKGZuKXtcbiAgICAvL3dyYXAgdGhlc2Ugc28gYXMgbm90IHRvIHBvbGx1dGUgdGhlIG5hbWVzcGFjZVxuICAgIHZhciBTVFJJUF9DT01NRU5UUyA9IC8oKFxcL1xcLy4qJCl8KFxcL1xcKltcXHNcXFNdKj9cXCpcXC8pKS9tZztcbiAgICB2YXIgQVJHVU1FTlRfTkFNRVMgPSAvKFteXFxzLF0rKS9nO1xuICAgIGZ1bmN0aW9uIF9nZXRQYXJhbU5hbWVzKGZ1bmMpIHtcbiAgICAgICAgdmFyIGZuU3RyID0gZnVuYy50b1N0cmluZygpLnJlcGxhY2UoU1RSSVBfQ09NTUVOVFMsICcnKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGZuU3RyLnNsaWNlKGZuU3RyLmluZGV4T2YoJygnKSsxLCBmblN0ci5pbmRleE9mKCcpJykpLm1hdGNoKEFSR1VNRU5UX05BTUVTKTtcbiAgICAgICAgaWYocmVzdWx0ID09PSBudWxsKVxuICAgICAgICAgICAgcmVzdWx0ID0gW107XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIF9nZXRQYXJhbU5hbWVzKGZuKTtcbn0iLCIvKipcbiAqIENyZWF0ZWQgYnkga2FpIG9uIDUvMS8xNy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRmxvYXQobikge1xuICAgIHJldHVybiBOdW1iZXIobikgPT09IG4gJiYgbiAlIDEgIT09IDA7XG59IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGthaSBvbiA1LzEvMTcuXG4gKi9cblxuXG5pbXBvcnQgXCIuL0NyZWF0ZURvd25sb2FkTGluay5qc1wiO1xuaW1wb3J0IFwiLi9TaHVmZmxlLmpzXCI7XG5pbXBvcnQgXCIuL1N0cmluZ1V0aWxzLmpzXCI7XG5pbXBvcnQgXCIuL051bWJlclV0aWxzLmpzXCI7XG4iLCIvLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVHJpYWxzIC0gQ3JlYXRpb25cbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cblxudmFyIFRyaWFscyA9IHt9O1xuZXhwb3J0IHZhciBJVnMgPSB7fTtcbmV4cG9ydCB2YXIgc2V0RnVuY3MgPSB7fTtcblxudmFyIGV4cFJlcGVhdHMgPSAxO1xuXG4vKiogRXZlcnkgSVYgcmVxdWlyZXMgMiBzdGVwczogY3JlYXRpbmcgdGhlIGxldmVscyBhbmQgdGhlbiwgc2V0dGluZyB0aGUgdGFyZ2V0ICovXG5UcmlhbHMuc2V0SVZMZXZlbHMgPSBmdW5jdGlvbiAoaXZuYW1lLCBsZXZlbHMpIHtcbiAgICBfc2V0SVZHZW5lcmljKGl2bmFtZSwgJ2xldmVscycsIGxldmVscyk7XG59O1xuXG5cblRyaWFscy5zZXRJVnNldEZ1bmMgPSBmdW5jdGlvbihpdm5hbWUsIHNldEZ1bmMpIHtcblxuICAgIC8vVGhpcyBpcyBub3cgYSBmbGFnIHRvIG5vdGlmeSBFeHBlcmltZW50SlMgdGhhdCB5b3UncmUgdXNpbmcgZnVuY3Rpb25zXG4gICAgX3NldElWR2VuZXJpYyhpdm5hbWUsICdzZXRGdW5jJywgdHJ1ZSk7XG5cbiAgICAvL0Z1bmN0aW9ucyBhcmUgbm93IHN0b3JlZCBpbiB0aGVpciBvd24gbWFwLCBrZXllZCBieSBpdm5hbWVcbiAgICBfc2V0U2V0RnVuYyhpdm5hbWUsIHNldEZ1bmMpO1xufTtcblxuZXhwb3J0IHZhciBfZHZOYW1lO1xuVHJpYWxzLnNldERWTmFtZSA9IGZ1bmN0aW9uKGR2TmFtZSl7XG4gICAgaWYgKHR5cGVvZiBkdk5hbWUgPT09IFwic3RyaW5nXCIpe1xuICAgICAgICBfY3N2Rm9kZGVyQ2hlY2soZHZOYW1lKTtcbiAgICAgICAgX2R2TmFtZSA9IGR2TmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyAgbmV3IEVycm9yKFwiVGhlIHN1cHBsaWVkIERWIG5hbWUgbXVzdCBiZSBvZiB0eXBlIFN0cmluZ1wiKTtcbiAgICB9XG59O1xuXG4vKlxuIFRoZSB0cmlhbCB2YWx1ZSB3aWxsIGFsd2F5cyBiZSBwYXNzZWQgaW4gYXMgdGhlIGZpcnN0IGFyZ3VtZW50XG4gVGhlIHR5cGUgb2YgdGhhdCB0cmlhbCB2YWx1ZSB3aWxsIGJlIHRoZSBmaXJzdCBub24gYXJyYXktb2YtYXJyYXlzIGluIHRoZSBleHBlcmltZW50XG4gcGFyc2VyRnVuY3MgYXJlIHBhc3NlZCBhcmdzIGluIHRoaXMgb3JkZXIgKHRyaWFsSVYsIGkpXG4gcGFyc2VyRnVuY3MgbXVzdCByZXR1cm4gdGhlIGZvcm1hdHRlZCB2YWx1ZVxuIFRoaXMgYXNzdW1lcyB5b3Uga25vdyB0aGUgY29udGVudCBvZiB0aGUgdHJpYWwgdmFsdWUsIHdoaWNoIHlvdSBzaG91bGQuLi4uXG4gKi9cblRyaWFscy5zZXRJVlRyaWFsUGFyc2VyRnVuYyA9IGZ1bmN0aW9uIChpdm5hbWUsIHBhcnNlckZ1bmMpIHtcbiAgICBfc2V0SVZHZW5lcmljKGl2bmFtZSwgJ3BhcnNlckZ1bmMnLCBwYXJzZXJGdW5jKTtcbn07XG5cblxuVHJpYWxzLnNldFJlcGVhdHMgPSBmdW5jdGlvbiAoblJlcGVhdHMpIHtcbiAgICBleHBSZXBlYXRzID0gblJlcGVhdHM7XG59O1xuXG5cbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUcmlhbHMgLSBDcmVhdGlvbiAocHJpdmF0ZSlcbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbi8qXG4qICovXG5leHBvcnQgZnVuY3Rpb24gX3NldElWR2VuZXJpYyhpdk5hbWUsIGZpZWxkTmFtZSwgZmllbGRWYWwpIHsgLy91c2VkIGJ5IDJBRkMuanNcbiAgICBfY3N2Rm9kZGVyQ2hlY2soaXZOYW1lKTtcbiAgICBfY3N2Rm9kZGVyQ2hlY2soZmllbGROYW1lKTtcbiAgICBpZiAoIUlWcy5oYXNPd25Qcm9wZXJ0eShpdk5hbWUpKSB7IC8vSWYgSVYgZG9lbnN0IGV4aXN0cyBtYWtlIGl0IGFzIGEgcmF3IG9iamVjdFxuICAgICAgICBJVnNbaXZOYW1lXSA9IHt9O1xuICAgIH1cblxuICAgIElWc1tpdk5hbWVdW2ZpZWxkTmFtZV0gPSBmaWVsZFZhbDtcbn1cblxuXG5mdW5jdGlvbiBfc2V0U2V0RnVuYyhpdm5hbWUsIHNldGZ1bmMpe1xuICAgIHNldEZ1bmNzW2l2bmFtZV0gPSBzZXRmdW5jO1xufVxuXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVHJpYWxzIC0gQnVpbGRpbmdcbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cblxudmFyIF90b3RhbFRyaWFscyA9IC0xO1xuZXhwb3J0IHZhciBfYWxsVHJpYWxzID0gW107XG5leHBvcnQgZnVuY3Rpb24gX3NldEFsbFRyaWFscyhhbGx0cmlhbHMpe1xuICAgIGlmIChhbGx0cmlhbHMuY29uc3RydWN0b3IgPT09IEFycmF5KXtcbiAgICAgICAgX2FsbFRyaWFscyA9IGFsbHRyaWFsc1xuICAgIH1cbn1cblxuXG5leHBvcnQgdmFyIF9kaWRCdWlsZFRyaWFscyA9IGZhbHNlO1xuZnVuY3Rpb24gX2J1aWxkVHJpYWxzKHByaW50VHJpYWxzKSB7XG5cbiAgICB2YXIgYnVpbGRpbmdUcmlhbCwgdGVtcDtcblxuICAgIGZvciAodmFyIGl2IGluIElWcykgeyAvL0l0ZXJhdGUgb3ZlciBJVnNcblxuICAgICAgICBjb25zb2xlLmxvZyhcIkV4dGVuZGluZyBhbGwgdHJpYWxzIGFycmF5IHdpdGg6XCIsIGl2LCBcIi4gTGV2ZWxzID1cIiwgSVZzW2l2XS5sZXZlbHMubGVuZ3RoKTtcblxuICAgICAgICBpZiAoc2V0RnVuY3NbaXZdID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihcIlNldEZ1bmMgbm90IGRlZmluZWQgZm9yIFwiICsgaXYpO1xuXG4gICAgICAgIHRlbXAgPSBbXTtcblxuICAgICAgICB2YXIgbGVuID0gX2FsbFRyaWFscy5sZW5ndGggPT09IDAgPyAxIDogX2FsbFRyaWFscy5sZW5ndGg7IC8vIEZvciB0aGUgZmlyc3QgcGFzc1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpIHsgLy9Gb3IgYWxsIHRyaWFscyBidWlsdCBzbyBmYXJcblxuICAgICAgICAgICAgYnVpbGRpbmdUcmlhbCA9IF9hbGxUcmlhbHMucG9wKCk7IC8vUG9wIHRoZSBpbmNvbXBsZXRlIGFycmF5IG9mIGl2LXZhbHMgKG9iamVjdHMpIGFuZCBleHRlbmRcblxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBJVnNbaXZdLmxldmVscy5sZW5ndGg7ICsraikgeyAvL0V4dGVuZCB0aGVtIGJ5IGFsbCB0aGUgbGV2ZWxzIG9mIHRoZSBuZXh0IElWXG5cblxuICAgICAgICAgICAgICAgIC8qKiBTZXQgdGhlIHZhbHVlICYgZGVzY3JpcHRpb24gb2YgdGhlIGN1cnJlbnQgSVYgb2JqIDQgdGhlIGN1cnJlbnQgTGV2ZWwgKi9cbiAgICAgICAgICAgICAgICB2YXIgY3VySVZMZXZlbCA9IHt9O1xuICAgICAgICAgICAgICAgIGN1cklWTGV2ZWwuZGVzY3JpcHRpb24gPSBpdjsgLy9jYW1lbFRvU2VudGVuY2VDYXNlKGl2KTtcbiAgICAgICAgICAgICAgICBjdXJJVkxldmVsLnZhbHVlID0gSVZzW2l2XS5sZXZlbHNbal07XG5cbiAgICAgICAgICAgICAgICAvKiogU3RvcmUgMkFGQyBzdGQgd2l0aCBlYWNoIHRyaWFsIChpZiBwcmVzZW50KSAqL1xuICAgICAgICAgICAgICAgIGlmIChJVnNbaXZdLmhhc093blByb3BlcnR5KCdzdGRfMkFGQycpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cklWTGV2ZWwuc3RkXzJBRkMgPSBJVnNbaXZdLnN0ZF8yQUZDO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8qKiBGb3IgMkFGQyB0aGF0IGlzIHNpbXVsdGFuZW91cyAoYXMgb3Bwb3NlZCB0byB0aGUgZmxpcHBpbmcga2luZCkqL1xuICAgICAgICAgICAgICAgIGlmIChJVnNbaXZdLmhhc093blByb3BlcnR5KCdzdGRfMkFGQ19zaW11bHRhbmVvdXNfdGFyZ2V0JykpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VySVZMZXZlbC5zdGRfMkFGQ19zaW11bHRhbmVvdXNfdGFyZ2V0ID0gSVZzW2l2XS5zdGRfMkFGQ19zaW11bHRhbmVvdXNfdGFyZ2V0O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8qKiBTRVRURVIgRlVOVElPTlMgLSBTZXR0aW5nIGRpc3BsYXkgcHJvcGVydGllcyB2aWEgYSBmdW5jdGlvblxuICAgICAgICAgICAgICAgICAqIFRoZXNlIGFyZSBvbmx5IHN0b3JpbmcgYSBib29sZWFuIFRydWUgZmxhZy4gKi9cbiAgICAgICAgICAgICAgICAvLyBpZiAoSVZzW2l2XS5zZXRGdW5jICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgY3VySVZMZXZlbC5zZXRGdW5jID0gSVZzW2l2XS5zZXRGdW5jO1xuICAgICAgICAgICAgICAgIC8vIH1cblxuICAgICAgICAgICAgICAgIC8qKiBQYXJzZXIgZnVuY3Rpb24qL1xuICAgICAgICAgICAgICAgIGlmIChJVnNbaXZdLnBhcnNlckZ1bmMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBjdXJJVkxldmVsLnBhcnNlckZ1bmMgPSBJVnNbaXZdLnBhcnNlckZ1bmM7IC8vQ291bGQgd3JpdGUgYSBjb3B5aW5nIG1ldGhvZCBmb3IgYWxsIG9mIHRoZXNlICh0aGF0IGhhbmRsZXMgZGVlcCBjb3B5aW5nKVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBuZXdPckV4dGVuZGVkVHJpYWw7XG5cbiAgICAgICAgICAgICAgICBpZiAoYnVpbGRpbmdUcmlhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vbmV3T3JFeHRlbmRlZFRyaWFsID0gIGl2ICsgXCIgIFwiICsgbGV2ZWxWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgbmV3T3JFeHRlbmRlZFRyaWFsID0gW2N1cklWTGV2ZWxdO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChidWlsZGluZ1RyaWFsLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICAvL25ld09yRXh0ZW5kZWRUcmlhbCA9IGJ1aWxkaW5nVHJpYWwgKyBcIiB8IHwgXCIgKyBpdiArIFwiICBcIiArIGxldmVsVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIG5ld09yRXh0ZW5kZWRUcmlhbCA9IGJ1aWxkaW5nVHJpYWwuY29uY2F0KFtjdXJJVkxldmVsXSk7IC8vQ3JlYXRlcyBhIGJyYW5kIG5ldyBhcnJheSB3IHRoZSBuZXcgbGV2ZWxcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0ZW1wLnB1c2gobmV3T3JFeHRlbmRlZFRyaWFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKiBSZXBsYWNlIHlvdXIgcHJldmlvdXMgdHJpYWxzIHdpdGggVGVtcCAoZG9uJ3Qga25vdyB3aG8gdG8gZG8gdGhpcyBpbiBwbGFjZSkgKi9cbiAgICAgICAgX2FsbFRyaWFscyA9IHRlbXA7XG4gICAgfVxuXG5cbiAgICAvKiogRHVwbGljYXRlIHRoZSBjdXJyZW50IGZhY3RvcmlhbCB0cmlhbHMgKi9cbiAgICB2YXIgcmVwZWF0cyA9IGV4cFJlcGVhdHM7XG4gICAgdGVtcCA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVwZWF0czsgaSsrKSB7XG4gICAgICAgIHRlbXAgPSB0ZW1wLmNvbmNhdChfYWxsVHJpYWxzKTtcbiAgICB9XG4gICAgX2FsbFRyaWFscyA9IHRlbXA7XG5cblxuICAgIGNvbnNvbGUubG9nKFwiVGhlcmUgYXJlIFwiLCBfYWxsVHJpYWxzLmxlbmd0aCwgXCJ0cmlhbHMgKHVzaW5nXCIsIHJlcGVhdHMsIFwicmVwZWF0cylcIik7XG4gICAgaWYgKHByaW50VHJpYWxzKXtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfYWxsVHJpYWxzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVFJJQUwgXCIsIGkpO1xuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBfYWxsVHJpYWxzW2ldLmxlbmd0aDsgaisrKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggX2FsbFRyaWFsc1tpXVtqXSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2coXCIqKioqKioqICoqKioqKiogKioqKioqKiAqKioqKioqXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2FsbFRyaWFscy5zaHVmZmxlKCk7XG5cbiAgICBfdG90YWxUcmlhbHMgPSBfYWxsVHJpYWxzLmxlbmd0aDsgLy9Vc2VkIHRvIGRldGVybWluZSB3aGVyZSB5b3UgYXJlIGluIHRoZSB0cmlhbCBwcm9jZXNzXG4gICAgX2RpZEJ1aWxkVHJpYWxzID0gdHJ1ZTtcbn1cblxuXG4vKipcbiAqIE5PVEU6IFdlIG5vIGxvbmdlciBoYW5kbGUgYXBwZWFyYW5jZSBvciBpbnB1dC4gVGhlc2UgYXJlIG91dCBvZiB0aGUgc2NvcGUgb2YgdGhpcyBtb2R1bGUuXG4gKiBUaGlzIG1vZHVsZSBub3cgb25seSBoYW5kbGVzIHRoZSBnYW1lIGxvb3Agb2ZcbiAqIC0gdGFraW5nIElWc1xuICogLSBidWlsZGluZyBhbGwgdHJpYWxzXG4gKiAtIHNldHRpbmcgdGhlIGRpc3BsYXkgKGFjY29yZGluZyB0byB0aGUgc3VwcGxpZWQgSVZzKVxuICogLSBzdG9yaW5nICYgb3V0cHV0dGluZyBfcmVzcG9uc2VzXG4gKlxuICogQWxsIG90aGVyIGJlaGF2aW91ciBzaG91bGQgYmUgcGVyZm9ybWVkIGJ5IGFub3RoZXIgbW9kdWVsIHRoYXQgd29ya3Mgd2l0aCB0aGlzIG9uZS5cbiAqICovXG5UcmlhbHMuYnVpbGRFeHBlcmltZW50ID0gZnVuY3Rpb24gKHByaW50VHJpYWxzKSB7XG4gICAgX2J1aWxkVHJpYWxzKCAocHJpbnRUcmlhbHMgPT09IHVuZGVmaW5lZCkgPyBmYWxzZSA6IHByaW50VHJpYWxzICk7XG59O1xuXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVHJpYWxzIChzdWJmdW5jdGlvbnMpXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG5mdW5jdGlvbiBfY3N2Rm9kZGVyQ2hlY2soc3RyaW5nKXtcblxuICAgIGlmICh0eXBlb2Ygc3RyaW5nICE9PSBcInN0cmluZ1wiKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc3VwcGx5IGEgdmFyaWFibGUgb2YgdHlwZSBTdHJpbmcgZm9yIHRoaXMgbWV0aG9kXCIpO1xuICAgIH1cblxuICAgIGlmIChzdHJpbmcuaW5kZXhPZihcIixcIikgIT09IC0xKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3RyaW5ncyB1c2VkIGJ5IEV4cGVyaW1lbnRKUyBtYXkgbm90IGNvbnRhaW4gY29tbWFzOiBcIiArIHN0cmluZyk7XG4gICAgfVxufVxuXG4vLyBUcmlhbHMucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbiggT2JqZWN0LmNyZWF0ZSApXG5cbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbi8vXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG5cbi8vIHZhciBUcmlhbHMgPSB7XG4vLyAgICAgSVZzOiBJVnMsXG4vLyAgICAgc2V0RnVuY3M6IHNldEZ1bmNzLFxuLy8gICAgIHNldElWR2VuZXJpYzogX3NldElWR2VuZXJpYyxcbi8vICAgICBzZXRJVkxldmVsczogc2V0SVZMZXZlbHMsXG4vLyAgICAgc2V0U2V0RnVuYzogX3NldFNldEZ1bmMsXG4vLyAgICAgY3N2Rm9kZGVyQ0hlY2s6IF9jc3ZGb2RkZXJDaGVja1xuLy8gfTtcblxuXG5leHBvcnQgeyBUcmlhbHMgfTsiLCJpbXBvcnQgeyBfc2hvdWxkUnVuTmV4dFRyaWFsLCBfc2V0U2hvdWxkUnVuTmV4dFRyaWFsIH0gZnJvbSBcIi4vUnVuRXhwZXJpbWVudC5qc1wiO1xuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEludGVyc3RpbXVsdXMgUGF1c2Vcbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cblxuICAgIFxuICAgIFxudmFyIFBhdXNlID0ge307XG5cblBhdXNlLnNob3dJbnRlcnN0aW11bHVzUGF1c2UgPSBmdW5jdGlvbiAoZHVyYXRpb24pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBfaW50ZXJzdGltdWx1c1BhdXNlKGR1cmF0aW9uKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG52YXIgX3BhdXNlID0gNTAwO1xuUGF1c2Uuc2V0UGF1c2VUaW1lID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSBwYXJzZUludCh2YWx1ZSwgMTApKSB7XG4gICAgICAgIF9wYXVzZSA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93ICdzZXRQYXVzZVRpbWUgb25seSB0YWtlcyBpbnRlZ2Vycyc7XG4gICAgfVxufTtcblxuZXhwb3J0IHZhciBfc2hvdWxkSW50ZXJzdGltdWx1c1BhdXNlID0gdHJ1ZTsgICAgICAgICAgICAgLy91c2VkIGluOiBSdW5FeHBlcmltZW50LmpzXG5QYXVzZS5zZXRTaG91bGRJbnRlcnN0aW11bHVzUGF1c2UgPSBmdW5jdGlvbih2YWx1ZSl7XG4gICAgaWYgKHR5cGVvZiAgdmFsdWUgPT09ICdib29sZWFuJyl7XG4gICAgICAgIF9zaG91bGRJbnRlcnN0aW11bHVzUGF1c2UgPSB2YWx1ZTtcbiAgICB9XG59O1xuXG52YXIgX2JsYWNrT3V0ID0gJCgnPGRpdj4nLCB7XG4gICAgaWQ6ICdpbnRlcnN0aW11bHVzLXBhdXNlJyxcbiAgICBjc3M6IHtcbiAgICAgICAgcG9zaXRpb246ICdmaXhlZCcsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIHRvcDogMCxcbiAgICAgICAgd2lkdGg6ICcxMDB2dycsXG4gICAgICAgIGhlaWdodDogJzEwMHZoJyxcbiAgICAgICAgYmFja2dyb3VuZDogJ2JsYWNrJ1xuICAgIH1cbn0pO1xuXG4kKGRvY3VtZW50LmJvZHkpLmFwcGVuZChfYmxhY2tPdXQpO1xuJCgnI2ludGVyc3RpbXVsdXMtcGF1c2UnKS5oaWRlKCk7XG5cbnZhciBfaXNJbnRlcnN0aW11bHVzUGF1c2UgPSBmYWxzZTtcbmV4cG9ydCBmdW5jdGlvbiBfaW50ZXJzdGltdWx1c1BhdXNlKGR1cmF0aW9uKSB7ICAgICAgICAgLy91c2VkIGluOiBSdW5FeHBlcmltZW50LmpzXG5cbiAgICBkdXJhdGlvbiA9IGR1cmF0aW9uID09PSB1bmRlZmluZWQgPyBfcGF1c2UgOiBkdXJhdGlvbjsgLy9EZWZhdWx0IHRvIHBhdXNlIHRpbWUgdW5sZXNzIGFuIGFyZ3VtZW50IGlzIHN1cHBsaWVkXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAkKCcjaW50ZXJzdGltdWx1cy1wYXVzZScpLnNob3coKTtcbiAgICAgICAgX2lzSW50ZXJzdGltdWx1c1BhdXNlID0gdHJ1ZTtcbiAgICAgICAgX3NldFNob3VsZFJ1bk5leHRUcmlhbChmYWxzZSk7XG5cbiAgICAgICAgLypQcmV2ZW50IGJ1dHRvbiBtYXNoaW5nIHdoaWxlIHRoZSBwYXVzZSBydW5zKi9cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkKCcjaW50ZXJzdGltdWx1cy1wYXVzZScpLmhpZGUoKTtcbiAgICAgICAgICAgIF9pc0ludGVyc3RpbXVsdXNQYXVzZSA9IGZhbHNlO1xuICAgICAgICAgICAgX3NldFNob3VsZFJ1bk5leHRUcmlhbCh0cnVlKTsgICAgICAgICAgIC8vQ2Fubm90IHJlYXNzaWduIGltcG9ydGVkIHZhbHVlcywgc28geW91IG5lZWQgYSBzZXR0ZXJcblxuICAgICAgICAgICAgcmVzb2x2ZSgpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1Byb21pc2UgaGFzIHJlc29sdmVkIGhlcmVcbiAgICAgICAgfSwgZHVyYXRpb24pO1xuICAgIH0pO1xufVxuXG5cbmV4cG9ydCB7IFBhdXNlIH07IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGthaSBvbiA1LzEvMTcuXG4gKi9cbmltcG9ydCB7IFRyaWFscywgSVZzLCBzZXRGdW5jcywgX2FsbFRyaWFscywgX2RpZEJ1aWxkVHJpYWxzLCBfZHZOYW1lIH0gZnJvbSAnLi9UcmlhbHMuanMnO1xuaW1wb3J0IHsgX2ludGVyc3RpbXVsdXNQYXVzZSwgX3Nob3VsZEludGVyc3RpbXVsdXNQYXVzZSB9IGZyb20gXCIuL0ludGVyc3RpbXVsdXNQYXVzZS5qc1wiO1xuXG5pbXBvcnQgeyBjcmVhdGVEb3dubG9hZExpbmsgfSBmcm9tIFwiLi4vdXRpbHMvQ3JlYXRlRG93bmxvYWRMaW5rLmpzXCI7XG5cbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSdW4gRXhwZXJpbWVudCAtIEdldCBQYXJ0aWNpcGFudCBJbmZvXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG5cbnZhciBfcHB0TmFtZSA9ICd1bm5hbWVkX3BwdCc7XG52YXIgX3BwdE5vID0gMDtcblxuVHJpYWxzLmdldFBwdEluZm8gPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBfcHB0TmFtZSA9IHByb21wdCgnUGxlYXNlIGVudGVyIHlvdXIgbmFtZScpLnRyaW0oKTtcbiAgICAgICAgY29uc29sZS5sb2coJ25hbWUgd2FzJywgX3BwdE5hbWUpO1xuICAgICAgICBpZiAoX3BwdE5hbWUgPT09ICcnIHx8IF9wcHROYW1lID09PSBudWxsKSB7XG4gICAgICAgICAgICBhbGVydCgnTmFtZSBjYW5ub3QgYmUgYmxhbmsnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgX3BwdE5vID0gcGFyc2VJbnQocHJvbXB0KCdQbGVhc2UgZW50ZXIgeW91ciBwYXJ0aWNpcGFudCBudW1iZXInKSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdwcHQgbnVtYmVyIHdhcycsIF9wcHRObyk7XG4gICAgICAgIGlmIChpc05hTihfcHB0Tm8pKSB7XG4gICAgICAgICAgICBhbGVydCgnUGFydGljaXBhbnQgbnVtYmVyIG11c3QgYmUgYW4gaW50ZWdlcicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZygnUGFydGljaXBhbnQgbmFtZTogJywgX3BwdE5hbWUsICdcXHRQYXJ0aWNpcGFudCBudW1iZXI6ICcsIF9wcHRObyk7XG4gICAgLy8gfVxufTtcblxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJ1biBFeHBlcmltZW50IC0gR2FtZSBMb29wXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG5cbi8vQ2Fubm90IHJlYXNzaWduIGltcG9ydGVkIHZhbHVlcywgc28geW91IG5lZWQgYSBzZXR0ZXJcbmV4cG9ydCBmdW5jdGlvbiBfc2V0U2hvdWxkUnVuTmV4dFRyaWFsKHZhbHVlKXtcbiAgICBpZiAodHlwZW9mKHZhbHVlKSA9PT0gXCJib29sZWFuXCIpe1xuICAgICAgICBfc2hvdWxkUnVuTmV4dFRyaWFsID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY2Fubm90IHNldCBfc2hvdWxkUnVuTmV4dFRyaWFsIHRvIGEgbm9uIGJvb2xlYW4gdmFsdWVcIik7XG4gICAgfVxufVxuXG5leHBvcnQgdmFyIF9zaG91bGRSdW5OZXh0VHJpYWwgPSB0cnVlOyAvL3VzZWQgYnk6IEludGVyc3RpbXVsdXNQYXVzZS5qc1xuVHJpYWxzLnJ1bk5leHRUcmlhbCA9IGZ1bmN0aW9uIChzZXR0aW5ncykgeyAvLyB1c2FnZSAtPiBydW5OZXh0VHJpYWwoe3Nob3VsZFN0b3JlUmVzcG9uc2U6IHRydWUsIGR2X3ZhbHVlOiAnaW5zaWRlJ30pO1xuXG4gICAgaWYgKCFfZGlkQnVpbGRUcmlhbHMpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJydW5OZXh0VHJpYWwoKTogVHJpYWwgd2VyZSBub3QgYnVpbHRcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoX3Nob3VsZFJ1bk5leHRUcmlhbCkge1xuXG4gICAgICAgIC8vVE9ETzogUmVtb3ZlIHRoaXMgIFtbIERPTkUgXV0gXG4gICAgICAgIC8vIFRPRE86IENoYW5nZSB0aGUgaW1wbGVtZW50YXRpb24gb2YgdGhlIG1pZCBjYWxsYmFjayAtIEp1c3QgY2hlY2sgdGhlIGxlbmd0aCBvZiB0aGUgX3Jlc3BvbnNlcyBhcnJheSB2cyB0aGUgYWxsdHJpYWxzIGFycmF5Li5cbiAgICAgICAgLy8gaWYgKG1pZFRyaWFsQ2FsbEJhY2sgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBfY2hlY2tSdW5NaWRDYWxsYmFjaygpOyAvL1NlZSBpZiB5b3UgbmVlZCB0byBydW4gdGhlIGNhbGxiYWNrIHlldFxuICAgICAgICAvLyB9XG5cbiAgICAgICAgLy9UT0RPOiBSZW1vdmUgdGhpcyAgW1sgRE9ORSBdXSBcbiAgICAgICAgaWYgKF9zaG91bGRJbnRlcnN0aW11bHVzUGF1c2UpIHtcbiAgICAgICAgICAgIF9pbnRlcnN0aW11bHVzUGF1c2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vVE9ETzogUmVtb3ZlIHRoaXMgIFtbIERPTkUgXV1cbiAgICAgICAgaWYgKHNldHRpbmdzICE9PSB1bmRlZmluZWQgJiYgc2V0dGluZ3MuaGFzT3duUHJvcGVydHkoJ3Nob3VsZFN0b3JlUmVzcG9uc2UnKSAmJiBzZXR0aW5ncy5zaG91bGRTdG9yZVJlc3BvbnNlKSB7XG4gICAgICAgICAgICBfc3RvcmVSZXNwb25zZShzZXR0aW5ncyk7IC8vU2V0dGluZ3MgY29udGFpbnMgYSBmaWVsZCAnZHZfdmFsdWUnIHdoaWNoIGlzIGFsc28gcmVhZCBieSBfc3RvcmVSZXNwb25zZVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF9hbGxUcmlhbHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgX2Rpc3BsYXlOZXh0VHJpYWwoKTtcblxuICAgICAgICAgICAgLy8gX2N1cjJBRkNJc1RhcmdldCA9IHRydWU7XG4gICAgICAgICAgICAvKiogQWx3YXlzIHJlc2V0IHRoZSAyQUZDIHZhbHVlKi9cblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1RoZXJlIGFyZSAnLCBfYWxsVHJpYWxzLmxlbmd0aCwgJyB0cmlhbHMgcmVtYWluaW5nLicpO1xuICAgICAgICAgICAgJCgnI21lc3NhZ2VzLXRleHQtdGhyZWUnKS5odG1sKCc8cD5UaGVyZSBhcmUgJyArIF9hbGxUcmlhbHMubGVuZ3RoICsgJyB0cmlhbHMgcmVtYWluaW5nLjwvcD4jIyMjIyMjIyMjIyMjIyMjPGJyPicpO1xuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAvL1Bvc3NpYmx5IHRvbyBkZXN0cnVjdGl2ZVxuICAgICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5jaGlsZHJlbigpLmZhZGVPdXQoKTtcbiAgICAgICAgICAgIC8vICQoJyNpbnRlcnN0aW11bHVzLXBhdXNlJykuaGlkZSgpO1xuICAgICAgICAgICAgX291dHB1dFJlc3BvbnNlcyhfcmVzcG9uc2VzKTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBfZW5kQ2FsbEJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBfZW5kQ2FsbEJhY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxufTtcblxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuLy8gICAgICAgICAgICAgICAgICBSdW4gRXhwZXJpbWVudCAtIE1pZCBQb2ludCBDYWxsYmFjayAoaS5lLiB0aGUgXCJ0YWtlIGEgYnJlYWtcIiBtZXNzYWdlKVxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuXG5cbmZ1bmN0aW9uIF9jaGVja1J1bk1pZENhbGxiYWNrKCkge1xuXG4gICAgY29uc29sZS5sb2coXCJDb21wYXJlIGxlbmd0aHMgb2YgYWxsdHJpYWxzICYgX3Jlc3BvbnNlcyBcIiwgX2FsbFRyaWFscy5sZW5ndGgpO1xuXG59XG5cbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJ1biBFeHBlcmltZW50IC0gRW5kIENhbGxiYWNrXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG52YXIgX2VuZENhbGxCYWNrO1xuVHJpYWxzLnNldEVuZENhbGJhY2sgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBfZW5kQ2FsbEJhY2sgPSB2YWx1ZTtcbn07XG5cblxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSdW4gRXhwZXJpbWVudCAtIERpc3BsYXlpbmcgVGhlIE5leHQgVHJpYWxcbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cblxuLyoqIFdoZXJlIHZpZXctbGV2ZWwgZWxlbWVudHMgYXJlIHNldCAtIHRoaXMgaXMgbGlrZSB0aGUgQ09OVFJPTExFUiBtZXRob2QgaW50ZXJmYWNpbmcgYmV0d2VlbiBNT0RFTCBhbmQgVklFVyovXG5mdW5jdGlvbiBfZGlzcGxheU5leHRUcmlhbCgpIHtcbiAgICB2YXIgbmV4dFRyaWFsID0gX2FsbFRyaWFsc1tfYWxsVHJpYWxzLmxlbmd0aCAtIDFdOyAvL0Fsd2F5cyBnbyBmcm9tIHRoZSBiYWNrXG4gICAgY29uc29sZS5sb2coJ25leHQgdHJpYWw6JywgbmV4dFRyaWFsKTtcblxuICAgIC8qKiBJdGVyYXRlIG92ZXIgZWFjaCBJViBhbmQgc2V0IGl0cyBwb2ludGVyIHRvIGl0cyB2YWx1ZSBmb3IgdGhhdCB0cmlhbCAqL1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbmV4dFRyaWFsLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIF9zZXRPYmplY3RBcHBlYXJhbmNlUHJvcGVydGllcyhuZXh0VHJpYWxbaV0pO1xuXG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gX3NldE9iamVjdEFwcGVhcmFuY2VQcm9wZXJ0aWVzKGN1clByb3ApIHtcblxuICAgIC8qKiBVc2luZyBhIEZVTkNUSU9OIHRvIHNldCB0aGUgZGlzcGxheSovXG4gICAgaWYgKCBzZXRGdW5jc1tjdXJQcm9wLmRlc2NyaXB0aW9uXSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICBzZXRGdW5jc1tjdXJQcm9wLmRlc2NyaXB0aW9uXS5hcHBseShudWxsLCBjdXJQcm9wLnZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBzZXR0ZXIgZnVuY3Rpb24gc3VwcGxpZWQgYnk6IFwiKTtcbiAgICAgICAgY29uc29sZS5sb2coY3VyUHJvcCk7XG4gICAgfVxufVxuXG5cbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUnVuIEV4cGVyaW1lbnQgLSBTdG9yZSBSZXNwb25zZVxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuZXhwb3J0IHZhciBfcmVzcG9uc2VzID0gW107XG5leHBvcnQgZnVuY3Rpb24gX3NldFJlc3BvbnNlcyhyZXNwb25zZXMpe1xuICAgIGlmIChyZXNwb25zZXMuY29uc3RydWN0b3IgPT09IEFycmF5KXtcbiAgICAgICAgX3Jlc3BvbnNlcyA9IHJlc3BvbnNlcztcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJyZXBvbnNlcyBjYW4gb25seSBiZSBzZXQgdG8gYW4gYXJyYXlcIik7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBfc3RvcmVSZXNwb25zZShvcHRpb25zKSB7XG5cbiAgICB2YXIgbGFzdFRyaWFsID0gX2FsbFRyaWFscy5wb3AoKTtcblxuICAgIHZhciByZXNwb25zZUZvcm1hdHRlZCA9IHt9O1xuXG4gICAgLyoqIFN0b3JlIHRoZSBJViAtPiBXcml0ZSBvdXQgZWFjaCBJViAoMSBJViBwZXIgYXJyYXkgZWxlbWVudCkgdG8gYSBmaWVsZCAqL1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdFRyaWFsLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBpdk51bSA9ICdJVicgKyBpO1xuXG4gICAgICAgIC8vSWYgYSBwYXJzZXIgaXMgZGVmaW5lZCB1c2UgaXRzIG91dHB1dCBhcyB0aGUgdmFsdWUgb2YgdGhlIHJlc3BvbnNlXG4gICAgICAgIGlmIChsYXN0VHJpYWxbaV0ucGFyc2VyRnVuYyAhPT0gdW5kZWZpbmVkICYmICQuaXNGdW5jdGlvbihsYXN0VHJpYWxbaV0ucGFyc2VyRnVuYykpe1xuICAgICAgICAgICAgdmFyIHN0ZE5hbWUgPSBpdk51bSArICdfJyArIGxhc3RUcmlhbFtpXS5kZXNjcmlwdGlvbiArICdfdmFsdWUnO1xuICAgICAgICAgICAgcmVzcG9uc2VGb3JtYXR0ZWRbc3RkTmFtZV0gPSBsYXN0VHJpYWxbaV0ucGFyc2VyRnVuYyhsYXN0VHJpYWxbaV0sIGkpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAobGFzdFRyaWFsW2ldLnZhbHVlLmNvbnN0cnVjdG9yID09PSBBcnJheSkgeyAvL0NvbnNpZGVyIHRoZXNlIHRvIGJlIGRlZmF1bHRzIGZvciBqYXZhc2NyaXB0IHByaW1pdGl2ZSB0eXBlc1xuXG4gICAgICAgICAgICAvKiogTWFudWFsbHkgd3JpdGUgb3V0IGVhY2ggYXJndW1lbnQgKGZyb20gYW4gYXJyYXkpIHRvIGEgZmllbGQgaW4gdGhlIG9iamVjdFxuICAgICAgICAgICAgICogIE9ubHkgYXBwZW5kIGEgbnVtYmVyIGlmIHRoZXJlIGFyZSA+MSBhcmd1bWVudHMgcGFzc2VkIGluICovXG5cbiAgICAgICAgICAgIGlmIChsYXN0VHJpYWxbaV0udmFsdWUubGVuZ3RoID4gMSl7XG5cbiAgICAgICAgICAgICAgICAvL0lmIHVzaW5nIGEgc2V0RnVuYyBmdW5jdGlvbiB3aXRoIG11bHRpcGxlIGFyZ3MgLT4gdXNlIHRoZSBhcmcgbmFtZXMgdG8gZGVzY3JpYmUgdGhlIHZhbHVlcyB3cml0dGVuIHRvIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgIHZhciBhcmdfbmFtZXMsIGFyZ19uYW1lO1xuICAgICAgICAgICAgICAgIGFyZ19uYW1lcyA9IGdldFBhcmFtTmFtZXMoIHNldEZ1bmNzW2xhc3RUcmlhbFtpXS5kZXNjcmlwdGlvbl0gKTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbGFzdFRyaWFsW2ldLnZhbHVlLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ19uYW1lID0gYXJnX25hbWVzW2pdO1xuICAgICAgICAgICAgICAgICAgICByZXNwb25zZUZvcm1hdHRlZFtpdk51bSArICdfJyArIGxhc3RUcmlhbFtpXS5kZXNjcmlwdGlvbiArICdfdmFsdWVfJyArIGFyZ19uYW1lIF0gPSAgbGFzdFRyaWFsW2ldLnZhbHVlW2pdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZUZvcm1hdHRlZFsgaXZOdW0gKyAnXycgKyBsYXN0VHJpYWxbaV0uZGVzY3JpcHRpb24gKyAnX3ZhbHVlJyBdID0gIGxhc3RUcmlhbFtpXS52YWx1ZVswXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzcG9uc2VGb3JtYXR0ZWRbaXZOdW0gKyAnXycgKyBsYXN0VHJpYWxbaV0uZGVzY3JpcHRpb24gKyAnX3ZhbHVlJ10gPSBsYXN0VHJpYWxbaV0udmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogQWRkIGEgdmFsdWUgb2YgdGhlIDJhZmMgc3RkIChmb3IgdGhlIHJlbGV2YW50IElWKSAqL1xuICAgICAgICBpZiAobGFzdFRyaWFsW2ldLmhhc093blByb3BlcnR5KCdzdGRfMkFGQycpKSB7XG4gICAgICAgICAgICByZXNwb25zZUZvcm1hdHRlZFsnc3RkXzJBRkMnXSA9IGxhc3RUcmlhbFtpXS5zdGRfMkFGQztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBDaGVjayB0aGF0IGEgMmFmYyBzdGQgdmFsdWUgd2FzIGFkZGVkIC0gaWYgbm90IHlvdSB3YW50IHRvIGFkZCBhIG51bGwgdmFsdWUgb3IgaXQgd2lsbCBmdWNrIHVwIHRoZSBjc3Ygd3JpdGUqL1xuICAgIC8vIGlmICghcmVzcG9uc2VGb3JtYXR0ZWQuaGFzT3duUHJvcGVydHkoJ3N0ZF8yQUZDJykgJiYgZGlkU2V0MkFGQykge1xuICAgIC8vICAgICByZXNwb25zZUZvcm1hdHRlZFsnc3RkXzJBRkMnXSA9ICdudWxsJztcbiAgICAvLyB9XG5cbiAgICBcblxuICAgIC8qKiBTdG9yZSB0aGUgRFYqL1xuICAgIGlmIChvcHRpb25zICE9PSB1bmRlZmluZWQgJiYgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgnZHZfdmFsdWUnKSkge1xuICAgICAgICB2YXIgdmFsdWUgPSBfZHZOYW1lIHx8ICd2YWx1ZSc7XG4gICAgICAgIHJlc3BvbnNlRm9ybWF0dGVkWydEVl8nK3ZhbHVlXSA9IG9wdGlvbnMuZHZfdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYWxlcnQoJ05vIERWIHdhcyBzdXBwbGllZCBieSB0aGUgY2FsbGluZyBjb2RlLiBUaGlzIGlzIGFuIGVycm9yLicpO1xuICAgICAgICByZXNwb25zZUZvcm1hdHRlZFsnRFZfdmFsdWUnXSA9ICdFUlJPUiAtIE5vIERWIHN1cHBsaWVkJztcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZygnU1RPUkVEIFRISVMgUkVTUE9OU0U6ICcsIHJlc3BvbnNlRm9ybWF0dGVkKTtcblxuICAgIF9yZXNwb25zZXMucHVzaChyZXNwb25zZUZvcm1hdHRlZCk7XG59XG5cbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUnVuIEV4cGVyaW1lbnQgLSBPdXRwdXQgUmVzcG9uc2VzXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG5cblRyaWFscy5mb3JjZU91dHB1dFJlc3BvbnNlcyA9IGZ1bmN0aW9uKCl7XG4gICAgY29uc29sZS5sb2coXCJGb3JjaW5nIG91dHB1dCBvZiBfcmVzcG9uc2VzXCIpO1xuICAgIF9vdXRwdXRSZXNwb25zZXMocmVzcG9uc2VzLCB0cnVlKTtcbn07XG5cblxuZnVuY3Rpb24gX291dHB1dFJlc3BvbnNlcyhhbGxSZXNwb25zZXMsIGxvZykge1xuXG4gICAgaWYgKGFsbFJlc3BvbnNlcy5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgIHZhciBjc3ZTdHJpbmcgPSAnJztcblxuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWxsUmVzcG9uc2VzWzBdKTtcbiAgICAvKipUaGVzZSBhcmUgYWxsIHRoZSBjb2x1bW5zIGluIHRoZSBvdXRwdXQqL1xuXG4gICAgLyoqIE1ha2UgdGhlIGhlYWRlciovXG4gICAgY3N2U3RyaW5nICs9ICdQYXJ0aWNpcGFudCBOYW1lLCBQYXJ0aWNpcGFudCBOdW1iZXIsICc7IC8vTWFudWFsbHkgYWRkIGhlYWRlclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjc3ZTdHJpbmcgKz0ga2V5c1tpXSArICcsJztcbiAgICB9XG4gICAgY3N2U3RyaW5nID0gY3N2U3RyaW5nLnNsaWNlKDAsIC0xKSArICdcXG4nOy8vQ3V0IHRyYWlsaW5nIGNvbW1hIGFuZCBwdXQgaW4gYSBuZXcgcm93L2xpbmVcblxuICAgIC8qKiBGaWxsIHRoZSBkYXRhIC0gVGhpcyB0aW1lIGl0cyBhbiBhcnJheSBvZiBhcnJheXMgbm90IGFycmF5IG9mIGRpY3Rpb25hcmllcyAqL1xuICAgIGZvciAoaSA9IDA7IGkgPCBhbGxSZXNwb25zZXMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICBjc3ZTdHJpbmcgKz0gX3BwdE5hbWUgKyAnLCcgKyBfcHB0Tm8gKyAnLCc7IC8vTWFuYXVsbHkgYWRkIGNvbnRlbnRcblxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGtleXMubGVuZ3RoOyBqKyspIHsgLy9JdGVyYXRlIG92ZXIgdGhlIGtleXMgdG8gZ2V0IHRlaCB2YWx1ZXNcblxuICAgICAgICAgICAgdmFyIHZhbHVlID0gYWxsUmVzcG9uc2VzW2ldW2tleXNbal1dO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3dyaXRpbmcgdGhpcyByYXcgdmFsdWUgJywgdmFsdWUsIGtleXNbal0pO1xuICAgICAgICAgICAgLy92YWx1ZSA9IGNoZWNrUmV0dXJuUHJvcHMoIHZhbHVlLCB0cnVlICkgfHwgdmFsdWU7ICAvL1BhcnNlIG91dCByZWxldmFudCBvYmplY3QgZmllbGRzXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdBZmVyIGl0IHdhcyBwYXJzZWQ6JywgdmFsdWUsICdcXG4qKioqKioqKionKTtcbiAgICAgICAgICAgIGNzdlN0cmluZyArPSB2YWx1ZSArICcsJztcbiAgICAgICAgfVxuXG4gICAgICAgIGNzdlN0cmluZyA9IGNzdlN0cmluZy5zbGljZSgwLCAtMSkgKyAnXFxuJzsgLy9DdXQgdHJhaWxpbmcgY29tbWEgYW5kIHB1dCBpbiBhIG5ldyByb3cvbGluZVxuICAgIH1cblxuICAgIGlmIChsb2cpIHtcbiAgICAgICAgY29uc29sZS5sb2coY3N2U3RyaW5nKTtcbiAgICB9XG5cbiAgICAvKiogSGVscCBvdXQgYSBtYWNoaW5lIHRvZGF5Ki9cbiAgICB2YXIgY3N2Q29udGVudCA9IGVuY29kZVVSSSgnZGF0YTp0ZXh0L2NzdjtjaGFyc2V0PXV0Zi04LCcgKyBjc3ZTdHJpbmcpO1xuICAgIHZhciBhID0gY3JlYXRlRG93bmxvYWRMaW5rKCdyZXN1bHRzICgnICsgX3BwdE5hbWUgKyAnLCcgKyBfcHB0Tm8udG9TdHJpbmcoKSArICcpLmNzdicsIGNzdkNvbnRlbnQpO1xuICAgIGEuaW5uZXJIVE1MID0gXCI8aDQ+Q2xpY2sgdG8gZG93bmxvYWQgcmVzdWx0cyE8L2g0PiA8cD4oaWYgdGhleSBkaWRuJ3QgZG93bmxvYWQgYWxyZWFkeSk8L3A+XCI7XG4gICAgYS5jbGFzc05hbWUgKz0gJyByZXN1bHRzLWRvd25sb2FkJztcblxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYSk7XG4gICAgYS5jbGljaygpO1xufVxuXG5cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBrYWkgb24gNS8xLzE3LlxuICovXG5pbXBvcnQgeyBUcmlhbHMsX2FsbFRyaWFscywgX3NldEFsbFRyaWFscywgX2RpZEJ1aWxkVHJpYWxzfSBmcm9tICcuL1RyaWFscy5qcyc7XG5pbXBvcnQgeyBfcmVzcG9uc2VzLCBfc2V0UmVzcG9uc2VzIH0gZnJvbSBcIi4vUnVuRXhwZXJpbWVudC5qc1wiO1xuXG5cbnZhciBTYXZlcyA9IHt9O1xuXG5TYXZlcy5wYXJzZVRyaWFsc0ZvclNhdmluZyA9IHVuZGVmaW5lZDtcblNhdmVzLnBhcnNlUmVzcG9uc2VzRm9yU2F2aW5nID0gdW5kZWZpbmVkO1xuU2F2ZXMudW5wYXJzZVNhdmVkVHJpYWxzID0gdW5kZWZpbmVkO1xuU2F2ZXMudW5wYXJzZVNhdmVkUmVzcG9uc2VzID0gdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBlcnJvckNoZWNrU2F2aW5nUGFyc2Vycygpe1xuICAgIGlmIChTYXZlcy5wYXJzZVRyaWFsc0ZvclNhdmluZyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgcmVzdG9yZSB0cmlhbHMgd2l0aG91dCBwYXJzaW5nIGZ1bmN0aW9uXCIpO1xuICAgIGlmIChTYXZlcy5wYXJzZVJlc3BvbnNlc0ZvclNhdmluZyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgcmVzdG9yZSBfcmVzcG9uc2VzIHdpdGhvdXQgcGFyc2luZyBmdW5jdGlvblwiKTtcbiAgICBpZiAoU2F2ZXMudW5wYXJzZVNhdmVkVHJpYWxzID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCByZXN0b3JlIHRyaWFscyB3aXRob3V0IFVOcGFyc2luZyBmdW5jdGlvblwiKTtcbiAgICBpZiAoU2F2ZXMudW5wYXJzZVNhdmVkUmVzcG9uc2VzID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCByZXN0b3JlIF9yZXNwb25zZXMgd2l0aG91dCBVTnBhcnNpbmcgZnVuY3Rpb25cIik7XG59XG5cblxuXG5TYXZlcy5jbGVhclNhdmVzID0gZnVuY3Rpb24oKXtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcImV4cGVyaW1lbnRKU3NhdmVzXCIpOy8vLy8vXG59O1xuXG5cblNhdmVzLnNhdmVCdWlsdFRyaWFsc0FuZFJlc3BvbnNlcyA9IGZ1bmN0aW9uKGtleSkge1xuXG4gICAgLy8gbG9jYWxTdG9yYWdlLmNsZWFyKCk7XG5cbiAgICBlcnJvckNoZWNrU2F2aW5nUGFyc2VycygpO1xuXG4gICAgaWYgKHR5cGVvZihTdG9yYWdlKSAhPT0gXCJ1bmRlZmluZWRcIikge1xuXG4gICAgICAgIC8vIGxvY2FsU3RvcmFnZS5leHBlcmltZW50SlNzYXZlcyA9IHVuZGVmaW5lZDtcblxuICAgICAgICAvL1BhcnNlIHlvdXIgdHJpYWxzLCB1c2luZyB0aGUgY3VzdG9tIHNlcmlhbGl6ZXIuLlxuICAgICAgICB2YXIgdHJpYWxzRm9yU2F2aW5nID0gZXhwb3J0cy5wYXJzZVRyaWFsc0ZvclNhdmluZyhfYWxsVHJpYWxzKTtcbiAgICAgICAgdmFyIHJlc3BvbnNlc0ZvclNhdmluZyA9IGV4cG9ydHMucGFyc2VSZXNwb25zZXNGb3JTYXZpbmcoX3Jlc3BvbnNlcyk7XG5cbiAgICAgICAgLy9KU09OaWZ5IHRoZSB0cmlhbHMgYW5kIF9yZXNwb25zZXNcbiAgICAgICAgdmFyIGV4cGVyaW1lbnRKU3NhdmVzID0ge307XG4gICAgICAgIGV4cGVyaW1lbnRKU3NhdmVzWyd0cmlhbHMnXSA9IHRyaWFsc0ZvclNhdmluZztcbiAgICAgICAgZXhwZXJpbWVudEpTc2F2ZXNbJ3Jlc3BvbnNlcyddID0gcmVzcG9uc2VzRm9yU2F2aW5nO1xuXG4gICAgICAgIHZhciBtc2cgPSBwcm9tcHQoXCJBZGQgYSBtZXNzYWdlIHRvIHRoaXMgc2F2ZSFcIik7XG5cbiAgICAgICAgaWYgKG1zZyA9PT0gbnVsbCl7XG4gICAgICAgICAgICBhbGVydChcIlRyaWFscyB3aWxsIG5vdCBiZSBzYXZlZFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkYXRlS2V5ID0gKG5ldyBEYXRlKCkpLnRvVVRDU3RyaW5nKCk7IC8vVmVyeSBjbGVhciBkYXRlXG5cbiAgICAgICAgLy9NYWtlIGEgbmV3IGRpY3Rpb25hcnkgb3IgZ2V0IHRoZSBvbGQgb25lXG4gICAgICAgIHZhciBrZXllZF9ieV9kYXRlcyA9IChsb2NhbFN0b3JhZ2UuZXhwZXJpbWVudEpTc2F2ZXMgPT09IHVuZGVmaW5lZCkgPyB7fSA6IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmV4cGVyaW1lbnRKU3NhdmVzKTtcblxuICAgICAgICAvL3NhdmUgdG8gaXRcbiAgICAgICAga2V5ZWRfYnlfZGF0ZXNbbXNnICsgXCIgLSBcIiArZGF0ZUtleV0gPSBleHBlcmltZW50SlNzYXZlcztcblxuICAgICAgICAvL3NlcmlhbGl6ZSFcbiAgICAgICAgbG9jYWxTdG9yYWdlLmV4cGVyaW1lbnRKU3NhdmVzID0gSlNPTi5zdHJpbmdpZnkoa2V5ZWRfYnlfZGF0ZXMpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwiU0FWRUQgVEhFIFNISVRcIiwgSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZXhwZXJpbWVudEpTc2F2ZXMpKTtcbiAgICB9XG59O1xuXG5cblNhdmVzLnNldFNhdmVkVHJpYWxzQW5kUmVzcG9uc2VzID0gZnVuY3Rpb24oKXtcbiAgICBlcnJvckNoZWNrU2F2aW5nUGFyc2VycygpO1xuXG4gICAgdmFyIGFsbF9zYXZlcyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmV4cGVyaW1lbnRKU3NhdmVzKTtcblxuICAgIGNvbnNvbGUubG9nKFwiYWxsIHNhdmVzKyBcIiwgYWxsX3NhdmVzKTtcblxuXG4gICAgdmFyIHNlbGVjdF9iaXRzID0gX2NyZWF0ZURyb3BEb3duU2VsZWN0KGFsbF9zYXZlcyk7XG4gICAgc2VsZWN0X2JpdHMuYnV0dG9uLmNsaWNrKGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgdmFyIHRlbXBfdXNpbmcgPSBzZWxlY3RfYml0cy5zZWxlY3QuZmluZChcIjpzZWxlY3RlZFwiKS50ZXh0KCk7XG5cbiAgICAgICAgdGVtcF91c2luZyA9IGFsbF9zYXZlc1t0ZW1wX3VzaW5nXTtcblxuICAgICAgICBfc2V0QWxsVHJpYWxzKCBTYXZlcy51bnBhcnNlU2F2ZWRUcmlhbHModGVtcF91c2luZ1sndHJpYWxzJ10pICk7XG4gICAgICAgIF9zZXRSZXNwb25zZXMoIFNhdmVzLnVucGFyc2VTYXZlZFJlc3BvbnNlcyh0ZW1wX3VzaW5nWydyZXNwb25zZXMnXSkgKTtcbiAgICAgICAgaWYgKF9yZXNwb25zZXMgPT09IHVuZGVmaW5lZCB8fCBfcmVzcG9uc2VzID09PSBudWxsKSBfc2V0UmVzcG9uc2VzKCBbXSApO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwicmVzdG9yZWQgYWxsIHRyaWFsczogXCIsIF9hbGxUcmlhbHMpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInJlc3RvcmVkIGFsbCBfcmVzcG9uc2VzOiBcIiwgX3Jlc3BvbnNlcyk7XG5cbiAgICAgICAgVHJpYWxzLnJ1bk5leHRUcmlhbCgpO1xuXG4gICAgICAgIC8vUmVtb3ZlIHNlbGVjdCBmcm9tIGRvbVxuICAgICAgICBzZWxlY3RfYml0cy53cmFwLnJlbW92ZSgpO1xuICAgIH0pO1xuXG4gICAgc2VsZWN0X2JpdHMuYnV0dG9uX2NsZWFyLmNsaWNrKGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgaWYgKGNvbmZpcm0oXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIGFsbCBzYXZlZCBleHBlcmltZW50cz9cIikpe1xuICAgICAgICAgICAgZXhwb3J0cy5jbGVhclNhdmVzKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvL1JlbW92ZSBzZWxlY3QgZnJvbSBkb21cbiAgICAgICAgc2VsZWN0X2JpdHMud3JhcC5yZW1vdmUoKTtcbiAgICB9KTtcblxufTtcblxuXG5mdW5jdGlvbiBfY3JlYXRlRHJvcERvd25TZWxlY3QoYWxsX3NhdmVzKXtcblxuICAgIHZhciBkaXYgPSAkKFwiPGRpdj5cIiwge1xuICAgICAgICBpZDogXCJzYXZlZF9pbmZvXCJcbiAgICB9KTtcblxuICAgIC8vTWFrZSBhIHNlbGVjdCB0byBjaG9vc2UgZnJvbSB0aGUgc2F2ZXNcbiAgICB2YXIgc2VsID0gJCgnPHNlbGVjdD4nKTtcbiAgICBPYmplY3Qua2V5cyhhbGxfc2F2ZXMpLm1hcChmdW5jdGlvbihlbGVtLCBpLCBhbGwpe1xuICAgICAgICAvL1VzZSB0aGUgaW5kZXggYXMgdGhlIGtleVxuICAgICAgICBzZWwuYXBwZW5kKCQoXCI8b3B0aW9uPlwiKS5hdHRyKFwidmFsdWVcIixpKS50ZXh0KGVsZW0pKTtcbiAgICB9KTtcblxuXG4gICAgLy9CdXR0b24gLSBubyBmdW5jdGlvbmFsaXR5IGhlcmUsIGp1c3Qgdmlld1xuICAgIHZhciBiID0gJChcIjxidXR0b24+XCIpLnRleHQoXCJDaG9vc2VcIik7XG4gICAgdmFyIGJfY2xlYXIgPSAkKFwiPGJ1dHRvbj5cIikudGV4dChcIkNsZWFyXCIpO1xuXG4gICAgZGl2LmFwcGVuZChzZWwpO1xuICAgIGRpdi5hcHBlbmQoJChcIjxicj5cIikpO1xuICAgIGRpdi5hcHBlbmQoYik7XG4gICAgZGl2LmFwcGVuZChiX2NsZWFyKTtcbiAgICAkKGRvY3VtZW50LmJvZHkpLmFwcGVuZChkaXYpO1xuXG4gICAgZGl2LmNzcyh7XG4gICAgICAgIHBvc2l0aW9uOiBcImZpeGVkXCIsXG4gICAgICAgIHRvcDogXCI0NXZoXCIsXG4gICAgICAgIGxlZnQ6IFwiMjV2d1wiLFxuICAgICAgICB3aWR0aDogXCI1MHZ3XCIsXG4gICAgICAgIGhlaWdodDogXCI1dmhcIixcbiAgICAgICAgYmFja2dyb3VuZDogXCJ3aGl0ZVwiLFxuICAgICAgICBib3JkZXI6IFwiMnZ3XCIsXG4gICAgICAgIFwidGV4dC1hbGlnblwiOiBcImNlbnRlclwiXG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBzZWxlY3Q6IHNlbCxcbiAgICAgICAgYnV0dG9uOiBiLFxuICAgICAgICBidXR0b25fY2xlYXI6IGJfY2xlYXIsXG4gICAgICAgIHdyYXA6IGRpdlxuICAgIH1cbn1cblxuXG5leHBvcnQgeyBTYXZlcyB9OyIsIi8qKlxuICogQ3JlYXRlZCBieSBrYWkgb24gNS8xLzE3LlxuICpcbiAqIEpvaW4gdG9nZXRoZXIgYWxsIHRoZSB0cmlhbHMgc3VibW9kdWxlc1xuICovXG5cbi8vT3JkZXIgaXMgaW1wb3J0YW50XG5pbXBvcnQgeyBUcmlhbHMgfSBmcm9tICBcIi4vVHJpYWxzLmpzXCI7IC8vTmVlZHMgLi8gdG8gdHJlYXQgaXQgYXMgYW4gaW50ZXJuYWwgKG5vdCBleHRlcm5hbCBkZXBlbmRlbmN5KVxuaW1wb3J0IFwiLi9SdW5FeHBlcmltZW50LmpzXCI7XG5pbXBvcnQgXCIuL1NhdmVzLmpzXCI7XG4vL2ltcG9ydCBcIi4vMkFGQy5qc1wiO1xuXG5pbXBvcnQgeyBQYXVzZSB9IGZyb20gIFwiLi9JbnRlcnN0aW11bHVzUGF1c2UuanNcIjtcblxuXG4vL1RoZXNlIGFyZSB0aGUgZmllbGRzIG9mIEV4cGVyaW1lbnRKU1xuZXhwb3J0IHsgVHJpYWxzIH07XG5leHBvcnQgeyBQYXVzZSB9OyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7O0FBR0EsQUFBTyxTQUFTLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUM7O0lBRTlDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDcEMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDZCxDQUFDLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQztJQUNwQixDQUFDLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQzs7SUFFdEIsT0FBTyxDQUFDLENBQUM7OztBQ1ZiOzs7Ozs7QUFNQSxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxZQUFZO0lBQ2xDLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLFdBQVcsQ0FBQzs7O0lBRzVELE9BQU8sQ0FBQyxLQUFLLFlBQVksRUFBRTs7O1FBR3ZCLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxZQUFZLENBQUMsQ0FBQztRQUN2RCxZQUFZLElBQUksQ0FBQyxDQUFDOzs7UUFHbEIsY0FBYyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FB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
