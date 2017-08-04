/**
 * Created by kai on 4/8/17.
 */

import { _didStartExperiment } from "./../core/RunExperiment.js";

export function _ErrorIfDidStartExperiment(){
    if (_didStartExperiment){

        var callerName;
        try { throw new Error(); }
        catch (e) {
            var re = /(\w+)@|at (\w+) \(/g, st = e.stack, m;
            re.exec(st), m = re.exec(st);
            callerName = m[1] || m[2];
        }

        // var funcname = arguments.callee.caller.toString();
        throw new Error("[ "+callerName+" Error ] Experiment has already begun.");
    }
}