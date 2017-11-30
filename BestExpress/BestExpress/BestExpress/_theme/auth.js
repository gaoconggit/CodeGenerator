$(document).ready(function () {
    var err_arr = {
        'loginname': 'username_err',
        'password': 'pwd_err',
        'useremail': 'email_err',
        'userpwd': 'pwd_err',
        'cfmpwd': 'pwdcfm_err',
        'phone': 'phone_err',
        'phonecode': 'phonecode_err',
        'name': 'name_err',
        'newpwd': 'newpwd_err',
        'newpwd_cfm': 'newpwd_cfm_err',
        'oldpwd': 'oldpwd_err',
        'newpwdcfm': 'newpwd_cfm_err',
        'useraccount': 'useraccount_err',
        'emailverifycode': 'emailverifycode_err',
        'messagecode': 'messagecode_err'
    };
    $.each(err_arr, function (input_obj, err_obj) {
        $("#" + input_obj).keyup(function (event) {
            if (event.keyCode != 13) {
                if (input_obj == "loginname" || input_obj == "password") {
                    $("#account_err").parent().hide();
                }
                $("#" + err_obj).hide();
            }
        });
    });

    var input_arr = ['loginname', 'password', 'verifycode', 'useremail', 'userpwd', 'cfmpwd', 'phone', 'phonecode', 'name', 'newpwd', 'newpwd_cfm', 'oldpwd', 'newpwdcfm', 'useraccount', 'emailverifycode', 'messagecode'];
    $.each(input_arr, function (i, item) {
        $("#" + item).focus(function () {
            $("#" + item).parent().addClass("focusinput");
        });
    });


    var input_arr = ['password', 'verifycode', 'userpwd', 'cfmpwd', 'phone', 'phonecode', 'name', 'newpwd', 'newpwd_cfm', 'oldpwd', 'newpwdcfm', 'emailverifycode', 'messagecode'];
    $.each(input_arr, function (i, item) {
        $("#" + item).blur(function () {
            $("#" + item).parent().removeClass("focusinput");
        });
    });

    $("#useremail").blur(function () {
        setTimeout("checkUserEmail('useremail','email_err')", 300);
    });

    $("#useraccount").blur(function () {
        setTimeout("checkaccount()", 300);
    });

    $("input[type='password']").focus(function () {
        $('input').parent().removeClass("focusinput");
        $(this).parent().addClass("focusinput");
    });

});

function closeAllFloatDiv() {
    var p_oJqueryOn = arguments[0] ? arguments[0] : "";
    var p_oJqueryIndex = arguments[1] ? arguments[1] : "";
    var p_oJqueryAssoInput = arguments[2] ? arguments[2] : "";
    $("div[float-on='true']").not(p_oJqueryOn).each(function () {
        $(this).removeClass("on");
        $(this).attr("float-on", "false");
        $(this).removeClass("focusinput");
        var placeholderinput = $(this).children("input");
        if (placeholderinput.attr("input-type") == "selectionlist" && placeholderinput.attr("placeholder") != "" && placeholderinput.val() == "") {
            placeholderinput.val(placeholderinput.attr("placeholder")).addClass("placeholder");
        }
    });
    $("div[float-on='false']").not(p_oJqueryOn).each(function () {
        $(this).removeClass("focusinput");
    });

    $("div[float-index='true']").not(p_oJqueryIndex).each(function () {
        $(this).css("z-index", "0");
        $(this).attr("float-index", "false");
    });
    $("div[layer_float_on='true']").each(function () {
        $(this).css("display", "none");
        $(this).attr("layer_float_on", "false");
    });
    $("input[pre_value='']").not(p_oJqueryAssoInput).each(function () {
        if ($(this).hasClass("placeholder")) {
            return;
        }
        else {
            $(this).val("");
        }
    });
    $("input[pre_code='']").val("");

    $('.flboxwp,.ln,.c,.box').css("z-index", "");
    $('.hpBox').removeClass("on").parents('.c,.box,.top_wrap,.wrap,.cup').css("z-index", "");
}

$("html").click(function () {
    closeAllFloatDiv(null, null);
});


