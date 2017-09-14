//Order of imports is important

/* Import Trials and extend it with additional functionality*/
import { Trials } from  "./Trials.js"; //Needs ./ to treat it as an internal (not external dependency)
import "./RunExperiment.js";           // Extends the functionality of the Trials object
import "./ResponsesOutput.js";
import "./GetPptInfo.js";

import { Pause } from  "./InterstimulusPause.js";
import { Saves } from "./Saves.js";

//These are the fields of ExperimentJS
export { Trials };
export { Pause };
export { Saves };
