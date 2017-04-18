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


var SOCKET_LIST = {};
var PLAYER_LIST = {};

//------ Listen for players connecting to the server
var io = require('socket.io')(serv,{}); //Import socket library
io.sockets.on('connection', function(socket){

  //Connect a new client
  socket.id = Math.random();  //Assign unique id to each connecting player
  socket.x = 0;
  socket.y = 0;
  SOCKET_LIST[socket.id] = socket;

  console.log('socket connection');

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
}
);

//----- Main game loop. Emit game state to clients 25 times a second.
setInterval(function(){
  var pack = []; //This contains the game state required by clients

  //Store all game data in a packet
  for (var i in SOCKET_LIST){
    var socket = SOCKET_LIST[i];
    socket.x++;
    socket.y++;
    pack.push({
          x:socket.x,
          y:socket.y
      }
    );
  }

  //Emit packet to all clients
  for(var i in SOCKET_LIST){
    var socket = SOCKET_LIST[i];
    socket.emit('gameState', pack);
  }
},1000/25);
