///<reference path="/_theme/tool/_reference.js" />
var $page = function () {

    this.init = function () {
        addEvent();
    };

    //所有元素选择器
    var selector = {
        //树形菜单容器
        $jqxWidget: function () { return $('#jqxWidget'); },

        //按钮组元素
        $add_btn: function () { return $('#add_btn'); },
        $edit_btn: function () { return $('#edit_btn'); },
        $del_btn: function () { return $('#del_btn'); },
        $move_btn: function () { return $('#move_btn'); },
        $build_languages_btn: function () { return $("#build_languages_btn"); },

        //移动表单
        $moveWindow: function () { return $('#moveWindow'); },
        $moveForm: function () { return $('#moveForm'); },
        $oldTreeId: function () { return $('#oldTreeId'); },
        $newId: function () { return $('#newId'); },
        $save_moveMenu: function () { return $('#save_moveMenu'); },

        //新增/编辑表单
        $form: function () { return $("#frmtable"); },
        $editButton: function () { return $("#editbox button"); },
        $editButtonCancel: function () { return $("#editbox #cancel"); },
        $editButtonSave: function () { return $("#editbox #save"); },
        $editbox: function () { return $("#editbox"); },
        $isAdd: function () { return $("#isAdd"); },
        $parentTreeId: function () { return $("#parentTreeId"); },
        $menuName: function () { return $("#menuName"); },
        $icon: function () { return $("#icon"); },
        $sort: function () { return $("#sort"); },
        $MenuUrl: function () { return $("#MenuUrl"); },
        $isInnerPage: function () { return $("#isInnerPage"); }
    };

    //所有事件
    function addEvent() {
        //设置主题
        $.jqx.theme = 'blue';

        //绑定菜单数据集
        loadTreeMenu();

        //绑定新增/编辑表单验证
        selector.$form().jqxValidator({
            rules: [
                  { input: selector.$menuName(), message: '必填!', action: 'keyup, blur', rule: 'required' },
                  { input: selector.$sort(), message: '必填!', action: 'keyup, blur', rule: 'required' },
                  { input: selector.$sort(), message: '必须为数字!', action: 'keyup, blur', rule: 'number' }
            ]
        });

        //绑定移动表单验证
        selector.$moveForm().jqxValidator({
            rules: [
                  { input: selector.$newId(), message: '必填!', action: 'keyup, blur', rule: 'required' },
                  {
                      input: selector.$newId(), message: '输入格式不正确!', action: 'keyup, blur', rule: function (input, commit) {
                          //校验移动位置输入的格式是否正确，正则:^((\/[1-9/]*\/)|[\/])$
                          reg = /^((\/[1-9/]*\/)|[\/])$/; return (!reg.test(input.val())) ? false : true;
                      }
                  }
            ]
        });

        //绑定新增菜单事件
        selector.$add_btn().on('click', function () {
            var item = selector.$jqxWidget().jqxTree('getSelectedItem');
            if (item == null) {
                jqxAlert('请选择需要操作的菜单项!'); return false;
            }

            //弹出框
            jqxWindow(selector.$editbox().selector, "新增菜单", 285, "auto");

            //美化 button
            selector.$editButton().jqxButton();

            //指定是否为新增
            selector.$isAdd().val("true");

            //赋值菜单编号
            selector.$parentTreeId().val(item.value);

            //清空表单
            selector.$menuName().val(null);
            selector.$sort().val(0);
            selector.$icon().val(null);
            selector.$MenuUrl().val(null);
        });

        //绑定编辑菜单事件
        selector.$edit_btn().on('click', function () {
            var item = selector.$jqxWidget().jqxTree('getSelectedItem');
            if (item == null) {
                jqxAlert('请选择需要操作的菜单项!'); return false;
            } else {
                //校验选择菜单项是否为跟菜单
                var labelStr = String(item.label);
                var treeId = labelStr.substring(0, labelStr.indexOf("\t"));
                if (treeId == "/") {
                    jqxAlert('当前选中菜单为不可编辑项!'); return;
                }

                //弹出框
                jqxWindow(selector.$editbox().selector, "编辑菜单", 285, "auto");

                //美化 button
                selector.$editButton().jqxButton();

                //指定是否为新增
                selector.$isAdd().val("false");

                //填充表单
                selector.$parentTreeId().val(item.value);
                var key = String(item.label).match("\/.+\/");

                $.ajax({
                    type: "post",
                    dataType: "json",
                    url: "/bestPalace/menu/loadMenuInfo",
                    data: { id: key },
                    success: function (data) {
                        if (data.MenuName != null && data.MenuName != "") {
                            selector.$menuName().val(data.MenuName);
                        }
                        if (data.Sort != null && data.Sort != 0) {
                            selector.$sort().val(data.Sort);
                        }
                        if (data.Icon != null && data.Icon != "") {
                            selector.$icon().val(data.Icon);
                        }
                        if (data.MenuUrl != null && data.MenuUrl != "") {
                            selector.$MenuUrl().val(data.MenuUrl);
                        }
                        if (data.IsInnerPage != null) {
                            if (data.IsInnerPage) {
                                selector.$isInnerPage().val("True")
                            } else {
                                selector.$isInnerPage().val("False")
                            }
                            //2016-7-28  by jailall.sun  bug
                        }
                    },
                    error: jqxError
                });
            }
        });

        //绑定删除菜单事件
        selector.$del_btn().on('click', function () {
            var item = selector.$jqxWidget().jqxTree('getSelectedItem');
            if (item == null) {
                jqxAlert('请选择需要操作的菜单项!'); return false;
            } else {
                jqxConfirm(function () {
                    $.ajax({
                        type: "post",
                        dataType: "json",
                        url: "/menu/deleteTreeMenu",
                        data: { parentTreeId: String(item.value) },
                        success: function (data) {
                            if (!data.isSuccess) {
                                jqxAlert(data.responseInfo);
                            }
                            var selectedItem = selector.$jqxWidget().jqxTree('selectedItem');
                            if (selectedItem != null) {
                                selector.$jqxWidget().jqxTree('removeItem', selectedItem.element, false);
                                selector.$jqxWidget().jqxTree('render');
                            }
                        },
                        error: jqxError
                    })
                }, "您确定要删除吗？");
            }
        });

        //绑定移动菜单事件
        selector.$move_btn().on('click', function () {
            var item = selector.$jqxWidget().jqxTree('getSelectedItem');
            if (item == null) {
                jqxAlert('请选择需要操作的菜单项!');
            } else {
                jqxWindow(selector.$moveWindow(), '移动菜单', 268, 105);
                selector.$oldTreeId().val(item.value);
            }
        });

        //绑定提交事件
        selector.$editButtonSave().on('click', function (e) {
            var isSuccess = selector.$form().jqxValidator('validate');
            if (isSuccess) {
                var isAdd = selector.$isAdd().val();
                var url = (isAdd == "true") ? "/menu/addTreeMenu" : "/bestPalace/menu/editTreeMenu";
                jqxSubmit({
                    url: url,
                    form: selector.$form(),
                    success: function (data) {
                        if (!data.isSuccess) {
                            jqxAlert(data.responseInfo);
                        } else {
                            selector.$editbox().jqxWindow("close");
                            var selectedItem = selector.$jqxWidget().jqxTree('selectedItem');
                            if (selectedItem != null) {
                                if (isAdd == "true") {
                                    selector.$jqxWidget().jqxTree('addTo', data.responseInfo, selectedItem.element, false);
                                    // update the tree.
                                    selector.$jqxWidget().jqxTree('render');
                                    jqxAlert("创建成功!", "创建成功!", null, "success");
                                } else {
                                    selector.$jqxWidget().jqxTree('updateItem', { label: data.responseInfo.label, value: data.responseInfo.value }, selectedItem.element);
                                    // update the tree.
                                    selector.$jqxWidget().jqxTree('render');
                                    jqxAlert("修改成功!", "修改成功!", null, "success");
                                }
                            }
                        }
                        selector.$isAdd().val(null);
                    },
                    error: jqxError
                })
            }
        });

        //绑定取消事件
        selector.$editButtonCancel().on('click', function (e) {
            selector.$editbox().jqxWindow("close");
        });

        //提交移动表单
        selector.$save_moveMenu().on('click', function () {
            var isSuccess = selector.$moveForm().jqxValidator('validate');
            if (isSuccess) {
                $.ajax({
                    type: 'post',
                    dataType: 'json',
                    url: '/bestPalace/menu/moveTreeMenu',
                    data: {
                        oldTreeId: selector.$oldTreeId().val(),
                        newId: selector.$newId().val()
                    },
                    success: function (data) {
                        if (data.isSuccess) {
                            selector.$moveWindow().jqxWindow('close');
                            location.reload();
                        } else {
                            jqxAlert(data.responseInfo);
                        }
                    },
                    error: jqxError
                });
            }
        });

        //绑定点击生成多语言按钮事件
        selector.$build_languages_btn().on('click', function (e) {
            maskInternationalizationPages();
        });
    };

    //加载树形菜单函数
    function loadTreeMenu() {
        $.getJSON('/menu/loadTreeMenu', function (data) {
            if (data != null) {
                var option = {
                    dataType: 'json',
                    datafields: [
                        { name: 'id' },
                        { name: 'parentid' },
                        { name: 'text' },
                        { name: 'value' }
                    ],
                    id: 'id',
                    localdata: data
                };

                //创建数据适配器
                var dataAdapter = new $.jqx.dataAdapter(option);

                //执行数据绑定
                dataAdapter.dataBind();

                //指定“文本”和“标签”字段之间的映射关系.
                var records = dataAdapter.getRecordsHierarchy('id', 'parentid', 'items', [{ name: 'text', map: 'label' }, { name: 'value', map: 'value' }]);

                //加载树形菜单
                selector.$jqxWidget().jqxTree({ source: records, width: '370px', height: window.gridHeight });

                //默认展开所有一级菜单
                selector.$jqxWidget().jqxTree('expandItem', $("#jqxWidget ul li")[0]);
            }
        });
    };

    //生成多语言
    function maskInternationalizationPages() {
        jqxConfirm(function () {
            $pubLayout.select.$jqxGlobalLoader().jqxLoader('open');
            $.ajax({
                url: "/bestPalace/menu/maskInternationalizationPages",
                type: "post",
                dataType: "json",
                success: function (msg) {
                    $pubLayout.select.$jqxGlobalLoader().jqxLoader('close');
                    jqxAlert(msg.responseInfo); return false;
                },
                error: jqxError
            });
        }, "确定生成多语言？");
    };
};

$(function () {
    var page = new $page();
    page.init();
});