function changeVerifyCode() {
    var objDate = new Date();
    var strTime = objDate.getTime();
    url = $('#verifyPic_img').attr('src');
    var type = $('#verifyPic_img').attr('type');
    if (type == '' || type == undefined) {
        type = 3;
    }
    if (url.indexOf('?') > 0) {
        url = url.replace(/\?.*/g, '?');
    } else {
        url = url + '?';
    }
    url = url + 'type=' + type + '&from_domain=i&t=' + strTime;

    $('#verifyPic_img').attr('src', url);
    $("#verifycode").val("");
    if (!('placeholder' in document.createElement('input'))) {
        $("#verifycode").focus().blur();
    }
    $("#verifycode_ok").hide();
}


function checkIsRead() {
    if (!$("#isread").is(":checked")) {
        $("#read_err").text(lang['read_err']);
        $("#read_err").show();
        return false;
    }
    $("#read_err").hide();
    return true;
}

function chkverifycode() {
    var verifycode = $.trim($("#verifycode").val());
    if ($("#verifycode_err").is(":visible")) {
        $("#verifycode_err").hide();
    }
    if (getlength(verifycode) == 4) {
        var url = window.cfg.domain.login + '/ajax/checkcode.php?jsoncallback=?';
        var type = $("#verifyPic_img").attr("type");
        var flag = 0;
        $.ajaxSettings.async = false;
        $.getJSON(url, { verifycode: verifycode, type: type, from_domain: 'i' }, function (data) {
            if (data.result == '0') {
                flag = 1;
                $("#verifycode_err").text(lang['verifycode_input_err']);
                //$("#verifycode").val("");
                changeVerifyCode();
                $("#verifycode").focus();
                $("#verifycode_err").show();
                $("#verifycode_ok").hide();
                $("#verifycodechked").val("0");
                return false;
            } else {
                $("#verifycodechked").val("1");
                $("#verifycode_err").hide();
                $("#verifycode_ok").show();
                return true;
            }
        });
        $.ajaxSettings.async = true;
    } else {
        $("#verifycodechked").val("0");
        $("#verifycode_ok").hide();
    }
}

function checkVerifyCode() {
    var verifycode = $.trim($("#verifycode").val());
    if (verifycode == '') {
        $("#verifycode_err").text(lang['verifycode_empty_err']);
        $("#verifycode_err").show();
        return false;
    }
    var url = window.cfg.domain.login + '/ajax/checkcode.php?jsoncallback=?';
    var type = $("#verifyPic_img").attr("type");
    var flag = 0;
    $.ajaxSettings.async = false;
    $.getJSON(url, { verifycode: verifycode, type: type, from_domain: 'i' }, function (data) {
        if (data.result == '0') {
            flag = 1;
        }
    });
    $.ajaxSettings.async = true;
    if (flag == 1) {
        $("#verifycode_err").text(lang['verifycode_input_err']);
        $("#verifycode_err").show();
        return false;
    }
    $("#verifycode_err").hide();
    return true;
}

function checkUserEmail(strId) {
    var errId = arguments[1] || "";
    var isId = arguments[2] || "1";
    var checkUsed = arguments[3] || "1";
    var strEmail = isId == "1" ? $.trim($("#" + strId).val()) : strId;
    var errDiv = $("#" + errId).length > 0 ? $("#" + errId) : null;
    if (strEmail == '') {
        if (errDiv) {
            errDiv.text(lang['email_empty_err']).show();
        }
        return false;
    }
    if (getlength(strEmail) > 100) {
        if (errDiv) {
            errDiv.text(lang['email_format_err']).show();
        }
        return false;
    }
    if (!checkEmailFormat(strEmail)) {
        if (errDiv) {
            errDiv.text(lang['email_format_err']).show();
        }
        return false;
    }
    if (checkYahooEmail(strEmail)) {
        if (errDiv) {
            errDiv.text(lang['email_yahoo_err']).show();
        }
        return false;
    }
    if (checkUsed == "1") {
        var flag = 0;
        $.ajaxSettings.async = false;
        var url = window.cfg.domain.login + '/ajax/checkinfo.php?jsoncallback=?';
        $.getJSON(url, { value: strEmail, type: 'useremail' }, function (data) {
            if (data.result == '1') {
                flag = 1;
            }
        });
        $.ajaxSettings.async = true;
    }
    if (flag == 1) {
        if (errDiv) {
            if ($("#lang").val() == 'c') {
                var htm = '该邮箱已被使用，是否<a href="' + window.cfg.domain.login + '/login.php?val=' + strEmail + '">直接登录</a>'
            } else {
                var htm = 'This email has already been existed.<a href="' + window.cfg.domain.login + '/login.php?lang=e&val=' + strEmail + '">Sign In</a>';
            }
            errDiv.html(htm).show();
        }
        return false;
    }
    if (errDiv) {
        errDiv.hide();
    }
    $(".hint").hide();
    return true;
}



