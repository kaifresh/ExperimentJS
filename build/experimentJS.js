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
 * Created by kai on 6/7/17.
 */


// var arr = [];

// var document = window.document;

var getProto = Object.getPrototypeOf;

// var slice = arr.slice;

// var concat = arr.concat;

// var push = arr.push;

// var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var fnToString = hasOwn.toString;

var ObjectFunctionString = fnToString.call( Object );

// Taken from Jquery
function extend() {
    var options, name, src, copy, copyIsArray, clone,
        target = arguments[ 0 ] || {},
        i = 1,
        length = arguments.length,
        deep = false;

    // Handle a deep copy situation
    if ( typeof target === "boolean" ) {
        deep = target;

        // Skip the boolean and the target
        target = arguments[ i ] || {};
        i++;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if ( typeof target !== "object" && !(typeof target === "function") ) {
        target = {};
    }

    // Extend jQuery itself if only one argument is passed
    if ( i === length ) {
        target = this;
        i--;
    }

    for ( ; i < length; i++ ) {

        // Only deal with non-null/undefined values
        if ( ( options = arguments[ i ] ) != null ) {

            // Extend the base object
            for ( name in options ) {
                src = target[ name ];
                copy = options[ name ];

                // Prevent never-ending loop
                if ( target === copy ) {
                    continue;
                }

                // Recurse if we're merging plain objects or arrays
                if ( deep && copy && ( isPlainObject( copy ) ||
                    ( copyIsArray = Array.isArray( copy ) ) ) ) {

                    if ( copyIsArray ) {
                        copyIsArray = false;
                        clone = src && Array.isArray( src ) ? src : [];

                    } else {
                        clone = src && isPlainObject( src ) ? src : {};
                    }

                    // Never move original objects, clone them
                    target[ name ] = extend( deep, clone, copy );

                    // Don't bring in undefined values
                } else if ( copy !== undefined ) {
                    target[ name ] = copy;
                }
            }
        }
    }

    // Return the modified object
    return target;
}


function isPlainObject( obj ) {
    var proto, Ctor;

    // Detect obvious negatives
    // Use toString instead of jQuery.type to catch host objects
    if ( !obj || toString.call( obj ) !== "[object Object]" ) {
        return false;
    }

    proto = getProto( obj );

    // Objects with no prototype (e.g., `Object.create( null )`) are plain
    if ( !proto ) {
        return true;
    }

    // Objects with prototype are plain iff they were constructed by a global Object function
    Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
    return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
}

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


var _allTrials = [];
var _totalTrials = -1;                                          //Assigned but never used
var _didBuildTrials = false;

function _setAllTrials(alltrials){                      // Used in ./Saves.js. Has to live here as it redefines _allTrials
    if (alltrials.constructor === Array){
        _allTrials = alltrials;
    }
}

// Returns a deep copy of the trials
Trials.getTrials = function(){
    if (_allTrials.length > 0){
        return extend(true, [], _allTrials);
        // return $.extend(true, [], _allTrials);
    }
};


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
                    console.log("Setting parser for ", iv);
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
//                                 Experiment Lifecycle - Store Response
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
var _responses = [];
function _setResponses(responses){                       // Used in ./Saves.js. Has to live here as it redefines _responses
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
        if (lastTrial[i].parserFunc !== undefined && typeof lastTrial[i].parserFunc === "function"){ //$.isFunction(lastTrial[i].parserFunc)){
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

/**
 * Created by kai on 6/7/17.
 */
function SetCSSOnElement(elem, css){
    var keys = Object.keys(css);
    for (var i = 0; i < keys.length; i++){
        var attribute = keys[i];
        elem.style[attribute] = css[attribute];
    }
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
        display: "none"                     // block when visible
    };


    SetCSSOnElement(blackout, css);
    // var keys = Object.keys(css);
    // for (var i = 0; i < keys.length; i++){
    //     var attribute = keys[i];
    //     blackout.style[attribute] = css[attribute];
    // }

    return blackout;
}

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

        if (!_shouldInterstimulusPause) reject();                   // Dont show the pause if it hasnt been set. This check is also performed in RunExperiment.js

        _showInterstimulusPause(_blackOut);
        _isInterstimulusPause = true;
        _setShouldRunNextTrial(false);

        /* Prevent button mashing while the pause runs */
        setTimeout(function () {

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

/**
 * Created by kai on 6/7/17.
 */


function _ApplyFunctionToHTMLChildren(elem, func){

    if (elem.children === undefined || typeof func !== "function" ){
        throw new Error("_ApplyFunctionToChildren accepts args (html_element, func)");
    }

    for (var i = 0 ; i < elem.children.length; i++){
        func(elem.children[i]);
    }
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
            // $(document.body).children().fadeOut();
            _ApplyFunctionToHTMLChildren(document.body, function(child){
                child.style.display = "none";
            });

            _outputResponses(_responses);

            if ( typeof _endCallBack === "function") _endCallBack();

        }
    }

};

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                  Experiment Lifecycle - Mid Point Callback (i.e. the "take a break" message)
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =


var _midCallback = null;
Trials.setMidCallback = function (value) {
    if (typeof value === "function"){
        _midCallback = value;
    }   else {
        throw new Error("Only functions may be assigned to the end callback");
    }
};

var _didRunMidCallback = false;
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

/* = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
 *
 *   Store repsonses in localStorage.
 *   Localstorage converts everything to JSON so object types that cannot be converted will be lost
 *   To preserve these unconvertble data, you need to specify a PARSER and UNPARSER for trials and for responses
 *   On Save: the setter replaces the unconvertible data with a token
 *   On Load: The getter checks the token and replaces it with the correct unconvertible object.
 *
 *  = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = */


var Saves = {};

// TODO: Set these to temp_trial_parser
Saves.parseTrialsForSaving = undefined;                     //interface is function(_allTrials){...} return a parsed copy of `modified` _allTrials
Saves.parseResponsesForSaving = undefined;                  //interface is function(_responses){...} return a parsed copy of `modified` _responses
Saves.unparseSavedTrials = undefined;
Saves.unparseSavedResponses = undefined;

function errorCheckSavingParsers(){
    if (Saves.parseTrialsForSaving === undefined) throw new Error("Cannot restore trials without parsing function");
    if (Saves.parseResponsesForSaving === undefined) throw new Error("Cannot restore _responses without parsing function");
    if (Saves.unparseSavedTrials === undefined) throw new Error("Cannot restore trials without UNparsing function");
    if (Saves.unparseSavedResponses === undefined) throw new Error("Cannot restore _responses without UNparsing function");
}

Saves.clearSaves = function(){
    localStorage.removeItem("experimentJSsaves");
};

Saves.saveBuiltTrialsAndResponses = function() {

    errorCheckSavingParsers();

    if (typeof(Storage) !== "undefined") {

        // localStorage.experimentJSsaves = undefined;

        var trialsForSaving = Saves.parseTrialsForSaving(_allTrials);                   //Parse your trials, using the custom serializer..
        var responsesForSaving = Saves.parseResponsesForSaving(_responses);

        var experimentJSsaves = {};                                                     //JSONify the trials and _responses
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

        keyed_by_dates[msg + " - " +dateKey] = experimentJSsaves;                       //save to it

        localStorage.experimentJSsaves = JSON.stringify(keyed_by_dates);                //serialize!

        console.log("Saved Trials", JSON.parse(localStorage.experimentJSsaves));
    }
};


Saves.loadSavedTrialsAndResponses = function(){
    
    errorCheckSavingParsers();

    var experimentJSsaves = JSON.parse(localStorage.experimentJSsaves);

    console.log("all saves: ", experimentJSsaves);


    var select_dropdown_components = _createDropDownSelect(experimentJSsaves);          // Display the saves in a dropdown select

    select_dropdown_components.button.addEventListener("click", function(){            // TODO reimplement as a js onClick event handler

        // var saves_from_seleced_date = select_dropdown_components.select.find(":selected").text();
        var select = select_dropdown_components.select;
        var saves_from_seleced_date = select.options[select.selectedIndex].text;

        saves_from_seleced_date = experimentJSsaves[saves_from_seleced_date];

        _setAllTrials( Saves.unparseSavedTrials( saves_from_seleced_date["trials"]) );                // Unparse your trials using custom unserialiser
        _setResponses( Saves.unparseSavedResponses( saves_from_seleced_date["responses"]) );
        if (_responses === undefined || _responses === null) _setResponses( [] );

        console.log("restored all trials: ", _allTrials);
        console.log("restored all _responses: ", _responses);

        Trials.runNextTrial();

        //Remove select from dom

        // select_dropdown_components.wrap.remove();
        select_dropdown_components.wrap.parentNode.removeChild(select_dropdown_components.wrap);
    });

    select_dropdown_components.button_clear.addEventListener("click", function(){

        if (window.confirm("Are you sure you want to delete all saved experiments?")){
            Saves.clearSaves();
        }

        //Remove select from DOM
        // select_dropdown_components.wrap.remove();
        select_dropdown_components.wrap.parentNode.removeChild(select_dropdown_components.wrap);
    });

};



// TODO: Verify that no jQuery is being used!
function _createDropDownSelect(all_saves){

    // var saves_dialog_wrap = $("<saves_dialog_wrap>", {
    //     id: "saved_info"
    // });

    var saves_dialog_wrap = document.createElement("saves_dialog_wrap");
    saves_dialog_wrap.id = "saved_info";

    //Make a select to choose from the saves
    // var sel = $("<select>");
    var sel = document.createElement("select");

    Object.keys(all_saves).map(function(elem, i, all){

        var option = document.createElement("option");
        option.value = i;                                           // Use the all_saves index as the key
        option.text = elem;
        sel.appendChild(option);
        // sel.append($("<option>").attr("value",i).text(elem));
    });


    //Button - no functionality here, just view
    // var b = $("<button>").text("Choose");
    var b = document.createElement("button");
    b.innerHTML = "Choose";


    // var b_clear = $("<button>").text("Clear");
    var b_clear = document.createElement("button");
    b_clear.innerHTML = "Clear";


    // saves_dialog_wrap.append(sel);
    saves_dialog_wrap.appendChild(sel);
    // saves_dialog_wrap.append($("<br>"));
    saves_dialog_wrap.appendChild(document.createElement("br"));
    // saves_dialog_wrap.append(b);
    saves_dialog_wrap.appendChild(b);
    // saves_dialog_wrap.append(b_clear);
    saves_dialog_wrap.appendChild(b_clear);
    // $(document.body).append(saves_dialog_wrap);
    document.body.appendChild(saves_dialog_wrap);

    var css = {
        position: "fixed",
        top: "45vh",
        left: "25vw",
        width: "50vw",
        height: "5vh",
        background: "white",
        border: "2vw",
        "text-align": "center"
    };
    SetCSSOnElement(saves_dialog_wrap, css);
    // saves_dialog_wrap.css({
    //     position: "fixed",
    //     top: "45vh",
    //     left: "25vw",
    //     width: "50vw",
    //     height: "5vh",
    //     background: "white",
    //     border: "2vw",
    //     "text-align": "center"
    // });

    return {
        select: sel,
        button: b,
        button_clear: b_clear,
        wrap: saves_dialog_wrap
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwZXJpbWVudEpTLmpzIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMvQ3JlYXRlRG93bmxvYWRMaW5rLmpzIiwiLi4vc3JjL3V0aWxzL1NodWZmbGUuanMiLCIuLi9zcmMvdXRpbHMvTnVtYmVyVXRpbHMuanMiLCIuLi9zcmMvdXRpbHMvU3RyaW5nVXRpbHMuanMiLCIuLi9zcmMvdXRpbHMvdXRpbHMuanMiLCIuLi9zcmMvdXRpbHMvalF1ZXJ5VXRpbHMuanMiLCIuLi9zcmMvY29yZS9UcmlhbHMuanMiLCIuLi9zcmMvY29yZS9SZXNwb25zZUhhbmRsZXIuanMiLCIuLi9zcmMvY29yZS9HZXRQcHRJbmZvLmpzIiwiLi4vc3JjL2NvcmUvT3V0cHV0UmVzcG9uc2VzLmpzIiwiLi4vc3JjL3V0aWxzL1NldENTU09uRWxlbWVudC5qcyIsIi4uL3NyYy9jb3JlL0ludGVyc3RpbXVsdXNQYXVzZS5qcyIsIi4uL3NyYy91dGlscy9ET01VdGlscy5qcyIsIi4uL3NyYy9jb3JlL1J1bkV4cGVyaW1lbnQuanMiLCIuLi9zcmMvY29yZS9TYXZlcy5qcyIsIi4uL3NyYy9jb3JlL2NvcmUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZURvd25sb2FkTGluayhmaWxlbmFtZSwgZGF0YSl7XG4gICAgLy8vL2h0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTc4MzYyNzMvZXhwb3J0LWphdmFzY3JpcHQtZGF0YS10by1jc3YtZmlsZS13aXRob3V0LXNlcnZlci1pbnRlcmFjdGlvblxuICAgIHZhciBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgYS5ocmVmID0gZGF0YTtcbiAgICBhLnRhcmdldCA9IFwiX2JsYW5rXCI7XG4gICAgYS5kb3dubG9hZCA9IGZpbGVuYW1lO1xuIFxuICAgIHJldHVybiBhO1xufSIsIi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRmlzY2hlciBZYXRlcyBTaHVmZmxlXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG5BcnJheS5wcm90b3R5cGUuc2h1ZmZsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY3VycmVudEluZGV4ID0gdGhpcy5sZW5ndGgsIHRlbXBvcmFyeVZhbHVlLCByYW5kb21JbmRleDtcblxuICAgIC8vIFdoaWxlIHRoZXJlIHJlbWFpbiBlbGVtZW50cyB0byBzaHVmZmxlLi4uXG4gICAgd2hpbGUgKDAgIT09IGN1cnJlbnRJbmRleCkge1xuXG4gICAgICAgIC8vIFBpY2sgYSByZW1haW5pbmcgZWxlbWVudC4uLlxuICAgICAgICByYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGN1cnJlbnRJbmRleCk7XG4gICAgICAgIGN1cnJlbnRJbmRleCAtPSAxO1xuXG4gICAgICAgIC8vIEFuZCBzd2FwIGl0IHdpdGggdGhlIGN1cnJlbnQgZWxlbWVudC5cbiAgICAgICAgdGVtcG9yYXJ5VmFsdWUgPSB0aGlzW2N1cnJlbnRJbmRleF07XG4gICAgICAgIHRoaXNbY3VycmVudEluZGV4XSA9IHRoaXNbcmFuZG9tSW5kZXhdO1xuICAgICAgICB0aGlzW3JhbmRvbUluZGV4XSA9IHRlbXBvcmFyeVZhbHVlO1xuICAgIH1cbn07IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGthaSBvbiA1LzEvMTcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0Zsb2F0KG4pIHtcbiAgICByZXR1cm4gTnVtYmVyKG4pID09PSBuICYmIG4gJSAxICE9PSAwO1xufSIsIlxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdHJpbmcgVXRpbHNcbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbWVsVG9TZW50ZW5jZUNhc2Uoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5zcGxpdCgvKD89W0EtWl0pLykuam9pbihcIiBcIikudG9Mb3dlckNhc2UoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBhcmFtTmFtZXMoZm4pe1xuICAgIC8vd3JhcCB0aGVzZSBzbyBhcyBub3QgdG8gcG9sbHV0ZSB0aGUgbmFtZXNwYWNlXG4gICAgdmFyIFNUUklQX0NPTU1FTlRTID0gLygoXFwvXFwvLiokKXwoXFwvXFwqW1xcc1xcU10qP1xcKlxcLykpL21nO1xuICAgIHZhciBBUkdVTUVOVF9OQU1FUyA9IC8oW15cXHMsXSspL2c7XG4gICAgZnVuY3Rpb24gX2dldFBhcmFtTmFtZXMoZnVuYykge1xuICAgICAgICB2YXIgZm5TdHIgPSBmdW5jLnRvU3RyaW5nKCkucmVwbGFjZShTVFJJUF9DT01NRU5UUywgXCJcIik7XG4gICAgICAgIHZhciByZXN1bHQgPSBmblN0ci5zbGljZShmblN0ci5pbmRleE9mKFwiKFwiKSsxLCBmblN0ci5pbmRleE9mKFwiKVwiKSkubWF0Y2goQVJHVU1FTlRfTkFNRVMpO1xuICAgICAgICBpZihyZXN1bHQgPT09IG51bGwpXG4gICAgICAgICAgICByZXN1bHQgPSBbXTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICByZXR1cm4gX2dldFBhcmFtTmFtZXMoZm4pO1xufSIsIi8qKlxuICogQ3JlYXRlZCBieSBrYWkgb24gNS8xLzE3LlxuICovXG5cbmltcG9ydCBcIi4vQ3JlYXRlRG93bmxvYWRMaW5rLmpzXCI7XG5pbXBvcnQgXCIuL1NodWZmbGUuanNcIjtcbmltcG9ydCBcIi4vTnVtYmVyVXRpbHMuanNcIjtcbmltcG9ydCBcIi4vU3RyaW5nVXRpbHMuanNcIjtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBrYWkgb24gNi83LzE3LlxuICovXG5cblxuLy8gdmFyIGFyciA9IFtdO1xuXG4vLyB2YXIgZG9jdW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQ7XG5cbnZhciBnZXRQcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZjtcblxuLy8gdmFyIHNsaWNlID0gYXJyLnNsaWNlO1xuXG4vLyB2YXIgY29uY2F0ID0gYXJyLmNvbmNhdDtcblxuLy8gdmFyIHB1c2ggPSBhcnIucHVzaDtcblxuLy8gdmFyIGluZGV4T2YgPSBhcnIuaW5kZXhPZjtcblxudmFyIGNsYXNzMnR5cGUgPSB7fTtcblxudmFyIHRvU3RyaW5nID0gY2xhc3MydHlwZS50b1N0cmluZztcblxudmFyIGhhc093biA9IGNsYXNzMnR5cGUuaGFzT3duUHJvcGVydHk7XG5cbnZhciBmblRvU3RyaW5nID0gaGFzT3duLnRvU3RyaW5nO1xuXG52YXIgT2JqZWN0RnVuY3Rpb25TdHJpbmcgPSBmblRvU3RyaW5nLmNhbGwoIE9iamVjdCApO1xuXG52YXIgc3VwcG9ydCA9IHt9O1xuXG5cbi8vIFRha2VuIGZyb20gSnF1ZXJ5XG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5kKCkge1xuICAgIHZhciBvcHRpb25zLCBuYW1lLCBzcmMsIGNvcHksIGNvcHlJc0FycmF5LCBjbG9uZSxcbiAgICAgICAgdGFyZ2V0ID0gYXJndW1lbnRzWyAwIF0gfHwge30sXG4gICAgICAgIGkgPSAxLFxuICAgICAgICBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoLFxuICAgICAgICBkZWVwID0gZmFsc2U7XG5cbiAgICAvLyBIYW5kbGUgYSBkZWVwIGNvcHkgc2l0dWF0aW9uXG4gICAgaWYgKCB0eXBlb2YgdGFyZ2V0ID09PSBcImJvb2xlYW5cIiApIHtcbiAgICAgICAgZGVlcCA9IHRhcmdldDtcblxuICAgICAgICAvLyBTa2lwIHRoZSBib29sZWFuIGFuZCB0aGUgdGFyZ2V0XG4gICAgICAgIHRhcmdldCA9IGFyZ3VtZW50c1sgaSBdIHx8IHt9O1xuICAgICAgICBpKys7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIGNhc2Ugd2hlbiB0YXJnZXQgaXMgYSBzdHJpbmcgb3Igc29tZXRoaW5nIChwb3NzaWJsZSBpbiBkZWVwIGNvcHkpXG4gICAgaWYgKCB0eXBlb2YgdGFyZ2V0ICE9PSBcIm9iamVjdFwiICYmICEodHlwZW9mIHRhcmdldCA9PT0gXCJmdW5jdGlvblwiKSApIHtcbiAgICAgICAgdGFyZ2V0ID0ge307XG4gICAgfVxuXG4gICAgLy8gRXh0ZW5kIGpRdWVyeSBpdHNlbGYgaWYgb25seSBvbmUgYXJndW1lbnQgaXMgcGFzc2VkXG4gICAgaWYgKCBpID09PSBsZW5ndGggKSB7XG4gICAgICAgIHRhcmdldCA9IHRoaXM7XG4gICAgICAgIGktLTtcbiAgICB9XG5cbiAgICBmb3IgKCA7IGkgPCBsZW5ndGg7IGkrKyApIHtcblxuICAgICAgICAvLyBPbmx5IGRlYWwgd2l0aCBub24tbnVsbC91bmRlZmluZWQgdmFsdWVzXG4gICAgICAgIGlmICggKCBvcHRpb25zID0gYXJndW1lbnRzWyBpIF0gKSAhPSBudWxsICkge1xuXG4gICAgICAgICAgICAvLyBFeHRlbmQgdGhlIGJhc2Ugb2JqZWN0XG4gICAgICAgICAgICBmb3IgKCBuYW1lIGluIG9wdGlvbnMgKSB7XG4gICAgICAgICAgICAgICAgc3JjID0gdGFyZ2V0WyBuYW1lIF07XG4gICAgICAgICAgICAgICAgY29weSA9IG9wdGlvbnNbIG5hbWUgXTtcblxuICAgICAgICAgICAgICAgIC8vIFByZXZlbnQgbmV2ZXItZW5kaW5nIGxvb3BcbiAgICAgICAgICAgICAgICBpZiAoIHRhcmdldCA9PT0gY29weSApIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gUmVjdXJzZSBpZiB3ZSdyZSBtZXJnaW5nIHBsYWluIG9iamVjdHMgb3IgYXJyYXlzXG4gICAgICAgICAgICAgICAgaWYgKCBkZWVwICYmIGNvcHkgJiYgKCBpc1BsYWluT2JqZWN0KCBjb3B5ICkgfHxcbiAgICAgICAgICAgICAgICAgICAgKCBjb3B5SXNBcnJheSA9IEFycmF5LmlzQXJyYXkoIGNvcHkgKSApICkgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBjb3B5SXNBcnJheSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvcHlJc0FycmF5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9uZSA9IHNyYyAmJiBBcnJheS5pc0FycmF5KCBzcmMgKSA/IHNyYyA6IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9uZSA9IHNyYyAmJiBpc1BsYWluT2JqZWN0KCBzcmMgKSA/IHNyYyA6IHt9O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gTmV2ZXIgbW92ZSBvcmlnaW5hbCBvYmplY3RzLCBjbG9uZSB0aGVtXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFsgbmFtZSBdID0gZXh0ZW5kKCBkZWVwLCBjbG9uZSwgY29weSApO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIERvbid0IGJyaW5nIGluIHVuZGVmaW5lZCB2YWx1ZXNcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCBjb3B5ICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFsgbmFtZSBdID0gY29weTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gdGhlIG1vZGlmaWVkIG9iamVjdFxuICAgIHJldHVybiB0YXJnZXQ7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUGxhaW5PYmplY3QoIG9iaiApIHtcbiAgICB2YXIgcHJvdG8sIEN0b3I7XG5cbiAgICAvLyBEZXRlY3Qgb2J2aW91cyBuZWdhdGl2ZXNcbiAgICAvLyBVc2UgdG9TdHJpbmcgaW5zdGVhZCBvZiBqUXVlcnkudHlwZSB0byBjYXRjaCBob3N0IG9iamVjdHNcbiAgICBpZiAoICFvYmogfHwgdG9TdHJpbmcuY2FsbCggb2JqICkgIT09IFwiW29iamVjdCBPYmplY3RdXCIgKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwcm90byA9IGdldFByb3RvKCBvYmogKTtcblxuICAgIC8vIE9iamVjdHMgd2l0aCBubyBwcm90b3R5cGUgKGUuZy4sIGBPYmplY3QuY3JlYXRlKCBudWxsIClgKSBhcmUgcGxhaW5cbiAgICBpZiAoICFwcm90byApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gT2JqZWN0cyB3aXRoIHByb3RvdHlwZSBhcmUgcGxhaW4gaWZmIHRoZXkgd2VyZSBjb25zdHJ1Y3RlZCBieSBhIGdsb2JhbCBPYmplY3QgZnVuY3Rpb25cbiAgICBDdG9yID0gaGFzT3duLmNhbGwoIHByb3RvLCBcImNvbnN0cnVjdG9yXCIgKSAmJiBwcm90by5jb25zdHJ1Y3RvcjtcbiAgICByZXR1cm4gdHlwZW9mIEN0b3IgPT09IFwiZnVuY3Rpb25cIiAmJiBmblRvU3RyaW5nLmNhbGwoIEN0b3IgKSA9PT0gT2JqZWN0RnVuY3Rpb25TdHJpbmc7XG59XG4iLCJpbXBvcnQgeyBleHRlbmQgfSBmcm9tIFwiLi4vdXRpbHMvalF1ZXJ5VXRpbHMuanNcIjtcblxuXG5cbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVHJpYWxzIC0gU2V0dGluZyBJViBMZXZlbHMgJiBGdW5jdGlvbnNcbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cblxudmFyIFRyaWFscyA9IHt9O1xuZXhwb3J0IHZhciBJVnMgPSB7fTtcbmV4cG9ydCB2YXIgc2V0RnVuY3MgPSB7fTtcblxudmFyIGV4cFJlcGVhdHMgPSAxO1xuXG4vKiogRXZlcnkgSVYgcmVxdWlyZXMgMiBzdGVwczogY3JlYXRpbmcgdGhlIGxldmVscyBhbmQgdGhlbiwgc2V0dGluZyB0aGUgdGFyZ2V0ICovXG5UcmlhbHMuc2V0SVZMZXZlbHMgPSBmdW5jdGlvbiAoaXZuYW1lLCBsZXZlbHMpIHtcbiAgICBfc2V0SVZHZW5lcmljKGl2bmFtZSwgXCJsZXZlbHNcIiwgbGV2ZWxzKTtcbn07XG5cblRyaWFscy5zZXRJVnNldEZ1bmMgPSBmdW5jdGlvbihpdm5hbWUsIHNldEZ1bmMpIHtcblxuICAgIC8vVGhpcyBpcyBub3cgYSBmbGFnIHRvIG5vdGlmeSBFeHBlcmltZW50SlMgdGhhdCB5b3VcInJlIHVzaW5nIGZ1bmN0aW9uc1xuICAgIF9zZXRJVkdlbmVyaWMoaXZuYW1lLCBcInNldEZ1bmNcIiwgdHJ1ZSk7XG5cbiAgICAvL0Z1bmN0aW9ucyBhcmUgbm93IHN0b3JlZCBpbiB0aGVpciBvd24gbWFwLCBrZXllZCBieSBpdm5hbWVcbiAgICBfc2V0U2V0RnVuYyhpdm5hbWUsIHNldEZ1bmMpO1xufTtcblxuZXhwb3J0IHZhciBfZHZOYW1lO1xuVHJpYWxzLnNldERWTmFtZSA9IGZ1bmN0aW9uKGR2TmFtZSl7XG4gICAgaWYgKHR5cGVvZiBkdk5hbWUgPT09IFwic3RyaW5nXCIpe1xuICAgICAgICBfY3N2SWxsZWdhbENoYXJDaGVjayhkdk5hbWUpO1xuICAgICAgICBfZHZOYW1lID0gZHZOYW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93ICBuZXcgRXJyb3IoXCJUaGUgc3VwcGxpZWQgRFYgbmFtZSBtdXN0IGJlIG9mIHR5cGUgU3RyaW5nXCIpO1xuICAgIH1cbn07XG5cbi8qXG4gVGhlIHRyaWFsIHZhbHVlIHdpbGwgYWx3YXlzIGJlIHBhc3NlZCBpbiBhcyB0aGUgZmlyc3QgYXJndW1lbnRcbiBUaGUgdHlwZSBvZiB0aGF0IHRyaWFsIHZhbHVlIHdpbGwgYmUgdGhlIGZpcnN0IG5vbiBhcnJheS1vZi1hcnJheXMgaW4gdGhlIGV4cGVyaW1lbnRcbiBwYXJzZXJGdW5jcyBhcmUgcGFzc2VkIGFyZ3MgaW4gdGhpcyBvcmRlciAodHJpYWxJViwgaSlcbiBwYXJzZXJGdW5jcyBtdXN0IHJldHVybiB0aGUgZm9ybWF0dGVkIHZhbHVlXG4gVGhpcyBhc3N1bWVzIHlvdSBrbm93IHRoZSBjb250ZW50IG9mIHRoZSB0cmlhbCB2YWx1ZSwgd2hpY2ggeW91IHNob3VsZC4uLi5cbiAqL1xuVHJpYWxzLnNldElWVHJpYWxQYXJzZXJGdW5jID0gZnVuY3Rpb24gKGl2bmFtZSwgcGFyc2VyRnVuYykge1xuICAgIF9zZXRJVkdlbmVyaWMoaXZuYW1lLCBcInBhcnNlckZ1bmNcIiwgcGFyc2VyRnVuYyk7XG59O1xuXG5cblRyaWFscy5zZXRSZXBlYXRzID0gZnVuY3Rpb24gKG5SZXBlYXRzKSB7XG4gICAgZXhwUmVwZWF0cyA9IG5SZXBlYXRzO1xufTtcblxuXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICBUcmlhbHMgLSBTZXR0aW5nIElWIExldmVscyAmIEZ1bmN0aW9ucyAocHJpdmF0ZSlcbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cbi8qXG4qICovXG5leHBvcnQgZnVuY3Rpb24gX3NldElWR2VuZXJpYyhpdk5hbWUsIGZpZWxkTmFtZSwgZmllbGRWYWwpIHsgLy91c2VkIGJ5IDJBRkMuanNcbiAgICBfY3N2SWxsZWdhbENoYXJDaGVjayhpdk5hbWUpO1xuICAgIF9jc3ZJbGxlZ2FsQ2hhckNoZWNrKGZpZWxkTmFtZSk7XG4gICAgaWYgKCFJVnMuaGFzT3duUHJvcGVydHkoaXZOYW1lKSkgeyAvL0lmIElWIGRvZW5zdCBleGlzdHMgbWFrZSBpdCBhcyBhIHJhdyBvYmplY3RcbiAgICAgICAgSVZzW2l2TmFtZV0gPSB7fTtcbiAgICB9XG5cbiAgICBJVnNbaXZOYW1lXVtmaWVsZE5hbWVdID0gZmllbGRWYWw7XG59XG5cblxuZnVuY3Rpb24gX3NldFNldEZ1bmMoaXZuYW1lLCBzZXRmdW5jKXtcbiAgICBzZXRGdW5jc1tpdm5hbWVdID0gc2V0ZnVuYztcbn1cblxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRyaWFscyAtIEJ1aWxkaW5nXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG5cblxuZXhwb3J0IHZhciBfYWxsVHJpYWxzID0gW107XG52YXIgX3RvdGFsVHJpYWxzID0gLTE7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9Bc3NpZ25lZCBidXQgbmV2ZXIgdXNlZFxuZXhwb3J0IHZhciBfZGlkQnVpbGRUcmlhbHMgPSBmYWxzZTtcblxuZXhwb3J0IGZ1bmN0aW9uIF9zZXRBbGxUcmlhbHMoYWxsdHJpYWxzKXsgICAgICAgICAgICAgICAgICAgICAgLy8gVXNlZCBpbiAuL1NhdmVzLmpzLiBIYXMgdG8gbGl2ZSBoZXJlIGFzIGl0IHJlZGVmaW5lcyBfYWxsVHJpYWxzXG4gICAgaWYgKGFsbHRyaWFscy5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpe1xuICAgICAgICBfYWxsVHJpYWxzID0gYWxsdHJpYWxzO1xuICAgIH1cbn1cblxuLy8gUmV0dXJucyBhIGRlZXAgY29weSBvZiB0aGUgdHJpYWxzXG5UcmlhbHMuZ2V0VHJpYWxzID0gZnVuY3Rpb24oKXtcbiAgICBpZiAoX2FsbFRyaWFscy5sZW5ndGggPiAwKXtcbiAgICAgICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBbXSwgX2FsbFRyaWFscyk7XG4gICAgICAgIC8vIHJldHVybiAkLmV4dGVuZCh0cnVlLCBbXSwgX2FsbFRyaWFscyk7XG4gICAgfVxufTtcblxuXG5mdW5jdGlvbiBfYnVpbGRUcmlhbHMocHJpbnRUcmlhbHMpIHtcblxuICAgIGNvbnNvbGUubG9nKFwiQnVpbGQgVHJpYWxzLiBJVlM6XCIsIElWcyk7XG5cbiAgICB2YXIgYnVpbGRpbmdUcmlhbCwgdGVtcDtcblxuICAgIGZvciAodmFyIGl2IGluIElWcykgeyAvL0l0ZXJhdGUgb3ZlciBJVnNcblxuICAgICAgICBpZiAoSVZzW2l2XS5sZXZlbHMgPT09IHVuZGVmaW5lZCkgIHRocm93IG5ldyBFcnJvcihcIkxldmVscyBub3Qgc3VwcGxpZWQgZm9yIFwiICsgaXYpO1xuICAgICAgICBpZiAoSVZzW2l2XS5zZXRGdW5jID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihcIlNldHRlciBmdW5jdGlvbiBub3Qgc3VwcGxpZWQgZm9yIFwiICsgaXYpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwiRXh0ZW5kaW5nIGFsbCB0cmlhbHMgYXJyYXkgd2l0aDogXCIgKyBpdiArIFwiIChcIiArIElWc1tpdl0ubGV2ZWxzLmxlbmd0aCArIFwiIGxldmVscylcIik7XG5cbiAgICAgICAgaWYgKHNldEZ1bmNzW2l2XSA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoXCJTZXRGdW5jIG5vdCBkZWZpbmVkIGZvciBcIiArIGl2KTtcblxuICAgICAgICB0ZW1wID0gW107XG5cbiAgICAgICAgdmFyIGxlbiA9IF9hbGxUcmlhbHMubGVuZ3RoID09PSAwID8gMSA6IF9hbGxUcmlhbHMubGVuZ3RoOyAvLyBGb3IgdGhlIGZpcnN0IHBhc3NcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7IC8vRm9yIGFsbCB0cmlhbHMgYnVpbHQgc28gZmFyXG5cbiAgICAgICAgICAgIGJ1aWxkaW5nVHJpYWwgPSBfYWxsVHJpYWxzLnBvcCgpOyAvL1BvcCB0aGUgaW5jb21wbGV0ZSBhcnJheSBvZiBpdi12YWxzIChvYmplY3RzKSBhbmQgZXh0ZW5kXG5cbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgSVZzW2l2XS5sZXZlbHMubGVuZ3RoOyArK2opIHsgLy9FeHRlbmQgdGhlbSBieSBhbGwgdGhlIGxldmVscyBvZiB0aGUgbmV4dCBJVlxuXG5cbiAgICAgICAgICAgICAgICAvKiogU2V0IHRoZSB2YWx1ZSAmIGRlc2NyaXB0aW9uIG9mIHRoZSBjdXJyZW50IElWIG9iaiA0IHRoZSBjdXJyZW50IExldmVsICovXG4gICAgICAgICAgICAgICAgdmFyIGN1cklWTGV2ZWwgPSB7fTtcbiAgICAgICAgICAgICAgICBjdXJJVkxldmVsLmRlc2NyaXB0aW9uID0gaXY7IC8vY2FtZWxUb1NlbnRlbmNlQ2FzZShpdik7XG4gICAgICAgICAgICAgICAgY3VySVZMZXZlbC52YWx1ZSA9IElWc1tpdl0ubGV2ZWxzW2pdO1xuXG4gICAgICAgICAgICAgICAgLyoqIFN0b3JlIDJBRkMgc3RkIHdpdGggZWFjaCB0cmlhbCAoaWYgcHJlc2VudCkgKi9cbiAgICAgICAgICAgICAgICBpZiAoSVZzW2l2XS5oYXNPd25Qcm9wZXJ0eShcInN0ZF8yQUZDXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cklWTGV2ZWwuc3RkXzJBRkMgPSBJVnNbaXZdLnN0ZF8yQUZDO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8qKiBGb3IgMkFGQyB0aGF0IGlzIHNpbXVsdGFuZW91cyAoYXMgb3Bwb3NlZCB0byB0aGUgZmxpcHBpbmcga2luZCkqL1xuICAgICAgICAgICAgICAgIGlmIChJVnNbaXZdLmhhc093blByb3BlcnR5KFwic3RkXzJBRkNfc2ltdWx0YW5lb3VzX3RhcmdldFwiKSkge1xuICAgICAgICAgICAgICAgICAgICBjdXJJVkxldmVsLnN0ZF8yQUZDX3NpbXVsdGFuZW91c190YXJnZXQgPSBJVnNbaXZdLnN0ZF8yQUZDX3NpbXVsdGFuZW91c190YXJnZXQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8qKiBQYXJzZXIgZnVuY3Rpb24qL1xuICAgICAgICAgICAgICAgIGlmIChJVnNbaXZdLnBhcnNlckZ1bmMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlNldHRpbmcgcGFyc2VyIGZvciBcIiwgaXYpO1xuICAgICAgICAgICAgICAgICAgICBjdXJJVkxldmVsLnBhcnNlckZ1bmMgPSBJVnNbaXZdLnBhcnNlckZ1bmM7IC8vQ291bGQgd3JpdGUgYSBjb3B5aW5nIG1ldGhvZCBmb3IgYWxsIG9mIHRoZXNlICh0aGF0IGhhbmRsZXMgZGVlcCBjb3B5aW5nKVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBuZXdPckV4dGVuZGVkVHJpYWw7XG5cbiAgICAgICAgICAgICAgICBpZiAoYnVpbGRpbmdUcmlhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vbmV3T3JFeHRlbmRlZFRyaWFsID0gIGl2ICsgXCIgIFwiICsgbGV2ZWxWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgbmV3T3JFeHRlbmRlZFRyaWFsID0gW2N1cklWTGV2ZWxdO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChidWlsZGluZ1RyaWFsLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICAvL25ld09yRXh0ZW5kZWRUcmlhbCA9IGJ1aWxkaW5nVHJpYWwgKyBcIiB8IHwgXCIgKyBpdiArIFwiICBcIiArIGxldmVsVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIG5ld09yRXh0ZW5kZWRUcmlhbCA9IGJ1aWxkaW5nVHJpYWwuY29uY2F0KFtjdXJJVkxldmVsXSk7IC8vQ3JlYXRlcyBhIGJyYW5kIG5ldyBhcnJheSB3IHRoZSBuZXcgbGV2ZWxcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0ZW1wLnB1c2gobmV3T3JFeHRlbmRlZFRyaWFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKiBSZXBsYWNlIHlvdXIgcHJldmlvdXMgdHJpYWxzIHdpdGggVGVtcCAoZG9uXCJ0IGtub3cgd2hvIHRvIGRvIHRoaXMgaW4gcGxhY2UpICovXG4gICAgICAgIF9hbGxUcmlhbHMgPSB0ZW1wO1xuICAgIH1cblxuXG4gICAgLyoqIER1cGxpY2F0ZSB0aGUgY3VycmVudCBmYWN0b3JpYWwgdHJpYWxzICovXG4gICAgdmFyIHJlcGVhdHMgPSBleHBSZXBlYXRzO1xuICAgIHRlbXAgPSBbXTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgcmVwZWF0czsgaSsrKSB7XG4gICAgICAgIHRlbXAgPSB0ZW1wLmNvbmNhdChfYWxsVHJpYWxzKTtcbiAgICB9XG4gICAgX2FsbFRyaWFscyA9IHRlbXA7XG5cblxuICAgIGNvbnNvbGUubG9nKFwiVGhlcmUgYXJlIFwiLCBfYWxsVHJpYWxzLmxlbmd0aCwgXCJ0cmlhbHMgKHVzaW5nXCIsIHJlcGVhdHMsIFwicmVwZWF0cylcIik7XG4gICAgaWYgKHByaW50VHJpYWxzKXtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IF9hbGxUcmlhbHMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJUUklBTCBcIiwgaSk7XG4gICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgX2FsbFRyaWFsc1tpXS5sZW5ndGg7IGorKyl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coIF9hbGxUcmlhbHNbaV1bal0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiKioqKioqKiAqKioqKioqICoqKioqKiogKioqKioqKlwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChfc2hvdWxkU2h1ZmZsZSkgICAgIF9hbGxUcmlhbHMuc2h1ZmZsZSgpO1xuXG5cbiAgICBfdG90YWxUcmlhbHMgPSBfYWxsVHJpYWxzLmxlbmd0aDsgLy9Vc2VkIHRvIGRldGVybWluZSB3aGVyZSB5b3UgYXJlIGluIHRoZSB0cmlhbCBwcm9jZXNzXG4gICAgX2RpZEJ1aWxkVHJpYWxzID0gdHJ1ZTtcbn1cblxuXG4vKipcbiAqIE5PVEU6IFRoaXMgbW9kdWxlIGRvZXMgbm90IGxvbmdlciBoYW5kbGUgYXBwZWFyYW5jZSBvciBpbnB1dFxuICogVGhpcyBtb2R1bGUgbm93IG9ubHkgaGFuZGxlczpcbiAgICAqIC0gdGFraW5nIElWc1xuICAgICogLSBidWlsZGluZyBhbGwgdHJpYWxzXG4gKi9cblRyaWFscy5idWlsZEV4cGVyaW1lbnQgPSBmdW5jdGlvbiAocHJpbnRUcmlhbHMpIHtcbiAgICBfYnVpbGRUcmlhbHMoIChwcmludFRyaWFscyA9PT0gdW5kZWZpbmVkKSA/IGZhbHNlIDogcHJpbnRUcmlhbHMgKTtcbn07XG5cblxudmFyIF9zaG91bGRTaHVmZmxlID0gdHJ1ZTtcblRyaWFscy5zZXRTaHVmZmxlID0gZnVuY3Rpb24oc2hvdWxkU2h1ZmZsZSl7XG4gICAgaWYgKHR5cGVvZihzaG91bGRTaHVmZmxlKSA9PT0gXCJib29sZWFuXCIpe1xuICAgICAgICBfc2hvdWxkU2h1ZmZsZSA9ICBzaG91bGRTaHVmZmxlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcInNldFNodWZmbGUgb25seSBhY2NlcHRzIGJvb2xlYW4gYXJndW1lbnRcIik7XG4gICAgfVxufTtcblxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRyaWFscyAoc3ViZnVuY3Rpb25zKVxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuZnVuY3Rpb24gX2NzdklsbGVnYWxDaGFyQ2hlY2soc3RyaW5nKXtcblxuICAgIGlmICh0eXBlb2Ygc3RyaW5nICE9PSBcInN0cmluZ1wiKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc3VwcGx5IGEgdmFyaWFibGUgb2YgdHlwZSBTdHJpbmcgZm9yIHRoaXMgbWV0aG9kXCIpO1xuICAgIH1cblxuICAgIGlmIChzdHJpbmcuaW5kZXhPZihcIixcIikgIT09IC0xKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3RyaW5ncyB1c2VkIGJ5IEV4cGVyaW1lbnRKUyBtYXkgbm90IGNvbnRhaW4gY29tbWFzOiBcIiArIHN0cmluZyk7XG4gICAgfVxufVxuXG5leHBvcnQgeyBUcmlhbHMgfTsiLCIvKipcbiAqIENyZWF0ZWQgYnkga2FpIG9uIDYvNy8xNy5cbiAqL1xuXG5pbXBvcnQgeyBfYWxsVHJpYWxzLCBzZXRGdW5jcywgX2R2TmFtZSB9IGZyb20gXCIuL1RyaWFsc1wiO1xuXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEV4cGVyaW1lbnQgTGlmZWN5Y2xlIC0gU3RvcmUgUmVzcG9uc2Vcbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cbmV4cG9ydCB2YXIgX3Jlc3BvbnNlcyA9IFtdO1xuZXhwb3J0IGZ1bmN0aW9uIF9zZXRSZXNwb25zZXMocmVzcG9uc2VzKXsgICAgICAgICAgICAgICAgICAgICAgIC8vIFVzZWQgaW4gLi9TYXZlcy5qcy4gSGFzIHRvIGxpdmUgaGVyZSBhcyBpdCByZWRlZmluZXMgX3Jlc3BvbnNlc1xuICAgIGlmIChyZXNwb25zZXMuY29uc3RydWN0b3IgPT09IEFycmF5KXtcbiAgICAgICAgX3Jlc3BvbnNlcyA9IHJlc3BvbnNlcztcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJyZXBvbnNlcyBjYW4gb25seSBiZSBzZXQgdG8gYW4gYXJyYXlcIik7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gX3N0b3JlUmVzcG9uc2Uob3B0aW9ucykge1xuXG4gICAgdmFyIGxhc3RUcmlhbCA9IF9hbGxUcmlhbHMucG9wKCk7XG5cbiAgICB2YXIgcmVzcG9uc2VGb3JtYXR0ZWQgPSB7fTtcblxuICAgIC8qKiBTdG9yZSB0aGUgSVYgLT4gV3JpdGUgb3V0IGVhY2ggSVYgKDEgSVYgcGVyIGFycmF5IGVsZW1lbnQpIHRvIGEgZmllbGQgKi9cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhc3RUcmlhbC5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgaXZOdW0gPSBcIklWXCIgKyBpO1xuXG4gICAgICAgIC8vSWYgYSBwYXJzZXIgaXMgZGVmaW5lZCB1c2UgaXRzIG91dHB1dCBhcyB0aGUgdmFsdWUgb2YgdGhlIHJlc3BvbnNlXG4gICAgICAgIGlmIChsYXN0VHJpYWxbaV0ucGFyc2VyRnVuYyAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBsYXN0VHJpYWxbaV0ucGFyc2VyRnVuYyA9PT0gXCJmdW5jdGlvblwiKXsgLy8kLmlzRnVuY3Rpb24obGFzdFRyaWFsW2ldLnBhcnNlckZ1bmMpKXtcbiAgICAgICAgICAgIHZhciBzdGROYW1lID0gaXZOdW0gKyBcIl9cIiArIGxhc3RUcmlhbFtpXS5kZXNjcmlwdGlvbiArIFwiX3ZhbHVlXCI7XG5cbiAgICAgICAgICAgIHJlc3BvbnNlRm9ybWF0dGVkW3N0ZE5hbWVdID0gbGFzdFRyaWFsW2ldLnBhcnNlckZ1bmMuYXBwbHkodGhpcywgbGFzdFRyaWFsW2ldLnZhbHVlLmNvbmNhdChpKSApOyAvL1RoZSBhcmdzIGFyZSBwYXNzZWQgdG8gdGhlIHBhcnNlciBmdW5jIHdpdGggdGhlIGluZGV4IGFzIHRoZSBsYXN0IGFyZ1xuXG4gICAgICAgIH0gZWxzZSBpZiAobGFzdFRyaWFsW2ldLnZhbHVlLmNvbnN0cnVjdG9yID09PSBBcnJheSkgeyAvL0NvbnNpZGVyIHRoZXNlIHRvIGJlIGRlZmF1bHRzIGZvciBqYXZhc2NyaXB0IHByaW1pdGl2ZSB0eXBlc1xuXG4gICAgICAgICAgICAvKiogTWFudWFsbHkgd3JpdGUgb3V0IGVhY2ggYXJndW1lbnQgKGZyb20gYW4gYXJyYXkpIHRvIGEgZmllbGQgaW4gdGhlIG9iamVjdFxuICAgICAgICAgICAgICogIE9ubHkgYXBwZW5kIGEgbnVtYmVyIGlmIHRoZXJlIGFyZSA+MSBhcmd1bWVudHMgcGFzc2VkIGluICovXG5cbiAgICAgICAgICAgIGlmIChsYXN0VHJpYWxbaV0udmFsdWUubGVuZ3RoID4gMSl7XG5cbiAgICAgICAgICAgICAgICAvL0lmIHVzaW5nIGEgc2V0RnVuYyBmdW5jdGlvbiB3aXRoIG11bHRpcGxlIGFyZ3MgLT4gdXNlIHRoZSBhcmcgbmFtZXMgdG8gZGVzY3JpYmUgdGhlIHZhbHVlcyB3cml0dGVuIHRvIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgIHZhciBhcmdfbmFtZXMsIGFyZ19uYW1lO1xuICAgICAgICAgICAgICAgIGFyZ19uYW1lcyA9IGdldFBhcmFtTmFtZXMoIHNldEZ1bmNzW2xhc3RUcmlhbFtpXS5kZXNjcmlwdGlvbl0gKTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbGFzdFRyaWFsW2ldLnZhbHVlLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ19uYW1lID0gYXJnX25hbWVzW2pdO1xuICAgICAgICAgICAgICAgICAgICByZXNwb25zZUZvcm1hdHRlZFtpdk51bSArIFwiX1wiICsgbGFzdFRyaWFsW2ldLmRlc2NyaXB0aW9uICsgXCJfdmFsdWVfXCIgKyBhcmdfbmFtZSBdID0gIGxhc3RUcmlhbFtpXS52YWx1ZVtqXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2VGb3JtYXR0ZWRbIGl2TnVtICsgXCJfXCIgKyBsYXN0VHJpYWxbaV0uZGVzY3JpcHRpb24gKyBcIl92YWx1ZVwiIF0gPSAgbGFzdFRyaWFsW2ldLnZhbHVlWzBdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNwb25zZUZvcm1hdHRlZFtpdk51bSArIFwiX1wiICsgbGFzdFRyaWFsW2ldLmRlc2NyaXB0aW9uICsgXCJfdmFsdWVcIl0gPSBsYXN0VHJpYWxbaV0udmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogQWRkIGEgdmFsdWUgb2YgdGhlIDJhZmMgc3RkIChmb3IgdGhlIHJlbGV2YW50IElWKSAqL1xuICAgICAgICBpZiAobGFzdFRyaWFsW2ldLmhhc093blByb3BlcnR5KFwic3RkXzJBRkNcIikpIHtcbiAgICAgICAgICAgIHJlc3BvbnNlRm9ybWF0dGVkW1wic3RkXzJBRkNcIl0gPSBsYXN0VHJpYWxbaV0uc3RkXzJBRkM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogQ2hlY2sgdGhhdCBhIDJhZmMgc3RkIHZhbHVlIHdhcyBhZGRlZCAtIGlmIG5vdCB5b3Ugd2FudCB0byBhZGQgYSBudWxsIHZhbHVlIG9yIGl0IHdpbGwgZnVjayB1cCB0aGUgY3N2IHdyaXRlKi9cbiAgICAvLyBpZiAoIXJlc3BvbnNlRm9ybWF0dGVkLmhhc093blByb3BlcnR5KFwic3RkXzJBRkNcIikgJiYgZGlkU2V0MkFGQykge1xuICAgIC8vICAgICByZXNwb25zZUZvcm1hdHRlZFtcInN0ZF8yQUZDXCJdID0gXCJudWxsXCI7XG4gICAgLy8gfVxuXG5cbiAgICAvKiogU3RvcmUgdGhlIERWKi9cbiAgICBpZiAob3B0aW9ucyAhPT0gdW5kZWZpbmVkICYmIG9wdGlvbnMuaGFzT3duUHJvcGVydHkoXCJkdl92YWx1ZVwiKSkge1xuICAgICAgICB2YXIgdmFsdWUgPSBfZHZOYW1lIHx8IFwidmFsdWVcIjtcbiAgICAgICAgcmVzcG9uc2VGb3JtYXR0ZWRbXCJEVl9cIit2YWx1ZV0gPSBvcHRpb25zLmR2X3ZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGFsZXJ0KFwiTm8gRFYgd2FzIHN1cHBsaWVkIGJ5IHRoZSBjYWxsaW5nIGNvZGUuIFRoaXMgaXMgYW4gZXJyb3IuXCIpO1xuICAgICAgICByZXNwb25zZUZvcm1hdHRlZFtcIkRWX3ZhbHVlXCJdID0gXCJFUlJPUiAtIE5vIERWIHN1cHBsaWVkXCI7XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coXCJTVE9SRUQgVEhJUyBSRVNQT05TRTogXCIsIHJlc3BvbnNlRm9ybWF0dGVkKTtcblxuICAgIF9yZXNwb25zZXMucHVzaChyZXNwb25zZUZvcm1hdHRlZCk7XG59IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGthaSBvbiA2LzcvMTcuXG4gKi9cbmltcG9ydCB7IFRyaWFscyB9IGZyb20gXCIuL1RyaWFscy5qc1wiO1xuXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG4vLyAgICAgICAgICAgICAgICAgICAgICBFeHBlcmltZW50IExpZmVjeWNsZSAtIEdldCBQYXJ0aWNpcGFudCBJbmZvXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG5cbmV4cG9ydCB2YXIgX3BwdE5hbWUgPSBcInVubmFtZWRfcHB0XCI7XG5leHBvcnQgdmFyIF9wcHRObyA9IDA7XG5cblRyaWFscy5nZXRQcHRJbmZvID0gZnVuY3Rpb24gKCkge1xuICAgIFxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIF9wcHROYW1lID0gcHJvbXB0KFwiUGxlYXNlIGVudGVyIHlvdXIgbmFtZVwiKS50cmltKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibmFtZSB3YXNcIiwgX3BwdE5hbWUpO1xuICAgICAgICBpZiAoX3BwdE5hbWUgPT09IFwiXCIgfHwgX3BwdE5hbWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGFsZXJ0KFwiTmFtZSBjYW5ub3QgYmUgYmxhbmtcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIF9wcHRObyA9IHBhcnNlSW50KHByb21wdChcIlBsZWFzZSBlbnRlciB5b3VyIHBhcnRpY2lwYW50IG51bWJlclwiKSk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicHB0IG51bWJlciB3YXNcIiwgX3BwdE5vKTtcbiAgICAgICAgaWYgKGlzTmFOKF9wcHRObykpIHtcbiAgICAgICAgICAgIGFsZXJ0KFwiUGFydGljaXBhbnQgbnVtYmVyIG11c3QgYmUgYW4gaW50ZWdlclwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coXCJQYXJ0aWNpcGFudCBuYW1lOiBcIiwgX3BwdE5hbWUsIFwiXFx0UGFydGljaXBhbnQgbnVtYmVyOiBcIiwgX3BwdE5vKTtcbn07IiwiXG5pbXBvcnQgeyBUcmlhbHMgfSBmcm9tIFwiLi9UcmlhbHMuanNcIjtcbmltcG9ydCB7IF9yZXNwb25zZXMgfSBmcm9tIFwiLi9SZXNwb25zZUhhbmRsZXIuanNcIjtcbmltcG9ydCB7IF9wcHROYW1lLCBfcHB0Tm8gfSBmcm9tIFwiLi9HZXRQcHRJbmZvLmpzXCI7XG5pbXBvcnQgeyBjcmVhdGVEb3dubG9hZExpbmsgfSBmcm9tIFwiLi4vdXRpbHMvQ3JlYXRlRG93bmxvYWRMaW5rLmpzXCI7XG5cbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRXhwZXJpbWVudCBMaWZlY3ljbGUgLSBPdXRwdXQgUmVzcG9uc2VzXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG5cblRyaWFscy5mb3JjZU91dHB1dFJlc3BvbnNlcyA9IGZ1bmN0aW9uKCl7XG4gICAgY29uc29sZS5sb2coXCJGb3JjaW5nIG91dHB1dCBvZiBfcmVzcG9uc2VzXCIpO1xuICAgIF9vdXRwdXRSZXNwb25zZXMoX3Jlc3BvbnNlcywgdHJ1ZSk7XG59O1xuXG5cbmV4cG9ydCBmdW5jdGlvbiBfb3V0cHV0UmVzcG9uc2VzKGFsbFJlc3BvbnNlcywgbG9nKSB7XG5cbiAgICBpZiAoYWxsUmVzcG9uc2VzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgdmFyIGNzdlN0cmluZyA9IFwiXCI7XG5cbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGFsbFJlc3BvbnNlc1swXSk7XG4gICAgLyoqVGhlc2UgYXJlIGFsbCB0aGUgY29sdW1ucyBpbiB0aGUgb3V0cHV0Ki9cblxuICAgIC8qKiBNYWtlIHRoZSBoZWFkZXIqL1xuICAgIGNzdlN0cmluZyArPSBcIlBhcnRpY2lwYW50IE5hbWUsIFBhcnRpY2lwYW50IE51bWJlciwgXCI7IC8vTWFudWFsbHkgYWRkIGhlYWRlclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjc3ZTdHJpbmcgKz0ga2V5c1tpXSArIFwiLFwiO1xuICAgIH1cbiAgICBjc3ZTdHJpbmcgPSBjc3ZTdHJpbmcuc2xpY2UoMCwgLTEpICsgXCJcXG5cIjsvL0N1dCB0cmFpbGluZyBjb21tYSBhbmQgcHV0IGluIGEgbmV3IHJvdy9saW5lXG5cbiAgICAvKiogRmlsbCB0aGUgZGF0YSAtIFRoaXMgdGltZSBpdHMgYW4gYXJyYXkgb2YgYXJyYXlzIG5vdCBhcnJheSBvZiBkaWN0aW9uYXJpZXMgKi9cbiAgICBmb3IgKGkgPSAwOyBpIDwgYWxsUmVzcG9uc2VzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgY3N2U3RyaW5nICs9IF9wcHROYW1lICsgXCIsXCIgKyBfcHB0Tm8gKyBcIixcIjsgLy9NYW5hdWxseSBhZGQgY29udGVudFxuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwga2V5cy5sZW5ndGg7IGorKykgeyAvL0l0ZXJhdGUgb3ZlciB0aGUga2V5cyB0byBnZXQgdGVoIHZhbHVlc1xuXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBhbGxSZXNwb25zZXNbaV1ba2V5c1tqXV07XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIndyaXRpbmcgdGhpcyByYXcgdmFsdWUgXCIsIHZhbHVlLCBrZXlzW2pdKTtcbiAgICAgICAgICAgIC8vdmFsdWUgPSBjaGVja1JldHVyblByb3BzKCB2YWx1ZSwgdHJ1ZSApIHx8IHZhbHVlOyAgLy9QYXJzZSBvdXQgcmVsZXZhbnQgb2JqZWN0IGZpZWxkc1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIkFmZXIgaXQgd2FzIHBhcnNlZDpcIiwgdmFsdWUsIFwiXFxuKioqKioqKioqXCIpO1xuICAgICAgICAgICAgY3N2U3RyaW5nICs9IHZhbHVlICsgXCIsXCI7XG4gICAgICAgIH1cblxuICAgICAgICBjc3ZTdHJpbmcgPSBjc3ZTdHJpbmcuc2xpY2UoMCwgLTEpICsgXCJcXG5cIjsgLy9DdXQgdHJhaWxpbmcgY29tbWEgYW5kIHB1dCBpbiBhIG5ldyByb3cvbGluZVxuICAgIH1cblxuICAgIGlmIChsb2cpIHtcbiAgICAgICAgY29uc29sZS5sb2coY3N2U3RyaW5nKTtcbiAgICB9XG5cbiAgICAvKiogSGVscCBvdXQgYSBtYWNoaW5lIHRvZGF5Ki9cbiAgICB2YXIgY3N2Q29udGVudCA9IGVuY29kZVVSSShcImRhdGE6dGV4dC9jc3Y7Y2hhcnNldD11dGYtOCxcIiArIGNzdlN0cmluZyk7XG4gICAgdmFyIGEgPSBjcmVhdGVEb3dubG9hZExpbmsoXCJyZXN1bHRzIChcIiArIF9wcHROYW1lICsgXCIsXCIgKyBfcHB0Tm8udG9TdHJpbmcoKSArIFwiKS5jc3ZcIiwgY3N2Q29udGVudCk7XG4gICAgYS5pbm5lckhUTUwgPSBcIjxoND5DbGljayB0byBkb3dubG9hZCByZXN1bHRzITwvaDQ+XCI7XG4gICAgYS5jbGFzc05hbWUgKz0gXCIgcmVzdWx0cy1kb3dubG9hZFwiO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYSk7XG4gICAgYS5jbGljaygpO1xufVxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGthaSBvbiA2LzcvMTcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRDU1NPbkVsZW1lbnQoZWxlbSwgY3NzKXtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGNzcyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgdmFyIGF0dHJpYnV0ZSA9IGtleXNbaV07XG4gICAgICAgIGVsZW0uc3R5bGVbYXR0cmlidXRlXSA9IGNzc1thdHRyaWJ1dGVdO1xuICAgIH1cbn1cbiIsIlxuXG5pbXBvcnQgeyBfc2V0U2hvdWxkUnVuTmV4dFRyaWFsIH0gZnJvbSBcIi4vUnVuRXhwZXJpbWVudC5qc1wiOyAvLyBfc2hvdWxkUnVuTmV4dFRyaWFsLFxuaW1wb3J0IHsgU2V0Q1NTT25FbGVtZW50IH0gZnJvbSBcIi4uL3V0aWxzL1NldENTU09uRWxlbWVudC5qc1wiO1xuXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJbnRlcnN0aW11bHVzIFBhdXNlIC0gY3JlYXRpb25cbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cblxuZnVuY3Rpb24gX2NyZWF0ZUludGVyc3RpbXVsdXNQYXVzZSgpe1xuICAgIHZhciBibGFja291dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgYmxhY2tvdXQuaWQgPSBcImludGVyc3RpbXVsdXMtcGF1c2VcIjtcblxuICAgIHZhciBjc3MgPSB7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTZXQgYmxhY2tvdXQgc3R5bGVcbiAgICAgICAgcG9zaXRpb246IFwiZml4ZWRcIixcbiAgICAgICAgbGVmdDogMCxcbiAgICAgICAgdG9wOiAwLFxuICAgICAgICB3aWR0aDogXCIxMDB2d1wiLFxuICAgICAgICBoZWlnaHQ6IFwiMTAwdmhcIixcbiAgICAgICAgYmFja2dyb3VuZDogXCJibGFja1wiLFxuICAgICAgICBkaXNwbGF5OiBcIm5vbmVcIiAgICAgICAgICAgICAgICAgICAgIC8vIGJsb2NrIHdoZW4gdmlzaWJsZVxuICAgIH07XG5cblxuICAgIFNldENTU09uRWxlbWVudChibGFja291dCwgY3NzKTtcbiAgICAvLyB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGNzcyk7XG4gICAgLy8gZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKXtcbiAgICAvLyAgICAgdmFyIGF0dHJpYnV0ZSA9IGtleXNbaV07XG4gICAgLy8gICAgIGJsYWNrb3V0LnN0eWxlW2F0dHJpYnV0ZV0gPSBjc3NbYXR0cmlidXRlXTtcbiAgICAvLyB9XG5cbiAgICByZXR1cm4gYmxhY2tvdXQ7XG59XG5cbnZhciBfYmxhY2tPdXQgPSBfY3JlYXRlSW50ZXJzdGltdWx1c1BhdXNlKCk7XG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKF9ibGFja091dCk7XG5cblxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSW50ZXJzdGltdWx1cyBQYXVzZSAtIHVzZVxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuXG52YXIgUGF1c2UgPSB7fTtcblxuUGF1c2Uuc2hvd0ludGVyc3RpbXVsdXNQYXVzZSA9IGZ1bmN0aW9uIChkdXJhdGlvbikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIF9pbnRlcnN0aW11bHVzUGF1c2UoZHVyYXRpb24pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cbnZhciBfcGF1c2UgPSA1MDA7XG5QYXVzZS5zZXRQYXVzZVRpbWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09IHBhcnNlSW50KHZhbHVlLCAxMCkpIHtcbiAgICAgICAgX3BhdXNlID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgXCJzZXRQYXVzZVRpbWUgb25seSB0YWtlcyBpbnRlZ2Vyc1wiO1xuICAgIH1cbn07XG5cbmV4cG9ydCB2YXIgX3Nob3VsZEludGVyc3RpbXVsdXNQYXVzZSA9IHRydWU7ICAgICAgICAgICAgICAgICAgICAgICAgLy91c2VkIGluOiBSdW5FeHBlcmltZW50LmpzXG5QYXVzZS5zZXRTaG91bGRJbnRlcnN0aW11bHVzUGF1c2UgPSBmdW5jdGlvbih2YWx1ZSl7XG4gICAgaWYgKHR5cGVvZiAgdmFsdWUgPT09IFwiYm9vbGVhblwiKXtcbiAgICAgICAgX3Nob3VsZEludGVyc3RpbXVsdXNQYXVzZSA9IHZhbHVlO1xuICAgIH1cbn07XG5cblxuXG52YXIgX2lzSW50ZXJzdGltdWx1c1BhdXNlID0gZmFsc2U7XG5leHBvcnQgZnVuY3Rpb24gX2ludGVyc3RpbXVsdXNQYXVzZShkdXJhdGlvbikgeyAgICAgICAgICAgICAgICAgICAgIC8vIHVzZWQgaW46IFJ1bkV4cGVyaW1lbnQuanNcblxuICAgIGR1cmF0aW9uID0gZHVyYXRpb24gPT09IHVuZGVmaW5lZCA/IF9wYXVzZSA6IGR1cmF0aW9uOyAgICAgICAgICAvL0RlZmF1bHQgdG8gcGF1c2UgdGltZSB1bmxlc3MgYW4gYXJndW1lbnQgaXMgc3VwcGxpZWRcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG5cbiAgICAgICAgaWYgKCFfc2hvdWxkSW50ZXJzdGltdWx1c1BhdXNlKSByZWplY3QoKTsgICAgICAgICAgICAgICAgICAgLy8gRG9udCBzaG93IHRoZSBwYXVzZSBpZiBpdCBoYXNudCBiZWVuIHNldC4gVGhpcyBjaGVjayBpcyBhbHNvIHBlcmZvcm1lZCBpbiBSdW5FeHBlcmltZW50LmpzXG5cbiAgICAgICAgX3Nob3dJbnRlcnN0aW11bHVzUGF1c2UoX2JsYWNrT3V0KTtcbiAgICAgICAgX2lzSW50ZXJzdGltdWx1c1BhdXNlID0gdHJ1ZTtcbiAgICAgICAgX3NldFNob3VsZFJ1bk5leHRUcmlhbChmYWxzZSk7XG5cbiAgICAgICAgLyogUHJldmVudCBidXR0b24gbWFzaGluZyB3aGlsZSB0aGUgcGF1c2UgcnVucyAqL1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgX2hpZGVJbnRlcnN0aW11bHVzUGF1c2UoX2JsYWNrT3V0KTtcbiAgICAgICAgICAgIF9pc0ludGVyc3RpbXVsdXNQYXVzZSA9IGZhbHNlO1xuICAgICAgICAgICAgX3NldFNob3VsZFJ1bk5leHRUcmlhbCh0cnVlKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDYW5ub3QgcmVhc3NpZ24gaW1wb3J0ZWQgdmFsdWVzLCBzbyB5b3UgbmVlZCBhIHNldHRlclxuXG4gICAgICAgICAgICByZXNvbHZlKCk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByb21pc2UgaGFzIHJlc29sdmVkIGhlcmVcbiAgICAgICAgfSwgZHVyYXRpb24pO1xuICAgIH0pO1xufVxuXG5cbmZ1bmN0aW9uIF9oaWRlSW50ZXJzdGltdWx1c1BhdXNlKGJsYWNrb3V0KXtcbiAgICBibGFja291dC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG59XG5cbmZ1bmN0aW9uIF9zaG93SW50ZXJzdGltdWx1c1BhdXNlKGJsYWNrb3V0KXtcbiAgICBibGFja291dC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xufVxuXG5leHBvcnQgeyBQYXVzZSB9OyIsIi8qKlxuICogQ3JlYXRlZCBieSBrYWkgb24gNi83LzE3LlxuICovXG5cblxuZXhwb3J0IGZ1bmN0aW9uIF9BcHBseUZ1bmN0aW9uVG9IVE1MQ2hpbGRyZW4oZWxlbSwgZnVuYyl7XG5cbiAgICBpZiAoZWxlbS5jaGlsZHJlbiA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBmdW5jICE9PSBcImZ1bmN0aW9uXCIgKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiX0FwcGx5RnVuY3Rpb25Ub0NoaWxkcmVuIGFjY2VwdHMgYXJncyAoaHRtbF9lbGVtZW50LCBmdW5jKVwiKTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMCA7IGkgPCBlbGVtLmNoaWxkcmVuLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgZnVuYyhlbGVtLmNoaWxkcmVuW2ldKTtcbiAgICB9XG59IiwiXG4vLyBSdW5FeHBlcmltZW50LmpzXG4vLyBBZGQgY29yZSBmdW5jdGlvbmFsaXR5IGZhY2lsaXRhdGluZyB0aGUgZXhwZXJpbWVudGFsIGxpZmUgY3ljbGUgdG8gdGhlIFRyaWFscyBPYmplY3QuXG4vLyBTdWNoIGFzOlxuLy8gICAgICAtIEdldHRpbmcgcGFydGljaXBhbnQgaW5mb1xuLy8gICAgICAtIFJ1bm5pbmcgdGhlIG5leHQgdHJpYWwgKHNldHRpbmcgSVZzIGV0Yylcbi8vICAgICAgLSBTdG9yaW5nIGEgcmVzcG9uc2Vcbi8vICAgICAgLSBPdXRwdXR0aW5nIHJlc3BvbnNlc1xuLy8gICAgICAtIE1pZC9lbmQgY2FsbGJhY2tzXG5cblxuaW1wb3J0IHsgVHJpYWxzLCBzZXRGdW5jcywgX2FsbFRyaWFscywgX2RpZEJ1aWxkVHJpYWxzLCBfZHZOYW1lIH0gZnJvbSBcIi4vVHJpYWxzLmpzXCI7XG5pbXBvcnQgeyBfc3RvcmVSZXNwb25zZSwgX3Jlc3BvbnNlcyB9IGZyb20gXCIuL1Jlc3BvbnNlSGFuZGxlci5qc1wiO1xuaW1wb3J0IHsgX291dHB1dFJlc3BvbnNlcyB9IGZyb20gXCIuL091dHB1dFJlc3BvbnNlcy5qc1wiO1xuaW1wb3J0IHsgX2ludGVyc3RpbXVsdXNQYXVzZSwgX3Nob3VsZEludGVyc3RpbXVsdXNQYXVzZSB9IGZyb20gXCIuL0ludGVyc3RpbXVsdXNQYXVzZS5qc1wiO1xuaW1wb3J0IHsgZ2V0UGFyYW1OYW1lcyB9IGZyb20gXCIuLi91dGlscy9TdHJpbmdVdGlscy5qc1wiO1xuaW1wb3J0IHsgX0FwcGx5RnVuY3Rpb25Ub0hUTUxDaGlsZHJlbiB9IGZyb20gXCIuLi91dGlscy9ET01VdGlscy5qc1wiO1xuXG5cbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgIEV4cGVyaW1lbnQgTGlmZWN5Y2xlIC0gU3RhcnQgJiBHYW1lIExvb3Bcbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cblxuLy9DYW5ub3QgcmVhc3NpZ24gaW1wb3J0ZWQgdmFsdWVzLCBzbyB5b3UgbmVlZCBhIHNldHRlciAodXNlZCBpbiBJbnRlcnN0aW1sdXNQYXVzZS5qcylcbmV4cG9ydCBmdW5jdGlvbiBfc2V0U2hvdWxkUnVuTmV4dFRyaWFsKHZhbHVlKXtcbiAgICBpZiAodHlwZW9mKHZhbHVlKSA9PT0gXCJib29sZWFuXCIpe1xuICAgICAgICBfc2hvdWxkUnVuTmV4dFRyaWFsID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY2Fubm90IHNldCBfc2hvdWxkUnVuTmV4dFRyaWFsIHRvIGEgbm9uIGJvb2xlYW4gdmFsdWVcIik7XG4gICAgfVxufVxuXG5leHBvcnQgdmFyIF9zaG91bGRSdW5OZXh0VHJpYWwgPSB0cnVlOyAvL3VzZWQgYnk6IEludGVyc3RpbXVsdXNQYXVzZS5qc1xuVHJpYWxzLnJ1bk5leHRUcmlhbCA9IGZ1bmN0aW9uIChzZXR0aW5ncykgeyAvLyB1c2FnZSAtPiBydW5OZXh0VHJpYWwoe3Nob3VsZFN0b3JlUmVzcG9uc2U6IHRydWUsIGR2X3ZhbHVlOiBcImluc2lkZVwifSk7XG5cbiAgICBpZiAoIV9kaWRCdWlsZFRyaWFscyl7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcInJ1bk5leHRUcmlhbCgpOiBUcmlhbCB3ZXJlIG5vdCBidWlsdFwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChfc2hvdWxkUnVuTmV4dFRyaWFsKSB7XG5cbiAgICAgICAgLy8gVE9ETzogQ2hhbmdlIHRoZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgbWlkIGNhbGxiYWNrIC0gSnVzdCBjaGVjayB0aGUgbGVuZ3RoIG9mIHRoZSBfcmVzcG9uc2VzIGFycmF5IHZzIHRoZSBhbGx0cmlhbHMgYXJyYXkuLlxuXG4gICAgICAgIGlmIChfc2hvdWxkUnVuTWlkQ2FsbGJhY2soKSAmJiBfbWlkQ2FsbGJhY2sgIT09IG51bGwpIHtcbiAgICAgICAgICAgIF9taWRDYWxsYmFjaygpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF9zaG91bGRJbnRlcnN0aW11bHVzUGF1c2UpIHtcbiAgICAgICAgICAgIF9pbnRlcnN0aW11bHVzUGF1c2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZXR0aW5ncyAhPT0gdW5kZWZpbmVkICYmIHNldHRpbmdzLmhhc093blByb3BlcnR5KFwic2hvdWxkU3RvcmVSZXNwb25zZVwiKSAmJiBzZXR0aW5ncy5zaG91bGRTdG9yZVJlc3BvbnNlKSB7XG4gICAgICAgICAgICBfc3RvcmVSZXNwb25zZShzZXR0aW5ncyk7IC8vU2V0dGluZ3MgY29udGFpbnMgYSBmaWVsZCBcImR2X3ZhbHVlXCIgd2hpY2ggaXMgYWxzbyByZWFkIGJ5IF9zdG9yZVJlc3BvbnNlXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoX2FsbFRyaWFscy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBfZGlzcGxheU5leHRUcmlhbCgpO1xuXG4gICAgICAgICAgICAvLyBfY3VyMkFGQ0lzVGFyZ2V0ID0gdHJ1ZTtcbiAgICAgICAgICAgIC8qKiBBbHdheXMgcmVzZXQgdGhlIDJBRkMgdmFsdWUqL1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlRoZXJlIGFyZSBcIiwgX2FsbFRyaWFscy5sZW5ndGgsIFwiIHRyaWFscyByZW1haW5pbmcuXCIpO1xuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAvL1Bvc3NpYmx5IHRvbyBkZXN0cnVjdGl2ZVxuICAgICAgICAgICAgLy8gJChkb2N1bWVudC5ib2R5KS5jaGlsZHJlbigpLmZhZGVPdXQoKTtcbiAgICAgICAgICAgIF9BcHBseUZ1bmN0aW9uVG9IVE1MQ2hpbGRyZW4oZG9jdW1lbnQuYm9keSwgZnVuY3Rpb24oY2hpbGQpe1xuICAgICAgICAgICAgICAgIGNoaWxkLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBfb3V0cHV0UmVzcG9uc2VzKF9yZXNwb25zZXMpO1xuXG4gICAgICAgICAgICBpZiAoIHR5cGVvZiBfZW5kQ2FsbEJhY2sgPT09IFwiZnVuY3Rpb25cIikgX2VuZENhbGxCYWNrKCk7XG5cbiAgICAgICAgfVxuICAgIH1cblxufTtcblxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuLy8gICAgICAgICAgICAgICAgICBFeHBlcmltZW50IExpZmVjeWNsZSAtIE1pZCBQb2ludCBDYWxsYmFjayAoaS5lLiB0aGUgXCJ0YWtlIGEgYnJlYWtcIiBtZXNzYWdlKVxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuXG5cbnZhciBfbWlkQ2FsbGJhY2sgPSBudWxsO1xuVHJpYWxzLnNldE1pZENhbGxiYWNrID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKXtcbiAgICAgICAgX21pZENhbGxiYWNrID0gdmFsdWU7XG4gICAgfSAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJPbmx5IGZ1bmN0aW9ucyBtYXkgYmUgYXNzaWduZWQgdG8gdGhlIGVuZCBjYWxsYmFja1wiKTtcbiAgICB9XG59O1xuXG52YXIgX2RpZFJ1bk1pZENhbGxiYWNrID0gZmFsc2U7XG5mdW5jdGlvbiBfc2hvdWxkUnVuTWlkQ2FsbGJhY2soKSB7XG4gICAgaWYgKF9kaWRSdW5NaWRDYWxsYmFjaykgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy9NaWQgcG9pbnQgPSB0aGVyZSBhcmUgYXMgbWFueSByZXNwb25zZXMgYXMgdHJpYWxzIChvciBhIGRpZmZlcmVuY2Ugb2Ygb25lIGZvciBvZGQgbnVtYmVyIG9mIHRyaWFscylcbiAgICBpZiAoX2FsbFRyaWFscy5sZW5ndGggPT09X3Jlc3BvbnNlcy5sZW5ndGggfHwgTWF0aC5hYnMoX2FsbFRyaWFscy5sZW5ndGggLV9yZXNwb25zZXMubGVuZ3RoKSA9PT0gMSl7XG4gICAgICAgIF9kaWRSdW5NaWRDYWxsYmFjayA9IHRydWU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cblxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuLy8gICAgICAgICAgICAgRXhwZXJpbWVudCBMaWZlY3ljbGUgLSBFbmQgQ2FsbGJhY2sgKGEgYmVoYXZpb3VyIGF0IHRoZSBlbmQgb2YgdGhlIGV4cGVyaW1lbnQpXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG52YXIgX2VuZENhbGxCYWNrID0gbnVsbDtcblRyaWFscy5zZXRFbmRDYWxsYmFjayA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIil7XG4gICAgICAgIF9lbmRDYWxsQmFjayA9IHZhbHVlO1xuICAgIH0gICBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiT25seSBmdW5jdGlvbnMgbWF5IGJlIGFzc2lnbmVkIHRvIHRoZSBlbmQgY2FsbGJhY2tcIik7XG4gICAgfVxufTtcblxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBFeHBlcmltZW50IExpZmVjeWNsZSAtIERpc3BsYXlpbmcgVGhlIE5leHQgVHJpYWxcbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cblxuLyoqIFdoZXJlIHZpZXctbGV2ZWwgZWxlbWVudHMgYXJlIHNldCAtIHRoaXMgaXMgbGlrZSB0aGUgQ09OVFJPTExFUiBtZXRob2QgaW50ZXJmYWNpbmcgYmV0d2VlbiBNT0RFTCBhbmQgVklFVyovXG5mdW5jdGlvbiBfZGlzcGxheU5leHRUcmlhbCgpIHtcbiAgICB2YXIgbmV4dFRyaWFsID0gX2FsbFRyaWFsc1tfYWxsVHJpYWxzLmxlbmd0aCAtIDFdOyAvL0Fsd2F5cyBnbyBmcm9tIHRoZSBiYWNrXG4gICAgY29uc29sZS5sb2coXCJEaXNwbGF5aW5nIG5leHQgdHJpYWw6XCIsIG5leHRUcmlhbCk7XG5cbiAgICAvKiogSXRlcmF0ZSBvdmVyIGVhY2ggSVYgYW5kIHNldCBpdHMgcG9pbnRlciB0byBpdHMgdmFsdWUgZm9yIHRoYXQgdHJpYWwgKi9cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5leHRUcmlhbC5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgY3VyX2l2ID0gbmV4dFRyaWFsW2ldO1xuICAgICAgICBfZmlyZUlWU2V0RnVuY1dpdGhBcmdzKGN1cl9pdik7XG5cbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfZmlyZUlWU2V0RnVuY1dpdGhBcmdzKGN1cl9pdikge1xuXG4gICAgLyoqIFVzaW5nIGEgRlVOQ1RJT04gdG8gc2V0IHRoZSBkaXNwbGF5Ki9cbiAgICBpZiAoIHNldEZ1bmNzW2N1cl9pdi5kZXNjcmlwdGlvbl0gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgc2V0RnVuY3NbY3VyX2l2LmRlc2NyaXB0aW9uXS5hcHBseShudWxsLCBjdXJfaXYudmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIHNldHRlciBmdW5jdGlvbiBzdXBwbGllZCBieTogXCIgKyBjdXJfaXYpO1xuICAgIH1cbn1cblxuIiwiLyogPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cbiAqXG4gKiAgIFN0b3JlIHJlcHNvbnNlcyBpbiBsb2NhbFN0b3JhZ2UuXG4gKiAgIExvY2Fsc3RvcmFnZSBjb252ZXJ0cyBldmVyeXRoaW5nIHRvIEpTT04gc28gb2JqZWN0IHR5cGVzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZCB3aWxsIGJlIGxvc3RcbiAqICAgVG8gcHJlc2VydmUgdGhlc2UgdW5jb252ZXJ0YmxlIGRhdGEsIHlvdSBuZWVkIHRvIHNwZWNpZnkgYSBQQVJTRVIgYW5kIFVOUEFSU0VSIGZvciB0cmlhbHMgYW5kIGZvciByZXNwb25zZXNcbiAqICAgT24gU2F2ZTogdGhlIHNldHRlciByZXBsYWNlcyB0aGUgdW5jb252ZXJ0aWJsZSBkYXRhIHdpdGggYSB0b2tlblxuICogICBPbiBMb2FkOiBUaGUgZ2V0dGVyIGNoZWNrcyB0aGUgdG9rZW4gYW5kIHJlcGxhY2VzIGl0IHdpdGggdGhlIGNvcnJlY3QgdW5jb252ZXJ0aWJsZSBvYmplY3QuXG4gKlxuICogID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ICovXG5cblxuaW1wb3J0IHsgVHJpYWxzLF9hbGxUcmlhbHMsIF9zZXRBbGxUcmlhbHMsIF9kaWRCdWlsZFRyaWFsc30gZnJvbSBcIi4vVHJpYWxzLmpzXCI7XG5pbXBvcnQgeyBfcmVzcG9uc2VzLCBfc2V0UmVzcG9uc2VzIH0gZnJvbSBcIi4vUmVzcG9uc2VIYW5kbGVyLmpzXCI7XG5pbXBvcnQgeyBTZXRDU1NPbkVsZW1lbnQgfSBmcm9tIFwiLi4vdXRpbHMvU2V0Q1NTT25FbGVtZW50LmpzXCI7XG5cbnZhciBTYXZlcyA9IHt9O1xuXG4vLyBUT0RPOiBTZXQgdGhlc2UgdG8gdGVtcF90cmlhbF9wYXJzZXJcblNhdmVzLnBhcnNlVHJpYWxzRm9yU2F2aW5nID0gdW5kZWZpbmVkOyAgICAgICAgICAgICAgICAgICAgIC8vaW50ZXJmYWNlIGlzIGZ1bmN0aW9uKF9hbGxUcmlhbHMpey4uLn0gcmV0dXJuIGEgcGFyc2VkIGNvcHkgb2YgYG1vZGlmaWVkYCBfYWxsVHJpYWxzXG5TYXZlcy5wYXJzZVJlc3BvbnNlc0ZvclNhdmluZyA9IHVuZGVmaW5lZDsgICAgICAgICAgICAgICAgICAvL2ludGVyZmFjZSBpcyBmdW5jdGlvbihfcmVzcG9uc2VzKXsuLi59IHJldHVybiBhIHBhcnNlZCBjb3B5IG9mIGBtb2RpZmllZGAgX3Jlc3BvbnNlc1xuU2F2ZXMudW5wYXJzZVNhdmVkVHJpYWxzID0gdW5kZWZpbmVkO1xuU2F2ZXMudW5wYXJzZVNhdmVkUmVzcG9uc2VzID0gdW5kZWZpbmVkO1xuXG4vLyBUT0RPOiB3cml0ZSBhIGRlZmF1bHQgcGFyc2VyIHRoYXQgY2hlY2tzIHdoZXRoZXIgYW4gb2JqZWN0IGNhbiBiZSBzZXJpYWxpc2VkLiBJZiBub3QgdGhyb3cgYW4gZXJyb3IgdGhhdCByZXF1ZXN0cyBhIHNlcmlhbGlzZXIgdG8gYmUgd3JpdHRlblxuZnVuY3Rpb24gdGVtcF90cmlhbF9wYXJzZXIoYWxsVHJpYWxzLCBlcnIpe1xuXG4gICAgLy8gQ2hlY2sgZm9yIHRoZSBwcmVzZW5jZSBvZiB1bmRlZmluZWQsIGZ1bmN0aW9uLCBzeW1ib2wgPT4gdGhlc2UgY2F1c2UgdGhlIEpTT04uc3RyaW5naWZ5IGZ1bmMgdG8gZmFpbFxuICAgIGFsbFRyaWFscy5tYXAoZnVuY3Rpb24oZWxlbSwgaSwgYWxsKXtcbiAgICAgICAgdmFyIGN1cl9jaGlsZF9lbGVtID0gZWxlbTsgLy8gUmVjdXJzZSBvdmVyIGVsZW1lbnRzIGFuZCBjaGVjayB0aGVtIGZvciB0aGUgYmFkIGRhdGF0eXBlc1xuICAgICAgICBpZiAodHlwZW9mIGN1cl9jaGlsZF9lbGVtID09PSBcImZ1bmN0aW9uXCIgfHwgY3VyX2NoaWxkX2VsZW0gPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBhbGxUcmlhbHM7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENhbiBiZSBzYWZlbHkgc2VyaWFsaXNlZFxufVxuXG5mdW5jdGlvbiBlcnJvckNoZWNrU2F2aW5nUGFyc2Vycygpe1xuICAgIGlmIChTYXZlcy5wYXJzZVRyaWFsc0ZvclNhdmluZyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgcmVzdG9yZSB0cmlhbHMgd2l0aG91dCBwYXJzaW5nIGZ1bmN0aW9uXCIpO1xuICAgIGlmIChTYXZlcy5wYXJzZVJlc3BvbnNlc0ZvclNhdmluZyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgcmVzdG9yZSBfcmVzcG9uc2VzIHdpdGhvdXQgcGFyc2luZyBmdW5jdGlvblwiKTtcbiAgICBpZiAoU2F2ZXMudW5wYXJzZVNhdmVkVHJpYWxzID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCByZXN0b3JlIHRyaWFscyB3aXRob3V0IFVOcGFyc2luZyBmdW5jdGlvblwiKTtcbiAgICBpZiAoU2F2ZXMudW5wYXJzZVNhdmVkUmVzcG9uc2VzID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCByZXN0b3JlIF9yZXNwb25zZXMgd2l0aG91dCBVTnBhcnNpbmcgZnVuY3Rpb25cIik7XG59XG5cblNhdmVzLmNsZWFyU2F2ZXMgPSBmdW5jdGlvbigpe1xuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwiZXhwZXJpbWVudEpTc2F2ZXNcIik7XG59O1xuXG5TYXZlcy5zYXZlQnVpbHRUcmlhbHNBbmRSZXNwb25zZXMgPSBmdW5jdGlvbigpIHtcblxuICAgIGVycm9yQ2hlY2tTYXZpbmdQYXJzZXJzKCk7XG5cbiAgICBpZiAodHlwZW9mKFN0b3JhZ2UpICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cbiAgICAgICAgLy8gbG9jYWxTdG9yYWdlLmV4cGVyaW1lbnRKU3NhdmVzID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIHZhciB0cmlhbHNGb3JTYXZpbmcgPSBTYXZlcy5wYXJzZVRyaWFsc0ZvclNhdmluZyhfYWxsVHJpYWxzKTsgICAgICAgICAgICAgICAgICAgLy9QYXJzZSB5b3VyIHRyaWFscywgdXNpbmcgdGhlIGN1c3RvbSBzZXJpYWxpemVyLi5cbiAgICAgICAgdmFyIHJlc3BvbnNlc0ZvclNhdmluZyA9IFNhdmVzLnBhcnNlUmVzcG9uc2VzRm9yU2F2aW5nKF9yZXNwb25zZXMpO1xuXG4gICAgICAgIHZhciBleHBlcmltZW50SlNzYXZlcyA9IHt9OyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9KU09OaWZ5IHRoZSB0cmlhbHMgYW5kIF9yZXNwb25zZXNcbiAgICAgICAgZXhwZXJpbWVudEpTc2F2ZXNbXCJ0cmlhbHNcIl0gPSB0cmlhbHNGb3JTYXZpbmc7XG4gICAgICAgIGV4cGVyaW1lbnRKU3NhdmVzW1wicmVzcG9uc2VzXCJdID0gcmVzcG9uc2VzRm9yU2F2aW5nO1xuXG4gICAgICAgIHZhciBtc2cgPSBwcm9tcHQoXCJBZGQgYSBtZXNzYWdlIHRvIHRoaXMgc2F2ZSFcIik7XG5cbiAgICAgICAgaWYgKG1zZyA9PT0gbnVsbCl7XG4gICAgICAgICAgICBhbGVydChcIlRyaWFscyB3aWxsIG5vdCBiZSBzYXZlZFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkYXRlS2V5ID0gKG5ldyBEYXRlKCkpLnRvVVRDU3RyaW5nKCk7IC8vVmVyeSBjbGVhciBkYXRlXG5cbiAgICAgICAgLy9NYWtlIGEgbmV3IGRpY3Rpb25hcnkgb3IgZ2V0IHRoZSBvbGQgb25lXG4gICAgICAgIHZhciBrZXllZF9ieV9kYXRlcyA9IChsb2NhbFN0b3JhZ2UuZXhwZXJpbWVudEpTc2F2ZXMgPT09IHVuZGVmaW5lZCkgPyB7fSA6IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmV4cGVyaW1lbnRKU3NhdmVzKTtcblxuICAgICAgICBrZXllZF9ieV9kYXRlc1ttc2cgKyBcIiAtIFwiICtkYXRlS2V5XSA9IGV4cGVyaW1lbnRKU3NhdmVzOyAgICAgICAgICAgICAgICAgICAgICAgLy9zYXZlIHRvIGl0XG5cbiAgICAgICAgbG9jYWxTdG9yYWdlLmV4cGVyaW1lbnRKU3NhdmVzID0gSlNPTi5zdHJpbmdpZnkoa2V5ZWRfYnlfZGF0ZXMpOyAgICAgICAgICAgICAgICAvL3NlcmlhbGl6ZSFcblxuICAgICAgICBjb25zb2xlLmxvZyhcIlNhdmVkIFRyaWFsc1wiLCBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5leHBlcmltZW50SlNzYXZlcykpO1xuICAgIH1cbn07XG5cblxuU2F2ZXMubG9hZFNhdmVkVHJpYWxzQW5kUmVzcG9uc2VzID0gZnVuY3Rpb24oKXtcbiAgICBcbiAgICBlcnJvckNoZWNrU2F2aW5nUGFyc2VycygpO1xuXG4gICAgdmFyIGV4cGVyaW1lbnRKU3NhdmVzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZXhwZXJpbWVudEpTc2F2ZXMpO1xuXG4gICAgY29uc29sZS5sb2coXCJhbGwgc2F2ZXM6IFwiLCBleHBlcmltZW50SlNzYXZlcyk7XG5cblxuICAgIHZhciBzZWxlY3RfZHJvcGRvd25fY29tcG9uZW50cyA9IF9jcmVhdGVEcm9wRG93blNlbGVjdChleHBlcmltZW50SlNzYXZlcyk7ICAgICAgICAgIC8vIERpc3BsYXkgdGhlIHNhdmVzIGluIGEgZHJvcGRvd24gc2VsZWN0XG5cbiAgICBzZWxlY3RfZHJvcGRvd25fY29tcG9uZW50cy5idXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7ICAgICAgICAgICAgLy8gVE9ETyByZWltcGxlbWVudCBhcyBhIGpzIG9uQ2xpY2sgZXZlbnQgaGFuZGxlclxuXG4gICAgICAgIC8vIHZhciBzYXZlc19mcm9tX3NlbGVjZWRfZGF0ZSA9IHNlbGVjdF9kcm9wZG93bl9jb21wb25lbnRzLnNlbGVjdC5maW5kKFwiOnNlbGVjdGVkXCIpLnRleHQoKTtcbiAgICAgICAgdmFyIHNlbGVjdCA9IHNlbGVjdF9kcm9wZG93bl9jb21wb25lbnRzLnNlbGVjdDtcbiAgICAgICAgdmFyIHNhdmVzX2Zyb21fc2VsZWNlZF9kYXRlID0gc2VsZWN0Lm9wdGlvbnNbc2VsZWN0LnNlbGVjdGVkSW5kZXhdLnRleHQ7XG5cbiAgICAgICAgc2F2ZXNfZnJvbV9zZWxlY2VkX2RhdGUgPSBleHBlcmltZW50SlNzYXZlc1tzYXZlc19mcm9tX3NlbGVjZWRfZGF0ZV07XG5cbiAgICAgICAgX3NldEFsbFRyaWFscyggU2F2ZXMudW5wYXJzZVNhdmVkVHJpYWxzKCBzYXZlc19mcm9tX3NlbGVjZWRfZGF0ZVtcInRyaWFsc1wiXSkgKTsgICAgICAgICAgICAgICAgLy8gVW5wYXJzZSB5b3VyIHRyaWFscyB1c2luZyBjdXN0b20gdW5zZXJpYWxpc2VyXG4gICAgICAgIF9zZXRSZXNwb25zZXMoIFNhdmVzLnVucGFyc2VTYXZlZFJlc3BvbnNlcyggc2F2ZXNfZnJvbV9zZWxlY2VkX2RhdGVbXCJyZXNwb25zZXNcIl0pICk7XG4gICAgICAgIGlmIChfcmVzcG9uc2VzID09PSB1bmRlZmluZWQgfHwgX3Jlc3BvbnNlcyA9PT0gbnVsbCkgX3NldFJlc3BvbnNlcyggW10gKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhcInJlc3RvcmVkIGFsbCB0cmlhbHM6IFwiLCBfYWxsVHJpYWxzKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJyZXN0b3JlZCBhbGwgX3Jlc3BvbnNlczogXCIsIF9yZXNwb25zZXMpO1xuXG4gICAgICAgIFRyaWFscy5ydW5OZXh0VHJpYWwoKTtcblxuICAgICAgICAvL1JlbW92ZSBzZWxlY3QgZnJvbSBkb21cblxuICAgICAgICAvLyBzZWxlY3RfZHJvcGRvd25fY29tcG9uZW50cy53cmFwLnJlbW92ZSgpO1xuICAgICAgICBzZWxlY3RfZHJvcGRvd25fY29tcG9uZW50cy53cmFwLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2VsZWN0X2Ryb3Bkb3duX2NvbXBvbmVudHMud3JhcCk7XG4gICAgfSk7XG5cbiAgICBzZWxlY3RfZHJvcGRvd25fY29tcG9uZW50cy5idXR0b25fY2xlYXIuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgaWYgKHdpbmRvdy5jb25maXJtKFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSBhbGwgc2F2ZWQgZXhwZXJpbWVudHM/XCIpKXtcbiAgICAgICAgICAgIFNhdmVzLmNsZWFyU2F2ZXMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vUmVtb3ZlIHNlbGVjdCBmcm9tIERPTVxuICAgICAgICAvLyBzZWxlY3RfZHJvcGRvd25fY29tcG9uZW50cy53cmFwLnJlbW92ZSgpO1xuICAgICAgICBzZWxlY3RfZHJvcGRvd25fY29tcG9uZW50cy53cmFwLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2VsZWN0X2Ryb3Bkb3duX2NvbXBvbmVudHMud3JhcCk7XG4gICAgfSk7XG5cbn07XG5cblxuXG4vLyBUT0RPOiBWZXJpZnkgdGhhdCBubyBqUXVlcnkgaXMgYmVpbmcgdXNlZCFcbmZ1bmN0aW9uIF9jcmVhdGVEcm9wRG93blNlbGVjdChhbGxfc2F2ZXMpe1xuXG4gICAgLy8gdmFyIHNhdmVzX2RpYWxvZ193cmFwID0gJChcIjxzYXZlc19kaWFsb2dfd3JhcD5cIiwge1xuICAgIC8vICAgICBpZDogXCJzYXZlZF9pbmZvXCJcbiAgICAvLyB9KTtcblxuICAgIHZhciBzYXZlc19kaWFsb2dfd3JhcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzYXZlc19kaWFsb2dfd3JhcFwiKTtcbiAgICBzYXZlc19kaWFsb2dfd3JhcC5pZCA9IFwic2F2ZWRfaW5mb1wiO1xuXG4gICAgLy9NYWtlIGEgc2VsZWN0IHRvIGNob29zZSBmcm9tIHRoZSBzYXZlc1xuICAgIC8vIHZhciBzZWwgPSAkKFwiPHNlbGVjdD5cIik7XG4gICAgdmFyIHNlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzZWxlY3RcIik7XG5cbiAgICBPYmplY3Qua2V5cyhhbGxfc2F2ZXMpLm1hcChmdW5jdGlvbihlbGVtLCBpLCBhbGwpe1xuXG4gICAgICAgIHZhciBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO1xuICAgICAgICBvcHRpb24udmFsdWUgPSBpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBVc2UgdGhlIGFsbF9zYXZlcyBpbmRleCBhcyB0aGUga2V5XG4gICAgICAgIG9wdGlvbi50ZXh0ID0gZWxlbTtcbiAgICAgICAgc2VsLmFwcGVuZENoaWxkKG9wdGlvbik7XG4gICAgICAgIC8vIHNlbC5hcHBlbmQoJChcIjxvcHRpb24+XCIpLmF0dHIoXCJ2YWx1ZVwiLGkpLnRleHQoZWxlbSkpO1xuICAgIH0pO1xuXG5cbiAgICAvL0J1dHRvbiAtIG5vIGZ1bmN0aW9uYWxpdHkgaGVyZSwganVzdCB2aWV3XG4gICAgLy8gdmFyIGIgPSAkKFwiPGJ1dHRvbj5cIikudGV4dChcIkNob29zZVwiKTtcbiAgICB2YXIgYiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgYi5pbm5lckhUTUwgPSBcIkNob29zZVwiO1xuXG5cbiAgICAvLyB2YXIgYl9jbGVhciA9ICQoXCI8YnV0dG9uPlwiKS50ZXh0KFwiQ2xlYXJcIik7XG4gICAgdmFyIGJfY2xlYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgIGJfY2xlYXIuaW5uZXJIVE1MID0gXCJDbGVhclwiO1xuXG5cbiAgICAvLyBzYXZlc19kaWFsb2dfd3JhcC5hcHBlbmQoc2VsKTtcbiAgICBzYXZlc19kaWFsb2dfd3JhcC5hcHBlbmRDaGlsZChzZWwpO1xuICAgIC8vIHNhdmVzX2RpYWxvZ193cmFwLmFwcGVuZCgkKFwiPGJyPlwiKSk7XG4gICAgc2F2ZXNfZGlhbG9nX3dyYXAuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJyXCIpKTtcbiAgICAvLyBzYXZlc19kaWFsb2dfd3JhcC5hcHBlbmQoYik7XG4gICAgc2F2ZXNfZGlhbG9nX3dyYXAuYXBwZW5kQ2hpbGQoYik7XG4gICAgLy8gc2F2ZXNfZGlhbG9nX3dyYXAuYXBwZW5kKGJfY2xlYXIpO1xuICAgIHNhdmVzX2RpYWxvZ193cmFwLmFwcGVuZENoaWxkKGJfY2xlYXIpO1xuICAgIC8vICQoZG9jdW1lbnQuYm9keSkuYXBwZW5kKHNhdmVzX2RpYWxvZ193cmFwKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNhdmVzX2RpYWxvZ193cmFwKTtcblxuICAgIHZhciBjc3MgPSB7XG4gICAgICAgIHBvc2l0aW9uOiBcImZpeGVkXCIsXG4gICAgICAgIHRvcDogXCI0NXZoXCIsXG4gICAgICAgIGxlZnQ6IFwiMjV2d1wiLFxuICAgICAgICB3aWR0aDogXCI1MHZ3XCIsXG4gICAgICAgIGhlaWdodDogXCI1dmhcIixcbiAgICAgICAgYmFja2dyb3VuZDogXCJ3aGl0ZVwiLFxuICAgICAgICBib3JkZXI6IFwiMnZ3XCIsXG4gICAgICAgIFwidGV4dC1hbGlnblwiOiBcImNlbnRlclwiXG4gICAgfTtcbiAgICBTZXRDU1NPbkVsZW1lbnQoc2F2ZXNfZGlhbG9nX3dyYXAsIGNzcyk7XG4gICAgLy8gc2F2ZXNfZGlhbG9nX3dyYXAuY3NzKHtcbiAgICAvLyAgICAgcG9zaXRpb246IFwiZml4ZWRcIixcbiAgICAvLyAgICAgdG9wOiBcIjQ1dmhcIixcbiAgICAvLyAgICAgbGVmdDogXCIyNXZ3XCIsXG4gICAgLy8gICAgIHdpZHRoOiBcIjUwdndcIixcbiAgICAvLyAgICAgaGVpZ2h0OiBcIjV2aFwiLFxuICAgIC8vICAgICBiYWNrZ3JvdW5kOiBcIndoaXRlXCIsXG4gICAgLy8gICAgIGJvcmRlcjogXCIydndcIixcbiAgICAvLyAgICAgXCJ0ZXh0LWFsaWduXCI6IFwiY2VudGVyXCJcbiAgICAvLyB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHNlbGVjdDogc2VsLFxuICAgICAgICBidXR0b246IGIsXG4gICAgICAgIGJ1dHRvbl9jbGVhcjogYl9jbGVhcixcbiAgICAgICAgd3JhcDogc2F2ZXNfZGlhbG9nX3dyYXBcbiAgICB9O1xufVxuXG5cbmV4cG9ydCB7IFNhdmVzIH07IiwiLy9PcmRlciBvZiBpbXBvcnRzIGlzIGltcG9ydGFudFxuXG4vLyBJbXBvcnQgVHJpYWxzIGFuZCBleHRlbmQgaXRcbmltcG9ydCB7IFRyaWFscyB9IGZyb20gIFwiLi9UcmlhbHMuanNcIjsgLy9OZWVkcyAuLyB0byB0cmVhdCBpdCBhcyBhbiBpbnRlcm5hbCAobm90IGV4dGVybmFsIGRlcGVuZGVuY3kpXG5pbXBvcnQgXCIuL1J1bkV4cGVyaW1lbnQuanNcIjsgICAgICAgICAgIC8vIEV4dGVuZHMgdGhlIGZ1bmN0aW9uYWxpdHkgb2YgdGhlIFRyaWFscyBvYmplY3RcbmltcG9ydCBcIi4vT3V0cHV0UmVzcG9uc2VzLmpzXCI7XG5pbXBvcnQgXCIuL0dldFBwdEluZm8uanNcIjtcbi8vaW1wb3J0IFwiLi8yQUZDLmpzXCI7XG5cbmltcG9ydCB7IFBhdXNlIH0gZnJvbSAgXCIuL0ludGVyc3RpbXVsdXNQYXVzZS5qc1wiO1xuaW1wb3J0IHsgU2F2ZXMgfSBmcm9tIFwiLi9TYXZlcy5qc1wiO1xuXG4vL1RoZXNlIGFyZSB0aGUgZmllbGRzIG9mIEV4cGVyaW1lbnRKU1xuZXhwb3J0IHsgVHJpYWxzIH07XG5leHBvcnQgeyBQYXVzZSB9O1xuZXhwb3J0IHsgU2F2ZXMgfTsiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQU8sU0FBUyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDOztJQUU5QyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3BDLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ2QsQ0FBQyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7SUFDcEIsQ0FBQyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7O0lBRXRCLE9BQU8sQ0FBQyxDQUFDOzs7QUNQYjs7O0FBR0EsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsWUFBWTtJQUNsQyxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLGNBQWMsRUFBRSxXQUFXLENBQUM7OztJQUc1RCxPQUFPLENBQUMsS0FBSyxZQUFZLEVBQUU7OztRQUd2QixXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsWUFBWSxDQUFDLENBQUM7UUFDdkQsWUFBWSxJQUFJLENBQUMsQ0FBQzs7O1FBR2xCLGNBQWMsR0FBRyxJQUFJLENBQUMsWUFBWSxD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
