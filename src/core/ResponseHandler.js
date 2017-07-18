

import { _allTrials, setFuncs, _dvName } from "./Trials";
import { getParamNames } from "../utils/StringUtils.js";
import { _Unserializable_Token2Var } from "./UnserializableMap.js";

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                                 Experiment Lifecycle - Store Response
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
export var _responses = [];

export function _setResponses(responses){                       // Used in ./Saves.js. Has to live here as it redefines _responses
    if (responses.constructor === Array){
        _responses = responses;
    } else {
        throw new Error("reponses can only be set to an array");
    }
}


// Responsible for changing hte lengths of _allTrials and _responses
export function _storeResponse(options) {                       // Used in ./RunExperiment.js

    if (options === undefined || !options.hasOwnProperty("dv_value")){
        throw new Error("A dependent variable (DV) must be supplied by the calling code. This is an error.");       // Do not continue to next trial if DV is not supplied
    }

    var lastTrial = _allTrials.pop();

    _responses.push({
        trial: lastTrial,                                           // Store the tokenised trial (detokenization occurs at output time)
        dv: options.dv_value
    });

    console.log("STORED THIS RESPONSE: ", _responses.back());
}


export function _FormatStoredResponses(responses) {
    /**
     * GOAL only tokenize & de-tokenize ONCE
     *
     * Trials
     *      - Tokenuzed on creation
     *      - DeTokenized on trial (deep copy)
     *      - Nothing on Save               - Still tokenized from creation
     *      - Nothing on Load               - DeTokenized as normal
     *
     * Responses
     *      - DeTokenised on creation       - Receivng the detokenised trial
     *            - ALT = store Tokenized trials & DeTokenize on output
     *            - Nothing on Save - still a token
     *            - Nothign on load - still a token
     *
     * Result
     *      - Store all run trials + their DV response in tokenised form as the Response array
     *      - On output, de-tokenize them & pass them to this current method
     *      - TODO: create a way to store the run trials that works with JSON. eg -> { trials: []run_trials, dv: []responses }
     * */

    var formatted_responses = [], lastTrial, dv_value;

    for (var resp_idx = 0; resp_idx < responses.length; resp_idx++){

        // lastTrial = responses[resp_idx]                                                      // (without detokenisation)
        lastTrial = responses[resp_idx].trial.map(function( iv_obj_in_tokenised_format ){       // DeTokenise the saved responses
            return _Unserializable_Token2Var(iv_obj_in_tokenised_format, true);                 // 2nd arg = DO detokenize the parser func
        });


        dv_value = responses[resp_idx].dv;

        var responseFormatted = {};

        // TODO: UNZSERIALIZABLE ISSUE: By this point, the responses no longer have tokens. So when saved their content is lost. SO the question is where to keep a serialised copy
        // TODO: Could just store all trials in tokenised/untokensied formats and convert to response format at the end (otherwise you need to indivudally support parsers, and the other shit)

        /** [ Store the IV ] -> Write out each IV (1 IV per array element) to a field */
        for (var i = 0; i < lastTrial.length; ++i) {


            console.log("FORMATTING A RESPONSE FOR ", k, i);

            var ivNum = "IV" + i;

            // [ RESPONSE PARSER ]
            if (lastTrial[i].parserFunc !== undefined && typeof lastTrial[i].parserFunc === "function"){ //$.isFunction(lastTrial[i].parserFunc)){

                var stdName = ivNum + "_" + lastTrial[i].description;

                /**
                 * Parser function interface:
                 *                  function ( args_passed_to_this_IV_for_this_trial..., index) {}
                 *                  return
                 *                          string -    processed version of the data
                 *                          object -    values are the processed version of parts of the data,
                 *                                      keys are names given to each portion of the parsed data
                 * */

                var parsed_data = lastTrial[i].parserFunc.apply(this, lastTrial[i].value.concat(i) );                               // Refer to interface description above

                if (typeof parsed_data === "string" || parsed_data instanceof String){
                    responseFormatted[ stdName+"_value" ] = parsed_data;                                                            // Add parsed IV data to response

                } else if (parsed_data !== null && typeof parsed_data === "object"){

                    // TODO: See if keys output by the parser function can be cached for a performance improvement
                    var keys = Object.keys(parsed_data);
                    for (var k = 0; k < keys.length; k++){
                        var key_and_data_description = keys[k];
                        responseFormatted[ stdName+"_"+key_and_data_description ] = parsed_data[key_and_data_description]; // Add parsed data for this key to response
                    }

                } else {
                    throw new Error("[ Parser Function Error ] - Parser function for "+stdName+" must output either a string or an object. You output:", typeof parsed_data);
                }

                // [ DEFAULT: ARRAY OF INPUT ]
            } else if (lastTrial[i].value.constructor === Array) { // Default behaviour: array of args passed to the IV's set function

                /** Manually write out each argument (from an array) to a field in the object
                 *  Only append a number if there are >1 arguments passed in */

                if (lastTrial[i].value.length > 1){

                    //If using a setFunc function with multiple args -> use the arg names to describe the values written to the response
                    var arg_names, arg_name;
                    arg_names = getParamNames( setFuncs[ lastTrial[i].description ] );

                    for (var j = 0; j < lastTrial[i].value.length; ++j) {
                        arg_name = arg_names[j];
                        responseFormatted[ivNum + "_" + lastTrial[i].description + "_" + arg_name ] =  lastTrial[i].value[j];
                    }

                } else {
                    responseFormatted[ ivNum + "_" + lastTrial[i].description ] =  lastTrial[i].value[0];
                }

            } else {
                // TODO: Determine if this can be deleted...
                responseFormatted[ivNum + "_" + lastTrial[i].description ] = lastTrial[i].value;
            }

        }

        /** [ Store the DV ] */
        var value = _dvName || "value";
        responseFormatted["DV_"+value] = dv_value;

        console.log("FORMATTED THIS RESPONSE: ", responseFormatted);

        formatted_responses.push(responseFormatted);                         // _responses by one

    }

    return formatted_responses;
}


