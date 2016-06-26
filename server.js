var port = process.env.port || 3000;
var shortid = require('shortid');
var io = require('socket.io')(port);
var players = [];

io.on('connection', (socket) => {

    var thisPlayerId = shortid.generate();
    var player = {
      id: thisPlayerId,
      x: 0,
      y: 0
    }
    players[thisPlayerId] = player;

    console.log("Client Connected, broadcasting spawn, id: " + thisPlayerId);
    socket.broadcast.emit('spawn', {id: thisPlayerId});
    socket.broadcast.emit('requestPosition');

    for(var playerId in players) {

      if(playerId === thisPlayerId)
       continue;

      socket.emit('spawn', players[playerId]);
      console.log('sending spawn to new player, with id ' + playerId);
    }

    socket.on('move', (data) => {
      data.id = thisPlayerId;
      console.log("Client Moved", JSON.stringify(data));

      player.x = data.x;
      player.y = data.y;

      socket.broadcast.emit('move', data);
    });

    socket.on('updatePosition', (data) => {
      console.log("Update Position ", data);

      data.id = thisPlayerId;
      socket.broadcast.emit("updatePosition", data);
    });

    socket.on('disconnect', () => {
      console.log("Client Disconnected");

      delete players[thisPlayerId];
      socket.broadcast.emit('disconnected', {id : thisPlayerId})
    });
});

console.log('server started');
