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

let player;
let cursors;
let eventZones = [];

class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' });
  }
  preload() {
    this.load.image('bg', 'assets/background.png');
  }
  create() {
    this.add.image(400, 225, 'bg');
    this.add.text(400, 200, 'SCHOOL YEAR SIMULATOR', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
    this.add.text(400, 260, 'Press SPACE to start', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('GameScene');
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
      this.scene.start('StartScene');
    });
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.gameEnded = false;
  }

  preload() {
    this.load.image('bg', 'assets/background.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.spritesheet('player', 'assets/player.png', {
      frameWidth: 32,
      frameHeight: 48
    });
  }

  create() {
    // Reset stats on game start
    gpa = 4.0;
    popularity = 0;
    chaos = 0;
    this.gameEnded = false;

    this.add.image(400, 225, 'bg').setScrollFactor(1, 0);

    const platforms = this.physics.add.staticGroup();
    for (let x = 0; x <= 6000; x += 400) {
      platforms.create(x, 568, 'ground').setScale(1).refreshBody();
    }

    player = this.physics.add.sprite(100, 360, 'player');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

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
    this.physics.add.collider(player, platforms);

    createEventZone(this, 600, 460, 'quiz');
    createEventZone(this, 1200, 460, 'fight');
    createEventZone(this, 1800, 460, 'fire');
    createEventZone(this, 2400, 460, 'detention');

    createEventZone(this, 3000, 460, 'snowday');
    createEventZone(this, 3600, 460, 'hackathon');
    createEventZone(this, 4200, 460, 'prom');
    createEventZone(this, 4800, 460, 'legend');

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
      }
    });

    this.cameras.main.setBounds(0, 0, 5100, 600);
    this.physics.world.setBounds(0, 0, 5100, 600);
    this.cameras.main.startFollow(player);
  }

  update() {
    if (this.gameEnded) return;

    if (cursors.left.isDown) {
      player.setVelocityX(-160);
      player.anims.play('left', true);
    } else if (cursors.right.isDown) {
      player.setVelocityX(160);
      player.anims.play('right', true);
    } else {
      player.setVelocityX(0);
      player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
      player.setVelocityY(-400);
    }

    if (showDev) {
      coordText.setText('X: ' + Math.floor(player.x) + '  Y: ' + Math.floor(player.y));
      eventZones.forEach(zone => {
        if (!zone.debugRect) {
          zone.debugRect = zone.scene.add.rectangle(zone.x, zone.y, zone.width, zone.height, 0xff0000, 0.4);
          zone.debugRect.setScrollFactor(1);
        }
        zone.debugRect.setVisible(true);
      });
    } else {
      coordText.setText('');
      eventZones.forEach(zone => {
        if (zone.debugRect) zone.debugRect.setVisible(false);
      });
    }

    // End condition - near right end of map
    if (player.x > 5000) {
      this.gameEnded = true;
      this.physics.pause();
      this.scene.start('EndScene', { gpa, popularity, chaos });
    }
  }
}

function createEventZone(scene, x, y, type) {
  const zone = scene.add.zone(x, y, 100, 100);
  scene.physics.world.enable(zone);
  zone.body.setAllowGravity(false);
  zone.body.moves = false;
  zone.triggered = false;
  zone.type = type;
  eventZones.push(zone);
  scene.physics.add.overlap(player, zone, () => {
    if (!zone.triggered) {
      zone.triggered = true;
      triggerEvent(type);
    }
  }, null, scene);
}

