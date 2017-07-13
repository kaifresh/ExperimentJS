/**
 * Created by kai on 10/7/17.
 */

//
var UnserializableMap = {};
var ParserFuncMap = {};

const unserializable_token = "%%UNSERIALIZABLE%%";
const unserializable_parserfunc_token = "%%PARSERFUNC%%";

// ========================================================================================

export function _Unserializable_Token2Var(iv_for_trial, detokenize_parser = false){

    if (!Array.isArray(iv_for_trial.value) || typeof iv_for_trial.description !== "string"){
        throw new Error("_Unserializable_Token2Var ERROR - usage (object iv, bool detokenize_parser)", iv_for_trial);
    }

    // TODO: short circuit this whole process with some flags if there is nothing to detokenize!!

    // {description, value}

    var __unserialise_key, __arg_value, __iv_args = iv_for_trial.value; // Should be an array

    for (var i  = 0; i < __iv_args.length; i++) {

        __arg_value = __iv_args[i];

        if (typeof __arg_value === "string" && __arg_value.includes(unserializable_token)) {

            console.log("FOUND A THING TO UNSERIALISE: ", __arg_value);
            console.log("iv_for_trial", iv_for_trial);

            __unserialise_key = +__arg_value.replace(unserializable_token, "");

            console.log("UnserializableMap", UnserializableMap[iv_for_trial.description], " ==>", __unserialise_key);

            iv_for_trial.value[i] = UnserializableMap[iv_for_trial.description][__unserialise_key];
        }
    }
    
    // TODO: Add support for parser funcs here
    if (detokenize_parser && ParserFuncMap.hasOwnProperty(iv_for_trial.description)){
        iv_for_trial.parserFunc = ParserFuncMap[iv_for_trial.description];
    }

    return iv_for_trial;
}

export function _Unserializable_Var2Token(array_of_iv_args, iv_name){

    console.log("******\t_Unserializable_Var2Token\t*******");

    if (!Array.isArray(array_of_iv_args) || typeof iv_name !== "string"){
        throw new Error("_Unserializable_Var2Token usage: (array iv_args, string iv_name)");
    }

    var __ctr = 0, __val, __iv_args, __did_tokenize = false;

    var tokenized_arg_array = array_of_iv_args;                                     // TODO: Determine if a deep copy is required

    for (var i = 0; i < tokenized_arg_array.length; i++){

        __iv_args = tokenized_arg_array[i];

        for (var j = 0; j < __iv_args.length; j++){

            __val = __iv_args[j];
            
            if (typeof __val === "function" || typeof __val === "object" || Array.isArray(__val) ){
                
                if (UnserializableMap[iv_name] === undefined) UnserializableMap[iv_name] = {};

                UnserializableMap[iv_name][__ctr.toString() ] = __val;             // Save the unserializable

                tokenized_arg_array[i][j] = __ctr + unserializable_token;            // Replace unserializable with token

                console.log(iv_name, "\t <== FOUND A THING TO TURN INTO A TOKEN!");
                console.log("\tWhat is being stored: ", __val);
                console.log("\twhat its being replaced with ", tokenized_arg_array[i][j]);
                console.log("\tThe TOKENSIZED arg array: ", tokenized_arg_array[i]);
                console.log("\t\tALL: ", JSON.stringify(tokenized_arg_array));

                __ctr++;                                                // increment the counter

                __did_tokenize = true;
            }
        }

        console.log("\t\t\tPost ALL: ", JSON.stringify(tokenized_arg_array));
    }


    if (__did_tokenize){
        console.log("\t^^^^^^^", tokenized_arg_array, JSON.stringify(tokenized_arg_array));
    }
    


    return tokenized_arg_array;
}


export function _Unserializable_ParserFunc2Token(parserfunc, iv_name){

    if (parserfunc === undefined) return parserfunc;

    if (typeof parserfunc !== "function" || typeof  iv_name !== "string"){
        throw new Error("_Unserializable_ParserFunc2Token ERROR - usage (function parserfunc, string iv_name");
    }

    // TODO: Tokenise the parser func
    ParserFuncMap[iv_name] = parserfunc;                              // Parserfuncs are keyed by IV

    return unserializable_parserfunc_token;
}

















//
// //Just do work on the arg array, make it easy on yourself!
// export function _ReplaceUnserializabletWithToken(iv_arg_array, iv_name){
//
//     if (!Array.isArray(iv_arg_array) || typeof iv_name !== "string"){
//         throw new Error("_ReplaceUnserializabletWithToken usage: (array iv_args, string iv_name)");
//     }
//
//     var __token = 0, __val;
//
//     var tokenized_arg_array = iv_arg_array.slice();                     // deep copy?
//
//     for (var __idx_in_map = 0;  __idx_in_map < tokenized_arg_array.length; __idx_in_map++){
//
//         __val = tokenized_arg_array[__idx_in_map];
//
//         if (typeof __val === "function" || typeof __val === "object" || Array.isArray(__val) ){
//
//             if (UnserializableMap[iv_name] === undefined) UnserializableMap[iv_name] = {};
//
//             __token = __idx_in_map + unserializable_token;          // create token
//
//             UnserializableMap[iv_name][__token ] = __val;           // store the unseralizable in the map
//
//             tokenized_arg_array[__idx_in_map] = __token ;           // replace the unserializable with the token
//         }
//     }
//
//     return tokenized_arg_array;
// }
//
//
//
// export function _ReplaceTokenWithUnserializable(iv_arg_array_parsed, iv_name){
//
//     if (!Array.isArray(iv_arg_array_parsed) || typeof iv_name !== "string"){
//         throw new Error("_ReplaceTokenWithUnserializable usage: (array iv_args, string iv_name)");
//     }
//
//     var __idx_in_array;
//
//     var de_tokenized_arg_array = iv_arg_array_parsed.slice();
//
//     // console.log("iv_arg_array_parsed", iv_arg_array_parsed);
//
//     var to_replace = Object.keys(UnserializableMap[iv_name]);               // Iterate over unserializable
//
//     for (var i = 0; i < to_replace.length; i++){
//
//         __idx_in_array = +to_replace[i].replace(unserializable_token, "");  // remove token, coerce to number
//
//         de_tokenized_arg_array[__idx_in_array] =  UnserializableMap[iv_name][ to_replace[i] ];
//
//     }
//
//     // console.log("de_tokenized_arg_array", de_tokenized_arg_array);
//
//     return de_tokenized_arg_array;
// }
// //
// // function _GetUnserializableForToken(iv_name, token){
// //     return UnserializableMap[iv_name][token];
// // }
