var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Gpio = require('onoff').Gpio;  
var pir = new Gpio(17, 'in', 'both');

app.use(express.static('public'));

http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket){
  console.log('a user connected');
  io.emit('trigger', 'Hello');
  
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

pir.watch(function(err, value) {
  if (err) exit();  
  io.emit('trigger', value);
  console.log('Intruder detected');  
});