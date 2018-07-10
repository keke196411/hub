$(document).ready(function(){
	$(".bar-input").click(function(){
		$(this).addClass("active").siblings(".active").removeClass("active")
	});
	$(".reminder").click(function(){
		if($(this).prev().get(0).checked) $(this).prev().get(0).checked = false
		else $(this).prev().get(0).checked = true
	});
	var verify = $(".login-frame").addVerify();
	$("#logining").click(function(){
		verify.judgeOthers()&&(window.location.href = './index.html')
	});
	$(".btn-gray-delete").click(function(){
		$(this).addClass("hide").siblings(".form-control").val("").focus()
	});
	$(window).keypress(function(e){
		if(e.key=='Enter'){
			$("#logining").click()
		}
	})
})
