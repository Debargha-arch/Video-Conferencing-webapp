const app = require('express')();
const server = require('http').createServer(app);
const cors = require('cors');

const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: [ "GET", "POST" ]
	}
});
app.use(cors());

const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
	res.send('Server is running...');
});

// const { Server } = require('socket.io');

// const port = process.env.PORT || 8000;

// const io = new Server(port, {
//     cors: true
// });

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

io.on("connection", (socket) => {
    console.log("Socket Connected Successfully...");
    socket.on('room:join', (data) => {
        console.log(data);
        const { email, room } = data;
        emailToSocketIdMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);
        io.to(room).emit('user:joined', {email, id: socket.id });
        socket.join(room);
        io.to(socket.id).emit('room:join', data);
    });

    socket.on('user:call', ({to, offer}) => {
        // console.log({to, offer});
        io.to(to).emit("incoming:call", {from: socket.id, offer});
    });

    socket.on('call:accepted', ({to, ans}) => {
        io.to(to).emit("call:accepted", {from: socket.id, ans});
    });

    socket.on('peer:nego:needed', ({to, offer}) => {
        io.to(to).emit("peer:nego:needed", {from: socket.id, offer});
    });

    socket.on('peer:nego:done', ({to, ans}) => {
        // console.log({to, ans});
        io.to(to).emit("peer:nego:final", {from: socket.id, ans});
    });
})

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));