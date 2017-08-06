# ExperimentJS

ExperimentJS is a framework that greatly simplifies the process of building and running psychophysical
and behavioural experiments in your web browser.

The framework allows users to quickly create an experiment.
Simply provide functions and data to manipulate the independent variables you want to examine,
as well as a method to capture participants' responses.
ExperimentJS will produce a fully factorial design and run an experiment.

```javascript

// Create a function that will display the variable in the display/DOM
ExperimentJS.Trials.setIVsetFunc("Gendered faces", function(img_path){      // (iv name, setter function)
    $("#your-target-image-element").src(img_path);
});

// Create the variable levels the function will use (as an array of arrays of levels)
var face_images = ["./img/woman_1.jpg", "./img/woman_2.jpg", "./img/woman_3.jpg", "./img/man_1.jpg", "./img/man_2.jpg", "./img/man_3.jpg"];
ExperimentJS.Trials.setIVLevels("Gendered faces", face_images.map( function(elem){ return [elem] }) );      // (iv name, levels)

// Pass participants' responses to ExperimentJS
$(window).keydown(function(event){
    if (event.which === 77){ // M key
        ExperimentJS.Trials.runNextTrial({dv_value: 'male'});
    }
    else if (event.which === 70 ){ // F key
        ExperimentJS.Trials.runNextTrial({dv_value: 'female'});
    }
});

ExperimentJS.Components.Instructions("Is this face Male or Female? Press the M or F keys to respond.");

// Start the experiment!
ExperimentJS.Trials.runNextTrial();
```



### FLEXIBILE

ExperimentJS is highly customisable. Components can be wired together in different ways to
create a wide range of different experimental paradigms.

For example, the experiment above can be easily converted into a forced choice format.

```javascript

var face_images = ["./img/woman_1.jpg", "./img/woman_2.jpg", "./img/woman_3.jpg", "./img/man_1.jpg", "./img/man_2.jpg", "./img/man_3.jpg"];

var face_img_setter_function = function(id_of_each_image_element, img_path){
    $(id_of_each_image_element).src(img_path);
}

ExperimentJS.Trials.setIVsetFunc("Gendered faces on left", face_img_setter_function);
ExperimentJS.Trials.setIVLevels("Gendered faces on left", face_images.map( function(elem){ return ["#lh_img", elem] }) );

ExperimentJS.Trials.setIVsetFunc("Gendered faces on right", face_img_setter_function);
ExperimentJS.Trials.setIVLevels("Gendered faces on right", face_images.map( function(elem){ return ["#rh_img", elem] }) );

$(window).keydown(function(event){
    if (event.which === 37){ // left arrow key
        ExperimentJS.Trials.runNextTrial({dv_value: 'selected left'});
    }
    else if (event.which === 39 ){ // right arrow key
        ExperimentJS.Trials.runNextTrial({dv_value: 'selected right'});
    }
});

ExperimentJS.Components.Instructions("Choose the more masculine face. Use the arrow keys to respond");

// Start the experiment!
ExperimentJS.Trials.runNextTrial();
```


but is also flexible enough that it can be wired together
in a variety of ways to produce a wide range of experimental paradigms.



### PRESETS
 The framework contains a set of predefined stimuli, and psychological paradigms

 CODE DEMO
- img stimuli
- 2afc
- interstimulus pause
s


### ADD ONS
- csv formatted output
- repsonse time tracking
- instructions
- saves