function checkEmailFormat(p_sStr) {
    p_sStr = p_sStr.toLocaleLowerCase();
    var sReg = /^(([0-9a-zA-Z]+)|([0-9a-zA-Z]+[_.0-9a-zA-Z-]*))@([a-zA-Z0-9-]+[.])+([a-zA-Z]{2}|net|com|gov|mil|org|edu|int|name|asia)$/;
    return p_sStr.match(sReg) ? true : false;
}


function checkYahooEmail(p_sStr) {
    p_sStr = p_sStr.toLocaleLowerCase();
    var sReg = /^(([0-9a-zA-Z]+)|([0-9a-zA-Z]+[_.0-9a-zA-Z-]*))@yahoo.(\S)+$/;
    return p_sStr.match(sReg) ? true : false;
}

function checkUserPwd(strId) {
    var errId = arguments[1] || "";
    var isId = arguments[2] || "1";
    var isoldcompare = arguments[3] || "0";
    var str = isId == "1" ? $("#" + strId).val() : strId;
    var errDiv = $("#" + errId).length > 0 ? $("#" + errId) : null;
    var newobj = $("#newset").val();

    $("#userpwd_strength").hide();

    if (str == '') {
        var err_tip = (newobj == 1) ? lang['newpwd_empty_err'] : lang['pwd_empty_err'];
        errDiv.text(err_tip).show();
        return false;
    }
    if (getlength(str) < 6 || getlength(str) > 16) {
        var err_tip = (newobj == 1) ? lang['newpwd_format_err'] : lang['pwd_format_err'];
        errDiv.text(err_tip).show();
        return false;
    }
    var i, as_code;
    for (i = 0; i < getlength(str) ; i++) {
        if (str.charCodeAt(i) < 33 || str.charCodeAt(i) > 126) {
            var err_tip = (newobj == 1) ? lang['newpwd_format_err'] : lang['pwd_format_err'];
            errDiv.text(err_tip).show();
            return false;
        }
    }

    if ($("#registertype").val() == 1) {
        var email = $.trim($("#useremail").val());
        if (str.toLowerCase() == email.toLowerCase()) {
            var err_tip = (newobj == 1) ? lang['newpwd_samewithemail_err'] : lang['pwd_samewithemail_err'];
            errDiv.text(err_tip).show();
            return false;
        }
    }

    var re_num = /^[0-9]+$/g;
    var re_char = /^[a-zA-Z]+$/gi;
    var re_spchar = /^[^0-9a-zA-Z]+$/gi;
    if (re_num.test(str) || re_char.test(str) || re_spchar.test(str)) {
        var err_tip = (newobj == 1) ? lang['newpwd_format_err'] : lang['pwd_format_err'];
        errDiv.text(err_tip).show();
        return false;
    }

    if (isoldcompare == '1') {
        var oldpwd = $('#oldpwd').val();
        if (oldpwd == str) {
            errDiv.html(lang['newpwd_samewith_oldpwd_err']).show();
            return false;
        }
    }
    if (errDiv.attr("err_type") == 0) {
        errDiv.hide();
    }
    return true;
}


function checkUserPwdCfm(strId, compareId) {
    var errId = arguments[2] || "";
    var isId = arguments[3] || "1";
    var userpwdcfm = isId == "1" ? $("#" + strId).val() : strId;
    var userpwd = isId == "1" ? $("#" + compareId).val() : compareId;
    var errDiv = $("#" + errId).length > 0 ? $("#" + errId) : null;
    if (userpwdcfm == '') {
        errDiv.text(lang['pwdcfm_empty_err']).show();
        return false;
    }
    if (userpwdcfm !== userpwd) {
        errDiv.text(lang['pwdcfm_notmatch_err']).show();
        return false;
    }
    if (errDiv.attr("err_type") == 0) {
        errDiv.hide();
    }
    return true;
}

