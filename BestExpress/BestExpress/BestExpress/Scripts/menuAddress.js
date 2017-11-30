var $page = function () {

    this.init = function () {
        $("#ownerPanel").css({ height: window.gridHeight })
        addEvent();
    };

    //所有元素选择器
    var selector = {
        //容器标签
        $ownerPanel: function () { return $("#ownerPanel"); },
        $toggleResponsivePanel: function () { return $('#toggleResponsivePanel'); },

        //左边元素
        $jqxResponsivePanel: function () { return $('#jqxResponsivePanel'); },
        $jqxMenu: function () { return $('#jqxMenu'); },

        //右边元素
        $content: function () { return $('#content'); },

        //按钮组
        $add_btn: function () { return $("#add_btn"); },
        $edit_btn: function () { return $("#edit_btn"); },
        $del_btn: function () { return $("#del_btn"); },
        $managementElement_btn: function () { return $("#managementElement_btn"); },
        $managementBak_btn: function () { return $("#managementBak_btn"); },
        $build_btn: function () { return $("#build_btn"); },
        $build_languages_btn: function () { return $("#build_languages_btn"); },

        //数据表格Gird
        $jqxgrid: function () { return $("#jqxgrid"); },

        //新增/表单表单元素
        $editbox: function () { return $("#editbox"); },
        $form: function () { return $("#frmtable"); },
        $editButton: function () { return $("#editbox button"); },
        $editButtonCancel: function () { return $("#editbox #cancel"); },
        $editButtonSave: function () { return $("#editbox #save"); },
        $id: function () { return $("#id"); },
        $menuId: function () { return $("#menuId"); },
        $areaName: function () { return $("#areaName"); },
        $controllerName: function () { return $("#controllerName"); },
        $actionName: function () { return $("#actionName"); },
        $parameters: function () { return $("#parameters"); },
        $sort: function () { return $("#sort"); },

        //选择语言表单
        $selectbox: function () { return $("#selectbox"); },
        $selectboxByBuild: function () { return $("#selectboxByBuild"); },
        $selAreaName: function () { return $("#selAreaName"); },
        $languageform: function () { return $("#languagetable"); },
        $selectButton: function () { return $("#selectbox button,#selectboxByBuild button"); },
        $selectButtonCancel: function () { return $("#selectbox #cancelChoice"); },
        $selectButtonSave: function () { return $("#selectbox #saveChoice"); },
        $saveBuild: function () { return $("#saveBuild"); },
        $cancelBuild: function () { return $("#cancelBuild"); },
        $menuAddreessId: function () { return $("#menuAddreessId"); },
        $languageId: function () { return $("#selectbox #languageId"); },
        $selectType: function () { return $("#selectType"); },
        $languageDrop: function () { return $("[id=languageDrop]"); },
        $languageDrop2: function () { return $("[id=languageDrop2]"); }
    };

    //所有事件
    function addEvent() {
        //初始化
        setElements();

        //加载菜单数据集
        loadTreeMenu();

        //初始化加载菜单详情列表
        loadTreeMenuDetail(null);

        //绑定选中菜单加载详情列表事件
        selector.$jqxMenu().on('click', function () {
            var item = selector.$jqxMenu().jqxTree('getSelectedItem');

            //校验选择菜单项是否为跟菜单
            var labelStr = String(item.label);
            var treeId = labelStr.substring(0, labelStr.indexOf("\t"));
            if (treeId == "/") {
                jqxAlert('当前选中菜单为不可编辑项!'); return;
            } else {
                loadTreeMenuDetail(String(item.value));
            }
        });

        //绑定新增/编辑表单验证
        selector.$form().jqxValidator({
            rules: [
                  { input: selector.$areaName(), message: '必填!', action: 'keyup, blur', rule: 'required' },
                  { input: selector.$controllerName(), message: '必填!', action: 'keyup, blur', rule: 'required' },
                  { input: selector.$actionName(), message: '必填!', action: 'keyup, blur', rule: 'required' },
                  { input: selector.$sort(), message: '必填!', action: 'keyup, blur', rule: 'required' },
                  {
                      input: selector.$areaName(), message: '必须为字母、下划线格式!', action: 'keyup, blur', rule: function (input, commit) {
                          //校验区域名输入的格式是否正确，正则:^([A-Za-z]*)(_*)([A-Za-z]*)$
                          reg = /^([A-Za-z]*)(_*)([A-Za-z]*)$/; return (!reg.test(input.val())) ? false : true;
                      }
                  },
                  {
                      input: selector.$controllerName(), message: '必须为字母、下划线格式!', action: 'keyup, blur', rule: function (input, commit) {
                          //校验控制器名输入的格式是否正确，正则:^([A-Za-z]*)(_*)([A-Za-z]*)$
                          reg = /^([A-Za-z]*)(_*)([A-Za-z]*)$/; return (!reg.test(input.val())) ? false : true;
                      }
                  },
                  {
                      input: selector.$actionName(), message: '必须为字母、下划线格式!', action: 'keyup, blur', rule: function (input, commit) {
                          //校验方法输入的格式是否正确，正则:^([A-Za-z]*)(_*)([A-Za-z]*)$
                          reg = /^([A-Za-z]*)(_*)([A-Za-z]*)$/; return (!reg.test(input.val())) ? false : true;
                      }
                  },
                 { input: selector.$sort(), message: '必须为数字!', action: 'keyup, blur', rule: 'number' }
            ]
        });

        $.jqx.theme = 'blue'; //设置主题

        //绑定新增菜单详情事件
        selector.$add_btn().on('click', function () {
            var item = selector.$jqxMenu().jqxTree('getSelectedItem');
            if (item == null) {
                jqxAlert('请选择需要操作的菜单项!'); return false;
            }

            //校验选择菜单项是否为跟菜单
            var labelStr = String(item.label);
            var treeId = labelStr.substring(0, labelStr.indexOf("\t"));
            if (treeId == "/") {
                jqxAlert('当前选中菜单为不可编辑项!'); return;
            }

            //弹出框
            jqxWindow(selector.$editbox().selector, "添加", 330, "auto");

            //美化 button
            selector.$editButton().jqxButton();

            //赋值菜单编号
            selector.$menuId().val(item.value);

            //清空表单
            selector.$id().val(null);
            selector.$areaName().val(null);
            selector.$controllerName().val(null);
            selector.$actionName().val(null);
            selector.$parameters().val(null);
            selector.$sort().val(0);
        });

        //绑定编辑菜单详情事件
        selector.$edit_btn().on('click', function () {
            var row = selector.$jqxgrid().jqxGrid('getboundrows');
            var index = selector.$jqxgrid().jqxGrid('getselectedrowindex');

            if (row[index] == undefined || row[index] == null) {
                jqxAlert('请选择需要操作的行!'); return false;
            } else {
                //弹出框
                jqxWindow(selector.$editbox().selector, "编辑", 350, "auto");

                //美化 button
                selector.$editButton().jqxButton();

                //填充表单
                selector.$id().val(row[index].Id);
                selector.$menuId().val(row[index].MenuId);
                selector.$areaName().val(row[index].AreaName);
                selector.$controllerName().val(row[index].ControllerName);
                selector.$actionName().val(row[index].ActionName);
                if (row[index].Parameters != null && row[index].Parameters != "") {
                    selector.$parameters().val(String(row[index].Parameters).replace('?', '').trim());
                } else {
                    selector.$parameters().val(null);
                }
                selector.$sort().val(row[index].Sort);
            }
        });

        //绑定删除菜单详情事件
        selector.$del_btn().on('click', function () {
            var row = selector.$jqxgrid().jqxGrid('getboundrows');
            var index = selector.$jqxgrid().jqxGrid('getselectedrowindex');

            if (row[index] == undefined || row[index] == null) {
                jqxAlert('请选择需要操作的行!'); return false;
            } else {
                jqxConfirm(function () {
                    $.ajax({
                        type: "post",
                        dataType: "json",
                        url: "/menuAddress/deleteTreeMenuDetail",
                        data: { id: row[index].Id },
                        success: function (data) {
                            if (!data.isSuccess) {
                                jqxAlert(data.responseInfo);
                            } else {
                                loadTreeMenuDetail(String(row[index].MenuId));
                            }
                        },
                        error: jqxError
                    })
                }, "您确定要删除吗？");
            }
        });

        //绑定管理元素事件
        selector.$managementElement_btn().on('click', function () {
            var row = selector.$jqxgrid().jqxGrid('getboundrows');
            var index = selector.$jqxgrid().jqxGrid('getselectedrowindex');

            if (row[index] == undefined || row[index] == null) {
                jqxAlert('请选择需要操作的行!'); return false;
            } else {
                //弹出框
                jqxWindow(selector.$selectbox().selector, "选择语言", 270, 180);

                //美化 button
                selector.$selectButton().jqxButton();

                //赋值地址ID
                selector.$menuAddreessId().val(parseInt(row[index].Id));
                selector.$selectType().val(1);//表示管理元素

                loadLanguage();//绑定语言下拉框数据集
            }
        });

        //绑定点击生成按钮事件
        selector.$build_btn().on('click', function () {

            //弹出框
            jqxWindow(selector.$selectboxByBuild().selector, "选择语言", 270, 220);

            //美化 button
            selector.$selectButton().jqxButton();

            loadLanguage();//绑定语言下拉框数据集

        });

        //绑定点击生成多语言按钮事件
        selector.$build_languages_btn().on('click', function (e) {
            var row = selector.$jqxgrid().jqxGrid('getboundrows');
            var index = selector.$jqxgrid().jqxGrid('getselectedrowindex');

            if (row[index] == undefined || row[index] == null) {
                jqxAlert('请选择需要操作的行!'); return false;
            } else {
                maskInternationalizationPages(parseInt(row[index].Id));
            }
        });

        //绑定新增/编辑 提交事件
        selector.$editButtonSave().on('click', function (e) {
            var isSuccess = selector.$form().jqxValidator('validate');
            if (isSuccess) {
                var isAdd = (selector.$id().val() != null && selector.$id().val() != "") ? false : true;
                var url = isAdd ? "/menuAddress/addTreeMenuDetail" : "/menuAddress/editTreeMenuDetail";
                jqxSubmit({
                    url: url,
                    form: selector.$form(),
                    success: function (data) {
                        if (!data.isSuccess) {
                            jqxAlert(data.responseInfo);
                        } else {
                            selector.$editbox().jqxWindow("close");
                            loadTreeMenuDetail(selector.$menuId().val());
                        }
                    },
                    error: jqxError
                })
            }
        });

        //绑定新增/编辑 取消事件
        selector.$editButtonCancel().on('click', function (e) {
            selector.$editbox().jqxWindow("close");
        });

        //保存生成
        selector.$saveBuild().click(function () {
            var areaValue = selector.$selAreaName().val();
            if (areaValue == null || areaValue == "") {
                jqxAlert("请选择area!");
                return;
            } else {
                $pubLayout.select.$jqxGlobalLoader().jqxLoader('open');
                var language = selector.$languageDrop2().jqxDropDownList("val");
                $.ajax({
                    url: "/bestPalace/pageFactory/BuildByArea",
                    data: { languageId: language, areaName: areaValue },
                    dataType: 'json',
                    type: 'post',
                    success:function(msg) {
                        jqxAlert("生成成功！");
                        $pubLayout.select.$jqxGlobalLoader().jqxLoader('close');
                    },
                    error: jqxError
                });
            }
        });

        //取消生成
        selector.$cancelBuild().click(function () {
            selector.$selectboxByBuild().jqxWindow("close");
        });

        //绑定管理备份事件
        selector.$managementBak_btn().on('click', function (e) {
            var row = selector.$jqxgrid().jqxGrid('getboundrows');
            var index = selector.$jqxgrid().jqxGrid('getselectedrowindex');

            if (row[index] == undefined || row[index] == null) {
                jqxAlert('请选择需要操作的行!'); return false;
            } else {
                //弹出框
                jqxWindow(selector.$selectbox().selector, "选择语言", 270, 180);

                //美化 button
                selector.$selectButton().jqxButton();

                //赋值地址ID
                selector.$menuAddreessId().val(parseInt(row[index].Id));
                selector.$selectType().val(2);//表示管理备份

                loadLanguage();//绑定语言下拉框数据集
            }
        });

        //绑定选择语言 提交事件
        selector.$selectButtonSave().on('click', function (e) {
            var language = selector.$languageDrop().jqxDropDownList("val");
            if (language == null || language == "") {
                jqxAlert("请选择语言"); return false;
            } else {
                var typeVal = selector.$selectType().val();
                //typeVal等于1时，跳转到管理元素界面，反之(即typeValue等于2时)跳转到管理备份界面
                var url = (typeVal == 1) ? "/pageFactory/index" : "/bakFactory/index";
                //为跳转地址添加需要的参数
                url += "?menuAddressId=" + selector.$menuAddreessId().val() + "&languageId=" + language;
                window.open(url);
            }
        });

        //绑定选择语言 取消事件
        selector.$selectButtonCancel().on('click', function (e) {
            selector.$selectbox().jqxWindow("close");
        });
    };

    //默认设置元素
    function setElements() {
        selector.$jqxResponsivePanel().jqxResponsivePanel('refresh');
        selector.$content().jqxPanel();
        selector.$jqxResponsivePanel().jqxResponsivePanel({
            width: '11.7%',
            height: '100%',
            collapseBreakpoint: 700,
            toggleButton: selector.$toggleResponsivePanel(),
            animationType: 'none',
            autoClose: false
        });
        selector.$jqxResponsivePanel().on('open expand close collapse', function (event) {
            if (event.args.element)
                return;

            var collapsed = selector.$jqxResponsivePanel().jqxResponsivePanel('isCollapsed');
            var opened = selector.$jqxResponsivePanel().jqxResponsivePanel('isOpened');
            if (collapsed && !opened) {
                selector.$content().jqxPanel({ width: '100%' });
            }
            else if (collapsed && opened) {
                selector.$content().jqxPanel({ width: '80%' });
            }
            else if (!collapsed) {
                selector.$content().jqxPanel({ width: '80%' });
            }
        });
        selector.$content().jqxPanel({ width: '88%', height: '100%' });
    };

    //加载菜单列表
    function loadTreeMenu() {
        $.getJSON('/MenuAddress/loadTreeMenu', function (data) {
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
                selector.$jqxMenu().jqxTree({ source: records, width: '100%', height: '100%', theme: "" }).css('visibility', 'visible');

                //默认展开所有一级菜单
                selector.$jqxMenu().jqxTree('expandItem', $("#jqxMenu ul li")[0]);
            }
        });
    };

    //加载菜单详情列表
    function loadTreeMenuDetail(treeId) {
        if (treeId == null || treeId == "") {
            bindJqxGrid(null);
        } else {
            $.ajax({
                dataType: 'json',
                type: 'post',
                url: '/menuAddress/loadTreeMenuDetail',
                data: { menuId: treeId },
                success: function (data) {
                    if (data != null) {
                        bindJqxGrid(data);
                    }
                },
                error: jqxError
            });
        }
    };

    //加载语言列表
    function loadLanguage() {
        $.getJSON('loadLanguages', function (data) {
            if (data != null) {
                var option = {
                    dataType: 'json',
                    datafields: [
                        { name: 'Id', type: 'int' },
                        { name: 'LanguageName', type: 'string' }
                    ],
                    id: 'Id',
                    localdata: data
                };
                //创建数据适配器
                var dataAdapter = new $.jqx.dataAdapter(option);

                //执行数据绑定
                dataAdapter.dataBind();

                //创建语言下拉框
                selector.$languageDrop().jqxDropDownList({
                    selectedIndex: 0, source: dataAdapter, displayMember: "LanguageName", valueMember: "Id", width: 155, height: 21, theme: ""
                });
                //创建语言下拉框
                selector.$languageDrop2().jqxDropDownList({
                    selectedIndex: 0, source: dataAdapter, displayMember: "LanguageName", valueMember: "Id", width: 155, height: 21, theme: ""
                });
            }
        });
    };

    //绑定Grid表格函数
    function bindJqxGrid(dataSource) {
        var option = {
            dataType: 'json',
            datafields: [
                { name: 'Id' },
                { name: 'AreaName' },
                { name: 'ControllerName' },
                { name: 'ActionName' },
                { name: 'Parameters', type: 'string' },
                { name: 'CanGenerate', type: 'string' },
                { name: 'HasElement', type: 'string' },
                { name: 'Sort' },
                { name: 'Founder' },
                { name: 'CreateTime', type: 'date' },
                { name: 'ModifiedBy' },
                { name: 'ModifiedTime', type: 'date' },
                { name: 'MenuId' }
            ],
            id: 'Id',
            localdata: dataSource,
            pager: function (pagenum, pagesize, oldpagenum) {
                // callback called when a page or page size is changed.
            }
        };

        //创建数据适配器
        var dataAdapter = new $.jqx.dataAdapter(option);

        //执行数据绑定
        dataAdapter.dataBind();

        selector.$jqxgrid().jqxGrid({
            source: dataAdapter,
            selectionmode: 'multiplerowsextended',
            sortable: true,
            pageable: true,
            columnsresize: true,
            columns: [
                { text: '编号', datafield: 'Id', width: '60px' },
                { text: '区域名', datafield: 'AreaName', minwidth: '130px' },
                { text: '控制器名', datafield: 'ControllerName', minwidth: '130px' },
                { text: '方法名', datafield: 'ActionName', minwidth: '130px' },
                { text: '参数', datafield: 'Parameters', minwidth: '130px' },
                {
                    text: '是否产出', datafield: 'CanGenerate', width: '75px', columntypes: 'string', cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                        return showExtend(value ? '是' : '否');
                    }
                },
                {
                    text: '有无元素', datafield: 'HasElement', width: '75px', columntypes: 'string', cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                        return showExtend(value ? '是' : '否');
                    }
                },
                { text: '排序号', datafield: 'Sort', width: '65px' },
                { text: '创建人', datafield: 'Founder', minwidth: '60px' },
                { text: '创建时间', datafield: 'CreateTime', width: '100px', cellsformat: 'yyyy-MM-dd' },
                { text: '修改人', datafield: 'ModifiedBy', minwidth: '60px' },
                { text: '修改时间', datafield: 'ModifiedTime', width: '100px', cellsformat: 'yyyy-MM-dd' }
            ]
        });

        selector.$jqxgrid().jqxGrid({ width: "99.6%", height: '94.2%' });
    };

    //处理显示字段扩展函数
    function showExtend(obj) {
        return '<div style="overflow: hidden; text-overflow: ellipsis; padding-bottom: 2px; text-align: left; margin-right: 2px; margin-left: 4px; margin-top: 4px;">' + obj + '</div>';
    };

    //生成多语言
    function maskInternationalizationPages(obj) {
        jqxConfirm(function () {
            $pubLayout.select.$jqxGlobalLoader().jqxLoader('open');
            $.ajax({
                url: "/bestPalace/menuAddress/maskInternationalizationPages",
                type: "post",
                dataType: "json",
                data: { addressId: obj },
                success: function (msg) {
                    $pubLayout.select.$jqxGlobalLoader().jqxLoader('close');
                    if (msg.isSuccess) {
                        selector.$selectbox().jqxWindow("close");
                    }
                    jqxAlert(msg.responseInfo);
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