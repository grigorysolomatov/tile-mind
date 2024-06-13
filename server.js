const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
// -----------------------------------------------------------------------------
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(express.static(path.join(__dirname, 'client')));
// -----------------------------------------------------------------------------
const clients = require('./clients');
clients.init(io);
// -----------------------------------------------------------------------------
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
