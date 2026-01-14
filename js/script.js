// =======================
// THEME TOGGLE
// =======================
const checkbox = document.getElementById("checkbox");

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  document.documentElement.classList.add("dark-mode");
  if (checkbox) checkbox.checked = true;
}

if (checkbox) {
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      document.body.classList.add("dark-mode");
      document.documentElement.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      document.documentElement.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  });
}

// =======================
// BACK TO TOP LOGIC (NEW)
// =======================
const backToTopBtn = document.querySelector(".back-to-top");

window.addEventListener("scroll", () => {
  // Show button after scrolling down 300px
  if (window.scrollY > 1000) {
    backToTopBtn.style.display = "block";
  } else {
    backToTopBtn.style.display = "none";
  }
});

if (backToTopBtn) {
  backToTopBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

// =======================
// CUSTOM CURSOR (DESKTOP ONLY)
// =======================
const isDesktop = !("ontouchstart" in window);
const cursor = document.getElementById("customCursor");

if (isDesktop && cursor) {
  document.addEventListener("mousemove", (e) => {
    cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    const target = e.target;
    if (target.closest("a, button, [role='button'], [onclick], input[type='submit'], input[type='button']")) {
      cursor.style.backgroundImage = "url('cursors/link.png')";
      return;
    }
    if (window.getSelection().toString().length > 0) {
      cursor.style.backgroundImage = "url('cursors/text.png')";
      return;
    }
    cursor.style.backgroundImage = "url('cursors/normal.png')";
  });
} else if (cursor) {
  cursor.style.display = "none"; 
}

// ==================================================
// SMOKE CURSOR — SWIRL DESKTOP + SOFT CLOUD MOBILE
// ==================================================
let auraEnabled = false;
const auraButton = document.getElementById("aura-toggle");

if (auraButton) {
  auraButton.textContent = "Smokey Cursor Tail Off";
  auraButton.addEventListener("click", () => {
    auraEnabled = !auraEnabled;
    auraButton.textContent = auraEnabled ? "Smokey Cursor Tail On" : "Smokey Cursor Tail Off";
    if (!auraEnabled) {
      particles.length = 0;
      ctx.clearRect(0, 0, width, height);
    }
  });
}

const canvas = document.getElementById("smokeCanvas");
const ctx = canvas.getContext("2d");

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

const pointers = {};
let particles = [];
let smokeColor = { h: 0, s: 80, l: 65 };

function pickRandomColor() {
  smokeColor.h = Math.floor(Math.random() * 360);
  smokeColor.s = 70 + Math.random() * 25;
  smokeColor.l = 50 + Math.random() * 20;
}

class SmokeParticle {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;

    if (!isDesktop) {
      this.size = 12 + Math.random() * 10; 
      this.life = 1.0;
      this.fadeSpeed = 0.025; 
      this.blur = 18; 
      this.spin = (Math.random() - 0.5) * 0.15;
      this.speed = 1.0;
    } else {
      this.size = 18 + Math.random() * 12;
      this.life = 1.0;
      this.fadeSpeed = 0.015;
      this.blur = 14;
      this.spin = (Math.random() - 0.5) * 0.35;
      this.speed = 1.6;
    }

    this.angle = angle + (Math.random() - 0.5);
  }

  update() {
    this.angle += this.spin;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.life -= this.fadeSpeed;
  }

  draw() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.filter = `blur(${this.blur}px)`;
    ctx.fillStyle = `hsla(${smokeColor.h}, ${smokeColor.s}%, ${smokeColor.l}%, ${this.life * 0.5})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function animate() {
  ctx.clearRect(0, 0, width, height);
  if (auraEnabled) {
    for (const id in pointers) {
      const p = pointers[id];
      const dx = p.x - p.lastX;
      const dy = p.y - p.lastY;
      const speed = Math.hypot(dx, dy);
      if (speed > 1.0) {
        const angle = Math.atan2(dy, dx) + Math.PI / 2;
        particles.push(new SmokeParticle(p.x, p.y, angle));
      }
      p.lastX = p.x;
      p.lastY = p.y;
    }
  }
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].life <= 0) particles.splice(i, 1);
  }
  requestAnimationFrame(animate);
}
animate();

document.addEventListener("mousemove", (e) => {
  if (!pointers.mouse) pickRandomColor();
  pointers.mouse = pointers.mouse || { x: e.clientX, y: e.clientY, lastX: e.clientX, lastY: e.clientY };
  pointers.mouse.x = e.clientX;
  pointers.mouse.y = e.clientY;
});

document.addEventListener("mouseleave", () => {
  delete pointers.mouse;
});

document.addEventListener("touchstart", (e) => {
  pickRandomColor();
  for (const t of e.touches) {
    pointers[t.identifier] = {
      x: t.clientX,
      y: t.clientY, 
      lastX: t.clientX,
      lastY: t.clientY,
    };
  }
}, { passive: true });

document.addEventListener("touchmove", (e) => {
  for (const t of e.touches) {
    const p = pointers[t.identifier];
    if (p) {
      p.x = t.clientX;
      p.y = t.clientY;
    }
  }
}, { passive: true });

function removeTouch(e) {
  for (const t of e.changedTouches) {
    delete pointers[t.identifier];
  }
}
document.addEventListener("touchend", removeTouch);
document.addEventListener("touchcancel", removeTouch);