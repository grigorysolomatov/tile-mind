const { v4: uuidv4 } = require('uuid');
const { Indexer } = require('./indexer');
const { StringyDict } = require('./collections');
const game = require('./game');

let clients = null;
let sockets = null;
const rooms = new Indexer({
    roomId: room => room.roomId,
});
 
class Room {
    constructor({playerIds, roomId}) {
	this.playerIds = [...playerIds];
	this.ready = [false, false]; // Ready to receive valid clicks
	this.wantsRematch = [false, false];
	//this.settings = settings;
	this.roomId = roomId;
    }
    getNumPawnsVotes() {
	const players = this.playerIds.map(playerId => clients.getBy.clientId[playerId]);
	return Promise.all(
	    players.map(player => player.getNumPawnsVote())
	);
    }
    async start() {
	const responses = await this.getNumPawnsVotes();
	const numPawns = responses[Math.floor(Math.random()*responses.length)];

	const settings = {nrows: 11, ncols: 11, numPawns};
	
	this.ready = [false, false];
	this.wantsRematch = [false, false];
	
	if (Math.random() < 0.5) { // Randomize first player
	    this.playerIds = [this.playerIds[1], this.playerIds[0]];
	}
	this.game = new game.Game(settings);
	
	const players = this.playerIds.map(playerId => clients.getBy.clientId[playerId]);
	
	players.forEach(player => {player.roomId = this.roomId});
	const playerSockets = players.map(player => sockets.getBy.socketId[player.socketId]);	
	playerSockets.forEach((socket, i) => {
	    socket.emit('startGame', {
		opponent: players[1-i].name,
		settings: settings,
		gameState: this.game.getState(),
	    });
	});
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
	if (!this.ready[1-playerIdx]) {return;} // EYE should there be "!" ?

	this.sendValidClicks();
	this.sendEffects();
    }
    setWantsRematch(playerId) {
	if (!this.game.isOver()) {return;}
	
	const playerIdx = this.playerIds.indexOf(playerId);
	this.wantsRematch[playerIdx] = true;

	if (!this.wantsRematch[1-playerIdx]) {return;}

	this.start();
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

function init({clients: c, sockets: s}) { // Set clients & sockets
    clients = c;
    sockets = s;
}
function startRoom(playerIds) {
    const players = playerIds.map(playerId => clients.getBy.clientId[playerId]);
    const room = new Room({
	playerIds: players.map(player => player.clientId),
	roomId: uuidv4(),
    });
    rooms.insert(room);        
    room.start();
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
function getPlayerIds(playerId) {
    const client = clients.getBy.clientId[playerId];
    const room = rooms.getBy.roomId[client.roomId];
    return room.playerIds;
}
function rematch(playerId) {
    const player = clients.getBy.clientId[playerId];
    const room = rooms.getBy.roomId[player.roomId];
    room.setWantsRematch(playerId);        
}

module.exports = {
    startRoom,
    init,
    processInput,
    getValidClicks,
    setReady,
    getPlayerIds,
    rematch,
};
