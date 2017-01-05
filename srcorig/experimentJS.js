
//MERGED
(function( exports ) {

    /*jslint es5: true, camelcase: false, quotmark: false */
    exports.test = function(){
        alert("testing!");
    };

    /**
     * TODO: Take all 2AFC out of the main file and put it in its own submodule that can be 'added on'...
     * */

    /** ~~ ** SET IVs and DVs~~ ** SET IVs and DVs~~ ** SET IVs and DVs~~ ** SET IVs and DVs~~ ** SET IVs and DVs **/
    /** ~~ ** SET IVs and DVs~~ ** SET IVs and DVs~~ ** SET IVs and DVs~~ ** SET IVs and DVs~~ ** SET IVs and DVs **/
    /** ~~ ** SET IVs and DVs~~ ** SET IVs and DVs~~ ** SET IVs and DVs~~ ** SET IVs and DVs~~ ** SET IVs and DVs **/
    
    // <<ported>>
    function setIVGeneric(ivName, fieldName, fieldVal) {
        csvFodderCheck(ivName);
        csvFodderCheck(fieldName);
        if (!window.IVs.hasOwnProperty(ivName)) { //If IV doenst exists make it as a raw object
            window.IVs[ivName] = {};
        }

        window.IVs[ivName][fieldName] = fieldVal;
    }

    // <<ported>>
    window.IVs = {};

    // <<ported>>
    //Functions are stored here, keyed by their IV name (i.e. .description)
    window.setFuncs = {};

    // <<ported>>
    /** Every IV requires 2 steps: creating the levels and then, setting the target */
    exports.setIVLevels = function (ivname, levels) {
        setIVGeneric(ivname, 'levels', levels);
    };

    // <<ported>>
    exports.setIVsetFunc = function(ivname, setFunc) {

        //This is now a flag to notify ExperimentJS that you're using functions
        setIVGeneric(ivname, 'setFunc', true);

        //Functions are now stored in their own map, keyed by ivname
        setSetFunc(ivname, setFunc);
    };

    // <<ported>>
    function setSetFunc(ivname, setfunc){
        window.setFuncs[ivname] = setfunc;
    }


    /** ~  ~ ~ ~~  ~ ~ ~~  ~ ~ ~~  ~ ~ ~~  ~ ~ ~~  ~ ~ ~~  ~ ~ ~~  ~ ~ ~~  ~ ~ ~~  ~ ~ ~~  ~ ~ ~~  ~ ~ ~~  ~ ~ ~*/

    var didSet2AFC = false;
    exports.setIV2AFCStd = function (ivname, std_2AFC) { //Levels for 2AFC (move to separate file somehow)
        setIVGeneric(ivname, 'std_2AFC', std_2AFC);
        didSet2AFC = true; //
    };

    exports.set2AFCSimultaneousTarget = function (ivname, targetref) { //This is the method that is called & this is passed in
        setIVGeneric(ivname, 'std_2AFC_simultaneous_target', targetref);
    };


    /** TODO: an option to UNSET these thangs */


    /** ~~~~~~ CUSTOM TRIAL PARSER ~~~~~~ CUSTOM TRIAL PARSER ~~~~~~ CUSTOM TRIAL PARSER ~~~~~~ CUSTOM TRIAL PARSER */
    /** ~~~~~~ CUSTOM TRIAL PARSER ~~~~~~ CUSTOM TRIAL PARSER ~~~~~~ CUSTOM TRIAL PARSER ~~~~~~ CUSTOM TRIAL PARSER */
    /** ~~~~~~ CUSTOM TRIAL PARSER ~~~~~~ CUSTOM TRIAL PARSER ~~~~~~ CUSTOM TRIAL PARSER ~~~~~~ CUSTOM TRIAL PARSER */
    /*
     The trial value will always be passed in as the first argument
     The type of that trial value will be the first non array-of-arrays in the experiment
     parserFuncs are passed args in this order (trialIV, i)
     parserFuncs must return the formatted value
     This assumes you know the content of the trial value, which you should....
     */
    exports.setIVTrialParserFunc = function (ivname, parserFunc) {
        setIVGeneric(ivname, 'parserFunc', parserFunc);
    };

    /** ~~~~~~~~~~~~~~~~~~~~ DV NAME ~~~~~~~~~~~~~~~~~~~~ DV NAME ~~~~~~~~~~~~~~~~~~~~ DV NAME ~~~~~~~~~~~~~~~~~~~~ DV NAME */
    /** ~~~~~~~~~~~~~~~~~~~~ DV NAME ~~~~~~~~~~~~~~~~~~~~ DV NAME ~~~~~~~~~~~~~~~~~~~~ DV NAME ~~~~~~~~~~~~~~~~~~~~ DV NAME */
    /** ~~~~~~~~~~~~~~~~~~~~ DV NAME ~~~~~~~~~~~~~~~~~~~~ DV NAME ~~~~~~~~~~~~~~~~~~~~ DV NAME ~~~~~~~~~~~~~~~~~~~~ DV NAME */
    var _dvName;
    exports.setDVName = function(dvName){
        if (typeof dvName === "string"){
            csvFodderCheck(dvName);
            _dvName = dvName;
        } else {
            throw  new Error("The supplied DV name must be of type String");
        }
    };

    // <<ported>>
    function csvFodderCheck(string){

        if (typeof string !== "string"){
            throw new Error("You must supply a variable of type String for this method");
        }

        if (string.indexOf(",") !== -1){
            throw new Error("Strings used by ExperimentJS may not contain commas: " + string);
        }
    }

    /** ~~ ** BUILD ALL TRIALS ~~ ** BUILD ALL TRIALS ~~ ** BUILD ALL TRIALS ~~ ** BUILD ALL TRIALS ~~ ** BUILD ALL TRIALS  ~~ **/
    /** ~~ ** BUILD ALL TRIALS ~~ ** BUILD ALL TRIALS ~~ ** BUILD ALL TRIALS ~~ ** BUILD ALL TRIALS ~~ ** BUILD ALL TRIALS  ~~ **/
    /** ~~ ** BUILD ALL TRIALS ~~ ** BUILD ALL TRIALS ~~ ** BUILD ALL TRIALS ~~ ** BUILD ALL TRIALS ~~ ** BUILD ALL TRIALS  ~~ **/

    window.expRepeats = 1;
    exports.setRepeats = function (nRepeats) {
        window.expRepeats = nRepeats;
    };

    var _totalTrials = -1;
    var allTrials = [];
    var didBuildTrials = false;
    function buildTrials(printTrials) {
        var buildingTrial, temp;

        for (var iv in window.IVs) { //Iterate over IVs

            console.log("Extending all trials array with:", iv, ". Levels =", window.IVs[iv].levels.length);

            if (window.setFuncs[iv] === undefined) throw new Error("SetFunc not defined for " + iv);

            temp = [];

            var len = allTrials.length === 0 ? 1 : allTrials.length; // For the first pass

            for (var i = 0; i < len; ++i) { //For all trials built so far

                buildingTrial = allTrials.pop(); //Pop the incomplete array of iv-vals (objects) and extend

                for (var j = 0; j < window.IVs[iv].levels.length; ++j) { //Extend them by all the levels of the next IV


                    /** Set the value & description of the current IV obj 4 the current Level */
                    var curIVLevel = {};
                    curIVLevel.description = iv; //camelToSentenceCase(iv);
                    curIVLevel.value = window.IVs[iv].levels[j];

                    /** Store 2AFC std with each trial (if present) */
                    if (window.IVs[iv].hasOwnProperty('std_2AFC')) {
                        curIVLevel.std_2AFC = window.IVs[iv].std_2AFC;
                    }

                    /** For 2AFC that is simultaneous (as opposed to the flipping kind)*/
                    if (window.IVs[iv].hasOwnProperty('std_2AFC_simultaneous_target')) {
                        curIVLevel.std_2AFC_simultaneous_target = window.IVs[iv].std_2AFC_simultaneous_target;
                    }

                    /** SETTER FUNTIONS - Setting display properties via a function
                     * These are only storing a boolean True flag. */
                    // if (window.IVs[iv].setFunc !== undefined) {
                    //     curIVLevel.setFunc = window.IVs[iv].setFunc;
                    // }

                    /** Parser function*/
                    if (window.IVs[iv].parserFunc !== undefined) {
                        curIVLevel.parserFunc = window.IVs[iv].parserFunc; //Could write a copying method for all of these (that handles deep copying)
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
            allTrials = temp;
        }


        /** Duplicate the current factorial trials */
        var repeats = window.expRepeats;
        temp = [];
        for (var i = 0; i < repeats; i++) {
            temp = temp.concat(allTrials);
        }
        allTrials = temp;


        console.log("There are ", allTrials.length, "trials (using", repeats, "repeats)");
        if (printTrials){
            for (var i = 0; i < allTrials.length; i++){
                console.log("TRIAL ", i);
                for (var j = 0; j < allTrials[i].length; j++){
                    console.log( allTrials[i][j] );
                }
                console.log("******* ******* ******* *******");
            }
        }

        allTrials.shuffle();

        _totalTrials = allTrials.length; //Used to determine where you are in the trial process
        didBuildTrials = true;
    }

    exports.clearSaves = function(){
        localStorage.removeItem("experimentJSsaves");/////
    };

    exports.saveBuiltTrialsAndResponses = function(key) {

        // localStorage.clear();

        errorCheckSavingParsers();

        if (typeof(Storage) !== "undefined") {

            // localStorage.experimentJSsaves = undefined;

            //Parse your trials, using the custom serializer..
            var trialsForSaving = exports.parseTrialsForSaving(allTrials);
            var responsesForSaving = exports.parseResponsesForSaving(responses);

            //JSONify the trials and responses
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

    exports.setSavedTrialsAndResponses = function(){
        errorCheckSavingParsers();

        var all_saves = JSON.parse(localStorage.experimentJSsaves);
        
        console.log("all saves+ ", all_saves);


        var select_bits = createDropDownSelect(all_saves);
        select_bits.button.click(function(){

            var temp_using = select_bits.select.find(":selected").text();

            temp_using = all_saves[temp_using];

            allTrials = exports.unparseSavedTrials(temp_using['trials']);
            responses = exports.unparseSavedResponses(temp_using['responses']);
            if (responses === undefined || responses === null) responses = [];

            console.log("restored all trials: ", allTrials);
            console.log("restored all responses: ", responses);

            exports.runNextTrial();


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

    exports.parseTrialsForSaving = undefined;
    exports.parseResponsesForSaving = undefined;
    exports.unparseSavedTrials = undefined;
    exports.unparseSavedResponses = undefined;

    function errorCheckSavingParsers(){
        if (exports.parseTrialsForSaving === undefined) throw new Error("Cannot restore trials without parsing function");
        if (exports.parseResponsesForSaving === undefined) throw new Error("Cannot restore responses without parsing function");
        if (exports.unparseSavedTrials === undefined) throw new Error("Cannot restore trials without UNparsing function");
        if (exports.unparseSavedResponses === undefined) throw new Error("Cannot restore responses without UNparsing function");
    }

    function createDropDownSelect(all_saves){

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
     * NOTE: We no longer handle appearance or input. These are out of the scope of this module.
     * This module now only handles the game loop of
     * - taking IVs
     * - building all trials
     * - setting the display (according to the supplied IVs)
     * - storing & outputting responses
     *
     * All other behaviour should be performed by another moduel that works with this one.
     * */
    exports.buildExperiment = function (printTrials) {
        buildTrials( (printTrials === undefined) ? false : printTrials );
    };


    /** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ TRIAL PRUNING ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    /** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ TRIAL PRUNING ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    /** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ TRIAL PRUNING ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    /**
     * Combos to kill is an array of objects representing trial types you want to destroy
     *
     * You 'OR' the COMBOS togehter so that if the current trial matches any, it gets deleted.
     *
     * Must have this structure
     **
     *  {
            lh: "unwrapOrigLeft",       //Same as ID used on variable
            rh: "unwrapDblRight",
            op: function,                   //ops are "eq" "lt" "gt" & can be prefixed w "!"
            and: {
                isExpression: true,
                lh: "waveOffsetLeft",
                rh: "waveOffsetRight",
                op: function,
                and: undefined... (could do more)
            }
        }

     Combos can be recursively chained together using the **.and** field


     How EXPRESSION EVALUATION works:
     Note:     This only works for "AND", OR is each combo
     PHASE 1 - create a `contitions` array of values & operators. Recurse through
     PHASE 2 - evaluate each condition

     * */
    exports.pruneTrials = function (allRemovalCombos) {

        if (!didBuildTrials) throw new Error("Trials are not built yet");

        /** Apply all combos to all trials using 'OR' -> if any trial matches any combo it will be pruned */
        for (var i = allTrials.length - 1; i >= 0; --i){
            for (var j = 0; j < allRemovalCombos.length; j++){
                // var deepClone = $.extend(true, [], allTrials[i] );
                if ( evaluateOneCombo(  allTrials[i], allRemovalCombos[j] ) ){
                    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Pruning trial ", i);
                    for (var k = 0; k < allTrials[i].length; k++)    console.log(allTrials[i][k].value);
                    allTrials.splice(i, 1); //Remove 1 item at i;
                }
            }
        }
    };

    function evaluateOneCombo(trial, combo){

        //Phase 1 - Get conditions to be ANDED
        var conditions = formatAllTestConditions(trial, combo);

        //Phase 2 - AND the conditions together
        var lh, rh, temp, result;
        // var result = undefined;
        for (var i =0; i < conditions.length; i++){

            lh = trial[conditions[i].lhPos];
            rh = trial[conditions[i].rhPos];

            temp = conditions[i].op(lh.value, rh.value);

            result = (result === undefined) ? temp : (result && temp);
        }

        return result;
    }


    /** ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ PRUNING PHASE 1 - Transform from Array to object structure~ ~ ~ ~ ~ ~ ~ ~ ~ ~ */

    function formatAllTestConditions(trial, combo){

        var conditions = [];

        combo._lh = camelToSentenceCase(combo.lh);
        combo._rh = camelToSentenceCase(combo.rh);

        var lhPos = -1;
        var rhPos = -1;

        for (var i = 0; i < trial.length; i ++){
            if (trial[i].description === combo._lh) lhPos = i;
            if (trial[i].description === combo._rh) rhPos = i;
        }

        /** Store these */
        conditions.push(
            {
                lhPos: lhPos,
                rhPos: rhPos,
                op: combo.op
            }
        );

        /** ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ Recurse to get ANDs ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ */

        if ( combo.and !== null && typeof combo.and === 'object' ) {
            conditions = conditions.concat( formatAllTestConditions(trial, combo.and) );
        }

        return conditions;
    }

    /** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~           GETTING PPT DETAILS     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    var pptName = 'unnamed_ppt';
    var pptNo = 0;

    exports.getPptInfo = function () {

        while (true) {
            pptName = prompt('Please enter your name').trim();
            console.log('name was', pptName);
            if (pptName === '' || pptName === null) {
                alert('Name cannot be blank');
            } else {
                break;
            }
        }

        while (true) {
            pptNo = parseInt(prompt('Please enter your participant number'));
            console.log('ppt number was', pptNo);
            if (isNaN(pptNo)) {
                alert('Participant number must be an integer');
            } else {
                break;
            }
        }

        console.log('Participant name: ', pptName, '\tParticipant number: ', pptNo);
        // }
    };

    /** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


    /** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ONE GAME LOOP~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    var shouldRunNextTrial = true;
    var pause = 500;
    exports.runNextTrial = function (settings) { // runNextTrial({shouldStoreResponse: true, dv_value: 'inside'});

        if (!didBuildTrials){
            throw new Error("runNextTrial(): Trial were not built");
            return;
        }

        if (shouldRunNextTrial) {

            if (midTrialCallBack !== undefined) {
                checkRunMidCallback(); //See if you need to run the callback yet
            }

            if (shouldInterstimulusPause) {
                interstimulusPause(pause);
            }

            if (settings !== undefined && settings.hasOwnProperty('shouldStoreResponse') && settings.shouldStoreResponse) {
                storeResponse(settings); //Settings contains a field 'dv_value' which is also read by storeResponse
            }

            if (allTrials.length > 0) {
                displayNextTrial();

                cur2AFCIsTarget = true;
                /** Always reset the 2AFC value*/

                console.log('There are ', allTrials.length, ' trials remaining.');
                $('#messages-text-three').html('<p>There are ' + allTrials.length + ' trials remaining.</p>################<br>');
            } else {
                $('#three-canvas').fadeOut();                           //Not very generic
                $('#interstimulus-pause').hide();
                outputResponses(responses);

                if (typeof endCallBack === 'function') {
                    endCallBack();
                }
            }
        }

    };

    var endCallBack;
    exports.setEndCalback = function (value) {
        endCallBack = value;
    };


    /** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ INTERSTIMULUS PAUSE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    var blackOut = $('<div>', {
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

    $(document.body).append(blackOut);
    $('#interstimulus-pause').hide();

    var isInterstimulusPause = false;

    function interstimulusPause(duration) {
        return new Promise(function (resolve, reject) {
            $('#interstimulus-pause').show();
            isInterstimulusPause = true;
            shouldRunNextTrial = false;
            /*Prevent button mashing while the pause runs*/
            setTimeout(function () {
                $('#interstimulus-pause').hide();
                isInterstimulusPause = false;
                shouldRunNextTrial = true;
                resolve();                                              //Promise has resolved here
            }, duration);
        });
    }

    exports.showInterstimulusPause = function (duration) {
        return new Promise(function (resolve, reject) {
            interstimulusPause(duration).then(function () {
                resolve();
            });
        });
    };

    exports.setPauseTime = function (value) {
        if (value === parseInt(value, 10)) {
            pause = value;
        } else {
            throw 'setPauseTime only takes integers';
        }
    };

    var shouldInterstimulusPause = true;
    exports.setShouldInterstimulusPause = function(value){
        if (typeof  value === 'boolean'){
            shouldInterstimulusPause = value;
        }
    };

    /** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ FUNCTION CALLED MID TRIAL ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    var mid = [];
    var midTrialCallBack;
    exports.setMidCallback = function (trial, callback) {
        if (trial.constructor === Array) {
            mid = trial;
        } else if (isFloat(trial)) {
            mid.push(trial);
        }

        midTrialCallBack = callback;
    };


    function checkRunMidCallback() {

        //One trial as a percentage. Have * 0.5 coz ur taking the Math.abs() difference (i.e. the two sided tail)
        var fudgeFactor = 1 / _totalTrials * 0.5; //Could make this a private instance var of Experiment?

        for (var i = 0; i < mid.length; i++) {

            var curMid = Math.min(1.0, Math.max(1.0 - mid[i], 0.0)); //Clamping difference between 0.0 & 1.0.

            var diff = Math.abs((allTrials.length / _totalTrials).toFixed(3) - curMid);

            // console.log("determine presence of breaks. Cur pos =", (allTrials.length/_totalTrials).toFixed(3), "havea break at:", curMid, "diff:", diff, 'threshold:', fudgeFactor/2);

            if (diff < fudgeFactor / 2) { //Fudge factor
                midTrialCallBack();
            }
        }
    }

    /** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~GAME LOOP SUB FUNCTIONS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    /** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~GAME LOOP SUB FUNCTIONS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    /** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~GAME LOOP SUB FUNCTIONS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    /** Where view-level elements are set - this is like the CONTROLLER method interfacing between MODEL and VIEW*/
    function displayNextTrial() {
        var nextTrial = allTrials[allTrials.length - 1]; //Always go from the back
        console.log('next trial:', nextTrial);

        // $("#messages-append").empty();

        /** Iterate over each IV and set its pointer to its value for that trial */
        for (var i = 0; i < nextTrial.length; ++i) {

            setObjectAppearanceProperties(nextTrial[i]);

            // /** DEBUG: Writing all variable values to screen*/
            //     ///** Debug: write current settings to console */

            // $("#messages-append").append("<br> *************<br>");
            // $("#messages-append").append(nextTrial[i].description);
            // $("#messages-append").append("<br>");
            // $("#messages-append").append(nextTrial[i].target);
            // $("#messages-append").append("<br>");

            // /** Handling settigns as arrays or normal values. */
            // if (nextTrial[i].value.constructor === Array){
            //     for (var j = 0; j < nextTrial[i].value.length; ++j){
            //         $("#messages-append").append(j.toString() +  ": " + nextTrial[i].value[j] + "<br>");
            //     }
            // } else {
            //     $("#messages-append").append(nextTrial[i].value);
            // }

        }
    }

    /** This sets the appearance of each individual element in the display. CHanging via either props or methods */
    function setObjectAppearanceProperties(curProp) {

        /** TYPE 3: Using a FUNCTION to set the display*/
        if ( window.setFuncs[curProp.description] !== undefined ) {
            window.setFuncs[curProp.description].apply(null, curProp.value);
        } else {
            throw new Error("No setter function supplied by");
            console.log(curProp);
        }
    }

    /** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ METHODS FOR HANDLING 2AFC FLIPPING ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    /** 2AFC For SIMULTANEOUS presentation of the standard & target
     *
     * Cant use 'setObjectAppearanceProperties' because the 2AFC feature is outside hte normal flow of factors!s
     * */

    console.log("using setFUnc breaks 2AFC methods....correct this");
    exports.set2AFCStd = function () {

        if (!errorCheck2AFC()) return;

        /** GET the IV used as the 2AFC*/
        var curTargetLevel = get2AFCFromTrial();

        // console.log('CUR TARGET 2AFC', curTargetLevel);

        /** Iterate over all the simultaneous targets and set them (TODO: support both properties & methods!) */
        if (curTargetLevel.hasOwnProperty('std_2AFC_simultaneous_target')) {
            for (var i = 0; i < curTargetLevel.std_2AFC_simultaneous_target.length; ++i) {

                var level = curTargetLevel.std_2AFC_simultaneous_target[i];

                // if (curProp.hasOwnProperty('setFunc')) {
                //     curProp.setFunc.apply(null, curProp.value);
                // }

                runSetOn(level.target, level.prop, curTargetLevel.std_2AFC); //Should write in set args
                // level.target[ level.prop ] = curTargetLevel.std_2AFC;

                console.log('LEVEL--->', level, 'SET TO:', level.target[level.prop]);
            }
        }


    };

    var isUsing2AFC = false;
    exports.isUsing2AFC = function (value) { //Just a setter
        if (typeof(value) === 'boolean') {
            isUsing2AFC = value;
        }
    };

    function errorCheck2AFC() {
        if (didSet2AFC) return true;
        console.error('You are attempting to call a 2AFC method, but variable levels for the 2AFC std were not registered with the experiment. Called by: *', arguments.callee.caller.name, '*');
        return false;
    }

    function get2AFCFromTrial() {
        /** Find the first IV used as the 2afc standard/target comparison */
        var curTargetLevel = allTrials[allTrials.length - 1];
        for (var i = 0; i < curTargetLevel.length; ++i) {
            if (curTargetLevel[i].hasOwnProperty('std_2AFC')) {
                curTargetLevel = curTargetLevel[i];
                return curTargetLevel;
            }
        }

        return null;
    }

    /** 2AFC For CONSECUTIVE presentation of standard & target
     *
     * Handles the flip: 1. Find the IV used in the 2AFC. 2. Set it based on `cur2AFCIsTarget` */
    exports.flip2AFC = function () {

        if (!errorCheck2AFC()) return;

        /** Find the first IV used as the 2afc standard/target comparison */
        var curTargetLevel = get2AFCFromTrial();


        /** FLIP the display property used as the 2AFC Comparison (to the appropriate std/target level) */
        if (cur2AFCIsTarget) {
            var flipToStandard = jQuery.extend(true, {}, curTargetLevel);            // Deep copy (not sure why...)
            flipToStandard.value = flipToStandard.std_2AFC;
            console.log('Flipping from target to 2afc standard:', flipToStandard.value, flipToStandard);

            setObjectAppearanceProperties(flipToStandard);
            cur2AFCIsTarget = false;

        } else {
            setObjectAppearanceProperties(curTargetLevel);
            cur2AFCIsTarget = true;
            //console.log('Flip2AFC() -> Flipping from standard to target:', curTargetLevel.value);
        }

        $('#messages-text-six').text('Currently viewing the ' + (cur2AFCIsTarget ? 'target' : 'standard') + ' display');
    };


    var cur2AFCIsTarget;
    exports.isCur2AFCTarget = function () { //Just a getter
        return cur2AFCIsTarget;
    };


    /** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~RESPONSES~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /** This is where trials are removed from the array and the next trial is advanced to*/
    var responses = [];

    function storeResponse(options) {

        var lastTrial = allTrials.pop();

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
                     arg_names = getParamNames( window.setFuncs[lastTrial[i].description] );

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
        if (!responseFormatted.hasOwnProperty('std_2AFC') && didSet2AFC) {
            responseFormatted['std_2AFC'] = 'null';
        }


        /** Store the DV*/
        if (options !== undefined && options.hasOwnProperty('dv_value')) {
            var value = _dvName || 'value';
            responseFormatted['DV_'+value] = options.dv_value;
        } else {
            alert('No DV was supplied by the calling code. This is an error.');
            responseFormatted['DV_value'] = 'ERROR - No DV supplied';
        }


        console.log('STORED THIS RESPONSE: ', responseFormatted);

        responses.push(responseFormatted);

        // console.log("response constructed from: ", lastTrial);
    }



    /**OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT **/
    /**OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT **/
    /**OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT OUTPUT **/

    exports.forceOutputResponses = function(){
        console.log("Forcing output of responses");
        outputResponses(responses, true);
    };

    function outputResponses(allResponses, log) {

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

            csvString += pptName + ',' + pptNo + ','; //Manaully add content

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
        var a = createDownloadLink('results (' + pptName + ',' + pptNo.toString() + ').csv', csvContent);
        document.body.appendChild(a);
        a.click();
    }


    /** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~                      UTIL                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    function createDownloadLink(filename, data){
        ////http://stackoverflow.com/questions/17836273/export-javascript-data-to-csv-file-without-server-interaction
        var a = document.createElement('a');
        a.href = data;
        a.target = '_blank';
        a.download = filename; //'results (' + pptName + ', ' + pptNo.toString() + ').csv';
        a.innerHTML = "<h4>Click to download results!</h4> <p>(if they didn't download already)</p>";

        a.className += ' results-download';
        // document.getElementById('interstimulus-pause').appendChild(a);
        return a;
    }

    //TODO - move to util file!
    function isFloat(n) {
        return Number(n) === n && n % 1 !== 0;
    }


    function isArrayOfArrays(elem) {
        if (!Array.isArray(elem)) {
            return false;
        }
        for (var i = 0; i < elem.length; i++) {
            if (!Array.isArray(elem[i])) {
                return false;
            }
        }

        return true;
    }


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

    function camelToSentenceCase(str) {
        return str.split(/(?=[A-Z])/).join(' ').toLowerCase();
    }
    
    function getParamNames(fn){
        //wrap these so as not to pollute the namespace
        var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        var ARGUMENT_NAMES = /([^\s,]+)/g;
        function _getParamNames(func) {
            var fnStr = func.toString().replace(STRIP_COMMENTS, '');
            var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
            if(result === null)
                result = [];
            return result;
        }

       return _getParamNames(fn);
    }
    

})( this.ExperimentJS = {} );


