class Matcher {
    constructor() {
	this.table = {};
    }
    add({id, tag=''}) {
	this.table[tag] = this.table[tag] || new Set();
	this.table[tag].add(id);
	return this;
    }
    remove(id) {
	Object.keys(this.table).forEach(tag => {
	    this.table[tag].delete(id);
	    if (this.table[tag].size === 0) {
		delete this.table[tag];
	    }
	});
	return this;
    }
    match(tag, callback = (p1, p2) => {}) {
	if (this.table[tag].size > 1) {
	    const [p1, p2] = [...this.table[tag]].slice(0, 2).map(p => {
		this.table[tag].delete(p);
		return p;
	    });
	    callback(p1, p2);
	}
	return this;
    }
}

module.exports = {
    Matcher,
};
