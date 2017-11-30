function nextStep1() {
    var useraccount = $("#useraccount").val();
    if (!checkaccount()) {
        $("#useraccount").focus();
        return false;
    }

    //检测帐号在数据库中是否存在,存在找到对应的邮箱
    $.get("/RegularMembers/GetUserEmailByUserName", { userName: useraccount }, function (msg) {

        if (msg.Code == 0) {
            $("#useraccount_err").text("用户不存在").show();
            return false;
        }
        if (msg.Code == -1) {
            $("#useraccount_err").text("用户邮箱帐号为空").show();
            return false;
        }
        if (msg.Code == 1) {
            $("#step1").hide();
            //更改当前step
            $("ul.lr_step li:eq(1)").addClass("on").siblings().removeClass("on");
            $("#step2").show();
            $("#currEmail").text(msg.Info);
            return false;
        }
        if (msg.Code == 2) {
            $("#useraccount_err").text("网络错误,请重试").show();
            return false;
        }

    });


    return false;
}

function checkaccount() {
    var useraccount = $("#useraccount").val();
    if (useraccount == "") {
        $("#useraccount_err").text(lang['account_empty_err']).show();
        return false;
    }
    return true;
}

//第二步验证
function checkauth() {
    var type = $("#type").val();
    var bRet = flag = 0;
    if (type == 1) {   //手机找回密码
        var flag = 0;
        if (!checkname('1')) {
            $("#name").focus();
            bRet = 1;
            flag = 1;
        }
        if (!checkbirth()) {
            if (bRet == 0) {
                $("#birthday_input").parent().addClass('focusinput');
                bRet = 1;
            }
            flag = 1;
        }
        if ($.trim($("#messagecode").val()) == '') {
            $("#messagecode_err").html(lang['message_verifycode_empty_err']).show();
            if (bRet == 0) {
                $("#messagecode").focus();
                bRet = 1;
            }
            flag = 1;
        } else if (getlength($.trim($("#messagecode").val())) != 6) {
            $("#messagecode_err").html(lang['phonecode_format_err']).show();
            if (bRet == 0) {
                var str = $("#messagecode").val();
                $("#messagecode").val("").focus().val(str);
                bRet = 1;
            }
            flag = 1;
        }
        if (flag == 1) {
            return false;
        }
    } else if (type == 2) {  //邮箱找回密码
        var verifycode = $.trim($("#emailverifycode").val());
        if (verifycode == '') {
            $("#emailverifycode").focus();
            $("#emailverifycode_err").html(lang['email_verifycode_empty_err']).show();
            return false;
        }
        if (getlength(verifycode) != 6) {
            var str = $("#emailverifycode").val();
            $("#emailverifycode").val("").focus().val(str);
            $("#emailverifycode_err").html(lang['email_verifycode_format_err']).show();
            return false;
        }
    }
    $("#submitbtn")[0].disabled = true;
    //检测验证码
    $.get("/RegularMembers/CheckYzm", { code: $("#emailverifycode").val() }, function (msg) {
        //提示
        //验证码正确
        if (msg.Code == 1) {

            $("#step2").hide();
            $("#step3").show();
            //更改当前step
            $("ul.lr_step li:eq(2)").addClass("on").siblings().removeClass("on");
        }
        if (msg.Code == 0) {
            $("#emailverifycode_err").html(msg.Info).show();
            $("#submitbtn")[0].disabled = false;
        }
    });



    return false;
}



function checkemailverifycode() {
    if ($("#emailverifycode").val() == '') {
        $("#emailverifycode_err").html(lang['email_verifycode_empty_err']).show();
        return false;
    }
    if ($("#emailverifycode_err").attr("err_type") == 0) {
        $("#emailverifycode_err").hide();
    }
    return true;
}



function sendEmailCode() {
    if ($('#btn7').hasClass('unclick')) {
        return;
    }
    var wait = 60;
    var userName = $("#useraccount").val();
    var email = $("#currEmail").text();
    $.get("/RegularMembers/Mail", { email: email, userName: userName }, function (msg) {
        //提示
    });
    //倒计时
    timeoutButton(wait, 'btn7', 2);
}


function checkmodifypwd() {
    var newpwd = $("#newpwd").val();
    var newpwd_cfm = $("#newpwd_cfm").val();
    if (newpwd.trim() == "" || newpwd_cfm.trim() == "") {
        $("#newpwd_err").text("新密码或确认新密码不得为空").show();
        return false;
    }
    if (newpwd.trim() != newpwd_cfm.trim()) {
        $("#newpwd_err").text("再次输入密码不一致").show();
        return false;
    }
    $("#submitbtn")[0].disabled = true;
    var userName = $("#useraccount").val();
    $.get("/RegularMembers/UpdatePwdByUserName", { userName: userName, Pwd: newpwd }, function (msg) {
        //fail
        if (msg.Code == 0) {
            $("#newpwd_err").text("密码修改失败").show();
        }
        //success
        if (msg.Code == 1) {
            $("#step3").hide();
            $("#lastResult").show();
            $("#submitbtn")[0].disabled = false;
        }
        //后台Exeception
        if (msg.Code == 2) {
            $("#newpwd_err").text(msg.Info).show();
        }
    });
    return false;
}
