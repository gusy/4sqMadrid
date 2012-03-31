function getXPicsNumber(minLong,maxLong,zoom){
	var x_pics_number = Math.ceil(getMapWidth(minLong,maxLong,zoom)/640);
	return x_pics_number;
}

function getYPicsNumber(minLat,maxLat,zoom){
	return Math.ceil(getMapHeight(minLat,maxLat,zoom)/640);	
}

function getMapWidth(minLong,maxLong,zoom){
	var mapWidth=getWorldWidth(zoom)*(maxLong-minLong)/360;
	return mapWidth;
}

function getMapHeight(minLat,maxLat,zoom){
	var maxRadMercatorY = Math.log((1+Math.sin(maxLat*Math.PI/180))/
	                            (1-Math.sin(maxLat*Math.PI/180)))/2;
	var minRadMercatorY = Math.log((1+Math.sin(minLat*Math.PI/180))/
	                            (1-Math.sin(minLat*Math.PI/180)))/2;
	var mercatorRadHeight = maxRadMercatorY-minRadMercatorY;
	var mercatorPixelHeight = getWorldHeight(zoom)*mercatorRadHeight/(2*Math.PI);
	return mercatorPixelHeight;
}

function getLongOffset(pixelOffset,zoom){
	longOffset=pixelOffset*360/(getWorldWidth(zoom));
	return longOffset;
}

function getLatOffset(lat,pixelOffset,zoom){
	var radMercatorY = Math.log((1+Math.sin(lat*Math.PI/180))/
	                            (1-Math.sin(lat*Math.PI/180)))/2;
	var radMercatorOffset = radMercatorY+(pixelOffset*2*Math.PI/getWorldHeight(zoom));
	var radLatOffset = Math.asin((Math.exp(2*radMercatorOffset)-1)/(Math.exp(2*radMercatorOffset)+1));
	var degLatOffset = 180*radLatOffset/Math.PI;
	return degLatOffset-lat;

}

function getZoom(minLat,maxLat,minLong,maxLong,maxPics){
	for (zoom=0;zoom<20;zoom++){
		xPics = getXPicsNumber(minLong,maxLong,zoom);
		yPics = getYPicsNumber(minLat,maxLat,zoom);
		if(xPics+yPics>maxPics) return zoom-1;
	}
	return 20;
	
}

function getWorldWidth(zoom){
	var worldWidth = Math.pow(2,zoom)*256;
	return worldWidth;
}

function getWorldHeight(zoom){
	return Math.pow(2,zoom)*256;
}