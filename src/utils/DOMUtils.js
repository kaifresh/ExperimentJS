
export function _ApplyFunctionToHTMLChildren(elem, func){

    if (elem.children === undefined || typeof func !== "function" ){
        throw new Error("_ApplyFunctionToChildren accepts args (html_element, func)");
    }

    for (var i = 0 ; i < elem.children.length; i++){
        func(elem.children[i]);
    }
}


export function DOM_remove(elem){
    elem.parentNode.removeChild(elem);        //Remove select from dom
}