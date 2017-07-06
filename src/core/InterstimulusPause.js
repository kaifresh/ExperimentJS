

import { _shouldRunNextTrial, _setShouldRunNextTrial } from "./RunExperiment.js";

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
        display: "none"                     // block
    };

    var keys = Object.keys(css);
    for (var i = 0; i < keys.length; i++){
        var attribute = keys[i];
        blackout.style[attribute] = css[attribute];
    }
    // for (var attribute of ){
    //     blackout.style[attribute] = css[attribute];
    // }

    return blackout;

}

// var _blackOut = $("<div>", {
//     id: "interstimulus-pause",
//     css: {
//         position: "fixed",
//         left: 0,
//         top: 0,
//         width: "100vw",
//         height: "100vh",
//         background: "black"
//     }
// });

// $(document.body).append(_blackOut);
// $("#interstimulus-pause").hide();

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

export var _shouldInterstimulusPause = true;                        //used in: RunExperiment.js
Pause.setShouldInterstimulusPause = function(value){
    if (typeof  value === "boolean"){
        _shouldInterstimulusPause = value;
    }
};




var _isInterstimulusPause = false;
export function _interstimulusPause(duration) {                     // used in: RunExperiment.js

    duration = duration === undefined ? _pause : duration;          //Default to pause time unless an argument is supplied

    return new Promise(function (resolve, reject) {
        // $("#interstimulus-pause").show();
        _showInterstimulusPause(_blackOut);
        _isInterstimulusPause = true;
        _setShouldRunNextTrial(false);

        /* Prevent button mashing while the pause runs */
        setTimeout(function () {
            // $("#interstimulus-pause").hide();
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