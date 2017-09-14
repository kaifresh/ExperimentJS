/**
 * Created by kai on 14/9/17.
 */

export function preloadImage(path){
    return new Promise(function(resolve, reject){
        var img = new Image();
        img.onload = function(){ resolve() };
        img.onerror = function(){ reject() };
        img.src = path;
    });

}