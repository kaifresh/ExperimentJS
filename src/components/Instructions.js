
import { Trials } from "../core/Trials.js";


const instructions_iv_key = "%%INSTRUCTIONS%%";

function Instructions(instructions_text){

    Trials.setIVLevels(instructions_iv_key, [ [instructions_text] ]);
    Trials.setIVsetFunc(instructions_iv_key, _SetInstructions);
    Trials.setIVResponseParserFunc(instructions_iv_key, _InstructionsIVParser);
}

// You dont want these included in the output....
function _InstructionsIVParser(){
    return null;
}


var _didCreateInstructionsInDOM = false;
function _SetInstructions(instructions_text){
    // Atach some div to dom

    if (!_didCreateInstructionsInDOM){
        _CreateInstructionsInDOM();
    }

    var instructions = document.getElementById(instructions_iv_key);
    instructions.textContent = instructions_text;
}

function _CreateInstructionsInDOM(){
    var instructions = document.createElement("div");
    instructions.id = instructions_iv_key;

    //TODO ADD STYLE!!!!
    Object.assign(instructions.style,{"font-size":"30px", "font-weight": "bold", "width": "100%", "text-align": "center"});

    document.body.appendChild(instructions);
}

export { Instructions }