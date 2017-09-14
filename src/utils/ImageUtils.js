
export function preloadImage(path){
    return new Promise(function(resolve, reject){
        var img = new Image();
        img.onload = function(){ resolve() };
        img.onerror = function(){ reject() };
        img.src = path;
    });

}