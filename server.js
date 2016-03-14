// requiring in our node modules, creating our express app variable
var express = require('express');
var path = require('path');
var app = express();

// static content
// note how it's defined BEFORE any routing rules
app.use(express.static(path.join(__dirname, './static')));

// view engine and view folder
// also defined BEFORE routing rules
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

// our 'root route' for '/'
// note that we got all our requires out of the way
// before we get here.
app.get('/', function(req, res){
  res.render('index');
});

// global variables that should be replaced with DB
var active_users = {};
var chat_log = '';

// our app listen and the port
// also note for sockets, we're storing
// this in a variable called server
var server = app.listen(8877, function(){
  console.log('Fun chatroom at port 8877');
})

// io variable, requiring sockets, passing server
var io = require('socket.io').listen(server);

// our io connect, all socket code will be nested here
// also note the callback that holds socket.
// that socket param will be where the info for
// each connected socket will be held
io.sockets.on('connection', function(socket){

  // console log to see incoming connections
  console.log('Socket ' + socket.id + ' has connected to our chatroom!');

  // create name logic, two possible emits depending on
  // if the user is active or not
  socket.on('create:name', function(data){
    if(active_users[data.username] === undefined){
      active_users[data.username] = socket.id;
      socket.emit('send:all', {history: chat_log});
    }else{
      socket.emit('name:failed', {error: 'Name exists'});
    }
  })

  // socket event for broadcasting sent messages to all other clients
  // as well as save it to the chat log.
  socket.on('send:message', function(data){
    chat_log += data.message;
    socket.broadcast.emit('send:new_message', {new_message: data.message})
    console.log(data);
  })

  // server disconnect message
  socket.on('disconnect', function(){
    console.log('Socket ' + socket.id + ' has disconnected from our chatroom!');
  })

})
