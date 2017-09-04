$(document).ready(function() {

	var isCtrl = false; 

	$(document).keyup(function(e) { 
		if(e.which == 17) isCtrl = false;
	}).keydown(function (e) { 
		if(e.which == 17) isCtrl = true; 
		if(e.which == 73 && isCtrl == true) { 

			var target = location.href.replace(g5_url, "");

			if (!(g5_is_member || g5_is_admin) && confirm("로그인 하시겠습니까?"))
				location.href = g5_bbs_url + '/login.php?url=' + target;
			
			return false;
		} 
	});

	$("#nav #more").click(function() {
		$("body").toggleClass('noscroll');
		$(this).find('.nav').toggleClass('on');
		$('.aside').toggleClass('on');
	});

	$(".aside dd:not(.on)").hover(function() {
		if (!$('.aside').hasClass('on')) {

			var ul = $(this).find('ul');
			if (ul)
				ul.stop().fadeToggle('fast');
		}
	})

	$(document).on('click', '.aside.on dd', function(e) {
		var target = $(this).find('ul');
		
		if (target.length) {
			if (target.is(':hidden')) {
				$('.aside.on ul:visible').slideUp(200);
				target.slideDown(200);
				return false;
			}
			
		}
	});

	// 화면대비 컨텐츠 내용이 짧으면 푸터를 고정함.
	$(window).resize(function() {

		var wrap = $('#wrap');
		var h = $(this).height();
		var gap = h-wrap.outerHeight();

		if (gap > 0) { // && h > 564
			if (!wrap.hasClass('fix'))
				wrap.addClass('fix');
		} else {
			if (wrap.hasClass('fix'))
				wrap.removeClass('fix');
		}

	}).resize();

	// 배경이미지 로드
	$.fn.lazyBackground = function(fun) {

		$(this).each(function() {
			var _this = this;
			var url = $(_this).css('opacity', 0).attr("data-src");

			if (url) {
				var tmpImg = new Image() ;
					tmpImg.onload = function() {
						if (fun)
							fun.call(_this, url);
						else
							$(_this).css('background-image', 'url(' + url + ')').animate({'opacity': 1}, 'slow');
					}
					tmpImg.src = url;
			}
		});
	};

});