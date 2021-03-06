var canvas, stage;
var drawingCanvas;
var oldPt;
var oldMidPt;
var title;
var color;
var globalCallbackController;
var stroke = 5; // our default stroke

var colors = [  "#EFDECD","#CD9575","#FDD9B5","#78DBE2","#87A96B","#FFA474","#FAE7B5","#9F8170",
                "#FD7C6E","#000000","#ACE5EE","#1F75FE","#A2A2D0","#6699CC","#0D98BA","#7366BD",
                "#DE5D83","#CB4154","#B4674D","#FF7F49","#EA7E5D","#B0B7C6","#FFFF99","#1CD3A2",
                "#FFAACC","#DD4492","#1DACD6","#BC5D58","#DD9475","#9ACEEB","#FFBCD9","#FDDB6D",
                "#2B6CC4","#EFCDB8","#6E5160","#CEFF1D","#71BC78","#6DAE81","#C364C5","#CC6666",
                "#E7C697","#FCD975","#A8E4A0","#95918C","#1CAC78","#1164B4","#F0E891","#FF1DCE",
                "#B2EC5D","#5D76CB","#CA3767","#3BB08F","#FEFE22","#FCB4D5","#FFF44F","#FFBD88",
                "#F664AF","#AAF0D1","#CD4A4C","#EDD19C","#979AAA","#FF8243","#C8385A","#EF98AA",
                "#FDBCB4","#1A4876","#30BA8F","#C54B8C","#1974D2","#FFA343","#BAB86C","#FF7538",
                "#FF2B2B","#F8D568","#E6A8D7","#414A4C","#FF6E4A","#1CA9C9","#FFCFAB","#C5D0E6",
                "#FDDDE6","#158078","#FC74FD","#F78FA7","#8E4585","#7442C8","#9D81BA","#FE4EDA",
                "#FF496C","#D68A59","#714B23","#FF48D0","#E3256B","#EE204D","#FF5349","#C0448F",
                "#1FCECB","#7851A9","#FF9BAA","#FC2847","#76FF7A","#9FE2BF","#A5694F","#8A795D",
                "#45CEA2","#FB7EFD","#CDC5C2","#80DAEB","#ECEABE","#FFCF48","#FD5E53","#FAA76C",
                "#18A7B5","#EBC7DF","#FC89AC","#DBD7D2","#17806D","#DEAA88","#77DDE7","#FFFF66",
                "#926EAE","#324AB2","#F75394","#FFA089","#8F509D","#FFFFFF","#A2ADD0","#FF43A4",
                "#FC6C85","#CDA4DE","#FCE883","#C5E384","#FFAE42"].sort();

var images = [ "8ball.tif.jpg",
                "Baseball.tif.jpg",
                "Basketball.tif.jpg",
                "Bowling.tif.jpg",
                "Cactus.tif.jpg",
                "Chalk.tif.jpg",
                "Dahlia.tif.jpg",
                "Dandelion.tif.jpg",
                "Drum.tif.jpg",
                "Eagle.tif.jpg",
                "Earth.tif.jpg",
                "Flower.tif.jpg",
                "Football.tif.jpg",
                "Fortune Cookie.tif.jpg",
                "Gingerbread Man.tif.jpg",
                "Golf.tif.jpg",
                "Guitar.tif.jpg",
                "Hockey.tif.jpg",
                "Leaf.tif.jpg",
                "Lightning.tif.jpg",
                "Lotus.tif.jpg",
                "Medal.tif.jpg",
                "Nest.tif.jpg",
                "Owl.tif.jpg",
                "Parrot.tif.jpg",
                "Penguin.tif.jpg",
                "Piano.tif.jpg",
                "Poppy.tif.jpg",
                "Red Rose.tif.jpg",
                "Sandollar.tif.jpg",
                "Smack.tif.jpg",
                "Snowflake.tif.jpg",
                "Soccer.tif.jpg",
                "Sunflower.tif.jpg",
                "Target.tif.jpg",
                "Tennis.tif.jpg",
                "Turntable.tif.jpg",
                "Violin.tif.jpg",
                "Whiterose.tif.jpg",
                "Yellow Daisy.tif.jpg",
                "Ying Yang.tif.jpg",
                "Zebra.tif.jpg",
                "Zen.tif.jpg" ];

