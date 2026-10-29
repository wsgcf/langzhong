
(function () {
  window.addEventListener("load", function () {
    setTimeout(function () {
      var skeleton = document.getElementById("skeleton");
      if (skeleton) {
        skeleton.classList.add("hidden");
        setTimeout(function () {
          skeleton.remove();
        }, 500);
      }
    }, 1500);
  });
  var deco = document.createElement("div");
  deco.className = "float-deco";
  document.body.insertBefore(deco, document.body.firstChild);
  var canvas = document.createElement("canvas");
  canvas.className = "particles-canvas";
  document.body.appendChild(canvas);
  var ctx = canvas.getContext("2d");
  var particles = [];
  var particleCount = 80;
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  for (var i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.2
    });
  }
  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(function (p) {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(168, 139, 250, " + p.opacity + ")";
      ctx.fill();
    });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();
  var cursorCanvas = document.createElement("canvas");
  cursorCanvas.className = "comet-canvas";
  document.body.appendChild(cursorCanvas);
  var cctx = cursorCanvas.getContext("2d");
  var mouseX = 0, mouseY = 0;
  var trail = [];
  var trailLength = 20;
  function resizeCursorCanvas() {
    cursorCanvas.width = window.innerWidth;
    cursorCanvas.height = window.innerHeight;
  }
  resizeCursorCanvas();
  window.addEventListener("resize", resizeCursorCanvas);
  document.addEventListener("mousemove", function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    trail.push({ x: mouseX, y: mouseY });
    if (trail.length > trailLength) trail.shift();
  });
  function drawComet() {
    cctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
    if (trail.length > 1) {
      cctx.beginPath();
      cctx.moveTo(trail[0].x, trail[0].y);
      for (var i = 1; i < trail.length; i++) {
        cctx.lineTo(trail[i].x, trail[i].y);
      }
      var gradient = cctx.createLinearGradient(
        trail[0].x, trail[0].y,
        trail[trail.length-1].x, trail[trail.length-1].y
      );
      gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0.9)");
      cctx.strokeStyle = gradient;
      cctx.lineWidth = 3;
      cctx.lineCap = "round";
      cctx.lineJoin = "round";
      cctx.shadowBlur = 10;
      cctx.shadowColor = "rgba(255, 255, 255, 0.8)";
      cctx.stroke();
    }
    requestAnimationFrame(drawComet);
  }
  drawComet();
  
  var cur = document.createElement("div");
  cur.id = "cursor";
  cur.innerHTML = '<i class="iconoir-star-solid"></i>';
  document.body.appendChild(cur);
  var cx = -100, cy = -100, px = -100, py = -100, curRaf = null;
  var HOT_SEL = "a,button,label,summary,[onclick],.carousel,.food-stage,.food-card,.nav a,.quick-nav a,.timeline-item,.spot-detail";
  var TXT_SEL = "input,textarea,select";
  function cursorLoop() {
    px += (cx - px) * 0.4;
    py += (cy - py) * 0.4;
    cur.style.transform = "translate(" + px + "px," + py + "px)";
    if (Math.abs(cx - px) > 0.08 || Math.abs(cy - py) > 0.08) {
      curRaf = requestAnimationFrame(cursorLoop);
    } else {
      curRaf = null;
    }
  }
  document.addEventListener("mousemove", function (e) {
    cx = e.clientX;
    cy = e.clientY;
    if (!curRaf) curRaf = requestAnimationFrame(cursorLoop);
    var t = e.target;
    if (t.closest && t.closest(TXT_SEL)) {
      cur.classList.remove("hot");
      document.body.classList.add("cursor-off");
    } else {
      document.body.classList.remove("cursor-off");
      if (t.closest && t.closest(HOT_SEL)) cur.classList.add("hot");
      else cur.classList.remove("hot");
    }
  });
  document.addEventListener("mouseleave", function () { cur.style.opacity = "0"; });
  document.addEventListener("mouseenter", function () { cur.style.opacity = "1"; });

  var slots = document.querySelectorAll(".img-slot");
  slots.forEach(function (slot) {
    var img = slot.querySelector("img");
    var tip = slot.querySelector(".slot-tip");
    if (!img) return;
    function showImage() {
      img.style.display = "block";
      if (tip) tip.style.display = "none";
    }
    function showTip() {
      img.style.display = "none";
      if (tip) tip.style.display = "flex";
    }
    img.addEventListener("load", showImage);
    img.addEventListener("error", showTip);
    if (img.complete && img.naturalWidth > 0) {
      showImage();
    } else {
      showTip();
    }
  });
})();
