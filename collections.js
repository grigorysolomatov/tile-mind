class StringySet {
    constructor(collection) {
	this.set = new Set();

	collection?.forEach(elem => this.add(elem));
    }
    add(elem){
	const elemStr = JSON.stringify(elem);
	this.set.add(elemStr);
    }
    has(elem){
	const elemStr = JSON.stringify(elem);
	//console.log(elemStr, this.set)
	return this.set.has(elemStr);
    }
    forEach(callback, thisArg) {
	this.set.forEach(elemStr => {
	    const elem = JSON.parse(elemStr);
	    callback(elem, thisArg);
	});
    }
    addAll(collection) {
	collection.forEach(elem => this.add(elem));
    }
    [Symbol.iterator]() {
	return [...this.set].map(elem => JSON.parse(elem))[Symbol.iterator]();
    }
}
class StringyDict {
    constructor({from={}, defaultValue=null} = {}) {
	this.defaultValue = defaultValue;
	this.dict = {...from};
    }
    set({key, value}) {
	this.dict[JSON.stringify(key)] = value;
    }
    get(key) {
	const value = this.dict[JSON.stringify(key)];
	if (!value) {return this.defaultValue;}
	return value;
    }
    remove(key) {
	delete this.dict[JSON.stringify(key)];
    }
    keys() {
	return Object.keys(this.dict).map(elementString => JSON.parse(elementString));
    }
    toArray() {
	return this.keys().map(key => [key, this.getByKey(key)]);
    }
}

module.exports = {
    StringySet,
    StringyDict,
};