var index = (Math.round(Math.random()*10000000)) % colors.length;
var penColor = colors[index];
var socket; 
var clientName = "Client" + Math.round(10000 * Math.random());;
var drawingCanvases;
var oldPts;
var oldMidPts;
var userImageIndex = Math.round(Math.random() * 1000)% images.length;;
var userImages = {};

$(function(){
    $( "#lineThickness" ).val( stroke + "pt");

    $( "#slider" ).slider({
        value:stroke,
        min: 1,
        max: 50,
        step: 1,
        slide: function( event, ui ) {
          stroke = ui.value;
          $( "#lineThickness" ).val( stroke + "pt");
        }
    });
});


function initColorPicker() {
    $("#full").spectrum({
        color: penColor,
        showInput: true,
        className: "full-spectrum",
        showInitial: true,
        showPalette: true,
        showSelectionPalette: false,
        maxPaletteSize: 10,
        preferredFormat: "hex",
        localStorageKey: "JScribble",
        move: function (color) {

        },
        show: function () {

        },
        beforeShow: function (color) {

        },
        hide: function () {

        },
        change: function(color) {
          penColor = color.toHexString();
        },
        palette: colors
    });
}


function init() {
    initColorPicker();

    $("#clearButton").click(function() {
    // clear ourselves:
    stage.clear();
    // clear everyone else
    socket.emit('draw', $.toJSON({action: 'clear', user: clientName }));
    });

    drawingCanvases = {};
    oldPts = {};
    oldMidPts = {};

    join("client", window.location.host);

    if (window.top != window) {
        document.getElementById("header").style.display = "none";
    }
    canvas = document.getElementById("myCanvas");
    drawingCanvases[clientName] = canvas;

    //check to see if we are running in a browser with touch support
    stage = new createjs.Stage(canvas);

    stage.autoClear = false;
    stage.enableEvents(true);

    createjs.Touch.enable(stage);
    createjs.Ticker.setFPS(24);

    drawingCanvas = new createjs.Shape();
    drawingCanvases[clientName] = drawingCanvas;

    stage.addEventListener("stagemousedown", handleMouseDown);
    stage.addEventListener("stagemouseup", handleMouseUp);

    title = new createjs.Text("Click and Drag to draw", "36px Arial", "#777777");
    title.x = 300;
    title.y = 200;
    stage.addChild(title);

    stage.addChild(drawingCanvas);
    stage.update();
}


function stop() {
    createjs.Ticker.removeEventListener("tick", tick);
}


function handleMouseDown(event) {

    if (stage.contains(title)) { 
        stage.clear(); 
        stage.removeChild(title); 
    }

    oldPt = new createjs.Point(stage.mouseX, stage.mouseY);
    oldMidPt = oldPt;
    stage.addEventListener("stagemousemove" , handleMouseMove);

    socket.emit('draw', $.toJSON({  action: 'start', 
                                    user: clientName,
                                    start: oldMidPt,
                                    end:oldMidPt,
                                    color:penColor,
                                    stroke: stroke }));
}


function handleMouseMove(event) {
    var midPt = new createjs.Point(oldPt.x + stage.mouseX>>1, oldPt.y+stage.mouseY>>1);

    drawingCanvas.graphics.clear().setStrokeStyle(stroke, 'round', 'round').beginStroke(penColor).moveTo(midPt.x, midPt.y).curveTo(oldPt.x, oldPt.y, oldMidPt.x, oldMidPt.y);

    oldPt.x = stage.mouseX;
    oldPt.y = stage.mouseY;

    oldMidPt.x = midPt.x;
    oldMidPt.y = midPt.y;

    stage.update();

    socket.emit('draw', $.toJSON({action: 'draw', user: clientName, start: oldMidPt, end:midPt, color:penColor, stroke: stroke }));
}


