// If the object exists already, we’ll use it, otherwise we’ll use a new object
var Guardian = Guardian || {};

// Initiate a new game and set the size of the entire windows
// Phaser.AUTO means that whether the game will be rendered on a CANVAS element or using WebGL will depend on the browser
Guardian.game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '');

Guardian.game.state.add('Boot', Guardian.Boot);
Guardian.game.state.add('Preload', Guardian.Preload);
Guardian.game.state.add('MainMenu', Guardian.MainMenu);
Guardian.game.state.add('Game', Guardian.Game);

Guardian.game.state.start('Boot');