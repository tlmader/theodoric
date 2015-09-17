// Credits:
// http://www.gamedevacademy.org/html5-phaser-tutorial-spacehipster-a-space-exploration-game/
// http://www.joshmorony.com/how-to-create-an-animated-character-using-sprites-in-phaser/
// http://jschomay.tumblr.com/post/103568304133/tutorial-building-a-polished-html5-space-shooter

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
        this.background = this.game.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'tiles', 65);

        this.wasd = {
            up: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
            left: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
            down: this.game.input.keyboard.addKey(Phaser.Keyboard.S),
            right: this.game.input.keyboard.addKey(Phaser.Keyboard.D),
        };

        this.player = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'characters');

        this.player.scale.setTo(2);

        // Loop through frames 0, 1, 2 and 3 at 10 frames a second (because we supplied 10 as a parameter) while this animation is playing
        this.player.animations.add('down', [3, 4, 5], 10, true);
        this.player.animations.add('left', [15, 16, 17], 10, true);
        this.player.animations.add('right', [27, 28, 29], 10, true);
        this.player.animations.add('up', [39, 40, 41], 10, true);

        this.player.animations.play('down');

        this.game.camera.follow(this.player);

        // Create the group of attack objects
        this.generateAttacks();

        // Player initial score of zero
        this.playerScore = 0;

        // Enable player physics
        this.game.physics.arcade.enable(this.player);
        this.playerSpeed = 120;
        this.player.body.collideWorldBounds = true;
    },

    generateAttacks: function () {

        this.attacks = this.game.add.group();

        // Enable physics in them
        this.attacks.enableBody = true;
        this.attacks.physicsBodyType = Phaser.Physics.ARCADE;
        this.attacks.createMultiple(30, 'attack');
        this.attacks.setAll('outOfBoundsKill', true);
        this.attacks.setAll('checkWorldBounds', true);
    },

    attack: function () {

        // Grab the first attack from the group
        var attack = this.attacks.getFirstExists(false);

        if (attack) {
            // And fire it
            attack.reset(this.player.x, this.player.y);
            attack.rotation = this.game.math.angleBetween(this.player.x, this.player.y, this.game.input.activePointer.x, this.game.input.activePointer.y);
            this.game.physics.arcade.moveToPointer(attack, 150);
        }
    },

    update: function () {

        var playerSpeed = 120;
        var playerDirection;

        // Movement

        // Up-Left
        if (this.wasd.up.isDown && this.wasd.left.isDown) {
            this.player.body.velocity.x = -playerSpeed;
            this.player.body.velocity.y = -playerSpeed;
            this.player.animations.play('left');

        // Up-Right
        } else if (this.wasd.up.isDown && this.wasd.right.isDown) {
            this.player.body.velocity.x = playerSpeed;
            this.player.body.velocity.y = -playerSpeed;
            this.player.animations.play('right');

        // Down-Left
        } else if (this.wasd.down.isDown && this.wasd.left.isDown) {
            this.player.body.velocity.x = -playerSpeed;
            this.player.body.velocity.y = playerSpeed;
            this.player.animations.play('left');

        // Down-Right
        } else if (this.wasd.down.isDown && this.wasd.right.isDown) {
            this.player.body.velocity.x = playerSpeed;
            this.player.body.velocity.y = playerSpeed;
            this.player.animations.play('right');

        // Up
        } else if (this.wasd.up.isDown) {
            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = -playerSpeed;
            this.player.animations.play('up');

        // Down
        } else if (this.wasd.down.isDown) {
            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = playerSpeed;
            this.player.animations.play('down');

        // Left
        } else if (this.wasd.left.isDown) {
            this.player.body.velocity.x = -playerSpeed;
            this.player.body.velocity.y = 0;
            this.player.animations.play('left');

        // Right
        } else if (this.wasd.right.isDown) {
            this.player.body.velocity.x = playerSpeed;
            this.player.body.velocity.y = 0;
            this.player.animations.play('right');

        // Still
        } else {
            this.player.animations.stop();
            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = 0;
        }

        if(this.game.input.activePointer.isDown) {

            this.attack();
        }
    },

    quitGame: function (pointer) {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        this.state.start('MainMenu');

    }

};