function checkPhone(strPhone) {
    var errId = arguments[1] || ""
    var isId = arguments[2] || "1";
    var checkUsed = arguments[3] || "1";
    var sReg = /^(1[34578]{1,1}[0-9]{9,9})$/;
    var errDiv = $("#" + errId).length > 0 ? $("#" + errId) : null;
    var strPhone = isId == "1" ? $("#" + strPhone).val() : strPhone;
    if (strPhone == '') {
        if (errDiv) {
            errDiv.text(lang['phone_empty_err']).show();
        }
        return false;
    }
    if (getlength(strPhone) != 11 || !sReg.test(strPhone)) {
        if (errDiv) {
            errDiv.text(lang['phone_format_err']).show();
        }
        return false;
    }
    if (checkUsed == "1") {
        var flag = 0;
        $.ajaxSettings.async = false;
        var url = window.cfg.domain.login + '/ajax/checkinfo.php?jsoncallback=?';
        $.getJSON(url, { value: strPhone, type: 'mobile' }, function (data) {
            if (data.result == '1') {
                flag = 1;
            }
        });
        $.ajaxSettings.async = true;
    }
    if (flag == 1) {
        if (errDiv) {
            if ($("#lang").val() == 'c') {
                var htm = '该手机号码已被使用，是否<a href="' + window.cfg.domain.login + '/login.php?val=' + strPhone + '">直接登录</a>'
            } else {
                var htm = 'This phone number has already existed.<a href="' + window.cfg.domain.login + '/login.php?lang=e&val=' + strPhone + '">Sign In</a>';
            }
            errDiv.html(htm).show();
        }
        return false;
    }
    if (errDiv) {
        errDiv.hide();
    }
    return true;
}

function chkPhoneCode(strId) {
    var phonecode = $("#" + strId).val();
    var err_id = $("#" + strId).parent().siblings().children(".err").attr("id");
    if (phonecode == "") {
        $("#" + err_id).html(lang['message_verifycode_empty_err']).show();
        return false;
    }
    if (getlength(phonecode) != 6) {
        $("#" + err_id).html(lang['phonecode_format_err']).show();
        return false;
    }
    return true;
}

function clearpwdcfm(userpwd, cfmpwd) {
    if (getlength($('#' + cfmpwd).val()) != 0) {
        $('#' + cfmpwd).val('');
        $('#' + userpwd).val('');
    }
}

function checkname() {
    var name = $.trim($("#name").val());
    var arg = arguments[0] || '0';
    if (name == "") {
        $("#name_err").html(lang['name_empty_err']).show();
        return false;
    }
    if (arg == 1) {
        $("#name_err").hide();
    } else {
        if ($("#name_err").attr("err_type") == 0) {
            $("#name_err").hide();
        }
    }

    return true;
}

function checkbirth() {
    var birth = $.trim($("#birthday_input").val());
    if (birth == "") {
        $("#birth_err").html(lang['birth_empty_err']).show();
        return false;
    }
    var abirthval = birth.split("/");
    var mydate = new Date();
    var flag = 0;
    if (parseInt(abirthval[0]) < 1946 || parseInt(abirthval[0]) > mydate.getFullYear()) {
        flag = 1;
    } else if (parseInt(abirthval[0]) == mydate.getFullYear()) {
        if (parseInt(abirthval[1]) > mydate.getMonth() + 1) {
            flag = 1;
        }
    }
    if (flag == 1) {
        $("#birth_err").html(lang['birth_format_err']).show();
        return false;
    }
    $("#birth_err").hide();
    return true;
}


function getlength(str) {
    return str.replace(/[^\x00-\xff]/g, "**").length;
}


