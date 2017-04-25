/* global system, Phaser, self */

// Property of Texas A&M Cease the Grease CSCE 482 Taylor Harris, Victor Martinez, Chance Eckert 

var mainMusic;
var jumpSound;
var deathSound;


var mainState = {
    preload: function ()
    {
        game.load.spritesheet('droplet', 'assets/droplet/droplet.png', 37, 62); // Load droplet animation frames	
        game.load.image('oil', 'assets/grease/grease.png'); // Load oil image
        game.load.image('pauseButtons', 'assets/buttons/pauseButtons.png'); // Load pause buttons image
        game.load.image('deadDroplet', 'assets/droplet/deadDroplet.png'); // Load dead droplet image
        game.load.audio('main', ['assets/music/main_music.mp3', 'assets/music/main_music.ogg']); // Load main game music
        game.load.audio('jump', ['assets/music/jump_noise.mp3', 'assets/music/jump_noise.ogg']); // Load jump soud
        game.load.audio('death', ['assets/music/death_sound.mp3', 'assets/music/death_sound.ogg']); // Load death soud
    },
    create: function ()
    {
        game.stage.backgroundColor = 'rgb(82,82,82)'; //Background color to match image background color

        this.enter = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        this.enter.onDown.add(function () { // When enter key is pressed, game is paused

            game.paused = true; // Pause game 

            pauseButtons = game.add.sprite(400 / 2, 490 / 2, 'pauseButtons'); // Add pause buttons image
            pauseButtons.anchor.setTo(0.5, 0.5);
        }, this);

        game.input.onDown.add(unpause, self); // Input listener to unpause game when user clicks outside of the menu options
        game.input.onDown.add(this.jump, this); //Input listener to move drippy with mouse click/tap (on mobile)

        function unpause(event) // Unpause game
        {
            if (game.paused) // If game is paused, find out where the click occured
            {
                var x1 = 400 / 2 - 270 / 2, x2 = 400 / 2 + 270 / 2,
                        y1 = 490 / 2 - 180 / 2, y2 = 490 / 2 + 180 / 2; // Calculate the corners of the menu

                if (event.x > x1 && event.x < x2 && event.y > y1 && event.y < y2) // Check if the click was inside the menu
                {
                    var x = event.x - x1,
                            y = event.y - y1; // Get menu local coordinates for the click

                    var selection = Math.floor(x / 90) + 3 * Math.floor(y / 90); // Calculate the choice

                    if (selection === 0 || selection === 1 || selection === 2) // Display the choice
                    {
                        this.pauseButtons.destroy(); // Remove pause menu image
                        game.paused = false; // Unpause the game
                    } else
                    {
                        game.paused = false; // Unpause the game
                        mainMusic.stop();
                        game.state.start('menu'); // Go to main menu
                    }
                }
            }
        }
        ;

        this.gameOver = false;

        this.deadDrop = game.add.sprite(0, 0, 'deadDroplet'); // Create dead droplet sprite for use when collision occurs
        game.physics.arcade.enable(this.deadDrop); // Add physics to dead droplet
        this.deadDrop.visible = !this.deadDrop.visible; // Make dead droplet invisible until collision occurs

        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.droplet = game.add.sprite(100, 245, 'droplet'); // Add droplet sprite at 50,175
        this.droplet.frame = 0; // Default frame is the first frame at position 0

        this.droplet.animations.add('jet', [0, 1, 2], 2, true); // Animate the droplet

        this.droplet.animations.play('jet'); // Play droplet animation

        game.physics.arcade.enable(this.droplet); // Add physics to droplet

        this.droplet.body.gravity.y = 1000; // Makes droplet fall 

        // this.oilGenerator = null;

        var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR); // Jump when spacebar is pressed
        spaceKey.onDown.add(this.jump, this);

        var mouseClick = game.input;

        this.oils = game.add.group();

        this.timer = game.time.events.loop(1500, this.addRowOfOils, this);

        //this.oilGenerator = this.game.time.events.loop(1500, this.generateOils, this);
        //this.oilGenerator.timer.start();

        score = 0;	// Score initialized to zero and displayed at the top left corner of the screen
        scoreLabel = game.add.text(20, 20, "0");
        scoreLabel.font = "Press Start 2P";
        scoreLabel.fill = "#fff"; // White color
        scoreLabel.fontSize = 30;

        mainMusic = game.add.audio('main'); // Music
        jumpSound = game.add.audio('jump'); //Jump sound
        deathSound = game.add.audio('death'); // Death sound
        mainMusic.play();

    },
    update: function () // This function is called 60 times per second
    {
        if (this.droplet.y < 0) //resets drippy's upper bound to 0
        {
            this.droplet.y = 0;
        } else if (this.droplet.y > 490)
        {
            this.droplet.destroy(); // Destroy droplet
            jumpSound.stop(); // Stop jump music
            mainMusic.stop(); // Stop main music
            game.state.start('over'); // If the droplet is out of the screen, end the game
        } else if (this.deadDrop.y > 490)
        {
            this.droplet.destroy(); // Destroy droplet
            this.deadDrop.destroy(); // Destroy dead droplet
            deathSound.stop(); // Stop death music when dead droplet is off screen 
            game.state.start('over'); // If the dead droplet is out of the screen, end the game
        }
        game.physics.arcade.overlap(this.droplet, this.oils, this.endGame, null, this); // If the droplet and oil overlap, end the game
        if (!this.gameOver) {
            this.oils.forEach(function (oils) {
                this.checkScore(oils);
                this.game.physics.arcade.collide(this.droplet, oils, this.endGame, null, this);
            }, this);
        }
    },
    jump: function () // Make the droplet jump 
    {
        jumpSound.stop();
        jumpSound.play();
        this.droplet.body.velocity.y = -350; // Add a vertical velocity to the droplet
    },
    endGame: function () // End the game
    {
        this.gameOver = true;
        rawscore = 0;
        this.droplet.visible = !this.droplet.visible; // Make droplet invisible while dead droplet is visible
        this.droplet.body.enable = false; // Stop droplet in place

        jumpSound.stop();
        mainMusic.stop();
        deathSound.play();

        this.deadDrop = game.add.sprite(this.droplet.x, this.droplet.y, 'deadDroplet'); // Replace droplet w/ dead droplet
        game.physics.arcade.enable(this.deadDrop); // Add physics to dead droplet
        this.deadDrop.body.gravity.y = 500; // Makes dead droplet fall

    },
    addOneOil: function (x, y) //need to speed up oil spawn or increase oils on screen
    {
        var oil = game.add.sprite(x, y, 'oil'); // Display oil at x, y

        this.oils.add(oil);

        game.physics.arcade.enable(oil);

        oil.body.velocity.x = -200 - (5 * score); // Add velocity to the oil spill to make it move left

        oil.checkWorldBounds = true;
        oil.outOfBoundsKill = true; // Kill the oil when its out of bounds
    },
    addRowOfOils: function ()
    {
        oilGroupnum = 0; //resets group size

        // Randomly pick a number between 1 and 5
        // This will be the hole position
        var hole = Math.floor(Math.random() * 5) + 1;

        // Add the 6 oils 
        // With one big hole at position 'hole', 'hole + 1' and 'hole + 2'
        for (var i = 0; i < 8; i++) {
            if (i !== hole && i !== hole + 1 && i !== hole + 2) {
                this.addOneOil(400, i * 60);
                oilGroupnum++; //keeps track of size of group
            }
        }
    },
    checkScore: function (oils)
    {
        if (oils.exists && !oils.hasScored && oils.world.x < 100) {
            oils.hasScored = true;
            rawscore++;
            if (oilGroupnum !== 0) {
                score = rawscore / oilGroupnum;
            }
            scoreLabel.text = score;
        }
    }
};

