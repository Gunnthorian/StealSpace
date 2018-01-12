var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(2000);
console.log("Server started...");

var SOCKET_LIST = {};
var PLAYER_LIST = {};

var max_food = 100;
var FOOD_LIST = [];
var map = {};
var map_size = 1000;

var Player = function(id){
  var self = {
    x:-1,
    y:-1,
    id:id,
    color:'#'+Math.floor(Math.random()*16777215).toString(16),
    direction: 0
  }
  self.updatePosition = function(){
    if(self.direction == 0 && self.y < map_size){
      self.y += 1;
    }else if(self.direction == 0 && self.y >= map_size){
      self.respawn();
    }

    if(self.direction == 2 && self.y > 0){
      self.y += -1;
    }else if(self.direction == 2 && self.y <= 0){
      self.respawn();
    }

    if(self.direction == 1 && self.x < map_size){
      self.x += 1;
    }else if(self.direction == 1 && self.x >= map_size){
      self.respawn();
    }

    if(self.direction == 3 && self.x > 0){
      self.x += -1;
    }else if(self.direction == 3 && self.x <= 0){
      self.respawn();
    }
  }
  self.respawn = function(){
    var _x = Math.ceil(Math.random() * map_size);
    var _y = Math.ceil(Math.random() * map_size);
    var valid = 1;
    try{
      if(JSON.stringify(map[_x][_y].tile) == '{}'){
        if(JSON.stringify(map[_x+1][_y].tile) == '{}'){
          if(JSON.stringify(map[_x+2][_y].tile) == '{}'){
            if(JSON.stringify(map[_x][_y+1].tile) == '{}'){
              if(JSON.stringify(map[_x+1][_y+1].tile) == '{}'){
                if(JSON.stringify(map[_x+2][_y+1].tile) == '{}'){
                  if(JSON.stringify(map[_x][_y+2].tile) == '{}'){
                    if(JSON.stringify(map[_x+1][_y+2].tile) == '{}'){
                      if(JSON.stringify(map[_x+2][_y+2].tile) == '{}'){
                      }else{
                        self.respawn();
                      }
                    }else{
                      self.respawn();
                    }
                  }else{
                    self.respawn();
                  }
                }else{
                  self.respawn();
                }
              }else{
                self.respawn();
              }
            }else{
              self.respawn();
            }
          }else{
            self.respawn();
          }
        }else{
          self.respawn();
        }
      }else{
        self.respawn();
      }
    }
    \
    catch(){
      console.log('respawn took too long');
    }

  }
  return self;
}

var io = require('socket.io') (serv, {});
io.sockets.on('connection', function(socket) {

  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;

  var player = Player(socket.id);
  PLAYER_LIST[socket.id] = player;

  var sessionid = socket.id;

  socket.on('disconnect',function(){
    delete SOCKET_LIST[socket.id];
    delete PLAYER_LIST[socket.id];

    console.log('socket disconnect ' + socket.id);

  });

  socket.on('keyPress',function(data){
    if(data == 'left')
      player.direction = 'left';
    else if(data == 'right')
      player.direction = 'right';
    else if(data == 'up')
      player.direction = 'up';
    else if(data == 'down')
      player.direction = 'down';
  });

  console.log('socket connection ' + socket.id);

});

setInterval(function(){



  for(var i in PLAYER_LIST){
    var player = PLAYER_LIST[_x];
    var socket = SOCKET_LIST[_x];
    var pack = [];
    player.updatePosition();
    pack.push({
      id:player.id,
      x:player.x,
      y:player.y,
      color:player.color,
      direction:player.direction
    });
    for(var e in PLAYER_LIST){
      if(PLAYER_LIST[e] != player){
        var other_player = PLAYER_LIST[e]
        if(other_player.x < player.x+500 && other_player.x > player.x-500 && other_player.y < player.y+500 && other_player.y > player.y-500){
          pack.push({
            id:other_player.id,
            x:other_player.x,
            y:other_player.y,
            color:other_player.color,
            direction:player.direction
          })
        }
      }
    }

    socket.emit('newPositions',pack);
  }
},1000/4);
