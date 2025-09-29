document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Canvas Animation Setup ---
    const setupCanvasAnimation = function() {
      const canvas = document.querySelector(".connecting-dots");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const colors = ["rgb(255, 77, 90)", "rgb(255, 77, 90)", "rgb(255, 77, 90)", "rgb(255, 77, 90)", "rgb(81, 162, 233)"];
      canvas.width = document.body.scrollWidth;
      canvas.height = Math.max(document.body.scrollHeight, window.innerHeight); // Cover full page height
      canvas.style.display = "block";
      ctx.lineWidth = 0.3;
      ctx.strokeStyle = "rgb(255, 77, 90)";
      let mousePosition = { x: 30 * canvas.width / 100, y: 30 * canvas.height / 100 };
      const innerWidth = window.innerWidth;
      let config;
      function Dot(){ this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height; this.vx = -.5 + Math.random(); this.vy = -.5 + Math.random(); this.radius = 1.5 * Math.random(); this.colour = colors[Math.floor(Math.random() * colors.length)] }
      if (innerWidth > 1600) { config = { nb: 600, distance: 70, d_radius: 300, array: [] }; } else if (innerWidth > 1300) { config = { nb: 575, distance: 60, d_radius: 280, array: [] }; } else if (innerWidth > 1100) { config = { nb: 500, distance: 55, d_radius: 250, array: [] }; } else if (innerWidth > 800) { config = { nb: 300, distance: 0, d_radius: 0, array: [] }; } else if (innerWidth > 600) { config = { nb: 200, distance: 0, d_radius: 0, array: [] }; } else { config = { nb: 100, distance: 0, d_radius: 0, array: [] }; }
      Dot.prototype = { create: function(){ ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, !1); const gradient = ((this.x - mousePosition.x) ** 2 + (this.y - mousePosition.y) ** 2) ** .5 / (innerWidth / 1.7); ctx.fillStyle = this.colour.slice(0, -1) + `,${1 - gradient})`; ctx.fill() }, animate: function(){ for (let i = 1; i < config.nb; i++) { const dot = config.array[i]; if (dot.y < 0 || dot.y > canvas.height) { dot.vy = -dot.vy } else if (dot.x < 0 || dot.x > canvas.width) { dot.vx = -dot.vx } dot.x += dot.vx; dot.y += dot.vy } }, line: function(){ for (let i = 0; i < config.nb; i++) { for (let j = 0; j < config.nb; j++) { const dot1 = config.array[i]; const dot2 = config.array[j]; if (Math.abs(dot1.x - dot2.x) < config.distance && Math.abs(dot1.y - dot2.y) < config.distance && Math.abs(dot1.x - mousePosition.x) < config.d_radius && Math.abs(dot1.y - mousePosition.y) < config.d_radius) { ctx.beginPath(); ctx.moveTo(dot1.x, dot1.y); ctx.lineTo(dot2.x, dot2.y); let gradient = ((dot1.x - mousePosition.x) ** 2 + (dot1.y - mousePosition.y) ** 2) ** .5 / config.d_radius; gradient -= .3; if (gradient < 0) gradient = 0; ctx.strokeStyle = `rgb(255, 77, 90, ${1 - gradient})`; ctx.stroke(); ctx.closePath() } } } } };
      window.onmousemove = function(event){ mousePosition.x = event.pageX; mousePosition.y = event.pageY; try { config.array[0].x = event.pageX; config.array[0].y = event.pageY } catch (e) {} };
      mousePosition.x = window.innerWidth / 2;
      mousePosition.y = window.innerHeight / 2;
      const animationInterval = setInterval(() => { ctx.clearRect(0, 0, canvas.width, canvas.height); for (let i = 0; i < config.nb; i++) { if(!config.array[i]) { config.array.push(new Dot()) } config.array[i].create() } if (config.array.length > 0) { config.array[0].radius = 1.5; config.array[0].colour = "#ff4d5a"; const dotProto = new Dot(); dotProto.line(); dotProto.animate() } }, 1e3 / 30);
      window.onresize = function(){ clearInterval(animationInterval); setupCanvasAnimation() };
    };
    setupCanvasAnimation();

    // --- 2. Nav Intersection Observer ---
    const navItems = document.querySelectorAll(".navigation__item");
    let observerOptions = { root: null, rootMargin: "0px", threshold: 0.5 };
    let observer = new IntersectionObserver((entries, observer) => { entries.forEach(entry => { if (entry.isIntersecting) { navItems.forEach(item => { item.classList.remove("navigation__item--active"); }); const navLink = document.querySelector(`#nav-${entry.target.id}`); if(navLink) { navLink.classList.add("navigation__item--active"); } } }); }, observerOptions);
    observer.observe(document.querySelector("#hero"));
    observer.observe(document.querySelector("#about"));
    observer.observe(document.querySelector("#contact"));
    new IntersectionObserver((entries, observer) => { entries.forEach(entry => { if(entry.isIntersecting) { navItems.forEach(item => { item.classList.remove("navigation__item--active"); }); const navLink = document.querySelector(`#nav-${entry.target.id}`); if(navLink) { navLink.classList.add("navigation__item--active"); } } }); }, { root: null, rootMargin: "0px", threshold: 0.2 }).observe(document.querySelector("#projects"));

    // --- NEW: Chatbot Arrow Visibility Logic ---
    const aboutSection = document.querySelector("#about");
    const chatPrompt = document.getElementById("chat-prompt-arrow");

    if (aboutSection && chatPrompt) {
        const arrowObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    chatPrompt.classList.add('is-visible');
                } else {
                    chatPrompt.classList.remove('is-visible');
                }
            });
        }, { threshold: 0.2 }); // Trigger when 10% of the section is visible

        arrowObserver.observe(aboutSection);
    }

    // --- 4. Form validation ---
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    document.querySelector(".contact__form-submit").addEventListener("click", () => {
      const nameInput = document.querySelector(".contact__form-name");
      const emailInput = document.querySelector(".contact__form-email");
      const messageInput = document.querySelector(".contact__form-message");
      const nameValue = nameInput.value, emailValue = emailInput.value, messageValue = messageInput.value;
      const errorName = document.querySelector(".form-error__name"), errorEmail = document.querySelector(".form-error__email"), errorMsg = document.querySelector(".form-error__msg");
      let isNameValid = false, isEmailValid = false, isMsgValid = false;
      if (nameValue) { isNameValid = true; nameInput.classList.remove("input-error"); errorName.style.display = "none"; } else { isNameValid = false; nameInput.classList.add("input-error"); errorName.style.display = "block"; }
      if (emailValue.match(emailRegex)) { isEmailValid = true; emailInput.classList.remove("input-error"); errorEmail.style.display = "none"; } else { isEmailValid = false; emailInput.classList.add("input-error"); errorEmail.style.display = "block"; }
      if (messageValue) { isMsgValid = true; messageInput.classList.remove("input-error"); errorMsg.style.display = "none"; } else { isMsgValid = false; messageInput.classList.add("input-error"); errorMsg.style.display = "block"; }
      if (isNameValid && isEmailValid && isMsgValid) { document.querySelector(".contact__form").submit(); new Promise(resolve => setTimeout(resolve, 1500)).then(() => { document.querySelector(".contact__form").reset(); }); }
    });
});
