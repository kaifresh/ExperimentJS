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

    var response = {
        trial: lastTrial,                                           // Store the tokenised trial (detokenization occurs at output time)
        dv: options.dv_value
    };

    if (options['response_time'] !== null && options.hasOwnProperty("response_time")){
        response['response_time'] = options['response_time'];     // Add response time.
    }

    _responses.push(response);

    console.log("Stored response:", _responses.back());
}

export function _FormatStoredResponses(responses) {

    console.log(responses);

    /**
     * GOAL: only tokenize & de-tokenize ONCE
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
     *      - On output, de-tokenize them & pass them to this method to be converted into a csv friendly format
     * */

    var formatted_responses = [], lastTrial;

    for (var resp_idx = 0; resp_idx < responses.length; resp_idx++){

        lastTrial = responses[resp_idx].trial.map(function( iv_obj_in_tokenised_format ){       // DeTokenise the saved responses
            return _Unserializable_Token2Var(iv_obj_in_tokenised_format, true);                 // 2nd arg = DO detokenize the parser func
        });

        var responseFormatted = {};

        // --- By this point, the responses no longer have tokens ---

        /** [ Store the IV ] -> Write out each IV (1 IV per array element) to a field */
        for (var i = 0; i < lastTrial.length; ++i) {

            console.log("Formatting a response:", k, i);

            var ivNum = "IV" + i;

            // [ RESPONSE PARSER ]
            if (lastTrial[i].parserFunc !== undefined && typeof lastTrial[i].parserFunc === "function"){

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
        responseFormatted["DV_"+value] = responses[resp_idx].dv;

        /** [ Store response time ] */
        if (responses[resp_idx].response_time !== undefined){
            responseFormatted["response_time_ms"] = Number(responses[resp_idx].response_time.toFixed(5));
        }

        console.log("FORMATTED THIS RESPONSE: ", responseFormatted);

        formatted_responses.push(responseFormatted);                         // _responses by one

    }

    return formatted_responses;
}