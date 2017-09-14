import { Trials } from "../core/Trials.js";


var _2AFC = {};

/*
 * 2AFC Module.
 *
 * These are lightweight wrappers around the core Trials methods.
 * They enforce a 2AFC structure to the experiment
 *
 * */

// ================================== Standard ==================================

var _didSetStandard = false;
/**
 * @module Methods
 * @namespace Methods
 * @param iv_name
 * @param {function} std_func - the standard setter function
 * @param {array} std_func_args - array of arguments to be passed to the standard setter function
 * @constructor
 */
_2AFC.SetStandard = function(iv_name, std_func, std_func_args){

    if (typeof iv_name !== "string" || typeof std_func !== "function" || !Array.isArray(std_func_args) ){
        throw new Error("[ 2AFC SetStandard Error ] - usage = (string iv_name, function std_func, array std_func_args)");
    }

    _didSetStandard = true;

    iv_name = "std_"+iv_name;

    Trials.setIVsetFunc(iv_name, std_func);
    Trials.setIVLevels(iv_name, [ std_func_args ] );
};

// Usage: (string iv_name, function parser_func);
/**
 * TODO: WRITE
 * @namespace Methods
 * @param iv_name
 * @param parser_func
 * @constructor
 */
_2AFC.SetStandardParserFunc = function(iv_name, parser_func){
    Trials.setIVResponseParserFunc("std_"+iv_name, parser_func);
};

// ================================== Varying ==================================

var _didSetVarying = false;
// Usage: ( string, function, array of arrays (of args) )
/**
 * @namespace Methods
 * @param iv_name
 * @param varying_func
 * @param varying_func_levels
 * @constructor
 */
_2AFC.SetVarying = function(iv_name, varying_func, varying_func_levels){

    if (typeof iv_name !== "string" || typeof varying_func !== "function" || !Array.isArray(varying_func_levels) || !Array.isArray(varying_func_levels[0]) ){
        throw new Error("[ 2AFC SetVarying Error ] - usage = (string iv_name, function varying_func, array varying_func_levels)");
    }

    _didSetVarying = true;


    Trials.setIVsetFunc(iv_name, varying_func);
    Trials.setIVLevels(iv_name, varying_func_levels);
};

// Usage: (string iv_name, function parser_func);
_2AFC.SetVaryingParserFunc = Trials.setIVResponseParserFunc;

// ================================== Counter Balancer ==================================

var _didSetCounterBalance = false;
/**
 * @namespace Methods
 * @param iv_name
 * @param counterbalance_func
 * @param counterbalance_func_levels
 * @constructor
 */
_2AFC.SetCounterBalancePresentation = function(iv_name, counterbalance_func, counterbalance_func_levels){

    if (typeof iv_name !== "string" || typeof counterbalance_func !== "function" || !Array.isArray(counterbalance_func_levels) || !Array.isArray(counterbalance_func_levels[0]) ){
        throw new Error("[ 2AFC CounterBalancePresentation Error ] - usage = (string iv_name, function varying_func, array varying_func_levels)");
    }

    _didSetCounterBalance = true;

    iv_name = "counterbalance_"+iv_name;

    Trials.setIVsetFunc(iv_name, counterbalance_func);
    Trials.setIVLevels(iv_name, counterbalance_func_levels);
};

// Usage: (string iv_name, function parser_func);
/**
 *
 * @param iv_name
 * @param parser_func
 * @constructor
 */
_2AFC.SetCounterBalanceParserFunc = function(iv_name, parser_func){
    Trials.setIVResponseParserFunc("counterbalance_"+iv_name, parser_func);
};

/**
 *
 * @namespace Methods
 * @param print
 * @constructor
 */
_2AFC.BuildExperiment = function(print){

    if ( !(_didSetCounterBalance && _didSetStandard && _didSetVarying) ){
        throw new Error("[ 2AFC BuildExperiment Error ] - To run a 2AFC experiment a standard variable, varying variable and counterbalancer must be set");
    }

    Trials.BuildExperiment(print);
};

export { _2AFC }