'use strict';
// 下拉列表函数
$.fn.dropdownList = function(option) {
    var option = $.extend({ifScroll:false,'multiple':false},option);
    var $btn = $(this).children(".arrow-down");
    var $ipt = $(this).children(".form-control");
    if(option.multiple){
        $btn.on("click",function(){
            var values = [];
            var $ul = $btn.next(".select-content"),
                $body = $btn.prev(".select-body"),
                st = $ul.data("status");
            $ul.on("click","li",function(){
                $(this).toggleClass("stay")
            });
            if(!st){
                $ul.css("display", "block").data("status", "visible");
                $btn.removeClass("arrow-down").addClass("arrow-up");
                if(option.changeBorder){
                    $ipt.removeClass("withoutBorder")
                }
            }
            else{
                if(option.changeBorder){
                    $ipt.addClass("withoutBorder")
                };
                $ul.children("li").each(function(){
                    if($(this).hasClass("stay")) {
                        values.push($(this).text());
                        $(this).removeClass("stay")
                    }
                }).end().css("display", "none").data("status", false);
                $btn.removeClass("arrow-up").addClass("arrow-down");
                $body.val(values);
            };
            option.ifScroll && $that.parents(".nano").first().nanoScroller();
        })
    }else{
        $btn.on("click",function(){
            var $ul = $btn.next(".select-content"),
                $body = $btn.prev(".select-body"),
                st = $ul.data("status");
            $(".select-content").css("display", "none");
            if (!st) {
                $ul.css("display", "block").data("status", "visible");
                $btn.removeClass("arrow-down").addClass("arrow-up");
                if(option.changeBorder){
                    $ipt.removeClass("withoutBorder")
                }
            }
            else {
                if(option.changeBorder){
                    $ipt.addClass("withoutBorder")
                };
                $ul.css("display", "none").data("status", false);
                $btn.removeClass("arrow-up").addClass("arrow-down");
            };
            option.ifScroll && $btn.parents(".nano").first().nanoScroller();
            var $root = $(window);
            setTimeout(function () {
                $root.one("click", function (event) {
                    var $target = $(event.target);
                    var $options = $ul.find("li");
                    if ($target.is($options)) {
                        $target.siblings().removeClass("selected").end().addClass("selected");
                        $body.val($target.text());
                    } else if ($target.is($btn)) return;
                    $ul.css("display", "none").data("status", false);
                    $btn.removeClass("arrow-up").addClass("arrow-down");
                    if(option.changeBorder){
                        $ipt.addClass("withoutBorder")
                    };
                    option.ifScroll && $btn.parents(".nano").nanoScroller();
                })
            }, 0)
        })
    }
};

/*输入为空验证(这种写法不适用多次调用)*/
$.fn.addVerify = function() {
    this.constructor.prototype.judgeOthers = function(){
        var res = true;
        $(this).find(".form-control").each(function(){
            if($(this).data("necessary")&&isNull($(this).val())) {
                var txt = $(this).attr("reservation");
                $(this).addClass("content-null").siblings(".errorBar").empty().append("&times; "+txt+"不能为空");
                $(this).focus();
                res = false;
                return false
            }
        });
        return res
    };
    this.constructor.prototype.clean = function(){
        $(this).find(".form-control").val("").filter(function(i){
            return $(this).hasClass("content-null")
        }).removeClass("content-null").siblings(".errorBar").html("")
    };
    // 文本输入类
    this.find(".form-control").on("input",function(){
        var txt = $(this).attr("reservation"),
            value = $(this).val(),
            si = $(this).data("necessary");
        if(si){
            if(isNull(value)) {
                $(this).addClass("content-null").siblings(".errorBar").empty().append("&times; "+txt+"不能为空");
                $(this).siblings(".btn-gray-delete").addClass("hide")
            }else {
                $(this).removeClass("content-null").siblings(".errorBar").empty();
                $(this).siblings(".btn-gray-delete").removeClass("hide")
            }
        }
    });
    //for ie
    if(document.all){
        $(this).find('.form-control').each(function() {
            var that = this;
            if(this.attachEvent) {
                this.attachEvent('onpropertychange',function(e) {
                    if(e.propertyName!='value') return;
                    $(that).trigger('input');
                })
            }
        })
    };
    // 下拉输入类
    this.find("select.form-control,.form-control[role='dropdown']").on("change",function(){
        if($(this).data("necessary")&&isNull($(this).val())){
            var txt = $(this).attr("reservation");
            $(this).addClass("content-null").siblings(".errorBar").empty().append("&times; "+txt+"不能为空")
        }else{
            $(this).removeClass("content-null").siblings(".errorBar").empty();
        }
    })
};


function grabIllegal(text){
	if(isNull(text)) {
		window.warning("不能为空字符！");
		return false
	}else if(text.match(/\s+/)){
		window.warning("不允许的字符：空格");
		return false
	};
	return true
}

function isNull(str){
    if(str=="") return true
    else return /^\s*$/g.test(str)
}

function delayRun(fn,delay){
    var delay = delay?delay:0;
    var t = setTimeout(function(){
        fn.apply(this);
        clearTimeout(t)
    },delay)
}