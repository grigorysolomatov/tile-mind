export function blur(event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
	event.target.blur();
    }
}

export async function onBlurName(event) {
    const name = document.getElementById('client-name').value;
    //const result = await server.getResponse({type: 'setData', details: {name}});
    const result = await server.setName(name);
    document.getElementById('client-name').value = result.name;
}
