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
// CUSTOM CURSOR (DESKTOP)
// =======================
const isDesktop = !("ontouchstart" in window);
const cursor = document.getElementById("customCursor");

if (isDesktop && cursor) {
  document.addEventListener("mousemove", (e) => {
    cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;

    const target = e.target;
    if (target.closest("a, button, [role='button'], input")) {
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
// 3-COLOR FLUID CURSOR + FULL MULTI-TOUCH SUPPORT
// ==================================================
let auraEnabled = false;
const auraButton = document.getElementById("aura-toggle");

if (auraButton) {
  auraButton.textContent = "Fluid Cursor Tail Off";
  auraButton.addEventListener("click", () => {
    auraEnabled = !auraEnabled;
    auraButton.textContent = auraEnabled
      ? "Fluid Cursor Tail On"
      : "Fluid Cursor Tail Off";

    if (!auraEnabled) {
      fluidParticles.length = 0;
      ctx.clearRect(0, 0, width, height);
    }
  });
}

// =======================
// CANVAS
// =======================
const canvas = document.getElementById("fluidCanvas");
const ctx = canvas.getContext("2d");

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

// =======================
// POINTER STORAGE (UNLIMITED)
// =======================
const pointers = {};
const fluidParticles = [];

// Three flowing hues
const hues = [210, 270, 150];

// =======================
// FLUID PARTICLE CLASS
// =======================
class FluidParticle {
  constructor(x, y, hue, angleOffset) {
    this.x = x;
    this.y = y;
    this.hue = hue;
    this.life = 1;
    this.angle = angleOffset;
    this.radius = 18;
  }

  update(tx, ty) {
    this.angle += 0.12;

    this.x += (tx + Math.cos(this.angle) * 20 - this.x) * 0.14;
    this.y += (ty + Math.sin(this.angle) * 20 - this.y) * 0.14;

    this.life -= 0.02;
  }

  draw() {
    ctx.beginPath();
    ctx.filter = "blur(22px)";
    ctx.fillStyle = `hsla(${this.hue}, 80%, 65%, ${this.life * 0.35})`;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// =======================
// SPAWN FLUID (PER POINTER)
// =======================
function spawnFluid(x, y) {
  hues.forEach((h, i) => {
    fluidParticles.push(new FluidParticle(x, y, h, i * 2));
  });

  if (fluidParticles.length > 120) {
    fluidParticles.splice(0, 3);
  }
}

// =======================
// MOUSE SUPPORT
// =======================
document.addEventListener("mousemove", (e) => {
  if (!pointers.mouse) {
    pointers.mouse = {
      x: e.clientX,
      y: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
    };
  }

  pointers.mouse.x = e.clientX;
  pointers.mouse.y = e.clientY;

  if (auraEnabled) spawnFluid(e.clientX, e.clientY);
});

document.addEventListener("mouseleave", () => {
  delete pointers.mouse;
});

// =======================
// TOUCH SUPPORT (FULL MULTI-TOUCH)
// =======================
document.addEventListener(
  "touchstart",
  (e) => {
    for (const t of e.touches) {
      pointers[t.identifier] = {
        x: t.clientX,
        y: t.clientY,
        lastX: t.clientX,
        lastY: t.clientY,
      };

      if (auraEnabled) spawnFluid(t.clientX, t.clientY);
    }
  },
  { passive: true }
);

document.addEventListener(
  "touchmove",
  (e) => {
    for (const t of e.touches) {
      const p = pointers[t.identifier];
      if (p) {
        p.x = t.clientX;
        p.y = t.clientY;

        if (auraEnabled) spawnFluid(t.clientX, t.clientY);
      }
    }
  },
  { passive: true }
);

function removeTouch(e) {
  for (const t of e.changedTouches) {
    delete pointers[t.identifier];
  }
}

document.addEventListener("touchend", removeTouch);
document.addEventListener("touchcancel", removeTouch);

// =======================
// ANIMATION LOOP
// =======================
function animate() {
  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = "lighter";

  for (let i = fluidParticles.length - 1; i >= 0; i--) {
    const p = fluidParticles[i];

    // Find nearest pointer
    let closest = null;
    let minDist = Infinity;

    for (const id in pointers) {
      const pt = pointers[id];
      const d = Math.hypot(p.x - pt.x, p.y - pt.y);
      if (d < minDist) {
        minDist = d;
        closest = pt;
      }
    }

    if (closest) {
      p.update(closest.x, closest.y);
    }

    p.draw();

    if (p.life <= 0) fluidParticles.splice(i, 1);
  }

  ctx.filter = "none";
  ctx.globalCompositeOperation = "source-over";

  requestAnimationFrame(animate);
}
animate();

// =======================
// DIGITAL CLOCK
// =======================
function updateClock() {
  const now = new Date();

  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;

  const timeString = `${hours}:${minutes}:${seconds} ${ampm}`;

  const dateString = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const timeEl = document.getElementById("digital-time");
  const dateEl = document.getElementById("digital-date");

  if (timeEl && dateEl) {
    timeEl.textContent = timeString;
    dateEl.textContent = dateString;
  }
}

// Initial load
updateClock();

// Update every second
setInterval(updateClock, 1000);


// =======================
// BACK TO TOP
// =======================
const mybutton = document.getElementById("backToTop");

window.onscroll = () => {
  if (!mybutton) return;
  mybutton.style.display =
    document.documentElement.scrollTop > 200 ? "block" : "none";
};

if (mybutton) {
  mybutton.onclick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };
}


const toggle = document.getElementById('menu-toggle');
const nav = document.getElementById('nav-links');

toggle.addEventListener('click', () => {
    // Toggles the 'Equal' sign to 'X'
    toggle.classList.toggle('open');
    // Toggles the visibility of your original pill buttons
    nav.classList.toggle('show');
});