var gameOverState = {
    preload: function ()
    {
        game.load.image('gameOverBackground', 'assets/backgrounds/gameOver.png'); // Load game over image
        game.sound.stopAll(); //kills all sound
    },
    create: function ()
    {
        game.stage.backgroundColor = 'rgb(0,0,0)'; //Background color black

        gameOverBackground = game.add.sprite(game.world.centerX, 245, 'gameOverBackground'); // Add game over image
        gameOverBackground.anchor.setTo(0.5, 0.5);

        timer = 0;

        gameOverLabel = game.add.text(game.world.centerX, game.world.centerY + 200, 'Click anywhere to continue'); // Click anywhere to continue text
        gameOverLabel.anchor.setTo(0.5, 0.5);
        gameOverLabel.font = "Press Start 2P";
        gameOverLabel.fill = "#fff"; //White text
        gameOverLabel.fontSize = 10;

        game.input.onDown.add(function () {
            game.state.start('score');
        }, self); // Input listener go to score screen on mouse click

        
    },
    update: function ()
    {
        //Used to make text blink
        timer += game.time.elapsed;
        if (timer >= 500)
        {
            timer = 0;
            gameOverLabel.visible = !gameOverLabel.visible;
        }
    }
};

var leaderboardState = {
    preload: function ()
    {
        game.load.image('menuButton', 'assets/buttons/menuButton.png'); // Load main menu image
        game.load.image('highScores', 'assets/backgrounds/highScores.png'); // Load high score image
    },
    create: function ()
    {
        highScoresBackground = game.add.sprite(0, 0, 'highScores'); // Add high score background image

        if (localStorage.length > 0)
        {
            var localStorageArray = new Array();
            for (var i = 0; i < localStorage.length; i++)
            {
                localStorageArray[i] = Number(localStorage.key(i)); // Put scores in an array so they can be sorted
            }
            localStorageArray.sort(function (a, b) {
                return b - a;
            }); // Sort scores in decreasing order

            for (var n = 0; n < localStorageArray.length && n < 7; n++) // Iterate through every initials/score pair
            {
                scoresLabel = game.add.text(game.world.centerX, 215 + (n * 30), localStorage.getItem(localStorageArray[n]) + "           " + localStorageArray[n]); // Display top 9 initials and score
                scoresLabel.anchor.setTo(0.5, 0.5);
                scoresLabel.font = "Press Start 2P";
                scoresLabel.fill = "#fff"; // White text
                scoresLabel.fontSize = 15;
            }
        }
        var menuButton = game.add.button(game.world.centerX, game.world.centerY + 200, 'menuButton', function () {
            game.state.start('menu');
        }, this, 2, 1, 0); // Main menu button
        menuButton.anchor.setTo(0.5, 0.5);
    }
};

