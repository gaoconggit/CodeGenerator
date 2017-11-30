var $page = function () {
    this.init = function () {
        Loading();

    }
    function showCode() {
        var text = cEditor.getValue();
        return text;
    }
    function Loading() {
        //获取sql表名和字段   
        var Getsource = function () {
            var reval;
            $.ajax({
                dataType: 'json',
                type: 'post',
                url: '/BestPalace/DataSource/loadingSqlData',
                async: false,
                success: function (data) {
                    reval = data;
                }, error: jqxError
            })
            return reval;
        }
        var sqlEditor = CodeMirror.fromTextArea(document.getElementById("sqlcode"), {
            lineNumbers: true,
            matchBrackets: true,
            mode: "text/x-mssql",
            extraKeys: {
                "Ctrl-Q": "autocomplete",
            }, // To invoke the auto complete
            hint: CodeMirror.hint.sql,
            onkeyup: function (e, s) {
                if (s.type == "keyup") {
                    CodeMirror.commands.autocomplete(e, null, { completeSingle: false });
                }
            },
            hintOptions: {
                tables: Getsource()
            }
        });
        //获取键盘
        sqlEditor.on("keyup", function (editor, event) {
            var code = parseInt(event.keyCode);
            if (code >= 65 && code <= 90 || code == 16 || code == 190)
                CodeMirror.commands.autocomplete(editor, null, { completeSingle: false });
        })

    }
}
$(function () {

    page = new $page();
    page.init();
})