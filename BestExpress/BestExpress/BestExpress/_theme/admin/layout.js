window.gridHeight = ($(window).height() - 250);
$(function () {
    var more = $(".main-menu .more");
    var moreBox = $(".more-box");
    var body = $(".body");
    var html = $("html");
    var imgClose = $("#imgClose");
    var imgMore = $("#imgMore");
    var head = $(".head");
    var init = function () {
        var wh = $(document).height();
        $.response.setCookie("cookies.ContentLayoutHeight", ($(window).height() - 250) + "px", 666666);
        body.css({ height: wh - head.height() - 50 });
        html.removeClass("html");
        $("#jqxGlobalLoader").jqxLoader({ width: 100, height: 60, imagePosition: 'top', isModal: true })
        window.$pubLayout = {
            select: {
                $jqxGlobalLoader: function () { return $("#jqxGlobalLoader"); },
                $body: function () { return $("body"); }
            }
        };
    }
    init();
    more.click(function () {
        var isShow = imgClose.is(":hidden");
        if (isShow) {
            var mbh = moreBox.height();
            moreBox.show();
            moreBox.hide();
            moreBox.css({ width:200, top: more.offset().top,  height: 0,"padding-bottom":"10px",right:0 });
            moreBox.show();
            moreBox.animate({ height: mbh }, 200)
            imgClose.show();
            imgMore.hide();
        } else {
            var mbh = moreBox.height();
            imgClose.hide();
            imgMore.show();
            moreBox.animate({ height: 0 }, 200, function () {
                moreBox.hide()
                moreBox.css({ height: mbh })
            })

         ;
        }
    });
    $(window).resize(function () {
        moreBox.hide();
    })
})