
Guardian.Game = function (game) {

    //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;      //  a reference to the currently running game (Phaser.Game)
    this.add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
    this.camera;    //  a reference to the game camera (Phaser.Camera)
    this.cache;     //  the game cache (Phaser.Cache)
    this.input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
    this.load;      //  for preloading assets (Phaser.Loader)
    this.math;      //  lots of useful common math operations (Phaser.Math)
    this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
    this.stage;     //  the game stage (Phaser.Stage)
    this.time;      //  the clock (Phaser.Time)
    this.tweens;    //  the tween manager (Phaser.TweenManager)
    this.state;     //  the state manager (Phaser.StateManager)
    this.world;     //  the game world (Phaser.World)
    this.particles; //  the particle manager (Phaser.Particles)
    this.physics;   //  the physics manager (Phaser.Physics)
    this.rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)

    //  You can use any of these from any function within this State.
    //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

};

Guardian.Game.prototype = {

    create: function () {
        // Set world dimensions
        this.game.world.setBounds(0, 0, 1920, 1920);
        this.background = this.game.add.tileSprite(3, 1, this.game.world.width, this.game.world.height, 'tiles');
        this.player = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'characters');

        this.player.scale.setTo(2);

        // Loop through frames 0, 1, 2 and 3 at 10 frames a second (because we supplied 10 as a parameter) while this animation is playing
        this.player.animations.add('down', [0, 1, 2, 3], 10, true)
        this.player.animations.add('left', [4, 5, 6, 7], 10, true)
        this.player.animations.add('right', [8, 9, 10, 11], 10, true)
        this.player.animations.add('up', [12, 13, 14, 15], 10, true)

        this.player.animations.play('down');

        this.game.camera.follow(this.player);

        // Player initial score of zero
        this.playerScore = 0;

        // Enable player physics
        this.game.physics.arcade.enable(this.player);
        this.playerSpeed = 120;
        this.player.body.collideWorldBounds = true;

    },

    update: function () {

        if (this.game.input.activePointer.justPressed()) {

            //move on the direction of the input
            this.game.physics.arcade.moveToPointer(this.player, this.playerSpeed);
        }

    },

    quitGame: function (pointer) {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        this.state.start('MainMenu');

    }

};
