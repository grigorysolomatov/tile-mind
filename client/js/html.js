export async function include({selector, attribute}) {
    const promises = Array.from(document.querySelectorAll(selector)).map(element => {
        const otherHtmlFile = element.getAttribute(attribute);
        return fetch(otherHtmlFile)
            .then(response => response.text())
            .then(data => {
		element.innerHTML = data;
            })
            .catch(error => console.error('Error loading content:', error));
    });

    return Promise.all(promises);
}
export class PageFlip {
    constructor(selector) {
	this.page = null;
	this.selector = selector;
    }
    to(pageId) {
	document.querySelectorAll(this.selector).forEach(page => {
	    page.style.display = 'none';
	});
	document.getElementById(pageId).style.display = 'block';
	this.page = pageId;
    }
}
export class PopUp {
    constructor({parent, content, visible}) {
	this.parent = parent;
	this.content = content;
	this.visible = visible;
    }
    show(innerHTML) {
	const parent = document.getElementById(this.parent);
	const content = document.getElementById(this.content);
	content.innerHTML = innerHTML.join('\n');
	parent.classList.add(this.visible);
    }
    hide() {
	const parent = document.getElementById(this.parent);
	const content = document.getElementById(this.content);
	parent.classList.remove(this.visible);
    }
}
