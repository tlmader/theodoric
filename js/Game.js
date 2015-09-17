// Credits:
// http://www.gamedevacademy.org/html5-phaser-tutorial-spacehipster-a-space-exploration-game/
// http://www.joshmorony.com/how-to-create-an-animated-character-using-sprites-in-phaser/
// http://jschomay.tumblr.com/post/103568304133/tutorial-building-a-polished-html5-space-shooter
// http://ezelia.com/2014/tutorial-creating-basic-multiplayer-game-phaser-eureca-io

Theodoric.Game = function (game) {

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

Theodoric.Game.prototype = {

    create: function () {

        // Generate the world
        this.game.world.setBounds(0, 0, 1920, 1920);

        this.background = this.game.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'tiles', 65);

        this.generateSound();
        this.generatePlayer();
        this.generateAttacks();
        this.generateEnemies();

        this.game.physics.arcade.collide(this.player, this.enemies, this.hitAsteroid, null, this);

        // Set the controls
        this.wasd = {
            up: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
            left: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
            down: this.game.input.keyboard.addKey(Phaser.Keyboard.S),
            right: this.game.input.keyboard.addKey(Phaser.Keyboard.D),
        };


        // Set the camera
        this.game.camera.follow(this.player);

        // Player initial score of zero
        this.playerScore = 0;
    },

    update: function () {

        // Movement

        // Up-Left
        if (this.wasd.up.isDown && this.wasd.left.isDown) {
            this.player.body.velocity.x = -this.playerSpeed;
            this.player.body.velocity.y = -this.playerSpeed;
            this.player.animations.play('left');

        // Up-Right
        } else if (this.wasd.up.isDown && this.wasd.right.isDown) {
            this.player.body.velocity.x = this.playerSpeed;
            this.player.body.velocity.y = -this.playerSpeed;
            this.player.animations.play('right');

        // Down-Left
        } else if (this.wasd.down.isDown && this.wasd.left.isDown) {
            this.player.body.velocity.x = -this.playerSpeed;
            this.player.body.velocity.y = this.playerSpeed;
            this.player.animations.play('left');

        // Down-Right
        } else if (this.wasd.down.isDown && this.wasd.right.isDown) {
            this.player.body.velocity.x = this.playerSpeed;
            this.player.body.velocity.y = this.playerSpeed;
            this.player.animations.play('right');

        // Up
        } else if (this.wasd.up.isDown) {
            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = -this.playerSpeed;
            this.player.animations.play('up');

        // Down
        } else if (this.wasd.down.isDown) {
            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = this.playerSpeed;
            this.player.animations.play('down');

        // Left
        } else if (this.wasd.left.isDown) {
            this.player.body.velocity.x = -this.playerSpeed;
            this.player.body.velocity.y = 0;
            this.player.animations.play('left');

        // Right
        } else if (this.wasd.right.isDown) {
            this.player.body.velocity.x = this.playerSpeed;
            this.player.body.velocity.y = 0;
            this.player.animations.play('right');

        // Still
        } else {
            this.player.animations.stop();
            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = 0;
        }

        // Attack if left mouse button is pressed
        if (this.game.input.activePointer.isDown) {
            this.attack();
        }

        this.game.physics.arcade.collide(this.player, this.enemies, this.damagePlayer, null, this);
    },

    attack: function () {

        if (!this.player.alive) {
            return;

        } else if (this.game.time.now > this.nextAttack && this.attacks.countDead() > 0) {
            this.nextAttack = this.game.time.now + this.attackRate;
            var attack = this.attacks.getFirstDead();
            attack.reset(this.player.x + 16, this.player.y + 16);
            attack.lifespan = 500;
            attack.rotation = this.game.physics.arcade.moveToPointer(attack, 150);
            this.attackSound.play();
        }
    },

    damagePlayer: function(player, asteroid) {


        this.deadPlayer = this.game.add.sprite(this.player.x, this.player.y, 'dead');
        this.player.kill();
        this.deadPlayer.scale.setTo(2);
        this.deadPlayer.animations.add('dead', [1], 10, true);
        this.deadPlayer.animations.play('dead');

        this.game.time.events.add(1000, this.gameOver, this);
    },

    generatePlayer: function () {

        // Generate the player
        this.player = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'characters');
        this.player.scale.setTo(2);

        // Loop through frames 3, 4, and 5 at 10 frames a second while the animation is playing
        this.player.animations.add('down', [3, 4, 5], 10, true);
        this.player.animations.add('left', [15, 16, 17], 10, true);
        this.player.animations.add('right', [27, 28, 29], 10, true);
        this.player.animations.add('up', [39, 40, 41], 10, true);
        this.player.animations.play('down');

        // Enable player physics
        this.game.physics.arcade.enable(this.player);
        this.playerSpeed = 120;
        this.player.body.collideWorldBounds = true;
        this.player.alive = true;
    },

    generateEnemies: function () {

        this.enemies = this.game.add.group();

        // Enable physics in them
        this.enemies.enableBody = true;
        this.enemies.physicsBodyType = Phaser.Physics.ARCADE;

        var numEnemies = 100;
        var enemy;

        for (var i = 0; i < numEnemies; i++) {

            enemy = this.enemies.create(this.game.world.randomX, this.game.world.randomY, 'characters');
            enemy.scale.setTo(2);

            enemy.animations.add('skeletonDown', [9, 10, 11], 10, true);
            enemy.animations.add('skeletonLeft', [21, 22, 23], 10, true);
            enemy.animations.add('skeletonRight', [33, 34, 35], 10, true);
            enemy.animations.add('skeletonUp', [45, 46, 47], 10, true);
            enemy.animations.play('skeletonDown');

            enemy.body.collideWorldBounds = true;
        }
    },

    generateAttacks: function () {

        // Generate the group of attack objects
        this.attacks = this.game.add.group();
        this.attacks.enableBody = true;
        this.attacks.physicsBodyType = Phaser.Physics.ARCADE;
        this.attacks.createMultiple(30, 'attack');
        this.attacks.setAll('anchor.x', 0.5);
        this.attacks.setAll('anchor.y', 0.5);
        this.attacks.setAll('outOfBoundsKill', true);
        this.attacks.setAll('checkWorldBounds', true);

        this.attackRate = 500;
        this.nextAttack = 0;
    },

    generateSound: function () {

        // Music
		this.music = this.add.audio('overworldMusic');
		this.music.loop = true;
		this.music.play();

        // Sound effects
        this.attackSound = this.add.audio('attackSound');
    },

    gameOver: function() {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.
		this.music.stop();

        //  Then let's go back to the main menu.
        this.game.state.start('MainMenu', true, false);
    },

    quitGame: function (pointer) {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.
		this.music.stop();

        //  Then let's go back to the main menu.
        this.game.state.start('MainMenu', true, false);
    }
};
