var $quickFactory = function (key, selector, setControlId1, setControlId2, setControlId3, setControlId4, setControlId5) {
    var tipMethods = [
        {
            key: "json-data",
            method: function () {
                var windowBox = $(selector);
                jqxWindow(selector, "输入JSON", "470", "auto");
                var btn = windowBox.find("button");
                var setObj = $(setControlId1);
                btn.unbind();
                var inputs = windowBox.find(".js-getvalue-key");
                var json = {};
                btn.click(function () {
                    if (inputs != null) {
                        inputs.each(function () {
                            var th = $(this);
                            var thVal = th.val();
                            if (thVal != null && thVal != "") {
                                json[thVal] = th.parent().next().find("input").val();
                            }

                        });
                    }
                    var objVal = JSON.stringify(json);
                    if (objVal != null && objVal != "") {
                        objVal = objVal.replace(/\"getValue\_/g, "getValue_");
                        objVal = objVal.replace(/\(\)\"/g, "()");
                    }
                    setObj.val(objVal);
                    $(selector).jqxWindow("close");
                    windowBox.find(":text").val("");
                })

            }
        },//json-data
        {
            key: "js-getvalue",
            method: function () {
                jqxWindow(selector, "获取id的value", "250", "auto");
                var windowBox = $(selector);
                var input = windowBox.find("input:text");
                var btn = windowBox.find("button");
                var setObj = $(setControlId1);
                btn.unbind();
                btn.click(function () {
                    setObj.val("getValue_" + input.val() + "()");
                    $(selector).jqxWindow("close");
                    input.val("");
                });
            }
        },//js-get-value
        {
            key: "data-api",
            method: function () {
                $pubPage.selector.$btnSaveDataApi().unbind();
                $pubPage.selector.$btnSaveDataApi().click(function () {
                    var dataApiVal = $pubPage.selector.$selApiData().val();
                    if (dataApiVal == "" || dataApiVal == null || dataApiVal == "null") {
                        jqxAlert("请选择数据源!");
                    } else {
                        var ApiText = $(selector).closest(".divEventParBox,form").find("#" + setControlId1 + ",[data-id='" + setControlId1 + "']");
                        var ApiId = $(selector).closest(".divEventParBox,form").find("#" + setControlId2 + ",[data-id='" + setControlId2 + "']");
                        ApiId.val(dataApiVal);
                        ApiText.val($pubPage.selector.$selApiData().find("option:selected").text());
                        $pubPage.selector.$divDataApiBox().jqxWindow("close");
                    }
                });
                $pubPage.selector.$selApiDataType().unbind();
                $pubPage.selector.$selApiDataType().change(function () {
                    var th = $(this);
                    var thval = th.val();
                    if (thval == "") return;
                    $.ajax({
                        dataType: "json",
                        url: "/BestPalace/PageFactory/GetDataApi",
                        type: "post",
                        data: {
                            typeId: thval,
                        },
                        success: function (msg) {
                            $pubPage.selector.$selApiData().empty();
                            $(msg).each(function (i, v) {
                                $pubPage.selector.$selApiData().append("<option value='" + v.Id + "' >" + v.Title + "</option>");
                            });
                        },
                        error: jqxError
                    });
                });
                jqxWindow($pubPage.selector.$divDataApiBox().selector, "选择数据源", "400", "auto");
            }
        },//data-api
        {
            key: "select-event",
            method: function () {
                var th = $(selector);
                var thisInput = th.prev();
                var html = priMehtod.getEventHtml(0, true);
                var box = $pubPage.selector.$divEventBox().find(".innerBox");
                box.html(html);
                box.append("<div class='buttonBox'><input id='btnSave' type='button' class='jqx-rc-all jqx-button jqx-widget jqx-fill-state-normal' value='保存' /> &nbsp;<input id='btnCancel' type='button' class='jqx-rc-all jqx-button jqx-widget jqx-fill-state-normal' value='取消' /></div>");
                jqxWindow($pubPage.selector.$divEventBox().selector, "快捷输入", "600", "auto");
                box.find("#btnSave").unbind();
                box.find("#btnSave").click(function () {
                    var pars = [];
                    var th = $(this);
                    box.find("[name='para.value']:enabled").each(function () {
                        var pareInput = $(this);
                        var par = { key: pareInput.next().next().val(), value: pareInput.val() };
                        pars.push(par);
                    });
                    var parsString = $.convert.jsonToStr(pars);
                    if (parsString != null)
                        parsString = parsString.replace(/[,]/g, "$^douhao^$");
                    $.ajax({
                        url: "/BestPalace/PageFactory/GetEventJavaScriptByPars",
                        data: { pars: parsString, eventType: box.find("[name='event_Value']").val() },
                        dataType: "html",
                      type: 'post',
                        success: function (msg) {
                            thisInput.val(thisInput.val() + msg);
                            $pubPage.selector.$divEventBox().jqxWindow("close");
                        },
                        error: jqxError
                    })
                });
                box.find("#btnCancel").unbind();
                box.find("#btnCancel").click(function () {
                    $pubPage.selector.$divEventBox().jqxWindow("close");
                })
            }
        },//select-event
        {
            key: "html-code",
            method: function () {
                var windowBox = $(selector);
                jqxWindow(selector, "输入代码", "550", "auto");
                var save = windowBox.find("#btn");
                var close = windowBox.find("#close");
  
                var setObj = $(setControlId1);
                var htmlCode = $(setControlId1).closest("form").find("#htmlCode").val();
                var ishtmlCode = htmlCode != null && htmlCode != "";
                localStorage.HtmlCodePar = null;
                if (ishtmlCode)
                {
                    localStorage.HtmlCodePar=htmlCode;
                }
                save.unbind();
                var inputs = windowBox.find("#iframe");
                save.click(function () {
                    if (inputs != null) {
                        var code = $(selector + " iframe").contents().find("#hidCode").val();
                        objVal = code;
                    }
                    setObj.val(objVal);
                    $(selector).jqxWindow("close");
                    windowBox.find(":text").val("");
                })
                close.unbind();
                close.click(function () {
                    $(selector).jqxWindow("close");
                })
            }
        },//html-code
        {
            key: "js-grid",
            method: function () {
                var windowBox = $(selector);
                var apiId = $(setControlId1).closest("form").find(".eleName  #ApiId").val();
                var isSelectedApi = apiId != null && apiId != "" && apiId != "0";
                if (!isSelectedApi) { jqxAlert("请先选择接口"); return };
                jqxWindow(selector, "设置表格", "1050px", "auto");
                var save = windowBox.find("#btn");
                var close = windowBox.find("#close");
                var setObj = $(setControlId1).prev();
                var form = setObj.closest("form");
                var colVal = form.find("[data-columns='columns']").val();
                var isEdit = colVal != "" && colVal != "[]";
                localStorage.gridParas = null;
                if (isEdit) {
                    localStorage.gridParas=colVal;
                }

                save.unbind();
                var iframe = windowBox.find("#iframe");
                iframe.attr("src", "/BestPalace/Codemirror/GridPage?" + $.param({ apiId: apiId }))
                save.click(function () {
                    if (iframe != null) {
                        var code = $(selector + " iframe").contents().find("#hidCode").val();
                        objVal = code;
                    }
                    setObj.val(objVal);
                    $(selector).jqxWindow("close");
                    windowBox.find(":text").val("");
                })
                close.unbind();
                close.click(function () {
                    $(selector).jqxWindow("close");
                })
            }
        },//js-grid
    ];
    var data = $.linq.where(tipMethods, function (v) {
        return v.key == key;
    })[0];
    data.method();
}
