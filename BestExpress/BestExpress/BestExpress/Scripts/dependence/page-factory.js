/// <reference path="/_theme/tool/_reference.js" />

var $page = function () {

    this.init = function () {

        addEvent();
        editorMethod.createEditor();
    };

    var selector = this.selector = {

        /***左边控件列表***/
        $liControl: function () { return $(".liControl"); },//控件图标

        /***操作按钮***/
        $btnRC: function () { return $("#btnRC"); },
        $btnBuild: function () { return $("#btnBuild"); },
        $btnSave: function () { return $("#btnSave") },


        /***ueditor***/
        $editor: function () {
            return UE.getEditor('editor');
        },

        $selLayout: function () { return $("#selLayout"); },

        $selEvent: function () { return $(".selEvent"); },
        $tbEventParBox: function () { return $(".tbEventParBox"); },


        $body: function () { return $("body"); },

        $hidAddressId: function () { return $("#hidAddressId"); },
        $hidLanguageId: function () { return $("#hidLanguageId"); },


        $divEventBox: function () { return $("#divEventBox"); },
        $btnSearchEvent: function () { return $(".btnSearchEvent") },

        //快速输入
        $divDataApiBox: function () { return $("#divDataApiBox"); },
        $selApiData: function () { return $("#selApiData"); },
        $selApiDataType: function () { return $("#selApiDataType"); },
        $btnSaveDataApi: function () { return $("#btnSaveDataApi"); },

        $divJsonBox: function () { return $("#divJsonBox") },
        $divGetValueBox: function () { return $("#divGetValueBox") }

    };

    //外部公用函数
    this.pubMehtod = {
        //编辑并保存元素属性
        editControlAttr: function (obj) {
            $pubLayout.select.$jqxGlobalLoader().jqxLoader('open');
            var th = $(obj);
            var key = th.data("key");
            var id = th.data("id");
            var hasSource = th.data("hassource") == "true" || th.data("hassource") == true || th.data("hassource") == "True";
            var isEdit = false;
            var elementData = new Object();
            $.ajax({
                url: "/pageFactory/GetElementByHtmlId",
                data: { id: id },
                dataType: "json",
                type: "post",
                success: function (msg) {
                    isEdit = msg.isSuccess;
                    if (isEdit)
                        elementData = msg.responseInfo;
                    editControlAttrInnerMethod(th, key, id, hasSource, isEdit, elementData);
                },
                error: jqxError
            });

            function editControlAttrInnerMethod(th, key, id, hasSource, isEdit, elementData) {
                //创建弹出层
                var category = th.data("categorykey");
                var hasEvent = key != "grid" && category != "layout" && key != "tree" && category != "show";
                var isLayout = category == "layout";
                var div = $("<div/>", {
                    id: id,
                    html: "<div/>",
                    "class": "hide winbox"
                });
                var formId = "frm" + $.random.getNum(100000000000);
                div.append("<form id='" + formId + "'></form>");
                $("body").data("boxId", id);
                //获取属性部分
                var attrHtml = priMehtod.getAttrHtml(key, category, elementData.Id);

                //获取事件部分
                var eventHtml = priMehtod.getEventHtml(elementData.Id);

                //添加标题
                var idObj = ("#" + id);
                $("[id='{0}']".ejq_format(id)).remove();//删除原有属性
                var innerDiv = div.find("form");
                innerDiv.css({ "padding": "10px" });
                innerDiv.append("<div class='eleName' >元素名:<input id='eleName' name='eleName'  type='text' /></div>");
                //有数据源属性
                if (hasSource) {
                    innerDiv.append("<div class='eleName' >接口名:<input readonly='readonly' id='ApiText' name='ApiText'  type='text' /><input readonly='readonly' id='ApiId' name='ApiId'  type='hidden' /><span  class='icon-search' onclick=\"$quickFactory(\'data-api\',this,'ApiText','ApiId')\" ></span></div>");
                }
                innerDiv.append("<div class='eleName' >说明:<input id='Description' type='text' name='Description'  type='text' /></div>");
                innerDiv.append("<div><input type='hidden' value='" + category + "' name='category' /></div>");
                innerDiv.append("<div><input type='hidden' value='" + selector.$hidAddressId().val() + "' name='addressId' /></div>");
                innerDiv.append("<div><input type='hidden' value='" + selector.$hidLanguageId().val() + "' name='languageId' /></div>");
                innerDiv.append("<div><input type='hidden' value='" + id + "' name='htmlId' /></div>");
                if (hasEvent) {
                    innerDiv.append("<h3>属性</h3>");
                }
                innerDiv.append(attrHtml);
                if (hasEvent) {
                    innerDiv.append("<h3>事件</h3>");
                    innerDiv.append(eventHtml);
                }
                selector.$body().append(div);
                innerDiv.append("<div class='buttonBox'><input id='btnSave' type='button' class='jqx-rc-all jqx-button jqx-widget jqx-fill-state-normal' value='保存' /> &nbsp;<input id='btnCancel' type='button' class='jqx-rc-all jqx-button jqx-widget jqx-fill-state-normal' value='取消' /></div>");


                //注册事件
                innerDiv.find("#btnSave").click(function () {
                    var form = $(this).closest("form");
                    var isSuccess = form.jqxValidator('validate');
                    if (isSuccess) {

                        //将事件参数绑定到hidden

                        form.find("[name='event.Value']").each(function () {
                            var pars = [];
                            var th = $(this);
                            var hasVal = th.val() !== "";
                            if (hasVal) {
                                var box = th.next();
                                box.find("#div" + th.val()).find("[name='para.value']:enabled").each(function () {
                                    var pareInput = $(this);
                                    var par = { key: pareInput.next().next().val(), value: pareInput.val() };
                                    pars.push(par);
                                });
                            }
                            var parsString = $.convert.jsonToStr(pars);
                            if (parsString != null)
                                parsString = parsString.replace(/[,]/g, "$^douhao^$");
                            th.prevAll("[name='event.Pars']").val(encodeURI(parsString));
                        });

                        //执行保存
                        form.ajaxSubmit({
                            url: "/PageFactory/SaveAttrsAndEvents",
                            dataType: "json",
                            type: "post",
                            success: function (msg) {
                                if (isLayout) {
                                    selector.$btnSave().click();
                                    setTimeout(function () {
                                        RestoreLayoutElement();
                                    }, 1000);
                                } else {
                                    jqxAlert("保存成功");
                                    $("#" + id).remove();
                                }

                            }, error: jqxError

                        });
                        //将ueditor里面的布局控件还原成html
                        function RestoreLayoutElement() {
                            $.ajax({
                                url: "/PageFactory/RestoreLayoutElement",
                                dataType: "json",
                                type: "post",
                                data: {
                                    htmlId: id,
                                    key: key,
                                    addressId: selector.$hidAddressId().val(),
                                    languageId: selector.$hidLanguageId().val()
                                },
                                success: function (msg) {
                                    window.location.reload();
                                }, error: jqxError

                            })

                        }
                        $(idObj).jqxWindow("close");
                    }
                });
                innerDiv.find("#btnCancel").click(function () {
                    $(idObj).jqxWindow("close");
                    $("#" + id).remove();
                });

                //close loading
                parent.$pubLayout.select.$jqxGlobalLoader().jqxLoader('close');

                var title = isEdit ? ("<span class='icon-edit'>编辑</span>" + elementData.EleName) : ("<span class='icon-plus'>添加</span>" + key);
                //弹出层
                jqxWindow("#" + id, title, "600", "auto");

                if (isEdit) {
                    $("#" + id).find("#eleName").val(elementData.EleName);
                    $("#" + id).find("#ApiId").val(elementData.ApiId);
                    $("#" + id).find("#ApiText").val(elementData.ApiName);
                    $("#" + id).find("#Description").val(elementData.Description);
                }


                //添加验证
                var rules = priMehtod.addValidate(id);


                //将验证添加到form表单
                $(idObj).find("form").jqxValidator({
                    rules: rules
                });
            }
        }
    };
    //私有方法
    priMehtod = {
        getAttrHtml: function (key, category, elementId) {
            var reval = "";
            $.ajax({
                url: "/PageFactory/GetControlAttribute",
                data: {
                    categoryKey: category, key: key, elementId: elementId
                },
                dataType: "html",
                type: "post",
                async: false,
                cache: false,
                success: function (msg) {
                    reval = (msg);
                }, jqxError
                })
                   return reval;
                }
        , getEventHtml: function (elementId, isSingle) {
            var reval = "";
            $.ajax({
                    url: "/PageFactory/GetControlEvent",
                    dataType: "html",
                type: "post",
                data: { elementId: elementId, isSingle: isSingle },
                async: false,
                cache: false,
                success: function (msg) {
                    reval = (msg);
                }, jqxError
                })
                return reval;
                }
        , addValidate: function (frmId) {
            var reval =[{ input: "#" +frmId + ' #eleName', message: '元素名必填!', action: 'keyup, blur', rule: 'required' }, {
                    input: "#" +frmId + ' #eleName', message: '不符合变量命名规范!', action: 'keyup, blur', rule: function (input) {
                        var val = input.val();
                        var reg = /[_,a-z,A-Z]\w+/;
                        return reg.test(val);
                    }
            }];
            //遍历模版控件添加正则
            $("[reg]").each(function () {
                var id = "input" + $.random.getNum(1000000000000000);
                var rule = {
                    input: '', message: '', action: 'keyup, blur', rule: ''
                };
                var th = $(this);
                th.attr("id", id);
                var reg = th.attr("reg");
                var isRequired = th.attr("required") == "required";
                rule.input = "#" + id
                rule.message = th.attr("tip");
                rule.rule = function (input, commit) {
                    reg = new RegExp(reg);
                    return (!reg.test(input.val())) ? false : true;
                }
                reval.push(rule);
            });
            return reval;

        }
    }



    var editorMethod = {
        //插入光标处
        insertHtml: function insertHtml(value) {
            selector.$editor().execCommand('insertHtml', value)
        },
        createEditor: function () {
            selector.$editor();
        },
        getContent: function () {
            var reval = selector.$editor().getContent();
            return reval;
        }
    }




    function addEvent() {

        selector.$body().on("change", selector.$selEvent().selector, function () {
            var th = $(this);
            var boxAll = th.next(".boxAll");
            boxAll.find(">div").addClass("hide");
            var thVal = th.val();
            boxAll.find("input,textarea").attr("disabled", "disabled");
            if (thVal != "==选择事件类型==") {
                boxAll.find("#div" + thVal).removeClass("hide");
                boxAll.find("#div" + thVal).find("input,textarea").removeAttr("disabled");
            }
        })




        selector.$btnRC().click(function () {
            var address = selector.$hidAddressId().val();
            var language = selector.$hidLanguageId().val();
            $.ajax({
                url: "/PageFactory/IsSave",
                dataType: 'json',
                type: 'post',
                data: { menuAddressId: address, languageId: language },
                success: function (msg) {
                    if (msg.isSuccess) {
                        window.open("/PageFactory/Preview?" + $.param({ menuAddressId: address, languageId: language }))
                    } else {
                        jqxAlert("页面还未保存，请选保存页面。");
                    }
                },
                error: jqxError
            })
        })
        selector.$btnBuild().click(function () {
            $pubLayout.select.$jqxGlobalLoader().jqxLoader('open');
            var address = selector.$hidAddressId().val();
            var language = selector.$hidLanguageId().val();
            $.ajax({
                url: "/PageFactory/Build",
                dataType: 'json',
                type: 'post',
                data: { menuAddressId: address, languageId: language },
                success: function (msg) {
                    if (msg.isSuccess) {
                        jqxAlert("生成成功。");
                    } else {
                        jqxAlert("页面还未保存，请选保存页面。");
                    }
                    $pubLayout.select.$jqxGlobalLoader().jqxLoader('close');
                },
                error: jqxError
            })
        })
        selector.$btnSave().click(function () {
            $pubLayout.select.$jqxGlobalLoader().jqxLoader('open');
            $.ajax({
                dataType: "json",
                url: "/PageFactory/SavePageContent",
                type: "post",
                data: {
                    Html: editorMethod.getContent(),
                    layout: selector.$selLayout().val(),
                    AddressId: selector.$hidAddressId().val(),
                    LanguageId: selector.$hidLanguageId().val()
                },
                success: function (msg) {
                    jqxAlert("保存成功！");
                    $pubLayout.select.$jqxGlobalLoader().jqxLoader('close');
                },
                error: jqxError
            })

        })
        //左边菜单插入
        selector.$liControl().click(function () {
            var th = $(this);
            var key = th.data("key");
            var category = th.data("categorykey");
            var hasSource = th.data("hassource");
            $pubLayout.select.$jqxGlobalLoader().jqxLoader('open');
            $.ajax({
                url: "/PageFactory/GetEditor",
                data: {
                    categoryKey: category, key: key, hasSource: hasSource
                },
                dataType: "html",
                type: "post",
                success: function (msg) {
                    editorMethod.insertHtml(msg);
                    $pubLayout.select.$jqxGlobalLoader().jqxLoader('close');
                }, error: jqxError
            })
        })

    }


}

$(function () {
    var page = window.$pubPage = new $page();
    page.init();
});