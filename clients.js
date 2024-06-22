const { v4: uuidv4 } = require('uuid');
const { Indexer } = require('./indexer');
const rooms = require('./rooms');

class Client { // Client data
    constructor({clientId, socketId, name, roomId=null}) {
	this.clientId = clientId;
	this.socketId = socketId;
	this.name = name;
	this.roomId = roomId;
    }
    static randomName() {
	const adjectives = [
	    "Happy", "Sad", "Angry", "Excited", "Bored", "Tired", "Energetic", "Lazy", 
	    "Brave", "Cowardly", "Curious", "Indifferent", "Optimistic", "Pessimistic", 
	    "Friendly", "Hostile", "Generous", "Stingy", "Polite", "Rude", "Honest", 
	    "Dishonest", "Loyal", "Disloyal", "Kind", "Mean", "Patient", "Impatient", 
	    "Calm", "Nervous", "Confident", "Insecure", "Creative", "Unimaginative", 
	    "Adventurous", "Cautious", "Ambitious", "Lazy", "Cheerful", "Gloomy", 
	    "Diligent", "Careless", "Enthusiastic", "Apathetic", "Forgiving", "Resentful", 
	    "Grateful", "Ungrateful",
	];
	const nouns = [
	    "Ace", "Bear", "Champ", "Duke", "Flash", "Ghost", "Hawk", "Ivy", "Joker", 
	    "King", "Lion", "Maverick", "Ninja", "Owl", "Panther", "Queen", "Raven", 
	    "Shadow", "Tiger", "Viper", "Wolf", "Zephyr", "Blaze", "Cobra", "Dragon", 
	    "Eagle", "Falcon", "Giant", "Hero", "Ice", "Jaguar", "Knight", "Legend", 
	    "Mamba", "Noble", "Oracle", "Phoenix", "Quake", "Ranger", "Samurai", 
	    "Titan", "Valkyrie", "Warrior", "Xenon", "Yeti", "Zorro", "Bandit", 
	    "Captain", "Dynamo",
	];

	const adjectiveIdx = Math.floor(Math.random() * adjectives.length);
	const nounIdx = Math.floor(Math.random() * nouns.length);

	const adjective = adjectives[adjectiveIdx];
	const noun = nouns[nounIdx];

	return `${adjective} ${noun}`;
    }
}
const clients = new Indexer({
    socketId: client => client.socketId,
    clientId: client => client.clientId,
});
const sockets = new Indexer({
    socketId: socket => socket.id,
});
const wantToPlay = new Set();

const clientCommands = { // Client's interface
    // command: (args, context) => {...},
    disconnect: (_, {clientId, io}) => {
	const client = clients.getBy.clientId[clientId];
	const socket = sockets.getBy.socketId[client.socketId];
	
	wantToPlay.delete(client.clientId);
	sockets.remove(socket);
	clients.remove(client);

	displayClients();
	broadcastAllClients(io);
    },
    getData: ({key}, {clientId, callback}) => { // Delete this
	let response = null;
	if (key === 'client') {
	    const client = clients.getBy.clientId[clientId];
	    response = {name: client.name, clientId: client.clientId};
	}
	if (key === 'allClients') {
	    response = clients.getAll().map(client => client.name);
	}
	callback(response);
    },
    getResponse: ({type, details}, {clientId, callback, io}) => {
	// {type, details} = request
	let response = null;
	if (type === 'getData') {
	    if (details === 'client') {
		const client = clients.getBy.clientId[clientId];
		response = {name: client.name, clientId: client.clientId};
	    }
	    if (details === 'allClients') {
		response = clients.getAll().map(client => client.name);
	    }
	}
	if (type === 'setData') {
	    const client = clients.getBy.clientId[clientId];
	    client.name = details.name;
	    response = {success: true, name: client.name};
	    broadcastAllClients(io);
	}
	if (type === 'processInput') {
	    response = rooms.processInput({clientId, input: details});
	}	
	callback(response);
    },
    playRandomOld: (_, {clientId}) => {	
	const client = clients.getBy.clientId[clientId];
	const socket = sockets.getBy.socketId[client.socketId];

	wantToPlay.add(client.clientId);
	
	while (wantToPlay.size >= 2) {
	    const players = [...wantToPlay].slice(0, 2).map(cid => {
		const client = clients.getBy.clientId[cid];
		wantToPlay.delete(cid);
		return client;
	    });
	    const playerIds = players.map(player => player.clientId);
	    rooms.startRoom(playerIds);
	}
    },
    playRandom: ({groupTag}, {clientId}) => {
	const client = clients.getBy.clientId[clientId];
	const socket = sockets.getBy.socketId[client.socketId];

	wantToPlay.add(client.clientId);
	
	while (wantToPlay.size >= 2) {
	    const players = [...wantToPlay].slice(0, 2).map(cid => {
		const client = clients.getBy.clientId[cid];
		wantToPlay.delete(cid);
		return client;
	    });
	    const playerIds = players.map(player => player.clientId);
	    rooms.startRoom(playerIds);
	}
    },
    gameInput: (input, {clientId}) => {
	const result = rooms.processInput({clientId, input});
	// ---------------------------------------------------------------------
	if (!result.loserInfo) {return;}
	const players  = rooms.getPlayerIds(clientId).map(playerId => clients.getBy.clientId[playerId]);
	const playerSockets = players.map(player => sockets.getBy.socketId[player.socketId]);
	playerSockets.forEach(socket => {
	    const winner = players[1 - result.loserInfo.player];
	    const loser = players[result.loserInfo.player];
	    const reason = {
		burn: 'burned',
		stuck: 'got stuck',
		resign: 'resigned',
	    }[result.loserInfo.reason];	    
	    const htmlContent = [
		`<h3>${winner.name} wins!</h3>`,
		`<p>${loser.name} ${reason}</p>`
	    ];
	    socket.emit('alert', htmlContent);
	});
    },
    rematch: (_, {clientId}) => {
	rooms.rematch(clientId);
    },
    gameReady: (_, {clientId}) => {
	rooms.setReady(clientId);
    },
};

function displayClients() {
    const names = clients.getAll().map(c => c.name);
    const numClients = names.length;
    console.log(
	`Clients(${numClients}):`,
	names.join(', '),
    );
}
function broadcastAllClients(io) {
    const allClientNames = clients.getAll().map(client => client.name);
    io.emit('allClients', allClientNames)
}
function init(io) { // Subscribe to client events
    rooms.init({clients, sockets});
    io.on('connection', socket => {
	const client = new Client({
	    socketId: socket.id,
	    clientId: uuidv4(),
	    name: Client.randomName(),
	});	
	sockets.insert(socket);
	clients.insert(client);

	// Subscribe to clientCommands -----------------------------------------
	Object.keys(clientCommands).forEach(command => {
	    socket.on(command, (args, callback) => clientCommands[command](args, { // context
		clientId: client.clientId,
		callback,
		io,
	    }));
	});
	// ---------------------------------------------------------------------
	displayClients();
	broadcastAllClients(io);
	//console.log(io.sockets.sockets.keys())
    });    
}

module.exports = {
    init,
};
