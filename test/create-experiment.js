/**
 * Created by kai on 5/1/17.
 */

function assert(condition, message) {
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message; // Fallback
    }
}

/** ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~  */
/** ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~  */
/** ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~  */

function lengthTest(builtTrials, a_levels, b_levels, repeats){
    var lengthTest = builtTrials.length === a_levels.length * b_levels.length * repeats;
    assert(lengthTest, "Length Test Failed");
}

function contentTest(builtTrials, a_levels, b_levels){

    var result = true;

    for (var i = 0; i < a_levels.length; i++){
        for (var j = 0; j < b_levels.length; j++){

            var didFindCombo = false;
            for (var k = 0; k < builtTrials.length; k++){

                var firstPos = builtTrials[k][0].value[0] === a_levels[i][0] || builtTrials[k][0].value[0] === b_levels[j][0];
                var secondPos = builtTrials[k][1].value[0] === a_levels[i][0] || builtTrials[k][1].value[0] === b_levels[j][0];

                if (firstPos && secondPos) didFindCombo = true;
            }

            //BITWISE AND
            result = result & didFindCombo;
        }
    }

    assert(result, "content test failed");
}

function testIVLevels(){

    var a_levels = [1, 2, 3, "x"].map(function(e){return [e]});
    ExperimentJS.Trials.setIVLevels("IV a", a_levels);
    ExperimentJS.Trials.setIVsetFunc("IV a", function(){
        console.log("IV a setFunc! ", arguments);
    });

    var b_levels = [99, 88].map(function(e){return [e]});
    ExperimentJS.Trials.setIVLevels("IV b", b_levels);
    ExperimentJS.Trials.setIVsetFunc("IV b", function(){
        console.log("IV b setFunc! ", arguments);
    });



    

    
    
    var repeats = 2;
    ExperimentJS.Trials.setRepeats(repeats);
    ExperimentJS.Trials.buildExperiment(true);




    var builtTrials = ExperimentJS.Trials.getTrials();
    console.log(builtTrials);

    lengthTest(builtTrials, a_levels, b_levels, repeats);
    contentTest(builtTrials, a_levels, b_levels);


    $(window).keydown(function(event){

        if (event.which === 32){
            ExperimentJS.Trials.runNextTrial({shouldStoreResponse: true, dv_value: 'get money'});
        }

    });

}

testIVLevels();
console.log("Done");

console.log("Module:", ExperimentJS);


