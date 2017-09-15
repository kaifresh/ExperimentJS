import { Trials } from "../core/Trials.js";


/**
 * TwoAFC is a sub module of ExperimentJS.Methods that implements the
 * [Two Alternative Forced Choice experimental paradigm]{@link https://en.wikipedia.org/wiki/Two-alternative_forced_choice}<br>
 * Broadly speaking, two AFC is a comparison between a standard display (which never changes) and a varying display.
 * Typically, participants report whether the varying or standard displays are stronger/weaker on some measured dimension.<br>
 * A counterbalancing measure (e.g. swapping the sides on which the standard and varying displays are presented)
 * is also typically employed to prevent response bias.
 * @module Methods
 * @exports ExperimentJS.Methods.TwoAFC
 * @namespace TwoAFC
 * @example
 * ExperimentJS.Methods.TwoAFC.SetStandard("standard display", function(arg_1, arg_2){ ... } , [arg_1, arg_2]);
 * ExperimentJS.Methods.TwoAFC.SetVarying()
 * ExperimentJS.Methods.TwoAFC.SetCounterBalancePresentation()
 */
var TwoAFC = {};

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
 * Set the function that manipulates the standard display (which the varying display is compared to each trial).<br>
 * Supply a function to set the display as well as the arguments that set it. As the standard display does not vary,
 * only a single array of arguments need to be supplied
 * @param iv_name {string}
 * @param std_func {function} function that sets the standard stimulus in your display
 * @param std_func_args {array} array of arguments to be passed to the standard setter function
 */
TwoAFC.SetStandard = function(iv_name, std_func, std_func_args){

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
 * Set a parser function for the independent variable that manipulates the standard
 * @param iv_name {string}
 * @param parser_func {function} function to parse the arguments (for the standard setter function) into a more useful format
 */
TwoAFC.SetStandardParserFunc = function(iv_name, parser_func){
    Trials.setIVResponseParserFunc("std_"+iv_name, parser_func);
};

// ================================== Varying ==================================

var _didSetVarying = false;
// Usage: ( string, function, array of arrays (of args) )
/**
 * Provide the data and setter function for the display that varies, and is compared to the standard.
 * @param {string} iv_name
 * @param {function} varying_func - function that sets the varying independent variable (IV)
 * @param {array} varying_func_levels - an array of arrays of arguments for `varying_func`, that set the various levels of the varying display.
 */
TwoAFC.SetVarying = function(iv_name, varying_func, varying_func_levels){

    if (typeof iv_name !== "string" || typeof varying_func !== "function" || !Array.isArray(varying_func_levels) || !Array.isArray(varying_func_levels[0]) ){
        throw new Error("[ 2AFC SetVarying Error ] - usage = (string iv_name, function varying_func, array varying_func_levels)");
    }

    _didSetVarying = true;


    Trials.setIVsetFunc(iv_name, varying_func);
    Trials.setIVLevels(iv_name, varying_func_levels);
};

/**
 * Set a parser function for the independent variable that manipulates the varying display.
 * @param {string} ivname - The name of the independent variable (IV).
 * @param {function} parserFunc - Function to parse responses. Must conform to the interface in the example..
 */
TwoAFC.SetVaryingParserFunc = Trials.setIVResponseParserFunc;

// ================================== Counter Balancer ==================================

var _didSetCounterBalance = false;
/**
 * Set a counterbalancer  function
 * @param iv_name
 * @param counterbalance_func {function} - function that performs the counterbalancing of the varying and standard displays
 * @param counterbalance_func_levels {array} - array of arrays of levels that set each type of counterbalancing (e.g. presenting the varying display on the left, then the right)
 */
TwoAFC.SetCounterBalancePresentation = function(iv_name, counterbalance_func, counterbalance_func_levels){

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
 * Set a parser function for the independent variable that manipulates the varying display.
 * @param iv_name {string}
 * @param parser_func {function} function to parse the arguments (for the counter balancing function) into a more useful format
 */
TwoAFC.SetCounterBalanceParserFunc = function(iv_name, parser_func){
    Trials.setIVResponseParserFunc("counterbalance_"+iv_name, parser_func);
};

/**
 * Build the 2AFC Experiment.
 * @param {bool} print - Determines whether the built trials will be output
 */
TwoAFC.BuildExperiment = function(print){

    if ( !(_didSetCounterBalance && _didSetStandard && _didSetVarying) ){
        throw new Error("[ 2AFC BuildExperiment Error ] - To run a 2AFC experiment a standard variable, varying variable and counterbalancer must be set");
    }

    Trials.BuildExperiment(print);
};

export { TwoAFC }