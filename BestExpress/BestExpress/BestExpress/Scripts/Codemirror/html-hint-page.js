var $page = function () {
    this.init = function () {
        Loading();

    }
    function showCode() {
        var text = editor.getValue();
        return text;
    }
    this.setCode = function (val) {
        debugger
        editor.setValue(val);
    }

    function Loading() {

        editor = CodeMirror(document.getElementById("code"), {
            mode: "text/html",
            extraKeys: { "Ctrl-Q": "autocomplete" }
        });


        //var cEditor = CodeMirror.fromTextArea(document.getElementById("htmlcode"), {
        //   mode: "text/html",
        //  extraKeys: {"Ctrl-Space": "autocomplete"},
        //  value: document.documentElement.innerHTML;
        //});
        editor.on("keyup", function (editor, event) {
            var code = parseInt(event.keyCode);
            console.log(code);
            if (code >= 65 && code <= 90 || code == 16)
                CodeMirror.commands.autocomplete(editor, null, { completeSingle: false });
        })
    }
}
$(function () {

    window.$pubPage = page = new $page();
    page.init();
    if (localStorage.HtmlCodePar != null) {
        page.setCode(localStorage.HtmlCodePar);
    }
    setInterval(function () {
    if ($("#hidCode").size() > 0)
    {
        $("#hidCode").val(editor.getValue())
    }
}, 500);
})