var menuState = {
    preload: function ()
    {
        game.load.image('ceaseGrease', 'assets/backgrounds/ceaseGrease.png'); // Load cease the grease title image
        game.load.spritesheet('play', 'assets/buttons/play.png', 300, 300); // Load play animation frames	
        game.load.image('playButton', 'assets/buttons/playButton.png'); // Load play button image
    },
    create: function ()
    {
        game.stage.backgroundColor = 'rgb(1,14,82)'; //Background color blue

        ceaseGreaseBackground = game.add.sprite(game.world.centerX, 100, 'ceaseGrease'); // Add title image
        ceaseGreaseBackground.anchor.setTo(0.5, 0.5);

        play = this.game.add.sprite(50, 175, 'play'); // Add play button animation at 50,175
        play.frame = 0; // Default frame is the first frame at position 0

        play.animations.add('start', [0, 1, 2], 2, true); // Animate the image

        play.animations.play('start'); // Play animation

        var playButton = game.add.button(50 + 38, 175 + 113, 'playButton', function () {
            game.state.start('story');
        }, this, 2, 1, 0); // Add play button over play animation to go to story screen
    }
};

var scoreState = {
    preload: function ()
    {
        game.load.image('scoreBackground', 'assets/backgrounds/score.png'); // Load blank score image
        game.load.image('scoreButton', 'assets/buttons/scoreButton.png'); // Load save score button
        game.load.image('q', 'assets/keyboard/q.png'); // Load alphabet
        game.load.image('w', 'assets/keyboard/w.png'); // Load alphabet
        game.load.image('e', 'assets/keyboard/e.png'); // Load alphabet
        game.load.image('r', 'assets/keyboard/r.png'); // Load alphabet
        game.load.image('t', 'assets/keyboard/t.png'); // Load alphabet
        game.load.image('y', 'assets/keyboard/y.png'); // Load alphabet
        game.load.image('u', 'assets/keyboard/u.png'); // Load alphabet
        game.load.image('i', 'assets/keyboard/i.png'); // Load alphabet
        game.load.image('o', 'assets/keyboard/o.png'); // Load alphabet
        game.load.image('p', 'assets/keyboard/p.png'); // Load alphabet
        game.load.image('a', 'assets/keyboard/a.png'); // Load alphabet
        game.load.image('s', 'assets/keyboard/s.png'); // Load alphabet
        game.load.image('d', 'assets/keyboard/d.png'); // Load alphabet
        game.load.image('f', 'assets/keyboard/f.png'); // Load alphabet
        game.load.image('g', 'assets/keyboard/g.png'); // Load alphabet
        game.load.image('h', 'assets/keyboard/h.png'); // Load alphabet
        game.load.image('j', 'assets/keyboard/j.png'); // Load alphabet
        game.load.image('k', 'assets/keyboard/k.png'); // Load alphabet
        game.load.image('l', 'assets/keyboard/l.png'); // Load alphabet
        game.load.image('z', 'assets/keyboard/z.png'); // Load alphabet
        game.load.image('x', 'assets/keyboard/x.png'); // Load alphabet
        game.load.image('c', 'assets/keyboard/c.png'); // Load alphabet
        game.load.image('v', 'assets/keyboard/v.png'); // Load alphabet
        game.load.image('b', 'assets/keyboard/b.png'); // Load alphabet
        game.load.image('n', 'assets/keyboard/n.png'); // Load alphabet
        game.load.image('m', 'assets/keyboard/m.png'); // Load alphabet
        game.load.image('enter', 'assets/keyboard/enter.png'); // Load enter 
    },
    create: function ()
    {
        var facebookButton = this.add.graphics(0, 0);
        facebookButton.lineStyle(2, 0x0000FF, 0.5);
        facebookButton.beginFill(0xFF8080, 1);
        facebookButton.drawRect(game.world.centerX - 125, game.world.centerY + 30, 100, 100);
        facebookButton.endFill();
        facebookButton.inputEnabled = true;
        facebookButton.events.onInputDown.add(function () {
            var fbpopup = window.open("https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fpeople.tamu.edu%2F%7Evalexis22009%2Fceasegrease%2F&amp", "pop", "width=600, height=400, scrollbars=no");
            return false;
        }, this);

        var twitterButton = this.add.graphics(0, 0);
        twitterButton.lineStyle(2, 0x0000FF, 0.5);
        twitterButton.beginFill(0xFF8080, 1);
        twitterButton.drawRect(game.world.centerX + 25, game.world.centerY + 30, 100, 100);
        twitterButton.endFill();
        twitterButton.inputEnabled = true;
        twitterButton.events.onInputDown.add(function () {
            var twpopup = window.open("https://twitter.com/intent/tweet?text=Help Trippy Out! I dodged " + score + " grease obstacles can you do better? http://people.tamu.edu/~valexis22009/ceasegrease/", "pop", "width=600, height=400, scrollbars=no");
            return false;
        }, this);

        this.scoreBackground = game.add.sprite(0, 0, 'scoreBackground'); // Add background image

        this.scoreLabel = game.add.text(game.world.centerX, game.world.centerY - 55, score); // Score text
        this.scoreLabel.anchor.setTo(0.5, 0.5);
        this.scoreLabel.font = "Press Start 2P";
        this.scoreLabel.fill = "#fff"; // White text
        this.scoreLabel.fontSize = 50;

        var scoreButton = game.add.button(game.world.centerX, game.world.centerY + 190, 'scoreButton', getScore, this, 2, 1, 0); // Save score button
        scoreButton.anchor.setTo(0.5, 0.5);

        word = "";
        prevLetter = "";
        letter = "";

        var inputLabel = stateText = game.add.text(game.world.centerX, game.world.centerY - 50, ' '); // Display user input
        stateText.anchor.setTo(0.5, 0.5);
        inputLabel.font = "Press Start 2P";
        inputLabel.fill = "#fff"; // White text
        inputLabel.fontSize = 30;

        function getScore()
        {
            this.scoreBackground.destroy(); // Delete score background image
            this.scoreLabel.destroy(); // Delete score 
            scoreButton.destroy(); // Delete save score button
            twitterButton.destroy(); // Delete social media buttons
            facebookButton.destroy(); // Delete social media buttons

            initialsLabel = game.add.text(game.world.centerX, game.world.centerY - 200, 'Please enter your initials'); // Input initials text
            initialsLabel.anchor.setTo(0.5, 0.5);
            initialsLabel.font = "Press Start 2P";
            initialsLabel.fill = "rgb(182,145,35)"; // Tan text
            initialsLabel.fontSize = 12;

            enterLabel = game.add.text(game.world.centerX, game.world.centerY - 175, 'Press ENTER to save score'); // Enter text
            enterLabel.anchor.setTo(0.5, 0.5);
            enterLabel.font = "Press Start 2P";
            enterLabel.fill = "rgb(182,145,35)"; // Tan text
            enterLabel.fontSize = 12;

            var qButton = game.add.button(5, game.world.centerY + 60, 'q', function () {
                prevLetter = letter;
                letter = "Q.";
            }, this, 2, 1, 0);
            var wButton = game.add.button(44, game.world.centerY + 60, 'w', function () {
                prevLetter = letter;
                letter = "W.";
            }, this, 2, 1, 0); // Keyboard button
            var eButton = game.add.button(83, game.world.centerY + 60, 'e', function () {
                prevLetter = letter;
                letter = "E.";
            }, this, 2, 1, 0); // Keyboard button
            var rButton = game.add.button(122, game.world.centerY + 60, 'r', function () {
                prevLetter = letter;
                letter = "R.";
            }, this, 2, 1, 0); // Keyboard button
            var tButton = game.add.button(161, game.world.centerY + 60, 't', function () {
                prevLetter = letter;
                letter = "T.";
            }, this, 2, 1, 0); // Keyboard button
            var yButton = game.add.button(200, game.world.centerY + 60, 'y', function () {
                prevLetter = letter;
                letter = "Y.";
            }, this, 2, 1, 0); // Keyboard button
            var uButton = game.add.button(239, game.world.centerY + 60, 'u', function () {
                prevLetter = letter;
                letter = "U.";
            }, this, 2, 1, 0); // Keyboard button
            var iButton = game.add.button(278, game.world.centerY + 60, 'i', function () {
                prevLetter = letter;
                letter = "I.";
            }, this, 2, 1, 0); // Keyboard button
            var oButton = game.add.button(317, game.world.centerY + 60, 'o', function () {
                prevLetter = letter;
                letter = "O.";
            }, this, 2, 1, 0); // Keyboard button
            var pButton = game.add.button(356, game.world.centerY + 60, 'p', function () {
                prevLetter = letter;
                letter = "P.";
            }, this, 2, 1, 0); // Keyboard button
            var aButton = game.add.button(22, game.world.centerY + 100, 'a', function () {
                prevLetter = letter;
                letter = "A.";
            }, this, 2, 1, 0); // Keyboard button
            var sButton = game.add.button(61, game.world.centerY + 100, 's', function () {
                prevLetter = letter;
                letter = "S.";
            }, this, 2, 1, 0); // Keyboard button
            var dButton = game.add.button(100, game.world.centerY + 100, 'd', function () {
                prevLetter = letter;
                letter = "D.";
            }, this, 2, 1, 0); // Keyboard button
            var fButton = game.add.button(139, game.world.centerY + 100, 'f', function () {
                prevLetter = letter;
                letter = "F.";
            }, this, 2, 1, 0); // Keyboard button
            var gButton = game.add.button(178, game.world.centerY + 100, 'g', function () {
                prevLetter = letter;
                letter = "G.";
            }, this, 2, 1, 0); // Keyboard button
            var hButton = game.add.button(217, game.world.centerY + 100, 'h', function () {
                prevLetter = letter;
                letter = "H.";
            }, this, 2, 1, 0); // Keyboard button
            var jButton = game.add.button(256, game.world.centerY + 100, 'j', function () {
                prevLetter = letter;
                letter = "J.";
            }, this, 2, 1, 0); // Keyboard button
            var kButton = game.add.button(295, game.world.centerY + 100, 'k', function () {
                prevLetter = letter;
                letter = "K.";
            }, this, 2, 1, 0); // Keyboard button
            var lButton = game.add.button(334, game.world.centerY + 100, 'l', function () {
                prevLetter = letter;
                letter = "L.";
            }, this, 2, 1, 0); // Keyboard button
            var zButton = game.add.button(63, game.world.centerY + 140, 'z', function () {
                prevLetter = letter;
                letter = "Z.";
            }, this, 2, 1, 0); // Keyboard button
            var xButton = game.add.button(102, game.world.centerY + 140, 'x', function () {
                prevLetter = letter;
                letter = "X.";
            }, this, 2, 1, 0); // Keyboard button
            var cButton = game.add.button(141, game.world.centerY + 140, 'c', function () {
                prevLetter = letter;
                letter = "C.";
            }, this, 2, 1, 0); // Keyboard button
            var vButton = game.add.button(180, game.world.centerY + 140, 'v', function () {
                prevLetter = letter;
                letter = "V.";
            }, this, 2, 1, 0); // Keyboard button
            var bButton = game.add.button(219, game.world.centerY + 140, 'b', function () {
                prevLetter = letter;
                letter = "B.";
            }, this, 2, 1, 0); // Keyboard button
            var nButton = game.add.button(258, game.world.centerY + 140, 'n', function () {
                prevLetter = letter;
                letter = "N.";
            }, this, 2, 1, 0); // Keyboard button
            var mButton = game.add.button(297, game.world.centerY + 140, 'm', function () {
                prevLetter = letter;
                letter = "M.";
            }, this, 2, 1, 0); // Keyboard button
            var entButton = game.add.button(143, game.world.centerY + 180, 'enter', function () {
				if (word == ""){
					game.state.start('leader');
				}
                else {
					localStorage.setItem(score.toString(), word);
					game.state.start('leader');
				}
            }, this, 2, 1, 0); // Enter button
        }
    },
    update: function ()
    {
        word = prevLetter + letter; // Used to concatenate both initials and display it on the screen
        stateText.text = word;
        stateText.visible = true;
    }
};

