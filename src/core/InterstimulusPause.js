

import { _setShouldRunNextTrial } from "./RunExperiment.js"; // _shouldRunNextTrial,
import { SetCSSOnElement } from "../utils/SetCSSOnElement.js";

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
        display: "none",                     // block when visible
        'z-index': 99999999
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

/**
 * Manually fire the interstimulus pause and black out the screen
 * @param {int} duration - milliseconds to show the interstimulus pause
 * @returns {Promise}
 */
Pause.showInterstimulusPause = function (duration) {
    return new Promise(function (resolve, reject) {
        _interstimulusPause(duration).then(function () {
            resolve();
        });
    });
};

var _pause = 500;
/**
 * @param {int} pause_duration - set length of the interstimulus pause
 */
Pause.setPauseTime = function (pause_duration) {
    if (pause_duration === parseInt(pause_duration, 10)) {
        _pause = pause_duration;
    } else {
        throw new Error("setPauseTime only takes integers");
    }
};

export var _shouldInterstimulusPause = true;                        //used in: RunExperiment.js
/**
 * Turn the interstimulus pause on or off
 * @param {bool} - value
 */
Pause.setShouldInterstimulusPause = function(value){
    if (typeof  value === "boolean"){
        _shouldInterstimulusPause = value;
    }
};


var _isInterstimulusPause = false;
export function _interstimulusPause(duration) {                     // used in: RunExperiment.js

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

export { Pause };