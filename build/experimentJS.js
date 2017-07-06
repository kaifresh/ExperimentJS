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

/**
 * To set Trial IVs
 *      1. Set the setter function:                 this is a function `fn` that will manipulate the display
 *      2. Set the args passed to the setter:       these are the varying args passed to `fn` used to vary the IV
 *      3. Call Trials.buildExperiment()
 *
 *  Optional:
 *      4. Set a response parser function:          format passed arguments into a desired output format
 *
 *
 * */

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                                 Trials - Setting IV Levels & Functions
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

var Trials = {};
var IVs = {};
var setFuncs = {};

var expRepeats = 1;

/** Every IV requires 2 steps: creating the levels and then, setting the target */
Trials.setIVLevels = function ( ivname, levels) {

    if (Array.isArray(levels)){                                     // Enforce the type system: Levels must be an array of arrays

        levels.map(function(elem, i){
            if (!Array.isArray( elem )){
                throw new Error("[ setIVLevels Error ] - Level "+i+" must be an array of args passed to the set function for "+ ivname);
                return;
            }
        });

        _setIVGeneric(ivname, "levels", levels);

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

var _dvName;
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
        throw new Error("[ setIVResponseParserFunc Error ] - parser function for "+ivname+" was not a function");
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
function _setIVGeneric(ivName, fieldName, fieldVal) { //used by 2AFC.js
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

        for (var i = 0; i < len; ++i) {                                                     // For all trials built so far

            buildingTrial = _allTrials.pop();                                               // Pop the incomplete array of iv-vals (objects) and extend it

            for (var j = 0; j < IVs[iv].levels.length; ++j) { //Extend them by all the levels of the next IV

                var curIVLevel = {};

                curIVLevel.description = iv;                                                // Set the description of the current IV obj 4 the current Level
                curIVLevel.value = IVs[iv].levels[j];                                       // Set the description of the current IV obj 4 the current Level

                if (IVs[iv].hasOwnProperty("std_2AFC")) {                                   // Store 2AFC std with each trial (if present)
                    curIVLevel.std_2AFC = IVs[iv].std_2AFC;
                }

                if (IVs[iv].hasOwnProperty("std_2AFC_simultaneous_target")) {               // For 2AFC that is simultaneous (as opposed to the flipping kind)
                    curIVLevel.std_2AFC_simultaneous_target = IVs[iv].std_2AFC_simultaneous_target;
                }


                if (IVs[iv].parserFunc !== undefined) {                                     // Parser functions
                    curIVLevel.parserFunc = IVs[iv].parserFunc;
                }

                // = = = = = = = = = = = Extending the trial = = = = = = = = = = = = = =

                var newOrExtendedTrial;

                if (buildingTrial === undefined) {
                    newOrExtendedTrial = [curIVLevel];

                } else if (buildingTrial.constructor === Array) {
                    newOrExtendedTrial = buildingTrial.concat([curIVLevel]);                // The incomplete trial is extended by creating a brand new array FROM it
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

        // If a parser is defined use its output as the value of the response
        if (lastTrial[i].parserFunc !== undefined && typeof lastTrial[i].parserFunc === "function"){ //$.isFunction(lastTrial[i].parserFunc)){
            
            var stdName = ivNum + "_" + lastTrial[i].description;

            /**
             * Parser function interface:
             *                  function ( args_passed_to_this_IV_for_this_trial..., index) {}
             *                  return
             *                          string -    processed version of the data
             *                          object -    values are the processed version of parts of the data,
             *                                      keys are names given to each portion of the parsed data
             * */

            var parsed_data = lastTrial[i].parserFunc.apply(this, lastTrial[i].value.concat(i) );                               // Refer to interface description above

            if (typeof parsed_data === "string" || parsed_data instanceof String){
                responseFormatted[ stdName+"_value" ] = parsed_data;                                                            // Add parsed IV data to response

            } else if (parsed_data !== null && typeof parsed_data === "object"){
                
                var keys = Object.keys(parsed_data);
                for (var k = 0; k < keys.length; k++){
                    var key_and_data_description = keys[k];
                    responseFormatted[ stdName+"_"+key_and_data_description+"_value" ] = parsed_data[key_and_data_description]; // Add parsed data for this key to response
                }
                
            } else {
                throw new Error("[ Parser Function Error ] - Parser function for "+stdName+" must output either a string or an object. You output:", typeof parsed_data);
            }

        } else if (lastTrial[i].value.constructor === Array) { // Consider these to be defaults for javascript primitive types

            /** Manually write out each argument (from an array) to a field in the object
             *  Only append a number if there are >1 arguments passed in */

            if (lastTrial[i].value.length > 1){

                //If using a setFunc function with multiple args -> use the arg names to describe the values written to the response
                var arg_names, arg_name;
                arg_names = getParamNames( setFuncs[ lastTrial[i].description ] );

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
        responseFormatted["DV_value"] = "ERROR - No DV supplied";
        throw new Error("A dependent variable (DV) must be supplied by the calling code. This is an error.");       // Do not continue if DV is not supplied
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
        throw new Error("setPauseTime only takes integers");
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
Trials.setMidCallback = function (fn) {
    if (typeof fn === "function"){
        _midCallback = fn;
    }   else {
        throw new Error("[ setMidCallback ERROR ] - First argument to setMidCallback must be a function");
    }
};

var _didRunMidCallback = false;
function _shouldRunMidCallback() {
    if (_didRunMidCallback) return false;

    // Trials are popped, responses are pushed.
    // Mid point = there are as many responses as trials (or a difference of one for odd number of trials)
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
        throw new Error("[ setEndCallback ERROR ] - First argument to setEndCallback must be a function");
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

    
    saves_dialog_wrap.appendChild(sel);
    saves_dialog_wrap.appendChild(document.createElement("br"));
    saves_dialog_wrap.appendChild(b);
    saves_dialog_wrap.appendChild(b_clear);
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


    return {
        select: sel,
        button: b,
        button_clear: b_clear,
        wrap: saves_dialog_wrap
    };
}

//Order of imports is important

/* Import Trials and extend it with additional functionality*/

exports.Trials = Trials;
exports.Pause = Pause;
exports.Saves = Saves;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwZXJpbWVudEpTLmpzIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMvQ3JlYXRlRG93bmxvYWRMaW5rLmpzIiwiLi4vc3JjL3V0aWxzL1NodWZmbGUuanMiLCIuLi9zcmMvdXRpbHMvTnVtYmVyVXRpbHMuanMiLCIuLi9zcmMvdXRpbHMvU3RyaW5nVXRpbHMuanMiLCIuLi9zcmMvdXRpbHMvdXRpbHMuanMiLCIuLi9zcmMvdXRpbHMvalF1ZXJ5VXRpbHMuanMiLCIuLi9zcmMvY29yZS9UcmlhbHMuanMiLCIuLi9zcmMvY29yZS9SZXNwb25zZUhhbmRsZXIuanMiLCIuLi9zcmMvY29yZS9HZXRQcHRJbmZvLmpzIiwiLi4vc3JjL2NvcmUvT3V0cHV0UmVzcG9uc2VzLmpzIiwiLi4vc3JjL3V0aWxzL1NldENTU09uRWxlbWVudC5qcyIsIi4uL3NyYy9jb3JlL0ludGVyc3RpbXVsdXNQYXVzZS5qcyIsIi4uL3NyYy91dGlscy9ET01VdGlscy5qcyIsIi4uL3NyYy9jb3JlL1J1bkV4cGVyaW1lbnQuanMiLCIuLi9zcmMvY29yZS9TYXZlcy5qcyIsIi4uL3NyYy9jb3JlL2NvcmUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZURvd25sb2FkTGluayhmaWxlbmFtZSwgZGF0YSl7XG4gICAgLy8vL2h0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTc4MzYyNzMvZXhwb3J0LWphdmFzY3JpcHQtZGF0YS10by1jc3YtZmlsZS13aXRob3V0LXNlcnZlci1pbnRlcmFjdGlvblxuICAgIHZhciBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgYS5ocmVmID0gZGF0YTtcbiAgICBhLnRhcmdldCA9IFwiX2JsYW5rXCI7XG4gICAgYS5kb3dubG9hZCA9IGZpbGVuYW1lO1xuIFxuICAgIHJldHVybiBhO1xufSIsIi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRmlzY2hlciBZYXRlcyBTaHVmZmxlXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG5BcnJheS5wcm90b3R5cGUuc2h1ZmZsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY3VycmVudEluZGV4ID0gdGhpcy5sZW5ndGgsIHRlbXBvcmFyeVZhbHVlLCByYW5kb21JbmRleDtcblxuICAgIC8vIFdoaWxlIHRoZXJlIHJlbWFpbiBlbGVtZW50cyB0byBzaHVmZmxlLi4uXG4gICAgd2hpbGUgKDAgIT09IGN1cnJlbnRJbmRleCkge1xuXG4gICAgICAgIC8vIFBpY2sgYSByZW1haW5pbmcgZWxlbWVudC4uLlxuICAgICAgICByYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGN1cnJlbnRJbmRleCk7XG4gICAgICAgIGN1cnJlbnRJbmRleCAtPSAxO1xuXG4gICAgICAgIC8vIEFuZCBzd2FwIGl0IHdpdGggdGhlIGN1cnJlbnQgZWxlbWVudC5cbiAgICAgICAgdGVtcG9yYXJ5VmFsdWUgPSB0aGlzW2N1cnJlbnRJbmRleF07XG4gICAgICAgIHRoaXNbY3VycmVudEluZGV4XSA9IHRoaXNbcmFuZG9tSW5kZXhdO1xuICAgICAgICB0aGlzW3JhbmRvbUluZGV4XSA9IHRlbXBvcmFyeVZhbHVlO1xuICAgIH1cbn07IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGthaSBvbiA1LzEvMTcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0Zsb2F0KG4pIHtcbiAgICByZXR1cm4gTnVtYmVyKG4pID09PSBuICYmIG4gJSAxICE9PSAwO1xufSIsIlxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdHJpbmcgVXRpbHNcbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbWVsVG9TZW50ZW5jZUNhc2Uoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5zcGxpdCgvKD89W0EtWl0pLykuam9pbihcIiBcIikudG9Mb3dlckNhc2UoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBhcmFtTmFtZXMoZm4pe1xuICAgIC8vd3JhcCB0aGVzZSBzbyBhcyBub3QgdG8gcG9sbHV0ZSB0aGUgbmFtZXNwYWNlXG4gICAgdmFyIFNUUklQX0NPTU1FTlRTID0gLygoXFwvXFwvLiokKXwoXFwvXFwqW1xcc1xcU10qP1xcKlxcLykpL21nO1xuICAgIHZhciBBUkdVTUVOVF9OQU1FUyA9IC8oW15cXHMsXSspL2c7XG4gICAgZnVuY3Rpb24gX2dldFBhcmFtTmFtZXMoZnVuYykge1xuICAgICAgICB2YXIgZm5TdHIgPSBmdW5jLnRvU3RyaW5nKCkucmVwbGFjZShTVFJJUF9DT01NRU5UUywgXCJcIik7XG4gICAgICAgIHZhciByZXN1bHQgPSBmblN0ci5zbGljZShmblN0ci5pbmRleE9mKFwiKFwiKSsxLCBmblN0ci5pbmRleE9mKFwiKVwiKSkubWF0Y2goQVJHVU1FTlRfTkFNRVMpO1xuICAgICAgICBpZihyZXN1bHQgPT09IG51bGwpXG4gICAgICAgICAgICByZXN1bHQgPSBbXTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICByZXR1cm4gX2dldFBhcmFtTmFtZXMoZm4pO1xufSIsIi8qKlxuICogQ3JlYXRlZCBieSBrYWkgb24gNS8xLzE3LlxuICovXG5cbmltcG9ydCBcIi4vQ3JlYXRlRG93bmxvYWRMaW5rLmpzXCI7XG5pbXBvcnQgXCIuL1NodWZmbGUuanNcIjtcbmltcG9ydCBcIi4vTnVtYmVyVXRpbHMuanNcIjtcbmltcG9ydCBcIi4vU3RyaW5nVXRpbHMuanNcIjtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBrYWkgb24gNi83LzE3LlxuICovXG5cblxuLy8gdmFyIGFyciA9IFtdO1xuXG4vLyB2YXIgZG9jdW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQ7XG5cbnZhciBnZXRQcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZjtcblxuLy8gdmFyIHNsaWNlID0gYXJyLnNsaWNlO1xuXG4vLyB2YXIgY29uY2F0ID0gYXJyLmNvbmNhdDtcblxuLy8gdmFyIHB1c2ggPSBhcnIucHVzaDtcblxuLy8gdmFyIGluZGV4T2YgPSBhcnIuaW5kZXhPZjtcblxudmFyIGNsYXNzMnR5cGUgPSB7fTtcblxudmFyIHRvU3RyaW5nID0gY2xhc3MydHlwZS50b1N0cmluZztcblxudmFyIGhhc093biA9IGNsYXNzMnR5cGUuaGFzT3duUHJvcGVydHk7XG5cbnZhciBmblRvU3RyaW5nID0gaGFzT3duLnRvU3RyaW5nO1xuXG52YXIgT2JqZWN0RnVuY3Rpb25TdHJpbmcgPSBmblRvU3RyaW5nLmNhbGwoIE9iamVjdCApO1xuXG52YXIgc3VwcG9ydCA9IHt9O1xuXG5cbi8vIFRha2VuIGZyb20gSnF1ZXJ5XG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5kKCkge1xuICAgIHZhciBvcHRpb25zLCBuYW1lLCBzcmMsIGNvcHksIGNvcHlJc0FycmF5LCBjbG9uZSxcbiAgICAgICAgdGFyZ2V0ID0gYXJndW1lbnRzWyAwIF0gfHwge30sXG4gICAgICAgIGkgPSAxLFxuICAgICAgICBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoLFxuICAgICAgICBkZWVwID0gZmFsc2U7XG5cbiAgICAvLyBIYW5kbGUgYSBkZWVwIGNvcHkgc2l0dWF0aW9uXG4gICAgaWYgKCB0eXBlb2YgdGFyZ2V0ID09PSBcImJvb2xlYW5cIiApIHtcbiAgICAgICAgZGVlcCA9IHRhcmdldDtcblxuICAgICAgICAvLyBTa2lwIHRoZSBib29sZWFuIGFuZCB0aGUgdGFyZ2V0XG4gICAgICAgIHRhcmdldCA9IGFyZ3VtZW50c1sgaSBdIHx8IHt9O1xuICAgICAgICBpKys7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIGNhc2Ugd2hlbiB0YXJnZXQgaXMgYSBzdHJpbmcgb3Igc29tZXRoaW5nIChwb3NzaWJsZSBpbiBkZWVwIGNvcHkpXG4gICAgaWYgKCB0eXBlb2YgdGFyZ2V0ICE9PSBcIm9iamVjdFwiICYmICEodHlwZW9mIHRhcmdldCA9PT0gXCJmdW5jdGlvblwiKSApIHtcbiAgICAgICAgdGFyZ2V0ID0ge307XG4gICAgfVxuXG4gICAgLy8gRXh0ZW5kIGpRdWVyeSBpdHNlbGYgaWYgb25seSBvbmUgYXJndW1lbnQgaXMgcGFzc2VkXG4gICAgaWYgKCBpID09PSBsZW5ndGggKSB7XG4gICAgICAgIHRhcmdldCA9IHRoaXM7XG4gICAgICAgIGktLTtcbiAgICB9XG5cbiAgICBmb3IgKCA7IGkgPCBsZW5ndGg7IGkrKyApIHtcblxuICAgICAgICAvLyBPbmx5IGRlYWwgd2l0aCBub24tbnVsbC91bmRlZmluZWQgdmFsdWVzXG4gICAgICAgIGlmICggKCBvcHRpb25zID0gYXJndW1lbnRzWyBpIF0gKSAhPSBudWxsICkge1xuXG4gICAgICAgICAgICAvLyBFeHRlbmQgdGhlIGJhc2Ugb2JqZWN0XG4gICAgICAgICAgICBmb3IgKCBuYW1lIGluIG9wdGlvbnMgKSB7XG4gICAgICAgICAgICAgICAgc3JjID0gdGFyZ2V0WyBuYW1lIF07XG4gICAgICAgICAgICAgICAgY29weSA9IG9wdGlvbnNbIG5hbWUgXTtcblxuICAgICAgICAgICAgICAgIC8vIFByZXZlbnQgbmV2ZXItZW5kaW5nIGxvb3BcbiAgICAgICAgICAgICAgICBpZiAoIHRhcmdldCA9PT0gY29weSApIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gUmVjdXJzZSBpZiB3ZSdyZSBtZXJnaW5nIHBsYWluIG9iamVjdHMgb3IgYXJyYXlzXG4gICAgICAgICAgICAgICAgaWYgKCBkZWVwICYmIGNvcHkgJiYgKCBpc1BsYWluT2JqZWN0KCBjb3B5ICkgfHxcbiAgICAgICAgICAgICAgICAgICAgKCBjb3B5SXNBcnJheSA9IEFycmF5LmlzQXJyYXkoIGNvcHkgKSApICkgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBjb3B5SXNBcnJheSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvcHlJc0FycmF5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9uZSA9IHNyYyAmJiBBcnJheS5pc0FycmF5KCBzcmMgKSA/IHNyYyA6IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9uZSA9IHNyYyAmJiBpc1BsYWluT2JqZWN0KCBzcmMgKSA/IHNyYyA6IHt9O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gTmV2ZXIgbW92ZSBvcmlnaW5hbCBvYmplY3RzLCBjbG9uZSB0aGVtXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFsgbmFtZSBdID0gZXh0ZW5kKCBkZWVwLCBjbG9uZSwgY29weSApO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIERvbid0IGJyaW5nIGluIHVuZGVmaW5lZCB2YWx1ZXNcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCBjb3B5ICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFsgbmFtZSBdID0gY29weTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gdGhlIG1vZGlmaWVkIG9iamVjdFxuICAgIHJldHVybiB0YXJnZXQ7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUGxhaW5PYmplY3QoIG9iaiApIHtcbiAgICB2YXIgcHJvdG8sIEN0b3I7XG5cbiAgICAvLyBEZXRlY3Qgb2J2aW91cyBuZWdhdGl2ZXNcbiAgICAvLyBVc2UgdG9TdHJpbmcgaW5zdGVhZCBvZiBqUXVlcnkudHlwZSB0byBjYXRjaCBob3N0IG9iamVjdHNcbiAgICBpZiAoICFvYmogfHwgdG9TdHJpbmcuY2FsbCggb2JqICkgIT09IFwiW29iamVjdCBPYmplY3RdXCIgKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwcm90byA9IGdldFByb3RvKCBvYmogKTtcblxuICAgIC8vIE9iamVjdHMgd2l0aCBubyBwcm90b3R5cGUgKGUuZy4sIGBPYmplY3QuY3JlYXRlKCBudWxsIClgKSBhcmUgcGxhaW5cbiAgICBpZiAoICFwcm90byApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gT2JqZWN0cyB3aXRoIHByb3RvdHlwZSBhcmUgcGxhaW4gaWZmIHRoZXkgd2VyZSBjb25zdHJ1Y3RlZCBieSBhIGdsb2JhbCBPYmplY3QgZnVuY3Rpb25cbiAgICBDdG9yID0gaGFzT3duLmNhbGwoIHByb3RvLCBcImNvbnN0cnVjdG9yXCIgKSAmJiBwcm90by5jb25zdHJ1Y3RvcjtcbiAgICByZXR1cm4gdHlwZW9mIEN0b3IgPT09IFwiZnVuY3Rpb25cIiAmJiBmblRvU3RyaW5nLmNhbGwoIEN0b3IgKSA9PT0gT2JqZWN0RnVuY3Rpb25TdHJpbmc7XG59XG4iLCJpbXBvcnQgeyBleHRlbmQgfSBmcm9tIFwiLi4vdXRpbHMvalF1ZXJ5VXRpbHMuanNcIjtcblxuXG4vKipcbiAqIFRvIHNldCBUcmlhbCBJVnNcbiAqICAgICAgMS4gU2V0IHRoZSBzZXR0ZXIgZnVuY3Rpb246ICAgICAgICAgICAgICAgICB0aGlzIGlzIGEgZnVuY3Rpb24gYGZuYCB0aGF0IHdpbGwgbWFuaXB1bGF0ZSB0aGUgZGlzcGxheVxuICogICAgICAyLiBTZXQgdGhlIGFyZ3MgcGFzc2VkIHRvIHRoZSBzZXR0ZXI6ICAgICAgIHRoZXNlIGFyZSB0aGUgdmFyeWluZyBhcmdzIHBhc3NlZCB0byBgZm5gIHVzZWQgdG8gdmFyeSB0aGUgSVZcbiAqICAgICAgMy4gQ2FsbCBUcmlhbHMuYnVpbGRFeHBlcmltZW50KClcbiAqXG4gKiAgT3B0aW9uYWw6XG4gKiAgICAgIDQuIFNldCBhIHJlc3BvbnNlIHBhcnNlciBmdW5jdGlvbjogICAgICAgICAgZm9ybWF0IHBhc3NlZCBhcmd1bWVudHMgaW50byBhIGRlc2lyZWQgb3V0cHV0IGZvcm1hdFxuICpcbiAqXG4gKiAqL1xuXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRyaWFscyAtIFNldHRpbmcgSVYgTGV2ZWxzICYgRnVuY3Rpb25zXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG5cbnZhciBUcmlhbHMgPSB7fTtcbmV4cG9ydCB2YXIgSVZzID0ge307XG5leHBvcnQgdmFyIHNldEZ1bmNzID0ge307XG5cbnZhciBleHBSZXBlYXRzID0gMTtcblxuLyoqIEV2ZXJ5IElWIHJlcXVpcmVzIDIgc3RlcHM6IGNyZWF0aW5nIHRoZSBsZXZlbHMgYW5kIHRoZW4sIHNldHRpbmcgdGhlIHRhcmdldCAqL1xuVHJpYWxzLnNldElWTGV2ZWxzID0gZnVuY3Rpb24gKCBpdm5hbWUsIGxldmVscykge1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkobGV2ZWxzKSl7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVuZm9yY2UgdGhlIHR5cGUgc3lzdGVtOiBMZXZlbHMgbXVzdCBiZSBhbiBhcnJheSBvZiBhcnJheXNcblxuICAgICAgICBsZXZlbHMubWFwKGZ1bmN0aW9uKGVsZW0sIGkpe1xuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KCBlbGVtICkpe1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlsgc2V0SVZMZXZlbHMgRXJyb3IgXSAtIExldmVsIFwiK2krXCIgbXVzdCBiZSBhbiBhcnJheSBvZiBhcmdzIHBhc3NlZCB0byB0aGUgc2V0IGZ1bmN0aW9uIGZvciBcIisgaXZuYW1lKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIF9zZXRJVkdlbmVyaWMoaXZuYW1lLCBcImxldmVsc1wiLCBsZXZlbHMpO1xuXG4gICAgfSBlbHNle1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJbIHNldElWTGV2ZWxzIEVycm9yIF0gLSBUaGUgc2Vjb25kIGFyZ3VtZW50IHRvIHNldElWTGV2ZWxzIG11c3QgYmUgYW4gYXJyYXkgb2YgYXJyYXlzLCBjb250YWluaW5nIHRoZSBhcmd1bWVudHMgcGFzc3NlZCB0byB0aGUgc2V0IGZ1bmN0aW9uIGZvciBcIisgaXZuYW1lKTtcbiAgICB9XG5cblxufTtcblxuVHJpYWxzLnNldElWc2V0RnVuYyA9IGZ1bmN0aW9uKGl2bmFtZSwgc2V0RnVuYykge1xuXG4gICAgaWYgKHR5cGVvZiBzZXRGdW5jICE9PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJbIHNldElWc2V0RnVuYyBFcnJvciBdIC0gcGFyc2VyIGZ1bmN0aW9uIGZvciBcIitpdm5hbWUrXCIgd2FzIG5vdCBhIGZ1bmN0aW9uXCIpO1xuICAgIH1cblxuICAgIC8vVGhpcyBpcyBub3cgYSBmbGFnIHRvIG5vdGlmeSBFeHBlcmltZW50SlMgdGhhdCB5b3VcInJlIHVzaW5nIGZ1bmN0aW9uc1xuICAgIF9zZXRJVkdlbmVyaWMoaXZuYW1lLCBcInNldEZ1bmNcIiwgdHJ1ZSk7XG5cbiAgICAvL0Z1bmN0aW9ucyBhcmUgbm93IHN0b3JlZCBpbiB0aGVpciBvd24gbWFwLCBrZXllZCBieSBpdm5hbWVcbiAgICBfc2V0U2V0RnVuYyhpdm5hbWUsIHNldEZ1bmMpO1xufTtcblxuZXhwb3J0IHZhciBfZHZOYW1lO1xuVHJpYWxzLnNldERWTmFtZSA9IGZ1bmN0aW9uKGR2TmFtZSl7XG4gICAgaWYgKHR5cGVvZiBkdk5hbWUgPT09IFwic3RyaW5nXCIpe1xuICAgICAgICBfY3N2SWxsZWdhbENoYXJDaGVjayhkdk5hbWUpO1xuICAgICAgICBfZHZOYW1lID0gZHZOYW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93ICBuZXcgRXJyb3IoXCJUaGUgc3VwcGxpZWQgRFYgbmFtZSBtdXN0IGJlIG9mIHR5cGUgU3RyaW5nXCIpO1xuICAgIH1cbn07XG5cblxuLyoqXG4gKiBQYXJzZXIgZnVuY3Rpb24gaW50ZXJmYWNlOlxuICogICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoIGFyZ3NfcGFzc2VkX3RvX3RoaXNfSVZfZm9yX3RoaXNfdHJpYWwuLi4sIGluZGV4KSB7fVxuICogICAgICAgICAgICAgICAgICByZXR1cm5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmcgLSAgICBwcm9jZXNzZWQvZm9ybWF0dGVkIHZlcnNpb24gb2YgdGhlIGRhdGFcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICBvYmplY3QgLSAgICB2YWx1ZXMgYXJlIHRoZSBwcm9jZXNzZWQgdmVyc2lvbiBvZiBwYXJ0cyBvZiB0aGUgZGF0YSxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXlzIGFyZSBuYW1lcyBnaXZlbiB0byBlYWNoIHBvcnRpb24gb2YgdGhlIHBhcnNlZCBkYXRhXG4gKiAqL1xuVHJpYWxzLnNldElWUmVzcG9uc2VQYXJzZXJGdW5jID0gZnVuY3Rpb24gKGl2bmFtZSwgcGFyc2VyRnVuYykge1xuXG4gICAgaWYgKHR5cGVvZiBwYXJzZXJGdW5jICE9PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJbIHNldElWUmVzcG9uc2VQYXJzZXJGdW5jIEVycm9yIF0gLSBwYXJzZXIgZnVuY3Rpb24gZm9yIFwiK2l2bmFtZStcIiB3YXMgbm90IGEgZnVuY3Rpb25cIik7XG4gICAgfVxuXG4gICAgX3NldElWR2VuZXJpYyhpdm5hbWUsIFwicGFyc2VyRnVuY1wiLCBwYXJzZXJGdW5jKTtcbn07XG5cblxuVHJpYWxzLnNldFJlcGVhdHMgPSBmdW5jdGlvbiAoblJlcGVhdHMpIHtcblxuICAgIGlmICghTnVtYmVyLmlzSW50ZWdlcihuUmVwZWF0cykpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJbIHNldFJlcGVhdHMgRXJyb3IgXSAtIDFzdCBhcmd1bWVudCB0byB0aGlzIGZ1bmN0aW9uIG11c3QgYmUgYW4gaW50ZWdlclwiKTtcbiAgICB9XG5cbiAgICBleHBSZXBlYXRzID0gblJlcGVhdHM7XG59O1xuXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICBUcmlhbHMgLSBTZXR0aW5nIElWIExldmVscyAmIEZ1bmN0aW9ucyAocHJpdmF0ZSlcbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cbi8qXG4qICovXG5leHBvcnQgZnVuY3Rpb24gX3NldElWR2VuZXJpYyhpdk5hbWUsIGZpZWxkTmFtZSwgZmllbGRWYWwpIHsgLy91c2VkIGJ5IDJBRkMuanNcbiAgICBfY3N2SWxsZWdhbENoYXJDaGVjayhpdk5hbWUpO1xuICAgIF9jc3ZJbGxlZ2FsQ2hhckNoZWNrKGZpZWxkTmFtZSk7XG5cbiAgICBpZiAoIUlWcy5oYXNPd25Qcm9wZXJ0eShpdk5hbWUpKSB7ICAgICAgICAgICAgICAgICAgICAgIC8vIElmIElWIGRvZXNuJ3QgZXhpc3QgeWV0LCBjcmVhdGUgaXRcbiAgICAgICAgSVZzW2l2TmFtZV0gPSB7fTtcbiAgICB9XG5cbiAgICBJVnNbaXZOYW1lXVtmaWVsZE5hbWVdID0gZmllbGRWYWw7XG59XG5cblxuZnVuY3Rpb24gX3NldFNldEZ1bmMoaXZuYW1lLCBzZXRmdW5jKXtcbiAgICBzZXRGdW5jc1tpdm5hbWVdID0gc2V0ZnVuYztcbn1cblxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRyaWFscyAtIEJ1aWxkaW5nXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG5cblxuZXhwb3J0IHZhciBfYWxsVHJpYWxzID0gW107XG52YXIgX3RvdGFsVHJpYWxzID0gLTE7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9Bc3NpZ25lZCBidXQgbmV2ZXIgdXNlZFxuZXhwb3J0IHZhciBfZGlkQnVpbGRUcmlhbHMgPSBmYWxzZTtcblxuZXhwb3J0IGZ1bmN0aW9uIF9zZXRBbGxUcmlhbHMoYWxsdHJpYWxzKXsgICAgICAgICAgICAgICAgICAgICAgLy8gVXNlZCBpbiAuL1NhdmVzLmpzLiBIYXMgdG8gbGl2ZSBoZXJlIGFzIGl0IHJlZGVmaW5lcyBfYWxsVHJpYWxzXG4gICAgaWYgKGFsbHRyaWFscy5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpe1xuICAgICAgICBfYWxsVHJpYWxzID0gYWxsdHJpYWxzO1xuICAgIH1cbn1cblxuLy8gUmV0dXJucyBhIGRlZXAgY29weSBvZiB0aGUgdHJpYWxzXG5UcmlhbHMuZ2V0VHJpYWxzID0gZnVuY3Rpb24oKXtcbiAgICBpZiAoX2FsbFRyaWFscy5sZW5ndGggPiAwKXtcbiAgICAgICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBbXSwgX2FsbFRyaWFscyk7XG4gICAgICAgIC8vIHJldHVybiAkLmV4dGVuZCh0cnVlLCBbXSwgX2FsbFRyaWFscyk7XG4gICAgfVxufTtcblxuXG5mdW5jdGlvbiBfYnVpbGRUcmlhbHMocHJpbnRUcmlhbHMpIHtcblxuICAgIGNvbnNvbGUubG9nKFwiQnVpbGQgVHJpYWxzLiBJVlM6XCIsIElWcyk7XG5cbiAgICB2YXIgYnVpbGRpbmdUcmlhbCwgdGVtcDtcblxuICAgIGZvciAodmFyIGl2IGluIElWcykgeyAvL0l0ZXJhdGUgb3ZlciBJVnNcblxuICAgICAgICBpZiAoSVZzW2l2XS5sZXZlbHMgPT09IHVuZGVmaW5lZCkgIHRocm93IG5ldyBFcnJvcihcIkxldmVscyBub3Qgc3VwcGxpZWQgZm9yIFwiICsgaXYpO1xuICAgICAgICBpZiAoSVZzW2l2XS5zZXRGdW5jID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihcIlNldHRlciBmdW5jdGlvbiBub3Qgc3VwcGxpZWQgZm9yIFwiICsgaXYpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwiRXh0ZW5kaW5nIGFsbCB0cmlhbHMgYXJyYXkgd2l0aDogXCIgKyBpdiArIFwiIChcIiArIElWc1tpdl0ubGV2ZWxzLmxlbmd0aCArIFwiIGxldmVscylcIik7XG5cbiAgICAgICAgaWYgKHNldEZ1bmNzW2l2XSA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoXCJTZXRGdW5jIG5vdCBkZWZpbmVkIGZvciBcIiArIGl2KTtcblxuICAgICAgICB0ZW1wID0gW107XG5cbiAgICAgICAgdmFyIGxlbiA9IF9hbGxUcmlhbHMubGVuZ3RoID09PSAwID8gMSA6IF9hbGxUcmlhbHMubGVuZ3RoOyAvLyBGb3IgdGhlIGZpcnN0IHBhc3NcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGb3IgYWxsIHRyaWFscyBidWlsdCBzbyBmYXJcblxuICAgICAgICAgICAgYnVpbGRpbmdUcmlhbCA9IF9hbGxUcmlhbHMucG9wKCk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQb3AgdGhlIGluY29tcGxldGUgYXJyYXkgb2YgaXYtdmFscyAob2JqZWN0cykgYW5kIGV4dGVuZCBpdFxuXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IElWc1tpdl0ubGV2ZWxzLmxlbmd0aDsgKytqKSB7IC8vRXh0ZW5kIHRoZW0gYnkgYWxsIHRoZSBsZXZlbHMgb2YgdGhlIG5leHQgSVZcblxuICAgICAgICAgICAgICAgIHZhciBjdXJJVkxldmVsID0ge307XG5cbiAgICAgICAgICAgICAgICBjdXJJVkxldmVsLmRlc2NyaXB0aW9uID0gaXY7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2V0IHRoZSBkZXNjcmlwdGlvbiBvZiB0aGUgY3VycmVudCBJViBvYmogNCB0aGUgY3VycmVudCBMZXZlbFxuICAgICAgICAgICAgICAgIGN1cklWTGV2ZWwudmFsdWUgPSBJVnNbaXZdLmxldmVsc1tqXTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTZXQgdGhlIGRlc2NyaXB0aW9uIG9mIHRoZSBjdXJyZW50IElWIG9iaiA0IHRoZSBjdXJyZW50IExldmVsXG5cbiAgICAgICAgICAgICAgICBpZiAoSVZzW2l2XS5oYXNPd25Qcm9wZXJ0eShcInN0ZF8yQUZDXCIpKSB7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTdG9yZSAyQUZDIHN0ZCB3aXRoIGVhY2ggdHJpYWwgKGlmIHByZXNlbnQpXG4gICAgICAgICAgICAgICAgICAgIGN1cklWTGV2ZWwuc3RkXzJBRkMgPSBJVnNbaXZdLnN0ZF8yQUZDO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChJVnNbaXZdLmhhc093blByb3BlcnR5KFwic3RkXzJBRkNfc2ltdWx0YW5lb3VzX3RhcmdldFwiKSkgeyAgICAgICAgICAgICAgIC8vIEZvciAyQUZDIHRoYXQgaXMgc2ltdWx0YW5lb3VzIChhcyBvcHBvc2VkIHRvIHRoZSBmbGlwcGluZyBraW5kKVxuICAgICAgICAgICAgICAgICAgICBjdXJJVkxldmVsLnN0ZF8yQUZDX3NpbXVsdGFuZW91c190YXJnZXQgPSBJVnNbaXZdLnN0ZF8yQUZDX3NpbXVsdGFuZW91c190YXJnZXQ7XG4gICAgICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgICAgICBpZiAoSVZzW2l2XS5wYXJzZXJGdW5jICE9PSB1bmRlZmluZWQpIHsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUGFyc2VyIGZ1bmN0aW9uc1xuICAgICAgICAgICAgICAgICAgICBjdXJJVkxldmVsLnBhcnNlckZ1bmMgPSBJVnNbaXZdLnBhcnNlckZ1bmM7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9IEV4dGVuZGluZyB0aGUgdHJpYWwgPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG5cbiAgICAgICAgICAgICAgICB2YXIgbmV3T3JFeHRlbmRlZFRyaWFsO1xuXG4gICAgICAgICAgICAgICAgaWYgKGJ1aWxkaW5nVHJpYWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBuZXdPckV4dGVuZGVkVHJpYWwgPSBbY3VySVZMZXZlbF07XG5cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJ1aWxkaW5nVHJpYWwuY29uc3RydWN0b3IgPT09IEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld09yRXh0ZW5kZWRUcmlhbCA9IGJ1aWxkaW5nVHJpYWwuY29uY2F0KFtjdXJJVkxldmVsXSk7ICAgICAgICAgICAgICAgIC8vIFRoZSBpbmNvbXBsZXRlIHRyaWFsIGlzIGV4dGVuZGVkIGJ5IGNyZWF0aW5nIGEgYnJhbmQgbmV3IGFycmF5IEZST00gaXRcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0ZW1wLnB1c2gobmV3T3JFeHRlbmRlZFRyaWFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIF9hbGxUcmlhbHMgPSB0ZW1wOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIC8qKiBSZXBsYWNlIHlvdXIgcHJldmlvdXMgdHJpYWxzIHdpdGggVGVtcCAoZG9uXCJ0IGtub3cgd2hvIHRvIGRvIHRoaXMgaW4gcGxhY2UpICovXG4gICAgfVxuXG5cbiAgICAvKiogRHVwbGljYXRlIHRoZSBjdXJyZW50IGZhY3RvcmlhbCB0cmlhbHMgKi9cbiAgICB2YXIgcmVwZWF0cyA9IGV4cFJlcGVhdHM7XG4gICAgdGVtcCA9IFtdO1xuICAgIGZvciAoaSA9IDA7IGkgPCByZXBlYXRzOyBpKyspIHtcbiAgICAgICAgdGVtcCA9IHRlbXAuY29uY2F0KF9hbGxUcmlhbHMpO1xuICAgIH1cbiAgICBfYWxsVHJpYWxzID0gdGVtcDtcblxuXG4gICAgY29uc29sZS5sb2coXCJUaGVyZSBhcmUgXCIsIF9hbGxUcmlhbHMubGVuZ3RoLCBcInRyaWFscyAodXNpbmdcIiwgcmVwZWF0cywgXCJyZXBlYXRzKVwiKTtcbiAgICBpZiAocHJpbnRUcmlhbHMpe1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgX2FsbFRyaWFscy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlRSSUFMIFwiLCBpKTtcbiAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBfYWxsVHJpYWxzW2ldLmxlbmd0aDsgaisrKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggX2FsbFRyaWFsc1tpXVtqXSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2coXCIqKioqKioqICoqKioqKiogKioqKioqKiAqKioqKioqXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKF9zaG91bGRTaHVmZmxlKSAgICAgX2FsbFRyaWFscy5zaHVmZmxlKCk7XG5cbiAgICBfdG90YWxUcmlhbHMgPSBfYWxsVHJpYWxzLmxlbmd0aDsgLy9Vc2VkIHRvIGRldGVybWluZSB3aGVyZSB5b3UgYXJlIGluIHRoZSB0cmlhbCBwcm9jZXNzXG4gICAgX2RpZEJ1aWxkVHJpYWxzID0gdHJ1ZTtcbn1cblxuXG5UcmlhbHMuYnVpbGRFeHBlcmltZW50ID0gZnVuY3Rpb24gKHByaW50VHJpYWxzKSB7XG4gICAgaWYgKHR5cGVvZiBwcmludFRyaWFscyAhPT0gXCJib29sZWFuXCIpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJbIGJ1aWxkRXhwZXJpbWVudCBFUlJPUiBdIC0gZmlyc3QgYXJnIHRvIGJ1aWxkRXhwZXJpbWVudCBtdXN0IGJlIGEgYm9vbGVhblwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBfYnVpbGRUcmlhbHMoIChwcmludFRyaWFscyA9PT0gdW5kZWZpbmVkKSA/IGZhbHNlIDogcHJpbnRUcmlhbHMgKTtcbiAgICB9XG59O1xuXG5cbnZhciBfc2hvdWxkU2h1ZmZsZSA9IHRydWU7XG5UcmlhbHMuc2V0U2h1ZmZsZSA9IGZ1bmN0aW9uKHNob3VsZFNodWZmbGUpe1xuICAgIGlmICh0eXBlb2Yoc2hvdWxkU2h1ZmZsZSkgPT09IFwiYm9vbGVhblwiKXtcbiAgICAgICAgX3Nob3VsZFNodWZmbGUgPSAgc2hvdWxkU2h1ZmZsZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJzZXRTaHVmZmxlIG9ubHkgYWNjZXB0cyBib29sZWFuIGFyZ3VtZW50XCIpO1xuICAgIH1cbn07XG5cbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUcmlhbHMgLSBzdWIgZnVuY3Rpb25zXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG5mdW5jdGlvbiBfY3N2SWxsZWdhbENoYXJDaGVjayhzdHJpbmcpe1xuXG4gICAgaWYgKHR5cGVvZiBzdHJpbmcgIT09IFwic3RyaW5nXCIpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzdXBwbHkgYSB2YXJpYWJsZSBvZiB0eXBlIFN0cmluZyBmb3IgdGhpcyBtZXRob2RcIik7XG4gICAgfVxuXG4gICAgaWYgKHN0cmluZy5pbmRleE9mKFwiLFwiKSAhPT0gLTEpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTdHJpbmdzIHVzZWQgYnkgRXhwZXJpbWVudEpTIG1heSBub3QgY29udGFpbiBjb21tYXM6IFwiICsgc3RyaW5nKTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IFRyaWFscyB9OyIsIi8qKlxuICogQ3JlYXRlZCBieSBrYWkgb24gNi83LzE3LlxuICovXG5cbmltcG9ydCB7IF9hbGxUcmlhbHMsIHNldEZ1bmNzLCBfZHZOYW1lIH0gZnJvbSBcIi4vVHJpYWxzXCI7XG5pbXBvcnQgeyBnZXRQYXJhbU5hbWVzIH0gZnJvbSBcIi4uL3V0aWxzL1N0cmluZ1V0aWxzLmpzXCI7XG5cbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRXhwZXJpbWVudCBMaWZlY3ljbGUgLSBTdG9yZSBSZXNwb25zZVxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuZXhwb3J0IHZhciBfcmVzcG9uc2VzID0gW107XG5leHBvcnQgZnVuY3Rpb24gX3NldFJlc3BvbnNlcyhyZXNwb25zZXMpeyAgICAgICAgICAgICAgICAgICAgICAgLy8gVXNlZCBpbiAuL1NhdmVzLmpzLiBIYXMgdG8gbGl2ZSBoZXJlIGFzIGl0IHJlZGVmaW5lcyBfcmVzcG9uc2VzXG4gICAgaWYgKHJlc3BvbnNlcy5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpe1xuICAgICAgICBfcmVzcG9uc2VzID0gcmVzcG9uc2VzO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcInJlcG9uc2VzIGNhbiBvbmx5IGJlIHNldCB0byBhbiBhcnJheVwiKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfc3RvcmVSZXNwb25zZShvcHRpb25zKSB7XG5cbiAgICB2YXIgbGFzdFRyaWFsID0gX2FsbFRyaWFscy5wb3AoKTtcblxuICAgIHZhciByZXNwb25zZUZvcm1hdHRlZCA9IHt9O1xuXG4gICAgLyoqIFN0b3JlIHRoZSBJViAtPiBXcml0ZSBvdXQgZWFjaCBJViAoMSBJViBwZXIgYXJyYXkgZWxlbWVudCkgdG8gYSBmaWVsZCAqL1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdFRyaWFsLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBpdk51bSA9IFwiSVZcIiArIGk7XG5cbiAgICAgICAgLy8gSWYgYSBwYXJzZXIgaXMgZGVmaW5lZCB1c2UgaXRzIG91dHB1dCBhcyB0aGUgdmFsdWUgb2YgdGhlIHJlc3BvbnNlXG4gICAgICAgIGlmIChsYXN0VHJpYWxbaV0ucGFyc2VyRnVuYyAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBsYXN0VHJpYWxbaV0ucGFyc2VyRnVuYyA9PT0gXCJmdW5jdGlvblwiKXsgLy8kLmlzRnVuY3Rpb24obGFzdFRyaWFsW2ldLnBhcnNlckZ1bmMpKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHN0ZE5hbWUgPSBpdk51bSArIFwiX1wiICsgbGFzdFRyaWFsW2ldLmRlc2NyaXB0aW9uO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFBhcnNlciBmdW5jdGlvbiBpbnRlcmZhY2U6XG4gICAgICAgICAgICAgKiAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICggYXJnc19wYXNzZWRfdG9fdGhpc19JVl9mb3JfdGhpc190cmlhbC4uLiwgaW5kZXgpIHt9XG4gICAgICAgICAgICAgKiAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZyAtICAgIHByb2Nlc3NlZCB2ZXJzaW9uIG9mIHRoZSBkYXRhXG4gICAgICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0IC0gICAgdmFsdWVzIGFyZSB0aGUgcHJvY2Vzc2VkIHZlcnNpb24gb2YgcGFydHMgb2YgdGhlIGRhdGEsXG4gICAgICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5cyBhcmUgbmFtZXMgZ2l2ZW4gdG8gZWFjaCBwb3J0aW9uIG9mIHRoZSBwYXJzZWQgZGF0YVxuICAgICAgICAgICAgICogKi9cblxuICAgICAgICAgICAgdmFyIHBhcnNlZF9kYXRhID0gbGFzdFRyaWFsW2ldLnBhcnNlckZ1bmMuYXBwbHkodGhpcywgbGFzdFRyaWFsW2ldLnZhbHVlLmNvbmNhdChpKSApOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSZWZlciB0byBpbnRlcmZhY2UgZGVzY3JpcHRpb24gYWJvdmVcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJzZWRfZGF0YSA9PT0gXCJzdHJpbmdcIiB8fCBwYXJzZWRfZGF0YSBpbnN0YW5jZW9mIFN0cmluZyl7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2VGb3JtYXR0ZWRbIHN0ZE5hbWUrXCJfdmFsdWVcIiBdID0gcGFyc2VkX2RhdGE7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWRkIHBhcnNlZCBJViBkYXRhIHRvIHJlc3BvbnNlXG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyc2VkX2RhdGEgIT09IG51bGwgJiYgdHlwZW9mIHBhcnNlZF9kYXRhID09PSBcIm9iamVjdFwiKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHBhcnNlZF9kYXRhKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IGtleXMubGVuZ3RoOyBrKyspe1xuICAgICAgICAgICAgICAgICAgICB2YXIga2V5X2FuZF9kYXRhX2Rlc2NyaXB0aW9uID0ga2V5c1trXTtcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2VGb3JtYXR0ZWRbIHN0ZE5hbWUrXCJfXCIra2V5X2FuZF9kYXRhX2Rlc2NyaXB0aW9uK1wiX3ZhbHVlXCIgXSA9IHBhcnNlZF9kYXRhW2tleV9hbmRfZGF0YV9kZXNjcmlwdGlvbl07IC8vIEFkZCBwYXJzZWQgZGF0YSBmb3IgdGhpcyBrZXkgdG8gcmVzcG9uc2VcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlsgUGFyc2VyIEZ1bmN0aW9uIEVycm9yIF0gLSBQYXJzZXIgZnVuY3Rpb24gZm9yIFwiK3N0ZE5hbWUrXCIgbXVzdCBvdXRwdXQgZWl0aGVyIGEgc3RyaW5nIG9yIGFuIG9iamVjdC4gWW91IG91dHB1dDpcIiwgdHlwZW9mIHBhcnNlZF9kYXRhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2UgaWYgKGxhc3RUcmlhbFtpXS52YWx1ZS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHsgLy8gQ29uc2lkZXIgdGhlc2UgdG8gYmUgZGVmYXVsdHMgZm9yIGphdmFzY3JpcHQgcHJpbWl0aXZlIHR5cGVzXG5cbiAgICAgICAgICAgIC8qKiBNYW51YWxseSB3cml0ZSBvdXQgZWFjaCBhcmd1bWVudCAoZnJvbSBhbiBhcnJheSkgdG8gYSBmaWVsZCBpbiB0aGUgb2JqZWN0XG4gICAgICAgICAgICAgKiAgT25seSBhcHBlbmQgYSBudW1iZXIgaWYgdGhlcmUgYXJlID4xIGFyZ3VtZW50cyBwYXNzZWQgaW4gKi9cblxuICAgICAgICAgICAgaWYgKGxhc3RUcmlhbFtpXS52YWx1ZS5sZW5ndGggPiAxKXtcblxuICAgICAgICAgICAgICAgIC8vSWYgdXNpbmcgYSBzZXRGdW5jIGZ1bmN0aW9uIHdpdGggbXVsdGlwbGUgYXJncyAtPiB1c2UgdGhlIGFyZyBuYW1lcyB0byBkZXNjcmliZSB0aGUgdmFsdWVzIHdyaXR0ZW4gdG8gdGhlIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgdmFyIGFyZ19uYW1lcywgYXJnX25hbWU7XG4gICAgICAgICAgICAgICAgYXJnX25hbWVzID0gZ2V0UGFyYW1OYW1lcyggc2V0RnVuY3NbIGxhc3RUcmlhbFtpXS5kZXNjcmlwdGlvbiBdICk7XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGxhc3RUcmlhbFtpXS52YWx1ZS5sZW5ndGg7ICsraikge1xuICAgICAgICAgICAgICAgICAgICBhcmdfbmFtZSA9IGFyZ19uYW1lc1tqXTtcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2VGb3JtYXR0ZWRbaXZOdW0gKyBcIl9cIiArIGxhc3RUcmlhbFtpXS5kZXNjcmlwdGlvbiArIFwiX3ZhbHVlX1wiICsgYXJnX25hbWUgXSA9ICBsYXN0VHJpYWxbaV0udmFsdWVbal07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlRm9ybWF0dGVkWyBpdk51bSArIFwiX1wiICsgbGFzdFRyaWFsW2ldLmRlc2NyaXB0aW9uICsgXCJfdmFsdWVcIiBdID0gIGxhc3RUcmlhbFtpXS52YWx1ZVswXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzcG9uc2VGb3JtYXR0ZWRbaXZOdW0gKyBcIl9cIiArIGxhc3RUcmlhbFtpXS5kZXNjcmlwdGlvbiArIFwiX3ZhbHVlXCJdID0gbGFzdFRyaWFsW2ldLnZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqIEFkZCBhIHZhbHVlIG9mIHRoZSAyYWZjIHN0ZCAoZm9yIHRoZSByZWxldmFudCBJVikgKi9cbiAgICAgICAgaWYgKGxhc3RUcmlhbFtpXS5oYXNPd25Qcm9wZXJ0eShcInN0ZF8yQUZDXCIpKSB7XG4gICAgICAgICAgICByZXNwb25zZUZvcm1hdHRlZFtcInN0ZF8yQUZDXCJdID0gbGFzdFRyaWFsW2ldLnN0ZF8yQUZDO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIENoZWNrIHRoYXQgYSAyYWZjIHN0ZCB2YWx1ZSB3YXMgYWRkZWQgLSBpZiBub3QgeW91IHdhbnQgdG8gYWRkIGEgbnVsbCB2YWx1ZSBvciBpdCB3aWxsIGZ1Y2sgdXAgdGhlIGNzdiB3cml0ZSovXG4gICAgLy8gaWYgKCFyZXNwb25zZUZvcm1hdHRlZC5oYXNPd25Qcm9wZXJ0eShcInN0ZF8yQUZDXCIpICYmIGRpZFNldDJBRkMpIHtcbiAgICAvLyAgICAgcmVzcG9uc2VGb3JtYXR0ZWRbXCJzdGRfMkFGQ1wiXSA9IFwibnVsbFwiO1xuICAgIC8vIH1cblxuICAgIC8qKiBTdG9yZSB0aGUgRFYqL1xuICAgIGlmIChvcHRpb25zICE9PSB1bmRlZmluZWQgJiYgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShcImR2X3ZhbHVlXCIpKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IF9kdk5hbWUgfHwgXCJ2YWx1ZVwiO1xuICAgICAgICByZXNwb25zZUZvcm1hdHRlZFtcIkRWX1wiK3ZhbHVlXSA9IG9wdGlvbnMuZHZfdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmVzcG9uc2VGb3JtYXR0ZWRbXCJEVl92YWx1ZVwiXSA9IFwiRVJST1IgLSBObyBEViBzdXBwbGllZFwiO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBIGRlcGVuZGVudCB2YXJpYWJsZSAoRFYpIG11c3QgYmUgc3VwcGxpZWQgYnkgdGhlIGNhbGxpbmcgY29kZS4gVGhpcyBpcyBhbiBlcnJvci5cIik7ICAgICAgIC8vIERvIG5vdCBjb250aW51ZSBpZiBEViBpcyBub3Qgc3VwcGxpZWRcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhcIlNUT1JFRCBUSElTIFJFU1BPTlNFOiBcIiwgcmVzcG9uc2VGb3JtYXR0ZWQpO1xuXG4gICAgX3Jlc3BvbnNlcy5wdXNoKHJlc3BvbnNlRm9ybWF0dGVkKTtcbn0iLCIvKipcbiAqIENyZWF0ZWQgYnkga2FpIG9uIDYvNy8xNy5cbiAqL1xuaW1wb3J0IHsgVHJpYWxzIH0gZnJvbSBcIi4vVHJpYWxzLmpzXCI7XG5cbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cbi8vICAgICAgICAgICAgICAgICAgICAgIEV4cGVyaW1lbnQgTGlmZWN5Y2xlIC0gR2V0IFBhcnRpY2lwYW50IEluZm9cbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cblxuZXhwb3J0IHZhciBfcHB0TmFtZSA9IFwidW5uYW1lZF9wcHRcIjtcbmV4cG9ydCB2YXIgX3BwdE5vID0gMDtcblxuVHJpYWxzLmdldFBwdEluZm8gPSBmdW5jdGlvbiAoKSB7XG4gICAgXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgX3BwdE5hbWUgPSBwcm9tcHQoXCJQbGVhc2UgZW50ZXIgeW91ciBuYW1lXCIpLnRyaW0oKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJuYW1lIHdhc1wiLCBfcHB0TmFtZSk7XG4gICAgICAgIGlmIChfcHB0TmFtZSA9PT0gXCJcIiB8fCBfcHB0TmFtZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgYWxlcnQoXCJOYW1lIGNhbm5vdCBiZSBibGFua1wiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgX3BwdE5vID0gcGFyc2VJbnQocHJvbXB0KFwiUGxlYXNlIGVudGVyIHlvdXIgcGFydGljaXBhbnQgbnVtYmVyXCIpKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJwcHQgbnVtYmVyIHdhc1wiLCBfcHB0Tm8pO1xuICAgICAgICBpZiAoaXNOYU4oX3BwdE5vKSkge1xuICAgICAgICAgICAgYWxlcnQoXCJQYXJ0aWNpcGFudCBudW1iZXIgbXVzdCBiZSBhbiBpbnRlZ2VyXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhcIlBhcnRpY2lwYW50IG5hbWU6IFwiLCBfcHB0TmFtZSwgXCJcXHRQYXJ0aWNpcGFudCBudW1iZXI6IFwiLCBfcHB0Tm8pO1xufTsiLCJcbmltcG9ydCB7IFRyaWFscyB9IGZyb20gXCIuL1RyaWFscy5qc1wiO1xuaW1wb3J0IHsgX3Jlc3BvbnNlcyB9IGZyb20gXCIuL1Jlc3BvbnNlSGFuZGxlci5qc1wiO1xuaW1wb3J0IHsgX3BwdE5hbWUsIF9wcHRObyB9IGZyb20gXCIuL0dldFBwdEluZm8uanNcIjtcbmltcG9ydCB7IGNyZWF0ZURvd25sb2FkTGluayB9IGZyb20gXCIuLi91dGlscy9DcmVhdGVEb3dubG9hZExpbmsuanNcIjtcblxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBFeHBlcmltZW50IExpZmVjeWNsZSAtIE91dHB1dCBSZXNwb25zZXNcbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cblxuVHJpYWxzLmZvcmNlT3V0cHV0UmVzcG9uc2VzID0gZnVuY3Rpb24oKXtcbiAgICBjb25zb2xlLmxvZyhcIkZvcmNpbmcgb3V0cHV0IG9mIF9yZXNwb25zZXNcIik7XG4gICAgX291dHB1dFJlc3BvbnNlcyhfcmVzcG9uc2VzLCB0cnVlKTtcbn07XG5cblxuZXhwb3J0IGZ1bmN0aW9uIF9vdXRwdXRSZXNwb25zZXMoYWxsUmVzcG9uc2VzLCBsb2cpIHtcblxuICAgIGlmIChhbGxSZXNwb25zZXMubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICB2YXIgY3N2U3RyaW5nID0gXCJcIjtcblxuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWxsUmVzcG9uc2VzWzBdKTtcbiAgICAvKipUaGVzZSBhcmUgYWxsIHRoZSBjb2x1bW5zIGluIHRoZSBvdXRwdXQqL1xuXG4gICAgLyoqIE1ha2UgdGhlIGhlYWRlciovXG4gICAgY3N2U3RyaW5nICs9IFwiUGFydGljaXBhbnQgTmFtZSwgUGFydGljaXBhbnQgTnVtYmVyLCBcIjsgLy9NYW51YWxseSBhZGQgaGVhZGVyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNzdlN0cmluZyArPSBrZXlzW2ldICsgXCIsXCI7XG4gICAgfVxuICAgIGNzdlN0cmluZyA9IGNzdlN0cmluZy5zbGljZSgwLCAtMSkgKyBcIlxcblwiOy8vQ3V0IHRyYWlsaW5nIGNvbW1hIGFuZCBwdXQgaW4gYSBuZXcgcm93L2xpbmVcblxuICAgIC8qKiBGaWxsIHRoZSBkYXRhIC0gVGhpcyB0aW1lIGl0cyBhbiBhcnJheSBvZiBhcnJheXMgbm90IGFycmF5IG9mIGRpY3Rpb25hcmllcyAqL1xuICAgIGZvciAoaSA9IDA7IGkgPCBhbGxSZXNwb25zZXMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICBjc3ZTdHJpbmcgKz0gX3BwdE5hbWUgKyBcIixcIiArIF9wcHRObyArIFwiLFwiOyAvL01hbmF1bGx5IGFkZCBjb250ZW50XG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBrZXlzLmxlbmd0aDsgaisrKSB7IC8vSXRlcmF0ZSBvdmVyIHRoZSBrZXlzIHRvIGdldCB0ZWggdmFsdWVzXG5cbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGFsbFJlc3BvbnNlc1tpXVtrZXlzW2pdXTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwid3JpdGluZyB0aGlzIHJhdyB2YWx1ZSBcIiwgdmFsdWUsIGtleXNbal0pO1xuICAgICAgICAgICAgLy92YWx1ZSA9IGNoZWNrUmV0dXJuUHJvcHMoIHZhbHVlLCB0cnVlICkgfHwgdmFsdWU7ICAvL1BhcnNlIG91dCByZWxldmFudCBvYmplY3QgZmllbGRzXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiQWZlciBpdCB3YXMgcGFyc2VkOlwiLCB2YWx1ZSwgXCJcXG4qKioqKioqKipcIik7XG4gICAgICAgICAgICBjc3ZTdHJpbmcgKz0gdmFsdWUgKyBcIixcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNzdlN0cmluZyA9IGNzdlN0cmluZy5zbGljZSgwLCAtMSkgKyBcIlxcblwiOyAvL0N1dCB0cmFpbGluZyBjb21tYSBhbmQgcHV0IGluIGEgbmV3IHJvdy9saW5lXG4gICAgfVxuXG4gICAgaWYgKGxvZykge1xuICAgICAgICBjb25zb2xlLmxvZyhjc3ZTdHJpbmcpO1xuICAgIH1cblxuICAgIC8qKiBIZWxwIG91dCBhIG1hY2hpbmUgdG9kYXkqL1xuICAgIHZhciBjc3ZDb250ZW50ID0gZW5jb2RlVVJJKFwiZGF0YTp0ZXh0L2NzdjtjaGFyc2V0PXV0Zi04LFwiICsgY3N2U3RyaW5nKTtcbiAgICB2YXIgYSA9IGNyZWF0ZURvd25sb2FkTGluayhcInJlc3VsdHMgKFwiICsgX3BwdE5hbWUgKyBcIixcIiArIF9wcHROby50b1N0cmluZygpICsgXCIpLmNzdlwiLCBjc3ZDb250ZW50KTtcbiAgICBhLmlubmVySFRNTCA9IFwiPGg0PkNsaWNrIHRvIGRvd25sb2FkIHJlc3VsdHMhPC9oND5cIjtcbiAgICBhLmNsYXNzTmFtZSArPSBcIiByZXN1bHRzLWRvd25sb2FkXCI7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhKTtcbiAgICBhLmNsaWNrKCk7XG59XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkga2FpIG9uIDYvNy8xNy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldENTU09uRWxlbWVudChlbGVtLCBjc3Mpe1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoY3NzKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspe1xuICAgICAgICB2YXIgYXR0cmlidXRlID0ga2V5c1tpXTtcbiAgICAgICAgZWxlbS5zdHlsZVthdHRyaWJ1dGVdID0gY3NzW2F0dHJpYnV0ZV07XG4gICAgfVxufVxuIiwiXG5cbmltcG9ydCB7IF9zZXRTaG91bGRSdW5OZXh0VHJpYWwgfSBmcm9tIFwiLi9SdW5FeHBlcmltZW50LmpzXCI7IC8vIF9zaG91bGRSdW5OZXh0VHJpYWwsXG5pbXBvcnQgeyBTZXRDU1NPbkVsZW1lbnQgfSBmcm9tIFwiLi4vdXRpbHMvU2V0Q1NTT25FbGVtZW50LmpzXCI7XG5cbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEludGVyc3RpbXVsdXMgUGF1c2UgLSBjcmVhdGlvblxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuXG5mdW5jdGlvbiBfY3JlYXRlSW50ZXJzdGltdWx1c1BhdXNlKCl7XG4gICAgdmFyIGJsYWNrb3V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBibGFja291dC5pZCA9IFwiaW50ZXJzdGltdWx1cy1wYXVzZVwiO1xuXG4gICAgdmFyIGNzcyA9IHsgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNldCBibGFja291dCBzdHlsZVxuICAgICAgICBwb3NpdGlvbjogXCJmaXhlZFwiLFxuICAgICAgICBsZWZ0OiAwLFxuICAgICAgICB0b3A6IDAsXG4gICAgICAgIHdpZHRoOiBcIjEwMHZ3XCIsXG4gICAgICAgIGhlaWdodDogXCIxMDB2aFwiLFxuICAgICAgICBiYWNrZ3JvdW5kOiBcImJsYWNrXCIsXG4gICAgICAgIGRpc3BsYXk6IFwibm9uZVwiICAgICAgICAgICAgICAgICAgICAgLy8gYmxvY2sgd2hlbiB2aXNpYmxlXG4gICAgfTtcblxuXG4gICAgU2V0Q1NTT25FbGVtZW50KGJsYWNrb3V0LCBjc3MpO1xuICAgIFxuICAgIHJldHVybiBibGFja291dDtcbn1cblxudmFyIF9ibGFja091dCA9IF9jcmVhdGVJbnRlcnN0aW11bHVzUGF1c2UoKTtcbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoX2JsYWNrT3V0KTtcblxuXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJbnRlcnN0aW11bHVzIFBhdXNlIC0gdXNlXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG5cbnZhciBQYXVzZSA9IHt9O1xuXG5QYXVzZS5zaG93SW50ZXJzdGltdWx1c1BhdXNlID0gZnVuY3Rpb24gKGR1cmF0aW9uKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgX2ludGVyc3RpbXVsdXNQYXVzZShkdXJhdGlvbikudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxudmFyIF9wYXVzZSA9IDUwMDtcblBhdXNlLnNldFBhdXNlVGltZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PT0gcGFyc2VJbnQodmFsdWUsIDEwKSkge1xuICAgICAgICBfcGF1c2UgPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJzZXRQYXVzZVRpbWUgb25seSB0YWtlcyBpbnRlZ2Vyc1wiKTtcbiAgICB9XG59O1xuXG5leHBvcnQgdmFyIF9zaG91bGRJbnRlcnN0aW11bHVzUGF1c2UgPSB0cnVlOyAgICAgICAgICAgICAgICAgICAgICAgIC8vdXNlZCBpbjogUnVuRXhwZXJpbWVudC5qc1xuUGF1c2Uuc2V0U2hvdWxkSW50ZXJzdGltdWx1c1BhdXNlID0gZnVuY3Rpb24odmFsdWUpe1xuICAgIGlmICh0eXBlb2YgIHZhbHVlID09PSBcImJvb2xlYW5cIil7XG4gICAgICAgIF9zaG91bGRJbnRlcnN0aW11bHVzUGF1c2UgPSB2YWx1ZTtcbiAgICB9XG59O1xuXG5cblxudmFyIF9pc0ludGVyc3RpbXVsdXNQYXVzZSA9IGZhbHNlO1xuZXhwb3J0IGZ1bmN0aW9uIF9pbnRlcnN0aW11bHVzUGF1c2UoZHVyYXRpb24pIHsgICAgICAgICAgICAgICAgICAgICAvLyB1c2VkIGluOiBSdW5FeHBlcmltZW50LmpzXG5cbiAgICBkdXJhdGlvbiA9IGR1cmF0aW9uID09PSB1bmRlZmluZWQgPyBfcGF1c2UgOiBkdXJhdGlvbjsgICAgICAgICAgLy9EZWZhdWx0IHRvIHBhdXNlIHRpbWUgdW5sZXNzIGFuIGFyZ3VtZW50IGlzIHN1cHBsaWVkXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXG4gICAgICAgIGlmICghX3Nob3VsZEludGVyc3RpbXVsdXNQYXVzZSkgcmVqZWN0KCk7ICAgICAgICAgICAgICAgICAgIC8vIERvbnQgc2hvdyB0aGUgcGF1c2UgaWYgaXQgaGFzbnQgYmVlbiBzZXQuIFRoaXMgY2hlY2sgaXMgYWxzbyBwZXJmb3JtZWQgaW4gUnVuRXhwZXJpbWVudC5qc1xuXG4gICAgICAgIF9zaG93SW50ZXJzdGltdWx1c1BhdXNlKF9ibGFja091dCk7XG4gICAgICAgIF9pc0ludGVyc3RpbXVsdXNQYXVzZSA9IHRydWU7XG4gICAgICAgIF9zZXRTaG91bGRSdW5OZXh0VHJpYWwoZmFsc2UpO1xuXG4gICAgICAgIC8qIFByZXZlbnQgYnV0dG9uIG1hc2hpbmcgd2hpbGUgdGhlIHBhdXNlIHJ1bnMgKi9cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIF9oaWRlSW50ZXJzdGltdWx1c1BhdXNlKF9ibGFja091dCk7XG4gICAgICAgICAgICBfaXNJbnRlcnN0aW11bHVzUGF1c2UgPSBmYWxzZTtcbiAgICAgICAgICAgIF9zZXRTaG91bGRSdW5OZXh0VHJpYWwodHJ1ZSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2Fubm90IHJlYXNzaWduIGltcG9ydGVkIHZhbHVlcywgc28geW91IG5lZWQgYSBzZXR0ZXJcblxuICAgICAgICAgICAgcmVzb2x2ZSgpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQcm9taXNlIGhhcyByZXNvbHZlZCBoZXJlXG4gICAgICAgIH0sIGR1cmF0aW9uKTtcbiAgICB9KTtcbn1cblxuXG5mdW5jdGlvbiBfaGlkZUludGVyc3RpbXVsdXNQYXVzZShibGFja291dCl7XG4gICAgYmxhY2tvdXQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xufVxuXG5mdW5jdGlvbiBfc2hvd0ludGVyc3RpbXVsdXNQYXVzZShibGFja291dCl7XG4gICAgYmxhY2tvdXQuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbn1cblxuZXhwb3J0IHsgUGF1c2UgfTsiLCIvKipcbiAqIENyZWF0ZWQgYnkga2FpIG9uIDYvNy8xNy5cbiAqL1xuXG5cbmV4cG9ydCBmdW5jdGlvbiBfQXBwbHlGdW5jdGlvblRvSFRNTENoaWxkcmVuKGVsZW0sIGZ1bmMpe1xuXG4gICAgaWYgKGVsZW0uY2hpbGRyZW4gPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgZnVuYyAhPT0gXCJmdW5jdGlvblwiICl7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIl9BcHBseUZ1bmN0aW9uVG9DaGlsZHJlbiBhY2NlcHRzIGFyZ3MgKGh0bWxfZWxlbWVudCwgZnVuYylcIik7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDAgOyBpIDwgZWxlbS5jaGlsZHJlbi5sZW5ndGg7IGkrKyl7XG4gICAgICAgIGZ1bmMoZWxlbS5jaGlsZHJlbltpXSk7XG4gICAgfVxufSIsIlxuLy8gUnVuRXhwZXJpbWVudC5qc1xuLy8gQWRkIGNvcmUgZnVuY3Rpb25hbGl0eSBmYWNpbGl0YXRpbmcgdGhlIGV4cGVyaW1lbnRhbCBsaWZlIGN5Y2xlIHRvIHRoZSBUcmlhbHMgT2JqZWN0LlxuLy8gU3VjaCBhczpcbi8vICAgICAgLSBHZXR0aW5nIHBhcnRpY2lwYW50IGluZm9cbi8vICAgICAgLSBSdW5uaW5nIHRoZSBuZXh0IHRyaWFsIChzZXR0aW5nIElWcyBldGMpXG4vLyAgICAgIC0gU3RvcmluZyBhIHJlc3BvbnNlXG4vLyAgICAgIC0gT3V0cHV0dGluZyByZXNwb25zZXNcbi8vICAgICAgLSBNaWQvZW5kIGNhbGxiYWNrc1xuXG5cbmltcG9ydCB7IFRyaWFscywgc2V0RnVuY3MsIF9hbGxUcmlhbHMsIF9kaWRCdWlsZFRyaWFscywgX2R2TmFtZSB9IGZyb20gXCIuL1RyaWFscy5qc1wiO1xuaW1wb3J0IHsgX3N0b3JlUmVzcG9uc2UsIF9yZXNwb25zZXMgfSBmcm9tIFwiLi9SZXNwb25zZUhhbmRsZXIuanNcIjtcbmltcG9ydCB7IF9vdXRwdXRSZXNwb25zZXMgfSBmcm9tIFwiLi9PdXRwdXRSZXNwb25zZXMuanNcIjtcbmltcG9ydCB7IF9pbnRlcnN0aW11bHVzUGF1c2UsIF9zaG91bGRJbnRlcnN0aW11bHVzUGF1c2UgfSBmcm9tIFwiLi9JbnRlcnN0aW11bHVzUGF1c2UuanNcIjtcbmltcG9ydCB7IGdldFBhcmFtTmFtZXMgfSBmcm9tIFwiLi4vdXRpbHMvU3RyaW5nVXRpbHMuanNcIjtcbmltcG9ydCB7IF9BcHBseUZ1bmN0aW9uVG9IVE1MQ2hpbGRyZW4gfSBmcm9tIFwiLi4vdXRpbHMvRE9NVXRpbHMuanNcIjtcblxuXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICBFeHBlcmltZW50IExpZmVjeWNsZSAtIFN0YXJ0ICYgR2FtZSBMb29wXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG5cbi8vQ2Fubm90IHJlYXNzaWduIGltcG9ydGVkIHZhbHVlcywgc28geW91IG5lZWQgYSBzZXR0ZXIgKHVzZWQgaW4gSW50ZXJzdGltbHVzUGF1c2UuanMpXG5leHBvcnQgZnVuY3Rpb24gX3NldFNob3VsZFJ1bk5leHRUcmlhbCh2YWx1ZSl7XG4gICAgaWYgKHR5cGVvZih2YWx1ZSkgPT09IFwiYm9vbGVhblwiKXtcbiAgICAgICAgX3Nob3VsZFJ1bk5leHRUcmlhbCA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImNhbm5vdCBzZXQgX3Nob3VsZFJ1bk5leHRUcmlhbCB0byBhIG5vbiBib29sZWFuIHZhbHVlXCIpO1xuICAgIH1cbn1cblxuZXhwb3J0IHZhciBfc2hvdWxkUnVuTmV4dFRyaWFsID0gdHJ1ZTsgLy91c2VkIGJ5OiBJbnRlcnN0aW11bHVzUGF1c2UuanNcblRyaWFscy5ydW5OZXh0VHJpYWwgPSBmdW5jdGlvbiAoc2V0dGluZ3MpIHsgLy8gdXNhZ2UgLT4gcnVuTmV4dFRyaWFsKHtzaG91bGRTdG9yZVJlc3BvbnNlOiB0cnVlLCBkdl92YWx1ZTogXCJpbnNpZGVcIn0pO1xuXG4gICAgaWYgKCFfZGlkQnVpbGRUcmlhbHMpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJydW5OZXh0VHJpYWwoKTogVHJpYWwgd2VyZSBub3QgYnVpbHRcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoX3Nob3VsZFJ1bk5leHRUcmlhbCkge1xuXG4gICAgICAgIGlmIChfc2hvdWxkUnVuTWlkQ2FsbGJhY2soKSAmJiBfbWlkQ2FsbGJhY2sgIT09IG51bGwpIHtcbiAgICAgICAgICAgIF9taWRDYWxsYmFjaygpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF9zaG91bGRJbnRlcnN0aW11bHVzUGF1c2UpIHtcbiAgICAgICAgICAgIF9pbnRlcnN0aW11bHVzUGF1c2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZXR0aW5ncyAhPT0gdW5kZWZpbmVkICYmIHNldHRpbmdzLmhhc093blByb3BlcnR5KFwic2hvdWxkU3RvcmVSZXNwb25zZVwiKSAmJiBzZXR0aW5ncy5zaG91bGRTdG9yZVJlc3BvbnNlKSB7XG4gICAgICAgICAgICBfc3RvcmVSZXNwb25zZShzZXR0aW5ncyk7IC8vU2V0dGluZ3MgY29udGFpbnMgYSBmaWVsZCBcImR2X3ZhbHVlXCIgd2hpY2ggaXMgYWxzbyByZWFkIGJ5IF9zdG9yZVJlc3BvbnNlXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoX2FsbFRyaWFscy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBfZGlzcGxheU5leHRUcmlhbCgpO1xuXG4gICAgICAgICAgICAvLyBfY3VyMkFGQ0lzVGFyZ2V0ID0gdHJ1ZTtcbiAgICAgICAgICAgIC8qKiBBbHdheXMgcmVzZXQgdGhlIDJBRkMgdmFsdWUqL1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlRoZXJlIGFyZSBcIiwgX2FsbFRyaWFscy5sZW5ndGgsIFwiIHRyaWFscyByZW1haW5pbmcuXCIpO1xuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAvL1Bvc3NpYmx5IHRvbyBkZXN0cnVjdGl2ZVxuICAgICAgICAgICAgLy8gJChkb2N1bWVudC5ib2R5KS5jaGlsZHJlbigpLmZhZGVPdXQoKTtcbiAgICAgICAgICAgIF9BcHBseUZ1bmN0aW9uVG9IVE1MQ2hpbGRyZW4oZG9jdW1lbnQuYm9keSwgZnVuY3Rpb24oY2hpbGQpe1xuICAgICAgICAgICAgICAgIGNoaWxkLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBfb3V0cHV0UmVzcG9uc2VzKF9yZXNwb25zZXMpO1xuXG4gICAgICAgICAgICBpZiAoIHR5cGVvZiBfZW5kQ2FsbEJhY2sgPT09IFwiZnVuY3Rpb25cIikgX2VuZENhbGxCYWNrKCk7XG5cbiAgICAgICAgfVxuICAgIH1cblxufTtcblxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuLy8gICAgICAgICAgICAgICAgICBFeHBlcmltZW50IExpZmVjeWNsZSAtIE1pZCBQb2ludCBDYWxsYmFjayAoaS5lLiB0aGUgXCJ0YWtlIGEgYnJlYWtcIiBtZXNzYWdlKVxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuXG5cbnZhciBfbWlkQ2FsbGJhY2sgPSBudWxsO1xuVHJpYWxzLnNldE1pZENhbGxiYWNrID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgaWYgKHR5cGVvZiBmbiA9PT0gXCJmdW5jdGlvblwiKXtcbiAgICAgICAgX21pZENhbGxiYWNrID0gZm47XG4gICAgfSAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJbIHNldE1pZENhbGxiYWNrIEVSUk9SIF0gLSBGaXJzdCBhcmd1bWVudCB0byBzZXRNaWRDYWxsYmFjayBtdXN0IGJlIGEgZnVuY3Rpb25cIik7XG4gICAgfVxufTtcblxudmFyIF9kaWRSdW5NaWRDYWxsYmFjayA9IGZhbHNlO1xuZnVuY3Rpb24gX3Nob3VsZFJ1bk1pZENhbGxiYWNrKCkge1xuICAgIGlmIChfZGlkUnVuTWlkQ2FsbGJhY2spIHJldHVybiBmYWxzZTtcblxuICAgIC8vIFRyaWFscyBhcmUgcG9wcGVkLCByZXNwb25zZXMgYXJlIHB1c2hlZC5cbiAgICAvLyBNaWQgcG9pbnQgPSB0aGVyZSBhcmUgYXMgbWFueSByZXNwb25zZXMgYXMgdHJpYWxzIChvciBhIGRpZmZlcmVuY2Ugb2Ygb25lIGZvciBvZGQgbnVtYmVyIG9mIHRyaWFscylcbiAgICBpZiAoX2FsbFRyaWFscy5sZW5ndGggPT09X3Jlc3BvbnNlcy5sZW5ndGggfHwgTWF0aC5hYnMoX2FsbFRyaWFscy5sZW5ndGggLV9yZXNwb25zZXMubGVuZ3RoKSA9PT0gMSl7XG4gICAgICAgIF9kaWRSdW5NaWRDYWxsYmFjayA9IHRydWU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cblxuLy8gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPVxuLy8gICAgICAgICAgICAgRXhwZXJpbWVudCBMaWZlY3ljbGUgLSBFbmQgQ2FsbGJhY2sgKGEgYmVoYXZpb3VyIGF0IHRoZSBlbmQgb2YgdGhlIGV4cGVyaW1lbnQpXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG52YXIgX2VuZENhbGxCYWNrID0gbnVsbDtcblRyaWFscy5zZXRFbmRDYWxsYmFjayA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIil7XG4gICAgICAgIF9lbmRDYWxsQmFjayA9IHZhbHVlO1xuICAgIH0gICBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWyBzZXRFbmRDYWxsYmFjayBFUlJPUiBdIC0gRmlyc3QgYXJndW1lbnQgdG8gc2V0RW5kQ2FsbGJhY2sgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpO1xuICAgIH1cbn07XG5cbi8vID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRXhwZXJpbWVudCBMaWZlY3ljbGUgLSBEaXNwbGF5aW5nIFRoZSBOZXh0IFRyaWFsXG4vLyA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9XG5cbi8qKiBXaGVyZSB2aWV3LWxldmVsIGVsZW1lbnRzIGFyZSBzZXQgLSB0aGlzIGlzIGxpa2UgdGhlIENPTlRST0xMRVIgbWV0aG9kIGludGVyZmFjaW5nIGJldHdlZW4gTU9ERUwgYW5kIFZJRVcqL1xuZnVuY3Rpb24gX2Rpc3BsYXlOZXh0VHJpYWwoKSB7XG4gICAgdmFyIG5leHRUcmlhbCA9IF9hbGxUcmlhbHNbX2FsbFRyaWFscy5sZW5ndGggLSAxXTsgLy9BbHdheXMgZ28gZnJvbSB0aGUgYmFja1xuICAgIGNvbnNvbGUubG9nKFwiRGlzcGxheWluZyBuZXh0IHRyaWFsOlwiLCBuZXh0VHJpYWwpO1xuXG4gICAgLyoqIEl0ZXJhdGUgb3ZlciBlYWNoIElWIGFuZCBzZXQgaXRzIHBvaW50ZXIgdG8gaXRzIHZhbHVlIGZvciB0aGF0IHRyaWFsICovXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuZXh0VHJpYWwubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGN1cl9pdiA9IG5leHRUcmlhbFtpXTtcbiAgICAgICAgX2ZpcmVJVlNldEZ1bmNXaXRoQXJncyhjdXJfaXYpO1xuXG4gICAgfVxufVxuXG5mdW5jdGlvbiBfZmlyZUlWU2V0RnVuY1dpdGhBcmdzKGN1cl9pdikge1xuXG4gICAgLyoqIFVzaW5nIGEgRlVOQ1RJT04gdG8gc2V0IHRoZSBkaXNwbGF5Ki9cbiAgICBpZiAoIHNldEZ1bmNzW2N1cl9pdi5kZXNjcmlwdGlvbl0gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgc2V0RnVuY3NbY3VyX2l2LmRlc2NyaXB0aW9uXS5hcHBseShudWxsLCBjdXJfaXYudmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIHNldHRlciBmdW5jdGlvbiBzdXBwbGllZCBieTogXCIgKyBjdXJfaXYpO1xuICAgIH1cbn1cblxuIiwiLyogPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID1cbiAqXG4gKiAgIFN0b3JlIHJlcHNvbnNlcyBpbiBsb2NhbFN0b3JhZ2UuXG4gKiAgIExvY2Fsc3RvcmFnZSBjb252ZXJ0cyBldmVyeXRoaW5nIHRvIEpTT04gc28gb2JqZWN0IHR5cGVzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZCB3aWxsIGJlIGxvc3RcbiAqICAgVG8gcHJlc2VydmUgdGhlc2UgdW5jb252ZXJ0YmxlIGRhdGEsIHlvdSBuZWVkIHRvIHNwZWNpZnkgYSBQQVJTRVIgYW5kIFVOUEFSU0VSIGZvciB0cmlhbHMgYW5kIGZvciByZXNwb25zZXNcbiAqICAgT24gU2F2ZTogdGhlIHNldHRlciByZXBsYWNlcyB0aGUgdW5jb252ZXJ0aWJsZSBkYXRhIHdpdGggYSB0b2tlblxuICogICBPbiBMb2FkOiBUaGUgZ2V0dGVyIGNoZWNrcyB0aGUgdG9rZW4gYW5kIHJlcGxhY2VzIGl0IHdpdGggdGhlIGNvcnJlY3QgdW5jb252ZXJ0aWJsZSBvYmplY3QuXG4gKlxuICogID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ID0gPSA9ICovXG5cblxuaW1wb3J0IHsgVHJpYWxzLF9hbGxUcmlhbHMsIF9zZXRBbGxUcmlhbHMsIF9kaWRCdWlsZFRyaWFsc30gZnJvbSBcIi4vVHJpYWxzLmpzXCI7XG5pbXBvcnQgeyBfcmVzcG9uc2VzLCBfc2V0UmVzcG9uc2VzIH0gZnJvbSBcIi4vUmVzcG9uc2VIYW5kbGVyLmpzXCI7XG5pbXBvcnQgeyBTZXRDU1NPbkVsZW1lbnQgfSBmcm9tIFwiLi4vdXRpbHMvU2V0Q1NTT25FbGVtZW50LmpzXCI7XG5cbnZhciBTYXZlcyA9IHt9O1xuXG4vLyBUT0RPOiBTZXQgdGhlc2UgdG8gdGVtcF90cmlhbF9wYXJzZXJcblNhdmVzLnBhcnNlVHJpYWxzRm9yU2F2aW5nID0gdW5kZWZpbmVkOyAgICAgICAgICAgICAgICAgICAgIC8vaW50ZXJmYWNlIGlzIGZ1bmN0aW9uKF9hbGxUcmlhbHMpey4uLn0gcmV0dXJuIGEgcGFyc2VkIGNvcHkgb2YgYG1vZGlmaWVkYCBfYWxsVHJpYWxzXG5TYXZlcy5wYXJzZVJlc3BvbnNlc0ZvclNhdmluZyA9IHVuZGVmaW5lZDsgICAgICAgICAgICAgICAgICAvL2ludGVyZmFjZSBpcyBmdW5jdGlvbihfcmVzcG9uc2VzKXsuLi59IHJldHVybiBhIHBhcnNlZCBjb3B5IG9mIGBtb2RpZmllZGAgX3Jlc3BvbnNlc1xuU2F2ZXMudW5wYXJzZVNhdmVkVHJpYWxzID0gdW5kZWZpbmVkO1xuU2F2ZXMudW5wYXJzZVNhdmVkUmVzcG9uc2VzID0gdW5kZWZpbmVkO1xuXG4vLyBUT0RPOiB3cml0ZSBhIGRlZmF1bHQgcGFyc2VyIHRoYXQgY2hlY2tzIHdoZXRoZXIgYW4gb2JqZWN0IGNhbiBiZSBzZXJpYWxpc2VkLiBJZiBub3QgdGhyb3cgYW4gZXJyb3IgdGhhdCByZXF1ZXN0cyBhIHNlcmlhbGlzZXIgdG8gYmUgd3JpdHRlblxuZnVuY3Rpb24gdGVtcF90cmlhbF9wYXJzZXIoYWxsVHJpYWxzLCBlcnIpe1xuXG4gICAgLy8gQ2hlY2sgZm9yIHRoZSBwcmVzZW5jZSBvZiB1bmRlZmluZWQsIGZ1bmN0aW9uLCBzeW1ib2wgPT4gdGhlc2UgY2F1c2UgdGhlIEpTT04uc3RyaW5naWZ5IGZ1bmMgdG8gZmFpbFxuICAgIGFsbFRyaWFscy5tYXAoZnVuY3Rpb24oZWxlbSwgaSwgYWxsKXtcbiAgICAgICAgdmFyIGN1cl9jaGlsZF9lbGVtID0gZWxlbTsgLy8gUmVjdXJzZSBvdmVyIGVsZW1lbnRzIGFuZCBjaGVjayB0aGVtIGZvciB0aGUgYmFkIGRhdGF0eXBlc1xuICAgICAgICBpZiAodHlwZW9mIGN1cl9jaGlsZF9lbGVtID09PSBcImZ1bmN0aW9uXCIgfHwgY3VyX2NoaWxkX2VsZW0gPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBhbGxUcmlhbHM7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENhbiBiZSBzYWZlbHkgc2VyaWFsaXNlZFxufVxuXG5mdW5jdGlvbiBlcnJvckNoZWNrU2F2aW5nUGFyc2Vycygpe1xuICAgIGlmIChTYXZlcy5wYXJzZVRyaWFsc0ZvclNhdmluZyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgcmVzdG9yZSB0cmlhbHMgd2l0aG91dCBwYXJzaW5nIGZ1bmN0aW9uXCIpO1xuICAgIGlmIChTYXZlcy5wYXJzZVJlc3BvbnNlc0ZvclNhdmluZyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgcmVzdG9yZSBfcmVzcG9uc2VzIHdpdGhvdXQgcGFyc2luZyBmdW5jdGlvblwiKTtcbiAgICBpZiAoU2F2ZXMudW5wYXJzZVNhdmVkVHJpYWxzID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCByZXN0b3JlIHRyaWFscyB3aXRob3V0IFVOcGFyc2luZyBmdW5jdGlvblwiKTtcbiAgICBpZiAoU2F2ZXMudW5wYXJzZVNhdmVkUmVzcG9uc2VzID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCByZXN0b3JlIF9yZXNwb25zZXMgd2l0aG91dCBVTnBhcnNpbmcgZnVuY3Rpb25cIik7XG59XG5cblNhdmVzLmNsZWFyU2F2ZXMgPSBmdW5jdGlvbigpe1xuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwiZXhwZXJpbWVudEpTc2F2ZXNcIik7XG59O1xuXG5TYXZlcy5zYXZlQnVpbHRUcmlhbHNBbmRSZXNwb25zZXMgPSBmdW5jdGlvbigpIHtcblxuICAgIGVycm9yQ2hlY2tTYXZpbmdQYXJzZXJzKCk7XG5cbiAgICBpZiAodHlwZW9mKFN0b3JhZ2UpICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cbiAgICAgICAgLy8gbG9jYWxTdG9yYWdlLmV4cGVyaW1lbnRKU3NhdmVzID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIHZhciB0cmlhbHNGb3JTYXZpbmcgPSBTYXZlcy5wYXJzZVRyaWFsc0ZvclNhdmluZyhfYWxsVHJpYWxzKTsgICAgICAgICAgICAgICAgICAgLy9QYXJzZSB5b3VyIHRyaWFscywgdXNpbmcgdGhlIGN1c3RvbSBzZXJpYWxpemVyLi5cbiAgICAgICAgdmFyIHJlc3BvbnNlc0ZvclNhdmluZyA9IFNhdmVzLnBhcnNlUmVzcG9uc2VzRm9yU2F2aW5nKF9yZXNwb25zZXMpO1xuXG4gICAgICAgIHZhciBleHBlcmltZW50SlNzYXZlcyA9IHt9OyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9KU09OaWZ5IHRoZSB0cmlhbHMgYW5kIF9yZXNwb25zZXNcbiAgICAgICAgZXhwZXJpbWVudEpTc2F2ZXNbXCJ0cmlhbHNcIl0gPSB0cmlhbHNGb3JTYXZpbmc7XG4gICAgICAgIGV4cGVyaW1lbnRKU3NhdmVzW1wicmVzcG9uc2VzXCJdID0gcmVzcG9uc2VzRm9yU2F2aW5nO1xuXG4gICAgICAgIHZhciBtc2cgPSBwcm9tcHQoXCJBZGQgYSBtZXNzYWdlIHRvIHRoaXMgc2F2ZSFcIik7XG5cbiAgICAgICAgaWYgKG1zZyA9PT0gbnVsbCl7XG4gICAgICAgICAgICBhbGVydChcIlRyaWFscyB3aWxsIG5vdCBiZSBzYXZlZFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkYXRlS2V5ID0gKG5ldyBEYXRlKCkpLnRvVVRDU3RyaW5nKCk7IC8vVmVyeSBjbGVhciBkYXRlXG5cbiAgICAgICAgLy9NYWtlIGEgbmV3IGRpY3Rpb25hcnkgb3IgZ2V0IHRoZSBvbGQgb25lXG4gICAgICAgIHZhciBrZXllZF9ieV9kYXRlcyA9IChsb2NhbFN0b3JhZ2UuZXhwZXJpbWVudEpTc2F2ZXMgPT09IHVuZGVmaW5lZCkgPyB7fSA6IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmV4cGVyaW1lbnRKU3NhdmVzKTtcblxuICAgICAgICBrZXllZF9ieV9kYXRlc1ttc2cgKyBcIiAtIFwiICtkYXRlS2V5XSA9IGV4cGVyaW1lbnRKU3NhdmVzOyAgICAgICAgICAgICAgICAgICAgICAgLy9zYXZlIHRvIGl0XG5cbiAgICAgICAgbG9jYWxTdG9yYWdlLmV4cGVyaW1lbnRKU3NhdmVzID0gSlNPTi5zdHJpbmdpZnkoa2V5ZWRfYnlfZGF0ZXMpOyAgICAgICAgICAgICAgICAvL3NlcmlhbGl6ZSFcblxuICAgICAgICBjb25zb2xlLmxvZyhcIlNhdmVkIFRyaWFsc1wiLCBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5leHBlcmltZW50SlNzYXZlcykpO1xuICAgIH1cbn07XG5cblxuU2F2ZXMubG9hZFNhdmVkVHJpYWxzQW5kUmVzcG9uc2VzID0gZnVuY3Rpb24oKXtcbiAgICBcbiAgICBlcnJvckNoZWNrU2F2aW5nUGFyc2VycygpO1xuXG4gICAgdmFyIGV4cGVyaW1lbnRKU3NhdmVzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZXhwZXJpbWVudEpTc2F2ZXMpO1xuXG4gICAgY29uc29sZS5sb2coXCJhbGwgc2F2ZXM6IFwiLCBleHBlcmltZW50SlNzYXZlcyk7XG5cblxuICAgIHZhciBzZWxlY3RfZHJvcGRvd25fY29tcG9uZW50cyA9IF9jcmVhdGVEcm9wRG93blNlbGVjdChleHBlcmltZW50SlNzYXZlcyk7ICAgICAgICAgIC8vIERpc3BsYXkgdGhlIHNhdmVzIGluIGEgZHJvcGRvd24gc2VsZWN0XG5cbiAgICBzZWxlY3RfZHJvcGRvd25fY29tcG9uZW50cy5idXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7ICAgICAgICAgICAgLy8gVE9ETyByZWltcGxlbWVudCBhcyBhIGpzIG9uQ2xpY2sgZXZlbnQgaGFuZGxlclxuXG4gICAgICAgIC8vIHZhciBzYXZlc19mcm9tX3NlbGVjZWRfZGF0ZSA9IHNlbGVjdF9kcm9wZG93bl9jb21wb25lbnRzLnNlbGVjdC5maW5kKFwiOnNlbGVjdGVkXCIpLnRleHQoKTtcbiAgICAgICAgdmFyIHNlbGVjdCA9IHNlbGVjdF9kcm9wZG93bl9jb21wb25lbnRzLnNlbGVjdDtcbiAgICAgICAgdmFyIHNhdmVzX2Zyb21fc2VsZWNlZF9kYXRlID0gc2VsZWN0Lm9wdGlvbnNbc2VsZWN0LnNlbGVjdGVkSW5kZXhdLnRleHQ7XG5cbiAgICAgICAgc2F2ZXNfZnJvbV9zZWxlY2VkX2RhdGUgPSBleHBlcmltZW50SlNzYXZlc1tzYXZlc19mcm9tX3NlbGVjZWRfZGF0ZV07XG5cbiAgICAgICAgX3NldEFsbFRyaWFscyggU2F2ZXMudW5wYXJzZVNhdmVkVHJpYWxzKCBzYXZlc19mcm9tX3NlbGVjZWRfZGF0ZVtcInRyaWFsc1wiXSkgKTsgICAgICAgICAgICAgICAgLy8gVW5wYXJzZSB5b3VyIHRyaWFscyB1c2luZyBjdXN0b20gdW5zZXJpYWxpc2VyXG4gICAgICAgIF9zZXRSZXNwb25zZXMoIFNhdmVzLnVucGFyc2VTYXZlZFJlc3BvbnNlcyggc2F2ZXNfZnJvbV9zZWxlY2VkX2RhdGVbXCJyZXNwb25zZXNcIl0pICk7XG4gICAgICAgIGlmIChfcmVzcG9uc2VzID09PSB1bmRlZmluZWQgfHwgX3Jlc3BvbnNlcyA9PT0gbnVsbCkgX3NldFJlc3BvbnNlcyggW10gKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhcInJlc3RvcmVkIGFsbCB0cmlhbHM6IFwiLCBfYWxsVHJpYWxzKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJyZXN0b3JlZCBhbGwgX3Jlc3BvbnNlczogXCIsIF9yZXNwb25zZXMpO1xuXG4gICAgICAgIFRyaWFscy5ydW5OZXh0VHJpYWwoKTtcblxuICAgICAgICAvL1JlbW92ZSBzZWxlY3QgZnJvbSBkb21cblxuICAgICAgICAvLyBzZWxlY3RfZHJvcGRvd25fY29tcG9uZW50cy53cmFwLnJlbW92ZSgpO1xuICAgICAgICBzZWxlY3RfZHJvcGRvd25fY29tcG9uZW50cy53cmFwLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2VsZWN0X2Ryb3Bkb3duX2NvbXBvbmVudHMud3JhcCk7XG4gICAgfSk7XG5cbiAgICBzZWxlY3RfZHJvcGRvd25fY29tcG9uZW50cy5idXR0b25fY2xlYXIuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgaWYgKHdpbmRvdy5jb25maXJtKFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSBhbGwgc2F2ZWQgZXhwZXJpbWVudHM/XCIpKXtcbiAgICAgICAgICAgIFNhdmVzLmNsZWFyU2F2ZXMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vUmVtb3ZlIHNlbGVjdCBmcm9tIERPTVxuICAgICAgICAvLyBzZWxlY3RfZHJvcGRvd25fY29tcG9uZW50cy53cmFwLnJlbW92ZSgpO1xuICAgICAgICBzZWxlY3RfZHJvcGRvd25fY29tcG9uZW50cy53cmFwLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2VsZWN0X2Ryb3Bkb3duX2NvbXBvbmVudHMud3JhcCk7XG4gICAgfSk7XG5cbn07XG5cblxuXG4vLyBUT0RPOiBWZXJpZnkgdGhhdCBubyBqUXVlcnkgaXMgYmVpbmcgdXNlZCFcbmZ1bmN0aW9uIF9jcmVhdGVEcm9wRG93blNlbGVjdChhbGxfc2F2ZXMpe1xuXG4gICAgLy8gdmFyIHNhdmVzX2RpYWxvZ193cmFwID0gJChcIjxzYXZlc19kaWFsb2dfd3JhcD5cIiwge1xuICAgIC8vICAgICBpZDogXCJzYXZlZF9pbmZvXCJcbiAgICAvLyB9KTtcblxuICAgIHZhciBzYXZlc19kaWFsb2dfd3JhcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzYXZlc19kaWFsb2dfd3JhcFwiKTtcbiAgICBzYXZlc19kaWFsb2dfd3JhcC5pZCA9IFwic2F2ZWRfaW5mb1wiO1xuXG4gICAgLy9NYWtlIGEgc2VsZWN0IHRvIGNob29zZSBmcm9tIHRoZSBzYXZlc1xuICAgIC8vIHZhciBzZWwgPSAkKFwiPHNlbGVjdD5cIik7XG4gICAgdmFyIHNlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzZWxlY3RcIik7XG5cbiAgICBPYmplY3Qua2V5cyhhbGxfc2F2ZXMpLm1hcChmdW5jdGlvbihlbGVtLCBpLCBhbGwpe1xuXG4gICAgICAgIHZhciBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO1xuICAgICAgICBvcHRpb24udmFsdWUgPSBpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBVc2UgdGhlIGFsbF9zYXZlcyBpbmRleCBhcyB0aGUga2V5XG4gICAgICAgIG9wdGlvbi50ZXh0ID0gZWxlbTtcbiAgICAgICAgc2VsLmFwcGVuZENoaWxkKG9wdGlvbik7XG4gICAgICAgIC8vIHNlbC5hcHBlbmQoJChcIjxvcHRpb24+XCIpLmF0dHIoXCJ2YWx1ZVwiLGkpLnRleHQoZWxlbSkpO1xuICAgIH0pO1xuXG5cbiAgICAvL0J1dHRvbiAtIG5vIGZ1bmN0aW9uYWxpdHkgaGVyZSwganVzdCB2aWV3XG4gICAgLy8gdmFyIGIgPSAkKFwiPGJ1dHRvbj5cIikudGV4dChcIkNob29zZVwiKTtcbiAgICB2YXIgYiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgYi5pbm5lckhUTUwgPSBcIkNob29zZVwiO1xuXG5cbiAgICAvLyB2YXIgYl9jbGVhciA9ICQoXCI8YnV0dG9uPlwiKS50ZXh0KFwiQ2xlYXJcIik7XG4gICAgdmFyIGJfY2xlYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgIGJfY2xlYXIuaW5uZXJIVE1MID0gXCJDbGVhclwiO1xuXG4gICAgXG4gICAgc2F2ZXNfZGlhbG9nX3dyYXAuYXBwZW5kQ2hpbGQoc2VsKTtcbiAgICBzYXZlc19kaWFsb2dfd3JhcC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnJcIikpO1xuICAgIHNhdmVzX2RpYWxvZ193cmFwLmFwcGVuZENoaWxkKGIpO1xuICAgIHNhdmVzX2RpYWxvZ193cmFwLmFwcGVuZENoaWxkKGJfY2xlYXIpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2F2ZXNfZGlhbG9nX3dyYXApO1xuXG4gICAgdmFyIGNzcyA9IHtcbiAgICAgICAgcG9zaXRpb246IFwiZml4ZWRcIixcbiAgICAgICAgdG9wOiBcIjQ1dmhcIixcbiAgICAgICAgbGVmdDogXCIyNXZ3XCIsXG4gICAgICAgIHdpZHRoOiBcIjUwdndcIixcbiAgICAgICAgaGVpZ2h0OiBcIjV2aFwiLFxuICAgICAgICBiYWNrZ3JvdW5kOiBcIndoaXRlXCIsXG4gICAgICAgIGJvcmRlcjogXCIydndcIixcbiAgICAgICAgXCJ0ZXh0LWFsaWduXCI6IFwiY2VudGVyXCJcbiAgICB9O1xuICAgIFNldENTU09uRWxlbWVudChzYXZlc19kaWFsb2dfd3JhcCwgY3NzKTtcblxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2VsZWN0OiBzZWwsXG4gICAgICAgIGJ1dHRvbjogYixcbiAgICAgICAgYnV0dG9uX2NsZWFyOiBiX2NsZWFyLFxuICAgICAgICB3cmFwOiBzYXZlc19kaWFsb2dfd3JhcFxuICAgIH07XG59XG5cblxuZXhwb3J0IHsgU2F2ZXMgfTsiLCIvL09yZGVyIG9mIGltcG9ydHMgaXMgaW1wb3J0YW50XG5cbi8qIEltcG9ydCBUcmlhbHMgYW5kIGV4dGVuZCBpdCB3aXRoIGFkZGl0aW9uYWwgZnVuY3Rpb25hbGl0eSovXG5pbXBvcnQgeyBUcmlhbHMgfSBmcm9tICBcIi4vVHJpYWxzLmpzXCI7IC8vTmVlZHMgLi8gdG8gdHJlYXQgaXQgYXMgYW4gaW50ZXJuYWwgKG5vdCBleHRlcm5hbCBkZXBlbmRlbmN5KVxuaW1wb3J0IFwiLi9SdW5FeHBlcmltZW50LmpzXCI7ICAgICAgICAgICAvLyBFeHRlbmRzIHRoZSBmdW5jdGlvbmFsaXR5IG9mIHRoZSBUcmlhbHMgb2JqZWN0XG5pbXBvcnQgXCIuL091dHB1dFJlc3BvbnNlcy5qc1wiO1xuaW1wb3J0IFwiLi9HZXRQcHRJbmZvLmpzXCI7XG5cbmltcG9ydCB7IFBhdXNlIH0gZnJvbSAgXCIuL0ludGVyc3RpbXVsdXNQYXVzZS5qc1wiO1xuaW1wb3J0IHsgU2F2ZXMgfSBmcm9tIFwiLi9TYXZlcy5qc1wiO1xuXG4vL1RoZXNlIGFyZSB0aGUgZmllbGRzIG9mIEV4cGVyaW1lbnRKU1xuZXhwb3J0IHsgVHJpYWxzIH07XG5leHBvcnQgeyBQYXVzZSB9O1xuZXhwb3J0IHsgU2F2ZXMgfTsiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQU8sU0FBUyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDOztJQUU5QyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3BDLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ2QsQ0FBQyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7SUFDcEIsQ0FBQyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7O0lBRXRCLE9BQU8sQ0FBQyxDQUFDOzs7QUNQYjs7O0FBR0EsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsWUFBWTtJQUNsQyxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLGNBQWMsRUFBRSxXQUFXLENBQUM7OztJQUc1RCxPQUFPLENBQUMsS0FBSyxZQUFZLEVBQUU7OztRQUd2QixXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsWUFBWSxDQUFDLENBQUM7UUFDdkQsWUFBWSxJQUFJLENBQUMsQ0FBQzs7O1FBR2xCLGNBQWMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLElBQUksQ0FB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
