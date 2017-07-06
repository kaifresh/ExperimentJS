/**
 * Created by kai on 6/7/17.
 */

import { _allTrials, setFuncs, _dvName } from "./Trials";
import { getParamNames } from "../utils/StringUtils.js";

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

export function _storeResponse(options) {

    var lastTrial = _allTrials.pop();

    var responseFormatted = {};

    /** Store the IV -> Write out each IV (1 IV per array element) to a field */
    for (var i = 0; i < lastTrial.length; ++i) {
        var ivNum = "IV" + i;

        // If a parser is defined use its output as the value of the response
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
                
                var keys = Object.keys(parsed_data);
                for (var k = 0; k < keys.length; k++){
                    var key_and_data_description = keys[k];
                    responseFormatted[ stdName+"_"+key_and_data_description+"_value" ] = parsed_data[key_and_data_description]; // Add parsed data for this key to response
                }
                
            } else {
                throw new Error("[ Parser Function Error ] - Parser function for "+stdName+" must output either a string or an object. You output:", typeof parsed_data);
            }

        } else if (lastTrial[i].value.constructor === Array) { // Consider these to be defaults for javascript primitive types

            /** Manually write out each argument (from an array) to a field in the object
             *  Only append a number if there are >1 arguments passed in */

            if (lastTrial[i].value.length > 1){

                //If using a setFunc function with multiple args -> use the arg names to describe the values written to the response
                var arg_names, arg_name;
                arg_names = getParamNames( setFuncs[ lastTrial[i].description ] );

                for (var j = 0; j < lastTrial[i].value.length; ++j) {
                    arg_name = arg_names[j];
                    responseFormatted[ivNum + "_" + lastTrial[i].description + "_value_" + arg_name ] =  lastTrial[i].value[j];
                }

            } else {
                responseFormatted[ ivNum + "_" + lastTrial[i].description + "_value" ] =  lastTrial[i].value[0];
            }

        } else {
            responseFormatted[ivNum + "_" + lastTrial[i].description + "_value"] = lastTrial[i].value;
        }

        /** Add a value of the 2afc std (for the relevant IV) */
        if (lastTrial[i].hasOwnProperty("std_2AFC")) {
            responseFormatted["std_2AFC"] = lastTrial[i].std_2AFC;
        }
    }

    /** Check that a 2afc std value was added - if not you want to add a null value or it will fuck up the csv write*/
    // if (!responseFormatted.hasOwnProperty("std_2AFC") && didSet2AFC) {
    //     responseFormatted["std_2AFC"] = "null";
    // }

    /** Store the DV*/
    if (options !== undefined && options.hasOwnProperty("dv_value")) {
        var value = _dvName || "value";
        responseFormatted["DV_"+value] = options.dv_value;
    } else {
        responseFormatted["DV_value"] = "ERROR - No DV supplied";
        throw new Error("A dependent variable (DV) must be supplied by the calling code. This is an error.");       // Do not continue if DV is not supplied
    }

    console.log("STORED THIS RESPONSE: ", responseFormatted);

    _responses.push(responseFormatted);
}