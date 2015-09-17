
Guardian.MainMenu = function (game) {

	this.music = null;
	this.playButton = null;
};

Guardian.MainMenu.prototype = {

	create: function () {

		// We've already preloaded our assets, so let's kick right into the Main Menu itself.
		// Here all we're doing is playing some music and adding a picture and button
		// Naturally I expect you to do something significantly better :)

		this.background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'tiles', 92);

		// Give it speed in x
		this.background.autoScroll(-20, 0);

		this.music = this.add.audio('titleMusic');
		this.music.play();

		var text = "Guardian";
		var style = { font: "30px Arial", fill: "#fff", align: "center" };
		var t = this.game.add.text(this.game.width / 2, this.game.height / 2, text, style);
		t.anchor.set(0.5);

		this.playButton = this.add.button(this.game.width / 2, this.game.height / 2 + 50, 'playButton', this.startGame, this, 'buttonOver', 'buttonOut', 'buttonOver');
	},

	update: function () {

		// Do some nice funky main menu effect here
	},

	startGame: function (pointer) {

		// Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
		this.music.stop();

		// And start the actual game
		this.state.start('Game');
	}
};
