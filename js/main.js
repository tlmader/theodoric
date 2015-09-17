// If the object exists already, we’ll use it, otherwise we’ll use a new object
var Theodoric = Theodoric || {};

// Initiate a new game and set the size of the entire windows
// Phaser.AUTO means that whether the game will be rendered on a CANVAS element or using WebGL will depend on the browser
Theodoric.game = new Phaser.Game(512, 384, Phaser.AUTO, '', null, false, false);

Theodoric.game.state.add('Boot', Theodoric.Boot);
Theodoric.game.state.add('Preloader', Theodoric.Preloader);
Theodoric.game.state.add('MainMenu', Theodoric.MainMenu);
Theodoric.game.state.add('Game', Theodoric.Game);

Theodoric.game.state.start('Boot');