var storyState = {
    preload: function ()
    {
        game.load.image('factDroplet', 'assets/droplet/factDroplet1.png'); // Load let's go droplet image
        game.load.image('quote', 'assets/droplet/quote.png'); // Load quote image
    },
    create: function ()
    {
        var storyLabel = game.add.text(game.world.centerX, game.world.centerY - 205, 'Help Drippy reach the ocean!', {fill: 'white', align: 'center', wordWrap: true, wordWrapWidth: 375}); // Story text
        storyLabel.anchor.setTo(0.5, 0.5);
        storyLabel.font = "Press Start 2P";
        storyLabel.fontSize = 12;

        var instructionsLabel = game.add.text(game.world.centerX, game.world.centerY - 165, 'Press SPACEBAR to dodge the grease clogs in the pipes', {fill: 'white', align: 'center', wordWrap: true, wordWrapWidth: 375}); // Instructions text
        instructionsLabel.anchor.setTo(0.5, 0.5);
        instructionsLabel.font = "Press Start 2P";
        instructionsLabel.fontSize = 12;

        var instLabel = game.add.text(game.world.centerX, game.world.centerY - 125, 'Press ENTER to pause the game', {fill: 'white', align: 'center', wordWrap: true, wordWrapWidth: 450}); // Instructions text
        instLabel.anchor.setTo(0.5, 0.5);
        instLabel.font = "Press Start 2P";
        instLabel.fontSize = 12;

        quote = game.add.sprite(game.world.centerX, game.world.centerY, 'quote'); // Add quote image
        quote.anchor.setTo(0.5, 0.5);

        var fact = Math.floor(Math.random() * 8) + 0;

        var facts = ["Pouring baking soda into your drain on a monthly basis can help to break up grease blockages.",
            "Recycled grease and cooking oil can be recycled into biodiesel fuel!",
            "Over half of sanitary sewer system overflows result from grease blockages.",
            "Wipes and other items that don't break down in water can cause just as much damage.",
            "Houston's sanitary sewer system stretches the distance between Houston and Hawaii!",
            "Paper towels, baby wipes, and diapers should be thrown in the trash, not flushed.",
            "Microwaves, bowling balls, carpets, bumpers, heaters, and tires have turned up in our sewers.",
            "Since 2009, the City of Houston has averaged about 838 sewer overflows per year.",
            "Waste that clogs Houston’s sewage system cost taxpayers around $2 million annually."];
        if (fact === 8 && oldfact === fact) {//helps prevent repeat facts and loops back to 0
            fact = 0;
        } else if (fact === oldfact) { //increments fact number based on repeat
            fact++;
        }

        var factLabel = game.add.text(game.world.centerX + 5, game.world.centerY - 25, "Did You Know?\n\n" + facts[fact], {fill: 'black', align: 'center', wordWrap: true, wordWrapWidth: 300}); // Fact text
        factLabel.anchor.setTo(0.5, 0.5);
        factLabel.font = "Press Start 2P";
        factLabel.fontSize = 12;
        oldfact = fact; //helps prevent repeat facts

        factDroplet = game.add.sprite(game.world.centerX, game.world.centerY + 130, 'factDroplet'); // Add fact droplet image
        factDroplet.anchor.setTo(0.5, 0.5);

        var storyLabel = game.add.text(game.world.centerX, game.world.centerY + 215, 'Click anywhere to start game'); // Story text
        storyLabel.anchor.setTo(0.5, 0.5);
        storyLabel.font = "Press Start 2P";
        storyLabel.fill = "#fff"; // White text
        storyLabel.fontSize = 12;

        game.input.onDown.add(function () {
            game.state.start('main');
        }, self); // Input listener to start game on mouse click
    }
};

var game = new Phaser.Game(400, 490); // Create a 400, 490 new Phaser game

//localStorage.clear();

var timer = 0;
var prevLetter = " ";
var letter = " ";
var initials = " ";
var score = 0; //should be final score value per column passed
var rawscore = 0; //needed to keep score value clean 
var oilGroupnum = 0; //helps keep track of number of oils per group
var oldfact = 0;
game.state.add('main', mainState);
game.state.add('over', gameOverState);
game.state.add('menu', menuState);
game.state.add('score', scoreState);
game.state.add('leader', leaderboardState);
game.state.add('story', storyState);

game.state.start('menu'); // Begin the game at the main menu
