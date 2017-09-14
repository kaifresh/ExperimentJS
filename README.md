# ExperimentJS

Running behavioural experiments via your web-browser harnesses the internet to make them more widely accessible to participants,
portable across computers and operating systems, and leverage the simplicity of HTML5 primitives (buttons, images, videos, etc).
The problem is, writing experiments can be time consuming and small changes in your experimental design can result in big
 changes to your code.

ExperimentJS solves this by providing a framework that greatly simplifies this process of building and running experiments.
ExperimentJS takes care of the small details in implementing experiments, and lets you focus on big picture ideas
like stimulus design and experimental structure.

To run a basic experiment, all you need to do is:

Create the necessary elements to view the stimuli in your HTML. In this example lets create an image:
```HTML
 <img id="your-target-image-element"/>
```

Write an *IVsetFunc* (i.e. a setter function) that will manage the image that is displayed in this element

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

Write an event handler to capture participants' responses

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

Optionally, add instructions for your participants

```javascript
ExperimentJS.Components.Instructions("Is this face happy? Press the Y or N keys to respond.");
```

And of course, run the experiment!

```javascript
ExperimentJS.Trials.runNextTrial();
```

In less than 20 lines of code, you have created an experiment like this:
![alt text](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Logo Title Text 1")


### FLEXIBILITY

ExperimentJS is highly customisable. Individual components can be wired together in many different ways to
create a wide variety of experimental paradigms.

For example, the experiment above can be easily converted into a forced choice format:

```javascript

var face_images = ["./img/face_1.jpg", "./img/face_2.jpg", "./img/face_3.jpg", "./img/face_4.jpg", "./img/face_5.jpg", "./img/face_6.jpg"];

var face_img_setter_function = function(id_of_each_image_element, img_path){
    $(id_of_each_image_element).attr("src", img_path);
}

ExperimentJS.Trials.setIVsetFunc("Emotion faces on left", face_img_setter_function);
ExperimentJS.Trials.setIVLevels("Emotion faces on left", face_images.map( function(img_path){ ExperimentJS.Utils.PreloadImage(img_path); return ["#lh_img", img_path] }) );

ExperimentJS.Trials.setIVsetFunc("Emotion faces on right", face_img_setter_function);
ExperimentJS.Trials.setIVLevels("Emotion faces on right", face_images.map( function(img_path){ return ["#rh_img", img_path] }) );

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


### FULL FACTORIAL DESIGNS

When you set two or more IVs, ExperimentJS will create a randomised [full factorial design](https://en.wikipedia.org/wiki/Factorial_experiment) by default.
Trial randomisation is performed using the Fischer-Yates shuffle by default.
If you wish to customise the behaviour of the trial randomiser, simply override ```javascript  ExperimentJS.Trials.shuffleTrials = function(all_trials_array){ ... } ```



### DATA

When your experiment completes, by default the browser will download a CSV formatted output of the current participant's results.
This behaviour can also be overridden, should you choose to do something else with the data.
For example, if you wanted to upload participant data to your server:

```javascript
Trials.OutputResponses = function(csv_data_string){
    $.post("/upload.php", {ExperimentJS_output_data: csv_data_string});
}
```





### PRESETS
ExperimentJS also contains a range of predefined components to quickly create commonly used
stimuli, components and experimental paradigms.
These presets are loose wrappers around the core experimental code above,


```javascript

ExperimentJS.Stimuli.ImageStimuliIV("Happy faces", ["./img/face_1.jpg", "./img/face_2.jpg", "./img/face_3.jpg", "./img/face_4.jpg", "./img/face_5.jpg", "./img/face_6.jpg"]);

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

 CODE DEMO
- 2afc


### DATA
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
- callbacks

# INSERT GRAPH FLOW IMAGE HERE
1. Build independent variables - provide functions and data to manipulate them
2. Capture participants' responses
3. Set additional