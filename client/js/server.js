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
    alert: (htmlContent) => {
	htmlContent.push('<button onclick="popup.resolve()">OK</button>');
	console.log(htmlContent);
	popup.show(htmlContent);
    },
    allClients: (allClients) => {
	document.getElementById('num-players').textContent = allClients.length;
    }
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
	    this.socket.emit('getData', {key}, client => resolve(client));
	});
    }
    on(eventName, callback) {
	this.socket.on(eventName, callback);
    }
    playRandom() {
	this.socket.emit('playRandom');
    }
    gameInput(input) {
	this.socket.emit('gameInput', input);
    }
    getResponse({type, details}) {
	return new Promise((resolve, reject) => {
	    this.socket.emit('getResponse', {type, details}, client => resolve(client));
	});
    }
    gameReady() {
	this.socket.emit('gameReady');
    }
    rematch() {
	this.socket.emit('rematch');
    }
}
