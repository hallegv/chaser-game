const progressBar = document.querySelector("progress");
const score = document.querySelector("#score");
const gameOver = document.querySelector("#gameOver");

let shark;
let fishie;
let mermaid;
let water;
let powerUp;

function preload() {
  water = loadImage(
    "https://raw.githubusercontent.com/hallegv/chaser-game/master/underwater.jpg"
  );
  //SOURCE: https://unsplash.com/s/photos/underwater
  fishie = loadImage(
    "https://raw.githubusercontent.com/hallegv/chaser-game/master/fishie.png"
  );
  //SOURCE: https://easydrawingguides.com/how-to-draw-a-cartoon-fish/
  shark = loadImage(
    "https://raw.githubusercontent.com/hallegv/chaser-game/master/sharkie.png"
  );
  //SOURCE: https://www.uihere.com/free-cliparts/bruce-great-white-shark-drawing-youtube-clip-art-shark-1494347
  mermaidImage = loadImage(
    "https://raw.githubusercontent.com/hallegv/chaser-game/master/mermaid.png"
  );
  //SOURCE: https://www.pngfly.com/png-23wxtl/
  plankton = loadImage(
    "https://raw.githubusercontent.com/hallegv/chaser-game/master/plankton.png"
  );
  //SOURCE: https://nickelodeon.fandom.com/wiki/Sheldon_J._Plankton
}


class Sprite {
  constructor(x, y, color, diameter) {
    Object.assign(this, { x, y, color, diameter });
  }
  get radius() {
    return this.diameter / 2;
  }
  move(target) {
    this.x += (target.x - this.x) * this.speed;
    this.y += (target.y - this.y) * this.speed;
  }
}

class Player extends Sprite {
  constructor() {
    super(0, 0, "white", 20);
    this.health = 100;
    this.speed = 0.025;
  }
  render() {
    image(fishie, this.x, this.y, 45, 45);
  }
  takeHit() {
    this.health -= 1;
    progressBar.value = this.health;
  }
  addHealth() {
    this.health += 0.25;
    if (this.health > 100) {
      this.health = 100;
    }
    progressBar.value = this.health;
  }
}

class Enemy extends Sprite {
  constructor(x, y, speed) {
    super(x, y, "white", 50);
    this.speed = speed;
  }
  render() {
    image(shark, this.x, this.y);
  }
}

class Mermaid extends Sprite {
  constructor(x, y, spawned) {
    super(x, y, millis());
    this.spawned = spawned;
  }
  render() {
    image(mermaidImage, this.x, this.y);
  }
}

class PowerUp extends Sprite {
  constructor(x, y, color, diameter, spawned) {
    super(x, y, "white", 20, millis());
    this.spawned = spawned;
  }
  render() {
    image(plankton, this.x, this.y, 45, 45);
  }
}

class Pollution extends Sprite {
  constructor(x, y) {
    super(x, y);
  }
  render() {
    image(trash, this.x, this.y);
  }
}

function collided(sprite1, sprite2) {
  const distanceBetween = Math.hypot(
    sprite1.x - sprite2.x,
    sprite1.y - sprite2.y
  );
  const sumOfRadii = sprite1.diameter / 2 + sprite2.diameter / 2;
  return distanceBetween < sumOfRadii;
}

function randomPointOnCanvas() {
  return [
    Math.floor(Math.random() * width),
    Math.floor(Math.random() * height)
  ];
}

let width = 1000;
let height = 1000;
let player = new Player();
let enemies = [
  new Enemy(...randomPointOnCanvas(), 0.008),
  new Enemy(...randomPointOnCanvas(), 0.01),
  new Enemy(...randomPointOnCanvas(), 0.03),
  new Enemy(...randomPointOnCanvas(), 0.02),
  new Enemy(...randomPointOnCanvas(), 0.005)
];

function fiveNewSharks() {
  enemies.push(new Enemy(...randomPointOnCanvas(), Math.random() * 0.03));
  enemies.push(new Enemy(...randomPointOnCanvas(), Math.random() * 0.03));
  enemies.push(new Enemy(...randomPointOnCanvas(), Math.random() * 0.05));
  enemies.push(new Enemy(...randomPointOnCanvas(), Math.random() * 0.03));
  enemies.push(new Enemy(...randomPointOnCanvas(), Math.random() * 0.07));
}

function checkForDamage(enemy, player) {
  if (collided(player, enemy)) {
    player.takeHit();
  }
}

function checkForHealth(powerUp, player) {
  if (collided(player, powerUp)) {
    player.addHealth();
  }
}

function keyPressed() {
  if (keyCode === 32 && enemies.length >= 6) {
    enemies.pop();
  }
}

function adjustSprites() {
  const characters = [player, ...enemies];
  for (let i = 0; i < characters.length; i++) {
    for (let j = i + 1; j < characters.length; j++) {
      pushOff(characters[i], characters[j]);
    }
  }
}

function pushOff(c1, c2) {
  let [dx, dy] = [c2.x - c1.x, c2.y - c1.y];
  const distance = Math.hypot(dx, dy);
  let overlap = c1.radius + c2.radius - distance;
  if (overlap > 0) {
    const adjustX = overlap / 2 * (dx / distance);
    const adjustY = overlap / 2 * (dy / distance);
    c1.x -= adjustX;
    c1.y -= adjustY;
    c2.x += adjustX;
    c2.y += adjustY;
  }
}

function setup() {
  createCanvas(width, height);
  noStroke();
}

function draw() {
  background(water);
  score.textContent = Math.floor(millis() / 1000);
  player.render();
  player.move({ x: mouseX, y: mouseY });
  if (mermaid) {
    mermaid.render();
    mermaid.ttl--;
    if (mermaid.ttl <= 0) {
      mermaid = undefined;
    }
    if (millis() - mermaid.spawned >= 5000) {
      mermaid = undefined;
    }
  }
  if (powerUp) {
    powerUp.render();
    powerUp.ttl--;
    if (powerUp.ttl <= 0) {
      powerUp = undefined;
    }
    checkForHealth(powerUp, player);
    if (millis() - powerUp.spawned >= 5000) {
      powerUp = undefined;
    }
  }

  enemies.forEach(enemy => {
    enemy.render();
    checkForDamage(enemy, player);
    enemy.move(mermaid || player);
  });
  adjustSprites();
  if (progressBar.value === 0) {
    gameOver.textContent = "GAME OVER 😢☠️";
    noLoop();
  }
}

function mouseClicked() {
  if (!mermaid) {
    mermaid = new Mermaid(player.x, player.y, millis());
  }
  if (enemies.length < 40) {
    fiveNewSharks();
  }
  if (!powerUp) {
    powerUp = new PowerUp(...randomPointOnCanvas(), "white", 20, millis());
  }
}

//HUGE thank you's to Fosse Lin-Bianco, Donovan Moini, and Maddie Louis for the help!
