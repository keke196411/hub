'use strict';

$(document).ready(function(){
	document.documentElement.style.fontSize = '100px';
	var searchInited = false;
	var itemId = 300;
	// 关键变量，定义当前的窗口
	var $currentShowCore = $(".m-core.entrance-scene"),
		$currentshowInfor = null;
	window.warning = function(txt){
		$("#alertModal .alert-content").html('<i class="icon big-exclamation"></i>'+txt);
		$("#alertModal").modal({
			backdrop:'static'
		})
	};
	window.ensure = function(txt,fn){
		$("#alternativeModal .alert-content").html(txt);
		$("#alternativeModal").modal({
			backdrop:'static'
		});
		$("#alternativeModal [role='confirm']").off("click").click(function(){
			fn.apply(this);
			$("#alternativeModal").modal("hide")
		})
	};

	// 调试用
	$("#checkThePos").click(function(){
		var ins = $currentShowCore.children().get(0).interspace;
		console.log(ins)
	});

	// 定义导航栏函数
	(function(){
		$.fn.dropDown = function(speed,icon,callback){
			return this.each(function(){
				$(this).find(".fa").addClass(icon[1]).removeClass(icon[0]);
				$(this).next().slideDown(speed,function(){
					callback&&callback.call(this)
				}).parent().addClass("active")
			})
		};
		$.fn.drawUp = function(speed,icon){
			return this.each(function(){
				$(this).find(".fa").addClass(icon[0]).removeClass(icon[1]);
				$(this).next().slideUp(speed).parent().removeClass("active")
			})
		};
		$.fn.addCollapse = function(option){
			  //[修改]
			var defaultOpt = {
				icon:'',
				dropSpeed:600,
				dropDelay:0
			};
			var opt = $.extend(true,{},defaultOpt,option);
			this.constructor.prototype.withdraw = function(){  //[修改]
				$(this).find(".bar.active").each(function(){  //[修改]
					$(this).children(".inner").drawUp()
				})
			};
			return this.each(function(){
				$(this).on("click",".inner",function(e){  //[修改]
					e.stopPropagation();
					$("#emptyArea").click();
					var trigger = $(this);
					if(trigger.parent().hasClass("active")){
						trigger.drawUp(opt.dropSpeed,opt.icon).next().find(".bar.active .inner").drawUp(opt.dropSpeed,opt.icon);
					}else{
						trigger.dropDown(opt.dropSpeed,opt.icon,opt.dropCallback);
						if(opt.dropDelay) setTimeout(function(){
							trigger.next().find(".bar:first .inner").dropDown(opt.dropSpeed,opt.icon)
						},opt.dropDelay);
						trigger.parent().siblings(".active").children(".inner").drawUp(opt.dropSpeed,opt.icon).next().find(".bar.active .inner").drawUp(opt.dropSpeed,opt.icon)
					}
				})
			})
		}
	})();
	// 左侧导航高度
	$(".m-side-nav .navigation").css("max-height",$(".m-side-nav").height()-$(".m-side-nav .top-search").height());
	// 组件库
	$(".m-right-lib").addCollapse({
		icon:['fa-angle-down','fa-angle-up']
	});
	// tab页切换
	$(".m-show-bellow").on("click","[role='tabTrigger']",function(e){
		$(this).addClass("active").siblings().removeClass("active");
		var name = $(this).text().replace(/\s*/g,"");
		var group = $(this).attr("group").replace(/\s*/g,"");
		$("body").find("[role='tabResponser']").filter(function(){
			return $(this).attr("group")==group
		}).addClass("hide").filter(function(){
			return $(this).attr("name")==name
		}).removeClass("hide").find(".nano").length>0&&$(".nano").nanoScroller()
	});
	// 资源库
	var resource = $(".m-side-nav").addCollapse({
		icon:['fa-caret-right','fa-caret-up'],
		dropSpeed:400,
		// dropDelay:400
	});
	// 底部详情按钮
	$(".m-center").on("click","[role='reserve']",function(){
		$(this).parents(".u-shift").find(".cell>span").attr("contenteditable",false)
	});
	// 初始化滚动条
	$(".nano").nanoScroller();
	// 资源库搜索
	(function(){
		var cate = 'task',index=1;
		var searchItem = function(val){
			var content = val.replace(/(^\s*)|(\s*$)/g,"").toLowerCase(); 
			return $("#mainNav [category='"+cate+"'] .items>span").filter(function(){
				return $(this).text().toLowerCase()===content
			}).parent()
		};
		$(".top-search .btn-search").click(function(){
			var $ul = $(this).parent().next();
			if($ul.hasClass("collapse")){
				$ul.slideUp().removeClass("collapse");
			}else{
				$ul.slideDown(function(){
					$("#searchLib").focus();
					if(searchInited) return;
					$("#libCategory").dropdownList();
					searchInited = true
				}).addClass("collapse")
			}
		});
		$("#libCategory li").click(function(){
			var value = $(this).text();
			var $searcher = $("#searchLib");
			cate = value==="作业设计"?"task":value==="数据源"?'data':'';
			$searcher.trigger("focus");
			if(isNull($searcher.val())) return;
			var res = searchItem($searcher.val()).eq(0);
			res.length&&locale(res)
		});
		$("#searchLib").on({"input":function(){
			var res = searchItem($(this).val()).eq(0);
			if(res.length) locale(res)
			else $("#mainNav .items.active").toggleClass("active")
		}}).on("keypress",function(e){
			if(e.key=='Enter'){
				var res = searchItem($(this).val());
				if(res.length>1){
					e.preventDefault();
					locale(res.eq(index));
					index = ++index>=res.length?0:index
				}
			}
		});
		//for ie
		if(document.all){
			var that = $("#searchLib").get(0);
	        if(that.attachEvent) {
	            that.attachEvent('onpropertychange',function(e) {
	                if(e.propertyName!='value') return;
	                $(that).trigger('input');
	            })
	        }
		}
	})();
	// 拖动边框
	(function(){
		var centerLeft,
			centerRight,
			coreBottom;
		var maxNav = $(".m-side-nav").outerWidth()*1.5,
			minNav = 100,
			maxLib = $(".m-right-lib").outerWidth()*1.5,
			minLib = 100,
			maxBellow = $(".m-show-bellow:first").outerHeight()*1.6,
			minBellow = 15;
		$(".m-side-nav").resizable({
			containment:'parent',
			autoHide: true,
			handles:'e',
			maxWidth:maxNav,
			minWidth:minNav,
			start:function(){
				centerLeft = originalPos($(".m-center").get(0)).left
			},
			resize:function(e,ui){
				$(".m-center").css("left",ui.size.width-ui.originalSize.width+centerLeft)
			}
		});
		$(".m-right-lib").resizable({
			containment:'parent',
			autoHide:true,
			handles:'w',
			maxWidth:maxLib,
			minWidth:minLib,
			start:function(){
				centerRight = parseFloat($(".m-center").css("right"))
			},
			resize:function(e,ui){
				$(".m-center").css("right",ui.size.width-ui.originalSize.width+centerRight)
			},
			stop:function(e,ui){
				var contRight = originalPos($currentShowCore.get(0)).right,
					marker = $currentShowCore.children().get(0).interspace,
					instance = $currentShowCore.children().get(0).instance,
					changed;
				$currentShowCore.find(".mapper").each(function(){
					var right = originalPos(this).right;
					if(right>contRight){
						var cssX = parseFloat($(this).css("left")),
							left = cssX-(right-contRight);
						$(this).data("houseX",cssX).css({"left":left}).addClass("refugeeX").data("origin").mapperPosX = $(this).offset().left;
						marker[$(this).prop("id")].left = $(this).offset().left;
						changed = true
					}else if($(this).hasClass("refugeeX")){
						var maxW = $currentShowCore.outerWidth()-$(this).outerWidth(),
							cssX = $(this).data("houseX")>maxW?maxW:$(this).data("houseX");
						$(this).css("left",cssX).removeData("houseX").removeClass("refugeeX").data("origin").mapperPosX = $(this).offset().left;
						marker[$(this).prop("id")].left = $(this).offset().left;
						changed = true
					}
				});
				changed&&instance.repaintEverything()
			}
		});
		$(".m-show-bellow .btn-dragger").on({"mousedown":function(e){
			var $that = $(this),
				$cont = $that.parent();
			var id = $cont.attr("lib-belong"),
				statrLocation = e.pageY,
				$linker = $cont.siblings(".m-core[lib-belong='"+id+"']"),
				parentHeight = $cont.outerHeight();
			$(window).on("mousemove",function(e){
				e.preventDefault();
				var currentLocation = e.pageY;
				var offset = -currentLocation+statrLocation;
				var newHeight = parentHeight+offset>maxBellow?maxBellow:parentHeight+offset<minBellow?minBellow:parentHeight+offset;
				var newBottom = newHeight + 10;
				$cont.height(newHeight);
				$linker.css("bottom",newBottom)
			}).one("mouseup",function(){
				$(window).off("mousemove");
				let some = $(".nano").nanoScroller();
				$(".nano-content").on("scroll",(e)=>{
					console.log(e.currentTarget.scrollTop)
				})
				var contBottom = originalPos($currentShowCore.get(0)).bottom,
					marker = $currentShowCore.children().get(0).interspace,
					changed;
				$currentShowCore.find(".mapper").each(function(){
					var bottom = originalPos(this).bottom;
					if(bottom>contBottom){
						var cssY = parseFloat($(this).css("top")),
							top = cssY-(bottom-contBottom);
						$(this).data("houseY",cssY).css({"top":top}).addClass("refugeeY").data("origin").mapperPosY = $(this).offset().top;
						marker[$(this).prop("id")].top = $(this).offset().top;
						changed = true
					}else if($(this).hasClass("refugeeY")){
						var maxH = $currentShowCore.outerHeight()-$(this).outerHeight(),
							cssY = $(this).data("houseY")>maxH?maxH:$(this).data("houseY");
						$(this).css("top",cssY).removeData("houseY").removeClass("refugeeY").data("origin").mapperPosY = $(this).offset().top;
						marker[$(this).prop("id")].top = $(this).offset().top;
						changed = true
					}
				});
				changed&&$currentShowCore.children().get(0).instance.repaintEverything()
			})
		}})
	})();
	// 动态新增标签页
	(function(){
		// 加载核心区内容
		var loading = function(identify){
		    $currentShowCore = $(".m-center .m-core").addClass("hide").removeClass("show").filter(function(){
		    	return $(this).attr("lib-belong")==identify
		    }).removeClass("hide").addClass("show");
		    $currentshowInfor = $(".m-center .m-show-bellow").addClass("hide").removeClass("show").filter(function(){
		    	return $(this).attr("lib-belong")==identify
		    }).removeClass("hide").addClass("show");
		    $(".btn-controller").removeClass("stop").addClass("running");
		    var scale = $currentShowCore.children().get(0)?$currentShowCore.children().get(0).zoom:1;
		    document.documentElement.style.fontSize = scale*100+'px';  //因为stylesheet只有一个，所以根元素的fontsize只能是变化的
		    $currentShowCore.find(".label").css("transform","scale("+scale+")")
		};
		
		// 点击左侧导航中的文件名
		var subNavSkip = function(){
			$("#mainNav").on("click",".items",function(e){
				e.stopPropagation();
				$("#emptyArea").click();
				var libId = $(this).prop("id"),
					libName = $(this).children("span").text().replace(/\s*/g,"");
				$("#mainNav").find(".items").removeClass("active");
				$(this).addClass("active");
				if($("#tabArea").find(".tab[link-lib="+libId+"]").length==0){
					var $tab = $('<span link-lib="'+libId+'" class="tab active">'
					+libName+'<a class="btn close">&times;</a></span>');
					$("#tabArea").find(".tab").removeClass("active").end().append($tab);
					$(".m-center .btn-controller").css("transform","scale(1)");
					loading(libId)
				}else{
					$("#tabArea").find(".tab[link-lib="+libId+"]").addClass("active").siblings("").removeClass("active");
					loading(libId)
				}
			})
		};
		// 删除标签
		var TabClose = function(){
			$("#tabArea").on("click",".tab>a",function(e){
				e.stopPropagation();
				var n = $(this).parent().siblings().length;
				if(n){
					var ord = $(this).parent().index(),
						$tab = ord?$(this).parent().prev():$(this).parent().next(),
						libId = $tab.attr("link-lib"),
						$theLib = $("#mainNav").find("[id='"+libId+"']");
					$tab.addClass("active").siblings().removeClass("active");
					loading(libId);
					locale($theLib)
				}else{
					loading('');
					$(".m-center .btn-controller").css("transform","scale(0)")
				};
				$(this).parent().remove();
			})
		};
		// 点击顶部tab
		var tabShift = function(){
			$("#tabArea").on("click",".tab",function(e){
				e.stopPropagation();
				$("#emptyArea").click();
				var libId = $(this).attr("link-lib"),
					$theLib = $("#mainNav").find("[id='"+libId+"']");
				$(this).addClass("active").siblings(".tab").removeClass("active");
				loading(libId);
				locale($theLib)
			})
		};
		subNavSkip();
		TabClose();
		tabShift()
	})();
	// 重命名
	(function(){
		$("#mainNav").on("click",".inner>span",function(e){
			e.stopPropagation();
			if($(this).attr("nameStatic")) return;
			if($(this).hasClass("editable")){
				var $that = $(this),
	  				ori = $that.text();
	  			$that.addClass("editing");
	  			$(this).keypress(function(e){
	  				if(e.key=='Enter'){
	  					e.preventDefault();
	  					$("#emptyArea").click()
	  				}
	  			});
	  			var t = setTimeout(function(){
	  				$("body").one("click",function(e){
	  					var $t = $(e.target),
	  						newTxt = $that.text();
	  					if(!$t.is($that)){
	  						if(isNull(newTxt)){
						    	window.warning("不能为空字符串");
						    	$that.text(ori)
	  						}else if(newTxt.match(/\s+/)){
	  							window.warning("不允许的字符：空格");
						    	$that.text(ori)
	  						}else{
	  							$that.parents(".bar:first").siblings().find(".inner>span").each(function(){
	  								if($(this).text()===newTxt){
	  									window.warning("命名重复");
	  									$that.text(ori);
	  									return
	  								}
	  							})
	  						};
	  						$that.removeClass("editable editing").attr("contenteditable",false);
	  					}
	  				});
	  				clearTimeout(t)
	  			},0)
			}else{
				$("#mainNav span.editable").removeClass("editable editing").attr("contenteditable",false);
				$(this).addClass("editable").attr("contenteditable",true);
				$("#emptyArea").click();
			}
		})
	})();
	// 左侧拖动
	(function(){
		$("#mainNav .items").each(function(){
			$(this).draggable({
				containment:$(this).parents(".bar.root:first"),
				helper:function(){
					return '<div class="dragging-helper">'+$(this).children("span").text()+'</div>'
				},
				start:function(e,ui){
					
				},
				stop:function(e,ui){
					e.stopPropagation();
					$("#drag_indicator").removeClass("show");
					$(this).css({top:0,right:0,bottom:0,left:0})
				}
			})
		});
		$("#mainNav .inner").each(function(){
			$(this).droppable({
				hoverClass: "drop-hover",
				tolerance:'intersect',
				over:function(e,ui){
					var txt = $(this).children("span").text();
					var helper = ui.helper.get(0);
					$("#drag_indicator").children("em").text(txt).end().css({top:originalPos(helper).top,left:originalPos(helper).left+helper.offsetWidth+30}).addClass("show")
				},
				drop:function(event,ui){
					$(this).next(".lib").append(ui.draggable)
				}
			})
		})
	})();
	
	// 左侧增删改按钮
	(function(){
		var location,localeName;  //[修改]
		//确认添加数据源子文件
		$("#newData").on("shown.bs.modal",function(){
			$(".modal-content .nano").nanoScroller();
			$(".chooser li").click(function(){
				$(this).addClass("active").siblings(".active").removeClass("active")
			});
			$("#dataOriName").focus();  //[修改]
			if(!$(this).data("verifyAdded")){
				$(this).addVerify();  //[修改]
				$(this).data("verifyAdded","added")
			}
		}).on("click","[role='confirm']",function(e){	
			var name = $("#dataOriName").val().trim();  //[修改]
			var allow = $("#newData").judgeOthers();  //[修改]
			if(allow){
				$("#newData").modal("hide");
				var t = setTimeout(function(){
					// location.parent(".bar").hasClass("active")||window.warning("新的数据源 \""+name+"\" 已经添加至 \""+localeName+"\"");  //[修改]
					var $newDataFile = $('<div class="items" id="'+(++itemId)+'">'+  //[修改]
		                '<span>'+name+'</span>'+
		                '<a class="btn edage editor"><i class="icon icon-round-times"></i></a>'+
		                '<a class="btn inside del-item"><i class="icon icon-pencil"></i></a>'+
		            '</div>');
					location.next(".lib").append($newDataFile);  //[修改]
					locale($newDataFile);  //[修改]
					$newDataFile.draggable({  //[修改]
						containment:$(this).parents(".bar.root:first"),
						helper:function(){
							return '<div class="dragging-helper">'+$(this).children("span").text()+'</div>'
						},
						stop:function(e,ui){
							e.stopPropagation();
							$("#drag_indicator").removeClass("show");
							$(this).css({top:0,right:0,bottom:0,left:0})
						}
					});
					clearTimeout(t)
				},10)
			}
		}).on("hidden.bs.modal",function(){
			$(this).clean()
		});
		// 确认添加作业子文件
		$("#newFile").on("shown.bs.modal",function(){
			$("#fileName").focus();  //[修改]
			if(!$(this).data("verifyAdded")){
				$(this).addVerify();  //[修改]
				$(this).data("verifyAdded","added")
			}
		}).on("click","[role='confirm']",function(e){	
			var name = $("#fileName").val().trim();  //[修改]
			var allow = $("#newFile").judgeOthers();  //[修改]
			if(allow){
				$("#newFile").modal("hide");
				var t = setTimeout(function(){
					// location.parent(".bar").hasClass("active")||window.warning("新的作业 \""+name+"\" 已经添加至 \""+localeName+"\"");
					var $newTaskFile = $('<div class="items" id="'+(++itemId)+'">'+  //[修改]
		                '<span>'+name+'</span>'+
		                '<a class="btn edage del-item"><i class="icon icon-round-times"></i></a>'+
		                '<a class="btn inside editor"><i class="icon icon-pencil"></i></a>'+
		            '</div>');
					location.next(".lib").append($newTaskFile);  //[修改]
					locale($newTaskFile);  //[修改]
					$newTaskFile.draggable({  //[修改]
						containment:$(this).parents(".bar.root:first"),
						helper:function(){
							return '<div class="dragging-helper">'+$(this).children("span").text()+'</div>'
						},
						stop:function(e,ui){
							e.stopPropagation();
							$("#drag_indicator").removeClass("show");
							$(this).css({top:0,right:0,bottom:0,left:0})
						}
					});
					clearTimeout(t)
				},10)
			}
		}).on("hidden.bs.modal",function(){
			$(this).clean()
		});
		// 确认添加文件夹
		$("#newFold").on("shown.bs.modal",function(){
			$("#foldName").focus();  //[修改]
			if(!$(this).data("verifyAdded")){
				$(this).addVerify();  //[修改]
				$(this).data("verifyAdded","added")
			}
		}).on("click","[role='confirm']",function(e){
			var name = $("#foldName").val().replace(/(^\s*)|(\s*$)/g,"");  //[修改]
			var allow = $("#newFold").judgeOthers();  //[修改]
			if(allow){
				$("#newFold").modal("hide");
				var t = setTimeout(function(){
					location.parent(".bar").hasClass("active")||window.warning("新的文件夹 \""+name+"\" 已经添加至 \""+localeName+"\"");
					var $newFold = $('<div class="bar">'+  //[修改]
					    '<div class="inner">'+
					        '<i class="fa fa-caret-right"></i>'+
					        '<i class="icon icon-fold"></i>'+
					        '<span>'+name+'</span>'+
					        '<a class="btn edage del-fold"><i class="icon icon-round-times"></i></a>'+
					        '<a class="btn inside add-item"><i class="icon icon-rec-plus"></i></a>'+
					    '</div>'+
					    '<div class="lib"></div>'+
					'</div>');
					location.next(".lib").append($newFold);  //[修改]
					$newFold.children(".inner").droppable({  //[修改]
						containment:$(this).parents(".bar.root:first"),
						helper:function(){
							return '<div class="dragging-helper">'+$(this).children("span").text()+'</div>'
						},
						stop:function(e,ui){
							e.stopPropagation();
							$("#drag_indicator").removeClass("show");
							$(this).css({top:0,right:0,bottom:0,left:0})
						}
					});
					clearTimeout(t)
				},10)
			}
		}).on("hidden.bs.modal",function(){
			$(this).clean()
		});

		// 新建数据源--子文件
		$("#mainNav").on("click","[category='data'] .add-item",function(e){
			e.stopPropagation();
			$("#emptyArea").click();
			location = $(this).parent(".inner");
			var txt = $(this).siblings("span").text();
			localeName = txt;
			$("#newData .modal-header").contents().filter(function(){
				return this.nodeType==3
			}).get(0).nodeValue = "新建"+txt;
			$("#newData").modal({
				backdrop:'static'
			})
		// 新建作业--子文件
		}).on("click","[category='task'] .add-item",function(e){
			e.stopPropagation();
			$("#emptyArea").click();
			location = $(this).parent(".inner");
			localeName = $(this).siblings("span").text();
			$("#newFile").modal({
				backdrop:'static'
			})
		// 新建文件夹
		}).on("click",".add-fold",function(e){
			e.stopPropagation();
			$("#emptyArea").click();
			location = $(this).parent(".inner");
			localeName = $(this).siblings("span").text();
			$("#newFold").modal({
				backdrop:'static'
			})
		}).on("click",'.editor',function(e){
		// 编辑属性等等
			e.stopPropagation();
			$("#emptyArea").click();
			$(".m-show-bellow .cell>span").attr("contenteditable",true)
		}).on("click",'.del-item',function(e){
		// 删除子文件
			e.stopPropagation();
			var $that = $(this);
			$("#emptyArea").click();
			window.ensure("确认删除该条目？",function(){
				var ID = $that.parent().prop("id");
				$that.parent().remove();
				$("#tabArea .tab[link-lib='"+ID+"'] .close").click()
			});
		}).on("click",".del-fold",function(e){
		// 删除文件夹
			e.stopPropagation();
			var $that = $(this);
			$("#emptyArea").click();
			window.ensure("确认删除该文件夹及其所有子目录？",function(){
				$that.parent().next(".lib").find(".items").each(function(){
					var ID = $(this).prop("id");
					$("#tabArea .tab[link-lib='"+ID+"'] .close").click()
				});
				$that.parents(".bar:first").remove()
			})
		})
	})();
	// 核心区
	(function(){
		// 判断某点的位置是否与其他点重叠的函数(重叠:false)
		$.prototype.judge = function(selfId,container,marker){  
			//自身ID，容器，存储位置的数组（待判断的点组）
		    var w = $(this).outerWidth(),
		        h = $(this).outerHeight(),
		        t = $(this).offset().top,
		        l = $(this).offset().left;
		    var minHorizon = container.offset().left,
		        maxHorizon = container.offset().left+container.width(),
		        minVertical = container.offset().top,
		        maxVertical = container.offset().top+container.height();
		    for(var i in marker){
		        if(marker[i]===marker[selfId]) continue;
		        var xLeft = marker[i].left-w<minHorizon?minHorizon:marker[i].left-w,
		            xRight = marker[i].left+marker[i].width>maxHorizon?maxHorizon:marker[i].left+marker[i].width,
		            yTop = marker[i].top-h<minVertical?minVertical:marker[i].top-h,
		            yBottom = marker[i].top+marker[i].height>maxVertical?maxVertical:marker[i].top+marker[i].height;
		        var xOverlay = l<xRight&&l>xLeft,
		            yOverlay = t<yBottom&&t>yTop;
		        if(xOverlay&&yOverlay) {
		            console.log("overlap!");
		            return false
		        }
		    };
		    return true
		};
		// 渐隐效果
		$.fn.fadeOut = function(duration){
			var duration = duration?duration:parseFloat($(this).css("transition-duration")).toFixed(3)*1000;
			$(this).css("transform","scale(0)");
			delayRun(function(){
				$(this).remove()
			},duration)
		};
		var selectedSourceId = null,selectedTargetId = null;
		var mapperBaseWidth = 66,mapperBaseHeight = 66;
		var allowUp/*是不是点击了纯空白区域*/,$dragArea,isClick,allowZooming = true,isCtrPressing,entrilyMove;
		var startUndraggableX,startUndraggableY;
		var normalConnectionStyle = {stroke:"#4d84fe",strokeWidth:3},
			normalConnectionHoverStyle = {stroke:'blue',strokeWidth:5},
			abnormalConnectionStyle = {stroke:"#fb5353",strokeWidth:3},
			abnormalConnectionHoverStyle = {stroke:'red',strokeWidth:5};
		var connectorPaintStyle = {
		        strokeWidth:3,
		        stroke: "#d7d7da",
		        joinstyle: "round",
		        outlineWidth:0
		    },connectorHoverStyle = {
		        stroke: "#cbcbcb",
		        strokeWidth:5
		    },endpointHoverStyle = {
		        fill: "transparent"
		    },targetEndpoint = {// the definition of target endpoints (will appear when the user drags a connection)
		        endpoint: "Dot",
		        paintStyle: { fill: "transparent",radius:6},
		        hoverPaintStyle: endpointHoverStyle,
		        maxConnections: -1,
		        dropOptions: { hoverClass: "hover", activeClass: "active" },
		        // connector: [ "Flowchart", { stub: [40, 60], gap: 7, cornerRadius: 5, alwaysRespectStubs: true } ],
		        // connector:['Straight',{gap:8}],
		        connectorStyle: connectorPaintStyle,
		        connectorHoverStyle: connectorHoverStyle
		    };
		var _addEndpoints = function (plumbIns,toId, sourceAnchors,lineType='straight') {
	        var endpoints = plumbIns.addEndpoints(toId,[{
	            anchor:sourceAnchors[0],
	            isSource:false,
	            isTarget:true,
	            cssClass:'jtk-left',
	            connector:(()=>{
	            	return lineType=="flowChart"?[ "Flowchart", { stub: [40, 60], gap: 5, cornerRadius: 5, alwaysRespectStubs: true } ]:
	            	['Straight',{gap:8}]
	            })()
	        },{
	        	anchor:sourceAnchors[1],
	        	isSource:true,
	        	isTarget:true,
	        	cssClass:'jtk-right',
	        	connector:(()=>{
	        		return lineType=="flowChart"?[ "Flowchart", { stub: [40, 60], gap: 5, cornerRadius: 5, alwaysRespectStubs: true } ]:
	        		['Straight',{gap:8}]
	        	})()
	        }],targetEndpoint);
	        endpoints.forEach(function(item){
	        	$(item.canvas).attr("elementId",item.elementId)
	        })
		},extendBtn = function(obj){
			var className = obj.className;
			className = className.slice(className.lastIndexOf('-')+1)
			$(obj).css({
				'animation-name':'expand-popuper-' + className,
				'animation-fill-mode':'forwards'
			})
		},shrinkBtn = function(obj){
			var className = obj.className;
			className = className.slice(className.lastIndexOf('-')+1)
			$(obj).css({
				'animation-name':'shrink-popuper-' + className,
				'animation-fill-mode':'backwards'
			})
		},addZooming = function(who){
			var centerSetted,zoomX,zoomY,
				marker = who.interspace,
				direction = 0,
				mapperZoom = who.zoom;
			who.addEventListener("wheel",function(){
				var e = document.all ? window.event : arguments[0] ? arguments[0] : event;
				direction = e.deltaY>0?1:-1;
				zooming(e,who,direction,marker);
			},false);
			$(who).append('<div class="zoom-indicator">'+
        		'<span></span>'+
    		'</div>');
    		// 缩放距离只需跟每帧的文档位置比较，每帧的变化距离亦如此
    		function zooming(event,container,dire,marker){
    			if(!allowZooming||!$(container).find(".mapper").length) return;
    			if($dragArea){
    				$dragArea.remove();
    				$(container).find(".mapper.contained").removeClass("contained")
    			}
    			var instance = container.instance,
    				marker = container.interspace,
    				center = [event.pageX,event.pageY];
    			mapperZoom = mapperZoom+0.02*dire>0.48?mapperZoom+0.02*dire<1.32?mapperZoom+0.02*dire:1.32:0.48;
    			if(mapperZoom>=1.32||mapperZoom<=0.48) return;
    			who.zoom = mapperZoom;
    			$(container).find(".mapper").each(function(){
    				var data = $(this).data("origin"),
    					id = $(this).prop("id"),
    					oriCellDisX = data.mapperPosX-center[0],
    					oriCellDisY = data.mapperPosY-center[1],
    					varDistanceX = oriCellDisX*dire*0.02,
    					varDistanceY = oriCellDisY*dire*0.02;
    				document.documentElement.style.fontSize = 100*mapperZoom+'px';
    				var newW = mapperBaseWidth*mapperZoom,
    					newH = mapperBaseHeight*mapperZoom,
    					newT = parseFloat($(this).css("top"))+varDistanceY/*<0?0:oriCssY+varDistanceY>container.offsetHeight-newH?container.offsetWidth-newH:oriCssY+varDistanceY*/,
    					newL = parseFloat($(this).css("left"))+varDistanceX/*<0?0:oriCssX+varDistanceX>container.offsetWidth-newW?container.offsetWidth-newW:oriCssX+varDistanceX*/;
    				$(this).css({top:newT,left:newL,width:newW,height:newH}).find(".label").css("transform","scale("+mapperZoom+")");
					marker[id].left = $(this).offset().left;
					marker[id].top = $(this).offset().top;
    			});
    			instance.repaintEverything();
    			for(var i in marker){
    				marker[i].width = mapperBaseWidth*mapperZoom;
    				marker[i].height = mapperBaseHeight*mapperZoom
    			};
    			$(container).find(".zoom-indicator span").html(Math.round(mapperZoom*1000)/10+'%')
    		};
		};
		$("#elementLib .element").draggable({
			helper:'clone',
			scope:'basic',
			containment:$(".g-body")
		});
		$(".m-core .container").each(function(){
			var marker = this.interspace = {};
			var theInstance = this.instance = createInstance();
			this.zoom = 1;
			$(this).droppable({
				scope:'basic',
				tolerance:'fit',
				drop:function(event,ui){
					var m = createMapperFromDrag(theInstance,ui,$(this),marker);
					if($(this).find(".mapper").length) {
						var res = m.obj.judge('',$(this),marker);
						if(!res) {
							theInstance.remove(m.obj);
							return
						}
					};
					Object.defineProperty(marker,m.name,{
						configurable:true,
						value:{
							"width":m.width,
							"height":m.height,
							"top":m.top,
							"left":m.left
						},
						writable:true,
						enumerable:true
					})
					console.log(marker)
				}
			});
			addZooming(this)
		});
		// wrapper是一个存储从该点起所有起点的数组  尾递归
		function findTheSource(ins,nodes,wrapper){	//[修改]
			if(!nodes.length) return;
			for(let i=0;i<nodes.length;i++){
				var conns = ins.getConnections({target:nodes[i]});
				if(conns.length>0){
					var temp = [];
					for(let i=0;i<conns.length;i++){
						temp.push(conns[i].source)
					};
					findTheSource(ins,temp,wrapper)
				}else{
					var flag;
					for(let j=0;j<wrapper.length;j++){
						if(wrapper[j]===nodes[i]){
							flag = 1;
							break
						}
					};
					flag||wrapper.push(nodes[i])
				}
			}
		};
		function excute(ins,starter,infors,series,index){  //[修改]
			var t = setTimeout(function(){
				if(starter.length){
					for(let i=0;i<starter.length;i++){
						if($(starter[i]).hasClass("success")||$(starter[i]).hasClass("failed")) continue;
						$(starter[i]).addClass("success");
						var connsFord = ins.getConnections({source:starter[i]}),
							connsBack = ins.getConnections({target:starter[i]}),
							connInfor = {
								prev:[],
								next:[]
							},
							nextNodes = [];
						if(connsBack.length){
							for(let i=0;i<connsBack.length;i++){
								connInfor.prev.push(connsBack[i].source.getAttribute("id"))
							}
						};
						if(connsFord.length){
							for(let i=0;i<connsFord.length;i++){
								nextNodes.push(connsFord[i].target);
								connInfor.next.push(connsFord[i].target.getAttribute("id"))
							}
						};
						connInfor.name = starter[i].getAttribute("id");
						Array.prototype.push.call(infors,connInfor);
						clearTimeout(t);
						excute(ins,nextNodes,infors,series,index)
					}
				}else{
					Object.defineProperty(series,'task_'+index,{
						configurable:true,
						value:infors,
						writable:true,
						enumerable:true
					});
					console.log(series);
					clearTimeout(t);
					return
				}
			},1200)
		};
		function createInstance(){
		    var newInstance = window.jsp = jsPlumb.getInstance({
	            // default drag options
	            DragOptions: { cursor: 'pointer', zIndex: 2000 },

	            ConnectionOverlays: [
	                [ "PlainArrow", {
	                    location:-1,
	                    visible:true,
	                    width:13,
	                    length:8,
	                    id:"ARROW",
	                    events:{
	                        // click:function() { alert("you clicked on the arrow overlay")}
	                    }
	                }],
	                ["Label",{
	                    location: 0.5,
	                    id: "label",
	                    cssClass: "conn-label",
	                    events:{
	                        click:function(e){
	                        	// console.log("hey");
	                        }
	                    }
	                }]
	            ],
	            Container:'.container'
	        });
	        // suspend drawing and initialise.
	        newInstance.batch(function(){	
	        	// 连线的时候
	            newInstance.bind("connection", function (connInfo, originalEvent) {
	            	var clickLocationRight = false,
	            		allowProcess = true;
	            	var connection = connInfo.connection,
	            		sourceType = $(connInfo.source).attr("type"),
            			targetType = $(connInfo.target).attr("type"),
            			target = connection.target,
            			source = connection.source,
            			targetEndpoint = connInfo.targetEndpoint;
        			var $typeSelector = $('<div class="connector-type-select" id="connectorTypeSelect">'+
			            '<a class="btn">正常</a>'+
			            '<a class="btn">异常</a>'+
			            '<a class="btn">取消</a>'+
			        '</div>');
			        var iteratorBackwards = function(nodes,oriNode){  //[修改]
			        	if(!nodes.length) return;
			        	for(let i=0;i<nodes.length;i++){
			        		var conns = newInstance.getConnections({target:nodes[i]});
			        		if(conns.length>0){
			        			var temp = [];
			        			for(let i=0;i<conns.length;i++){
			        				if(conns[i].source===oriNode) {
			        					window.warning("不能形成闭合回路");
			        					newInstance.deleteConnection(connection);
			        					allowProcess = false
			        				}else temp.push(conns[i].source)
			        			};
			        			iteratorBackwards(temp,oriNode)
			        		}
			        	}
			        };

	            	if(connection.sourceId===connection.targetId) {
	            		window.warning("不能连接自身");
	            		this.deleteConnection(connection);
	            		return
	            	};
	            	if(this.getConnections({source:target,target:source}).length){
	            		window.warning("两组件间只能单向连接");
	            		this.deleteConnection(connection);
	            		return
	            	};
	            	if(sourceType=="start"){
	            		if(targetType!="input") {
	            			window.warning("开始组件只能连接输入组件");
	            			this.deleteConnection(connection);
	            			return
	            		}
	            	}else if(sourceType=="output"){
	            		if(targetType!="output"){
	            			window.warning("输出组件只能作为终点");
	            			this.deleteConnection(connection);
	            			return
	            		}
	            	};
	            	if(targetType=="start"){
	            		window.warning("开始组件只能作为起点");
	            		this.deleteConnection(connection);
	            		return
	            	};
	            	if(this.getConnections({source:source,target:target}).length>1){
	            		window.warning("两组件间同向只可有一条连线");
	            		this.deleteConnection(connection);
	            		return
	            	};
	            	if(targetEndpoint.isSource){
	            		window.warning("禁止连接组件接出点");
	            		this.deleteConnection(connection);
	            		return
	            	};
	            	iteratorBackwards([target],target);
	            	if(!allowProcess) return;
	            	$typeSelector.find(".btn").click(function(e){
	            		e.stopPropagation();
	            		if($(this).text()=='正常'){
	            			connection.setPaintStyle(normalConnectionStyle);
	            			connection.setHoverPaintStyle(normalConnectionHoverStyle);
	            			connection.setParameters({
	            				type:1
	            			});
	            			// connection.getOverlay("label").setLabel("&nbsp;&nbsp;&nbsp;");
	            			clickLocationRight = true
	            		}else if($(this).text()=='异常'){
	            			connection.setPaintStyle(abnormalConnectionStyle);
	            			connection.setHoverPaintStyle(abnormalConnectionHoverStyle);
	            			connection.setParameters({
	            				type:0
	            			});
	            			connection.getOverlay("label").setLabel("&times;");
	            			clickLocationRight = true
	            		}else{
	            			newInstance.deleteConnection(connection)
	            		};
	            		$(this).parent().remove()
	            	});
	            	$currentShowCore.find("#connectorTypeSelect .btn:first").click();
	            	var t = setTimeout(function(){
	            		$(connection.target).append($typeSelector);
	            		var t1 = setTimeout(function(){
	            			$typeSelector.css("transform","scale(1)");
	            			clearTimeout(t1)
	            		},50);
	            		clearTimeout(t)
	            	},0)
	            });
	            // 点击连线的时候
	            newInstance.bind("click", function (conn, originalEvent) {
	            	var preSelected = newInstance.getConnections({source:selectedSourceId,target:selectedTargetId})[0];
	            	var style = preSelected.getParameter("type")?normalConnectionStyle:abnormalConnectionStyle;
	            	preSelected.setPaintStyle(style);
	            	selectedSourceId = conn.sourceId;
	            	selectedTargetId = conn.targetId;
	            	var newSelected = newInstance.getConnections({source:selectedSourceId,target:selectedTargetId})[0];
	            	style = newSelected.getParameter("type")?normalConnectionHoverStyle:abnormalConnectionHoverStyle;
	            	newSelected.setPaintStyle(style)
	            });
	            newInstance.bind("connectionDrag", function (connection) {
	                // console.log("connection " + connection.id + " is being dragged. suspendedElement is ", connection.suspendedElement, " of type ", connection.suspendedElementType);
	            });

	            newInstance.bind("connectionDragStop", function (connection) {
	                // console.log("connection " + connection.id + " was dragged");
	            });

	            newInstance.bind("connectionMoved", function (params) {
	                // console.log("connection " + params.connection.id + " was moved");
	            })
	        });
	        return newInstance
		};
		function createMapperFromDrag(instance,ui,landing,marker){

			var rootId = ui.draggable.prop("id"),
				cate = ui.draggable.attr("type"),
				repeat = ui.draggable.data("count")!==undefined?Number(ui.draggable.data("count"))+1:'',
				mapperId = "mapper_"+landing.parent().attr("lib-belong")+"_"+rootId+repeat,
				scale = landing.get(0).zoom;
			var $mapper = $('<div class="mapper" id="'+mapperId+'" type="'+cate+'" category="'+rootId+'">'+
				'<div class="layer-loft">'+
				ui.draggable.html()+
				'<span class="label">'+ui.draggable.prop("title")+repeat+'</span>'+
				'</div>'+
				'</div>'),
				dropT = ui.offset.top-11,
				dropL = ui.offset.left-10;
			var $interview = '<div class="layer-popuper"><a class="btn btn-popuper-left" title="数据"></a>'+
				'<a class="btn btn-popuper-right" title="状态"></a></div>';
			var ldArea = originalPos(landing.get(0)),
				mapperTop = dropT>ldArea.top?dropT<ldArea.bottom-mapperBaseHeight*scale?dropT-ldArea.top:landing.outerHeight()-mapperBaseHeight*scale:0,
				mapperLeft = dropL>ldArea.left?dropL<ldArea.right-mapperBaseWidth*scale?dropL-ldArea.left:landing.outerWidth()-mapperBaseWidth*scale:0;
			ui.draggable.data("count",repeat);
			$mapper.append($interview).css({
				"width":mapperBaseWidth*scale,
				"height":mapperBaseHeight*scale,
				"top":mapperTop,
				"left":mapperLeft
			}).find(".label").css("transform","scale("+scale+")");
			landing.append($mapper);
			$mapper.data("origin",{  //这个data是用来确定缩放起点的
				mapperPosX:$mapper.offset().left,
				mapperPosY:$mapper.offset().top
			});
			_addEndpoints(instance,mapperId, ["LeftMiddle","RightMiddle"]);
            var orL,orT;
            $mapper.draggable({
            	containment:'parent',
            	start:function(event,ui){
            		orL = ui.position.left;
            		orT = ui.position.top
            	},
            	drag: function (event, ui) {
        	        instance.repaintEverything()
        	    },
        	    stop: function (e,ui) {
        	        var res = $(this).judge(mapperId,landing,marker);
        	        if(!res){
        	        	$(this).addClass("changeBrColor").removeClass("restoreBrColor").velocity({"top":orT,"left":orL},333,'easeInOutSine',function(){
        	        		instance.repaintEverything();
        	        		$(this).toggleClass("changeBrColor restoreBrColor")
        	        	})
        	        }else{
        	        	$(this).hasClass("refugeeX")&&$(this).removeClass("refugeeX").removeData("houseX");
        	        	$(this).hasClass("refugeeY")&&$(this).removeClass("refugeeY").removeData("houseY");
	        			marker[mapperId].left = ui.offset.left;
	        			marker[mapperId].top = ui.offset.top;
        	        	$(this).data("origin",{
        	        		mapperPosX:ui.offset.left,
        	        		mapperPosY:ui.offset.top
        	        	})
        	        }
        	    }
            });
            $(".btn-popuper-left").click(function(e){
            	e.stopPropagation();
            });
            $(".btn-popuper-right").click(function(e){
            	e.stopPropagation()
            });
            // 重命名label
            $mapper.find(".label").click(function(e){
            	e.stopPropagation()
            }).dblclick(function(){
            	var that = this;
            	/*$(this).removeAttr("readonly").focus().off("keypress").on("keypress",function(e){
            		if(e.key=='Enter') {
            			e.preventDefault();
            			$(this).attr("readonly","readonly").blur()
            		}
            	});
            	$(window).one("click",function(e){
            		if(e.target!==that) {
            			$(that).attr("readonly","readonly")
            		}
            	})*/
            	$(this).attr("contenteditable",true).removeClass("ellipsis").focus();
            	$(window).one("click",function(e){
            		if(e.target!==that) {
            			$(that).removeAttr("contenteditable").addClass("ellipsis");
            		}
            	})
            }).keypress(function(e){
            	if(e.key=='Enter'){
            		e.preventDefault();
            		$(this).removeAttr("contenteditable").addClass("ellipsis")
            	}
            });
            
            $mapper.click(function(){
            	/*$(this).hasClass("active")||$(this).addClass("active");
            	$(this).siblings(".mapper.active").removeClass("active");*/
            	$(this).toggleClass("active")
            }).mouseenter(function(){
            	if(!$(this).data("allowEnter")) return;
            	$(this).addClass("stretched").find(".layer-popuper .btn").each(function(){
            		extendBtn(this)
            	}).end().siblings(".mapper.stretched").removeClass("stretched").find(".layer-popuper .btn").each(function(){
        			shrinkBtn(this)
            	})
            }).mouseleave(function(){
            	$(this).data("allowEnter")||$(this).data("allowEnter","allow")     	
            });
            var PositionIndicator = {
				"name":mapperId,
				"obj":$mapper,
				"left":$mapper.offset().left,
				"top":$mapper.offset().top,
				"width":mapperBaseWidth*scale,
				"height":mapperBaseHeight*scale
			};
			return PositionIndicator
  		};
  		$(window).on("keydown",function(e){
  			var $container = $currentShowCore.children(),
  				$mapperActive = $container.find(".mapper.active"),
  				$mapperContained = $container.find(".mapper.contained");
			if(e.key=='Delete'){
				if(selectedSourceId){
					var instance = $container.get(0).instance,
						connection = instance.getConnections({source:selectedSourceId,target:selectedTargetId})[0];
					/*window.ensure("确认删除该连接线？",function(){
						instance.deleteConnection(connection);
						selectedSourceId = null;
						selectedTargetId = null
					});*/
					instance.deleteConnection(connection);
					selectedSourceId = null;
					selectedTargetId = null;
				};
				if($mapperContained.length){
					var instance = $container.get(0).instance,
						locations = $container.get(0).interspace;
					$mapperContained.each(function(){
						var id = $(this).prop("id");
						instance.remove(this);
						delete(locations[id])
					});
					$dragArea.remove()
				};
				if($mapperActive.length){
					var instance = $container.get(0).instance,
						locations = $container.get(0).interspace;
					if(e.key=='Delete'){
						$mapperActive.each(function(){
							instance.remove(this);
							var id = $(this).prop("id");
							delete(locations[id])
						})
					}
				}
			}else if(e.key=='Control'){
				isCtrPressing = true;
				$container.addClass("cursor-grab")
			}
  		}).on("keyup",function(){
  			isCtrPressing = false;
  			$currentShowCore.children().removeClass("cursor-grab")
  		});
  		$("body").on("mousedown",".m-core .container",function(e){
  			if(e.target!==this) {
  				allowUp = false;
  				if($(e.target).is(".jtk-left circle")){
  					startUndraggableX = e.pageX;
  					startUndraggableY = e.pageY;
  					$(e.target).on("mousemove",function(e){
			  			e.stopPropagation();
			  			e.preventDefault();
						if(e.pageX-startUndraggableX>3||e.pageX-startUndraggableX<-3||e.pageY-startUndraggableY>3||e.pageY-startUndraggableY<-3){
							window.warning('无法从接入点引出连线');
							$(this).off("mousemove")
						}
			  		})
  				};
  				return
  			};
  			var orX = e.pageX,
  				orY = e.pageY,
  				$markArea = $('<div class="marker-area"></div>'),
  				startX = orX - $(this).offset().left,
  				startY = orY - $(this).offset().top,
  				instance = $currentShowCore.children().get(0).instance;
			if($dragArea){  //确保第二次按下时不会有两个框选框
				$dragArea.remove();
				$dragArea = null
			};
			$currentShowCore.find(".mapper.contained").each(function(){
				$(this).removeClass("contained").removeData("originalX originalY")
			});
			if(isCtrPressing){  //只要鼠标按下时带control则至mouseup止视为整体拖动
				if($currentShowCore.find(".mapper").length){
					var prevX = orX,prevY = orY;
					$(this).on("mousemove",function(e){
						e.stopPropagation();
						e.preventDefault();
						var dispMouseX = e.pageX - prevX,
							dispMouseY = e.pageY - prevY;
						prevX = e.pageX;
						prevY = e.pageY;
						$currentShowCore.find(".mapper").each(function(){
							var cssY = parseFloat($(this).css("top")),
								cssX = parseFloat($(this).css("left"));
							$(this).css({top:cssY+dispMouseY,left:cssX+dispMouseX});
							instance.repaintEverything()
						})
					});
					entrilyMove = true
				}
			}else{  //只要鼠标按下时不带control则至mouseup止视为框选动作
				$markArea.css({top:startY,left:startX});
				$dragArea = $markArea;
				$(this).append($markArea);
				$(this).on("mousemove",function(e){
					e.preventDefault();  //防止发生怪异现象
					var w,h;
					if(e.pageX>=orX){
						w = e.pageX - orX
					}else{
						w = -e.pageX + orX-1;
						$markArea.css("left",startX - w)
					};
					if(e.pageY>=orY){
						h = e.pageY - orY
					}else{
						h = -e.pageY + orY-1;
						$markArea.css("top",startY - h)
					};
					$markArea.css({width:w,height:h})
				});
				entrilyMove = false
			};
			allowUp = true;
			isClick = true;
			allowZooming = false;

			var t = setTimeout(function(){
				isClick = false;
				clearTimeout(t)
			},150)	// 界定拖拽还是点击的阈值是150ms
  		}).on("mouseup",".m-core .container",function(){
  			if(!allowUp) return;
  			if(entrilyMove) return;  //如果是整体拖拽冒泡到body的捕获函数处理
  			$(this).off("mousemove");
  			var instance = this.instance,
  				marker = this.interspace;
  			if(isClick){	//click事件
  				var $container = $(this);
  				$container.find(".mapper.active").removeClass("active").end()
  				.find(".mapper.stretched .layer-popuper .btn").each(function(){
  					shrinkBtn(this)
  				});
  				$container.find("#connectorTypeSelect .btn:first").click();
  				if($dragArea){  //点击的情况下不会残留框选框
  					$dragArea.remove();
  					$dragArea = null
  				};
  				try{
  					var connection = instance.getConnections({source:selectedSourceId,target:selectedTargetId})[0],
  						style = connection.getParameter("type")?normalConnectionStyle:abnormalConnectionStyle;
				}catch(e){
					console.log("未连线")
				};
				if(connection){
					connection.setPaintStyle(style);
					selectedSourceId = null;
					selectedTargetId = null
				};
				$container.click()	//触发click事件以冒泡给其他处理函数
  			};
			if($dragArea){  //这里即等于mouseup事件
	  			var $container = $(this),
	  				$markArea = $container.find(".marker-area"),
	  				currentX,currentY,
	  				startAreaX,startAreaY;
	  			$container.find(".mapper").each(function(){
	  				isInArea(this,$markArea.get(0),'most')&&$(this).addClass("contained")
	  			});
	  			if($container.find(".mapper.contained").length){
	  				$markArea.draggable({
						containment:$container,
						start:function(e,ui){
							startAreaX = ui.position.left;
							startAreaY = ui.position.top;
							$container.find(".mapper.contained").each(function(){
								var oriX = parseFloat($(this).css("left")),
									oriY = parseFloat($(this).css("top"));
								$(this).data({originalX:oriX,originalY:oriY})
							})
						},
						drag:function(e,ui){
							var dispX = ui.position.left - startAreaX,
								dispY = ui.position.top - startAreaY;
							$container.find(".mapper.contained").each(function(){
								currentX = $(this).data("originalX") + dispX;
								currentY = $(this).data("originalY") + dispY;
								$(this).css({top:currentY,left:currentX})
							});
							instance.repaintEverything()
						},
						stop:function(e,ui){
							var toCompare = {},
								$that = $(this),
								canMove = 1;
							$container.find(".mapper:not(.contained)").each(function(){
								var id = $(this).prop("id");
								toCompare[id] = {
									"left":$(this).offset().left,
									"top":$(this).offset().top,
									"width":$(this).outerWidth(),
									"height":$(this).outerHeight()
								}
							});
							$container.find(".mapper.contained").each(function(){
								if(!$(this).judge('',$container,toCompare)){
									$(this).addClass("changeBrColor").removeClass("restoreBrColor");
									canMove = 0
								}
							});
							if(canMove){
								$container.find(".mapper.contained").each(function(){
									var id = $(this).prop("id");
									$(this).hasClass("refugeeX")&&$(this).removeClass("refugeeX").removeData("houseX");
									$(this).hasClass("refugeeY")&&$(this).removeClass("refugeeY").removeData("houseY");
									$(this).data("origin",{
										mapperPosX:$(this).offset().left,
										mapperPosY:$(this).offset().top
									}).removeData('originalX originalY');
									marker[id].left = $(this).offset().left;
									marker[id].top = $(this).offset().top;
								})
							}else{
								$container.find(".mapper.contained").each(function(){
									var oriX = $(this).data("originalX"),
										oriY = $(this).data("originalY");
									$(this).removeData('originalX originalY').velocity({top:oriY,left:oriX},333,'easeInOutSine',function(){
										$(this).hasClass("changeBrColor")&&$(this).toggleClass("changeBrColor restoreBrColor")
									})
								});
								$that.velocity({top:startAreaY,left:startAreaX},333,'easeInOutSine',function(){
									instance.repaintEverything()
								})
							}
						}
					});
					$dragArea = $markArea
	  			}else{
	  				$markArea.remove()
	  				$dragArea = null
	  			}	
			};
			allowZooming = true
  		}).on("mouseup",function(e){
  			if(entrilyMove){  //整体拖拽事件不区分mouseup和click
  				var $container = $currentShowCore.children(),
  					instance = $container.get(0).instance,
  					marker = $container.get(0).interspace;
				$container.off("mousemove");
  				$currentShowCore.find(".mapper").each(function(){
  					var id = $(this).prop("id");
  					$(this).hasClass("refugeeX")&&$(this).removeClass("refugeeX").removeData("houseX");
  					$(this).hasClass("refugeeY")&&$(this).removeClass("refugeeY").removeData("houseY");
					marker[id].left = $(this).offset().left;
					marker[id].top = $(this).offset().top;
  					$(this).data("origin",{
  						mapperPosX:$(this).offset().left,
  						mapperPosY:$(this).offset().top
  					})
  				});
  				entrilyMove = false;
  				allowZooming = true
  			}
  		});
  		$(".btn-controller").click(function(){
  			var instance = $currentShowCore.children().get(0).instance,
  				illegalSt,illegalEnd,
  				$starter = $currentShowCore.find(".mapper.active"),
  				$startor = $currentShowCore.find(".mapper[type='start']"),
  				$typeSelector = $currentShowCore.find(".connector-type-select");
  			if($(this).hasClass("running")){
  				if(!$currentShowCore.find(".mapper").length){
  					window.warning("未发现可执行组件");
  					return
  				};
  				if($typeSelector.length){
  					window.warning("发现未确定类型的连线");
  					return
  				};
  				$currentShowCore.find(".jtk-left:not(.jtk-endpoint-connected)").each(function(){
  					if($("#"+$(this).attr("elementId")).attr("type")!='start'){
  						illegalSt = 1;
  						return false
  					}
  				});
  				if(illegalSt){
  					window.warning("所有作业必须以开始组件起始");
  				}else{
  					$currentShowCore.find(".jtk-right:not(.jtk-endpoint-connected)").filter(function(){
	  					if($("#"+$(this).attr("elementId")).attr("type")!='output'){
	  						illegalEnd = 1;
	  						return false
	  					}
	  				});
	  				if(illegalEnd){
	  					window.warning("所有作业必须以输出组件结束");
	  				}else{
	  					var res = {};
	  					if($starter.length){
	  						var startP = [];
	  						$starter.each(function(){
	  							findTheSource(instance,[this],startP)
	  						});
	  						startP.forEach(function(item,index){
	  							var infors = {};
	  							excute(instance,[item],infors,res,index)
	  						})
	  					}else{
	  						$startor.each(function(index){
	  							var infors = {};
	  							excute(instance,[this],infors,res,index);
	  						})
	  					};
	  					$(this).toggleClass("running stop")
	  				}
  				}
  			}else $(this).toggleClass("running stop")
  		})
	})();
});
// 计算DOM文档坐标
function originalPos(el){
	var pos = el.getBoundingClientRect();
	return pos
}
// 返回DOM文档位置数组
function posArray(el){
	var res = [],
		pos = el.getBoundingClientRect();
	res.push(pos.top);
	res.push(pos.right);
	res.push(pos.bottom);
	res.push(pos.left);
	return res
}
// 定位资源库中的某个位置
function locale($obj){
	if($obj.hasClass("active")) return;
	var depth = $obj.parents(".bar").length;
	$("#mainNav .items.active").removeClass("active");
	$obj.addClass("active");
	if(depth===1){
		if($obj.parents(".bar").hasClass("active")){
			$obj.siblings(".bar.active").children(".inner").click()
		}else{
			$("#mainNav .bar.active").each(function(){
				$(this).children(".inner").click()
			})
			$obj.parents(".bar").children(".inner").click()
		}
	}else if(depth===2){
		if($obj.parents(".bar.root").hasClass("active")){
			if($obj.parents(".bar:first").hasClass("active")) return
			else{
				$obj.parents(".bar.root").find(".bar.active").children(".inner").click();
				$obj.parents(".bar:first").children(".inner").click()
			}
		}else{
			$("#mainNav .bar.active").each(function(){
				$(this).children(".inner").click()
			})
			$obj.parents(".bar").each(function(){
				$(this).children(".inner").click()
			})
		}
	}
}

