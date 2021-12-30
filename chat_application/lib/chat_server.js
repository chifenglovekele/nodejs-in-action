var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

exports.listen = function(server) {
  io = socketio.listen(server);
  io.set('log level', 1);
  io.sockets.on('connection', function(socket) {
    guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
    joinRoom(socket, 'Lobby');
    handleMessageBroadCasting(socket, nickNames);
    handleNameChangeAttempts(socket, nickNames, namesUsed);
    handleRoomJoining(socket);
    socket.on('rooms', function() {
      socket.emit('rooms', io.sockets.manager.rooms);
    });
    handleClientDisconnection(socket, nickNames, namesUsed);
  });
};

function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
  var name = 'Guest' + guestNumber;
  nickNames[socket.id] = name;
  socket.emit('nameResult', {
    success: true,
    name: name
  })
  namesUsed.push(name);
  return guestNumber++;
}

function joinRoom(socket, room) {
  // 让用户进入房间
  socket.join(room);
  // 记录用户的当前房间名
  currentRoom[socket.id] = room;
  // 让用户知道自己进入了新的房间
  socket.emit('joinResult', {room : room});
  // 让房间里其他用户知道有新用户进入房间
  socket.broadcast.to(room).emit('message', {text: nickNames[socket.id] + 'has joined' + room + '.'});
  // 确定有哪些用户在这个房间里
  var usersInRoom = io.sockets.clients(room);
  // 如果不止一个用户在这个房间里，汇总下都有谁
  if (usersInRoom.length > 1) {
    var usersInRoomSummary = 'Users currently in ' + room + ':';
    for (var i = 0; i < usersInRoom.length; i++) {
      var userSocketId = usersInRoom[i].id;
      if (userSocketId != socket.id) {
        if (i > 0) {
          usersInRoomSummary += ',';
        }
      }
      usersInRoomSummary += nickNames[userSocketId];
    }
    usersInRoomSummary += ',';
    // 将房间里其他用户的名称汇总发送给这个用户
    socket.emit('message', { text: usersInRoomSummary});
  }
}

function handleNameChangeAttempts(socket, nickNames, namesUsed) {
  socket.on('nameAttempt', function(name) {
    if (name.indexOf('Guest') == 0) {
      socket.emit('nameResult', { success: false, message: 'Names connot begin with "Guest".'});
    } else {
      if (namesUsed.indexOf(name) == -1) {
        var previousName = nickNames[socket.id];
        var previouseNameIndex = namesUsed.indexOf(previousName);
        namesUsed.push(name);
        nickNames[socket.id] = name;
        delete namesUsed[previouseNameIndex];
        socket.emit('nameResult', {success: true, name: name});
        socket.broadcast.to(currentRoom[socket.id]).emit('message', {text: previousName + ' is now known as ' + name + '.'});
      } else {
        socket.emit('nameResult', {
          success: false,
          message: 'That name is already in use.'
        });
      }
    }
  })
}

function handleMessageBroadCasting(socket) {
  socket.on('message', function(message) {
    socket.broadcast.to(message.room).emit('message', {
      text: nickNames[socket.id] + ':' + message.text
    })
  })
}

function handleRoomJoining(socket) {
  socket.on('join', function(room) {
    socket.leave(currentRoom[socket.id]);
    joinRoom(socket, room.newRoom);
  })
}

function handleClientDisconnection(socket) {
  socket.on('disconnect', function() {
    var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
    delete namesUsed[nameIndex];
    delete nickNames[socket.id];
  })
}

