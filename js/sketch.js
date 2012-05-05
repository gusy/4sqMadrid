var sketch = new Processing.Sketch();
sketch.use3DContext = true;
sketch.globalKeyEvents = true;
var zoom = -300;
var minZoom = -1000;
var maxZoom = 1200;
var timeOffset = 0;
var timeframeMode = false;
var timeEpoch = 0;
var timeRunning = 0;
var trendingPlaces = new Array();


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
var timeframePause = true;

var arrayCheckins = new Array();
var arrayVenues = new Object();

var lastNowTrendingMillis = -500;

var ajaxLock = false;  // Avoids multiple AJAX calls to the same service to be performed

/* Timeframe Vars */
var stepsNumber = 360; // Number of steps in the slider;

var informacion = {
    "display": false,"clicked":false
};


var overGui = false;

var checkinPhp;
var sobre = false;
var pulsado = false;
var oldX;
var oldY;
var oldRotX;
var oldRotY;
var oldRotZ;

var wasExtended;

var map_imgs;
var imgs_x=4;
var imgs_y=3;

var rightBound;
var bottomBound;

var currentConfig;


var infoBoxEnabled = false;





/* CITYGRID API VARIABLES */
var thumbMaxHeight = 150;
var thumbMaxWidth = 150;


sketch.attachFunction = function (processing) {
    
    var madridConfig = {"latN":40.5735,"latS":40.363,"lngW":-3.84,"lngE":-3.495,
                        "locationId":1};
    var singaporeConfig = {"latN":1.48,"latS":1.23,"lngW":103.62,"lngE":104,
                        "locationId":2};
    var parisConfig = {"latN":48.909,"latS":48.812,"lngW":2.201,"lngE":2.424,
                        "locationId":3};
    var newYorkConfig = {"latN":40.806035,"latS":40.699695,"lngW":-74.02,"lngE":-73.93361,
                        "locationId":4};
    var sevilleConfig = {"latN":37.4394,"latS":37.3369,"lngW":-6.0486,"lngE":-5.8863,
                        "locationId":5};
    var bostonConfig = {"latN":42.38,"latS":42.325,"lngW":-71.14,"lngE":-71,
                        "locationId":6};




    var ciudad = getParameterByName("city");

    if (ciudad == "SIN"){
        currentConfig = singaporeConfig;
        currentConfig.cityGrid = false;        
    }else if (ciudad == "MAD"){
        currentConfig = madridConfig;
        currentConfig.cityGrid = false;        
    }else if (ciudad == "PAR"){
        currentConfig = parisConfig;
        currentConfig.cityGrid = false;        
    }else if (ciudad == "NYC"){
        currentConfig = newYorkConfig;
        tiempoCheckin = 1800;
        currentConfig.cityGrid = true;        
    }else if (ciudad == "SVQ"){
        currentConfig = sevilleConfig;
        currentConfig.cityGrid = false;        
    }else if (ciudad == "BOS"){
        currentConfig = bostonConfig;
        currentConfig.cityGrid = true;        
    }else{
        currentConfig = madridConfig;
    }



    


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

        processing.loadMapImages();


        processing.smooth();
        processing.textureMode(processing.NORMALIZED);
        processing.fill(55);
        processing.stroke(processing.color(44, 48, 32));
        $("#arrows").onselectstart = function () { return false; };
        $( "#zoom-bar" ).slider({
            value: zoom,
            min: minZoom,
            max: maxZoom,
            orientation: "vertical",
            slide: function( event, ui ) {
                zoom = ui.value;
            }
        });

        $("#arrowUp").mousehold(function(){
          transX = Math.min(2000, transX + 20*Math.sin(rotZ));
          transY = Math.min(2000, transY + 20*Math.cos(rotZ));
        });
        $("#arrowRight").mousehold(function(){
          transX = Math.max(-2000, transX - 20*Math.cos(rotZ));
         transY = Math.min(2000, transY + 20*Math.sin(rotZ));
        });
        $("#arrowDown").mousehold(function(){
          transX = Math.max(-2000, transX - 20*Math.sin(rotZ));
         transY = Math.max(-2000, transY - 20*Math.cos(rotZ));
        });
        $("#arrowLeft").mousehold(function(){
         transX = Math.min(2000, transX + 20*Math.cos(rotZ));
         transY = Math.max(-2000, transY - 20*Math.sin(rotZ));
        });
        //$(".gui-mouse").mouseover(function(){overGui=true;$(".gui-visible").fadeIn(500);}).mouseout(function(){$(".gui-visible").fadeOut(500);overGui=false;});


        if (timeframeMode){
            $("#timeframeWrapper").show();
            $("#timeframePlayButton").click(function(){
                processing.switchTimeframePause();
            });
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
            success: function (data){successCheckinsFlyStartTimeframe(data,processing)},
            complete: function () {
                processing.switchTimeframePause();
            }
        });
            
        }else{
            if (!ajaxLock){
                ajaxLock = true;
        $.ajax({
            url: 'http://orange1.dit.upm.es/checkins-fly.php?locationId='+currentConfig.locationId+'&lastCheckin=' + lastCheckinReceived,
            dataType: 'json',
            success: function (data){successCheckinsFlyStartNormal(data,processing)},
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
        processing.canvasAdjustment();



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
                success: function(data){successCheckinsFlyUpdateNormal(data,processing)},
                complete: function () {
                    ajaxLock = false;
                }
            });}

        }}
        /* Lights and Effects */
        processing.ambientLight(255,255,255);



        /* Translate and Scale */   
        processing.translate(processing.width/2, processing.width/4,zoom-800); // processing.map(processing.mouseY,0,processing.height,-1000,0) );
        
        processing.rotateX(rotX);
        processing.rotateY(rotY);
        processing.rotateZ(rotZ);

        processing.translate(transX, transY,0); 

        processing.scale(2);



        /* Increasing Rotation for Next Frame */

        
        if(rotando){
            rotZ += processing.map(timeRunning-lastRotZIncreaseTime,0,1000*segundosPorVuelta,0,2*Math.PI)%(2*Math.PI);
            lastRotZIncreaseTime = timeRunning;
        }
        

        /* Drawing Map */
        for (iter_x=0;iter_x<imgs_x;iter_x++){
            for (iter_y=0;iter_y<imgs_y;iter_y++){
                tex = map_imgs[iter_x][iter_y];
                processing.textureMode(processing.NORMALIZED);
                processing.beginShape();

                    if(tex.width>0&&tex.height>0){
                        processing.fill(255); // Fills in white to drow bright Textures if image is loaded
                        processing.texture(tex);

                    }
                    processing.vertex(Math.min(-currentConfig.mapWidth/2+(iter_x*320),currentConfig.mapWidth/2),
                                      Math.min(-currentConfig.mapHeight/2+(iter_y*320),currentConfig.mapHeight/2), 0, 0, 0);
                    processing.vertex(Math.min(-currentConfig.mapWidth/2+320+(iter_x*320),currentConfig.mapWidth/2),
                                      Math.min(-currentConfig.mapHeight/2+(iter_y*320),currentConfig.mapHeight/2), 0, 1, 0);
                    processing.vertex(Math.min(-currentConfig.mapWidth/2+320+(iter_x*320),currentConfig.mapWidth/2),
                                      Math.min(-currentConfig.mapHeight/2+320+(iter_y*320),currentConfig.mapHeight/2), 0, 1, 1);
                    processing.vertex(Math.min(-currentConfig.mapWidth/2+(iter_x*320),currentConfig.mapWidth/2),
                                      Math.min(-currentConfig.mapHeight/2+320+(iter_y*320),currentConfig.mapHeight/2), 0, 0, 1);
                processing.endShape();
                processing.fill(55); // Reset Filling color for unloaded textures
            }
        }        

        /* Drawing Prismas */

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
                                    
				                // showTweet(val,false);
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

                    processing.translate(processing.map(value.venue.location.lng, currentConfig.lngW, currentConfig.lngE, -currentConfig.mapWidth/2, currentConfig.mapWidth/2), 
                                         processing.map(value.venue.location.lat, currentConfig.latS, currentConfig.latN, currentConfig.mapHeight/2, -currentConfig.mapHeight/2), 0);
                    if (informacion.display && informacion.venue == key) {
                        informacion.x = processing.screenX(0, 0, value.altura);
                        informacion.y = processing.screenY(0, 0, value.altura);
                        informacion.z = processing.screenZ(0, 0, value.altura);
                    }

                    if (value.mouseSobre) {
                        processing.fill(240, 130);
                        // If you pressed the mouse over a Prisma.
                        if (pulsado) {
                            showInfo(value.venue,processing.screenX(0, 0, value.altura),processing.screenY(0, 0, value.altura),processing);
                            pulsado = false;
                            /*
                            informacion.display = true;
                            informacion.clicked =true;
                            informacion.venue = key;
                            processing.fill(100);
                            */
                        }
                    }      
                    var ladoCheckin = 5*Math.log(15/processing.map(zoom+300,minZoom,maxZoom,0.5,7));
                    processing.dibujaCheckin(ladoCheckin, value.altura, value);
                    value.active = true;
                    processing.popMatrix();
                }
                 else {
                    value.active = false;
                }                
        });

        /* 2D Layer for GUI and Info */

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
			if((processing.resizedMouseX()>rightBound-95&&processing.resizedMouseY()<95)){
			    guiDisplayedTime=processing.millis();
			}
            if(rotando){
				processing.image(pauseIcon,rightBound-95,5,90,70);			
            }else{      
                processing.image(playIcon,rightBound-95,5,90,70);
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
        if(processing.resizedMouseX()>rightBound-95&&processing.resizedMouseY()<95){
            processing.switchRotate();
        }
        if(processing.resizedMouseX()<75&&processing.resizedMouseY()<75){
         processing.cambiaMapa();
        }
        if (infoBoxEnabled){
            hideInfo(processing);
        }


        //TODO remove from here
        if(informacion.display)
           informacion.display=false;
           if(extended){
                informacion.clicked=false;
            }

        //TODO remove to here


        
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
        if(!overGui){
        //$(".gui-visible").stop(true,true);
        //$(".gui-visible").fadeIn(500).delay(300).fadeOut(500,function(){$(".gui-visible").clearQueue();});
        }

        guiDisplayedTime=processing.millis();

        var p = {
            "x": processing.resizedMouseX(),
            "y": processing.resizedMouseY()
        };
        
        $.each(arrayVenues, function (key, value) {
            if (value.v1 != null && value.v2 != null && value.v3 != null){
                var mouseSobre = false;

                var xMax = Math.max(value.v1.x,value.v2.x,value.v3.x,value.v4.x,
                                    value.v5.x,value.v6.x,value.v7.x,value.v8.x);
                var xMin = Math.min(value.v1.x,value.v2.x,value.v3.x,value.v4.x,
                                    value.v5.x,value.v6.x,value.v7.x,value.v8.x);
                var yMax = Math.max(value.v1.y,value.v2.y,value.v3.y,value.v4.y,
                                    value.v5.y,value.v6.y,value.v7.y,value.v8.y);
                var yMin = Math.min(value.v1.y,value.v2.y,value.v3.y,value.v4.y,
                                    value.v5.y,value.v6.y,value.v7.y,value.v8.y);

            
                if (xMax>=p.x&&xMin<=p.x&&yMax>=p.y&&yMin<=p.y) {
                    
                    var trig = 0;
                    for (var va = 1; va <= 8; va++) {
                        for (var vb = 2; vb <= 8 && vb != va; vb++) {
                            for (var vc = 3; vc < 8 && vc != va && vc != vb; vc++) {
                                mouseSobre |= dentroTriangulo(p, value["v" + va], value["v" + vb], value["v" + vc]);
                            }
                        }
                    }}
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
        return Math.floor(processing.mouseX*canvas.width/canvas.clientWidth);
        

    };

    processing.resizedMouseY = function() {
        return Math.floor(processing.mouseY*canvas.height/canvas.clientHeight);
        
    };

    processing.cambiaMapa = function() {
       if (satellite){
          satellite=false;
          processing.loadMapImages();
       }else{
          satellite=true;
          processing.loadMapImages();
       }
       
    };

    processing.loadMapImages = function() {
       var mapZoom = getZoom(currentConfig.latS,currentConfig.latN,currentConfig.lngW,currentConfig.lngE,9);
       currentConfig.mapWidth = getMapWidth(currentConfig.lngW,currentConfig.lngE,mapZoom);
       currentConfig.mapHeight = getMapHeight(currentConfig.latS,currentConfig.latN,mapZoom);
       imgs_x = getXPicsNumber(currentConfig.lngW,currentConfig.lngE,mapZoom);
       imgs_y = getYPicsNumber(currentConfig.latS,currentConfig.latN,mapZoom);

       map_imgs=new Array(imgs_x);
       var lastWidth = Math.ceil(currentConfig.mapWidth-640*(imgs_x-1));
       var lastHeight = Math.ceil(currentConfig.mapHeight-640*(imgs_y-1));
       var tipo = "roadmap"
       if (satellite){
        tipo="satellite";
       }


       for (iter_x = 0; iter_x<imgs_x; iter_x++){
        var currentWidth = 640;
            map_imgs[iter_x] = new Array(imgs_y);
            if(iter_x == imgs_x-1){
              currentWidth=lastWidth;
              var centerLong = currentConfig.lngW+getLongOffset(320+(iter_x-1)*640+320+lastWidth/2,mapZoom);
            }else{
              var centerLong = currentConfig.lngW+getLongOffset(320+iter_x*640,mapZoom);
            }
          for (iter_y = 0; iter_y<imgs_y;iter_y++){
            if (iter_y==imgs_y-1){
                var centerLat = currentConfig.latN+getLatOffset(currentConfig.latN,-320-(iter_y-1)*640-320-lastHeight/2,mapZoom);
                map_imgs[iter_x][iter_y]=processing.requestImage("proxy.php?url=http%3A%2F%2Fmaps.google.com%2Fmaps%2Fapi%2Fstaticmap%3Fcenter%3D"+centerLat+"%2C"+centerLong+"%26zoom%3D"+mapZoom+"%26size%3D"+currentWidth+"x"+lastHeight+"%26scale%3D1%26sensor%3Dfalse%26maptype%3D"+tipo+"%26format%3Djpeg&mimeType=image%2Fjpeg");

            }else{ 
                var centerLat = currentConfig.latN+getLatOffset(currentConfig.latN,-320-iter_y*640,mapZoom);
                map_imgs[iter_x][iter_y]=processing.requestImage("proxy.php?url=http%3A%2F%2Fmaps.google.com%2Fmaps%2Fapi%2Fstaticmap%3Fcenter%3D"+centerLat+"%2C"+centerLong+"%26zoom%3D"+mapZoom+"%26size%3D"+currentWidth+"x640%26scale%3D1%26sensor%3Dfalse%26maptype%3D"+tipo+"%26format%3Djpeg&mimeType=image%2Fjpeg");

            }
          }      

       }
       currentConfig.mapWidth = currentConfig.mapWidth/2;
       currentConfig.mapHeight = currentConfig.mapHeight/2;

    }

    processing.switchRotate = function() {
       if (!rotando){
           lastRotZIncreaseTime=processing.millis();
           rotando=true;
       }else{
           rotando=false;
       }
    };

    processing.switchTimeframePause = function() {
        timeframePause = !timeframePause;
        if (timeframePause){
            $('#timeframePlayButton').css("background-image", "url(img/play-button-bottom.png)"); 
            $('#timeframePlayButton').hover( function(){
              $(this).css("background-image", "url(img/play-button-bottom-hover.png)");
                },
                function(){
              $(this).css("background-image", "url(img/play-button-bottom.png)");
            }); 
        }else{
            $('#timeframePlayButton').css("background-image", "url(img/pause-button-bottom.png)"); 
            $('#timeframePlayButton').hover( function(){
              $(this).css("background-image", "url(img/pause-button-bottom-hover.png)");
                },
                function(){
              $(this).css("background-image", "url(img/pause-button-bottom.png)");
            });         }
    }

    processing.currentMillis = function(){
        if (!timeframeMode){
            return processing.millis();
        }else{
            var lapse;
            if (timeframePause){
                lapse = 0;
            }else{
                lapse = processing.millis()-oldMillis;
            } 
            oldMillis = processing.millis();
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

    processing.canvasAdjustment = function(){
        if ($("#canvas-wrapper").height()*1280/720< $("#canvas-wrapper").width()){
            $("#canvas").css("width","100%");
            $("#canvas").css("height","");
            rightBound = 1280;
            bottomBound = $("#canvas-wrapper").height()*1280/$("#canvas-wrapper").width();
        }else{
            $("#canvas").css("height","100%");
            $("#canvas").css("width","");
            rightBound = $("#canvas-wrapper").width()*720/$("#canvas-wrapper").height();
            bottomBound = 720;
        }

    };

};

function handle(delta) {
    var s = delta + ": ";
    if (delta < 0) zoom = Math.max(minZoom, zoom-10);
    else zoom = Math.min(maxZoom, zoom+10);
    $( "#zoom-bar" ).slider("value",zoom);
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
