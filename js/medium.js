var gEnemy, gSaw, gStar, gPlayer, saw;
var cursor, score = 0,
    time,
    sw = false,
    scorePlayer,
    timerText, totalStar = 0,
    bg, platform, game;
var data = {
    //options
    spHero: 200,
    vlJump: 0,
    spEnemy: 150,
    jump: 250,
    gravity: 900,
    //enemy
    eX: [410, 180, 420, 400, 1000],
    eY: [602, 244, 244, 685, 685],
    sX: [240, 325, 410, 495, 580, 770, 840,
        910, 980, 1050, 1120
    ],
    sY: [480, 480, 480, 480, 300, 410, 410,
        410, 410, 410, 410
    ],
    //coints
    cX: [40, 130, 465, 670, 890, 1025, 1110, 1190,
        40, 130, 130, 270, 355, 435, 730, 850, 950, 1055, 1190,
        40, 40, 170, 312, 430, 560, 670, 120, 600, 750, 900, 1050
    ],
    cY: [535, 535, 535, 550, 460, 460, 460, 380,
        425, 425, 300, 300, 325, 355, 300, 300, 300, 300, 270,
        300, 160, 180, 180, 180, 180, 180, 65, 65, 65, 65, 65
    ]
};
window.onload = function () {
    game = new Phaser.Game(1333, 700);
    game.state.add('loaded', loaded);
    game.state.add('start', started);
    game.state.start("loaded");
}
var loaded = function (game) {}
loaded.prototype = {
    preload: function () {
        game.stage.backgroundColor = '#fff';
        game.load.image('hero', "assets/hero.png");
        game.load.image('enemy', 'assets/enemy.png');
        game.load.image('saw', 'assets/saw.png');
        game.load.image('platform', 'assets/platform.png');
        game.load.image('diamond', 'assets/coints.png');
        game.load.image('teleport', 'assets/teleport.png');
        game.load.image('dRed', 'assets/cointFinal.png');
        game.load.image('tile', 'scenes/tile.png');
        game.load.tilemap('level', 'scenes/medium.json', null, Phaser.Tilemap.TILED_JSON);
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.stage.disableVisibilityChange = true;
        //game
        score = 0;
        timer = 150;
    },
    create: function () {
        game.state.start("start");
    }
}
var started = function (game) {}
started.prototype = {
    create: function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        this.platf();
        this.characters();
        this.enemys();
        this.coins();
        this.scorePlayer();
        this.countDown();
        this.timimg();
        this.starFinally();

        this.canJump = true;
        this.onWall = false;
        cursor = game.input.keyboard.createCursorKeys();
        sp = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        sp.onDown.add(this.jumping, this);
    },
    update: function () {
        this.player.body.velocity.x = data.vlJump * this.player.scale.x;

        //
        game.physics.arcade.collide(this.layer, this.platform);
        game.physics.arcade.collide(this.player, this.platform);
        game.physics.arcade.collide(this.player, this.layer, function (player, layer) {
            if (player.body.blocked.down) {
                this.canJump = true;
                this.onWall = false;
                data.vlJump = 0;
            }
            if (this.player.body.blocked.right && !this.player.body.blocked.down) {
                this.onWall = true;
            }
            if (this.player.body.blocked.left && !this.player.body.blocked.down) {
                this.onWall = true;
            }
            if (!this.player.body.blocked.down) {
                this.player.body.velocity.x = 0;
            }
        }, null, this);
        if (cursor.left.isDown) {
            this.player.body.velocity.x = -data.spHero;
            this.player.scale.x = -1;
            if (sp.isDown) {
                this.jumping();
            }
        }
        if (cursor.right.isDown) {
            this.player.body.velocity.x = data.spHero;
            this.player.scale.x = 1;
            if (sp.isDown) {
                this.jumping();
            }
        }
        gStar.forEach(e => {
            game.physics.arcade.overlap(this.player, e, this.collectStar, null, this);
        })
        gSaw.forEach(e => {
            e.rotation += 0.08
            game.physics.arcade.collide(this.player, e, function (player, e) {
                if (e.body.touching && this.player.body.touching) {
                    alert('Has muerto, tu puntuacion: ' + score);
                    game.state.start("loaded");
                }
            }, null, this);
        });
        gEnemy.forEach(e => {
            game.physics.arcade.collide(e, this.layer);
            game.physics.arcade.collide(this.player, e, function (player, e) {
                if (e.body.touching.up && player.body.touching.down) {
                    player.body.velocity.y = -data.jump;
                } else {
                    alert('Has muerto, tu puntuacion: ' + score);
                    game.state.start("loaded");
                }
            });
            if (e.body.blocked.right) {
                e.scale.x = -1;
                e.body.velocity.x -= data.spEnemy;
            }
            if (e.body.blocked.left) {
                e.scale.x = 1;
                e.body.velocity.x += data.spEnemy;
            }
        })
        if (this.platform.body.blocked.right) {
            this.platform.body.velocity.x -= 100;
        }

        if (this.platform.body.blocked.left) {
            this.platform.body.velocity.x += 100;
        }
        game.physics.arcade.overlap(this.player, this.teleport, this.teleporting, null, this);
    },
    platf: function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        this.map = game.add.tilemap("level");
        this.map.addTilesetImage("tileset01", "tile");
        this.map.setCollision(1);
        this.layer = this.map.createLayer("layer01");

        this.platform = game.add.sprite(780, 272, 'platform');
        game.physics.arcade.enable(this.platform);
        game.physics.enable(this.platform);
        this.platform.body.immovable = true;
        this.platform.body.velocity.x = 100;
    },
    characters: function () {
        this.player = game.add.sprite(75, 677, 'hero');
        game.physics.enable(this.player);
        this.player.body.gravity.y = data.gravity;
        this.player.body.bounce.y = 0.1;
        this.player.body.collideWorldBounds = true;
    },
    enemys: function () {
        //ENEMYS
        gEnemy = game.add.group();
        gEnemy.enableBody = true;
        gEnemy.physicsBodyType = Phaser.Physics.ARCADE;
        game.physics.arcade.enable(gEnemy);
        gEnemy.collideWorldBounds = true;
        data.eX.forEach(function (element, i) {
            this.enemy = gEnemy.create(element, data.eY[i], 'enemy');
            this.enemy.anchor.set(0.5);
            game.physics.arcade.enable(this.enemy);
            this.enemy.body.velocity.x += data.spEnemy;
        })

        gSaw = game.add.group();
        gSaw.enableBody = true;
        gSaw.physicsBodyType = Phaser.Physics.ARCADE;
        game.physics.arcade.enable(gSaw);
        gSaw.collideWorldBounds = true;
        data.sX.forEach(function (element, i) {
            this.saw = gSaw.create(element, data.sY[i], 'saw');
            this.saw.anchor.set(.5);
            game.physics.arcade.enable(this.saw);
            this.saw.body.immovable = true;
        })
    },
    jumping: function () {
        if ((this.canJump && this.player.body.blocked.down) || this.onWall) {
            this.player.body.velocity.y = -data.jump;
            if (this.onWall) {}
            this.canJump = false;
            this.onWall = false;
        }
    },
    coins: function () {
        gStar = game.add.group();
        gStar.enableBody = true;
        data.cX.forEach(function (element, i) {
            this.star = gStar.create(element, data.cY[i], 'diamond');
            totalStar++;
        })
        this.teleport = game.add.sprite(670, 620, 'teleport');
        game.physics.enable(this.teleport);
        this.teleport.body.collideWorldBounds = true;
    },
    scorePlayer: function () {
        scoreText = game.add.text(1080, 20, 'SCORE: 0000', {
            fontSize: '30px',
            fill: '#fff',
            align: 'center'
        });
        scoreText.font = 'Arial Black';
        scoreText.stroke = '#222';
        scoreText.strokeThickness = 6;
    },
    collectStar: function (player, star) {
        star.kill();
        score += 10;
        scoreText.text = 'SCORE: ' + score;
        totalStar--;

        // control points
        if (totalStar == 0) {
            if (sw) {
                alert('HAS GANADO! TU PUNTUACIÓN: ' + score);
                clearInterval(time);
                localStorage.setItem('PUNTUACION ', JSON.stringify(score));
            }
            if (!sw) {
                this.starFinally();
                score += timer;
                sw = true;
            }
        }
        console.log('quedan: ' + totalStar + ' estrellas.');
    },
    starFinally: function () {
        console.log('quedó: ' + timer + ' segundos');
        stars = game.add.group();
        stars.enableBody = true;
        //  coint finally
        this.star = gStar.create(1100, 135, 'dRed');
        totalStar++;
    },
    countDown: function () {
        timerText = game.add.text(660, 20, timer, {
            fontSize: '30px',
            fill: '#F2CC09',
            align: 'center'
        });
        timerText.font = 'Arial Black';
        timerText.stroke = '#222';
        timerText.strokeThickness = 5;
    },
    timimg: function () {
        //timer
        clearInterval(time);
        time = setInterval(function () {
            timer = timer - 1;
            timerText.text = timer;
            if (timer <= 50) {
                timerText.fill = 'red';
                timerText.stroke = '#222';
                timerText.strokeThickness = 9;
                data.spEnemy = 200;
            }
            if (timer <= 0) {
                clearInterval(time);
                alert('Has muerto, tu puntuacion: ' + score);
                score = 0;
                game.state.start("loaded");
            }
        }, 1000);
    },
    teleporting: function(player, teleport){
        this.teleport.kill();
        this.player.kill();
        this.characters();
    }
}