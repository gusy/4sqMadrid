var extended =0;
var wrappermapwidth=0;
$(document).ready(function() {
	//$("#wrapper").css("width",String(Math.max($(window).width(),1024)));
	//$("#wrapper-map").css("width",String(Math.max($(window).width()-350,1024-350)) +"px");
	$("#wrapper-map").css("width",String($("#wrapper").width()-350)+"px");
	var wrapperHeight=$("#wrapper").height();
	$("#canvas-wrapper").css("height",String(wrapperHeight-$("#trending").height()-$("#bottom-bar").height())+"px");
	$("#wrapper").css("display","block");
	if(!timeframeMode){
		$("#lateralCanvas").addClass("twitter");
		$("#lateralHeader").addClass("twitter");
		$("#laterallogo").addClass("twitter");
		$("#lateral").addClass("twitter");
		$("#lateralBottom").addClass("twitter");
		
	}else if(timeframeMode){
	//comprobar que no es un evento ya creado
		$("#lateralCanvas").addClass("createEvent");
		$("#lateralHeader").addClass("createEvent");
		$("#laterallogo").addClass("createEvent");
		$("#lateral").addClass("createEvent");
		$("#lateralBottom").addClass("createEvent");
	}
	//$("#wrapper").css("width",screen.width);
	// Handler for .ready() called.
	wrappermapwidth = $('#wrapper-map').width();
	$('#lateralCanvas').height($('#wrapper-map').height()-7);
	$('#lateral').height($('#lateralCanvas').height()-$('#lateralHeader').height()-$('#lateralBottom').height());
	nowTrending();
	$('#laterallogo').click(function(){
		if(extended==0){
			extended=1;
			$('#lateral').slideUp('slow',function(){
				$('#lateralBottom').slideUp('slow');
				$('#laterallogo').css({'background-image':'url(img/logoHidden.png)'},'slow');
				$('#lateralCanvas').animate({height:'28px'},'slow',function(){
					$('#lateralCanvas').animate({marginLeft:'-28px'},'fast',function(){
						$('#lateralCanvas').animate({width:'28px'},'slow',function(){
							$('#wrapper-map').animate({width:($('#wrapper').width()-140)},'slow');		
						});
					});
				});										
			});
		}else{
			extended=0;
			$('#wrapper-map').animate({width:wrappermapwidth},'slow',function(){
				$('#lateralCanvas').animate({width:'300px'},'slow',function(){
					$('#lateralCanvas').animate({marginLeft:'0'},'fast',function(){
						$('#laterallogo').css({'background-image':'url(img/twitter_logo_top_bar.png)'},'slow');
						$('#lateralCanvas').animate({height:($('#wrapper-map').height()-7)},'slow',function(){
							$('#lateral').slideDown('slow');
							$('#lateralBottom').slideDown('slow');
						});		
					});
				});
			});
		}	
	});
});
var lastPaintedTime=0;
var lastWasPainted=true;
function nowTrending(){
var str="<ul id='trendingList'>";
$.each(trendingPlaces,function(index, place) { 
      if(index<3){
	   str+="<li class='trendingPlace'><span class='trendingName'>"+place.checkins[0].venue.name+"</span>";
	   str+="<span class='trendingCount'>"+place.activeCheckins+"</span></li>";
      }


});
str+="</ul>";
$("#trending").html(str);

}

function showTweet(jsonstatus,animation){
	if(timeframeMode && new Date().getTime()-lastPaintedTime<300){
		lastWasPainted=false;
		return(0);
	}
	if(!lastWasPainted){
		$("#lateral").prepend('<div class="emptyTweet"></div>');
	}
	var status=jsonstatus.tweet;
	var opts=getDefaults()
	var $tweet=$(formatTweet(status,opts));
	$tweet.css(opts.css['tweet']);
	$img = $tweet.find('.twitterSearchProfileImg').css(opts.css['img']);
	$tweet.find('.twitterSearchUser').css(opts.css['user']);
	$tweet.find('.twitterSearchTime').css(opts.css['time']);
	$tweet.find('a').css(opts.css['a']);
	if(animation==true){
		$tweet.hide().prependTo('#lateral').slideDown("slow").animate({backgroundColor:'#fff'},8000);
    }else{
    	$tweet.hide().prependTo('#lateral').show().css({backgroundColor:'fff'});
    }
    var size=$("#lateral").children().length
    lastPaintedTime=new Date().getTime();
    lastWasPainted=true;
    if(size>40){	
   	 $("#lateral div.twitterSearchTweet").last().remove();
     }
 }
