import { Trials } from "../core/Trials.js";

export function ImageStimuli(list_of_img_paths){

    return list_of_img_paths.map(function(img_path){
        var img = new Image();
        img.src = img_path;


        return img;

    });
}

export function ImageStimuliIV(iv_name, list_of_img_paths){

    if (typeof iv_name !== "string" || !Array.isArray(list_of_img_paths)){
        throw new Error("[ ImageStimuli ERROR ] usage: (string iv_name, array list_of_image_paths)");
    }

    var images_as_args = ImageStimuli(list_of_img_paths).map(function(img){
        img.addEventListener("click", _GoToNextTrial);
        img.setAttribute("iv_name", iv_name);
        return [img];
    });

    Trials.setIVLevels(iv_name, images_as_args);
    Trials.setIVsetFunc(iv_name, _SetImageOnScreen);
    Trials.setIVResponseParserFunc(iv_name, _ImageIVParser);
}

var ImgStimWraps = {};

function _SetImageOnScreen(img_elem){

    var iv_name = img_elem.getAttribute("iv_name");

    if (ImgStimWraps[iv_name] === undefined){                                                   // make the wrap if it doesn't exist
        ImgStimWraps[iv_name] = document.createElement("div");
        ImgStimWraps[iv_name].classList.add("img-stimulus-wrap");
        ImgStimWraps[iv_name].id = iv_name + "img-wrap";
        document.body.appendChild(ImgStimWraps[iv_name]);

        // Here would be a good place to set the style...
    }

    // empty the wrap
    while (ImgStimWraps[iv_name].firstChild) {
        ImgStimWraps[iv_name].removeChild(ImgStimWraps[iv_name].firstChild);
    }

    ImgStimWraps[iv_name].appendChild(img_elem);
}

function _GoToNextTrial(event){

    Trials.runNextTrial({
        dv_value: "clicked: " + event.target.src.split(/[\\/]/).pop() // get basename
    });
// console.log("image was clicked; ", event, event.target.src);
}

function _ImageIVParser(img_elem){
    return img_elem.src.split(/[\\/]/).pop();
}



