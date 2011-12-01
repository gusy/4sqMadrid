
var sketch = new Processing.Sketch();
sketch.use3DContext = true;
//sketch.imageCache.add("Madrid.jpg");
var zoom = 1;
sketch.attachFunction = function (processing) {
    var tiempoGui = 2;
    var tiempoDisolucionGui = 1;
    var contadorGui = 0;
    var tex;
    var satellite=true;
    var rotando=true;
    var transX; //= processing.width/2;
    var transY; //= processing.height/2;
    var rotX = Math.PI / 4;
    var rotY = 0;
    var rotZ = 0;
    var i = 1;
    var fr = 15;
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
    var arrayCheckins = new Array();
    var arrayVenues = new Object();
    var informacion = {
        "display": false
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

    processing.setup = function () {
        processing.frameRate(fr);
        processing.size(1200, 720, processing.OPENGL);
        transX = 0;
        transY = 0;
        processing.smooth();
        tex = processing.requestImage("img/MadridSat.jpg");
        processing.textureMode(processing.NORMALIZED);
        processing.fill(55);
        processing.stroke(processing.color(44, 48, 32));
        $.ajax({
            url: 'http://orange1.dit.upm.es/checkins-fly.php?locationId=1&lastCheckin=' + lastCheckinReceived,
            dataType: 'json',
            success: function (data) {
                checkinPhp = data;
               $.each(checkinPhp, function (index, value) {
                    var ci = value;
                    if (ci.tweet != null) {
                        var dated = new Date();
                        var offset = (dated.getTime() / 1000) - parseInt(ci.tweet.tweet_timestamp) - 3600;
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
        });
        processing.noStroke();


    };


    processing.draw = function () {
        processing.hint(processing.ENABLE_DEPTH_TEST);
        processing.pushMatrix();
        processing.fill(55);
        processing.background(0);
        if (sobre) {
            //alert('Hola');
            processing.fill(200);
            processing.rect(0, 0, 100, 100);
        }
        if (i % (fr * tRefresh) == 0) {
            $.ajax({
                url: 'http://orange1.dit.upm.es/checkins-fly.php?locationId=1&lastCheckin=' + lastCheckinReceived,
                dataType: 'json',
                success: function (data) {
                    checkinPhp = data;
                    $.each(checkinPhp, function (index, value) {
                        var ci = value;
                        if (ci.tweet != null) {
                            //var dated = new Date();
                            //var offset = (dated.getTime()/1000)-parseInt(ci.tweet.tweet_timestamp)-3600;
                            ci.count = 0 //Math.floor(offset)*fr;
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

/*
   arrayCheckins[arrayCheckins.length] = checkinTest[iArray];
   iArray = (iArray+1)%checkinTest.length; 
 */
        }
        processing.ambientLight(242, 242, 240);
        //processing.lightSpecular(204, 204, 204); 
        processing.directionalLight(202, 202, 202, 0, -1, -1);
        //if (processing.mousePressed&&(processing.mouseButton==processingLEFT)){

                processing.translate(transX+processing.width/2, (Math.sin(rotX)*transY)+processing.width/2,Math.cos(rotX)*transY-800); // processing.map(processing.mouseY,0,processing.height,-1000,0) );
        processing.scale(zoom);

        //processing.rotateY(roty);
        //processing.rotateX(rotx);
        //}else{
        processing.rotateX(rotX);
        processing.rotateY(rotY);
        processing.rotateZ(rotZ);
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

        processing.vertex(-1000, -800, 0, 0, 0);
        processing.vertex(1000, -800, 0, 1, 0);
        processing.vertex(1000, 800, 0, 1, 1);
        processing.vertex(-1000, 800, 0, 0, 1);
        processing.endShape();

        //for ( indi=0; indi<arrayCheckins.length;indi++){
        $.each(arrayVenues, function (key, value) {
            var minCount = 999999;
            var activeCheckins = 0;
            $.each(value.checkins, function (index, val) {
                if (val != null && val.count < tiempoCheckin * fr) {
                    minCount = Math.min(minCount, val.count);
                    activeCheckins++;
                    val.count++;
                }
            });
            if (activeCheckins>0){
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
                processing.shininess(15.0);
                processing.fill(red, green, blue, 180);
                if (value.mouseSobre) {
                    processing.fill(240, 130);
                    if (pulsado) {
                        informacion.display = true;
                        informacion.venue = key;
                        processing.fill(100);
                    }
                }
                processing.translate(processing.map(value.venue.location.lng, -3.84, -3.495, -1000, 1000), processing.map(value.venue.location.lat, 40.363, 40.5735, 800, -800), 0);
                if (informacion.display && informacion.venue == key) {
                    informacion.x = processing.screenX(0, 0, value.altura);
                    informacion.y = processing.screenY(0, 0, value.altura);
                    informacion.z = processing.screenZ(0, 0, value.altura);
                }       
                //  processing.box(ladoCheckin,ladoCheckin,altura);
                ladoCheckin = 7*Math.log(15/zoom)
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
            processing.fill(240,processing.map(contadorGui,(tiempoGui-tiempoDisolucionGui)*fr,tiempoGui*fr,100,0));
            processing.rect(0,0,50,50);
            processing.fill(0);
            processing.rect(25,25,10,10);
            processing.fill(240,processing.map(contadorGui,(tiempoGui-tiempoDisolucionGui)*fr,tiempoGui*fr,100,0));
            processing.rect(processing.width-50,0,50,50);
            processing.fill(0);
            if(rotando){
              processing.rect(processing.width-40,10,10,30);
              processing.rect(processing.width-20,10,10,30);
            }else{
              processing.triangle(processing.width-40,10,processing.width-40,40,processing.width-10,25);
            }
         }        
        if (informacion.display) {
            processing.fill(240, 80);
            processing.translate(informacion.x, informacion.y, 0);
            var fontA = processing.loadFont("verdana");
            processing.textFont(fontA, 18);

            processing.rect(30, 0, processing.textWidth(arrayVenues[informacion.venue].venue.name) + 10, 28);
            processing.fill(0);
            processing.text(unescape(arrayVenues[informacion.venue].venue.name), 40, 10  );
            //alert(arrayVenues[informacion.venue].venue.name);
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
        if(processing.mouseX>processing.width-50&&processing.mouseY<50){
           rotando= !rotando;
        }
        if(processing.mouseX<100&&processing.mouseY<100){
         processing.cambiaMapa();
        }
        if(informacion.display)
           informacion.display=false;
    };
    processing.mouseReleased = function () {
        pulsado = false;
    }
    processing.mouseDragged = function () {
        if (processing.mouseX > oldX) {
            rotZ = processing.map(processing.mouseX, oldX, processing.width, oldRotZ, Math.PI *2);
        } else {
            rotZ = processing.map(processing.mouseX, 0, oldX, 0, oldRotZ);
        }
        if (processing.mouseY > oldY) {
            rotX = processing.map(processing.mouseY, oldY, processing.height, oldRotX, 0);
        } else {
            rotX = processing.map(processing.mouseY, 0, oldY, Math.PI / 3, oldRotX);
        }
    };

    processing.mouseMoved = function () {
        contadorGui = 0;
        var p = {
            "x": processing.mouseX,
            "y": processing.mouseY
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
      if (processing.keyCode == processing.RIGHT) {
         transX = Math.min(2000, transX + 20);
      }
      if (processing.keyCode == processing.LEFT) {
         transX = Math.max(-2000, transX - 20);
      }
      if (processing.keyCode == processing.UP) {
         transY = Math.max(-2000, transY - 20);
      }
      if (processing.keyCode == processing.DOWN) {
         transY = Math.min(2000, transY + 20);
      }
    };
    processing.cambiaMapa = function() {
       if (satellite){
          tex = processing.requestImage("img/MadridMap.jpg");
          satellite=false;
       }else{
          tex = processing.requestImage("img/MadridSat.jpg");
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
    if (delta < 0) zoom = Math.max(0.3, zoom / 1.01);
    else zoom = Math.min(7.5, zoom*1.01);
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
