/// <reference path="../../tool/_reference.js" />

$(function () {
    window.$layout = function () {
        var deviationH = 0;
        if ($.broVali.isIE()) {
            deviationH = 50;
        }
        var selector = this.selector = {
            //下拉箭头
            $drop: function () { return $("#aTree,#aUser,#aMore,#aSearch,#tipBell") },
            //消息图标
            $icon_bell: function () { return $("#aBell") },
            $body: function () { return $("body") },
            $detailBox: function () { return $("header .detail-box") },
            $overicon2: function () { return $(".overicon2,.overicon3") },
            $menuClick: function () { return $(".menuClick") },
            $txtSearch: function () { return $("#txtSearch") },
            $bell: function () { return $("#tipBell") },
            $left: function () { return $("#divLeft") },
            $rightBox: function () { return $("#wrapper>.right>.box"); },
            $spLeft: function () { return $("#spLeft") }, //收缩左边部分图标,
            $right: function () { return $("article #wrapper .right") },//收缩左边
            $lefthide: function () { return $(".lefthide") },//收缩左边部分内容中需要隐藏的部分
            $jqxGlobalLoader: function () { return $("#jqxGlobalLoader"); },
            $layoutTree100: function () { return $(".jqxTree100"); },
            $layoutFilterBtn: function () { return $(".overicon"); },
            $layoutGrid100: function () { return $(".jqxGrid100") },
            $layoutFilterDiv: function () { return $("#divFilter"); },
            $layoutjqxgridButtons: function () { return $(".jqxgrid-buttons"); },
            //收藏
            $divFavorite: function () { return $("#divFavorite"); },
            $btnFavorite: function () { return $("#btnFavorite"); },
            $FavoriteFontColor: function () { return $("#FavoriteFontColor"); },
            $FavoriteBgColor: function () { return $("#FavoriteBgColor"); },
            $FavoriteIcon: function () { return $("#FavoriteIcon"); },
            $ImgFavoriteIcon: function () { return $("#ImgFavoriteIcon"); },
            $divFavoriteIcon: function () { return $("#divFavoriteIcon"); },
            $btnFavoriteSave: function () { return $("#btnFavoriteSave"); },
            $btnFavoriteBack: function () { return $("#btnFavoriteBack"); },
            $FavoriteName: function () { return $("#FavoriteName"); },
            $FavoriteUrl: function () { return $("#FavoriteUrl") },
            $FavoriteSize: function () { return $("#FavoriteSize"); },
            $FavoriteDescription: function () { return $("#FavoriteDescription") },
            $FavoriteId: function () { return $("#FavoriteId") },
            $FavoriteMore: function () { return $("#divFavorite  .icon a"); },

            $close: function () { return $(".best-widow-close .icon-remove") }

        };
        this.contentLayoutHeight = function () {
            return $(window).height() - 140;
        }
        this.setcookie = function (name, value) {

            //设置名称为name,值为value的Cookie
            var expdate = new Date();   //初始化时间
            expdate.setTime(expdate.getTime() + 30 * 60 * 1000);   //时间
            document.cookie = name + "=" + value + ";expires=" + expdate.toGMTString() + ";path=/";

            //即document.cookie= name+"="+value+";path=/";   时间可以不要，但路径(path)必须要填写，因为JS的默认路径是当前页，如果不填，此cookie只在当前页面生效！~
        }
        this.loading = function () {
            selector.$jqxGlobalLoader().jqxLoader("open")
        }
        this.closeLoading = function () {
            selector.$jqxGlobalLoader().jqxLoader("close")
        }
        this.favorite = {
            getColor: function () {
                var colour = [
                           "#2C3E50",
                           "#46a9d1",
                            "#ab99d1",
                              "#b5b5b5",
                                   "#a7cf48",
                                      "#f7cb5a",
                                          "#f5ad62",
                                          "#99CDD1",
                                          "#99D19B",
                                          "#D199BE"

                ];
                var reval = colour[$.random.getNum(colour.length - 1)];
                return reval;
            }
        };
        this.init = function () {
            var h = this.contentLayoutHeight();
            window.$pubLayout.setcookie("cookies.ContentLayoutHeight", h);

            addEvent();
            bellAnimate();
            selector.$jqxGlobalLoader().jqxLoader({ width: 100, height: 60, imagePosition: 'top', isModal: true })
            var windowWidth = $(window).width();
            if (windowWidth < 1200) {
                selector.$spLeft().click();
            }
            layout();


        }
        function layout() {

            if ($(".layout_area").size() > 0) {
                $(".box").css({ background: "#fafafa", height: "100%" })
            }

            var isOverHtmlWidth = $(document).width() > $("html").width();
            if (isOverHtmlWidth) {
                $("html").width($(window).width());
            }
            //设置左边的高度
            $(window).scroll(function () {
                selector.$left().css({ height: $(document).scrollTop() + $(window).height() - 50 });
            });
            //设置左边树高度
            var hasTree100 = (selector.$layoutTree100().size() > 0);
            if (hasTree100) {
                selector.$layoutTree100().each(function () {
                    var th = $(this);
                    th.on('initialized', function (event) {
                        th.jqxTree({ height: $(window).height() - 142 });
                    });

                })
            }

            var hasMenu = $(".list-table-1 .jqx-menu-control").size() > 0;//jqx-menu-control
            if (hasMenu) {
                setTimeout(function () {
                    $(".list-table-1 .jqx-menu-control").jqxMenu({ height: $(window).height() - 122 });
                }, 400)
                setTimeout(function () {
                    $(".list-table-1 .jqx-menu-control").jqxMenu({ height: $(window).height() - 122 });
                }, 600)

            }
            var hasGrid100 = (selector.$layoutGrid100().size() > 0);
            var bh = 0;
            if (selector.$layoutjqxgridButtons().size() > 0) {
                bh = selector.$layoutjqxgridButtons().height();
            }
            if (hasGrid100) {
                selector.$layoutGrid100().each(function () {
                    var th = $(this);
                    var hasFilter = selector.$layoutFilterDiv().size() > 0
                    var dh = $(document).height();
                    th.on("bindingcomplete", function (event) {
                        var fh = selector.$layoutFilterDiv().height();
                        var h = hasFilter ? (dh - fh - 150 - bh) : (dh - 128 - bh);
                        th.jqxGrid({ height: h });
                    });

                })
            }
        }

        function addEvent() {

            selector.$close().click(function () {
                if ($.broVali.isIE()) {
                    window.close();
                } else {
                    window.location.href = window.location.href; window.close();
                }
            });

            /***加入收藏***/
            selector.$FavoriteFontColor().jqxColorPicker({ height: 140, width: 270 });
            selector.$FavoriteFontColor().val("#fff")
            selector.$FavoriteBgColor().jqxColorPicker({ height: 140, width: 270 });
            selector.$FavoriteBgColor().val($pubLayout.favorite.getColor())
            var buttonText = { browseButton: $layoutPageLanguage.jsdotjsSetIcon, uploadButton: $layoutPageLanguage.jsdotjsSubmit, cancelButton: $layoutPageLanguage.jsdotjsClear, uploadFileTooltip: $layoutPageLanguage.jsdotjsUpload, cancelFileTooltip: $layoutPageLanguage.jsdotjsDelete };
            selector.$divFavoriteIcon().jqxFileUpload({
                width: '213',
                browseTemplate: 'success',
                uploadTemplate: 'primary',
                fileInputName: 'PhotoFile',
                cancelTemplate: 'danger',
                localization: buttonText,
                multipleFilesUpload: true,
                uploadUrl: '/File/UploadImage?allowSize=' + 1
            });
            selector.$divFavoriteIcon().on("uploadEnd", function (event) {
                var args = event.args;
                var msg = $.convert.strToJson($(args.response).html());
                selector.$FavoriteIcon().val(msg.WebPath);;
                selector.$ImgFavoriteIcon().attr("src", msg.WebPath);
                selector.$ImgFavoriteIcon().show();
            })
            selector.$btnFavorite().click(function () {
                resetFreeFavoriteForm();
                jqxWindow(selector.$divFavorite().selector, selector.$divFavorite().attr("title"), 400, 415, "icon-star");
            });
            selector.$btnFavoriteSave().click(function () {
                var url = selector.$FavoriteUrl().val();
                var name = selector.$FavoriteName().val();
                console.log(name)
                if (name == "") {
                    jqxAlert($layoutPageLanguage.jsdotjsTitileNoNull, null, null, "warning");
                } else if (url == "") {
                    jqxAlert($layoutPageLanguage.jsdotjsAddressNoNull, null, null, "warning");
                } else {
                    $pubLayout.loading();
                    var isEdit = selector.$FavoriteId().val() != "0";
                    $.ajax({
                        url: $.action.url("SubmitFavorite", null, "Home", "BestCommon"),
                        data: {
                            FavoriteName: selector.$FavoriteName().val(),
                            FavoriteUrl: selector.$FavoriteUrl().val(),
                            FavoriteDescription: selector.$FavoriteDescription().val(),
                            FavoriteSize: selector.$FavoriteSize().val(),
                            FavoriteIcon: selector.$FavoriteIcon().val(),
                            FavoriteId: selector.$FavoriteId().val(),
                            FavoriteFontColor: selector.$FavoriteFontColor().val(),
                            FavoriteBgColor: selector.$FavoriteBgColor().val()
                        },
                        type: "post",
                        success: function (msg) {
                            if (!isEdit && location.href.lastIndexOf("/BestCommon/Home/index") == -1) {
                                jqxAlert($layoutPageLanguage.jsdotjsBindToHome, $layoutPageLanguage.jsdotjsOperationSuccess, null, "success");
                                selector.$divFavorite().jqxWindow("close");
                                $pubLayout.closeLoading();
                            } else {
                                jqxAlert($layoutPageLanguage.jsdotjsBindToHome, $layoutPageLanguage.jsdotjsOperationSuccess, $.action.url("index"), "success");
                            }

                        },
                        error: jqxError
                    })
                }
            })
            selector.$btnFavoriteBack().click(function () {
                selector.$divFavorite().jqxWindow("close");
            })

            selector.$FavoriteMore().click(function () {
                var colorObj = selector.$divFavorite().find(".color");
                var isHide = colorObj.is(":hidden");
                if (isHide) {
                    colorObj.show();
                    $(this).find("span").css({ transform: "rotate(180deg)", display: "inline-block" });
                } else {
                    colorObj.hide();
                    $(this).find("span").removeAttr("style");
                }
            });

            $("form").on("click", "button", function (events) {
                event.preventDefault();  //阻止默认行为 ( 表单提交 )
            })

            //左边收缩
            selector.$spLeft().click(function () {
                selector.$spLeft().toggleClass("click");
                selector.$left().toggleClass("click");
                selector.$right().toggleClass("click");
                selector.$lefthide().toggleClass("hide");

                $(window).resize();

            })

            $(window).resize(function () {
                layout();
            });

            //下拉事件
            selector.$drop().click(function (event) {
                event.stopPropagation();
                var th = $(this);
                var isHide = th.find(".hide").size() > 0;
                selector.$detailBox().addClass("hide")
                selector.$menuClick().removeClass("menuClick");


                if (isHide) {
                    th.addClass("menuClick");
                    th.find(".hide").removeClass("hide");

                } else {
                    th.removeClass("menuClick");
                    th.find(".detail-box").addClass("hide");
                }

                //特殊处理
                var id = th.attr("id");
                var left = th.offset().left;
                if (id == "aSearch") {
                    th.find(".detail-box").css({ left: left });
                }
            })

            selector.$detailBox().click(function (event) {
                event.stopPropagation();
            })
            selector.$overicon2().click(function () {
                var th = $(this);
                var m = th.closest(".detail-menu  ");
                if (m.hasClass("over")) {
                    m.removeClass("over");
                } else {
                    m.addClass("over");
                }
            })


            //消息
            selector.$icon_bell().parent().mouseenter(function () {
                bellAnimate();
            })


            //页面点击
            selector.$body().click(function () {
                selector.$detailBox().addClass("hide")
                selector.$menuClick().removeClass("menuClick");
                selector.$txtSearch().val("");

            })

            //搜索单击事件
            selector.$txtSearch().click(function (event) {
                event.stopPropagation();
            });

        }

        function resetFreeFavoriteForm() {
            $pubLayout.selector.$FavoriteFontColor().val("#fff")
            $pubLayout.selector.$FavoriteBgColor().val($pubLayout.favorite.getColor());
            $pubLayout.selector.$FavoriteId().val("0");
            $pubLayout.selector.$FavoriteDescription().val("");
        }
        //提醒动画
        function bellAnimate() {
            selector.$icon_bell().addClass("animated swing");
            var interval = setInterval(function () {
                var isHasAnimated = selector.$icon_bell().hasClass("animated swing");
                if (isHasAnimated)
                    selector.$icon_bell().removeClass("animated swing");
                else
                    selector.$icon_bell().addClass("animated swing");

            }, 1000)

            setTimeout(function () {
                clearInterval(interval);
            }, 5000);
        }
    };

    //执行初努化
    var layout = window.$pubLayout = new $layout();
    layout.init();
})