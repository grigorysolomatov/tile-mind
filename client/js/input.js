export class GameInput {
    constructor({behavior, defaultAction}) {
	this.action = null;
	this.pos = null;
	this.behavior = behavior;
	this.defaultAction = defaultAction;
    }
    setAction(action) {
	this.action = action;
    }
    runAction(action) {
	this.setAction(action);
	this.parse();
    }
    setPos(pos) {
	this.pos = pos;
	const response = this.parse();
	return response;
    }
    async parse() {
	this.action = this.action || this.defaultAction;

	const response = await this.behavior[this.action](this.pos);
	
	this.action = null;
	this.pos = null;

	return response;
    }
}



