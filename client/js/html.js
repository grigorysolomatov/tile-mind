// GPT -------------------------------------------------------------------------
export function include({selector, attribute}) {
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
// -----------------------------------------------------------------------------

export function includeOld({selector, attribute}) {
    document.querySelectorAll(selector).forEach(element => {
	const otherHtmlFile = element.getAttribute(attribute);
	fetch(otherHtmlFile)
	    .then(response => response.text())
	    .then(data => {
		element.innerHTML = data;
	    })
	    .catch(error => console.error('Error loading content:', error));
    });
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
