var game, music, time;
var gEnemy, gSaw, gStar, gPlat, gBall, gPlayer, saw, sw = false, totalStar = 0;
var data = {
    //options
    spHero: 200,
    vlJump: 0,
    spEnemy: 150,
    jump: 350,
    gravity: 800,
    //enemy
    eX: [160, 320, 640, 1000, 1150],
    eY: [685, 412, 412, 412, 685],
    pX: [22, 142, 22, 142, 22, 142, 22, 1156, 1254, 232,
        232, 960
    ],
    pY: [117, 220, 320, 420, 520, 620, 720, 220, 320, 582,
        420, 195
    ],
    phX: [1010, 1140, 550, 700, 850, 1000, 1100],
    phY: [265, 265, 700, 700, 700, 700, 700],
    //coints
    cX: [60, 60, 60, 60, 60, 60, 140, 340, 540, 740, 940,
        1080, 1180, 1180, 1180, 1180, 1080, 940, 750, 560, 340,
        400, 620, 750, 750, 540, 340, 165, 165, 165, 165, 165, 165,
        340, 500, 730, 985, 1180, 490, 250, 250, 250, 250, 250,
        332, 460, 585, 710, 835, 960, 1090, 900
    ],
    cY: [117, 217, 317, 417, 517, 617, 60, 60, 60, 60, 60,
        60, 100, 180, 280, 380, 380, 380, 380, 240, 380, 240,
        380, 265, 190, 150, 150, 150, 250, 355, 455, 555, 640,
        455, 455, 455, 455, 455, 380, 455, 355, 555, 640, 150,
        605, 605, 605, 605, 605, 605, 605, 150
    ],
    sX: [450, 600, 892, 1100, 260, 500],
    sY: [546, 546, 546, 546, 280, 325],
    bX: [1250, 1250],
    bY: [490, 650]
};
window.onload = function () {
    game = new Phaser.Game(1333, 720);
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
        game.load.image('fire', 'assets/fire.png');
        game.load.image('fire2', 'assets/fire2.png');
        game.load.image('diamond', 'assets/coints.png');
        game.load.image('dRed', 'assets/cointFinal.png');
        game.load.image('teleport', 'assets/teleport.png');
        game.load.image('ball', 'assets/ball.png');
        // loading level tilemap
        game.load.tilemap("level", 'scenes/hard.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tile', 'scenes/tile.png');
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.stage.disableVisibilityChange = true;
        //timer and score
        score = 0;
        timer = 250
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
        this.canon();

        this.canJump = true;
        this.onWall = false;
        cursor = game.input.keyboard.createCursorKeys();
        sp = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        sp.onDown.add(this.jumping, this);

        //music
        music = game.add.audio('music');
        music.play();
    },
    update: function () {

        this.player.body.velocity.x = data.vlJump * this.player.scale.x;

        game.physics.arcade.collide(this.layer, this.platform);
        game.physics.arcade.collide(this.player, this.platform);
        //game.physics.arcade.collide(this.layer, this.ball);

        game.physics.arcade.collide(this.player, this.layer, function (player, layer) {
            if (player.body.blocked.down) {
                this.canJump = true;
                this.onWall = false;
            }
            if (this.player.body.blocked.right && !this.player.body.blocked.down) {
                this.onWall = true;
            }
            if (this.player.body.blocked.left && !this.player.body.blocked.down) {
                this.onWall = true;
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
            e.rotation += 0.1;
            game.physics.arcade.collide(this.player, e, function (player, e) {
                if (e.body.touching && this.player.body.touching) {
                    clearInterval(this.time);
                    alert('Has muerto, tu puntuacion: ' + score);
                    game.state.start("loaded");
                }
            }, null, this);
        });
        gPlat.forEach(e => {
            game.physics.arcade.collide(this.player, e, function (player, e) {
                if (e.body.touching && this.player.body.touching) {
                    clearInterval(this.time);
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
                    clearInterval(this.time);
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
        gBall.forEach(e => {
            e.body.velocity.x = -400;
            game.physics.arcade.collide(this.layer, e, function () {
                if (e.body.touching) {
                    e.kill();
                    this.canon();
                }
            }, null, this);
            game.physics.arcade.collide(this.player, e, function (player, e) {
                if (e.body.touching && this.player.body.touching) {
                    clearInterval(this.time);
                    alert('Has muerto, tu puntuacion: ' + score);
                    game.state.start("loaded");
                }
            }, null, this);
        });
        game.physics.arcade.overlap(this.player, this.teleport, this.teleporting, null, this);
    },
    platf: function () {
        this.map = game.add.tilemap("level");
        this.map.addTilesetImage("tileset01", "tile");
        this.map.setCollision(1);
        this.layer = this.map.createLayer("layer01");

        gPlat = game.add.group();
        gPlat.enableBody = true;
        gPlat.physicsBodyType = Phaser.Physics.ARCADE;
        game.physics.arcade.enable(gPlat);
        gPlat.collideWorldBounds = true;
        data.pX.forEach(function (element, i) {
            this.plat = gPlat.create(element, data.pY[i], 'fire');
            this.plat.anchor.set(1);
            game.physics.arcade.enable(this.plat);
            this.plat.body.immovable = true;
        });
        data.phX.forEach(function (element, i) {
            this.plat = gPlat.create(element, data.phY[i], 'fire2');
            this.plat.anchor.set(1);
            game.physics.arcade.enable(this.plat);
            this.plat.body.immovable = true;
        });

    },
    characters: function () {
        this.player = game.add.sprite(75, 677, 'hero');
        game.physics.enable(this.player);
        this.player.body.gravity.y = data.gravity;
        this.player.body.bounce.y = 0.1;
        this.player.body.collideWorldBounds = true;

    },
    enemys: function () {
        gEnemy = game.add.group();
        gEnemy.enableBody = true;
        gEnemy.physicsBodyType = Phaser.Physics.ARCADE;
        game.physics.arcade.enable(gEnemy);
        gEnemy.collideWorldBounds = true;
        data.eX.forEach(function (element, i) {
            this.enemy = gEnemy.create(element, data.eY[i], 'enemy');
            this.enemy.anchor.set(0.4);
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
            if (this.onWall) {
                console.log('estoy en una pared');
                //player.scale.x *= -1;
                //data.vlJump = data.spHero;
            }
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
        });
        this.teleport = game.add.sprite(1165, 640, 'teleport');
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
                clearInterval(this.time);
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
        this.star = stars.create(730, 500, 'dRed');
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
    canon: function () {
        gBall = game.add.group();
        gBall.enableBody = true;
        gBall.physicsBodyType = Phaser.Physics.ARCADE;
        game.physics.arcade.enable(gBall);
        gBall.collideWorldBounds = true;
        data.bX.forEach(function (element, i) {
            this.ball = gBall.create(element, data.bY[i], 'ball');
            this.ball.anchor.set(1);
            game.physics.arcade.enable(this.ball);
            this.ball.body.immovable = true;
        })
        /*this.ball = game.add.sprite(data.bX[0], data.bY[0], 'ball');
        game.physics.arcade.enable(this.ball);
        game.physics.enable(this.ball);
        this.ball.body.immovable = true;
        this.ball.body.velocity.x = -300;*/
    },
    teleporting: function(player, teleport){
        this.teleport.kill();
        this.player.kill();
        this.characters();
    }
}