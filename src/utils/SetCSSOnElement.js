
export function SetCSSOnElement(elem, css){
    var keys = Object.keys(css);
    for (var i = 0; i < keys.length; i++){
        var attribute = keys[i];
        elem.style[attribute] = css[attribute];
    }
}
