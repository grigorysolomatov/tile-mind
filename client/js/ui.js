export class UiBindings { // Exposes js to html
    constructor(server) {
	this.server = server;
    }
    playRandom() {
	this.server.playRandom();
    }
    blurName(event) {
	if (event.key === 'Enter' || event.keyCode === 13) {
	    event.target.blur();
        }
    }
    async onBlurName(event) {
	const name = document.getElementById('client-name').value;
	const result = await server.getResponse({type: 'setData', details: {name}});
	document.getElementById('client-name').value = result.name;
    }
}
