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
  scene: {
    preload,
    create,
    update
  },
  parent: 'game'
};

const game = new Phaser.Game(config);

let player;
let cursors;

function preload() {
  this.load.image('bg', 'assets/background.png');
  this.load.image('ground', 'assets/platform.png');
  this.load.spritesheet('player', 'assets/player.png', {
    frameWidth: 32,
    frameHeight: 48
  });
}

function create() {
  this.add.image(400, 225, 'bg').setScrollFactor(1, 0);

  const platforms = this.physics.add.staticGroup();
  platforms.create(400, 440, 'ground').setScale(2).refreshBody();

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

  //evennet zone
  this.eventZone = this.add.zone(600, 400, 100, 100);
  this.physics.world.enable(this.eventZone);
  this.eventZone.body.setAllowGravity(false);
  this.eventZone.body.moves = false;

  this.physics.add.overlap(player, this.eventZone, triggerEvent, null, this);


  this.cameras.main.startFollow(player);
  this.cameras.main.setBounds(0, 0, 1600, 450);
  this.physics.world.setBounds(0, 0, 1600, 450);
}

function update() {
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
}

let eventTriggered = false;

function triggerEvent() {
  if (eventTriggered) return;
  eventTriggered = true;
  player.setVelocityX(0); // Stop player movement

  // Freeze world
  game.scene.scenes[0].physics.pause();

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

  appDiv.innerHTML = `
    <h3>A cafeteria fight breaks out!</h3>
    <button onclick="chooseEvent('Shield with Chromebook')">Use Chromebook</button>
    <br><br>
    <button onclick="chooseEvent('Summon Band Kids')">Call Band Kids</button>
    <br><br>
    <button onclick="chooseEvent('Cry under the table')">Cry</button>
  `;
  document.body.appendChild(appDiv);
}

function chooseEvent(option) {
  const resultText = {
    'Shield with Chromebook': "You blocked a chicken nugget. Your screen shattered.",
    'Summon Band Kids': "They charged with trombones. You gained +5 respect.",
    'Cry under the table': "The janitor fist bumps you in solidarity."
  }[option];

  document.getElementById('eventPopup').innerHTML = `<p>${resultText}</p><br><button onclick="closeEvent()">Continue</button>`;
}

function closeEvent() {
  document.getElementById('eventPopup').remove();
  game.scene.scenes[0].physics.resume();
}
