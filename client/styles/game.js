export function getConfig(settings) {
    const window = {
	width: 700,
	height: 700,
	color: '#fff',
    };
    const tile = {
	image: 'tile',
	height: 55,
	width: 55,
	states: {
	    'empty': {
		tint: 0x000000,
		alpha: 0.3,
		scale: 0.5,
	    },
	    'dot': {
		tint: 0xffffff,
		alpha: 1,
		scale: 0.0,
	    },
	    'wall': {
		image: 'tile',
		tint: 0x9babb2,
		alpha: 1.0,
		scale: 1.0,
	    },
	    'lava': {
		image: 'lava',
		tint: 0xaa4444,
		alpha: 1.0,
		scale: 0.8,
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
		tint: 0x44ff44,
		alpha: 1.0,
		scale: 1.0,
	    },
	    'weak': {
		tint: 0x44ff44,
		alpha: 1,
		scale: 0.5,
	    },
	    'hover': {
		tint: 0x44ff44,
		alpha: 1.0,
		scale: 1.1,
	    },
	    'faded': {
		tint: 0xffffff,
		alpha: 0.0,
		scale: 0.0,
	    },
	},
	startState: 'faded',
    };
    const board = {
	nrows: settings.nrows,
	ncols: settings.ncols,
	step: 62,
    };
    const message = {
	textStyle: { font: '128px Georgia', fill: '#fff' },
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
		if (players[0] === 0) {return 0xf9c22b;}
		if (players[0] === 1) {return 0x4d9be6;}
	    }
	    if (players.length > 1) {return 0x44cc44;}
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
	board,
	message,
	unit,
    };
    return config;
}
