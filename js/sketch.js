var sketch = new Processing.Sketch();
sketch.use3DContext = true;
sketch.globalKeyEvents = true;
//sketch.imageCache.add("Madrid.jpg");
var zoom = -500;
var minZoom = -1300;
var maxZoom = 800;
var timeOffset = 0;
var timeframeMode = false;
var timeEpoch = 0;
var timeRunning = 0;
var trendingPlaces = new Array();


sketch.attachFunction = function (processing) {
    
    var madridConfig = {"satImage":'MadridSat.jpg',"mapImage":'MadridMap.jpg',
                        "latN":40.5735,"latS":40.363,"lngW":-3.84,"lngE":-3.495,
                        "mapWidth":2000,"mapHeight":1600,"locationId":1};
    var singaporeConfig = {"satImage":'SingaporeSat.jpg',"mapImage":'SingaporeMap.jpg',
                        "latN":1.48,"latS":1.23,"lngW":103.62,"lngE":104,
                        "mapWidth":2000,"mapHeight":1316,"locationId":2};
    var parisConfig = {"satImage":'ParisSat.jpg',"mapImage":'ParisMap.jpg',
                        "latN":48.909,"latS":48.812,"lngW":2.201,"lngE":2.424,
                        "mapWidth":2000,"mapHeight":1332,"locationId":3};
    var newYorkConfig = {"satImage":'NewYorkSat.jpg',"mapImage":'NewYorkMap.jpg',
                        "latN":40.806035,"latS":40.699695,"lngW":-74.02,"lngE":-73.93361,
                        "mapWidth":1000,"mapHeight":1638,"locationId":4};

    var currentConfig;

    var ciudad = getParameterByName("city");

    if (ciudad == "SIN"){
        currentConfig = singaporeConfig;        
    }else if (ciudad == "MAD"){
        currentConfig = madridConfig;
    }else if (ciudad == "PAR"){
        currentConfig = parisConfig;
    }else if (ciudad == "NYC"){
        currentConfig = newYorkConfig;
    }else{
        currentConfig = madridConfig;
    }


    var umbralTrending = 1;       // Threesold of required checkins to place venue into trending list (would be considered if is greater than this value)
    var tiempoDisolucionGui = 2;  // Time in seconds to fade the GUI
    var guiDisplayedTime = 0;     // When (in ms since load) was the GUI first displayed
    var tex;
    var playIcon;                 
    var satellite=true;           // Flag to switch between map images (true=Satellite, false=Street Map)
    var rotando=false;             // Flag for switching auto-rotation
    var transX;                   // Current translation of the center of the map
    var transY;                   // Current translation of the center of the map
    var rotX = Math.PI / 4;       // Current X-axis rotation of the map (rad)
    var rotY = 0;                 // Current Y-axis rotation of the map (rad)
    var rotZ = 0;                 // Current Z-axis rotation of the map (rad)
    var lastServerRequest = 0;    // When (in ms since load) was the last ajax request
    var fr =10;                   // Rendering framerate
    var lastCheckinReceived = 0;  // Index of the newest checkin received
    var segundosPorVuelta = 60;   // Seconds to rotate the map 360º
    var tiempoCheckin = 3600;     // Seconds during which a checkin is displayed
    var tiempoFlashCheckin = 20;  // Seconds during which a new checkin is highlighted
    var ritmoCambioAltura=5;      // Variation of height per frame when growing or reducing checkins
    var alturaCheckin = 120;      // Initial height of the checkins (when only 1 checkin)
    var tRefresh = 2;             // Seconds to periodically call the server for updates
    var segundosTimeframe = 60;   // Duration in seconds of the 'timeframe' animation
    var timeBetweenTrendingChecks = 500; // Lapse (in ms) betweeen trending places check
    var radiansXRotated = Math.PI; // Rotation in X axis when mouse is dragged across the whole canvas
    var radiansZRotated = Math.PI;

    var timeRate;                 // Relation between real time and timeframe time
    var oldTime;                  // Virtual (timeframe) time last time it was checked
    var oldMillis=0;              // Real time when virtual time was last checked
    var startTime;
    var endTime;
    
    var timeframeFrom = 0;
    var timeframeTo = 0;

    var arrayCheckins = new Array();
    var arrayVenues = new Object();

    var lastNowTrendingMillis = -500;

    var ajaxLock = false;  // Avoids multiple AJAX calls to the same service to be performed

	/* Timeframe Vars */
    var stepsNumber = 360; // Number of steps in the slider;
    
    var informacion = {
        "display": false,"clicked":false
    };



    var checkinPhp;
    var sobre = false;
    var pulsado = false;
    var oldX;
    var oldY;
    var oldRotX;
    var oldRotY;
    var oldRotZ;

    var wasExtended;


    processing.setup = function () {
        if (getParameterByName("timeframe")==("true")){
            if (getParameterByName("from")!=("")&&getParameterByName("to")!=("")){
                
                timeframeFrom=parseInt(getParameterByName("from"));
                timeframeTo=parseInt(getParameterByName("to"));

                ritmoCambioAltura *= 10;

                timeframeMode=true;
                startTime = parseInt(getParameterByName("from"))*1000;
                endTime = parseInt(getParameterByName("to"))*1000;
                timeRate = (endTime-startTime)/(segundosTimeframe*1000);
                oldTime = startTime;
            }
        }


        processing.textMode(processing.SCREEN);
        processing.frameRate(fr);
        sketch.imageCache.add("img/play-rotate.png");
        sketch.imageCache.add("img/pause-rotate.png");
        sketch.imageCache.add("img/mapSat.png");
        sketch.imageCache.add("img/mapStreet.png");
        processing.size(1280, 720, processing.OPENGL);
        transX = 0;
        transY = 0;
        processing.smooth();
        tex = processing.requestImage("img/"+currentConfig.satImage);
        processing.textureMode(processing.NORMALIZED);
        processing.fill(55);
        processing.stroke(processing.color(44, 48, 32));

        if (timeframeMode){
			$( "#progress-bar" ).slider({
            range: "min",
            value: 1,
            min: 1,
            max: stepsNumber,
            slide: function( event, ui ) {
                oldMillis = processing.millis();
                oldTime = processing.map(ui.value,1,360,startTime,endTime);
                //$( "#amount" ).val( "$" + ui.value );
            }
        });
        
            $.ajax({
            url: 'http://orange1.dit.upm.es/checkins-fly.php?locationId='+currentConfig.locationId+'&from='+timeframeFrom+'&to='+timeframeTo,
            dataType: 'json',
            success: function (data) {
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
        });
            
        }else{
            if (!ajaxLock){
                ajaxLock = true;
        $.ajax({
            url: 'http://orange1.dit.upm.es/checkins-fly.php?locationId='+currentConfig.locationId+'&lastCheckin=' + lastCheckinReceived,
            dataType: 'json',
            success: function (data) {
                checkinPhp = data.checkins;
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
            },
            complete: function () {
                ajaxLock = false;
            }
        });
      }
    }
        processing.noStroke();
        processing.switchRotate();
    };
    processing.draw = function () {


        processing.hint(processing.ENABLE_DEPTH_TEST);
        processing.pushMatrix();
        processing.fill(55);
        processing.background(0);
        timeEpoch = processing.currentMillis();
        timeRunning = processing.millis();


        if (timeframeMode){

            
            var date =new Date(timeEpoch+3600*1000);
			
			$("#progress-bar").slider("value", Math.floor(processing.map(timeEpoch,startTime,endTime,1,stepsNumber)));
			
            $("#test").html(date.toString().substring(0,date.toString().indexOf('GMT')));


        }else{
            if (timeEpoch-lastServerRequest>2000) {
                lastServerRequest=timeEpoch;
            updateAllTimes();
            if (!ajaxLock){

                ajaxLock = true;
            $.ajax({
                url: 'http://orange1.dit.upm.es/checkins-fly.php?locationId='+currentConfig.locationId+'&lastCheckin=' + lastCheckinReceived,
                dataType: 'json',
                success: function (data) {
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

                },
                complete: function () {
                    ajaxLock = false;
                }
            });}

        }}
        processing.ambientLight(242, 242, 240);

        

        processing.translate(processing.width/2, processing.width/4,zoom-800); // processing.map(processing.mouseY,0,processing.height,-1000,0) );
        
        processing.rotateX(rotX);
        processing.rotateY(rotY);
        processing.rotateZ(rotZ);

        processing.translate(transX, transY,0); // processing.map(processing.mouseY,0,processing.height,-1000,0) );



        processing.scale(2);



        
        if(rotando){
            rotZ += processing.map(timeRunning-lastRotZIncreaseTime,0,1000*segundosPorVuelta,0,2*Math.PI)%(2*Math.PI);
            lastRotZIncreaseTime = timeRunning;
        }

        processing.textureMode(processing.NORMALIZED);
        processing.beginShape();
        if(tex.width>0&&tex.height>0){
            processing.texture(tex);
            processing.fill(255);
        }

        processing.vertex(-currentConfig.mapWidth/2, -currentConfig.mapHeight/2, 0, 0, 0);
        processing.vertex(currentConfig.mapWidth/2, -currentConfig.mapHeight/2, 0, 1, 0);
        processing.vertex(currentConfig.mapWidth/2, currentConfig.mapHeight/2, 0, 1, 1);
        processing.vertex(-currentConfig.mapWidth/2, currentConfig.mapHeight/2, 0, 0, 1);
        processing.endShape();


        var iter=0;
        listaTrending = new Array();

        $.each(arrayVenues, function (key, value) {
                var minCount = 999999; //TODO remove
                var newestCheckinTime = -9999999;
                var activeCheckins = 0;
                var totalCheckins = 0;
                
                $.each(value.checkins, function (index, val) {
                    if (timeframeMode){
                        if(val != null && val.displayedTime < timeEpoch){
                            if (timeEpoch - val.displayedTime < tiempoCheckin*1000){
                                if (!val.timelined){
                                    
				                 showTweet(val,false);
                                    val.timelined=true;
                                }
                                
                                activeCheckins++;
                                newestCheckinTime = Math.max(newestCheckinTime,val.displayedTime);
                            }
                            
                        }                        

                    }else if (val != null && timeEpoch-val.displayedTime<tiempoCheckin*1000){
                        activeCheckins++;
                        newestCheckinTime = Math.max(newestCheckinTime,val.displayedTime);
                    }
                });
                if (activeCheckins>umbralTrending){
                    listaTrending[iter]=value;
                    listaTrending[iter++].activeCheckins = activeCheckins;
                }
                if (activeCheckins>0||value.altura!=null&&value.altura>0){
                    
                    if (value.altura == null){
                        value.altura = 0;
                    }
                    value.alturaObjetivo= alturaCheckin*(Math.log(activeCheckins+1)/Math.log(2));
                    if (value.altura<value.alturaObjetivo){
                        value.altura=Math.min(value.altura+ritmoCambioAltura,value.alturaObjetivo);
                    }else{
                        value.altura=Math.max(value.altura-ritmoCambioAltura,value.alturaObjetivo);
                    }
                    processing.pushMatrix();
                        var red;
                        var green;
                        var blue;
                    if (processing.currentMillis()-newestCheckinTime < (tiempoFlashCheckin * 1000)) {
                        green = processing.map(processing.currentMillis(), newestCheckinTime, newestCheckinTime+tiempoFlashCheckin*1000, 255,100);
                        red = processing.map(processing.currentMillis(), newestCheckinTime, newestCheckinTime+tiempoFlashCheckin*1000, 0, 255);
                        blue = processing.map(processing.currentMillis(), newestCheckinTime, newestCheckinTime+tiempoFlashCheckin*1000, 0, 50);
                    } else {
                        green = processing.map(processing.currentMillis(),newestCheckinTime+tiempoFlashCheckin*1000,newestCheckinTime+tiempoCheckin*1000, 100, 100);
                        red = processing.map(processing.currentMillis(),newestCheckinTime+tiempoFlashCheckin*1000,newestCheckinTime+tiempoCheckin*1000, 255, 100);
                        blue = processing.map(processing.currentMillis(),newestCheckinTime+tiempoFlashCheckin*1000,newestCheckinTime+tiempoCheckin*1000, 50, 255);
                    }
                    if(extended){
                        if(green>100 && !informacion.clicked){
                            informacion.venue=key;
                            informacion.display=true;    
                            wasExtended=true;
                        }else{
                            if(!informacion.clicked){
                            informacion.display=false;
                            }
                        }

                    }else{
                        if(wasExtended==true){
                            wasExtended==false;
                            informacion.display=false;
                        }
                    }
                    processing.shininess(15.0);
                    processing.fill(red, green, blue, 180);
                    if (value.mouseSobre) {
                        processing.fill(240, 130);
                        if (pulsado) {
                            informacion.display = true;
                            informacion.clicked =true;
                            informacion.venue = key;
                            processing.fill(100);
                        }
                    }
                    processing.translate(processing.map(value.venue.location.lng, currentConfig.lngW, currentConfig.lngE, -currentConfig.mapWidth/2, currentConfig.mapWidth/2), 
                                         processing.map(value.venue.location.lat, currentConfig.latS, currentConfig.latN, currentConfig.mapHeight/2, -currentConfig.mapHeight/2), 0);
                    if (informacion.display && informacion.venue == key) {
                        informacion.x = processing.screenX(0, 0, value.altura);
                        informacion.y = processing.screenY(0, 0, value.altura);
                        informacion.z = processing.screenZ(0, 0, value.altura);
                    }       
                    var ladoCheckin = 7*Math.log(15/processing.map(zoom+300,minZoom,maxZoom,0.5,7));
                    processing.dibujaCheckin(ladoCheckin, value.altura, value);
                    value.active = true;
                    processing.popMatrix();
                }
                 else {
                    value.active = false;
                }                
        });

        /*Capa en "2D" para información y GUI */
        processing.popMatrix();
        processing.pushMatrix();
        processing.hint(processing.DISABLE_DEPTH_TEST);        

        if(processing.millis()-guiDisplayedTime<tiempoDisolucionGui*1000){
			playIcon = processing.loadImage("img/play-rotate.png");
            pauseIcon = processing.loadImage("img/pause-rotate.png");
            satIcon = processing.loadImage("img/mapSat.png");
            streetIcon = processing.loadImage("img/mapStreet.png");          
            processing.fill(255,processing.map(processing.millis(),guiDisplayedTime,guiDisplayedTime+tiempoDisolucionGui*1000,255,0));
            if((processing.resizedMouseX()<75&&processing.resizedMouseY()<75)){	
				guiDisplayedTime=processing.millis();
			}			
            if(satellite){
				processing.image(streetIcon,5,5,70,70);
			}else{
				processing.image(satIcon,5,5,70,70);
			}
            processing.fill(255,processing.map(processing.millis(),guiDisplayedTime,guiDisplayedTime+tiempoDisolucionGui*1000,255,0));
			if((processing.resizedMouseX()>processing.width-95&&processing.resizedMouseY()<95)){
			    guiDisplayedTime=processing.millis();
			}
            if(rotando){
				processing.image(pauseIcon,processing.width-95,5,90,90);			
            }else{      
                processing.image(playIcon,processing.width-95,5,90,90);
            }
            
         }        
        if (informacion.display) {
            processing.translate(informacion.x, informacion.y, 0);

            processing.fill(240, 120);
            processing.rect(30, 0, processing.textWidth(arrayVenues[informacion.venue].venue.name) + 10, 30);

            var fontA = processing.createFont("arial");
            processing.textFont(fontA, 22);

            processing.fill(0);
            processing.text(unescape(arrayVenues[informacion.venue].venue.name), 40, 15 );
        }


        trendingPlaces = listaTrending.sort(ordenarPorNumeroCheckins).slice(0,Math.min(listaTrending.length,10));
        if (trendingPlaces.length>0){
            if (processing.millis()-lastNowTrendingMillis>timeBetweenTrendingChecks){
                nowTrending();
                lastNowTrendingMillis = processing.millis();
            }
            
        }



    };
    processing.mousePressed = function () {
        pulsado = true;
        oldX = processing.resizedMouseX();
        oldY = processing.resizedMouseY();
        oldRotX = rotX;
        oldRotZ = rotZ;
        if(processing.resizedMouseX()>processing.width-95&&processing.resizedMouseY()<95){
            processing.switchRotate();
        }
        if(processing.resizedMouseX()<75&&processing.resizedMouseY()<75){
         processing.cambiaMapa();
        }
        if(informacion.display)
           informacion.display=false;
           if(extended){
                informacion.clicked=false;
            }
        
    };
    processing.mouseReleased = function () {
        pulsado = false;
    };
    processing.mouseDragged = function () {
        var zVariation;
        if (processing.resizedMouseX() > oldX) {
            //rotZ = processing.map(processing.resizedMouseX(), oldX, processing.width, oldRotZ, Math.PI *2);
            zVariation = processing.map(processing.resizedMouseX()-oldX,0,processing.width,0,radiansZRotated);
            oldX = processing.resizedMouseX();

        } else {
            //rotZ = processing.map(processing.resizedMouseX(), 0, oldX, 0, oldRotZ);
            zVariation = -processing.map(oldX-processing.resizedMouseX(),0,processing.width,0,radiansZRotated);
            oldX = processing.resizedMouseX();

        }
        if (processing.resizedMouseY()>=processing.height/2){
            rotZ -= zVariation;
        }else{
            rotZ += zVariation;
        }
        if (processing.resizedMouseY() > oldY) {
            //rotX = processing.map(processing.mouseY, oldY, processing.height, oldRotX, 0);
            rotX = Math.max(0,rotX-processing.map(processing.resizedMouseY()-oldY,0, processing.height,
                                                                                   0, radiansXRotated ));
            oldY = processing.resizedMouseY();
        } else {
            //rotX = processing.map(processing.mouseY, 0, oldY, Math.PI / 3, oldRotX);
            rotX = Math.min(Math.PI/3,rotX+processing.map(oldY-processing.resizedMouseY(),0, processing.height,
                                                                                0, radiansXRotated ));
            oldY = processing.resizedMouseY();

        }
    };

    processing.mouseMoved = function () {
        guiDisplayedTime=processing.millis();
        var p = {
            "x": processing.resizedMouseX(),
            "y": processing.resizedMouseY()
        };
        
        $.each(arrayVenues, function (key, value) {
            if (value.v1 != null && value.v2 != null && value.v3 != null) {
                var mouseSobre = false;
                var trig = 0;
                for (var va = 1; va <= 8; va++) {
                    for (var vb = 2; vb <= 8 && vb != va; vb++) {
                        for (var vc = 3; vc < 8 && vc != va && vc != vb; vc++) {
                            mouseSobre |= dentroTriangulo(p, value["v" + va], value["v" + vb], value["v" + vc]);
                        }
                    }
                }
                value.mouseSobre = mouseSobre;
            }
        });

    };

    processing.keyPressed = function() {
      if (processing.keyCode == processing.UP) {
         transX = Math.min(2000, transX + 20*Math.sin(rotZ));
         transY = Math.min(2000, transY + 20*Math.cos(rotZ));
      }
      if (processing.keyCode == processing.DOWN) {
         transX = Math.max(-2000, transX - 20*Math.sin(rotZ));
         transY = Math.max(-2000, transY - 20*Math.cos(rotZ));
      }
      if (processing.keyCode == processing.LEFT) {
         transX = Math.min(2000, transX + 20*Math.cos(rotZ));
         transY = Math.max(-2000, transY - 20*Math.sin(rotZ));
      }
      if (processing.keyCode == processing.RIGHT) {
         transX = Math.max(-2000, transX - 20*Math.cos(rotZ));
         transY = Math.min(2000, transY + 20*Math.sin(rotZ));
      }
    };

    processing.resizedMouseX = function() {
        return Math.floor(processing.mouseX*1280/canvas.clientWidth);
        

    };

    processing.resizedMouseY = function() {
        return Math.floor(processing.mouseY*720/canvas.clientHeight);
        
    };

    processing.cambiaMapa = function() {
       if (satellite){
          tex = processing.requestImage("img/"+currentConfig.mapImage);
          satellite=false;
       }else{
          tex = processing.requestImage("img/"+currentConfig.satImage);
          satellite=true;
       }
    };

    processing.switchRotate = function() {
       if (!rotando){
           lastRotZIncreaseTime=processing.millis();
           rotando=true;
       }else{
           rotando=false;
       }
    };

    processing.currentMillis = function(){
        if (!timeframeMode){
            return processing.millis();
        }else{
            
            var lapse = processing.millis()-oldMillis;
            oldMillis += lapse;
            oldTime += lapse*timeRate;

            if (oldTime < startTime){
                oldTime = startTime;
            }else if (oldTime > endTime){
                oldTime = endTime;
            }

            return oldTime;
        }
    };

    processing.dibujaCheckin = function (lado, altura, venue) {
        x1 = -lado / 2;
        x2 = lado / 2;
        y1 = -lado / 2;
        y2 = lado / 2;
        z1 = 0;
        z2 = altura;
        var vertices = [
            [x1, y1, z1],
            [x1, y1, z2],
            [x1, y2, z2],
            [x1, y2, z1],
            [x2, y2, z1],
            [x2, y2, z2],
            [x2, y1, z2],
            [x2, y1, z1]
        ];
        processing.beginShape(processing.QUADS);
        processing.vertex(x1, y1, z1);
        processing.vertex(x1, y1, z2);
        processing.vertex(x1, y2, z2);
        processing.vertex(x1, y2, z1);
        processing.vertex(x1, y2, z2);
        processing.vertex(x1, y2, z1);
        processing.vertex(x2, y2, z1);
        processing.vertex(x2, y2, z2);
        processing.vertex(x2, y2, z1);
        processing.vertex(x2, y2, z2);
        processing.vertex(x2, y1, z2);
        processing.vertex(x2, y1, z1);
        processing.vertex(x2, y1, z2);
        processing.vertex(x2, y1, z1);
        processing.vertex(x1, y1, z1);
        processing.vertex(x1, y1, z2);
        processing.vertex(x1, y1, z2);
        processing.vertex(x1, y2, z2);
        processing.vertex(x2, y2, z2);
        processing.vertex(x2, y1, z2);
        processing.endShape(processing.CLOSE);
        venue.v1 = {
            "x": processing.screenX(x1, y1, z1),
            "y": processing.screenY(x1, y1, z1)
        };
        venue.v2 = {
            "x": processing.screenX(x1, y1, z2),
            "y": processing.screenY(x1, y1, z2)
        };
        venue.v3 = {
            "x": processing.screenX(x1, y2, z1),
            "y": processing.screenY(x1, y2, z1)
        };
        venue.v4 = {
            "x": processing.screenX(x1, y2, z2),
            "y": processing.screenY(x1, y2, z2)
        };
        venue.v5 = {
            "x": processing.screenX(x2, y1, z1),
            "y": processing.screenY(x2, y1, z1)
        };
        venue.v6 = {
            "x": processing.screenX(x2, y1, z2),
            "y": processing.screenY(x2, y1, z2)
        };
        venue.v7 = {
            "x": processing.screenX(x2, y2, z1),
            "y": processing.screenY(x2, y2, z1)
        };
        venue.v8 = {
            "x": processing.screenX(x2, y2, z2),
            "y": processing.screenY(x2, y2, z2)
        };







    };

};

function handle(delta) {
    var s = delta + ": ";
    if (delta < 0) zoom = Math.max(minZoom, zoom-10);
    else zoom = Math.min(maxZoom, zoom+10);
}

function wheel(event) {
    event.preventDefault();
    var delta = 0;
    if (!event) event = window.event;
    if (event.wheelDelta) {
        delta = event.wheelDelta / 120;
        if (window.opera) delta = -delta;
    } else if (event.detail) {
        delta = -event.detail / 3;
    }
    if (delta) handle(delta);
}


var canvas = document.getElementById("canvas");
canvas.onselectstart = function () { return false; } // Prevents selecting text when dragging or double-clicking
var p = new Processing(canvas, sketch); /* Initialization code. */
if (canvas.addEventListener) canvas.addEventListener('DOMMouseScroll', wheel, false);
canvas.onmousewheel = wheel;


function dentroTriangulo(p, a, b, c) {
    if (xProd(p, a, b) * xProd(p, b, c) > 0 && xProd(p, b, c) * xProd(p, c, a) > 0) {
        return true;
    } else {
        return false;
    }
}

function xProd(p, v1, v2) {
    return (eval((p.y - v1.y) * (v2.x - v1.x) - (p.x - v1.x) * (v2.y - v1.y)));
}

function ordenarPorNumeroCheckins(a,b){
    if(a.activeCheckins<b.activeCheckins){
        return 1;
    }if (a.activeCheckins>b.activeCheckins){
        return -1;
    }return 0;
}

function getParameterByName(name)
{
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.href);
  if(results == null)
    return "";
  else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
}
