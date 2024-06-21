export function getConfig(settings) {
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
	    'empty': {
		tint: 0x000000,
		alpha: 0.3,
		scale: 0.5,
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
		tint: 0xaa3333,
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
		tint: 0xffff00,
		alpha: 1.0,
		scale: 1.0,
	    },
	    'weak': {
		tint: 0xffff00,
		alpha: 0.5,
		scale: 0.6,
	    },
	    'hover': {
		tint: 0xffff00,
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
		if (players[0] === 0) {return 0xff4444;}
		if (players[0] === 1) {return 0x0088ff;}		
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
