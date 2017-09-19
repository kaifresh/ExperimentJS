/**
 * Created by kai on 19/9/17.
 */

import { Trials } from "../core/Trials.js";
import { _CreateAndAppendStyleTagsWithCSS } from "../utils/DOMUtils.js" ;

var SurveyStimWraps = {};

function _SetQuestionOnScreen(iv_name, question, list_of_response_options){

    if (SurveyStimWraps[iv_name] === undefined){                                                   // make the wrap if it doesn't exist
        SurveyStimWraps[iv_name] = document.createElement("div");
        SurveyStimWraps[iv_name].classList.add("survey-stimulus-wrap");
        SurveyStimWraps[iv_name].classList.add("container");                // bootstrap
        SurveyStimWraps[iv_name].id = escape(iv_name) + "-survey-wrap";
        document.body.appendChild(SurveyStimWraps[iv_name]);

        // Here would be a good place to set the style...
    }

    // empty the wrap
    while (SurveyStimWraps[iv_name].firstChild) {
        SurveyStimWraps[iv_name].removeChild(SurveyStimWraps[iv_name].firstChild);
    }

    // Question wrap
    var qu_row = document.createElement("div");
    qu_row.classList.add("row");

    // Add a question (+ style)
    var qu = document.createElement("h3");
    qu.style.marginBottom = "2vh";
    qu.classList.add(escape(iv_name)+"survey-question");
    qu.classList.add("survey-question");
    qu.classList.add("text-center");
    qu.textContent = question;

    qu_row.append(qu);
    SurveyStimWraps[iv_name].appendChild(qu_row);


    // Add all responses
    list_of_response_options.map(function(response,i, all){

        // Row
        var response_row = document.createElement("div");
        response_row.classList.add("row");
        response_row.classList.add("text-center");

        // Col
        var col = document.createElement("div");
        col.classList.add("col-xs-6");                         // bootstrap class
        col.classList.add("col-xs-offset-3");                         // bootstrap class

        var resp = document.createElement("a");
        resp.style.marginBottom = "2vh";
        resp.textContent = response;
        resp.classList.add(escape(iv_name)+"survey-response");
        resp.classList.add("btn");                              // flatui class
        resp.classList.add("btn-lg");                           // flatui class
        resp.classList.add("btn-primary");                      // flatui class
        resp.classList.add("survey-response");

        resp.addEventListener("click", _GoToNextTrial.bind(resp, response));

        col.appendChild(resp);
        response_row.appendChild(col);
        SurveyStimWraps[iv_name].appendChild(response_row);
    });
}

function _GoToNextTrial(clicked_response_text){

    Trials.runNextTrial({
        dv_value: clicked_response_text
    });
}

/**
 * Automatically create an independent variable from the questions & responses provided.
 * Each question will be displayed with the available responses presented as buttons, in the order
 * that they are supplied.
 * @param iv_name {string}
 * @param list_of_questions {array} - Array of questions (string)
 * @param list_of_response_options {array} - Array of response options that will be displayed for all questions (string)
 * @memberof Stimuli
 */
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
