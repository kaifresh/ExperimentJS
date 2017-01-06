import { _setIVGeneric, Trials } from './Trials.js';
import { _setObjectAppearanceProperties } from "./RunExperiment.js";
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                                      2AFC
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -

var _didSet2AFC = false;

Trials.setIV2AFCStd = function (ivname, std_2AFC) { //Levels for 2AFC (move to separate file somehow)
    _setIVGeneric(ivname, 'std_2AFC', std_2AFC);
    _didSet2AFC = true; //
};

Trials.set2AFCSimultaneousTarget = function (ivname, targetref) { //This is the method that is called & this is passed in
    _setIVGeneric(ivname, 'std_2AFC_simultaneous_target', targetref);
};


//export { Trials };

Trials.set2AFCStd = function () {

    throw new Error("2AFC not implemented for setter functions");

    if (!_errorCheck2AFC()) return;

    /** GET the IV used as the 2AFC*/
    var curTargetLevel = _get2AFCFromTrial();

    // console.log('CUR TARGET 2AFC', curTargetLevel);

    /** Iterate over all the simultaneous targets and set them (TODO: support both properties & methods!) */
    if (curTargetLevel.hasOwnProperty('std_2AFC_simultaneous_target')) {
        for (var i = 0; i < curTargetLevel.std_2AFC_simultaneous_target.length; ++i) {

            var level = curTargetLevel.std_2AFC_simultaneous_target[i];

            //TODO: support setter functions
            // if (curProp.hasOwnProperty('setFunc')) {
            //     curProp.setFunc.apply(null, curProp.value);
            // }

            //runSetOn(level.target, level.prop, curTargetLevel.std_2AFC); //Should write in set args
            // level.target[ level.prop ] = curTargetLevel.std_2AFC;

            console.log('LEVEL--->', level, 'SET TO:', level.target[level.prop]);
        }
    }


};

var _cur2AFCIsTarget;
Trials.isCur2AFCTarget = function () { //Just a getter
    return _cur2AFCIsTarget;
};

/** 2AFC For CONSECUTIVE presentation of standard & target
 *
 * Handles the flip: 1. Find the IV used in the 2AFC. 2. Set it based on `_cur2AFCIsTarget` */
Trials.flip2AFC = function () {

    if (!_errorCheck2AFC()) return;

    /** Find the first IV used as the 2afc standard/target comparison */
    var curTargetLevel = get2AFCFromTrial();


    /** FLIP the display property used as the 2AFC Comparison (to the appropriate std/target level) */
    if (_cur2AFCIsTarget) {
        var flipToStandard = jQuery.extend(true, {}, curTargetLevel);            // Deep copy (not sure why...)
        flipToStandard.value = flipToStandard.std_2AFC;
        console.log('Flipping from target to 2afc standard:', flipToStandard.value, flipToStandard);

        _setObjectAppearanceProperties(flipToStandard);
        _cur2AFCIsTarget = false;

    } else {
        _setObjectAppearanceProperties(curTargetLevel);
        _cur2AFCIsTarget = true;
        //console.log('Flip2AFC() -> Flipping from standard to target:', curTargetLevel.value);
    }

    $('#messages-text-six').text('Currently viewing the ' + (_cur2AFCIsTarget ? 'target' : 'standard') + ' display');
};


var _isUsing2AFC = false;
Trials.isUsing2AFC = function (value) { //Just a setter
    if (typeof(value) === 'boolean') {
        _isUsing2AFC = value;
    }
};

function _errorCheck2AFC() {
    if (_didSet2AFC) return true;
    console.error('You are attempting to call a 2AFC method, but variable levels for the 2AFC std were not registered with the experiment. Called by: *', arguments.callee.caller.name, '*');
    return false;
}

function _get2AFCFromTrial() {
    /** Find the first IV used as the 2afc standard/target comparison */
    var curTargetLevel = _allTrials[_allTrials.length - 1];
    for (var i = 0; i < curTargetLevel.length; ++i) {
        if (curTargetLevel[i].hasOwnProperty('std_2AFC')) {
            curTargetLevel = curTargetLevel[i];
            return curTargetLevel;
        }
    }

    return null;
}