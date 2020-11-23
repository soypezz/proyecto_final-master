var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var conectados=0;

//Objeto jugadores
var players = {};

//posiciones colliders mapa
var star = {
  x: 320,
  y: 623
};
var caja_der ={
  x: 559,
  y:192
};
var caja_int ={
  x: 225,
  y:306
};
var caja_intinf ={
  x: 323,
  y:480
};
var div_medio ={
  x: 402,
  y:224
};
var obstaculo_der ={
  x: 563,
  y:352
};
var obstaculo_techo ={
  x: 384,
  y:45
};
var pared_der_sup ={
  x: 753,
  y:160
};
var pared_der_inf ={
  x: 624,
  y:465
};
var pared_izq ={
  x: 15,
  y:314
};
var piso_der ={
  x: 700,
  y:336
};
var techo ={
  x: 371,
  y:15
};


//Puntaje global 
var scores = {
  blue: 0,
  red: 0,
  max: 0
};


//Comprobantes de vueltas
var llegada ={
  x: 158,
  y:80
};
var checkpoint = {
  x:449,
  y:400
}

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  conectados++;
  socket.emit('conectados',conectados);
  socket.on('listos',()=>{
    socket.broadcast.emit('bro');
  });
  console.log('a user connected: ', socket.id);
  //Crea un nuevo jugador y lo añade al objeto de jugadores
  players[socket.id] = {
    rotation: 0,
    x: 75,
    y: 90 + Math.floor(Math.random() * 40),
    playerId: socket.id,
    team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
  };
  // Actualiza los jugadores 
  socket.emit('currentPlayers', players);

  //Manda el ganador a todos los jugadores.
  socket.on('ganador', data=>{
    console.log('hola chicos')
    socket.broadcast.emit('soy ganador', data)
    socket.emit('soy ganador', data)
    socket.emit('otroGana')
  });

 

  // manda los puntajes actuales
  socket.emit('scoreUpdate', scores);
  // actualiza a todos los jugadores sobre el nuevo jugador
  socket.broadcast.emit('newPlayer', players[socket.id]);

  // Cuando se desconecta un jugador se remueve del objeto jugadores
  socket.on('disconnect', function () {
    console.log('user disconnected: ', socket.id);
    delete players[socket.id];
    //manda un mensaje de jugador desconectado
    io.emit('disconnect', socket.id);
  });

  // cuando se mueve un jugador se acualiza su informacion de posicion.
  socket.on('playerMovement', function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].rotation = movementData.rotation;
    // emite el movimiento del jugador a todos los jugadores
    socket.broadcast.emit('playerMoved', players[socket.id]);
  });

  //Compara las vueltas del jugador con la maxima
  socket.on('vueltaHecha', function (max) {
    if (max >= scores.max) {
      scores.max = max ;
    } 
    io.emit('scoreUpdate', scores);
  });

  //reinicia el maximo de vueltas
  socket.on('nuevoMax', function(){
    scores.max=0;
    io.emit('redo', players);
  });
  
});



server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});