function handleMouseUp(event) {
    stage.removeEventListener("stagemousemove" , handleMouseMove);
}


function onStartNewSegment(startx, starty, endx, endy, color, stroke, user) {
    var currentDrawingCanvas = drawingCanvases[user];
    if (currentDrawingCanvas == null) {

        currentDrawingCanvas = new createjs.Shape();
        drawingCanvases[user] = currentDrawingCanvas;
        stage.addChild(currentDrawingCanvas);
    }

    if (stage.contains(title)) { 
        stage.clear(); 
        stage.removeChild(title); 
    }

    oldPts[user] = new createjs.Point(startx, starty);
    oldMidPts[user] = oldPts[user]
}


function onDrawSegmentReceived(startx, starty, endx, endy, color, stroke, user){
    var currentDrawingCanvas = drawingCanvases[user];
    if (currentDrawingCanvas == null) currentDrawingCanvas = canvas;

    var midPt = new createjs.Point(oldPts[user].x + startx>>1, oldPts[user].y+starty>>1);

    currentDrawingCanvas.graphics.clear().setStrokeStyle(stroke, 'round', 'round').beginStroke(color).moveTo(midPt.x, midPt.y).curveTo(oldPts[user].x, oldPts[user].y, oldMidPts[user].x, oldMidPts[user].y);

    oldPts[user].x = endx;
    oldPts[user].y = endy;

    oldMidPts[user].x = midPt.x;
    oldMidPts[user].y = midPt.y;

    stage.update();
}

function sendMessage(message, callbackController){
    globalCallbackController = callbackController;
    var msg = $.toJSON({   action: 'message', 
                                        user: clientName,
                                        msg: message });
    socket.emit('chat', msg);
}


function join(name, host) {
    socket = io.connect('http://' + host);

	// send join message
	socket.emit('join', $.toJSON({ user: name }));

    socket.on('draw', function(msg) {
        var message = $.evalJSON(msg);

        var action = message.action;

        switch(action) {
            case 'start':
                onStartNewSegment(message.start.x, message.start.y, message.end.x, message.end.y, message.color, message.stroke, message.user);
            break;
            case 'draw':
                onDrawSegmentReceived(message.start.x, message.start.y, message.end.x, message.end.y, message.color, message.stroke, message.user);
            break;
            case 'clear':
                stage.clear();
            break;
        }
    });

	// handler for callback
	socket.on('chat', function (msg) {
        var message = $.evalJSON(msg);

        var action = message.action;
        switch (action) {
            case 'message':
                globalCallbackController.addMessage(message.msg, message.user);
            
            break;
            case 'control':
            break;
        }
    });
}

function iconForUser(username) {
    var img = userImages[username] ;
    if (img == null) {
        img = images[userImageIndex];
        userImages[username] = img;
        userImageIndex = (userImageIndex + 1) % images.length;

    }
    return img;
}


function ChatController($scope) {

    globalCallbackController = $scope;

    $scope.sendChatMessage = function() {
        sendMessage($scope.chatMessageToSend, this);
    }

    $scope.messages = [];

    $scope.addMessage = function(message, user) {
        $scope.messages.push({message:message, user:user, isMe:(user == clientName), image:iconForUser(user)});
        $scope.chatMessageToSend = "";
        $scope.$apply();

        var elem = document.getElementById('chatList');
        elem.scrollTop = elem.scrollHeight;
    }
}


function IdentifierController($scope) {

    $scope.identifier = "";
    $scope.defaultIdentifier = clientName;
    $scope.modalStyle = "";
    $scope.useIdenfitierAction = function() {
        $scope.identifier;
        $scope.modalStyle = "fade";
        clientName = $scope.identifier;
    }

    $scope.useDefaultIdentifierAction = function() {
        // do nothing...
        $scope.modalStyle = "fade";
    }
}
