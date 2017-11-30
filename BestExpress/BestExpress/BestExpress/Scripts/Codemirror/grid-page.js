var $page = function () {
    var selector = { $hidCode: function () { return $("#hidCode"); } };
    this.init = function () {

        //将table里面的所有值转成JSON赋值给hidden
        if (columnsJson != null && columnsJson.length > 0) {
            setInterval(function () {
                var json = [];
                $(columnsJson).each(function (i, v) {
                    $("#gridTable_tableData [name='" + v + "']").each(function () {
                        var th = $(this);
                        var input = th.find("select,input[type='text'],textarea");
                        var hidden = th.find("[type='hidden']");
                        var attrKey = input.attr("name");
                        var columnName = v;
                        json.push({ columnName: columnName, attrKey: attrKey, attrValue: input.val(), valueType: hidden.val() });
                    })
                })
                selector.$hidCode().val($.convert.jsonToStr(json));
            }, 300);
        }

        //如果是编辑绑定控件
        var editInfo = localStorage.gridParas;
        if (editInfo != null && editInfo.length > 2) {
            var editInfoArray = $.convert.strToJson(editInfo);
            $(editInfoArray).each(function (i, v) {
                $("[name='" + v.columnName + "']").find("[name='" + v.attrKey + "']").val(v.attrValue);
            });
        }
    }
};

$(function () {
    var page = new $page();
    page.init();
    FixTable("gridTable", 1, 1000, 630);
})