/// <reference path="../../tool/_reference.js" />

function uiEngineRedirect(url, pars, pars2, m) {
    var length = pars == null ? 0 : pars.length;
    var paraJson = {};
    if (pars != null && pars.length > 0) {
        $(pars).each(function (i, v) {
            if (v != null && v != "") {
                try {
                    var itemVal = eval("getValue" + "_" + v + "('')");
                    if (itemVal != null) {
                        paraJson[v] = encodeURI(itemVal);
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        })
    }
    $(pars2).each(function (i, v) {
        try {
            paraJson[v] = $.request.queryString()[v];
        } catch (e) {
            console.log(v + $layoutPageLanguage.ParamError);
        }
    });
    url = url + "?" + $.param(paraJson);
    if (m != null && m != "") {
        url += ("#" + m);
    }
    window.location.href = url;
}

function uiEngineSubmit(fromId, frmUrl, callBack) {
    $(fromId).jqxValidator('validate');
    var isSuccess = $(".jqx-validator-hint").size() == 0;
    if (isSuccess) {
        $("input.jqx-input-content").each(function () {
            var th = $(this);
            var thval = th.val();
            if (thval == "1900-01-01") {
                th.val("");
            }
            var name = th.attr("id");
            if (name != null) {
                th.attr("name", name.replace("input", ""));
            }
            console.log(th.val())
        })
        $pubLayout.loading();
        $(fromId).not(".jqx-file-upload-form").ajaxSubmit({
            url: frmUrl,
            type: "post",
            dataType:'json',
            success: function (msg) {
                if (callBack != null) {
                    callBack(msg);
                }
                $pubLayout.closeLoading();
            },
            error: jqxError
        });
    }
}

function uiEngineAlert(message, title, url) {
    if (title == null || title == "") {
        title = $layoutPageLanguage.AlertTitle;
    }
    jqxAlert(message, title, url);
}

function uiEngineWindow(id, width, type, title, okClick, validateFun) {

    if (validateFun != null && validateFun != "") {
        var isSuccess = validateFun();
        if (!isSuccess) {
            return;
        }
    }

    if (title == null || title == "") {
        title = $layoutPageLanguage.AlertTitle;
    }
    if (type == "close") {
        $(id).jqxWindow("close");
    } else {
        jqxWindowWithEvent(id, title, width, function () {
            if (okClick != null) {
                okClick();
            }
        });
    }
}

//递归去检查数据源
function uiEngineFillForm(id, time, callBack) {
    function setValue() {
        try {
            var val = $("#" + id).val();
            var json = $.parseJSON(val)[0];
            var array = $.action.jsonDictionary(json);
            $(array).each(function (i, v) {
                try {
                    if (v.value != null) {
                        var eleObj = $("#" + v.key);
                        var eleIsSelect = eleObj.is("select");
                        eval("setValue" + "_" + v.key + "('" + v.value + "')");

                        //特殊情况进行延迟处理
                        if (eleIsSelect) {
                            var isValid = (v.value != null && v.value != "");
                            if (isValid) {
                                var isLoading = eleObj.find("option[value='" + v.value + "']").size() == 0;
                                if (isLoading) {
                                    setTimeout(function () {
                                        eval("setValue" + "_" + v.key + "('" + v.value + "')");
                                    }, 1500);
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.log(v.key + "没有SET方法");
                }
            })
            if (callBack != null) {
                callBack(json);
            }
        } catch (e) {
            console.log(e);
        }
    }
    $.action.elementValueReady("#" + id, function () {
        $.action.elementNullComplate("[data-status='loading']", function () {
            setValue();
        }, 0)
    });
}

var _uiGridStatus = 0;
//grid删除
function uiEngineGridDelete(gridId, url, callBack) {
    _uiGridStatus = 1;
    uiEngineGridRequestApiByArray(gridId, url, callBack, $layoutPageLanguage.jqxDeleteComfirmMessage, null)
}
//grid更改状态
function uiEngineGridUpdateStauts(gridId, url, callBack, message, value) {
    _uiGridStatus = 2;
    uiEngineGridRequestApiByArray(gridId, url, callBack, message, value)
}

function uiEngineGridRequestApiByArray(gridId, url, callBack, message, value) {
    var array = $('#' + gridId).jqxGrid('getselectedrowindexes');
    var isTreeId = false;
    var pars = [];

    $(array).each(function (i, v) {
        try {
            var value = $('#' + gridId).jqxGrid('getcell', v, "VGUID")
            if (value == null) {
                value = $('#' + gridId).jqxGrid('getcell', v, "Id");
                if (value != null) {
                    if (!$.valiData.isNumber(value.value)) {
                        value = $('#' + gridId).jqxGrid('getcell', v, "TreeId");

                        isTreeId = true;
                    }
                }
            }

            pars.push(value.value);
        } catch (e) {
            //取值出错就清掉选中项
            $('#' + gridId).jqxGrid('unselectrow', v);
        }
        // 点击删除出现提示还未确认删除 选择项就被清除掉
        //finally {
        //    $('#' + gridId).jqxGrid('unselectrow', v);
        //}
    });

    if (pars == null || pars.length == 0) {
        jqxAlert($pageLanguage.NoSelectDataMessage); return;
    }

    jqxConfirm(function () {
        $.ajax({
            type: "post",
            url: url,
            data: {
                "id": pars, value: value, isTreeId: isTreeId
            },
            traditional: true,
            dataType: "json",
            success: function (msg) {
                if (_uiGridStatus == 2) {
                    $(window).resize();
                }
                $("#" + gridId).jqxGrid('updatebounddata', 'filter');
                //执行删除成功后清空gird的所有选中项
                $("#" + gridId).jqxGrid('clearselection');
                if (callBack != null) {
                    callBack(msg);
                }
            }, error: function (msg) {
                console.log(msg);
            }
        })
    }, message)

}
//页面加载事件
$(function () {
    setTimeout(function () {
        $("form:eq(0)").each(function () {
            var th = $(this);
            var data = th.data("validateKey");
            if (data != null) {
                th.jqxValidator({
                    rules: data
                })
            }
        });
    }, 1000)
})
var uiEngineHelper = {
    bindSelect: function (selector, json, key, value) {
        var selObj = $(selector);
        selObj.html("");//add by wing 绑定时需要清空之前的Select下拉数据（wing 2016-07-19）
        if (json != null && json != []) {
            $(json).each(function (i, v) {
                selObj.append("<option value='" + v[key] + "'>" + v[value] + "</option>");
            });
        }
    },
    bindSelectByUrl: function (url, data, selectId, valueField, textField) {
        $.ajax({
            url: url,
            data: data,
            dataType:'json',
            success: function (msg) {
                $("#" + selectId).html("");
                uiEngineHelper.bindSelect("#" + selectId, msg.responseInfo, valueField, textField);
            },
            error: jqxError
        })
    },
    UrlAction: function (actionName) {
        return $("#HidUrlAction").val() + actionName;
    }
};