//
// export function _storeResponse_ORIGINAL(options) {                       // Used in ./RunExperiment.js
//
//     // var lastTrial = _trial_to_run;                              // _trial_to_run is set in ./RunExperiment.js:_displayNextTrial()
//
//     var responseFormatted = {};
//
//     /**
//      * GOAL only tokenize & de-tokenize ONCE
//      *
//      * Trials
//      *      - Tokenuzed on creation
//      *      - DeTokenized on trial (deep copy)
//      *      - Nothing on Save               - Still tokenized from creation
//      *      - Nothing on Load               - DeTokenized as normal
//      *
//      * Responses
//      *      - DeTokenised on creation       - Receivng the detokenised trial
//      *            - ALT = store Tokenized trials & DeTokenize on output
//      *            - Nothing on Save - still a token
//      *            - Nothign on load - still a token
//      *
//      * Result
//      *      - Store all run trials + their DV response in tokenised form as the Response array
//      *      - On output, de-tokenize them & pass them to this current method
//      *      - TODO: create a way to store the run trials that works with JSON. eg -> { trials: []run_trials, dv: []responses }
//      * */
//
//     // TODO: UNZSERIALIZABLE ISSUE: By this point, the responses no longer have tokens. So when saved their content is lost. SO the question is where to keep a serialised copy
//     // TODO: Could just store all trials in tokenised/untokensied formats and convert to response format at the end (otherwise you need to indivudally support parsers, and the other shit)
//
//     /** Store the IV -> Write out each IV (1 IV per array element) to a field */
//     for (var i = 0; i < lastTrial.length; ++i) {
//         var ivNum = "IV" + i;
//
//         // [ RESPONSE PARSER ]
//         if (lastTrial[i].parserFunc !== undefined && typeof lastTrial[i].parserFunc === "function"){ //$.isFunction(lastTrial[i].parserFunc)){
//
//             var stdName = ivNum + "_" + lastTrial[i].description;
//
//             /**
//              * Parser function interface:
//              *                  function ( args_passed_to_this_IV_for_this_trial..., index) {}
//              *                  return
//              *                          string -    processed version of the data
//              *                          object -    values are the processed version of parts of the data,
//              *                                      keys are names given to each portion of the parsed data
//              * */
//
//             var parsed_data = lastTrial[i].parserFunc.apply(this, lastTrial[i].value.concat(i) );                               // Refer to interface description above
//
//             if (typeof parsed_data === "string" || parsed_data instanceof String){
//                 responseFormatted[ stdName+"_value" ] = parsed_data;                                                            // Add parsed IV data to response
//
//             } else if (parsed_data !== null && typeof parsed_data === "object"){
//
//                 // TODO: See if keys output by the parser function can be cached for a performance improvement
//                 var keys = Object.keys(parsed_data);
//                 for (var k = 0; k < keys.length; k++){
//                     var key_and_data_description = keys[k];
//                     responseFormatted[ stdName+"_"+key_and_data_description ] = parsed_data[key_and_data_description]; // Add parsed data for this key to response
//                 }
//
//             } else {
//                 throw new Error("[ Parser Function Error ] - Parser function for "+stdName+" must output either a string or an object. You output:", typeof parsed_data);
//             }
//
//             // [ DEFAULT: ARRAY OF INPUT ]
//         } else if (lastTrial[i].value.constructor === Array) { // Default behaviour: array of args passed to the IV's set function
//
//             /** Manually write out each argument (from an array) to a field in the object
//              *  Only append a number if there are >1 arguments passed in */
//
//             if (lastTrial[i].value.length > 1){
//
//                 //If using a setFunc function with multiple args -> use the arg names to describe the values written to the response
//                 var arg_names, arg_name;
//                 arg_names = getParamNames( setFuncs[ lastTrial[i].description ] );
//
//                 for (var j = 0; j < lastTrial[i].value.length; ++j) {
//                     arg_name = arg_names[j];
//                     responseFormatted[ivNum + "_" + lastTrial[i].description + "_" + arg_name ] =  lastTrial[i].value[j];
//                 }
//
//             } else {
//                 responseFormatted[ ivNum + "_" + lastTrial[i].description ] =  lastTrial[i].value[0];
//             }
//
//         } else {
//             // TODO: Determine if this can be deleted...
//             responseFormatted[ivNum + "_" + lastTrial[i].description ] = lastTrial[i].value;
//         }
//
//     }
//
//     /** Store the DV*/
//     if (options !== undefined && options.hasOwnProperty("dv_value")) {
//         var value = _dvName || "value";
//         responseFormatted["DV_"+value] = options.dv_value;
//     } else {
//         responseFormatted["DV_value"] = "ERROR - No DV supplied";
//         throw new Error("A dependent variable (DV) must be supplied by the calling code. This is an error.");       // Do not continue if DV is not supplied
//     }
//
//     console.log("STORED THIS RESPONSE: ", responseFormatted);
//
//     _responses.push(responseFormatted);                         // _responses by one
// }