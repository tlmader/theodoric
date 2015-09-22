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
        this.collectables = this.generateCollectables();

        // Music
		this.music = this.game.add.audio('overworldMusic');
		this.music.loop = true;
		this.music.play();

        // Sound effects
        this.attackSound = this.game.add.audio('attackSound');
        this.playerSound = this.game.add.audio('playerSound');
        this.skeletonSound = this.game.add.audio('skeletonSound');
        this.slimeSound = this.game.add.audio('slimeSound');
        this.batSound = this.game.add.audio('batSound');
        this.ghostSound = this.game.add.audio('ghostSound');
        this.spiderSound = this.game.add.audio('spiderSound');
        this.goldSound = this.game.add.audio('goldSound');

        this.player = this.generatePlayer();
        this.playerAttacks = this.generateAttacks();

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

        // Modifies the attack and health of generated enemies
        this.modifier = 0;

        this.enemies = this.generateEnemies();
        // Player initial score of zero
        this.score = 0;

        this.showLabels();
    },

    showLabels: function() {
        var text = "0";
        var style = { font: "20px Arial", fill: "#fff", align: "center" };
        this.scoreLabel = this.game.add.text(this.game.width - 50, this.game.height - 50, text, style);
        this.scoreLabel.fixedToCamera = true;

        style = { font: "20px Arial", fill: "#f00", align: "center" };
        this.healthLabel = this.game.add.text(this.game.width - 100, this.game.height - 50, text, style);
        this.healthLabel.fixedToCamera = true;
    },

    update: function () {

        // Collision

        this.game.physics.arcade.collide(this.player, this.enemies, this.hit, null, this);
        this.game.physics.arcade.collide(this.enemies, this.playerAttacks, this.hit, null, this);
        this.game.physics.arcade.overlap(this.player, this.collectables, this.collect, null, this);

        // Player
        this.updatePlayerMovement();

        // Attack towards mouse click
        if (this.game.input.activePointer.isDown) {
            this.attack(this.player, this.playerAttacks);
        }

        if (!this.player.alive) {
            this.playDeath(this.player);
            this.game.time.events.add(1000, this.gameOver, this);
        }

        // Enemies

        this.enemies.forEachAlive(function(enemy) {
            if (enemy.visible && enemy.inCamera) {
                this.game.physics.arcade.moveToObject(enemy, this.player, enemy.speed)
                this.updateEnemyMovement(enemy);
            }
        }, this);

        this.enemies.forEachDead(function(enemy) {
            this.playDeath(enemy);
            this.generateEnemy;
            this.score += enemy.reward;
        }, this);

        this.modifier = Math.floor(this.score / 5);

        // Labels

        this.scoreLabel.text = this.score;
        this.healthLabel.text = this.player.health;
    },

    attack: function (player, attacks) {

        if (player.alive && this.game.time.now > attacks.next && attacks.countDead() > 0) {
            attacks.next = this.game.time.now + attacks.rate;
            var attack = attacks.getFirstDead();
            attack.scale.setTo(1.5);
            attack.reset(player.x + 16, player.y + 16);
            attack.lifespan = 500;
            attack.rotation = this.game.physics.arcade.moveToPointer(attack, attack.range);
            this.attackSound.play();
        }
    },

    hit: function (target, attacker) {

        if (this.game.time.now > target.invincibilityTime) {
            target.invincibilityTime = this.game.time.now + target.invincibilityFrames;
            target.damage(attacker.power)
            if (target.health < 0) {
                target.health = 0;
            }
            this.playHurtSound(target.name);
            console.log(attacker.name + " caused " + attacker.power + " damage to " + target.name + "!");
        }
    },

    collect: function(player, collectable) {
        if (!collectable.collected) {
            collectable.collected = true;
            this.score++;
            collectable.animations.play('open');
            this.goldSound.play();
            collectable.lifespan = 1000;
        }
    },

    playDeath: function (target) {
        var dead = this.game.add.sprite(target.x, target.y, 'dead')
        dead.scale.setTo(2);
        dead.animations.add('dead', [target.deadSprite], 10, true);
        dead.animations.play('dead');
        dead.lifespan = 3000;
        if (target !== this.player) {
            target.destroy()
            this.generateEnemy(this.enemies);
        }
    },

    generateCollectables: function () {

        var collectables = this.game.add.group();

        collectables.enableBody = true;
        collectables.physicsBodyType = Phaser.Physics.ARCADE;

        var amount = this.game.rnd.integerInRange(100, 500);
        var collectable;

        for (var i = 0; i < amount; i++) {
            collectable = collectables.create(this.game.world.randomX, this.game.world.randomY, 'things');
            collectable.scale.setTo(2);
            collectable.animations.add('idle', [6], 10, true);
            collectable.animations.add('open', [18, 30, 42], 8, false);
            collectable.animations.play('idle');
        }

        return collectables;
    },

    generatePlayer: function () {

        // Generate the player
        var player = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'characters');
        player.scale.setTo(2);

        // Loop through frames 3, 4, and 5 at 10 frames a second while the animation is playing
        player.animations.add('down', [3, 4, 5], 10, true);
        player.animations.add('left', [15, 16, 17], 10, true);
        player.animations.add('right', [27, 28, 29], 10, true);
        player.animations.add('up', [39, 40, 41], 10, true);
        player.animations.play('down');

        // Enable player physics
        this.game.physics.arcade.enable(player);
        player.body.collideWorldBounds = true;
        player.alive = true;
        player.health = 100;
        player.speed = 120;
        player.deadSprite = 1;
        player.invincibilityTime = 0;
        player.invincibilityFrames = 500;
        player.name = "player";

        return player;
    },

    generateAttacks: function () {

        // Generate the group of attack objects
        var attacks = this.game.add.group();
        attacks.enableBody = true;
        attacks.physicsBodyType = Phaser.Physics.ARCADE;
        attacks.createMultiple(30, 'attack');
        attacks.setAll('anchor.x', 0.5);
        attacks.setAll('anchor.y', 0.5);
        attacks.setAll('outOfBoundsKill', true);
        attacks.setAll('checkWorldBounds', true);

        attacks.setAll('power', 25, false, false, 0 , true);
        attacks.setAll('range', 70, false, false, 0 , true);
        attacks.rate = 500;
        attacks.next = 0;

        return attacks;
    },

    generateEnemies: function (health, speed, power, invincibilityFrames, deadSprite) {

        var enemies = this.game.add.group();

        // Enable physics in them
        enemies.enableBody = true;
        enemies.physicsBodyType = Phaser.Physics.ARCADE;

        var amount = 100;
        var enemy;

        for (var i = 0; i < amount; i++) {

            this.generateEnemy(enemies);
        }

        return enemies;
    },

    generateEnemy: function (enemies) {

        var rnd = Math.random();
        var enemy = enemies.create(this.game.world.randomX, this.game.world.randomY, 'characters');

        do {
            enemy.reset(this.game.world.randomX, this.game.world.randomY);
        } while (Phaser.Math.distance(this.player.x, this.player.y, enemy.x, enemy.y) <= 300)

        if (rnd >= 0 && rnd < .3) enemy = this.generateSkeleton(enemy);
        else if (rnd >= .3 && rnd < .4) enemy = this.generateSlime(enemy);
        else if (rnd >= .4 && rnd < .6) enemy = this.generateBat(enemy);
        else if (rnd >= .6 && rnd < .7) enemy = this.generateGhost(enemy);
        else if (rnd >= .7 && rnd < 1) enemy = this.generateSpider(enemy);

        console.log("Generated " + enemy.name + " with " + enemy.health + " health, " + enemy.power + " power, and " + enemy.speed + " speed.");
    },

    generateSkeleton: function (enemy) {

        enemy.scale.setTo(2);

        enemy.animations.add('down', [9, 10, 11], 10, true);
        enemy.animations.add('left', [21, 22, 23], 10, true);
        enemy.animations.add('right', [33, 34, 35], 10, true);
        enemy.animations.add('up', [45, 46, 47], 10, true);
        enemy.animations.play('down');

        enemy.body.velocity.x = 0,
        enemy.body.velocity.y = 0,
        enemy.body.collideWorldBounds = true;
        enemy.alive = true;
        enemy.health = 100 + this.modifier;
        enemy.speed = 70 + this.modifier;
        enemy.power = 20 + this.modifier;
        enemy.deadSprite = 6;
        enemy.invincibilityTime = 0;
        enemy.invincibilityFrames = 300;
        enemy.reward = 2;
        enemy.name = "skeleton";

        return enemy;
    },

    generateSlime: function (enemy) {

        enemy.scale.setTo(2);

        enemy.animations.add('down', [48, 49, 50], 10, true);
        enemy.animations.add('left', [60, 61, 62], 10, true);
        enemy.animations.add('right', [72, 73, 74], 10, true);
        enemy.animations.add('up', [84, 85, 86], 10, true);
        enemy.animations.play('down');

        enemy.body.velocity.x = 0,
        enemy.body.velocity.y = 0,
        enemy.body.collideWorldBounds = true;
        enemy.alive = true;
        enemy.health = 500 + this.modifier;
        enemy.speed = 30 + this.modifier;
        enemy.power = 40 + this.modifier;
        enemy.deadSprite = 7;
        enemy.invincibilityTime = 0;
        enemy.invincibilityFrames = 300;
        enemy.reward = 3;
        enemy.name = "slime";

        return enemy;
    },

    generateBat: function (enemy) {

        enemy.scale.setTo(2);

        enemy.animations.add('down', [51, 52, 53], 10, true);
        enemy.animations.add('left', [63, 64, 65], 10, true);
        enemy.animations.add('right', [75, 76, 77], 10, true);
        enemy.animations.add('up', [87, 88, 89], 10, true);
        enemy.animations.play('down');

        enemy.body.velocity.x = 0,
        enemy.body.velocity.y = 0,
        enemy.body.collideWorldBounds = true;
        enemy.alive = true;
        enemy.health = 25 + this.modifier;
        enemy.speed = 200 + this.modifier;
        enemy.power = 10 + this.modifier;
        enemy.deadSprite = 8;
        enemy.invincibilityTime = 0;
        enemy.invincibilityFrames = 300;
        enemy.reward = 1;
        enemy.name = "bat";

        return enemy;
    },

    generateGhost: function (enemy) {

        enemy.scale.setTo(2);

        enemy.animations.add('down', [54, 55, 56], 10, true);
        enemy.animations.add('left', [66, 67, 68], 10, true);
        enemy.animations.add('right', [78, 79, 80], 10, true);
        enemy.animations.add('up', [90, 91, 92], 10, true);
        enemy.animations.play('down');

        enemy.body.velocity.x = 0,
        enemy.body.velocity.y = 0,
        enemy.body.collideWorldBounds = true;
        enemy.alive = true;
        enemy.health = 200 + this.modifier;
        enemy.speed = 60 + this.modifier;
        enemy.power = 30 + this.modifier;
        enemy.deadSprite = 9;
        enemy.invincibilityTime = 0;
        enemy.invincibilityFrames = 300;
        enemy.reward = 3;
        enemy.name = "ghost";

        return enemy;
    },

    generateSpider: function (enemy) {

        enemy.scale.setTo(2);

        enemy.animations.add('down', [57, 58, 59], 10, true);
        enemy.animations.add('left', [69, 70, 71], 10, true);
        enemy.animations.add('right', [81, 82, 83], 10, true);
        enemy.animations.add('up', [93, 94, 95], 10, true);
        enemy.animations.play('down');

        enemy.body.velocity.x = 0,
        enemy.body.velocity.y = 0,
        enemy.body.collideWorldBounds = true;
        enemy.alive = true;
        enemy.health = 50 + this.modifier;
        enemy.speed = 120 + this.modifier;
        enemy.power = 12 + this.modifier;
        enemy.deadSprite = 10;
        enemy.invincibilityTime = 0;
        enemy.invincibilityFrames = 300;
        enemy.reward = 2;
        enemy.name = "spider";

        return enemy;
    },

    updatePlayerMovement: function () {

        // Up-Left
        if (this.wasd.up.isDown && this.wasd.left.isDown) {
            this.player.body.velocity.x = -this.player.speed;
            this.player.body.velocity.y = -this.player.speed;
            this.player.animations.play('left');

        // Up-Right
        } else if (this.wasd.up.isDown && this.wasd.right.isDown) {
            this.player.body.velocity.x = this.player.speed;
            this.player.body.velocity.y = -this.player.speed;
            this.player.animations.play('right');

        // Down-Left
        } else if (this.wasd.down.isDown && this.wasd.left.isDown) {
            this.player.body.velocity.x = -this.player.speed;
            this.player.body.velocity.y = this.player.speed;
            this.player.animations.play('left');

        // Down-Right
        } else if (this.wasd.down.isDown && this.wasd.right.isDown) {
            this.player.body.velocity.x = this.player.speed;
            this.player.body.velocity.y = this.player.speed;
            this.player.animations.play('right');

        // Up
        } else if (this.wasd.up.isDown) {
            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = -this.player.speed;
            this.player.animations.play('up');

        // Down
        } else if (this.wasd.down.isDown) {
            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = this.player.speed;
            this.player.animations.play('down');

        // Left
        } else if (this.wasd.left.isDown) {
            this.player.body.velocity.x = -this.player.speed;
            this.player.body.velocity.y = 0;
            this.player.animations.play('left');

        // Right
        } else if (this.wasd.right.isDown) {
            this.player.body.velocity.x = this.player.speed;
            this.player.body.velocity.y = 0;
            this.player.animations.play('right');

        // Still
        } else {
            this.player.animations.stop();
            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = 0;
        }
    },

    updateEnemyMovement: function (enemy) {

        // Left animation
        if (enemy.body.velocity.x < 0 && enemy.body.velocity.x <= -Math.abs(enemy.body.velocity.y)) {
             enemy.animations.play('left');

        // Right animation
        } else if (enemy.body.velocity.x > 0 && enemy.body.velocity.x >= Math.abs(enemy.body.velocity.y)) {
             enemy.animations.play('right');

        // Up animation
        } else if (enemy.body.velocity.y < 0 && enemy.body.velocity.y <= -Math.abs(enemy.body.velocity.x)) {
            enemy.animations.play('up');

        // Down animation
        } else {
            enemy.animations.play('down');
        }
    },

    playHurtSound: function (name) {

        if (name === "player") {
            this.playerSound.play();

        } else if (name === "skeleton") {
            this.skeletonSound.play();

        } else if (name === "slime") {
            this.slimeSound.play();

        } else if (name === "bat") {
            this.batSound.play();

        } else if (name === "ghost") {
            this.ghostSound.play();

        } else if (name === "spider") {
            this.spiderSound.play();
        }
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
