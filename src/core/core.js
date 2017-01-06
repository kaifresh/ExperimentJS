/**
 * Created by kai on 5/1/17.
 *
 * Join together all the trials submodules
 */

//Order is important
import { Trials } from  "./Trials.js"; //Needs ./ to treat it as an internal (not external dependency)
import "./RunExperiment.js";
//import "./2AFC.js";

import { Pause } from  "./InterstimulusPause.js";
import { Saves } from "./Saves.js";


//These are the fields of ExperimentJS
export { Trials };
export { Pause };
export { Saves };