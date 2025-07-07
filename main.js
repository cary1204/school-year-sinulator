// Global stats variables
let gpa = 4.0;
let popularity = 0;
let chaos = 0;

let gpaText, popText, chaosText;
let coordText;
let devText;

let showDev = false;
let devEnabled = false;
let konamiProgress = 0;
const konamiCode = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a'
];

let cursors;

class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' });
  }
  preload() {
    this.load.image('bg', 'assets/background.png');
    this.load.audio('bgMusic', 'assets/sounds/bgMusic.mp3');
    this.load.audio('click', 'assets/sounds/click.wav');
  }
  create() {
    window.clickSound = this.sound.add('click');
    this.bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.5 });
    
    this.add.image(400, 225, 'bg');
    this.add.text(400, 200, 'SCHOOL YEAR SIMULATOR', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
    this.add.text(400, 260, 'Press SPACE to start', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
  
    this.input.keyboard.once('keydown-SPACE', () => {
      // Resume audio context here, then play sounds
      this.sound.context.resume().then(() => {
        window.clickSound = this.sound.add('click');
        this.bgMusic.play();
        playClickSound()
        this.scene.start('GameScene');
      });
    });
  }
}


class EndScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndScene' });
  }

  init(data) {
    this.finalGPA = data.gpa;
    this.finalPopularity = data.popularity;
    this.finalChaos = data.chaos;
  }

  create() {
    this.add.text(400, 150, 'GAME OVER', { fontSize: '40px', fill: '#fff' }).setOrigin(0.5);
    this.add.text(400, 220, `Final GPA: ${this.finalGPA.toFixed(2)}`, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
    this.add.text(400, 260, `Popularity: ${this.finalPopularity}`, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
    this.add.text(400, 300, `Chaos: ${this.finalChaos}`, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);

    this.add.text(400, 370, 'Press R to Restart', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);

    this.input.keyboard.once('keydown-R', () => {
      this.sound.play('click');
      this.scene.start('StartScene');
    });
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.gameEnded = false;
    this.eventZones = [];
    this.clickSound = null;
  }

  preload() {
    this.load.image('bg', 'assets/background.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.spritesheet('player', 'assets/player.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.audio('click', 'assets/sounds/click.wav');
  }

  create() {
    gpa = 4.0;
    popularity = 0;
    chaos = 0;
    this.gameEnded = false;

    this.add.image(400, 225, 'bg').setScrollFactor(1, 0);

    const platforms = this.physics.add.staticGroup();
    for (let x = 0; x <= 6000; x += 400) {
      platforms.create(x, 568, 'ground').setScale(1).refreshBody();
    }

    this.player = this.physics.add.sprite(100, 360, 'player');
    this.player.setScale(2);
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.textures.get('player').setFilter(Phaser.Textures.FilterMode.NEAREST);

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'turn',
      frames: [{ key: 'player', frame: 4 }],
      frameRate: 20
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });

    cursors = this.input.keyboard.createCursorKeys();
    this.physics.add.collider(this.player, platforms);


    this.createEventZone(600, 460, 'quiz');
    this.createEventZone(1200, 460, 'fight');
    this.createEventZone(1800, 460, 'fire');
    this.createEventZone(2400, 460, 'detention');
    this.createEventZone(3000, 460, 'snowday');
    this.createEventZone(3600, 460, 'hackathon');
    this.createEventZone(4200, 460, 'prom');
    this.createEventZone(4800, 460, 'legend');

    gpaText = this.add.text(16, 16, 'GPA: 4.00', { fontSize: '18px', fill: '#fff' }).setScrollFactor(0);
    popText = this.add.text(16, 40, 'Popularity: 0', { fontSize: '18px', fill: '#fff' }).setScrollFactor(0);
    chaosText = this.add.text(16, 64, 'Chaos: 0', { fontSize: '18px', fill: '#fff' }).setScrollFactor(0);
    coordText = this.add.text(16, 90, '', { fontSize: '16px', fill: '#aaa' }).setScrollFactor(0);
    devText = this.add.text(16, 420, '', { fontSize: '14px', fill: '#ff0' }).setScrollFactor(0);

    this.input.keyboard.on('keydown', (e) => {
      if (e.key === konamiCode[konamiProgress]) {
        konamiProgress++;
        if (konamiProgress === konamiCode.length) {
          devEnabled = true;
          devText.setText('Dev Mode: OFF');
        }
      } else {
        konamiProgress = 0;
      }

      if (e.key === 'd' && devEnabled) {
        showDev = !showDev;
        devText.setText('Dev Mode: ' + (showDev ? 'ON' : 'OFF'));
        playClickSound()
      }
    });

    this.cameras.main.setBounds(0, 0, 5100, 600);
    this.physics.world.setBounds(0, 0, 5100, 600);
    this.cameras.main.startFollow(this.player);
  }

  update() {
    if (this.gameEnded) return;

    if (cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play('left', true);
    } else if (cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play('right', true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play('turn');
    }

    if (cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    if (showDev) {
      coordText.setText('X: ' + Math.floor(this.player.x) + '  Y: ' + Math.floor(this.player.y));
      this.eventZones.forEach(zone => {
        if (!zone.debugRect) {
          zone.debugRect = this.add.rectangle(zone.x, zone.y, zone.width, zone.height, 0xff0000, 0.4);
          zone.debugRect.setScrollFactor(1);
        }
        zone.debugRect.setVisible(true);
      });
    } else {
      coordText.setText('');
      this.eventZones.forEach(zone => {
        if (zone.debugRect) zone.debugRect.setVisible(false);
      });
    }

    if (this.player.x > 5000) {
      this.gameEnded = true;
      this.physics.pause();
      this.scene.start('EndScene', { gpa, popularity, chaos });
    }
  }

  createEventZone(x, y, type) {
    const zone = this.add.zone(x, y, 100, 100);
    this.physics.world.enable(zone);
    zone.body.setAllowGravity(false);
    zone.body.moves = false;
    zone.triggered = false;
    zone.type = type;
    this.eventZones.push(zone);

    this.physics.add.overlap(this.player, zone, () => {
      if (!zone.triggered) {
        zone.triggered = true;
        triggerEvent(type);
      }
    }, null, this);
  }
}

function playClickSound() {
  if (window.clickSound) {
    window.clickSound.play();
  }
}


function triggerEvent(type) {
  const scene = game.scene.getScene('GameScene');
  scene.player.setVelocityX(0);
  scene.physics.pause();

  let html = '';
  switch (type) {
    case 'quiz':
      html = `<h3>Surprise Pop Quiz! You were not ready.</h3>
        <button onclick="playClickSound(); chooseEvent('Copy off smart kid')">Copy off smart kid</button><br><br>
        <button onclick="playClickSound(); chooseEvent('Panic and guess')">Guess all C</button><br><br>
        <button onclick="playClickSound(); chooseEvent('Bribe teacher with gum')">Offer gum to teacher</button><br><br>
        <button onclick="playClickSound(); chooseEvent('Sleep through it')">Sleep through it</button>`;
      break;
    case 'fight':
      html = `<h3>A cafeteria fight breaks out!</h3>
        <button onclick="playClickSound(); chooseEvent('Shield with Chromebook')">Use Chromebook as a weapon</button><br><br>
        <button onclick="playClickSound(); chooseEvent('Summon Band Kids')">Summon Band Kids</button><br><br>
        <button onclick="playClickSound(); chooseEvent('Cry under the table')">Cry</button><br><br>
        <button onclick="playClickSound(); chooseEvent('Start filming')">Record it</button>`;
      break;
    case 'fire':
      html = `<h3>Fire drill! But… it is raining.</h3>
        <button onclick="playClickSound(); chooseEvent('Run outside anyway')">Little rain wont hurt me</button><br><br>
        <button onclick="playClickSound(); chooseEvent('Hide in janitors closet')">Hide in janitor's closet</button><br><br>
        <button onclick="playClickSound(); chooseEvent('Yell FIRE back at the alarm')">Yell "FIRE" and scream back at the alarm</button><br><br>
        <button onclick="playClickSound(); chooseEvent('Start a party')">Start a party/rave</button>`;
      break;
    case 'detention':
      html = `<h3>You got detention!</h3>
        <button onclick="playClickSound(); chooseEvent('Escape through vent')">Escape through vent</button><br><br>
        <button onclick="playClickSound(); chooseEvent('Serve it like a boss')">Own it and serve</button><br><br>
        <button onclick="playClickSound(); chooseEvent('Fake illness')">Pretend to faint</button><br><br>
        <button onclick="playClickSound(); chooseEvent('Do homework during')">Actually study</button>`;
      break;
    case 'snowday':
      html = `<h3>It is a snow day! but you came to school.</h3>
        <button onclick="playClickSound(); chooseEvent('Build indoor snowman')">Snowman in the hall</button><br><br>
        <button onclick="playClickSound(); chooseEvent('Declare yourself principal')">Youre in charge</button><br><br>
        <button onclick="playClickSound(); chooseEvent('Throw snowballs in class')">Snowball fight</button><br><br>
        <button onclick="playClickSound(); chooseEvent('Ask for homework')">Study</button>`;
      break;
    case 'hackathon':
      html = `<h3>School hackathon!</h3>
        <button onclick="playClickSound(); chooseEvent('Build cheating robot')">Steal last year's champion's robot</button><br><br>
        <button onclick="playClickSound(); chooseEvent('Crash school servers')">Attack school's server</button><br><br>
        <button onclick="playClickSound(); chooseEvent('Win fairly')">Win it legit</button><br><br>
        <button onclick="playClickSound(); chooseEvent('Let AI write your code')">Let AI write your code</button>`;
      break;
    case 'prom':
      html = `<h3>Prom night chaos!</h3>
        <button onclick="playClickSound(); chooseEvent('Spike the punch')">Spike the punch</button><br><br>
        <button onclick="playClickSound(); chooseEvent('Dance battle teacher')">Dance-off</button><br><br>
        <button onclick="playClickSound(); chooseEvent('Steal spotlight')">Steal spotlight</button><br><br>
        <button onclick="playClickSound(); chooseEvent('Rap battle someone')">Rap battle someone</button>`;
      break;
    case 'legend':
      html = `<h3>You’re about to graduate...</h3>
        <button onclick="playClickSound(); chooseEvent('Stage Dive')">Stage dive at ceremony</button><br><br>
        <button onclick="playClickSound(); chooseEvent('Give Real Speech')">Give speech</button><br><br>
        <button onclick="playClickSound(); chooseEvent('Hug principal')">Hug the principal</button><br><br>
        <button onclick="playClickSound(); chooseEvent('Sleep through ceremony')">Sleep through ceremony</button>`;
      break;
  }

  // Create popup div
  const appDiv = document.createElement('div');
  appDiv.id = 'eventPopup';
  appDiv.style.position = 'absolute';
  appDiv.style.top = '50%';
  appDiv.style.left = '50%';
  appDiv.style.transform = 'translate(-50%, -50%)';
  appDiv.style.background = '#222';
  appDiv.style.color = '#fff';
  appDiv.style.padding = '20px';
  appDiv.style.border = '3px solid white';
  appDiv.style.zIndex = 1000;
  appDiv.innerHTML = html;
  document.body.appendChild(appDiv);
}

function chooseEvent(option) {
  let resultText = '';

  switch (option) {
    case 'Copy off smart kid': resultText = "Nice! But they noticed. Suspicion spreads..."; gpa += 0.2; chaos += 1; break;
    case 'Panic and guess': resultText = "All Cs? You somehow passed."; gpa += 0.1; break;
    case 'Bribe teacher with gum': resultText = "They took it. You gained weird favor..."; popularity += 3; chaos += 1; break;
    case 'Sleep through it': resultText = "You wake up to everyone turning in their papers! oh no"; gpa -= 0.3; break;

    case 'Shield with Chromebook': resultText = "You blocked a chicken nugget. Your screen shattered. 0.2 gpa activity"; gpa -= 0.3; break;
    case 'Summon Band Kids': resultText = "They charged with trombones. You became a local hero."; popularity += 5; chaos += 3; break;
    case 'Cry under the table': resultText = "Cry under the table, The janitor fist bumps you in solidarity."; chaos += 2; break;
    case 'Start filming': resultText = "You got likes, but missed class."; gpa -= 0.3; popularity += 2; break;

    case 'Run outside anyway': resultText = "You’re soaked. But heroic."; popularity += 2; break;
    case 'Hide in janitor’s closet': resultText = "You found a mop sword. +1 strange power."; chaos += 2; break;
    case 'Yell FIRE back at the alarm': resultText = "The alarm stopped. You win. (???)"; chaos += 4; break;
    case 'Start a party': resultText = "CHAOS EVERYWHERE."; popularity += 2; gpa -= 0.2; chaos += 5; break;

    case 'Escape through vent': resultText = "You’re a ninja now."; chaos += 4; gpa -= 0.3; break;
    case 'Serve it like a boss': resultText = "Respect earned."; popularity += 2; break;
    case 'Fake illness': resultText = "Oscar-worthy."; chaos += 2; break;
    case 'Do homework during': resultText = "Shockingly productive."; popularity -= 5; gpa += 0.3; break;

    case 'Build indoor snowman': resultText = "Frosty lives!"; chaos += 3; break;
    case 'Declare yourself principal': resultText = "Absolute power corrupts."; gpa -= 0.2; popularity += 3; chaos += 4; break;
    case 'Throw snowballs in class': resultText = "Snowballs fly!"; chaos += 5; break;
    case 'Ask for homework': resultText = "NERD!!"; gpa += 0.1; chaos += 1; break;

    case 'Build cheating robot': resultText = "It works too well..."; gpa += 0.5; chaos += 2; break;
    case 'Crash school servers': resultText = "No more homework ever again."; chaos += 6; break;
    case 'Win fairly': resultText = "Nerd glory achieved."; gpa += 0.3; popularity += 1; break;
    case 'Let AI write your code': resultText = "uh oh, ai is paid serive and youre broke"; gpa -= 0.5; break;

    case 'Spike the punch': resultText = "CRAZY, CHAO!!!!"; popularity += 5; chaos += 5; break;
    case 'Dance battle teacher': resultText = "YOU COOKED THE TEACHER!!!"; popularity += 5; chaos += 1;break;
    case 'Steal spotlight': resultText = "Great dance, everyone loves it"; popularity += 3; chaos += 2; break;
    case 'Rap battle someone': resultText = "You got clapped but had fun."; chaos += 3; break;

    case 'Stage Dive': resultText = "You became a Legend, people started telling your stories"; popularity += 5; chaos += 4; break;
    case 'Give Real Speech': resultText = "W Speech"; popularity += 2; gpa += 0.2; break;
    case 'Hug principal': resultText = "Awkward, But Repect+"; popularity += 3; break;
    case 'Sleep through ceremony': resultText = "You graduated through... E-mail?"; gpa -= 0.5; break;
  }

  gpa = Math.min(Math.max(gpa, 0), 4.0);
  popularity = Math.max(popularity, 0);
  chaos = Math.max(chaos, 0);

  document.getElementById('eventPopup').innerHTML = `<p>${resultText}</p><br><button onclick="playClickSound(); closeEvent()">Continue</button>`;
}

function closeEvent() {
  document.getElementById('eventPopup').remove();
  game.scene.scenes[1].physics.resume(); //gc scr1
}

window.chooseEvent = chooseEvent;
window.closeEvent = closeEvent;

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  },
  scene: [StartScene, GameScene, EndScene],
  parent: 'game'
};

const game = new Phaser.Game(config);

function updateStats() {
  if (gpaText) gpaText.setText('GPA: ' + gpa.toFixed(2));
  if (popText) popText.setText('Popularity: ' + popularity);
  if (chaosText) chaosText.setText('Chaos: ' + chaos);
}

setInterval(updateStats, 200);
