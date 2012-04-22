function loadCityGridInfo(venue){
	$.ajax({
            url: 'http://api.citygridmedia.com/content/places/v2/search/latlon?'+
                 'what='+escape(venue.name)+'&lat='+venue.location.lat+'&lon='+venue.location.lng+'&radius=0.1&format=json&publisher=test',
            dataType: 'jsonp',
            crossDomain: true,
            success: function (data,venue){
                if (data.results.total_hits==0){
					$.ajax({
            			url: 'http://api.citygridmedia.com/content/places/v2/search/latlon?'+
			                 'what='+escape(data.results.did_you_mean)+'&lat='+venue.location.lat+'&lon='+venue.location.lng+'&radius=0.1&format=json&publisher=test',
			            dataType: 'jsonp',
			            crossDomain: true,
			            success: function (data2,venue){
			            	if (data2.results.total_hits!=0){
			            		var locationId = data2.results.locations[0].id;
								loadCityGridDetail(locationId);
			            	}
			            },
			            complete: function () {
			               // Pensar
			    		}
					});
				}else{
					var locationId = data.results.locations[0].id;
					loadCityGridDetail(locationId);
				}
            },
            complete: function () {
               // Pensar
    	}
    });

}

function loadCityGridDetail(locationId){
	$.ajax({
            url:'http://api.citygridmedia.com/content/places/v2/detail?id='+locationId+
				'&id_type=cs&placement=search_page&client_ip=127.0.0.1&format=json&publisher=test',
			dataType: 'jsonp',
            crossDomain: true,
            success: function (data){
            	renderCityGridInfo(data.locations[0]);
            },
            complete: function () {
               // Pensar
    		}
		});
}

function processCityGridInfoResponse(data,venue){
	if (data.results.total_hits>=1){
		var location = data.results.locations[0];
		$('#info-box').html('<h1>'+location.name+'</h1>'+
			'<p>Id: '+location.id+'</p>'+
			'<p><a href="'+location.profile+'">More Info...</a></p>');
	}else{
		$.ajax({
            url: 'http://api.citygridmedia.com/content/places/v2/search/latlon?'+
                 'what='+escape(data.results.did_you_mean)+'&lat='+venue.location.lat+'&lon='+venue.location.lng+'&radius=0.1&format=json&publisher=test',
            dataType: 'jsonp',
            crossDomain: true,
            success: function (data2,venue){
            	if (data2.results.total_hits>=1){
            		var location = data2.results.locations[0];
					$('#info-box').html('<h1>'+location.name+'</h1>'+
					'<p>Id: '+location.id+'</p>'+
					'<p><a href="'+location.profile+'">More Info...</a></p>');
            	}
            },
            complete: function () {
               // Pensar
    		}
		});
	}
}