# ExperimentJS

Running behavioural experiments in your browser harnesses the internet to make them more accessible to participants,
portable across computers/operating systems, and leverages the simplicity of HTML5 primitives (buttons, images, videos, etc) to build interfaces and stimuli.
The problem is, writing experiments can be time consuming and small changes in your experimental design can result in big
 changes to your code.

ExperimentJS solves this by providing a framework that greatly simplifies this process of building and running experiments.
ExperimentJS takes care of the small details in implementing experiments and lets you focus on the big picture,
like working on stimulus design and experimental structure.

To run a basic experiment, all you need to do is:

Include `experimentJS.js` or `experimentJS.min.js` from /dist.
```HTML
<script src="experimentJS.js"></script>
```

Create the necessary elements to view the stimuli in your HTML. In this example lets create an image:
```HTML
<img id="your-target-image-element"/>
```

Now, create your first [Independent Variable](https://en.wikipedia.org/wiki/Dependent_and_independent_variables).
Write an *IVsetFunc* (i.e. a setter function) that will manage the image that is displayed in this element.

```javascript
ExperimentJS.Trials.setIVsetFunc("Emotion faces", function(img_path){         // (iv name, setter function)
    $("#your-target-image-element").attr("src", img_path);
});
```

Provide the *levels* (i.e. the data) that will be passed to your setter function.

```javascript
var face_images = ["./img/face_1.jpg", "./img/face_2.jpg", "./img/face_3.jpg", "./img/face_4.jpg", "./img/face_5.jpg", "./img/face_6.jpg"];

// setIVLevels() accepts an array of arrays (of arguments to the setter function)
ExperimentJS.Trials.setIVLevels("Emotion faces", face_images.map(function(img_path){      // (iv name, levels)
    ExperimentJS.Utils.PreloadImage(img_path);
    return [ img_path ]
}));
```

Write an event handler to capture participants' responses (i.e. the dependent variable).

```javascript
$(window).keydown(function(event){
    if (event.which === 89){                                    // Y key
        ExperimentJS.Trials.runNextTrial({dv_value: 'yes'});
    }
    else if (event.which === 78 ){                              // N key
        ExperimentJS.Trials.runNextTrial({dv_value: 'no'});
    }
});
```

Optionally, add instructions for your participants.

```javascript
ExperimentJS.Components.Instructions("Is this face happy? Press the Y or N keys to respond.");
```

And of course, run the experiment!

```javascript
ExperimentJS.Trials.runNextTrial();
```

In less than 20 lines of code, you have created an experiment like this
![alt text](../examples/gifs/basic_example_demo_vid.gif "Video of basic example")


### FLEXIBILITY

ExperimentJS is *highly customisable*. Individual components can be wired together in many different ways to
create a wide variety of experimental paradigms.

For example, the experiment above can be easily converted into a forced choice comparison format:

```javascript
// Set up your setter function & the data it will handle
var face_images = ["./img/face_1.jpg", "./img/face_2.jpg", "./img/face_3.jpg", "./img/face_4.jpg", "./img/face_5.jpg", "./img/face_6.jpg"];
var face_img_setter_function = function(id_of_each_image_element, img_path){
    $(id_of_each_image_element).attr("src", img_path);
}

// Use the same images & setter function for both IVs.
ExperimentJS.Trials.setIVsetFunc("Emotion faces on left", face_img_setter_function);
ExperimentJS.Trials.setIVLevels("Emotion faces on left", face_images.map( function(img_path){ ExperimentJS.Utils.PreloadImage(img_path); return ["#lh_img", img_path] }) );

ExperimentJS.Trials.setIVsetFunc("Emotion faces on right", face_img_setter_function);
ExperimentJS.Trials.setIVLevels("Emotion faces on right", face_images.map( function(img_path){ return ["#rh_img", img_path] }) );

// Capture participants' responses
$(window).keydown(function(event){
    if (event.which === 37){                                                // left arrow key
        ExperimentJS.Trials.runNextTrial({dv_value: 'selected left'});
    }
    else if (event.which === 39 ){                                          // right arrow key
        ExperimentJS.Trials.runNextTrial({dv_value: 'selected right'});
    }
});

ExperimentJS.Components.Instructions("Choose the happier face. Use the left and right arrow keys to respond");

ExperimentJS.Trials.runNextTrial();
```

### FULL FACTORIAL RANDOMISED DESIGNS

When you set two or more IVs, ExperimentJS will create a randomised, [full factorial design](https://en.wikipedia.org/wiki/Factorial_experiment).
Trials are randomised using the Fischer-Yates shuffle, by default.
If you wish to customise the behaviour of the trial randomiser, simply override *shuffleTrials*:
```javascript
ExperimentJS.Trials.shuffleTrials = function(all_trials_array){ ... }
```

### DATA

When a participant completes all trials in the experiment, the browser will download a CSV formatted output of the current participant's results.

| Participant Name | Participant Number | IV0_Emotion faces | DV_value |
|------------------|--------------------|-------------------|----------|
| billy            | 0                  | ./img/face_5.jpg  | yes      |
| billy            | 0                  | ./img/face_1.jpg  | no       |
| billy            | 0                  | ./img/face_6.jpg  | yes      |
| billy            | 0                  | ./img/face_4.jpg  | no       |
| billy            | 0                  | ./img/face_3.jpg  | yes      |
| billy            | 0                  | ./img/face_2.jpg  | no       |


This automatic downloading behaviour can also be overridden, should you choose
to do something else with the data.
For example, if you wanted to upload participant data to your server:

```javascript
Trials.OutputResponses = function(csv_data_string){
    $.post("/upload.php", {ExperimentJS_output_data: csv_data_string});
}
```

### PRESET STIMULI
To further speed up development, ExperimentJS contains a range of predefined components for creating frequently
used stimulus types.

For example, the image based independent variable in the basic experiment above can be rewritten as a one-liner, using the `ExperimentJS.Stimuli.ImageStimuliIV` preset:

```javascript
ExperimentJS.Stimuli.ImageStimuliIV("Emotion faces", ["./img/face_1.jpg", "./img/face_2.jpg", "./img/face_3.jpg", "./img/face_4.jpg", "./img/face_5.jpg", "./img/face_6.jpg"]);

ExperimentJS.Components.Instructions("Is this face happy? Press the Y or N keys to respond.");

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

Presets are simply a loose wrapper around `ExperimentJS.Trials.setIVsetFunc` and `ExperimentJS.Trials.setIVLevels`.
These core elements are highly customisable and can be wrapped with various functionalities to produce many different types of stimuli.

[//]: # ([Click here](TODO) to view a full list of stimuli presets.)


### PRESET PARADIGMS
ExperimentJS also provides built-in support for a variety of experimental paradigms
(such as Two Alternative Forced Choice).

[//]: # ( [Click here](TODO) to view a full list of presets, usage instructions and demos.)

### ADDITIONAL FEATURES

ExperimentJS supports a variety of other commonly required features:

- Response time tracking
- Displaying IVs in different phases (e.g. in [backwards masking paradigms](https://en.wikipedia.org/wiki/Backward_masking))
- Experimental instructions
- Saving participants' progress
- Getting participant information
- Interstimulus pause (black screen between trials)
- Callbacks (defining custom behaviours at the start, middle and end of your experiment)