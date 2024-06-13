//console.log(response)
if (false && response.move) {
    const unit = this.units.get(response.move.from);
    this.units.remove(response.move.from);
    this.units.set({
	key: response.move.to,
	value: unit,
    });
    const targetTile = this.board.tiles.get(response.move.to);
    this.tweens.add({
	targets: unit.sprite,
	x: targetTile.sprite.x,
	y: targetTile.sprite.y,
	duration: 500,
	ease: 'Quint.Out',
    });
}
if (false && response.valid) {
    const validClicks = await server.getResponse({
	type: 'getData',
	details: 'validClicks',
    });
    this.setValidClicks(validClicks);
    

    static text2image({scene, config, text:t}) {
	const text = scene.add.text(
	    0, 0,
	    t,
	    config.textStyle,	    
	);
	config.width = text.width;
	config.height = text.height;
	const renderTexture = scene.add.renderTexture(
	    -500, -500, // Evil
	    config.width,
	    config.height,
	);
	renderTexture.draw(text, 0, 0);
	text.destroy();
	//renderTexture.clear();

	return renderTexture.texture.key;
    }
    junk() {
	//this.screenCover = new Sprite({
	//    scene: this,
	//    x: 0.5*this.config.window.width,
	//    y: 0.5*this.config.window.height,
	//    config: this.config.screenCover,
	//});
	//this.screenCover.state.to({state: 'invisible', duration: 1000}); // hardcoded	
    }
