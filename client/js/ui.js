export class UiBindings { // Exposes js to html
    constructor(server) {
	this.server = server;
    }
    playRandom() {
	this.server.playRandom();
    }
}
