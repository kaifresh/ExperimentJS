/**
 * Created by kai on 4/8/17.
 */

import { _didBuildTrials } from "./../core/Trials.js";

export function _ErrorIfTrialsAreBuilt(){
    if (_didBuildTrials){
        
        var callerName;
        try { throw new Error(); }
        catch (e) {
            var re = /(\w+)@|at (\w+) \(/g, st = e.stack, m;
            re.exec(st), m = re.exec(st);
            callerName = m[1] || m[2];
        }

        throw new Error("[ "+callerName+" Error ] Trials have already been built.");
    }
}