function timeoutButton(p_iExpireTime, p_sElementId, p_iType) {
    var oElement = $('#' + p_sElementId);

    if (!oElement.hasClass('unclick')) {
        oElement.toggleClass("unclick");
    }

    if (p_iExpireTime <= 1) {
        oElement.toggleClass("unclick");
        oElement.text(p_iType == 1 ? "重新获取短信" : "重新获取邮件");
        $("#not_received").show();
    }
    else {
        p_iExpireTime -= 1;
        oElement.text(p_iExpireTime + "秒后重发");
        setTimeout('timeoutButton(' + p_iExpireTime + ', "' + p_sElementId + '",' + p_iType + ')', "1000");
    }
}

function pwdstrength(value) {
    $("#userpwd_strength").show();
    var bright = 'height: 17px; line-height: 14px; color: rgb(255, 255, 255); background: rgb(235, 0, 39)';
    var gray = 'height: 17px; line-height: 14px; color: rgb(0, 0, 0); background: rgb(238, 238, 238)';

    S_level = checkStrong(value);

    switch (S_level) {
        case '0':
            $("#strength_L").attr('style', gray);
            $("#strength_M").attr('style', gray);
            $("#strength_H").attr('style', gray);
            break;
        case '1':
            $("#strength_L").attr('style', bright);
            $("#strength_M").attr('style', gray);
            $("#strength_H").attr('style', gray);
            break;
        case '2':
            $("#strength_L").attr('style', gray);
            $("#strength_M").attr('style', bright);
            $("#strength_H").attr('style', gray);
            break;
        case '3':
            $("#strength_L").attr('style', gray);
            $("#strength_M").attr('style', gray);
            $("#strength_H").attr('style', bright);
            break;
    }
}

function checkStrong(password) {
    var chkResult = chkUpwdIsCorrect(password);
    var pwdLevel = '0';
    if (chkResult == 0) {
        var re_num = /[0-9]+/g;
        var re_char = /[a-zA-Z]+/gi;
        var re_spchar = /[^0-9a-zA-Z]+/gi;
        if (password.length > 5 && password.length < 11) {
            if (re_num.test(password) && re_char.test(password) && re_spchar.test(password)) {
                pwdLevel = '2';
            } else {
                pwdLevel = '1';
            }
        } else if (password.length > 10 && password.length < 17) {
            if (re_num.test(password) && re_char.test(password) && re_spchar.test(password)) {
                pwdLevel = '3';
            } else {
                pwdLevel = '2';
            }
        }
    }
    return pwdLevel;
}

