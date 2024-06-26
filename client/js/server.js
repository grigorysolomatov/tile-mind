import * as game from './game.js';

const serverCommands = { // Server's interface
    startGame: ({opponent, settings, gameState}) => {
	const client = document.getElementById('client-name').value;
	
	document.getElementById('game-opponents').textContent = `${client} vs ${opponent}`;
	game.start({settings, state: gameState});
	pageFlip.to('page-game');
    },
    moveUnit: ({from, to}) => {
	game.moveUnit({from, to});
    },
    setValidClicks: (valid) => {
	game.setValidClicks(valid);
    },
    setEffects: (effects) => {
	game.setEffects(effects);
    },
    allClients: (allClients) => {
	document.getElementById('num-players').textContent = allClients.length;
    },
    dialogue: async ({htmlContent}, {callback}) => {
	const response = await popup.show(htmlContent);
	if (callback) {callback(response);}
    },
};
export class Server { // Wrapper around socket
    constructor(socket) {
	this.socket = socket;

	Object.keys(serverCommands).forEach(command => {
	    socket.on(command, (args, callback) => serverCommands[command](args, { // context
		callback,
	    }));
	});
    }
    getData(key) {
	return new Promise((resolve, reject) => {
	    this.socket.emit('getData', {key}, resolve);
	});
    }
    on(eventName, callback) {
	this.socket.on(eventName, callback);
    }
    playRandom() {
	const groupTag = document.getElementById('group-tag').value.trim();
	this.socket.emit('playRandom', {groupTag});
    }
    gameInput(input) {
	this.socket.emit('gameInput', input);
    }
    getClient() {
	return new Promise((resolve, reject) => {
	    this.socket.emit('getClient', null, resolve);
	});	
    }
    getAllClients() {
	return new Promise((resolve, reject) => {
	    this.socket.emit('getAllClients', null, resolve);
	});	
    }
    setName(name) {
	return new Promise((resolve, reject) => {
	    this.socket.emit('setName', {name}, resolve);
	});
    }
    gameReady() {
	this.socket.emit('gameReady');
    }
    rematch() {
	this.socket.emit('rematch');
    }
}
