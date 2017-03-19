 var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    lineNumbers: true,
    mode:  "xml"
});

function submit_html()
{
    editor.save();
    var code = document.getElementById("editor").value;
    submitHtml2(code)
    //var data_url = "data:text/html;charset=utf-8;base64," + $.base64.encode(code);
    //document.getElementById("result").src = data_url;
}