import * as collections from './collections.js';
import * as timed from './timed.js';

function getConfig(settings) {
    const window = {
	width: 700,
	height: 700,
	color: '#132',
    };
    const tile = {
	image: 'tile',
	height: 55,
	width: 55,	
	states: {
	    'blocked': {
		tint: 0x000000,
		alpha: 0.3,
		scale: 0.9,
	    },
	    'dot': {
		tint: 0xffffff,
		alpha: 0.0,
		scale: 0.0,
	    },
	    'wall': {
		tint: 0x338855,
		alpha: 1.0,
		scale: 1.0,
	    },
	    'lava': {
		tint: 0x883333,
		alpha: 0.8,
		scale: 1.0,
	    },
	},
	startState: 'dot',
    };
    const select = {
	image: 'select',
	height: 55,
	width: 55,	
	states: {
	    'strong': {
		tint: 0xffffff,
		alpha: 1.0,
		scale: 1.0,
	    },
	    'weak': {
		tint: 0xffffff,
		alpha: 0.5,
		scale: 1.0,
	    },
	    'hover': {
		tint: 0xffffff,
		alpha: 1.0,
		scale: 1.1,
	    },
	    'faded': {
		tint: 0xffffff,
		alpha: 0.0,
		scale: 0.9,
	    },
	},
	startState: 'faded',
    };
    const screenCover = {
	height: window.height,
	width: window.width,
	depth: 999,
	image: 'screenCover',
	states: {
	    'visible': {
		tint: 0x113322,
		alpha: 1.0,
		scale: 1.0,
	    },
	    'invisible': {
		tint: 0x113322,
		alpha: 0.0,
		scale: 1.0,
	    }
	},
	startState: 'visible',
    };
    const board = {
	nrows: settings.nrows,
	ncols: settings.ncols,
	step: 62,
    };
    const message = {
	//text: 'Fight!',
	textStyle: { font: '128px Georgia', fill: '#44ff88' },
	//depth: 999,
	states: {
	    'visible': {
		tint: 0xffffff,
		alpha: 1.0,
		scale: 1.0,
	    },
	    'invisible': {
		tint: 0xffffff,
		alpha: 0.0,
		scale: 1.0,
	    },
	},
	startState: 'visible',
    };
    const unit = ({players, type}) => {
	const colorFunc = (players) => {
	    if (players.length === 1) {
		if (players[0] === 0) {return 0xff4444;}
		if (players[0] === 1) {return 0x0088ff;}		
	    }
	    return 0x44cc44;
	};
	const color = colorFunc(players);
	return {
	    image: type,
	    height: 45,
	    width: 45,	
	    states: {
		'normal': {
		    tint: color,
		    alpha: 1.0,
		    scale: 1.0,
		},
		'hover': {
		    tint: color,
		    alpha: 1.0,
		    scale: 1.2,
		},
		'dot': {
		    tint: color,
		    alpha: 0.0,
		    scale: 0.0,
		},
	    },
	    startState: 'dot',
	};
    };
    
    const config = {
	window,
	tile,
	select,
	screenCover,
	board,
	message,
	unit,
    };
    return config;
}

