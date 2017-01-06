import { _shouldRunNextTrial, _setShouldRunNextTrial } from "./RunExperiment.js";
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

export var _shouldInterstimulusPause = true;             //used in: RunExperiment.js
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
export function _interstimulusPause(duration) {         //used in: RunExperiment.js

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


export { Pause };