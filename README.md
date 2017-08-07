# ExperimentJS

ExperimentJS is a framework that greatly simplifies the process of building and running psychophysical
and behavioural experiments in your web browser.

Simply provide data and a function that manipulates an independent variable you want to examine,
as well as a mechanism to capture participants' responses.
ExperimentJS will produce a fully factorial design and run an experiment.

<!-- INCLUDE AN IMAGE OF THE EXPEIRMETN THSI PRODUCES!! -->

```javascript

// Create a function that will display the variable in the display/DOM
ExperimentJS.Trials.setIVsetFunc("Gendered faces", function(img_path){      // (iv name, setter function)
    $("#your-target-image-element").src(img_path);
});

// Create the variable levels the function will use (as an array of arrays of args for the setter function)
var face_images = ["./img/woman_1.jpg", "./img/woman_2.jpg", "./img/woman_3.jpg", "./img/man_1.jpg", "./img/man_2.jpg", "./img/man_3.jpg"];

ExperimentJS.Trials.setIVLevels("Gendered faces", face_images.map( function(elem){ return [elem] }) );      // (iv name, levels)

// Pass participants' responses to ExperimentJS
$(window).keydown(function(event){
    if (event.which === 89){ // Y key
        ExperimentJS.Trials.runNextTrial({dv_value: 'yes'});
    }
    else if (event.which === 78 ){ // N key
        ExperimentJS.Trials.runNextTrial({dv_value: 'no'});
    }
});

ExperimentJS.Components.Instructions("Is this face masculine? Press the Y or N keys to respond.");

// Start the experiment!
ExperimentJS.Trials.runNextTrial();
```


### FLEXIBILE

ExperimentJS is highly customisable. Components can be wired together in many different ways to
create a wide range of different experimental paradigms.

For example, the experiment above can be easily converted into a forced choice format.

<!-- INCLUDE AN IMAGE OF THE EXPEIRMETN THSI PRODUCES!! -->
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

ExperimentJS.Components.Instructions("Choose the more masculine face. Use the left and right arrow keys to respond");

```


### PRESETS
ExperimentJS also contains a range of predefined components to quickly create commonly used
stimuli, components and experimental paradigms.
These presets are loose wrappers around the core experimental code above,


```javascript

ExperimentJS.Stimuli.ImageStimuliIV("Faces", ["./img/woman_1.jpg", "./img/woman_2.jpg", "./img/woman_3.jpg", "./img/man_1.jpg", "./img/man_2.jpg", "./img/man_3.jpg"]);

ExperimentJS.Components.Instructions("Is this face masculine? Press the Y or N keys to respond.");

$(window).keydown(function(event){
    if (event.which === 89){ // Y key
        ExperimentJS.Trials.runNextTrial({dv_value: 'yes'});
    }
    else if (event.which === 78 ){ // N key
        ExperimentJS.Trials.runNextTrial({dv_value: 'no'});
    }
});

ExperimentJS.Trials.runNextTrial();

```

 CODE DEMO
- img stimuli
- 2afc



### CONVENIENT
At the end of the experiment, ExperimentJS produces a table of results (in CSV format).
Each row of this table contains information about the independent variables in each trial,
and the participants' response.
This csv data can either be downloaded locally or uploaded to a server.

### ADD ONS
- csv formatted output
- repsonse time tracking
- instructions
- saves
- getting participant info
- interstimulus pause

# INSERT GRAPH FLOW IMAGE HERE
1. Build independent variables - provide functions and data to manipulate them
2. Capture participants' responses
3. Set additional