/**
 * Created by kai on 5/1/17.
 */
import { _setIVGeneric, Trials } from './core/Trials.js';

var didSet2AFC = false;

Trials.setIV2AFCStd = function (ivname, std_2AFC) { //Levels for 2AFC (move to separate file somehow)
    _setIVGeneric(ivname, 'std_2AFC', std_2AFC);
    didSet2AFC = true; //
};