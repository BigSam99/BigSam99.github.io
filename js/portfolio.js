const portfolio = {
  header: {},
  ml: {},
  minecraft: {}
};

app.ready(e => {
  portfolio.header.bg = select(".portfolio-header-bg");
  const heroObserver = new IntersectionObserver((entries, observer) => {
    portfolio.header.bg.classList.toggle("scrolled-down", !entries[0].isIntersecting);
  }, { threshold: 0.4 });
  heroObserver.observe(select('.hero-section'));

  portfolio.header.outlines = selectAll(".tab, .tab-outline");
  portfolio.header.outlines.forEach(el => el.style.opacity = 0);
  select('.tab-container').style.opacity = 1;

  animate('.tab, .tab-outline', {
    translateY: [(el, i) => `${-i*5}px`, 0],
    scaleY: [0.8, 1],
    opacity: (el, i) => 1-i*0.08,
    delay: (el, i) => 500 + 50*i,
    duration: 1200,
    easing: "easeOutQuad"
  });

  animate(".hero-name-inner", {
    translateY: ["1.2em", 0],
    easing: "easeOutExpo",
    delay: (el, i) => 1200 + 130*i,
    duration: 1200
  });

  animate('.portfolio-intro-header', {
    translateY: ["-12px", 0],
    opacity: [0, 0.7],
    easing: "easeOutSine",
    delay: 1500
  }).then(() => {
    // Init low prio
    portfolio.minecraft.init();
    portfolio.ml.init();
  });
});

portfolio.ml.init = () => {
  // Wrap every letter in a span
  const header = select('.grid-item-ml-text-wrapper');
  header.innerHTML = header.textContent.replace(/\S/g, "<span class='grid-item-header-ml-letter'>$&</span>");

  const mlAnimation = anime.timeline({loop: true})
    .add({
      targets: '.grid-item-header-ml-letter',
      translateY: ["1.3em", 0],
      translateZ: 0,
      duration: 750,
      delay: (el, i) => 50 * i
    }).add({
      targets: '.grid-item-header-ml-letter',
      opacity: 0,
      translateZ: 0,
      easing: "easeOutExpo",
      duration: 750,
      delay: (el, i) => 200 + 50 * i
    });

  app.animations.track(mlAnimation, header);
  
}

portfolio.minecraft.reverse = false;
portfolio.minecraft.isInMotion = false;

portfolio.minecraft.init = function() {
  listen(".grid-item-minecraft", "mouseenter", () => {
    if (portfolio.minecraft.isInMotion == true) return;
    portfolio.playMinecraftAnimationReverse(portfolio.minecraft.reverse);
  });

  listen(".grid-item-minecraft", "mouseleave", () => {
    if (portfolio.minecraft.isInMotion == true) return;
    portfolio.playMinecraftAnimationReverse(portfolio.minecraft.reverse);
  });

  portfolio.minecraft.block = select(".grid-item-minecraft-block");
  portfolio.minecraft.frames = portfolio.minecraft.block.dataset.frames;
  const blockRect = portfolio.minecraft.block.getBoundingClientRect();
  portfolio.minecraft.frameWidth = blockRect.width;
  portfolio.minecraft.frameHeight = blockRect.height;
  portfolio.minecraft.currentFrame = 20;
}

portfolio.playMinecraftAnimationReverse = function(reverse) {
  portfolio.minecraft.reverse = !portfolio.minecraft.reverse;
  portfolio.stopAnimation();
  // Flip direction
  portfolio.minecraft.currentFrame = portfolio.minecraft.frames - portfolio.minecraft.currentFrame;

  portfolio.minecraft.loop = setInterval(() => {
    if (portfolio.minecraft.currentFrame + 1 >= portfolio.minecraft.frames) {
      portfolio.stopAnimation();
      return;
    }
    // Stop animation from reversing if it's more than 2/5 through completion (then just complete it)
    if (portfolio.minecraft.currentFrame > portfolio.minecraft.frames/5*2) portfolio.minecraft.isInMotion = true;

    portfolio.minecraft.currentFrame++;
    portfolio.setMinecraftFrameToInt(portfolio.minecraft.currentFrame, reverse);
  }, 40);
}

portfolio.setMinecraftFrameToInt = function(frame, reverse) {
  portfolio.minecraft.block.style.backgroundPosition = -frame*portfolio.minecraft.frameWidth + "px " + reverse*portfolio.minecraft.frameHeight + "px";
}

portfolio.stopAnimation = function() {
  clearInterval(portfolio.minecraft.loop);
  portfolio.minecraft.isInMotion = false;
}