var $page = function () {
    this.init = function () {
        loadingCode();
    }
    function showCode() {
        var text = cEditor.getValue();
        return text;
    }
    function loadingCode() {
        //c#
        var cEditor = CodeMirror.fromTextArea(document.getElementById("csharepcode"), {
            lineNumbers: true,
            matchBrackets: true,
            hint: CodeMirror.hint.anyword,
            mode: "text/x-csharp",
            extraKeys: { "Ctrl-Q": "autocomplete" }
        });
        //事件
        cEditor.on("keyup", function (editor, event) {
            var code = parseInt(event.keyCode);
            console.log(code);
            if (code >= 65 && code <= 90 || code == 16 || code == 190)
                CodeMirror.commands.autocomplete(editor, null, { completeSingle: false });

        })
    }
}
$(function () {

    page = new $page();
    page.init();
})