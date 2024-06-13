export function sequence({timeline, caller=setTimeout}) {    
    let t = 0;
    timeline.forEach(x => {
	if (x.isPause) {t += x.duration; return;}
	caller(x, t);
    });
}
export function pause(duration) {
    return new Pause(duration);
}
class Pause {
    constructor(duration) {
	this.duration = duration;
	this.isPause = true;
    }
}
