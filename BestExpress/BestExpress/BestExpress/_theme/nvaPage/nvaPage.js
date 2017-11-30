
var $navPage = function () {

    //常用状态变量
    var state = "active";

    var eleAndTopDic = [];

    this.init = function () {
        addEvent();
        selector.$eles().each(function () {
            var th = $(this);
            var id = th.attr("nav-data-id");
            var top = $("#" + id).offset().top;
            eleAndTopDic.push({ id: id, top: top });
        });
    };

    var selector = {
        $mianPanel: function () { return $("html,body"); },
        $navPanel:function(){ return $(".navPanel"); },
        $oneNavItem_li: function () { return $(".oneNavItem>li"); },
        $twoNavItem_li: function () { return $(".twoNavItem>li"); },
        $wrap_button: function () { return $("#wrap_button"); },
        $btn_gotop: function () { return $("#btn_gotop"); },
        $eles: function () { return $("a[nav-data-id]"); }
    };

    function addEvent() {
        //设置默认参数
        intiMethod();
   
        //点击一级目录事件
        selector.$oneNavItem_li().on("click", function (event) {
            var th = $(this);
            $("li.active", th.parent()).removeClass(state);
            th.addClass(state);
            $("ul>li:first", this).addClass(state);
            var id = th.find("a").attr("nav-data-id");
            var top = $.linq.where(eleAndTopDic, function (item) { return item.id == id })[0].top;
            $(window).scrollTop(top);
        });

        //点击二级目录事件
        selector.$twoNavItem_li().on("click", function (event) {
            var th = $(this);
            th.parent().find(".active").removeClass(state);
            th.addClass(state);
            var id = th.find("a").attr("nav-data-id");
            var top = $.linq.where(eleAndTopDic, function (item) { return item.id == id })[0].top;
            $(window).scrollTop(top);
            return false;
        });

        //点击返回顶部事件
        selector.$btn_gotop().on("click", function (event) {
            selector.$mianPanel().animate({ scrollTop: 0 }, 600);
        });
    };

    //初始化默认参数
    function intiMethod() {
        //默认展开所有目录（含子目录）
        selector.$oneNavItem_li().each(function (i, item) {
            $(this).addClass(state);
        });

        var wh = $(window).height();
        selector.$wrap_button().css({ top: wh - 200 });
        $(window).scroll(function () {
            var sh = $(window).scrollTop();
            var obj = $.linq.where(eleAndTopDic, function (item) { return item.top>=(sh-50)&&item.top<=(sh+50) })[0];
            if ($(obj).size()>0) {
                var id = obj.id;
                selector.$eles().parent().removeClass(state);
                $("a[nav-data-id='" + id + "']").parent().addClass(state);
            }

            if (sh > wh) {
                selector.$wrap_button().show();
            } else {
                selector.$wrap_button().hide();
            }
        });

        var navPanelHeight = selector.$navPanel().height();
        selector.$navPanel().css({ top: wh - (navPanelHeight + 210) });
    };
}

 
    setTimeout(function () {
        new $navPage().init();
    }, 3000);
 