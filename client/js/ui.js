export class UiBindings { // Expozes js to html
    constructor(server) {
	this.server = server;
    }
    playRandom() {
	this.server.playRandom();
    }
}
