
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
var trendingPlaces = new Array();


sketch.attachFunction = function (processing) {
    /* @pjs globalKeyEvents="true"; */
    var tiempoGui = 2;
    
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


    var umbralTrending = 1;
    var tiempoDisolucionGui = 1;
    var contadorGui = 0;
    var tex;
    var playIcon;
    var satellite=true;
    var rotando=true;
    var transX; //= processing.width/2;
    var transY; //= processing.height/2;
    var rotX = Math.PI / 4;
    var rotY = 0;
    var rotZ = 0;
    var i = 1;
    var fr =10;
    var lastCheckinReceived = 0;
    var segundosPorVuelta = 60;
    var iArray = 0;
    var tiempoCheckin = 3600;
    var tiempoFlashCheckin = 20;
    var ritmoCambioAltura=5;
    var ladoCheckin = 15;
    var alturaInicialCheckin = 150;
    var alturaCheckin = 120;
    var tRefresh = 2;
    var segundosTimeframe = 60;
    
    var timeframeFrom = 0;
    var timeframeTo = 0;

    var arrayCheckins = new Array();
    var arrayVenues = new Object();

    var lastNowTrendingMillis = -500;


    var informacion = {
        "display": false,"clicked":false
    };



    var checkinPhp;
    //i
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
                timeframeMode=true;
                ritmoCambioAltura *= 5;
                timeEpoch = processing.map(processing.millis(),0,1000*segundosTimeframe,timeframeFrom,timeframeTo);
            }
        }


        processing.textMode(processing.SCREEN);
        processing.frameRate(fr);
        sketch.imageCache.add("img/play2.png");
        sketch.imageCache.add("img/pause2.png");
        sketch.imageCache.add("img/mapSat.png");
        sketch.imageCache.add("img/mapStreet.png");
        processing.size(1280, 720, processing.OPENGL);
        //processing.hint(processing.ENABLE_OPENGL_4X_SMOOTH);

        transX = 0;
        transY = 0;
        processing.smooth();
        tex = processing.requestImage("img/"+currentConfig.satImage);

        processing.textureMode(processing.NORMALIZED);
        processing.fill(55);
        processing.stroke(processing.color(44, 48, 32));


        if (timeframeMode){
            $.ajax({
            url: 'http://orange1.dit.upm.es/checkins-fly.php?locationId='+currentConfig.locationId+'&from='+timeframeFrom+'&to='+timeframeTo,
            dataType: 'json',
            success: function (data) {
                checkinPhp = data.checkins;


               $.each(checkinPhp, function (index, value) {
                    var ci = value;
              
                    if (ci.tweet != null) {

                        ci.count = 999999;
                        ci.dateAppear = parseInt(ci.tweet.tweet_timestamp);
                        if (arrayVenues[ci.venue.id] == null) {
                            arrayVenues[ci.venue.id] = new Object();
                            arrayVenues[ci.venue.id].checkins = new Array();
                            arrayVenues[ci.venue.id].venue = ci.venue;
                        }
                        arrayVenues[ci.venue.id].checkins[arrayVenues[ci.venue.id].checkins.length] = ci;
                    } else {
                        // alert(ci.checkid);
                        ci.count = 0;
                    }
                    //arrayCheckins[arrayCheckins.length] = ci;
                    lastCheckinReceived = Math.max(lastCheckinReceived, parseInt(ci.checkid));
                });
            }
        });
            
        }else{
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
                        ci.count = Math.floor(offset) * fr;
                        if (arrayVenues[ci.venue.id] == null) {
                            arrayVenues[ci.venue.id] = new Object();
                            arrayVenues[ci.venue.id].checkins = new Array();
                            arrayVenues[ci.venue.id].venue = ci.venue;
                        }
                        arrayVenues[ci.venue.id].checkins[arrayVenues[ci.venue.id].checkins.length] = ci;
                    } else {
                        // alert(ci.checkid);
                        ci.count = 0;
                    }
                    //arrayCheckins[arrayCheckins.length] = ci;
                    lastCheckinReceived = Math.max(lastCheckinReceived, parseInt(ci.checkid));
                });
            }
        });}
        processing.noStroke();


    };


    processing.draw = function () {


        processing.hint(processing.ENABLE_DEPTH_TEST);
        processing.pushMatrix();
        processing.fill(55);
        processing.background(0);


        if (timeframeMode){

            timeEpoch = Math.min(timeframeTo,processing.map(processing.millis(),0,1000*segundosTimeframe,timeframeFrom,timeframeTo));
        
            var date=new Date(Math.floor(timeEpoch)*1000+3600*1000)

            $("#test").html(date.toString().substring(0,date.toString().indexOf('GMT')));


        }else{
            if (i % (fr * tRefresh) == 0) {
            updateAllTimes();
            $.ajax({
                url: 'http://orange1.dit.upm.es/checkins-fly.php?locationId='+currentConfig.locationId+'&lastCheckin=' + lastCheckinReceived,
                dataType: 'json',
                success: function (data) {
                    checkinPhp = data.checkins;
                    $.each(checkinPhp, function (index, value) {

                        var ci = value;
                        showTweet(ci,true);
                        if (ci.tweet != null) {
                            //var dated = new Date();
                            //var offset = (dated.getTime()/1000)-parseInt(ci.tweet.tweet_timestamp)-3600;
                            var offset = (new Date().getTime() / 1000) - parseInt(ci.tweet.tweet_timestamp) - timeOffset;
                            ci.count = Math.floor(offset) * fr;
                                                    

                            if (arrayVenues[ci.venue.id] == null) {
                                arrayVenues[ci.venue.id] = new Object();
                                arrayVenues[ci.venue.id].checkins = new Array();
                                arrayVenues[ci.venue.id].venue = ci.venue;
                            }
                            arrayVenues[ci.venue.id].checkins[arrayVenues[ci.venue.id].checkins.length] = ci;
                        } else {
                            ci.count=0;
                            
                        }
                        //arrayCheckins[arrayCheckins.length] = ci;
                        lastCheckinReceived = Math.max(lastCheckinReceived, parseInt(ci.checkid));
                    });

                }
            });

        }
    }


        /*
        
            listaTrending = listaTrending.sort(ordenarPorNumeroCheckins)
            var query ="";
            var asd = 0;
            for (asd = 0; asd<10;asd++){
                query += listaTrending[asd].venue.id;
                if (asd<9){
                    query += "-";
                }
            }

            $.ajax({
                url: 'http://pregel.mat.upm.es/get-venue.php?locationIds=' + query,
                dataType: 'json',
                success: function (data) {
                    alert(data);
                

                }
            });*/

/*
   arrayCheckins[arrayCheckins.length] = checkinTest[iArray];
   iArray = (iArray+1)%checkinTest.length; 
 */
        
        processing.ambientLight(242, 242, 240);
        //processing.lightSpecular(204, 204, 204); 
        //processing.directionalLight(202, 202, 202, 0, -1, -1);
        //if (processing.mousePressed&&(processing.mouseButton==processingLEFT)){

    //    processing.translate(transX+processing.width/2, (Math.cos(rotX)*zoom)+(Math.sin(rotX)*transY)+processing.width/4,Math.sin(rotX)*zoom+Math.cos(rotX)*transY-800); // processing.map(processing.mouseY,0,processing.height,-1000,0) );
/*
        var alfa = Math.atan(transY/transX);
        if(transY<0){
            alfa=alfa+Math.PI;
        }
        $("#test").html(alfa);
        var beta = rotZ;

        var d = Math.sqrt(Math.pow(transX,2)+Math.pow(transY,2));


        var offsetX;
        var offsetY;
        if (d>0){

        var theta = Math.PI-(Math.PI-beta)/2+beta+alfa;
            offsetX = 2*d*Math.sin(beta/2)*Math.cos(theta);

            offsetY = 2*d*Math.sin(beta/2)*Math.sin(theta);


        }else{
            offsetX = 0;
            offsetY = 0;
       }
*/
       


        

        processing.translate(processing.width/2, processing.width/4,zoom-800); // processing.map(processing.mouseY,0,processing.height,-1000,0) );
        
        processing.rotateX(rotX);
        processing.rotateY(rotY);
        processing.rotateZ(rotZ);

        processing.translate(transX, transY,0); // processing.map(processing.mouseY,0,processing.height,-1000,0) );



        processing.scale(2);


        //processing.rotateY(roty);
        //processing.rotateX(rotx);
        //}else{
        
        


        
        if(rotando){
            rotZ = (rotZ+2*Math.PI/segundosPorVuelta/fr)%(2*Math.PI);
        }

         //}

        //processing.rotateZ(processing.map(i, 0, fr * segundosPorVuelta, -Math.PI, Math.PI));
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

        /* Madrid
        processing.vertex(-1000, -658, 0, 0, 0);
        processing.vertex(1000, -658, 0, 1, 0);
        processing.vertex(1000, 658, 0, 1, 1);
        processing.vertex(-1000, 658, 0, 0, 1);
        processing.endShape();
        */


/* Mostrar Ejes X,Y,Z
        processing.stroke(255);

        processing.line(0,0,0,0,1000,0);
        processing.line(0,0,0,1000,0,0);
        processing.line(0,0,0,0,0,1000);

        processing.noStroke();

      */


        var iter=0;
        listaTrending = new Array();

        //for ( indi=0; indi<arrayCheckins.length;indi++){
        $.each(arrayVenues, function (key, value) {
                var minCount = 999999;
                var activeCheckins = 0;
                var totalCheckins = 0;
                

                $.each(value.checkins, function (index, val) {
                    if (timeframeMode){
                        if(val != null && val.dateAppear < timeEpoch){
                            val.count = (timeEpoch-val.dateAppear)*fr;
                            if (val.count < tiempoCheckin * fr){
                                if (!val.timelined){
                                    
				    showTweet(val,false);
                                    val.timelined=true;
                                }
                                
                                activeCheckins++;
                            }
                            minCount = Math.min(minCount, val.count);
                        }                        

                    }else if (val != null && val.count < tiempoCheckin * fr) {
                        minCount = Math.min(minCount, val.count);
                        activeCheckins++;
                        val.count++;
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
                    if (minCount < (tiempoFlashCheckin * fr)) {
                        green = processing.map(minCount, 0, tiempoFlashCheckin * fr, 255,100);
                        red = processing.map(minCount, 0, tiempoFlashCheckin * fr, 0, 255);
                        blue = processing.map(minCount, 0, tiempoFlashCheckin * fr, 0, 50);
                    } else {
                        green = processing.map(minCount, tiempoFlashCheckin, tiempoCheckin * fr, 100, 100);
                        red = processing.map(minCount, tiempoFlashCheckin, tiempoCheckin * fr, 255, 100);
                        blue = processing.map(minCount, tiempoFlashCheckin, tiempoCheckin * fr, 50, 255);
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
                    //  processing.box(ladoCheckin,ladoCheckin,altura);
                    ladoCheckin = 7*Math.log(15/processing.map(zoom+300,minZoom,maxZoom,0.5,7));
                    processing.dibujaCheckin(ladoCheckin, value.altura, value);
                    value.active = true;
                    /*if (activeCheckins > 1) {
                        processing.translate(0, 0, 1 + Math.ceil(alturaCheckinFrio / 2));
                        processing.fill(240, 175, 0, 40);

                        processing.box(Math.min(processing.map(activeCheckins, 1, 2, ladoCheckin, ladoCheckin * 2), 350), Math.min(processing.map(activeCheckins, 1, 2, ladoCheckin, ladoCheckin * 2), 250), alturaCheckinFrio);
                    }*/
                    processing.popMatrix();
                } else {
                    value.active = false;
                }
                
        });

        /*Capa en "2D" para información y GUI */
        processing.popMatrix();
        processing.pushMatrix();
        processing.hint(processing.DISABLE_DEPTH_TEST);        

        if(contadorGui<tiempoGui*fr){
			playIcon = processing.loadImage("img/play2.png");
            pauseIcon = processing.loadImage("img/pause2.png");
            satIcon = processing.loadImage("img/mapSat.png");
            streetIcon = processing.loadImage("img/mapStreet.png");          
            processing.fill(255,processing.map(contadorGui,(tiempoGui-tiempoDisolucionGui)*fr,tiempoGui*fr,100,0));
            if((processing.resizedMouseX()<70&&processing.resizedMouseY()<70)){	
				contadorGui=0;
			}			
            if(satellite){
				processing.image(streetIcon,0,5,70,70);
			}else{
				processing.image(satIcon,0,5,70,70);
			}
			processing.fill(255,processing.map(contadorGui,(tiempoGui-tiempoDisolucionGui)*fr,tiempoGui*fr,100,0));
			if((processing.resizedMouseX()>processing.width-60&&processing.resizedMouseY()<60)){
			    contadorGui=0;
			}
            if(rotando){
				processing.image(pauseIcon,processing.width-65,5,60,60);			
            }else{      
              processing.image(playIcon,processing.width-65,5,60,60);
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
            //alert(arrayVenues[informacion.venue].venue.name);
        }

        //processing.fill(255,processing.map(processing.millis()%1000,0,1000,255,0));
        //processing.image(playIcon,150,150);

        trendingPlaces = listaTrending.sort(ordenarPorNumeroCheckins).slice(0,Math.min(listaTrending.length,10));
        if (trendingPlaces.length>0){
            if (processing.millis()-lastNowTrendingMillis>500){
                nowTrending();
                lastNowTrendingMillis = processing.millis();
            }
            
        }


        i = (i + 1) % (fr * segundosPorVuelta);

         if (contadorGui < tiempoGui*fr) contadorGui++;
    };
    processing.mousePressed = function () {
        pulsado = true;
        oldX = processing.mouseX;
        oldY = processing.mouseY;
        oldRotX = rotX;
        oldRotZ = rotZ;
        if(processing.resizedMouseX()>processing.width-50&&processing.resizedMouseY()<50){
           rotando= !rotando;
        }
        if(processing.resizedMouseX()<50&&processing.resizedMouseY()<50){
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
    }
    processing.mouseDragged = function () {
        if (processing.resizedMouseX() > oldX) {
            rotZ = processing.map(processing.mouseX, oldX, processing.width, oldRotZ, Math.PI *2);
        } else {
            rotZ = processing.map(processing.mouseX, 0, oldX, 0, oldRotZ);
        }
        if (processing.resizedMouseY() > oldY) {
            rotX = processing.map(processing.mouseY, oldY, processing.height, oldRotX, 0);
        } else {
            rotX = processing.map(processing.mouseY, 0, oldY, Math.PI / 3, oldRotX);
        }
    };

    processing.mouseMoved = function () {
        contadorGui = 0;
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
        

    }

    processing.resizedMouseY = function() {
        return Math.floor(processing.mouseY*720/canvas.clientHeight);
        
    }

    processing.cambiaMapa = function() {
       if (satellite){
          tex = processing.requestImage("img/"+currentConfig.mapImage);
          satellite=false;
       }else{
          tex = processing.requestImage("img/"+currentConfig.satImage);
          satellite=true;
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
