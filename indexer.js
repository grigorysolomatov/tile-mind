class Indexer {
    constructor(projections) {
	this.projections = projections;
	this.getBy = {};
	this.getKeys().forEach(key => {
	    this.getBy[key] = {};
	});
    }
    getKeys() {
	return Object.keys(this.projections);
    }
    getCollisions(x) {
	let collisions = [];
	this.getKeys().forEach(key => {
	    const xKey = this.projections[key](x);
	    if (this.getBy[key][xKey] !== undefined) {collisions.push(key);}
	}); // Loops over all keys, which is not necessary, but we don't expect many keys anyway.
	return collisions;
    }
    insert(x) {
	if (this.getCollisions(x).length > 0) {return false;}
	this.getKeys().forEach(key => {
	    const xKey = this.projections[key](x);
	    this.getBy[key][xKey] = x;
	});
	return true;
    }
    remove(x) {
	this.getKeys().forEach(key => {
	    const xKey = this.projections[key](x);
	    delete this.getBy[key][xKey];
	});
    }
    getAll() {
	const baseKey = this.getKeys()[0];
	const elements = Object.values(this.getBy[baseKey]);
	return elements;
    }
}

module.exports = {
    Indexer,
};