function chkUpwdIsCorrect(str) {
    var chkResult = 0;
    if (str.length == '') {
        chkResult = 1;

    } else if (str.length < 6 || str.length > 16) {
        chkResult = 2;
    } else {
        var i, as_code;
        for (i = 0; i < str.length; i++) {
            as_code = str.charCodeAt(i);
            if (as_code < 33 || as_code > 126) {
                chkResult = 3;
                return chkResult;
            }
        }
        var re_num = /^[0-9]+$/g;
        var re_char = /^[a-zA-Z]+$/gi;
        var re_spchar = /^[^0-9a-zA-Z]+$/gi;
        if (re_num.test(str) || re_char.test(str) || re_spchar.test(str)) {
            chkResult = 3;
        }
    }
    return chkResult;
}
function enterClickGetValue(event) {
    var key = event.keyCode;
    if (key == 13) {
        nextStep1();
    }
    return false;
}
function show_emaillist(obj, event) {
    stopBubble(event);
    var key = event.keyCode;
    var list = $("#email_list");
    if (list.children().length > 0) {
        var listArray = list.children();
        var count = listArray.length;
        var listHeight = list.height();
        var itemHeight = listArray.height();
        var selectedClass = "on";
        var selectedItem = list.children("." + selectedClass).length > 0 ? list.children("." + selectedClass) : null;
        var selectedIndex = selectedItem == null ? null : parseInt(selectedItem.attr("index"));
        if (selectedItem != null) {
            $(selectedItem).removeClass(selectedClass).children("span").attr("style", "color:orange");
        }

        switch (key) {
            case 40:
                if (selectedIndex == null || selectedIndex == (count - 1)) {
                    list.scrollTop(0);
                    $(listArray[0]).addClass(selectedClass).children("span").attr("style", "");
                }
                else {
                    if (selectedItem.position().top < 0 || selectedItem.position().top > listHeight) {
                        list.scrollTop($(listArray[selectedIndex + 1]).position().top);
                    }
                    if ($(listArray[selectedIndex + 1]).position().top > listHeight - itemHeight) {
                        list.scrollTop(list.scrollTop() + itemHeight);
                    }
                    $(listArray[selectedIndex + 1]).addClass(selectedClass).children("span").attr("style", "");
                }
                return;
                break;
            case 38:
                if (selectedIndex == null || selectedIndex == 0) {
                    list.scrollTop(count * itemHeight);
                    $(listArray[count - 1]).addClass(selectedClass).children("span").attr("style", "");
                }
                else {
                    if (selectedItem.position().top < 0 || selectedItem.position().top > listHeight) {
                        list.scrollTop($(listArray[selectedIndex - 1]).position().top);
                    }
                    if ($(listArray[selectedIndex - 1]).position().top < 0) {
                        list.scrollTop(list.scrollTop() - itemHeight);
                    }
                    $(listArray[selectedIndex - 1]).addClass(selectedClass).children("span").attr("style", "");
                }
                return;
                break;
            case 13:
                return false;
                break;
            default:
                break;
        }
    }
    var email_type = ['qq.com', '163.com', '126.com', 'sina.com', 'gmail.com', 'hotmail.com', '139.com', 'foxmail.com', 'yeah.net', 'sohu.com', 'outlook.com'];
    var obj_id = obj.id;
    var s = email = $.trim($("#" + obj_id).val());
    var html = '';
    var str = '';
    if (/@/.test(email)) {
        s = email.replace(/@.*/, "");
        $(".hint").hide();

    }
    else {
        $(".hint").show();
    }
    var newArr = new Array();
    if (/@/.test(email)) {
        var site = email.replace(/.*@/, "");
        newArr = $.map(email_type, function (n) {
            var reg = new RegExp('^' + site);
            if (reg.test(n)) {
                return n;
            }
        });
    } else if ($("#registertype").val() == 1) {
        newArr = email_type;
    }
    for (var i in newArr) {
        str = s + '@' + newArr[i];
        html += '<span class="li" onclick=\'setinputval("' + str + '","' + obj_id + '")\' index="' + i + '" mailstr="' + str + '">' + '<span style="color:orange;">' + s + '</span>' + '@' + newArr[i] + '</span>';
    }

    list.html(html).show();

    if (email == '' || str == '') {
        list.hide();
    }
}

function checkIsSubmit() {
    if ($("#email_list").length > 0 && !$("#email_list").is(":hidden")) {
        return false;
    }
    return true;
}

function submitByType(sType) {
    switch (sType) {
        case 'login':
            if (!checksave()) {
                return;
            }
            break;
        case 'register':
            if (!checkRegister()) {
                return;
            }
            break;
        default:
            break;
    }
    $("form").submit();
}

function setinputval(selected_email, id, event) {

    stopBubble(event);

    $("#" + id).val(selected_email);
    $("#email_list").hide();
    var err_id = $("#" + id).parent().siblings().children(".err").attr("id");
    if ($("#registertype").val() == 1) {
        checkUserEmail(id, err_id);
    } else {
        checkUserEmail(id, err_id, "1", "0");
    }
    if ($(".hint").is(":hidden")) {
        $(".hint").hide();
    }
}

function stopBubble(e) {
    if (e && e.preventDefault) {
        e.stopPropagation();
    }
    else if (window.event) {
        window.event.cancelBubble = true;
    }
}

$(document).click(function (e) {
    $("#email_list").hide();
    removeFocusClass();
    e = e || window.event;
    var dom = e.srcElement || e.target;
    $("#birthday_box").removeClass("on").attr("float-on", "false");
});

function removeFocusClass() {
    var input_arr = ['loginname', 'useremail', 'useraccount'];
    $.each(input_arr, function (i, item) {
        if ($("#" + item).length > 0 && !$("#" + item).is(":focus")) {
            $("#" + item).parent().removeClass("focusinput");
            $(".hint").hide();
        }
    });
}

function hide_errtip(errid) {
    $("#" + errid).hide();
    $("#account_err").hide();
    $("#seekpwd").hide();
}


function clear_err(id) {
    var err_id = $("#" + id).parent().siblings().children(".err").attr("id");
    $("#" + err_id).hide();
}