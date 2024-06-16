const { StringyDict, StringySet } = require('./collections');

// Units -----------------------------------------------------------------------
class King {
    constructor({players}) {
	this.type = 'king';
	this.players = [...players];	
    }
    getValidMoves({pos, units, effects}) {
	const offsets = [
	    {row: -1, col: -1},
	    {row: -1, col:  1},
	    {row:  1, col: -1},
	    {row:  1, col:  1},
	    
	    {row:  0, col:  1},
	    {row:  1, col:  0},
	    {row: -1, col:  0},
	    {row:  0, col: -1},
	];
	const candidates = offsets.map(offset => {
	    return {row: pos.row + offset.row, col: pos.col + offset.col};
	});	
	const unoccupied = candidates.filter(pos => !units.get(pos));
	const unstuck = unoccupied.filter(pos => effects.get(pos) !== 'wall');
	return unstuck;
    }
}
class Knight {
    constructor({players}) {
	this.type = 'knight';
	this.players = [...players];	
    }
    getValidMoves({pos, units, effects}) {
	const offsets = [
	    {row: -2, col: -1},
	    {row: -2, col:  1},
	    {row:  2, col: -1},
	    {row:  2, col:  1},
	    
	    {row: -1, col: -2},
	    {row: -1, col:  2},
	    {row:  1, col: -2},
	    {row:  1, col:  2},
	];
	const candidates = offsets.map(offset => {
	    return {row: pos.row + offset.row, col: pos.col + offset.col};
	});	
	const unoccupied = candidates.filter(pos => !units.get(pos));
	const unstuck = unoccupied.filter(pos => effects.get(pos) !== 'wall');
	return unstuck;
    }
}
class HQueen {
    constructor({players}) {
	this.type = 'hqueen';
	this.players = [...players];
    }
    getValidMoves({pos, units, effects}) {
	const dirs = [
	    {row: -1, col: -1},
	    {row:  1, col:  1},
	    {row: -1, col:  1},
	    {row:  1, col: -1},
	    
	    {row: -1, col:  0},
	    {row:  0, col: -1},
	    {row:  1, col:  0},
	    {row:  0, col:  1},
	];
	const valid = dirs
	      .map(dir => this.getValidMoveByRay({pos, units, effects, dir}))
	      .filter(p => (p.row !== pos.row || p.col !== pos.col));
	return valid;
    }
    getValidMoveByRay({pos, units, effects, dir}) {
	const current = {
	    row: pos.row,
	    col: pos.col,
	};
	const next = {
	    row: current.row + dir.row,
	    col: current.col + dir.col,
	}
	while (!units.get(next) && effects.get(next) !== 'wall') {
	    next.row += dir.row;
	    next.col += dir.col;
	    current.row += dir.row;
	    current.col += dir.col;
	}
	return current;
    }
    
}
// -----------------------------------------------------------------------------
class Game {
    constructor({nrows, ncols}) {
	this.units = new StringyDict();
	this.effects = new StringyDict();
	
	this.nrows = nrows;
	this.ncols = ncols;
	this.player = 0;
	this.actions = 3;
	this.selected = null;

	this.validations = { // this.validations[action](player) = [valid clicks]
	    select: (player) => {
		if (player !== this.player) {return [];}
		const units = this.units;
		const valid = units.keys().filter(pos => units.get(pos).players.includes(player));
		return valid;
	    },
	    move: (player) => {
		if (player !== this.player) {return [];}

		//const units = this.units;
		const valid = this.units.get(this.selected).getValidMoves({
		    pos: this.selected,
		    units: this.units,
		    effects: this.effects,
		});
		return valid;
	    },
	};
	this.effectPlacer = {
	    line: ({from, to, effect}) => {
		const step = {
		    row: Math.sign(to.row - from.row),
		    col: Math.sign(to.col - from.col),
		}
		const current = {row: from.row, col: from.col};
		while (current.row !== to.row || current.col !== to.col) {
		    this.effects.set({key: current, value: effect});
		    current.row += step.row;
		    current.col += step.col;
		}
		this.effects.set({key: current, value: effect});
	    },
	    box: ({from, to, effect}) => {
		this.effectPlacer.line({
		    from,
		    to: {row: from.row, col: to.col},
		    effect,
		});
		this.effectPlacer.line({
		    from,
		    to: {row: to.row, col: from.col},
		    effect,
		});
		this.effectPlacer.line({
		    from: {row: to.row, col: from.col},
		    to,
		    effect,
		});
		this.effectPlacer.line({
		    from: {row: from.row, col: to.col},
		    to,
		    effect,
		});
	    },
	};
	this.checkLoss = {
	    burn: pos => {
		const burn = this.effects.get(pos) === 'lava';
		return burn;
	    },
	    stuck: pos => {
		const unit = this.units.get(pos);
		const valid = unit.getValidMoves({pos, units: this.units, effects: this.effects});
		const stuck = valid.length === 0;
		return stuck;		
	    },
	};
	this.loserInfo = null;

	this.init();
    }
    init() {
	this.units.set({
	    key: {row: 1, col: 1},
	    value: new HQueen({players: [0]}),
	});	
	this.units.set({
	    key: {row: this.nrows-2, col: this.nrows-2},
	    value: new HQueen({players: [0]}),
	});
	this.units.set({
	    key: {row: 1, col: this.ncols-2},
	    value: new HQueen({players: [1]}),
	});
	this.units.set({
	    key: {row: this.nrows-2, col: 1},
	    value: new HQueen({players: [1]}),
	});

	//this.units.keys().forEach(pos => {
	//    this.effects.set({key: pos, value: 'wall'});
	//});

	this.effectPlacer.box({
	    from: {row: 0, col: 0},
	    to: {row: this.nrows-1, col: this.ncols-1},
	    effect: 'lava',
	});
	this.effectPlacer.box({
	    from: {row: -1, col: -1},
	    to: {row: this.nrows, col: this.ncols},
	    effect: 'wall',
	});
    }
    getState() {
	return {
	    units: this.units.dict,
	    player: this.player,
	    actions: this.actions,
	};
    }
    getValidClicks(player) {
	if (this.loserInfo) {return [];}
	if (this.actions === 3) {
	    let valid = this.validations['select'](player);
	    if (this.selected) {
		valid = valid.concat(this.validations['move'](player));
	    }
	    return valid;
	}
	else {
	    const action = (!this.selected) ? 'select' : 'move';
	    return this.validations[action](player);
	}
    }
    pass() {
	this.actions = 3;
	this.player = 1 - this.player;
	this.selected = null;
    }
    processInput({player, input}) {
	if (this.loserInfo) {return {valid: false};}
	const result = this.processInputNoWinner({player, input});
	this.loserInfo = this.loserInfo || this.getLoserInfo(); // Maybe resigned
	return {...result, loserInfo: this.loserInfo};
    }
    processInputNoWinner({player, input}) {
	if (input.action === 'resign') {
	    this.loserInfo = {
		reason: 'resign', player
	    };
	    return {
		valid: true,
		action: 'resign',
	    };
	}
	if (input.action === 'pass' && this.actions < 3 && player === this.player) {
	    this.pass();
	    return {
		valid: true,
		action: 'pass',
	    };
	}
	// ---------------------------------------------------------------------
	const valid = new StringySet(this.getValidClicks(player));
	if (!valid.has(input.pos)) {return {valid: false};}
	const action = (this.actions === 3 && this.units.get(input.pos)) ? 'select' : 'move';
	
	if (action === 'select') {
	    this.selected = input.pos;
	    return {
		valid: true,
		select: this.selected,
	    };
	}
	if (action === 'move') {
	    //this.effects.set({key: input.pos, value: 'wall'});
	    this.effects.set({key: this.selected, value: 'wall'}); // Eye
	    
	    const unit = this.units.get(this.selected);
	    this.units.remove(this.selected);
	    this.units.set({
		key: input.pos,
		value: unit,
	    });
	    const prevSelected = this.selected;
	    this.selected = input.pos;	    

	    this.actions -= 1;
	    if (this.actions < 1) {this.pass();}
	    
	    return {
		valid: true,
		move: {from: prevSelected, to: input.pos},
	    };
	}
    }
    getLoserInfo() {
	const current = [];
	const opponent = [];
	this.units.keys().forEach(pos => {
	    const unit = this.units.get(pos);
	    const currentPlayer = unit.players.length === 1 && unit.players[0] === this.player;
	    const opponentPlayer = unit.players.length === 1 && unit.players[0] === 1 - this.player;
	    if (currentPlayer) {current.push(pos);}
	    if (opponentPlayer) {opponent.push(pos);}
	});

	for (const pos of opponent) {
	    if (this.checkLoss.stuck(pos)) {return {pos, reason: 'stuck', player: 1 - this.player};}
	}
	for (const pos of current) {
	    if (this.checkLoss.stuck(pos)) {return {pos, reason: 'stuck', player: this.player};}
	}
	for (const pos of opponent) {
	    if (this.checkLoss.burn(pos)) {return {pos, reason: 'burn', player: 1 - this.player};}
	}
    }
    getEffects() {
	const effects = new StringyDict();
	this.effects.keys().filter(({row, col}) => {
	    return row >= 0 && row < this.nrows && col >= 0 && col < this.ncols
	}).forEach(pos => {
	    effects.set({key: pos, value: this.effects.get(pos)});
	});
	return effects;
    }    
}

module.exports = {
    Game,
};