function triggerEvent(type) {
  player.setVelocityX(0);
  game.scene.scenes[1].physics.pause(); // GameScene is scenes[1]

  let html = '';

  switch (type) {
    case 'quiz':
      html = `<h3>Surprise Pop Quiz! You weren’t ready.</h3>
        <button onclick="chooseEvent('Copy off smart kid')">Copy off smart kid</button><br><br>
        <button onclick="chooseEvent('Panic and guess')">Guess all C</button><br><br>
        <button onclick="chooseEvent('Bribe teacher with gum')">Offer gum to teacher</button><br><br>
        <button onclick="chooseEvent('Sleep through it')">Sleep through it</button>`;
      break;
    case 'fight':
      html = `<h3>A cafeteria fight breaks out!</h3>
        <button onclick="chooseEvent('Shield with Chromebook')">Use Chromebook</button><br><br>
        <button onclick="chooseEvent('Summon Band Kids')">Call Band Kids</button><br><br>
        <button onclick="chooseEvent('Cry under the table')">Cry</button><br><br>
        <button onclick="chooseEvent('Start filming')">Record it for clout</button>`;
      break;
    case 'fire':
      html = `<h3>Fire drill! But… it’s raining.</h3>
        <button onclick="chooseEvent('Run outside anyway')">Little rain won’t hurt me</button><br><br>
        <button onclick="chooseEvent('Hide in janitor’s closet')">Hide in janitor's closet</button><br><br>
        <button onclick="chooseEvent('Yell FIRE back at the alarm')">Yell "FIRE" and screem back at the alarm</button><br><br>
        <button onclick="chooseEvent('Start a party')">Start a party</button>`;
      break;
    case 'detention':
      html = `<h3>You got detention!</h3>
        <button onclick="chooseEvent('Escape through vent')">Escape through vent</button><br><br>
        <button onclick="chooseEvent('Serve it like a boss')">Own it and serve</button><br><br>
        <button onclick="chooseEvent('Fake illness')">Pretend to faint</button><br><br>
        <button onclick="chooseEvent('Do homework during')">Actually study</button>`;
      break;
    case 'snowday':
      html = `<h3>It’s a snow day, but you came to school.</h3>
        <button onclick="chooseEvent('Build indoor snowman')">Snowman in the hall</button><br><br>
        <button onclick="chooseEvent('Declare yourself principal')">You’re in charge now</button><br><br>
        <button onclick="chooseEvent('Throw snowballs in class')">Snowball fight</button><br><br>
        <button onclick="chooseEvent('Ask for homework')">Study</button>`;
      break;
    case 'hackathon':
      html = `<h3>School hackathon!</h3>
        <button onclick="chooseEvent('Build cheating robot')">Robot cheater</button><br><br>
        <button onclick="chooseEvent('Crash school servers')">Crash it all</button><br><br>
        <button onclick="chooseEvent('Win fairly')">Win it legit</button><br><br>
        <button onclick="chooseEvent('Let AI write your code')">Let AI write your code</button>`;
      break;
    case 'prom':
      html = `<h3>Prom night chaos!</h3>
        <button onclick="chooseEvent('Spike the punch')">Spike the punch</button><br><br>
        <button onclick="chooseEvent('Dance battle teacher')">Dance-off</button><br><br>
        <button onclick="chooseEvent('Steal spotlight')">Steal spotlight</button><br><br>
        <button onclick="chooseEvent('Rap battle someone')">Rap battle someone</button>`;
      break;
    case 'legend':
      html = `<h3>You’re about to graduate...</h3>
        <button onclick="chooseEvent('Stage Dive')">Stage dive at ceremony</button><br><br>
        <button onclick="chooseEvent('Give Real Speech')">Give emotional speech</button><br><br>
        <button onclick="chooseEvent('Hug principal')">Hug the principal</button><br><br>
        <button onclick="chooseEvent('Sleep through ceremony')">Sleep through ceremony</button>`;
      break;
  }

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
    case 'Copy off smart kid': resultText = "Nice! But they noticed. Suspicion spreads."; gpa += 0.2; chaos += 1; break;
    case 'Panic and guess': resultText = "All Cs? You somehow passed."; gpa += 0.1; break;
    case 'Bribe teacher with gum': resultText = "They took it. You gained weird favor."; popularity += 3; chaos += 2; break;
    case 'Sleep through it': resultText = "You wake up to everyone turning in their papers."; gpa -= 0.3; break;

    case 'Shield with Chromebook': resultText = "You blocked a chicken nugget. Your screen shattered. 0.2 gpa activity"; gpa -= 0.2; break;
    case 'Summon Band Kids': resultText = "They charged with trombones. You became a local hero."; popularity += 5; chaos += 1; break;
    case 'Cry under the table': resultText = "The janitor fist bumps you in solidarity."; chaos += 2; break;
    case 'Start filming': resultText = "You got likes, but missed class."; gpa -= 0.3; popularity += 2; break;

    case 'Run outside anyway': resultText = "You’re soaked. But heroic."; popularity += 2; break;
    case 'Hide in janitor’s closet': resultText = "You found a mop sword. +1 strange power."; chaos += 3; break;
    case 'Yell FIRE back at the alarm': resultText = "The alarm stopped. You win. (???)"; chaos += 5; break;
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

    case 'Spike the punch': resultText = "The party went wild."; chaos += 5; break;
    case 'Dance battle teacher': resultText = "You crushed it."; popularity += 6; break;
    case 'Steal spotlight': resultText = "All eyes on you."; popularity += 4; chaos += 3; break;
    case 'Rap battle someone': resultText = "RAP GOD."; popularity += 1; break;

    case 'Stage Dive': resultText = "You became a legend, people started to spread your stories."; popularity += 10; chaos += 4; break;
    case 'Give Real Speech': resultText = "Your words moved the crowd."; popularity += 6; gpa += 0.1; break;
    case 'Hug principal': resultText = "Awww... that was awkward but kinda sweet."; chaos += 1; break;
    case 'Sleep through ceremony': resultText = "You graduated... via email?"; gpa -= 0.3; break;
  }

  gpa = Math.max(0, Math.min(4.0, parseFloat(gpa.toFixed(2))));
  gpaText.setText('GPA: ' + gpa.toFixed(2));
  popText.setText('Popularity: ' + popularity);
  chaosText.setText('Chaos: ' + chaos);

  document.getElementById('eventPopup').innerHTML = `<p>${resultText}</p><br><button onclick="closeEvent()">Continue</button>`;
}

function closeEvent() {
  document.getElementById('eventPopup').remove();
  game.scene.scenes[1].physics.resume(); // GameScene is scenes[1]
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
      gravity: { y: 600 },
      debug: false
    }
  },
  scene: [StartScene, GameScene, EndScene],
  parent: 'game'
};

const game = new Phaser.Game(config);
