$(document).ready(function() {
	// Handler for .ready() called.
	var test={"lat":40.494318383,"tweet":{"author_image":"https://twimg0-a.akamaihd.net/profile_images/1640114863/IMG235x_normal.jpg","tweet_id":"142220729797193728","tweet_via":"foursquare","tweet_timestamp":"1322739438","author_followers":"89","author_location":"Spain","author_id":"184090170","author_tweets":"3404","tweet_text":"En Emirates (@ Terminal 4 Satu00e9lite w\/ 2 others) http:\/\/t.co\/duqeJ7iN","author_name":"WhitepowerGTI","author_following":"245"},"venue":{"verified":false,"name":"Terminal 4 Sat\u00e9lite","url":"http:\/\/www.aena-aeropuertos.es\/csee\/Satellite\/Aeropuerto-Madrid-Barajas\/es","contact":{"phone":"902100007","twitter":"barajas_airport","formattedPhone":"902 10 00 07"},"location":{"city":"Madrid","postalCode":"28042","state":"Madrid","address":"Aeropuerto de Madrid-Barajas","lat":40.494318383,"lng":-3.56750965118},"stats":{"tipCount":50,"checkinsCount":4406,"usersCount":2839},"id":"4bf22859324cc9b65ddecc92","categories":[{"pluralName":"Airport Terminals","primary":true,"name":"Airport Terminal","shortName":"Terminal","id":"4bf58dd8d48988d1eb931735","icon":{"prefix":"https:\/\/foursquare.com\/img\/categories\/travel\/airport_terminal_","name":".png","sizes":[32,44,64,88,256]}}]},"lng":-3.56750965118,"checkid":"5519"};
	showTweet(test);

});

function showTweet(jsonstatus){
	var status=jsonstatus.tweet;
	var opts=getDefaults()
	var $tweet=$(formatTweet(status,opts));
	$img = $tweet.find('.twitterSearchProfileImg').css(opts.css['img']);
	$tweet.find('.twitterSearchUser').css(opts.css['user']);
	$tweet.find('.twitterSearchTime').css(opts.css['time']);
	$tweet.find('a').css(opts.css['a']);
    $('#timeline').append($tweet);
	alert('hola');	
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
			tweet: { padding: '5px 10px', clear: 'left' },
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
	str = '<div class="twitterSearchTweet">';
	if (opts.avatar)
		str += '<img class="twitterSearchProfileImg" src="' + json.author_image + '" />';
	str += '<div><span class="twitterSearchUser"><a href="http://www.twitter.com/'+ json.author_name+'/status/'+ json.tweet_id +'">' 
	  + json.author_name  + '</a></span>';
	pretty = prettyDate(new Date(json.tweet_timestamp*1000));
	if (opts.time && pretty)
		str += ' <span class="twitterSearchTime">('+ pretty +')</span>'
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