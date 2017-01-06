/**
 * Created by kai on 5/1/17.
 */
export function createDownloadLink(filename, data){
    ////http://stackoverflow.com/questions/17836273/export-javascript-data-to-csv-file-without-server-interaction
    var a = document.createElement('a');
    a.href = data;
    a.target = '_blank';
    a.download = filename;
 
    return a;
}