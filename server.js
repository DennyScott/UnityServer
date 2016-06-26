var port = process.env.port || 3000;
var shortid = require('shortid');
var io = require('socket.io')(port);
var players = [];

io.on('connection', (socket) => {

    var thisPlayerId = shortid.generate();
    players.push(thisPlayerId);

    console.log("Client Connected, broadcasting spawn, id: " + thisPlayerId);
    socket.broadcast.emit('spawn', {id: thisPlayerId});

    players.forEach((playerId) => {
      if(playerId === thisPlayerId) return;
      socket.emit('spawn', {id: playerId});
      console.log('sending spawn to new player, with id ' + playerId);
    });

    socket.on('move', (data) => {
      data.id = thisPlayerId;
      console.log("Client Moved", JSON.stringify(data));

      socket.broadcast.emit('move', data);
    });

    socket.on('disconnect', () => {
      console.log("Client Disconnected");

      players.splice(players.indexOf(thisPlayerId), 1);
      socket.broadcast.emit('disconnected', {id : thisPlayerId})
    });
});

console.log('server started');
