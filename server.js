const express = require('express');
const app = express();
const cors = require('cors');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
debug: true
});
const { v4: uuidv4 } = require('uuid');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/peerjs', peerServer);
app.use(cors());

app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.sockets.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).emit('user-connected', userId);

    socket.on('message', (message) => {
          //send message to the same room
        io.to(roomId).emit('createMessage', message);
    });

    socket.on('disconnect', () => {
        socket.to(roomId).emit('user-disconnected', userId);
    });
});
});
server.listen(process.env.PORT || 3000);