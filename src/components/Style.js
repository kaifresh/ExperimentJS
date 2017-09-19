/**
 * Created by kai on 19/9/17.
 */

var _did_add_css = false;
export function _UseCSSStyle(){

    if (!_should_use_css_style) return;
    if (_did_add_css) return;

    var link = document.createElement( "link" );
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/flat-ui/2.3.0/css/flat-ui.css";
    link.type = "text/css";
    link.rel = "stylesheet";
    link.media = "screen,print";
    link.id = "ExperimentJS-css";

    document.getElementsByTagName( "head" )[0].appendChild( link );

    _did_add_css = true;
}

var _should_use_css_style = true;
export function SetShouldUseCSS(should_use_css){
    if (typeof use_style !== "boolean"){
        throw new Error("[ SetShouldUseCSSStyle ERROR] : usage (bool should_use_css)");
    }

    _should_use_css_style = should_use_css;

}