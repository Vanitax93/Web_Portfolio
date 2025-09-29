/* background-effect.js */

function startConnectingDotsAnimation() {
  const canvas = document.querySelector(".connecting-dots");
  if (!canvas) {
    console.error("Canvas element with class '.connecting-dots' not found.");
    return;
  }
  const ctx = canvas.getContext("2d");

  // Using the red color from your site's palette
  const colors = [
    "rgb(255, 77, 90)",
    "rgb(255, 77, 90)",
    "rgb(255, 77, 90)",
    "rgb(81, 162, 233)", // Kept one blue for variety
    "rgb(255, 77, 90)",
  ];

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = "block";
  ctx.lineWidth = 0.3;
  ctx.strokeStyle = "rgb(255, 77, 90)"; // Line color

  let mousePosition = {
    x: (30 * canvas.width) / 100,
    y: (30 * canvas.height) / 100,
  };

  const innerWidth = window.innerWidth;
  let config;

  if (innerWidth > 1600) {
    config = { nb: 600, distance: 70, d_radius: 300, array: [] };
  } else if (innerWidth > 1300) {
    config = { nb: 575, distance: 60, d_radius: 280, array: [] };
  } else if (innerWidth > 1100) {
    config = { nb: 500, distance: 55, d_radius: 250, array: [] };
  } else if (innerWidth > 800) {
    config = { nb: 300, distance: 0, d_radius: 0, array: [] };
  } else if (innerWidth > 600) {
    config = { nb: 200, distance: 0, d_radius: 0, array: [] };
  } else {
    config = { nb: 100, distance: 0, d_radius: 0, array: [] };
  }

  function Dot() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = -0.5 + Math.random();
    this.vy = -0.5 + Math.random();
    this.radius = 1.5 * Math.random();
    this.colour = colors[Math.floor(Math.random() * colors.length)];
  }

  Dot.prototype = {
    create: function () {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
      const gradient =
        ((this.x - mousePosition.x) ** 2 +
          (this.y - mousePosition.y) ** 2) **
          0.5 /
        (innerWidth / 1.7);
      ctx.fillStyle = this.colour.slice(0, -1) + `,${1 - gradient})`;
      ctx.fill();
    },
    animate: function () {
      for (let e = 1; e < config.nb; e++) {
        const dot = config.array[e];
        if (dot.y < 0 || dot.y > canvas.height) {
          dot.vy = -dot.vy;
        } else if (dot.x < 0 || dot.x > canvas.width) {
          dot.vx = -dot.vx;
        }
        dot.x += dot.vx;
        dot.y += dot.vy;
      }
    },
    line: function () {
      for (let i = 0; i < config.nb; i++) {
        for (let j = 0; j < config.nb; j++) {
          const dot1 = config.array[i];
          const dot2 = config.array[j];
          if (
            Math.abs(dot1.x - dot2.x) < config.distance &&
            Math.abs(dot1.y - dot2.y) < config.distance &&
            Math.abs(dot1.x - mousePosition.x) < config.d_radius &&
            Math.abs(dot1.y - mousePosition.y) < config.d_radius
          ) {
            ctx.beginPath();
            ctx.moveTo(dot1.x, dot1.y);
            ctx.lineTo(dot2.x, dot2.y);
            let gradient =
              ((dot1.x - mousePosition.x) ** 2 +
                (dot1.y - mousePosition.y) ** 2) **
                0.5 /
              config.d_radius;
            gradient -= 0.3;
            if (gradient < 0) gradient = 0;
            ctx.strokeStyle = `rgb(255, 77, 90, ${1 - gradient})`; // Line color with opacity
            ctx.stroke();
            ctx.closePath();
          }
        }
      }
    },
  };

  window.onmousemove = function (event) {
    mousePosition.x = event.pageX;
    mousePosition.y = event.pageY;
    try {
      config.array[0].x = event.pageX;
      config.array[0].y = event.pageY;
    } catch (e) {}
  };

  mousePosition.x = window.innerWidth / 2;
  mousePosition.y = window.innerHeight / 2;

  const animationInterval = setInterval(function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < config.nb; i++) {
      if (!config.array[i]) {
        config.array.push(new Dot());
      }
      const dot = config.array[i];
      dot.create();
    }
    const dotProto = new Dot();
    dotProto.line();
    dotProto.animate();
  }, 1000 / 30);

  window.onresize = function () {
    clearInterval(animationInterval);
    startConnectingDotsAnimation();
  };
}

startConnectingDotsAnimation();