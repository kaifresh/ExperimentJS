/**
 * Created by kai on 4/8/17.
 */

import { _didStartExperiment } from "./RunExperiment.js";

export function _ErrorIfDidStartExperiment(){
    if (_didStartExperiment){
        var funcname = arguments.callee.caller.toString();
        throw new Error("[ "+funcname+" Error ] Experiment has already begun.");
    }
}