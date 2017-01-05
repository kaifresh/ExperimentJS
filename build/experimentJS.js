(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.ExperimentJS = global.ExperimentJS || {})));
}(this, (function (exports) { 'use strict';

// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                                      Trials
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -

var Trials = {};
    var IVs = {};
var setFuncs = {};



/** Every IV requires 2 steps: creating the levels and then, setting the target */
Trials.setIVLevels = function (ivname, levels) {
    _setIVGeneric(ivname, 'levels', levels);
};


Trials.setIVsetFunc = function(ivname, setFunc) {

    //This is now a flag to notify ExperimentJS that you're using functions
    _setIVGeneric(ivname, 'setFunc', true);

    //Functions are now stored in their own map, keyed by ivname
    _setSetFunc(ivname, setFunc);
};

function _setIVGeneric(ivName, fieldName, fieldVal) {
    csvFodderCheck(ivName);
    csvFodderCheck(fieldName);
    if (!IVs.hasOwnProperty(ivName)) { //If IV doenst exists make it as a raw object
        IVs[ivName] = {};
    }

    IVs[ivName][fieldName] = fieldVal;
}


function _setSetFunc(ivname, setfunc){
    setFuncs[ivname] = setfunc;
}


// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
//                                      Trials (subfunctions)
// - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -  - - - - -
function csvFodderCheck(string){

    if (typeof string !== "string"){
        throw new Error("You must supply a variable of type String for this method");
    }

    if (string.indexOf(",") !== -1){
        throw new Error("Strings used by ExperimentJS may not contain commas: " + string);
    }
}

exports.Trials = Trials;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwZXJpbWVudEpTLmpzIiwic291cmNlcyI6WyIuLi9zcmMvY29yZS9UcmlhbHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRyaWFsc1xuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuXG52YXIgVHJpYWxzID0ge307XG5cbnZhciBJVnMgPSB7fTtcbnZhciBzZXRGdW5jcyA9IHt9O1xuXG5cblxuLyoqIEV2ZXJ5IElWIHJlcXVpcmVzIDIgc3RlcHM6IGNyZWF0aW5nIHRoZSBsZXZlbHMgYW5kIHRoZW4sIHNldHRpbmcgdGhlIHRhcmdldCAqL1xuVHJpYWxzLnNldElWTGV2ZWxzID0gZnVuY3Rpb24gKGl2bmFtZSwgbGV2ZWxzKSB7XG4gICAgX3NldElWR2VuZXJpYyhpdm5hbWUsICdsZXZlbHMnLCBsZXZlbHMpO1xufTtcblxuXG5UcmlhbHMuc2V0SVZzZXRGdW5jID0gZnVuY3Rpb24oaXZuYW1lLCBzZXRGdW5jKSB7XG5cbiAgICAvL1RoaXMgaXMgbm93IGEgZmxhZyB0byBub3RpZnkgRXhwZXJpbWVudEpTIHRoYXQgeW91J3JlIHVzaW5nIGZ1bmN0aW9uc1xuICAgIF9zZXRJVkdlbmVyaWMoaXZuYW1lLCAnc2V0RnVuYycsIHRydWUpO1xuXG4gICAgLy9GdW5jdGlvbnMgYXJlIG5vdyBzdG9yZWQgaW4gdGhlaXIgb3duIG1hcCwga2V5ZWQgYnkgaXZuYW1lXG4gICAgX3NldFNldEZ1bmMoaXZuYW1lLCBzZXRGdW5jKTtcbn07XG5cbmZ1bmN0aW9uIF9zZXRJVkdlbmVyaWMoaXZOYW1lLCBmaWVsZE5hbWUsIGZpZWxkVmFsKSB7XG4gICAgY3N2Rm9kZGVyQ2hlY2soaXZOYW1lKTtcbiAgICBjc3ZGb2RkZXJDaGVjayhmaWVsZE5hbWUpO1xuICAgIGlmICghSVZzLmhhc093blByb3BlcnR5KGl2TmFtZSkpIHsgLy9JZiBJViBkb2Vuc3QgZXhpc3RzIG1ha2UgaXQgYXMgYSByYXcgb2JqZWN0XG4gICAgICAgIElWc1tpdk5hbWVdID0ge307XG4gICAgfVxuXG4gICAgSVZzW2l2TmFtZV1bZmllbGROYW1lXSA9IGZpZWxkVmFsO1xufVxuXG5cbmZ1bmN0aW9uIF9zZXRTZXRGdW5jKGl2bmFtZSwgc2V0ZnVuYyl7XG4gICAgc2V0RnVuY3NbaXZuYW1lXSA9IHNldGZ1bmM7XG59XG5cblxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRyaWFscyAoc3ViZnVuY3Rpb25zKVxuLy8gLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLVxuZnVuY3Rpb24gY3N2Rm9kZGVyQ2hlY2soc3RyaW5nKXtcblxuICAgIGlmICh0eXBlb2Ygc3RyaW5nICE9PSBcInN0cmluZ1wiKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc3VwcGx5IGEgdmFyaWFibGUgb2YgdHlwZSBTdHJpbmcgZm9yIHRoaXMgbWV0aG9kXCIpO1xuICAgIH1cblxuICAgIGlmIChzdHJpbmcuaW5kZXhPZihcIixcIikgIT09IC0xKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3RyaW5ncyB1c2VkIGJ5IEV4cGVyaW1lbnRKUyBtYXkgbm90IGNvbnRhaW4gY29tbWFzOiBcIiArIHN0cmluZyk7XG4gICAgfVxufVxuXG4vLyBUcmlhbHMucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbiggT2JqZWN0LmNyZWF0ZSApXG5cbi8vIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC1cbi8vXG4vLyAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtICAtIC0gLSAtIC0gIC0gLSAtIC0gLSAgLSAtIC0gLSAtXG5cbi8vIHZhciBUcmlhbHMgPSB7XG4vLyAgICAgSVZzOiBJVnMsXG4vLyAgICAgc2V0RnVuY3M6IHNldEZ1bmNzLFxuLy8gICAgIHNldElWR2VuZXJpYzogX3NldElWR2VuZXJpYyxcbi8vICAgICBzZXRJVkxldmVsczogc2V0SVZMZXZlbHMsXG4vLyAgICAgc2V0U2V0RnVuYzogX3NldFNldEZ1bmMsXG4vLyAgICAgY3N2Rm9kZGVyQ0hlY2s6IGNzdkZvZGRlckNoZWNrXG4vLyB9O1xuXG5cbmV4cG9ydCB7IFRyaWFscyB9OyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7OztBQUlBLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQzs7QUFFaEIsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ2IsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDOzs7OztBQUtsQixNQUFNLENBQUMsV0FBVyxHQUFHLFVBQVUsTUFBTSxFQUFFLE1BQU0sRUFBRTtJQUMzQyxhQUFhLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztDQUMzQyxDQUFDOzs7QUFHRixNQUFNLENBQUMsWUFBWSxHQUFHLFNBQVMsTUFBTSxFQUFFLE9BQU8sRUFBRTs7O0lBRzVDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDOzs7SUFHdkMsV0FBVyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztDQUNoQyxDQUFDOztBQUVGLFNBQVMsYUFBYSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFO0lBQ2hELGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2QixjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDMUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDN0IsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztLQUNwQjs7SUFFRCxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsUUFBUSxDQUFDO0NBQ3JDOzs7QUFHRCxTQUFTLFdBQVcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDO0lBQ2pDLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxPQUFPLENBQUM7Q0FDOUI7Ozs7OztBQU1ELFNBQVMsY0FBYyxDQUFDLE1BQU0sQ0FBQzs7SUFFM0IsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLENBQUM7UUFDM0IsTUFBTSxJQUFJLEtBQUssQ0FBQywyREFBMkQsQ0FBQyxDQUFDO0tBQ2hGOztJQUVELElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUMzQixNQUFNLElBQUksS0FBSyxDQUFDLHVEQUF1RCxHQUFHLE1BQU0sQ0FBQyxDQUFDO0tBQ3JGO0NBQ0osQUFFRCw7Oyw7Oyw7OyJ9
