function showInfo(venue,x,y,processing){
	//alert(x+"-"+y);
	processing.switchRotate();
	if (x<640){
		if (y<360){ // TOP LEFT
			var left = Math.max(0,Math.floor((x+40)/1280*100));
			var top = Math.max(0,Math.floor(y/720*100));	
			$('#info-box').css('padding','0px 0px 0px 20px');
			$('#info-box').css('background',"url('img/info-pointer-top-left.png') top left no-repeat");
			$('#info-box').css('right',"");
			$('#info-box').css('top',top+"%");
			$('#info-box').css('bottom',"");
			$('#info-box').css('left',left+"%");
		}else{ // BOTTOM LEFT
			var left = Math.max(0,Math.floor((x+20)/1280*100));
			var bottom = Math.max(0,100-Math.floor((y+20)/720*100));	
			$('#info-box').css('padding','0px 0px 0px 20px');
			$('#info-box').css('background',"url('img/info-pointer-bottom-left.png') bottom left no-repeat");
			$('#info-box').css('right',"");
			$('#info-box').css('top',"");
			$('#info-box').css('bottom',bottom+"%");
			$('#info-box').css('left',left+"%");
		}
	}else{
		if (y<360){ // TOP RIGHT
			var right = Math.max(0,100-Math.floor(x/1280*100));
			var top = Math.max(0,Math.floor(y/720*100));	
			$('#info-box').css('padding','0px 20px 0px 0px');
			$('#info-box').css('background',"url('img/info-pointer-top-right.png') top right no-repeat");
			$('#info-box').css('right',right+"%");
			$('#info-box').css('top',top+"%");
			$('#info-box').css('bottom',"");
			$('#info-box').css('left',"");

		}else{ // BOTTOM RIGHT
			var right = Math.max(0,100-Math.floor(x/1280*100));
			var bottom = Math.max(0,100-Math.floor((y+20)/720*100));	
			$('#info-box').css('padding','0px 20px 0px 0px');
			$('#info-box').css('background',"url('img/info-pointer-bottom-right.png') bottom right no-repeat");
			$('#info-box').css('right',right+"%");
			$('#info-box').css('top',"");
			$('#info-box').css('bottom',bottom+"%");
			$('#info-box').css('left',"");
		}
	}
	

	$('#info-box .content').html('<p class="name">'+venue.name+'</p>');
	$('#info-box').fadeIn(200,function(){infoBoxEnabled=true;});
	if (currentConfig.cityGrid){
		loadCityGridInfo(venue);
	}
}

function hideInfo(processing){
	$('#info-box').fadeOut(200,function(){infoBoxEnabled=false;});
	processing.switchRotate();
}

function renderCityGridInfo(location){
	var htmlCode = '<p class="name">'+location.name+'</p>';
	if (location.images != ""){
		$.each(location.images, function(index,image){
			if (image.type == "GENERIC_IMAGE"){
				var thumbWidth = 150;
				var thumbHeight = 150;
				if (image.width > image.height){
					thumbHeight = 150 * image.height/image.width;
				}else{
					thumbWidth = 150 * image.width/image.height;
				}
				htmlCode += "<img src='"+image.image_url
				             +"' width="+thumbWidth+" height="+thumbHeight+">";
				return false;
			}
		});
	}
	if (parseInt(location.review_info.total_user_reviews) > 0){
		htmlCode += '<p class="reviews"><a href="'+location.urls.reviews_url+'" target="_blank">';
		htmlCode += location.review_info.total_user_reviews + ' Reviews';
		htmlCode += '</a></p>'
	}

		//htmlCode += '<p class="contact"><span class="label">Tel.</span>';
		//htmlCode += '<span class="number">'+location.contact_info.display_phone+'</span></p>';
		
		htmlCode += '<p class="more"><a href="'+location.urls.profile_url+'" target="_blank" >More...</a></p>';
    $('#info-box .content').html(htmlCode);
}