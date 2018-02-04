var gEnemy, gSaw, gStar, gPlat, saw;
var cursor, time, score = 0,
    sw = false,
    scorePlayer,
    timerText, totalStar = 0,
    bg, platform, game, pt = [];
var data = {
    //options
    spHero: 200,
    vlJump: 0,
    spEnemy: 150,
    jump: 300,
    gravity: 850,
    //enemy
    eX: [100, 900, 900],
    eY: [685, 307, 685],
    sX: [425, 350],
    sY: [137, 715],
    //coints
    cX: [125, 410, 660, 820, 1050, 1195, 1268, //up
        60, 313, 795, 1000, //middle
        145, 225, 1100, 1268, 595 //down
    ],
    cY: [80, 50, 80, 80, 80, 115, 250, //up
        400, 350, 330, 350, //middle
        490, 490, 490, 490, 575 //down
    ],
    phX: [410, 550, 630, 1040, 1135, 935, 1050],
    phY: [470, 470, 470, 610, 610, 470, 470]
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
        game.load.image('dRed', 'assets/cointFinal.png');
        game.load.image('fire2', 'assets/fire2.png');
        game.load.image('tile', 'scenes/tile.png');
        game.load.tilemap('level', 'scenes/level.json', null, Phaser.Tilemap.TILED_JSON);
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.stage.disableVisibilityChange = true;
        //game
        score = 0;
        timer = 150
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

        this.canJump = true;
        this.onWall = false;
        cursor = game.input.keyboard.createCursorKeys();
        sp = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        sp.onDown.add(this.jumping, this);
    },
    update: function () {
        this.player.body.velocity.x = data.vlJump * this.player.scale.x;

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
            e.rotation += 0.08
            game.physics.arcade.collide(this.player, e, function (player, e) {
                if (e.body.touching && this.player.body.touching) {
                    localStorage.setItem('PUNTUACION ', JSON.stringify(score));
                    game.state.start("loaded");
                }
            }, null, this);
            game.physics.arcade.collide(this.layer, e, function () {
                if (e.body.blocked.right) {
                    e.body.velocity.x -= 250;
                }
                if (e.body.blocked.left) {
                    e.body.velocity.x += 250;
                }
            })

        });
        gEnemy.forEach(e => {
            game.physics.arcade.collide(e, this.layer);
            game.physics.arcade.collide(this.player, e, function (player, e) {
                if (e.body.touching.up && player.body.touching.down) {
                    player.body.velocity.y = -data.jump;
                } else {
                    localStorage.setItem('PUNTUACION ', JSON.stringify(score));
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
        });
        gPlat.forEach(e => {
            game.physics.arcade.collide(this.player, e, function (player, e) {
                if (e.body.touching && this.player.body.touching) {
                    localStorage.setItem('PUNTUACION ', JSON.stringify(score));
                    game.state.start("loaded");
                }
            }, null, this);
        });
    },
    platf: function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        this.map = game.add.tilemap("level");
        this.map.addTilesetImage("tileset01", "tile");
        this.map.setCollision(1);
        this.layer = this.map.createLayer("layer01");

        gPlat = game.add.group();
        gPlat.enableBody = true;
        gPlat.physicsBodyType = Phaser.Physics.ARCADE;
        game.physics.arcade.enable(gPlat);
        gPlat.collideWorldBounds = true;
        data.phX.forEach(function (element, i) {
            this.plat = gPlat.create(element, data.phY[i], 'fire2');
            this.plat.anchor.set(1);
            game.physics.arcade.enable(this.plat);
            this.plat.body.immovable = true;
        });
    },
    characters: function () {
        this.player = game.add.sprite(game.world.width / 2, 677, 'hero');
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
            saw.body.velocity.x = 250;
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
        })
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
                pt.push(score);
                localStorage.setItem('PUNTUACION ', JSON.stringify(pt));
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
        this.star = gStar.create(game.world.width /2, 115, 'dRed');
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
                localStorage.setItem('PUNTUACION ', JSON.stringify(score));
                score = 0;
                game.state.start("loaded");
            }
        }, 1000);
    }
}