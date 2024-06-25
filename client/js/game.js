import * as collections from './collections.js';
import * as timed from './timed.js';
import * as styles from '../styles/game.js';

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

	this.load.image('lava', 'assets/lava.png');
    }
    create() {
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
			    state: 'empty',
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
	    config: this.config.unit(object),
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

	this.config = config;
	this.state = new VisState(this);
    }
    clone() {
	const clone = new Sprite({
	    scene: this.sprite.scene,
	    x: this.sprite.x,
	    y: this.sprite.y,
	    config: this.config,
	});
	clone.state.toInstant(this.state.state);
	return clone;
    }
}
class VisState {
    constructor(sprite) {
	this.sprite = sprite;
	this.state = sprite.config.startState;
	this.states = sprite.config.states;
	this.tweens = [];

	this.originalScale = this.sprite.sprite.scale;

	this.toInstant(this.state);
    }
    toInstant(state) {
	this.sprite.sprite.setTint(this.states[state].tint);
	this.sprite.sprite.alpha = this.states[state].alpha;
	this.sprite.sprite.scale = this.states[state].scale*this.originalScale;

	this.state = state;
    }
    to({state, duration, onComplete, ease='Linear'}) {
	this.tweens.forEach(tween => tween.stop());
	this.tweens = [];
		
	const prevState = this.states[this.state];
	const nextState = this.states[state];
	const scene = this.sprite.sprite.scene;

	// Tween image -------------------------------------------------------
	if (this.states[state].image !== this.states[this.state].image) {
	    const clone = this.sprite.clone();

	    console.log(nextState.scale*this.originalScale)
	    scene.tweens.add({
		targets: clone.sprite,
		alpha: 0.0,
		scale: nextState.scale*this.originalScale,
		ease,
		duration: duration,
		onComplete: () => {clone.sprite.destroy()},
	    });

	    this.sprite.sprite.setTexture(this.states[state].image);
	    this.sprite.sprite.setDisplaySize(this.sprite.config.height, this.sprite.config.width);
	    this.originalScale = this.sprite.sprite.scale;
	    
	    this.sprite.sprite.scale = prevState.scale*this.originalScale;
	    this.sprite.sprite.alpha = 0.0;
	}
	
	// Tween tint ----------------------------------------------------------
	const startColor = Phaser.Display.Color.ValueToColor(this.sprite.sprite.tintTopLeft);
	const endColor = Phaser.Display.Color.ValueToColor(nextState.tint);	
	const tween1 = scene.tweens.addCounter({
            from: 0,
            to: 100,
            duration: duration,
            ease: ease,
            onUpdate: tween => {
		var value = tween.getValue();
		var color = Phaser.Display.Color.Interpolate.ColorWithColor(startColor, endColor, 100, value);
		this.sprite.sprite.setTint(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
            }
	});
	
	// Tween alpha & scale -------------------------------------------------
	const tween2 = scene.tweens.add({
            targets: this.sprite.sprite,
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
let game = null;
export function start({settings, state}) {
    const config = styles.getConfig(settings);

    scene = new MainScene(config);
    if (game) {game.destroy(true);}
    game = new Phaser.Game({
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
	scene.setValidClicks(scene.validClicks); // Hack for proper strength/weakness of valid clicks
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
