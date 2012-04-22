function showInfo(venue,x,y,processing){
	//alert(x+"-"+y);
	processing.switchRotate();
	$('#info-box').html('<p class="name">'+venue.name+'</p>');
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
	if (parseInt(location.review_info.total_user_reviews) > 0){
		htmlCode += '<p class="reviews"><a href="'+location.urls.reviews_url+'" target="_blank">';
		htmlCode += location.review_info.total_user_reviews + ' Reviews';
		htmlCode += '</a></p>'
	}
		//htmlCode += '<p class="contact"><span class="label">Tel.</span>';
		//htmlCode += '<span class="number">'+location.contact_info.display_phone+'</span></p>';
		
		htmlCode += '<p class="more"><a href="'+location.urls.profile_url+'" target="_blank" >More...</a></p>';
    $('#info-box').html(htmlCode);
}