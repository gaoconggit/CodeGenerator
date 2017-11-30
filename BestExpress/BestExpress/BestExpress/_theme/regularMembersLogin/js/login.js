var $page = function () {

    this.init = function () {
        addEvent();
    }

    var selector = {
        $messageNotification: function () { return $("#jqxNotification") },//显示错误提示
        $userName: function () { return $("#UserName") },  //账号
        $password: function () { return $("#UserPwd") },//密码
        $btnSubmit: function () { return $("#submit") },  //登录按钮
        $firmForm: function () { return $("#firmForm") },//表单
        $frequency: function () { return $("#frequency") },//登录错误次数
        $jqxLoader: function () { return $("#jqxLoader") },//加载LOGO
        $jqxtable: function () { return $("#notificationDiv") },//浮动
        $loginBox: function () { return $(".loginBox") },//登录框
        $notificationContent: function () { return $("#notificationContent") },//浮动
        $language: function () { return $(".language .box"); },
        $languageBox: function () { return $("#divLanguage") },
        $languageBoxBtn: function () { return $("#divLanguage .btn") },
        $HidUrlAction: function () { return $("#HidUrlAction") }
    }

    function addEvent() {

        selector.$language().click(function () {
            jqxWindow(selector.$languageBox().selector, $pageLanguage.languageWindowTitle, 200, 415, "icon-cog");
        })
        selector.$languageBoxBtn().click(function () {
            var val = $(this).data("id");
            $.ajax({
                url: selector.$HidUrlAction().val() + "/SetLanguage",
                data: { lan: val },
                success: function (msg) {
                    window.location.reload();
                }, error: jqxError
            })
        })

        selector.$jqxtable().hide();
        selector.$jqxtable().css({ left: selector.$loginBox().offset().left, top: selector.$loginBox().offset().top + 15 });
        var count = 1;//累加失败次数

        selector.$messageNotification().jqxNotification({
            width: "300px", appendContainer: selector.$jqxtable(), opacity: 0.9, template: null, icon: { width: 25, height: 25, url: ("/_theme/jqwidgets-ver3.8.1/images/smiley.png"), padding: 5 }
        });

        selector.$jqxLoader().jqxLoader({ width: 100, height: 60, imagePosition: 'top' });

        //绑定点击事件
        selector.$btnSubmit().on('click', function () {
            Sumbit();
        });

        //绑定回车
        $(document).keydown(function (event) {
            if (event.keyCode == 13) {
                Sumbit();
            }
        });
    }

    var count = 1;

    //提交登录
    function Sumbit() {
        selector.$jqxtable().show();
        selector.$btnSubmit().attr('disabled', 'disabled');

        var uName = selector.$userName().val();
        var uPwd = selector.$password().val();
        var NotLoginCount = selector.$frequency().val();
        if (uName == "" || uPwd == "") {
            ErrorPrompt($pageLanguage.LoginRequiredMessage);
        }
        else {
            selector.$jqxLoader().jqxLoader('open');
            $.ajax({
                type: "POST",
                dataType:"json",
                url: "/RegularMembers/LoginSubmit",
                data: { name: uName, pwd: uPwd, NotLogin: NotLoginCount },
                success: function (data) {
                    var arr = data.responseInfo.split(',');
                    switch (arr[0]) {
                        case "1":
                            ErrorPrompt($pageLanguage.LoginDisableMessage);
                            break;
                        case "2":
                            $('#jqxLoader').jqxLoader('close');
                            location.href = "/BestCommon/Home/index";
                            break;
                        case "3":
                            count++;
                            selector.$frequency().val(count);
                            ErrorPrompt($pageLanguage.LoginErrorMessage);
                            break;
                        case "4":
                            ErrorPrompt($pageLanguage.LoginRequiredMessage);
                            break;
                        case "5":
                            count++;
                            selector.$frequency().val(count);
                            ErrorPrompt($pageLanguage.LoginStopTimeLessTime + " " + arr[1]);
                            //ErrorPrompt(arr[1]);
                            break;
                        case "6":
                            selector.$frequency().val(count);
                            ErrorPrompt($pageLanguage.LoginUserLock);
                            break;
                        case "7":
                            ErrorPrompt($pageLanguage.LoginNoUserName);
                            break;
                        default:
                            ErrorPrompt(arr[0]);
                            break;
                    }
                    selector.$jqxLoader().jqxLoader('close');
                },
                error: jqxError
            });
        }
    };

    function ErrorPrompt(Prompt) {
        selector.$notificationContent().html(Prompt);
        selector.$messageNotification().jqxNotification("open");
        selector.$btnSubmit().removeAttr('disabled');
        //提示消失后将浮动层隐藏掉
        selector.$messageNotification().on('close', function () {
            selector.$jqxtable().hide();
        });
    }
}
$(function () {
    var page = new $page();
    page.init();
});