function getDefaults(){
var optdefaults = {
		anchors: true,				// true or false (enable embedded links in tweets)
		animOutSpeed: 500,			// speed of animation for top tweet when removed
		animInSpeed: 500,			// speed of scroll animation for moving tweets up
		animOut: { opacity: 0 },	// animation of top tweet when it is removed
		applyStyles: true,			// true or false (apply default css styling or not)
		avatar: true,				// true or false (show or hide twitter profile images)
		bird: true,					// true or false (show or hide twitter bird image)
		birdLink: false,			// url that twitter bird image should like to
		birdSrc: 'http://cloud.github.com/downloads/malsup/twitter/tweet.gif', // twitter bird image
		colorExterior: null,        // css override of frame border-color and title background-color
		colorInterior: null,        // css override of container background-color
		filter: null,               // callback fn to filter tweets:  fn(tweetJson) { /* return false to skip tweet */ }
		formatter: null,			// callback fn to build tweet markup
		pause: false,				// true or false (pause on hover)
		refreshSeconds: 0,          // number of seconds to wait before polling for newer tweets
		term: '',					// twitter search term
		time: true,					// true or false (show or hide the time that the tweet was sent)
		timeout: 4000,				// delay betweet tweet scroll
		title: null,				// title text to display when frame option is true (default = 'term' text)
		titleLink: null,			// url for title link
		css: {
			// default styling
			a:     { textDecoration: 'none', color: '#3B5998' },
			bird:  { width: '50px', height: '20px', position: 'absolute', left: '-30px', top: '-20px', border: 'none' },
			container: { overflow: 'hidden', backgroundColor: '#eee', height: '100%' },
			fail:  { background: '#6cc5c3 url(http://cloud.github.com/downloads/malsup/twitter/failwhale.png) no-repeat 50% 50%', height: '100%', padding: '10px' },
			frame: { border: '10px solid #C2CFF1', borderRadius: '10px', '-moz-border-radius': '10px', '-webkit-border-radius': '10px' },
			tweet: { padding: '10px 10px', clear: 'left' ,backgroundColor:'#0f0'},
			img:   { 'float': 'left', margin: '5px', width: '48px', height: '48px' },
			loading: { padding: '20px', textAlign: 'center', color: '#888' },
			text:  {},
			time:  { fontSize: 'smaller', color: '#888' },
			title: { backgroundColor: '#C2CFF1', margin: 0, padding: '0 0 5px 0', textAlign: 'center', fontWeight: 'bold', fontSize: 'large', position: 'relative' },
			titleLink: { textDecoration: 'none', color: '#3B5998' },
			user:  { fontWeight: 'bold' }
		}
	};
return optdefaults;
}

function formatTweet(json, opts) {
	var str, pretty,
		text = json.tweet_text;
	if (opts.anchors) {
		text = json.tweet_text.replace(/(http:\/\/\S+)/g, '<a href="$1">$1</a>');
		text = text.replace(/\@(\w+)/g, '<a href="http://twitter.com/$1">@$1</a>');
	}
	str = '<div class="twitterSearchTweet recent" id="tw">';
	if (opts.avatar)
		str += '<img class="twitterSearchProfileImg" src="' + json.author_image + '" />';
	str += '<div><span class="twitterSearchUser"><a href="http://www.twitter.com/'+ json.author_name+'/status/'+ json.tweet_id +'">' 
	  + json.author_name  + '</a></span>';
	pretty = prettyDate(new Date(json.tweet_timestamp*1000+timeOffset*1000));
	if (opts.time && pretty)
		str += ' <span class="twitterSearchTime" title="'+json.tweet_timestamp+'">('+ pretty +')</span>'
	 str += '<div class="twitterSearchText">' + text + '</div></div></div>';
	 return str;
}

function prettyDate(time){
	var date = time,
		diff = (((new Date()).getTime() - date.getTime()) / 1000),
		day_diff = Math.floor(diff / 86400);
			
	if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
		return;
	var v = day_diff == 0 && (
			diff < 60 && "just now" ||
			diff < 120 && "1 minute ago" ||
			diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
			diff < 7200 && "1 hour ago" ||
			diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
		day_diff == 1 && "Yesterday" ||
		day_diff < 7 && day_diff + " days ago" ||
		day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";
	if (!v)
		window.console && console.log(time);
	return v ? v : '';
}

function updateAllTimes(){
	$("span.twitterSearchTime").each(function(index) {
   		var tstamp=parseInt($(this).attr('title'));
   		$(this).html(prettyDate(new Date(tstamp*1000+timeOffset*1000)))

   		
	});
}


