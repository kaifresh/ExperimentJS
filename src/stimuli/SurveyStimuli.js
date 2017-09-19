/**
 * Created by kai on 19/9/17.
 */

import { Trials } from "../core/Trials.js";

var SurveyStimWraps = {};

function _SetQuestionOnScreen(iv_name, question, list_of_response_options){

    if (SurveyStimWraps[iv_name] === undefined){                                                   // make the wrap if it doesn't exist
        SurveyStimWraps[iv_name] = document.createElement("div");
        SurveyStimWraps[iv_name].classList.add("survey-stimulus-wrap");
        SurveyStimWraps[iv_name].id = iv_name + "-survey-wrap";
        document.body.appendChild(SurveyStimWraps[iv_name]);

        // Here would be a good place to set the style...
    }

    // empty the wrap
    while (SurveyStimWraps[iv_name].firstChild) {
        SurveyStimWraps[iv_name].removeChild(SurveyStimWraps[iv_name].firstChild);
    }

    var qu = document.createElement("h3");
    qu.classList.add(iv_name+"survey-question");
    qu.classList.add("survey-question");
    qu.textContent = question;
    SurveyStimWraps[iv_name].appendChild(qu);


    list_of_response_options.map(function(response,i, all){

        var resp = document.createElement("p");
        resp.textContent = response;
        resp.classList.add(iv_name+"survey-response");
        resp.classList.add("survey-response");
        resp.addEventListener("click", _GoToNextTrial.apply(resp, response));

    });
}

function _GoToNextTrial(clicked_response_text){

    Trials.runNextTrial({
        dv_value: clicked_response_text
    });
}


export function SurveyStimuliIV(iv_name, list_of_questions, list_of_response_options){

    if (typeof iv_name !== "string" || !Array.isArray(list_of_questions) || !Array.isArray(list_of_response_options)){
        throw new Error ("[ SurveyStimuliIV ERROR ] usage: (string iv_name, array list_of_questions, array list_of_response_options ");
    }

    var questions_as_args = list_of_questions.map(function(question, i, all){

        if (typeof  question !== "string"){
            throw new Error("[ SurveyStimuliIV ERROR ]: list_of_questions must be an array of strings. Element " + i + " was: " + question );
        }
        return [iv_name, question, list_of_response_options]; // string, string, array of strings
    });

    Trials.setIVLevels(iv_name, questions_as_args);
    Trials.setIVsetFunc(iv_name, _SetQuestionOnScreen);
    Trials.setIVResponseParserFunc(iv_name, _SurveyIVParser);
    
}

function _SurveyIVParser(iv_name, question, list_of_response_options){
    return question;
}
