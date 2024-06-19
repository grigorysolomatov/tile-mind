import * as html from './html.js';
import * as serverModule from './server.js';
import * as uiModule from './ui.js';
import * as input from './input.js';

async function main() {
    const socket = io();
    const pageFlip = new html.PageFlip('.page');
    const server = new serverModule.Server(socket);
    const ui = new uiModule.UiBindings(server);
    const gameInput = new input.GameInput({
	defaultAction: 'click',
	behavior: {
	    'click': pos => server.gameInput({action: 'click', pos}),
	    'pass': () => server.gameInput({action: 'pass'}),
	    'resign': () => server.gameInput({action: 'resign'}),
	    'ready': () => server.gameReady(),
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
    }); // Need await here? Maybe for popup loading

    // Get own client data -----------------------------------------------------
    const client = await server.getResponse({type: 'getData', details: 'client'});
    document.getElementById('client-name').value = client.name;
    // Get all clients ---------------------------------------------------------    
    const allClients = await server.getResponse({type: 'getData', details: 'allClients'});
    document.getElementById('num-players').textContent = allClients.length;
    // -------------------------------------------------------------------------
}
main();
