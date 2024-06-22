import * as html from './html.js';
import * as serverModule from './server.js';
//import * as uiModule from './ui.js';
import * as ui from './ui.js';
import * as input from './input.js';

async function main() {
    const socket = io();
    const pageFlip = new html.PageFlip('.page');
    const server = new serverModule.Server(socket);
    //const ui = new uiModule.UiBindings(server);
    const gameInput = new input.GameInput({
	defaultAction: 'click',
	behavior: {
	    'click': pos => server.gameInput({action: 'click', pos}),
	    'pass': () => server.gameInput({action: 'pass'}),
	    'ready': () => server.gameReady(),
	    'resign': async () => {
		const response = await popup.show([
		    '<h3>Resign?</h3>',
		    '<button onclick="popup.resolve(\'popup\')">Confirm</button>',
		    '<button onclick="popup.resolve(\'cancel\')">Cancel</button>',
		]);
		if (response === 'cancel') {return;}
		server.gameInput({action: 'resign'});
	    },
	},
    });
    const popup = new html.PopUp({
	parent: 'popup',
	content: 'popup-content',
	visible: 'visible',
    });

    // Globals -----------------------------------------------------------------
    window.pageFlip = pageFlip;
    window.ui = ui;
    window.gameInput = gameInput;
    window.server = server;
    window.popup = popup;
    // -------------------------------------------------------------------------
    
    pageFlip.to('page-home');    
    await html.include({
	selector: '.include',
	attribute: 'from',
    }); // Need await here? Maybe for acknowledge loading

    //popup.show(['Hello']);

    // Get own client data -----------------------------------------------------
    const client = await server.getClient();
    document.getElementById('client-name').value = client.name;
    // Get all clients ---------------------------------------------------------    
    //const allClients = await server.getResponse({type: 'getData', details: 'allClients'});
    const allClients = await server.getAllClients();
    document.getElementById('num-players').textContent = allClients.length;
    // -------------------------------------------------------------------------
}
main();
