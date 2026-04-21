const GAME_WIDTH = 512;
const GAME_HEIGHT = 416;
const STAR_COUNT = 40;
const ASTEROID_SPAWN_MS = 1620;
const ARTIFACT_SPAWN_MS = 1440;
const FUEL_PICKUP_SPAWN_MS = 5200;
const JET_X = 92;
const JET_SIZE = { width: 42, height: 26 };
const JET_SPEED = 0.245;
const SCROLL_SPEED = 0.13;
const ROPE_DURATION_MS = 230;
const ROPE_COOLDOWN_MS = 120;
const ROPE_MAX_REACH = 126;
const START_FUEL_MS = 10000;
const FUEL_PICKUP_BONUS_MS = 10000;
const MAX_FUEL_MS = 30000;
const ARTIFACT_SCORE = 5;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createStars() {
  return Array.from({ length: STAR_COUNT }, () => ({
    x: randomBetween(0, GAME_WIDTH),
    y: randomBetween(0, GAME_HEIGHT),
    size: Math.random() > 0.8 ? 2 : 1,
    speed: randomBetween(0.03, 0.12),
    shade: Math.random() > 0.7 ? "#f1ecdf" : "#cfc8bb",
  }));
}

function createAsteroid() {
  const radius = randomBetween(16, 28);
  const y = randomBetween(radius + 18, GAME_HEIGHT - radius - 18);

  return {
    type: "asteroid",
    x: GAME_WIDTH + radius + 20,
    y,
    radius,
    rotation: randomBetween(0, Math.PI * 2),
    spin: randomBetween(-0.003, 0.003),
    speed: randomBetween(0.082, 0.135),
    craters: Array.from({ length: 3 }, () => ({
      x: randomBetween(-radius * 0.35, radius * 0.35),
      y: randomBetween(-radius * 0.35, radius * 0.35),
      r: randomBetween(radius * 0.12, radius * 0.24),
    })),
  };
}

function createArtifact() {
  const width = randomBetween(12, 18);
  const height = randomBetween(14, 20);
  const y = randomBetween(height + 8, GAME_HEIGHT - height - 8);

  return {
    type: "artifact",
    x: GAME_WIDTH + width + 24,
    y,
    width,
    height,
    rotation: randomBetween(0, Math.PI * 2),
    spin: randomBetween(-0.003, 0.003),
    speed: randomBetween(0.064, 0.108),
    flutter: randomBetween(0, Math.PI * 2),
  };
}

function createFuelPickup() {
  const size = randomBetween(14, 18);
  const y = randomBetween(size + 10, GAME_HEIGHT - size - 10);

  return {
    type: "fuel",
    x: GAME_WIDTH + size + 26,
    y,
    size,
    rotation: randomBetween(0, Math.PI * 2),
    spin: randomBetween(-0.002, 0.002),
    speed: randomBetween(0.058, 0.096),
    bob: randomBetween(0, Math.PI * 2),
  };
}