//判断框选区是否包含某点
function isInArea(single,wrapper,choseStyle){
	var style = choseStyle?choseStyle:'all';
	try{
		var child = posArray(single),
			parent = posArray(wrapper);
		if(style=="all"){
			return !(child[0]<parent[0]||child[1]>parent[1]||child[2]>parent[2]||child[3]<parent[3])
		}else if(style=="most"){
			var overlapX = child[1]-child[3]+parent[1]-parent[3]-(Math.max(parent[1],child[1])-Math.min(parent[3],child[3])),
				overlapY = child[2]-child[0]+parent[2]-parent[0]-(Math.max(parent[2],child[2])-Math.min(parent[0],child[0])),
				overlapX = overlapX>0?overlapX:0,
				overlapY = overlapY>0?overlapY:0,
				overlapArea = overlapX*overlapY,
				childArea = (child[1]-child[3])*(child[2]-child[0]),
				overlapRatio = overlapArea/childArea;
			return overlapRatio>0.5?1:0
		}else if(style="any"){
			return Math.abs(Math.max(parent[2],child[2])-Math.min(parent[0],child[0]))<parent[2]-parent[0]+child[2]-child[0]&&
			Math.abs(Math.max(parent[1],child[1])-Math.min(parent[3],child[3]))<parent[1]-parent[3]+child[1]-child[3]
		}else{
			console.log("非法的框选方式！");
			return 0
		}
	}catch(e){

	}
}