//----- Express: Required for serving files to client
var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
serv.listen(2000);
console.log("Server started.");

var boardXSize = 50;
var boardYSize = 50;

var SOCKET_LIST = {};
var PLAYER_LIST = {};

var Player = function(id){
  var self = {
    x:250,
    y:250,
    id:id,
    number: "" + Math.floor(10 * Math.random()),

    pressingMouse:false,
    mouseX:250,
    mouseY:250
  }
  return self;
}

//------ Listen for players connecting to the server
var io = require('socket.io')(serv,{}); //Import socket library
io.sockets.on('connection', function(socket){

  //Connect a new client
  socket.id = Math.random();  //Assign unique id to each connecting player
  SOCKET_LIST[socket.id] = socket;

  var player = Player(socket.id);
  PLAYER_LIST[socket.id] = player;

  //Disconnect a client
  socket.on('disconnect', function(){
    delete SOCKET_LIST[socket.id];
    delete PLAYER_LIST[socket.id];
  })

  socket.on('mouseClick', function(data){
    player.mouseClick = data.mouseState;
  });

  socket.on('mouseMove', function(data){
    player.mouseX = data.mouseX;
    player.mouseY = data.mouseY;
  });

/*
  //socket.on to rescieve messages from the client (string, anonymous function which takes the recieved data as an arguement)
  //socket.emit to send data to the client. (string, data)
  socket.on('test', function(data){
        console.log('Test signal recieved');
        console.log('Data contents: ' + data.string);
      }
    );

  socket.emit('serverMsg', {
    msg:'hello',
  });
  */

}
);

//----- Main game loop. Emit game state to clients 25 times a second.
setInterval(function(){
  var pack = []; //This contains the game state required by clients

  //Store all game data in a packet
  for (var i in PLAYER_LIST){
    var player = PLAYER_LIST[i];
    player.x++;
    player.y++;
    pack.push({
          x:player.mouseX,
          y:player.mouseY,
          state:player.mouseState,
          number:player.number
      }
    );
  }
  var packet = {
    playerData:pack,
    mapData:{
      xSize: boardXSize,
      ySize: boardYSize
    }
  };

  //Emit packet to all clients
  for(var i in SOCKET_LIST){
    var socket = SOCKET_LIST[i];
    var player = PLAYER_LIST[i];
    socket.emit('gameState', packet);
  }
},1000/25);
