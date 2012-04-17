function successCheckinsFlyStartTimeframe(data,processing) {
    checkinPhp = data.checkins;


    $.each(checkinPhp, function (index, value) {
        var ci = value;

        if (ci.tweet != null) {

            ci.displayedTime = ci.tweet.tweet_timestamp*1000;
            if (arrayVenues[ci.venue.id] == null) {
                arrayVenues[ci.venue.id] = new Object();
                arrayVenues[ci.venue.id].checkins = new Array();
                arrayVenues[ci.venue.id].venue = ci.venue;
            }
            arrayVenues[ci.venue.id].checkins[arrayVenues[ci.venue.id].checkins.length] = ci;
        } else {
            ci.displayedTime = -999999;
        }
        lastCheckinReceived = Math.max(lastCheckinReceived, parseInt(ci.checkid));
    });
}

function successCheckinsFlyStartNormal(data,processing) {
    var checkinPhp = data.checkins;
    var countTimeLine=0;

    timeOffset = (new Date()).getTime()/1000-(data.metadata.offset + data.metadata.lastTimeStamp);

   $.each(checkinPhp, function (index, value) {
        var ci = value;
        countTimeLine++;
        if(countTimeLine>280){
            showTweet(ci,false);
        }
        if (ci.tweet != null) {

            var offset = (new Date().getTime() / 1000) - parseInt(ci.tweet.tweet_timestamp) - timeOffset;
            ci.displayedTime = processing.millis()-offset*1000;
            if (arrayVenues[ci.venue.id] == null) {
                arrayVenues[ci.venue.id] = new Object();
                arrayVenues[ci.venue.id].checkins = new Array();
                arrayVenues[ci.venue.id].venue = ci.venue;
            }
            arrayVenues[ci.venue.id].checkins[arrayVenues[ci.venue.id].checkins.length] = ci;
        } else {
            ci.displayedTime = -99999999999;
        }
        lastCheckinReceived = Math.max(lastCheckinReceived, parseInt(ci.checkid));
    });
}

function successCheckinsFlyUpdateNormal(data,processing) {
    checkinPhp = data.checkins;
    $.each(checkinPhp, function (index, value) {

        var ci = value;
        showTweet(ci,true);
        if (ci.tweet != null) {
            var offset = (new Date().getTime() / 1000) - parseInt(ci.tweet.tweet_timestamp) - timeOffset;
            ci.displayedTime = timeEpoch - offset*1000;
                                    

            if (arrayVenues[ci.venue.id] == null) {
                arrayVenues[ci.venue.id] = new Object();
                arrayVenues[ci.venue.id].checkins = new Array();
                arrayVenues[ci.venue.id].venue = ci.venue;
            }
            arrayVenues[ci.venue.id].checkins[arrayVenues[ci.venue.id].checkins.length] = ci;
        } else {
            ci.displayedTime = -99999999;
            
        }
        lastCheckinReceived = Math.max(lastCheckinReceived, parseInt(ci.checkid));
    });

}