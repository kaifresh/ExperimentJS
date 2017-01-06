/**
 * Created by kai on 5/1/17.
 */


function testIVLevels(){

    var a_levels = [1, 2].map(function(e){return [e]});
    ExperimentJS.Trials.setIVLevels("IV a ", a_levels);
    ExperimentJS.Trials.setIVsetFunc("IV a ", function(){
        console.log("IV a setFunc! ", arguments);
    });

    var b_levels = [99, 88].map(function(e){return [e]});
    ExperimentJS.Trials.setIVLevels("IV b ", b_levels);
    ExperimentJS.Trials.setIVsetFunc("IV b ", function(){
        console.log("IV b setFunc! ", arguments);
    });

    var repeats = 2;
    ExperimentJS.Trials.setRepeats(repeats);
    ExperimentJS.Trials.buildExperiment(true);



    $(window).keydown(function(event){

        if (event.which === 32){
            ExperimentJS.Trials.runNextTrial({shouldStoreResponse: true, dv_value: 'get money'});
        }

    });

    //Need to actually get the trials array
}


testIVLevels();
console.log("Done");

console.log("Module:", ExperimentJS);


