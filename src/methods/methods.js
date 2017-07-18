/**
 * Created by kai on 17/7/17.
 */
import { Trials } from  "../core/Trials.js"; //Needs ./ to treat it as an internal (not external dependency)

import { _2AFC } from "./2AFC.js";


var Methods = {                             // add all methods to methods object
    _2AFC: _2AFC
};

export { Methods } 