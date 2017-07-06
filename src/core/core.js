//Order of imports is important

// Import Trials and extend it
import { Trials } from  "./Trials.js"; //Needs ./ to treat it as an internal (not external dependency)
import "./RunExperiment.js";           // Extends the functionality of the Trials object
import "./OutputResponses.js";
import "./GetPptInfo.js";
//import "./2AFC.js";

import { Pause } from  "./InterstimulusPause.js";
import { Saves } from "./Saves.js";

//These are the fields of ExperimentJS
export { Trials };
export { Pause };
export { Saves };