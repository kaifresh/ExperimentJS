
/**
 * To speed up the loading of a
 * @param path {string} - path to image file (on disk or a URL) that will be set as the image source
 * @memberof Utils
 */
export function preloadImage(path){
    return new Promise(function(resolve, reject){
        var img = new Image();
        img.onload = function(){ resolve() };
        img.onerror = function(){ reject() };
        img.src = path;

        img.style.visibility = "hidden";
        document.body.appendChild(img);
    });
}