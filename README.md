# ExperimentJS

ExperimentJS is a framework that greatly simplifies the process of building and running psychophysical
and behavioural experiments in your web browser.

The framework provides the facility to quickly create an experiment.
Simply provide functions and data to manipulate
each of the independent variables you want to examine,
and ExperimentJS will produce a full factorial design and runs the experiment.

```javascript

// Create a function that will display the variable in the display/DOM
ExperimentJS.Trials.setIVsetFunc("Gendered faces", function(img_path){
    $("#your-target-image-element").src(word);
});

// Create the variable levels the function will use (as an array of arrays of levels)
var face_images = ["./img/woman_1.jpg", "./img/woman_2.jpg", "./img/woman_3.jpg", "./img/man_1.jpg", "./img/man_2.jpg", "./img/man_3.jpg"];
ExperimentJS.Trials.setIVLevels("Gendered faces", face_images.map( function(elem){ return [elem] }) );

// Pass participants' responses to ExperimentJS
$(window).keydown(function(event){
    if (event.which === 77){ // M key
        ExperimentJS.Trials.runNextTrial({dv_value: 'male'});
    }
    else if (event.which === 70 ){ // F key
        ExperimentJS.Trials.runNextTrial({dv_value: 'female'});
    }
});

ExperimentJS.Components.Instructions("Is this face (M)ale or (F)emale?");

// Start the experiment!
ExperimentJS.Trials.runNextTrial();
```



#### FLEXIBILE
but is also flexible enough that it can be wired together
in a variety of ways to produce a wide range of experimental paradigms.



#### PRESETS
ExperimentJS is modular and highly customisable. The framework contains a set of predefined stimuli, and psychological paradigms

 CODE DEMO
- img stimuli
- 2afc
- interstimulus pause

#### Saves