class MainScene extends Phaser.Scene {
    constructor(config) {
	super({ key: 'MainScene' });
	this.config = config;
    }
    preload() {
	this.load.image('select', 'assets/select.svg');
	this.load.image('tile', 'assets/tile.svg');
	this.load.image('screenCover', 'assets/screenCover.svg');
	
	this.load.image('hqueen', 'assets/hqueen.svg');
	this.load.image('knight', 'assets/knight.svg');
	this.load.image('king', 'assets/king.svg');	
    }
    create() {
	//console.log(this.config.tile)
	const tileBoard = new Board({
	    scene: this,
	    x: 0.5*this.config.window.width,
	    y: 0.5*this.config.window.height,
	    config: this.config.board,
	    tileConfig: this.config.tile,
	});
	const selectBoard = new Board({
	    scene: this,
	    x: 0.5*this.config.window.width,
	    y: 0.5*this.config.window.height,
	    config: this.config.board,
	    tileConfig: this.config.select,
	});
	
	this.tileBoard = tileBoard;
	this.selectBoard = selectBoard;
	
	this.units = new collections.StringyDict();
	this.effects = new collections.StringyDict();
	this.validClicks = new collections.StringySet();
	
	timed.sequence({
	    caller: (what, when) => this.time.delayedCall(when, what, [], this),
	    timeline: [
		//timed.pause(500),
		() => this.message({text: '3', duration: 1000}),
		timed.pause(500),
		() => this.message({text: '2', duration: 1000}),
		timed.pause(500),
		() => this.message({text: '1', duration: 1000}),
		timed.pause(500),
		() => this.message({text: 'Fight!', duration: 1500}),
		timed.pause(500),
		() => tileBoard.forEachTile(({row, col}) => { // Animate tile creation
		    const tile = tileBoard.tiles.get({row, col});
		    const fadeInTile = () => {
			if (tile.state.state !== 'dot') {return;}
			tile.state.to({
			    state: 'blocked',
			    duration: 1000,
			    ease: 'Quint.Out',
			})
		    };
		    const center = {
			row: Math.floor(0.5*this.config.board.nrows),
			col: Math.floor(0.5*this.config.board.ncols),
		    };
		    const dist = Math.abs(row-center.row) + Math.abs(col - center.col);
		    this.time.delayedCall(50*dist, fadeInTile, [], this);
		}),
		timed.pause(500), // Careful: 500 overwrites lava from fadeInTile
		() => { // Subscribe to mouse events
		    selectBoard.forEachTile(pos => {
			const tile = selectBoard.tiles.get(pos);
			tile.sprite.setInteractive();
			tile.sprite.on('pointerover', () => {
			    //if (['blocked', 'wall'].includes(tile.state.state)) {return;}
			    if (!this.validClicks.has(pos)) {return;}
			    tile.state.to({
				state: 'hover',
				duration: 200,
				ease: 'Quint.Out',
			    });
			    const unit = this.units.get(pos);
			    if (!unit) {return};
			    unit.state.to({
				state: 'hover',
				duration: 200,
				ease: 'Quint.Out',
			    });
			});
			tile.sprite.on('pointerout', () => {
			    const unit = this.units.get(pos);
			    if (unit) {
				unit.state.to({
				    state: 'normal',
				    duration: 200,
				    ease: 'Quint.Out',
				});
			    };
			    if (!this.validClicks.has(pos)) {return;}
			    tile.state.to({
				state: (unit) ? 'strong' : 'weak',
				duration: 200,
				ease: 'Quint.Out',
			    });
			});
			tile.sprite.on('pointerdown', () => {
			    gameInput.setPos(pos);
			});
		    });
		},
		() => this.game.events.emit('boardReady'),
	    ]});
    }
    message({text, duration}) {
	const message = new Sprite({
	    scene: this,
	    text: text,
	    x: 0.5*this.config.window.width,
	    y: 0.5*this.config.window.height,
	    config: this.config.message,
	});
	message.state.to({
	    state: 'invisible',
	    duration: duration,
	    ease: 'Quint.Out',
	    onComplete: () => message.sprite.destroy(),
	});
    }
    spawn({pos, object}) {
	const tile = this.tileBoard.tiles.get(pos);
	const sprite = new Sprite({
	    scene: this,
	    x: tile.sprite.x,
	    y: tile.sprite.y,
	    config: this.config.unit(object),//{...this.config.tile, image: 'hqueen'},
	});
	sprite.state.to({
	    state: 'normal',
	    duration: 1000,
	    ease: 'Quint.Out',
	});
	this.units.set({
	    key: pos,
	    value: sprite,
	});
    }
    moveUnit({from, to}) {
	const unit = this.units.get(from);
	this.units.remove(from);
	this.units.set({
	    key: to,
	    value: unit,
	});
	const targetTile = this.tileBoard.tiles.get(to);
	this.tweens.add({
	    targets: unit.sprite,
	    x: targetTile.sprite.x,
	    y: targetTile.sprite.y,
	    duration: 500,
	    ease: 'Quint.Out',
	});
    }
    setValidClicks(validClicks) {
	this.validClicks = new collections.StringySet(validClicks);
	this.selectBoard.forEachTile((pos) => {
	    const tile = this.selectBoard.tiles.get(pos);
	    const effect = this.effects.get(pos);

	    //if (tile.state.state === 'wall') {return;}
	    if (this.validClicks.has(pos)) {
		tile.state.to({
		    state: (this.units.get(pos)) ? 'strong' : 'weak',
		    duration: 1000,
		    ease: 'Quint.Out',
		});
	    }
	    else {		
		tile.state.to({
		    state: 'faded',
		    duration: 1000,
		    ease: 'Quint.Out',
		});
	    }
	});
    }
    setEffects(effects) {
	this.effects = new collections.StringyDict({from: effects.dict});
	this.effects.keys().forEach(pos => {
	    //if (this.validClicks.has(pos)) {return;}	    
	    const tile = this.tileBoard.tiles.get(pos);
	    const effect = this.effects.get(pos);
	    tile.state.to({
		state: effect,
		duration: 1000,
		ease: 'Quint.Out',
	    });
	});
    }
}
class Sprite {
    constructor({scene, x, y, config, text}) {
	//const image = (text) ? Sprite.text2image({scene, config, text}) : config.image;
	if (text) {
	    this.sprite = scene.add.text(x, y, text, config.textStyle).setOrigin(0.5);
	    config.width = this.sprite.width;
	    config.height = this.sprite.height;
	}
	else {
	    this.sprite = scene.add.sprite(x, y, config.image)
	}
	this.sprite.setDisplaySize(config.width, config.height);
	this.sprite.depth = config.depth || 1;
	
	this.state = new VisState({
	    sprite: this.sprite,
	    states: config.states,
	    start: config.startState,
	});
    }
}
class VisState {
    constructor({sprite, states, start}) {
	this.sprite = sprite;
	this.state = start;
	this.states = states;
	this.tweens = [];

	this.originalScale = this.sprite.scale;

	this.toInstant(start);
    }
    toInstant(state) {
	this.sprite.setTint(this.states[state].tint);
	this.sprite.alpha = this.states[state].alpha;
	this.sprite.scale = this.states[state].scale*this.originalScale;

	this.state = state;
    }
    to({state, duration, onComplete, ease='Linear'}) {	
	this.tweens.forEach(tween => tween.stop());
	this.tweens = [];
	
	const prevState = this.states[this.state];
	const nextState = this.states[state];
	
	// Tween tint ----------------------------------------------------------
	//const startColor = Phaser.Display.Color.ValueToColor(prevState.tint);
	//console.log(this.sprite.tintTopLeft)
	const startColor = Phaser.Display.Color.ValueToColor(this.sprite.tintTopLeft);
	const endColor = Phaser.Display.Color.ValueToColor(nextState.tint);
	
	const tween1 = this.sprite.scene.tweens.addCounter({
            from: 0,
            to: 100,
            duration: duration,
            ease: ease,
            onUpdate: tween => {
		var value = tween.getValue();
		var color = Phaser.Display.Color.Interpolate.ColorWithColor(startColor, endColor, 100, value);
		this.sprite.setTint(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
            }
	});
	// Tween alpha & scale -------------------------------------------------
	const tween2 = this.sprite.scene.tweens.add({
            targets: this.sprite,
            alpha: nextState.alpha,
            scale: nextState.scale*this.originalScale,
            ease,
            duration,
	    onComplete,
	});
	
	// Update state and tweens ---------------------------------------------
	this.tweens = [tween1, tween2];
	this.state = state;
    }
}
class Board {
    constructor({scene, x, y, config, tileConfig}) {
	this.config = config;
	this.tiles = new collections.StringyDict();
	
	const {nrows, ncols, step} = config;
	
	this.forEachTile(({row, col}) => {
	    const tile = new Sprite({
		scene: scene,
		x: x - ncols*step*0.5 + step*0.5 + col*step,
		y: y - nrows*step*0.5 + step*0.5 + row*step,
		config: tileConfig,
	    });	    
	    this.tiles.set({
		key: {row, col},
		value: tile,
	    });
	});	
    }
    forEachTile(func) {
	for (let i = 0; i < this.config.nrows; i++) {
	    for (let j = 0; j < this.config.ncols; j++) {
		func({row: i, col: j});
	    }
	}
    }
}

let scene = null;
export function start({settings, state}) {
    const config = getConfig(settings);

    scene = new MainScene(config);
    const game = new Phaser.Game({
	type: Phaser.WEBGL,
	width: config.window.width,
	height: config.window.height,
	backgroundColor: config.window.color,
	transparent: true,
	parent: 'phaser-window',
	scene: scene,
    });

    const units = new collections.StringyDict({from: state.units});
    game.events.on('boardReady', () => {
	units.keys().forEach(key => {
	    scene.spawn({pos: key, object: units.get(key)});
	});
	scene.setValidClicks(scene.validClicks); // Hack for propper strength/weakness of valid clicks
	gameInput.runAction('ready');
	//server.gameReady();
    });
}
export function moveUnit({from, to}) {
    scene.moveUnit({from, to});
}
export function setValidClicks(valid) {
    scene.setValidClicks(valid);
}
export function setEffects(effects) {
    scene.setEffects(effects);
}
