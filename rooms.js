const { v4: uuidv4 } = require('uuid');
const { Indexer } = require('./indexer');
const { StringyDict } = require('./collections');
const game = require('./game');

class Room {
    constructor({playerIds, settings, roomId}) {
	this.playerIds = [...playerIds];
	this.ready = [false, false];
	this.settings = settings;
	this.roomId = roomId;
	this.game = null;
    }
    start() {
	if (Math.random() < 0.5) { // Randomize first player
	    this.playerIds = [this.playerIds[1], this.playerIds[0]];
	}
	this.game = new game.Game(this.settings);
    }
    processInput({playerId, input}) {
	if (!this.game) {return;}
	
	const playerIdx = this.playerIds.indexOf(playerId);	
	if (playerIdx === -1) {return;}

	const response = this.game.processInput({player:playerIdx, input});

	if (response.valid) { // Weird ordering of if statements
	    this.sendValidClicks();
	}
	
	if (response.select) {return response;}
	if (response.move) {
	    const players = this.playerIds.map(playerId => clients.getBy.clientId[playerId])
	    // -----------------------------------------------------------------
	    for (const player of players) {if (!player) {return;}}
	    // -----------------------------------------------------------------
	    const playerSockets = players.map(player => sockets.getBy.socketId[player.socketId]);
	    playerSockets.forEach(socket => {
		socket.emit('moveUnit', response.move);
	    });

	    this.sendEffects();
	    //return response;
	}	

	return response;
    }
    getValidClicks(playerId) {
	if (!this.game) {return;}

	const playerIdx = this.playerIds.indexOf(playerId);	
	if (playerIdx === -1) {return;}

	const validClicks = this.game.getValidClicks(playerIdx);
	return validClicks;
    }
    setReady(playerId) {
	const playerIdx = this.playerIds.indexOf(playerId);
	this.ready[playerIdx] = true;
	if (this.ready[1-playerIdx]) {return;}

	this.sendValidClicks();
	this.sendEffects();
    }
    sendValidClicks() {
	const players = this.playerIds.map(playerId => clients.getBy.clientId[playerId])
	// ---------------------------------------------------------------------
	for (const player of players) {if (!player) {return;}}
	// ---------------------------------------------------------------------
	const playerSockets = players.map(player => sockets.getBy.socketId[player.socketId]);
	playerSockets.forEach((socket, playerIdx) => {
	    const valid = this.game.getValidClicks(playerIdx);
	    socket.emit('setValidClicks', valid);
	});
    }
    sendEffects() {
	const players = this.playerIds.map(playerId => clients.getBy.clientId[playerId])
	const playerSockets = players.map(player => sockets.getBy.socketId[player.socketId]);
	const effects = this.game.getEffects();
	playerSockets.forEach((socket, playerIdx) => {
	    socket.emit('setEffects', effects);
	});
    }
}

let clients = null;
let sockets = null;
const rooms = new Indexer({
    roomId: room => room.roomId,
});

function init({clients: c, sockets: s}) { // Set clients & sockets
    clients = c;
    sockets = s;
}
function startRoom(players) {
    const room = new Room({
	playerIds: players.map(player => player.clientId),
	roomId: uuidv4(),
	settings: {
	    nrows: 11,
	    ncols: 11,	    
	},
    });
    room.start();
    const game = room.game;
    rooms.insert(room);
    
    players.forEach(player => {player.roomId = room.roomId});
    playerSockets = players.map(player => sockets.getBy.socketId[player.socketId]);
    playerSockets.forEach((socket, i) => {
	socket.emit('startGame', {
	    opponent: players[1-i].name,
	    settings: room.settings,
	    gameState: game.getState(),
	});
    });
}
function processInput({clientId, input}) {
    const client = clients.getBy.clientId[clientId];
    const room = rooms.getBy.roomId[client.roomId];
    // -------------------------------------------------------------------------
    const players = room.playerIds.map(playerId => clients.getBy.clientId[clientId]);
    for (const player of players) {if (!player) {return;}}
    // -------------------------------------------------------------------------
    const response = room.processInput({
	playerId: client.clientId,
	input: input,
    });
    return response;
}
function getValidClicks(clientId) {
    const client = clients.getBy.clientId[clientId];
    const room = rooms.getBy.roomId[client.roomId];
    return room.getValidClicks(clientId);
}
function setReady(clientId) {
    const player = clients.getBy.clientId[clientId];
    const room = rooms.getBy.roomId[player.roomId];
    room.setReady(clientId);
}

module.exports = {
    startRoom,
    init,
    processInput,
    getValidClicks,
    setReady,
};
