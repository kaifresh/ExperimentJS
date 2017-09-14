/**
 * Created by kai on 17/7/17.
 */
import { Trials } from  "../core/Trials.js";

import { _2AFC } from "./2AFC.js";
import { ConstantStimuli } from "./ConstantStimuli.js";

/**
 * Methods Module
 * @module Methods
 * @exports ExperimentJS.Methods
 * @namespace Methods
 */
var Methods = {
    _2AFC: _2AFC,
    ConstantStimuli: ConstantStimuli
};

// The fields of ExperimentJS
export { Methods }


