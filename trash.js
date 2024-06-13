validateInput({player, input}) {
    if (player !== this.player) {return {
	valid: false,
	reason: 'playerTurn'
    };}
    if (this.actions < 1) {return {
	valid: false,
	reason: 'noActions'
    };}
    if (!this.selected && input.action === 'click') {
	const unit = this.board.get(input.pos);
	if (!unit) {return {
	    valid: false,
	    reason: 'noUnitSelected',
	};}
	if (!unit.players.includes(this.player)) {
	    return {
		valid: false,
		reason: 'unitNotOwned',
	    };}
    }
    if (this.selected && input.action === 'click') {
	const unit = this.board.get(this.selected);
	const validMoves = new StringySet(unit.getValidMoves({
	    pos: this.selected,
	    board: this.board,
	}));
	if (!validMoves.has(input.pos)) {return {
	    valid: false,
	    reason: 'invalidMove',
	};};
    }

    return {
	valid: true,	    
    };
}
getValidClicksOld(player) { // TODO: inefficient	
    const valid = [];
    for (let row = 0; row < this.nrows; row++) {
	for (let col = 0; col < this.ncols; col++) {
	    const input = {
		action: 'click',
		pos: {row, col}
	    };
	    const validation = this.validateInput({player, input}); 
	    if (validation.valid) {valid.push(input.pos);}
	}
    }
    
    return valid; // Use StringySet instead og array?
}
processInputOld({player, input}) {
    const validation = this.validateInput({player, input});
    if (!validation.valid) {return validation;}	
    if (this.selected && input.action === 'click') {
	validation.move = {
	    from: this.selected,
	    to: input.pos,
	};
	
	const unit = this.board.get(this.selected);
	this.board.remove(this.selected);
	this.board.set({
	    key: input.pos,
	    value: unit,
	});
	this.selected = input.pos;	   
    }
    if (!this.selected && input.action === 'click') {
	const unit = this.board.get(input.pos);
	this.selected = input.pos;
    }

    return validation;
}
