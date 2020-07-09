const express = require('express');
const http = require('http');
const socketio = require('socket.io')
const { generateMessage } = require('./messages.js');
const { addUser,removeUser,getUser, getUsersInRoom} = require('./users.js');

const app = express();
const server = http.createServer(app)
const io = socketio(server)


console.log(__dirname)
app.set('views', 'public')
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.render('index')
})

io.on('connection', (socket) => {
    console.log('New socket connection')
    
    socket.on('join', (object, callback) => {
        const {error, user} = addUser({ id: socket.id, username: object.username, room: object.room})

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Welcome!'))
        socket.broadcast.to(object.room).emit('message', generateMessage(user.username + ' connected'))
        io.to(user.room).emit('roomData', {
            room:user.room,
            users: getUsersInRoom(user.room)
        })

        callback()

        socket.on('disconnect', () => {
            const userToRemove = removeUser(socket.id)
            if (userToRemove) {
                socket.broadcast.to(object.room).emit('message', generateMessage(user.username + ' disconnected'))
                io.to(user.room).emit('roomData', {
                    room: user.room,
                    users: getUsersInRoom(user.room)
                })
            }
          });

        socket.on('sendMessage', (message) => {
            io.to(object.room).emit('message', generateMessage(message))
        })
    })
})

const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log('listening on ' + port)
})