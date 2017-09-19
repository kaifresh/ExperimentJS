
/**
 * @namespace ExperimentJS.Components.Style
 */

function _CreateLink(href, id){
    id = id || "";
    href = href || "";

    var link = document.createElement( "link" );
    link.href = href;
    link.type = "text/css";
    link.rel = "stylesheet";
    link.media = "screen,print";
    link.id = id;
    return link;
}

var _did_add_css = false;
export function _UseCSSStyle(){

    if (_did_add_css) return;
    if (!_should_use_css_style) return;

    var link_flatui = _CreateLink("https://cdnjs.cloudflare.com/ajax/libs/flat-ui/2.3.0/css/flat-ui.css", "ExperimentJS-css");
    var link_bootstrap = _CreateLink("https://cdnjs.cloudflare.com/ajax/libs/flat-ui/2.3.0/css/vendor/bootstrap/css/bootstrap.min.css", "Bootstrap-css");

    // Prepend, so that users can overwrite styles as required
    var head = document.getElementsByTagName( "head" )[0];
    head.insertBefore(link_flatui, head.firstChild);
    head.insertBefore(link_bootstrap, link_flatui);

    _did_add_css = true;
}

var _should_use_css_style = true;

/**
 * Set whether ExperimentJS should include its default stylesheet.
 * This stylesheet is written into the DOM and references Designmodo FlatUI and Bootstrap.
 * @param should_use_css {bool}
 * @memberof ExperimentJS.Components.Style
 */
export function SetShouldUseCSS(should_use_css){
    if (typeof use_style !== "boolean"){
        throw new Error("[ SetShouldUseCSSStyle ERROR] : usage (bool should_use_css)");
    }
    _should_use_css_style = should_use_css;
}