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

    // Globals -----------------------------------------------------------------
    window.pageFlip = pageFlip;
    window.ui = ui;
    window.gameInput = gameInput;
    window.server = server;
    // -------------------------------------------------------------------------
    
    pageFlip.to('page-home');
    html.includeAllPages({
	selector: '.include',
	attribute: 'page',
    });

    // Get own client data -----------------------------------------------------
    const client = await server.getResponse({type: 'getData', details: 'client'});
    document.getElementById('client-name').textContent = client.name;
    // Get all clients, and subscribe to future broadcasting--------------------    
    const setAllClients = (allClients) => {
	document.getElementById('num-players').textContent = allClients.length;
    };
    //const allClients = await server.getData('allClients');
    const allClients = await server.getResponse({type: 'getData', details: 'allClients'});
    setAllClients(allClients);
    server.on('allClients', setAllClients);
    // -------------------------------------------------------------------------
}
main();
