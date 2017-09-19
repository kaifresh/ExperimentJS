import { Trials } from "../core/Trials.js";

/**
 * Creates a javascript Image object for each path
 * @param list_of_img_paths {array} - array of string image paths
 * @returns array of images
 * @memberof Stimuli
 */
export function ImageStimuli(list_of_img_paths){

    return list_of_img_paths.map(function(img_path){
        var img = new Image();
        img.src = img_path;
        
        return img;

    });
}

/**
 * Automatically creates an independent variable from the paths provided.<br>
 * During the experiment, a series of images (one per path) are displayed on screen.
 * By default, these images are added to the DOM as the first child of a &lt;div&gt;
 * with the ID "YOUR_IV_NAME-img-wrap" and can be styled
 * or manipulated as required for your experiment.
 * @param iv_name {string}
 * @param list_of_img_paths {array}
 * @memberof Stimuli
 */
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
        ImgStimWraps[iv_name].id = iv_name + "-img-wrap";
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