function circleRectCollision(circle, rect) {
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;

  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

function artifactRectCollision(artifact, rect) {
  const halfWidth = artifact.width / 2;
  const halfHeight = artifact.height / 2;

  return !(
    artifact.x + halfWidth < rect.x ||
    artifact.x - halfWidth > rect.x + rect.width ||
    artifact.y + halfHeight < rect.y ||
    artifact.y - halfHeight > rect.y + rect.height
  );
}

function fuelRectCollision(fuel, rect) {
  const half = fuel.size / 2;

  return !(
    fuel.x + half < rect.x ||
    fuel.x - half > rect.x + rect.width ||
    fuel.y + half < rect.y ||
    fuel.y - half > rect.y + rect.height
  );
}

export class SpaceJetGameEngine {
  constructor({
    canvas,
    onScoreChange,
    onFuelChange,
    onFinalRopeChange,
    onGameOver,
    onRunningChange,
  }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onScoreChange = onScoreChange;
    this.onFuelChange = onFuelChange;
    this.onFinalRopeChange = onFinalRopeChange;
    this.onGameOver = onGameOver;
    this.onRunningChange = onRunningChange;

    this.frameId = 0;
    this.lastTime = 0;
    this.asteroidTimer = 0;
    this.artifactTimer = 0;
    this.fuelPickupTimer = 0;
    this.direction = null;
    this.stars = createStars();

    this.reset();
  }

  reset() {
    this.jet = {
      x: JET_X,
      y: GAME_HEIGHT / 2 - JET_SIZE.height / 2,
      width: JET_SIZE.width,
      height: JET_SIZE.height,
      flameTick: 0,
    };
    this.asteroids = [];
    this.artifacts = [];
    this.fuelPickups = [];
    this.score = 0;
    this.fuelMs = START_FUEL_MS;
    this.finalRopeAvailable = false;
    this.running = false;
    this.gameOver = false;
    this.asteroidTimer = 0;
    this.artifactTimer = 0;
    this.fuelPickupTimer = 0;
    this.direction = null;
    this.lastTime = 0;
    this.rope = {
      active: false,
      timer: 0,
      cooldown: 0,
      progress: 0,
    };

    this.onScoreChange(0);
    this.onFuelChange(START_FUEL_MS);
    this.onFinalRopeChange(false);
    this.onGameOver(false);
    this.onRunningChange(false);
    this.render();
  }

  start() {
    if (this.running) return;

    this.running = true;
    this.gameOver = false;
    this.onGameOver(false);
    this.onRunningChange(true);
    this.frameId = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    this.direction = null;
    this.rope.active = false;
    this.onFinalRopeChange(false);
    this.onRunningChange(false);

    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = 0;
    }
  }

  destroy() {
    this.stop();
  }

  setDirection(direction) {
    if (this.fuelMs <= 0) {
      this.direction = null;
      return;
    }

    this.direction = direction;

    if (direction) {
      this.jet.flameTick = 120;
    }
  }

  triggerRope() {
    if (this.rope.cooldown > 0 || this.rope.active) return;
    if (this.fuelMs <= 0 && !this.finalRopeAvailable) return;

    if (this.fuelMs <= 0 && this.finalRopeAvailable) {
      this.finalRopeAvailable = false;
      this.onFinalRopeChange(false);
    }

    this.rope.active = true;
    this.rope.timer = ROPE_DURATION_MS;
    this.rope.progress = 0;
    this.rope.cooldown = ROPE_DURATION_MS + ROPE_COOLDOWN_MS;
  }

  endGame() {
    this.running = false;
    this.gameOver = true;
    this.direction = null;
    this.rope.active = false;
    this.onRunningChange(false);
    this.onGameOver(true);

    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = 0;
    }

    this.render();
  }

  award(points) {
    this.score += points;
    this.onScoreChange(this.score);
  }

  setFuel(nextFuelMs) {
    const clamped = Math.max(0, Math.min(MAX_FUEL_MS, nextFuelMs));
    const fuelWasEmpty = this.fuelMs <= 0;

    this.fuelMs = clamped;
    this.onFuelChange(this.fuelMs);

    if (fuelWasEmpty && this.fuelMs > 0) {
      this.finalRopeAvailable = false;
      this.onFinalRopeChange(false);
    }
  }

  getRopeRect() {
    const x = this.jet.x + this.jet.width + 4;
    const y = this.jet.y - 20;
    const width = Math.max(22, Math.round(ROPE_MAX_REACH * this.rope.progress));
    const height = this.jet.height + 40;

    return { x, y, width, height };
  }

  update(deltaMs) {
    const dt = Math.min(deltaMs, 32);

    this.stars.forEach((star) => {
      star.x -= star.speed * dt;

      if (star.x < -4) {
        star.x = GAME_WIDTH + 4;
        star.y = randomBetween(0, GAME_HEIGHT);
      }
    });

    if (this.fuelMs > 0) {
      this.setFuel(this.fuelMs - dt);

      if (this.fuelMs <= 0) {
        this.direction = null;
        this.finalRopeAvailable = true;
        this.onFinalRopeChange(true);
      }

      if (this.direction === "up") {
        this.jet.y -= JET_SPEED * dt;
      }

      if (this.direction === "down") {
        this.jet.y += JET_SPEED * dt;
      }
    }

    this.jet.y = Math.max(
      12,
      Math.min(GAME_HEIGHT - this.jet.height - 12, this.jet.y)
    );
    this.jet.flameTick = Math.max(0, this.jet.flameTick - dt);

    this.asteroidTimer += dt;
    this.artifactTimer += dt;
    this.fuelPickupTimer += dt;
    this.rope.cooldown = Math.max(0, this.rope.cooldown - dt);

    if (this.asteroidTimer >= ASTEROID_SPAWN_MS) {
      this.asteroidTimer = 0;
      this.asteroids.push(createAsteroid());
    }

    if (this.artifactTimer >= ARTIFACT_SPAWN_MS) {
      this.artifactTimer = 0;
      this.artifacts.push(createArtifact());
    }

    if (this.fuelPickupTimer >= FUEL_PICKUP_SPAWN_MS) {
      this.fuelPickupTimer = 0;
      this.fuelPickups.push(createFuelPickup());
    }

    this.asteroids.forEach((asteroid) => {
      asteroid.x -= asteroid.speed * dt + SCROLL_SPEED * dt;
      asteroid.rotation += asteroid.spin * dt;
    });

    this.artifacts.forEach((artifact) => {
      artifact.x -= artifact.speed * dt + SCROLL_SPEED * dt;
      artifact.rotation += artifact.spin * dt;
      artifact.flutter += 0.0035 * dt;
      artifact.y += Math.sin(artifact.flutter) * 0.18;
    });

    this.fuelPickups.forEach((fuel) => {
      fuel.x -= fuel.speed * dt + SCROLL_SPEED * dt;
      fuel.rotation += fuel.spin * dt;
      fuel.bob += 0.0025 * dt;
      fuel.y += Math.sin(fuel.bob) * 0.14;
    });

    if (this.rope.active) {
      this.rope.timer = Math.max(0, this.rope.timer - dt);

      const phase = 1 - this.rope.timer / ROPE_DURATION_MS;
      this.rope.progress = phase <= 0.5 ? phase / 0.5 : (1 - phase) / 0.5;

      const ropeRect = this.getRopeRect();

      this.artifacts = this.artifacts.filter((artifact) => {
        const hit = artifactRectCollision(artifact, ropeRect);

        if (hit) {
          this.award(ARTIFACT_SCORE);
        }

        return !hit;
      });

      this.fuelPickups = this.fuelPickups.filter((fuel) => {
        const hit = fuelRectCollision(fuel, ropeRect);

        if (hit) {
          this.setFuel(this.fuelMs + FUEL_PICKUP_BONUS_MS);
        }

        return !hit;
      });

      if (this.rope.timer <= 0) {
        this.rope.active = false;
        this.rope.progress = 0;

        if (this.fuelMs <= 0 && !this.finalRopeAvailable) {
          this.endGame();
          return;
        }
      }
    }

    this.asteroids = this.asteroids.filter(
      (asteroid) => asteroid.x + asteroid.radius > -40
    );
    this.artifacts = this.artifacts.filter(
      (artifact) => artifact.x + artifact.width > -30
    );
    this.fuelPickups = this.fuelPickups.filter((fuel) => fuel.x + fuel.size > -30);

    const jetBounds = {
      x: this.jet.x + this.jet.width * 0.18,
      y: this.jet.y + this.jet.height * 0.16,
      width: this.jet.width * 0.62,
      height: this.jet.height * 0.56,
    };

    const collided = this.asteroids.some((asteroid) =>
      circleRectCollision(
        { x: asteroid.x, y: asteroid.y, radius: asteroid.radius - 2 },
        jetBounds
      )
    );

    if (collided) {
      this.endGame();
    }
  }

  drawBackground() {
    const { ctx } = this;

    ctx.fillStyle = "#111111";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = "#1b1b1b";
    ctx.fillRect(0, GAME_HEIGHT - 72, GAME_WIDTH, 72);

    this.stars.forEach((star) => {
      ctx.fillStyle = star.shade;
      ctx.fillRect(Math.round(star.x), Math.round(star.y), star.size, star.size);
    });

    ctx.fillStyle = "#d7d0c0";
    for (let i = 0; i < 6; i += 1) {
      const x = (i * 62 - ((this.lastTime || 0) * 0.02) % 62) | 0;
      const height = 14 + ((i % 3) * 10);
      ctx.fillRect(x, GAME_HEIGHT - 24 - height, 28, height);
    }
  }

  drawJet() {
    const { ctx } = this;
    const x = Math.round(this.jet.x);
    const y = Math.round(this.jet.y);
    const flameOffset = this.jet.flameTick > 0 ? 1 : 0;
    const scaleX = this.jet.width / 30;
    const scaleY = this.jet.height / 18;
    const px = (value) => Math.round(value * scaleX);
    const py = (value) => Math.round(value * scaleY);

    ctx.fillStyle = "#f1ecdf";
    ctx.fillRect(x + px(4), y + py(4), px(18), py(10));
    ctx.fillRect(x + px(20), y + py(6), px(6), py(6));
    ctx.fillRect(x + px(2), y + py(6), px(3), py(6));
    ctx.fillRect(x + px(24), y + py(7), px(4), py(4));
    ctx.fillRect(x, y + py(7) - flameOffset, px(3), py(4) + flameOffset * py(2));
    ctx.fillRect(x + px(10), y, px(8), py(2));
    ctx.fillRect(x + px(10), y + py(14), px(8), py(2));

    ctx.clearRect(x + px(8), y + py(5), px(9), py(3));
    ctx.clearRect(x + px(10), y + py(6), px(3), py(2));

    ctx.fillStyle = "#111111";
    ctx.fillRect(x + px(8), y + py(4), px(10), Math.max(1, py(1)));
    ctx.fillRect(x + px(8), y + py(8), px(10), Math.max(1, py(1)));
    ctx.fillRect(x + px(8), y + py(4), Math.max(1, px(1)), py(5));
    ctx.fillRect(x + px(17), y + py(4), Math.max(1, px(1)), py(5));
    ctx.fillRect(x + px(4), y + py(4), Math.max(1, px(1)), py(10));
    ctx.fillRect(x + px(21), y + py(4), Math.max(1, px(1)), py(10));
    ctx.fillRect(x + px(20), y + py(6), Math.max(1, px(1)), py(6));
    ctx.fillRect(x + px(25), y + py(6), Math.max(1, px(1)), py(6));

    if (this.jet.flameTick > 0) {
      ctx.fillRect(x - Math.max(1, px(1)), y + py(8), Math.max(1, px(1)), py(2));
    }
  }

  drawAsteroid(asteroid) {
    const { ctx } = this;
    const diameter = asteroid.radius * 2;

    ctx.save();
    ctx.translate(Math.round(asteroid.x), Math.round(asteroid.y));
    ctx.rotate(asteroid.rotation);

    ctx.fillStyle = "#111111";
    ctx.fillRect(-asteroid.radius, -asteroid.radius, diameter, diameter);

    ctx.strokeStyle = "#f1ecdf";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      -asteroid.radius + 1,
      -asteroid.radius + 1,
      diameter - 2,
      diameter - 2
    );

    ctx.fillStyle = "#f1ecdf";
    asteroid.craters.forEach((crater) => {
      const size = Math.max(2, Math.round(crater.r));
      ctx.fillRect(
        Math.round(crater.x - size / 2),
        Math.round(crater.y - size / 2),
        size,
        size
      );
    });

    ctx.restore();
  }

  drawArtifact(artifact) {
    const { ctx } = this;
    const width = Math.round(artifact.width);
    const height = Math.round(artifact.height);

    ctx.save();
    ctx.translate(Math.round(artifact.x), Math.round(artifact.y));
    ctx.rotate(artifact.rotation);

    ctx.fillStyle = "#111111";
    ctx.fillRect(-width / 2, -height / 2, width, height);

    ctx.strokeStyle = "#f1ecdf";
    ctx.lineWidth = 2;
    ctx.strokeRect(-width / 2, -height / 2, width, height);

    ctx.fillStyle = "#f1ecdf";
    ctx.fillRect(-width / 2 + 3, -height / 2 + 4, width - 6, 2);
    ctx.fillRect(-width / 2 + 3, -height / 2 + 8, width - 10, 2);
    ctx.fillRect(-width / 2 + 3, -height / 2 + 12, width - 8, 2);

    ctx.restore();
  }

  drawFuelPickup(fuel) {
    const { ctx } = this;
    const size = Math.round(fuel.size);

    ctx.save();
    ctx.translate(Math.round(fuel.x), Math.round(fuel.y));
    ctx.rotate(fuel.rotation);

    ctx.fillStyle = "#111111";
    ctx.fillRect(-size / 2, -size / 2, size, size);

    ctx.fillStyle = "#f1ecdf";
    ctx.fillRect(-2, -size / 2 + 3, 4, size - 6);
    ctx.fillRect(-size / 2 + 3, -2, size - 6, 4);

    ctx.strokeStyle = "#f1ecdf";
    ctx.lineWidth = 2;
    ctx.strokeRect(-size / 2, -size / 2, size, size);

    ctx.restore();
  }

  drawRuleAsteroidIcon(x, y) {
    const { ctx } = this;

    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    ctx.fillStyle = "#5b5a55";
    ctx.fillRect(-10, -10, 20, 20);

    ctx.fillStyle = "#76756f";
    ctx.fillRect(-6, -6, 12, 12);

    ctx.fillStyle = "#3d3c38";
    ctx.fillRect(-4, -5, 3, 3);
    ctx.fillRect(3, -1, 3, 3);
    ctx.fillRect(-1, 4, 4, 4);

    ctx.restore();
  }

  drawRuleArtifactIcon(x, y) {
    const { ctx } = this;

    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.rotate(-0.16);

    ctx.fillStyle = "#d1cdbd";
    ctx.fillRect(-9, -11, 18, 22);

    ctx.strokeStyle = "#5b594f";
    ctx.lineWidth = 2;
    ctx.strokeRect(-9, -11, 18, 22);

    ctx.fillStyle = "#8a8576";
    ctx.fillRect(-6, -5, 11, 2);
    ctx.fillRect(-6, 0, 9, 2);
    ctx.fillRect(-6, 5, 10, 2);

    ctx.restore();
  }

  drawRuleFuelIcon(x, y) {
    const { ctx } = this;

    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    ctx.fillStyle = "#8c9877";
    ctx.fillRect(-10, -10, 20, 20);

    ctx.fillStyle = "#242a1f";
    ctx.fillRect(-2, -7, 4, 14);
    ctx.fillRect(-7, -2, 14, 4);

    ctx.strokeStyle = "#12150f";
    ctx.lineWidth = 2;
    ctx.strokeRect(-10, -10, 20, 20);

    ctx.restore();
  }

  drawRope() {
    if (!this.rope.active || this.rope.progress <= 0) return;

    const { ctx } = this;
    const startX = Math.round(this.jet.x + this.jet.width);
    const startY = Math.round(this.jet.y + this.jet.height / 2);
    const reach = Math.round(ROPE_MAX_REACH * this.rope.progress);
    const arc = Math.sin(this.rope.progress * Math.PI);
    const midY = startY + Math.round(arc * 18);
    const endX = startX + reach;
    const endY = startY - Math.round(arc * 14);

    ctx.fillStyle = "rgba(241, 236, 223, 0.22)";
    ctx.beginPath();
    ctx.moveTo(startX, startY - 10);
    ctx.quadraticCurveTo(startX + reach * 0.45, midY - 12, endX, endY - 6);
    ctx.lineTo(endX, endY + 6);
    ctx.quadraticCurveTo(startX + reach * 0.45, midY + 12, startX, startY + 10);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#f1ecdf";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(startX + reach * 0.5, midY, endX, endY);
    ctx.stroke();

  }

  drawHud() {
    const { ctx } = this;

    ctx.fillStyle = "#111111";
    ctx.fillRect(12, 12, 150, 30);
    ctx.strokeStyle = "#f1ecdf";
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, 150, 30);

    ctx.fillStyle = "#f1ecdf";
    ctx.font = '12px "Courier New", monospace';
    ctx.fillText(`PAPERS ${String(this.score).padStart(3, "0")}`, 21, 31);

    ctx.fillStyle = "#111111";
    ctx.fillRect(12, 48, 150, 28);
    ctx.strokeStyle = "#f1ecdf";
    ctx.strokeRect(12, 48, 150, 28);
    ctx.fillStyle = "#ddd6c7";
    ctx.fillRect(18, 54, 138, 16);
    ctx.fillStyle = "#f1ecdf";
    ctx.fillRect(18, 54, (138 * this.fuelMs) / MAX_FUEL_MS, 16);

    if (!this.running && !this.gameOver) {
      const panelWidth = 320;
      const panelHeight = 180;
      const panelX = Math.round((GAME_WIDTH - panelWidth) / 2);
      const panelY = Math.round((GAME_HEIGHT - panelHeight) / 2) - 6;

      ctx.fillStyle = "rgba(17, 17, 17, 0.94)";
      ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
      ctx.strokeStyle = "#f1ecdf";
      ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

      ctx.fillStyle = "#f1ecdf";
      ctx.font = '20px "Courier New", monospace';
      ctx.fillText("JET RUNNER", panelX + 86, panelY + 32);

      ctx.font = '12px "Courier New", monospace';
      const ruleIconX = panelX + 58;
      const ruleTextX = panelX + 80;

      ctx.fillStyle = "#f1ecdf";
      ctx.fillText("HELLO EXPLORER, YOU ARE VENTURING", panelX + 28, panelY + 54);
      ctx.fillText("THROUGH SPACE AND TIME IN SEARCH", panelX + 30, panelY + 70);
      ctx.fillText("OF THE HIDDEN SECRETS OF THE UNIVERSE.", panelX + 18, panelY + 86);

      ctx.fillStyle = "#f1ecdf";
      this.drawRuleAsteroidIcon(ruleIconX, panelY + 110);
      ctx.fillText("DODGE ASTEROIDS", ruleTextX, panelY + 114);

      this.drawRuleArtifactIcon(ruleIconX, panelY + 130);
      ctx.fillText("ROPE SNAGS ARTIFACTS", ruleTextX, panelY + 134);

      this.drawRuleFuelIcon(ruleIconX, panelY + 150);
      ctx.fillText("GRAB FUEL CELLS", ruleTextX, panelY + 154);

      ctx.fillText("PRESS START TO LAUNCH", panelX + 64, panelY + 172);
    }

    if (this.fuelMs <= 0 && this.finalRopeAvailable && !this.gameOver) {
      ctx.fillStyle = "#f1ecdf";
      ctx.fillText("LAST ROPE!", 170, 242);
    }

    if (this.gameOver) {
      const panelWidth = 174;
      const panelHeight = 56;
      const panelX = Math.round((GAME_WIDTH - panelWidth) / 2);
      const panelY = Math.round((GAME_HEIGHT - panelHeight) / 2) - 4;

      ctx.fillStyle = "rgba(17, 17, 17, 0.94)";
      ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
      ctx.strokeStyle = "#f1ecdf";
      ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
      ctx.fillStyle = "#f1ecdf";
      ctx.fillText("CRASHED", panelX + 54, panelY + 20);
      ctx.fillText("PRESS START TO RETRY", panelX + 12, panelY + 38);
    }
  }

  render() {
    if (!this.ctx) return;

    this.drawBackground();
    this.fuelPickups.forEach((fuel) => this.drawFuelPickup(fuel));
    this.artifacts.forEach((artifact) => this.drawArtifact(artifact));
    this.asteroids.forEach((asteroid) => this.drawAsteroid(asteroid));
    this.drawJet();
    this.drawRope();
    this.drawHud();
  }

  loop = (timestamp) => {
    if (!this.running) return;

    if (!this.lastTime) {
      this.lastTime = timestamp;
    }

    const deltaMs = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(deltaMs);
    this.render();

    if (this.running) {
      this.frameId = requestAnimationFrame(this.loop);
    }
  };
}

export const SPACE_JET_DIMENSIONS = {
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
};

export const SPACE_JET_FUEL_LIMIT_MS = MAX_FUEL_MS;
