var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Gpio = require('onoff').Gpio;  
var pir = new Gpio(17, 'in', 'both');
var state = false;
var timeout = 10000;
var timer = null;
var setState = function(value) {
  state = value;
  io.emit('state', {occupied: state});	
};

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static('public'));

app.get('/state', function (req, res) {
  res.send({occupied: state});
});

app.get('/options', function(req, res) {
  res.send({timeout: timeout});
});

app.post('/options', function(req, res) {
  var time = req.body.timeout;
  if (time) { timeout = time; }
	
  res.send({ timeout: timeout });
});

http.listen(80, function(){
  console.log('listening on *:80');
});

io.on('connection', function(socket) {
  console.log('a user connected');
  io.emit('trigger', 'Hello');
  
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
});

pir.watch(function(err, value) {
  if (err) exit();  
  if (value === 1) {
    setState(true);	
	
	if (timer) { clearTimeout(timer); }
	timer = setTimeout(function() { setState(false); }, timeout);
  }
});
