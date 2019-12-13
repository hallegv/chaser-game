const progressBar = document.querySelector("progress");
const score = document.querySelector("#score");
const gameOver = document.querySelector("#gameOver");

let shark;
let fishie;
let mermaid;
let water;
let scarecrow;
let food;

function preload() {
  water = loadImage(
    "https://raw.githubusercontent.com/hallegv/chaser-game/master/underwater.jpg"
  );
  fishie = loadImage(
    "https://raw.githubusercontent.com/hallegv/chaser-game/master/fishie.png"
  );
  shark = loadImage(
    "https://raw.githubusercontent.com/hallegv/chaser-game/master/sharkie.png"
  );
  mermaid = loadImage(
    "https://raw.githubusercontent.com/hallegv/chaser-game/master/mermaid.png"
  );
  plankton = loadImage(
    "https://raw.githubusercontent.com/hallegv/chaser-game/master/plankton.png"
  );
  trash = loadImage(
    "https://raw.githubusercontent.com/hallegv/chaser-game/master/cartoon-trash-008.png"
  );
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

class Scarecrow extends Sprite {
  constructor(x, y, spawned) {
    super(x, y, millis());
    this.spawned = spawned;
  }
  render() {
    image(mermaid, this.x, this.y);
  }
}

class Food extends Sprite {
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

function checkForHealth(food, player) {
  if (collided(player, food)) {
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
  if (scarecrow) {
    scarecrow.render();
    scarecrow.ttl--;
    if (scarecrow.ttl <= 0) {
      scarecrow = undefined;
    }
    if (millis() - scarecrow.spawned >= 5000) {
      scarecrow = undefined;
    }
  }
  if (food) {
    food.render();
    food.ttl--;
    if (food.ttl <= 0) {
      food = undefined;
    }
    checkForHealth(food, player);
    if (millis() - food.spawned >= 5000) {
      food = undefined;
    }
  }

  enemies.forEach(enemy => {
    enemy.render();
    checkForDamage(enemy, player);
    enemy.move(scarecrow || player);
  });
  adjustSprites();
  if (progressBar.value === 0) {
    gameOver.textContent = "GAME OVER 😢☠️";
    noLoop();
  }
}

function mouseClicked() {
  if (!scarecrow) {
    scarecrow = new Scarecrow(player.x, player.y, millis());
  }
  if (enemies.length < 40) {
    fiveNewSharks();
  }
  if (!food) {
    food = new Food(...randomPointOnCanvas(), "white", 20, millis());
  }
}

//HUGE thank you's to Fosse Lin-Bianco, Donovan Moini, and Maddie Louis for the help!
