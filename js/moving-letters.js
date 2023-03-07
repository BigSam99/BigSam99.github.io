var ml = {};
ml.timelines = {};
ml.overlay = {};
ml.isShowingSource = false;

app.ready(() => {
  listenAll(".composition-wrapper", "click", e => {
    ml.showComposition(e.currentTarget, e, { refreshAd: true });
  });

  listen(".composition-back-button", "click", e => {
    e.preventDefault();
    ml.hideSource();
  });

  listen(".header-title", "click", ml.animateHeader);
  listen(window, "scroll", ml.onlyPlayVisible);
  listen(window, "resize", ml.onlyPlayVisible);
  listen(window, "resize", ml.overlay.resizeCanvas);
  listen(document, "app:menuDidReveal", ml.pauseAllCompositions);
  listen(document, "app:menuWillHide", ml.onlyPlayVisible);
  listen(document, "app:menuDidHide", ml.onlyPlayVisible);
  listen(document, "pressed:ESC", ml.hideSource);

  ml.compositions = selectAll(".composition");
  ml.ad = select(".ml-carbon-ad");
  const header = select('.header-title');
  header.innerHTML = header.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

  ml.onlyPlayVisible();
  ml.loadCompositionFromCurrentHash();
});

ml.animateHeader = function() {
  anime({
    targets: '.header-title .letter',
    rotateY: [-360, 0],
    duration: 1300,
    easing: "easeOutExpo",
    delay: (el, i) => 45 * i
  });
}

ml.onlyPlayVisible = function() {
  // Don't play if any overlays are playing
  if (ml.isShowingSource || app.menu.visible) return;
  ml.compositions.forEach(function(element, i) {
    ml.compShouldPlay(element) ? ml.playComposition(element) : ml.pauseComposition(element);
  });
}

ml.compShouldPlay = function(comp) {
  var winHeight = window.innerHeight;
  var bounds = comp.getBoundingClientRect();
  var offset = 180; // Greater offset -> comps will play less often

  // Check if bottom of comp is above view or if top of comp is below view
  if (bounds.bottom < 0+offset || bounds.top > winHeight-offset) return false;
  // Default to true
  return true;
}

ml.playComposition = function(comp) {
  var compID = comp.querySelector("h1").className;
  ml.timelines[compID].play();
}

ml.restartComposition = function(comp) {
  var compID = comp.querySelector("h1").className;
  ml.timelines[compID].restart();
}

ml.pauseComposition = function(comp) {
  var compID = comp.querySelector("h1").className;
  ml.timelines[compID].pause();
}

ml.pauseAllCompositions = function() {
  ml.compositions.forEach(function(element, i) {
    ml.pauseComposition(element);
  });
}

// Displaying compositions
ml.showComposition = function(comp, e, options) {
  if (comp.classList.contains("composition-active")) return;
  ml.prepareSourceForComposition(comp.parentElement);
  ml.showSourceForComposition(comp, e, options);
}

ml.prepareSourceForComposition = function(comp) {
  var compNumber = ml.getElementIndex(comp) + 1;
  select(".composition-source-header").textContent = "Effect " + compNumber;

  // Set html
  var html = comp.querySelector(".composition-static-html").innerHTML;
  html = ml.prependHTMLwithJS(html.trim());
  select(".composition-source-code-html").innerHTML = html;

  // Set CSS
  var css = comp.querySelector("style").innerHTML;
  select(".composition-source-code-css").textContent = css.trim();

  // Set javascript
  var script = comp.querySelector("script").innerHTML;
  script = ml.removeInternalJSFromCode(script);
  select(".composition-source-code-js").textContent = script.trim();
}

ml.prependHTMLwithJS = function(html) {
  var cdn = "https://cdnjs.cloudflare.com/ajax/libs/animejs/2.0.2/anime.min.js";
  var scriptTag = '<script src="' + cdn + '"></script>';
  var scripts = ml.escapeHTML(scriptTag);

  return html + "\n\n" + scripts;
}

ml.escapeHTML = function(html) {
  var text = document.createTextNode(html);
  var div = document.createElement('div');
  div.appendChild(text);

  return div.innerHTML;
}

ml.removeInternalJSFromCode = function(code) {
  // Remove the line where it's stored in ML for pausing/playing
  var startPosition = code.indexOf("ml.timelines[");
  var endPosition = code.indexOf("anime.timeline(");

  return code.slice(0, startPosition) + code.slice(endPosition, code.length);
}

ml.showSourceForComposition = function(c, e, options) {
  ml.isShowingSource = true;

  // Hide ad, then refresh it, so it can be displayed in a new position with a new ad
  ml.ad.style.opacity = 0;
  ml.ad.classList.add("ml-carbon-ad-source-showing");
  if (options.refreshAd == true) ml.refreshAd();

  select("html").classList.add("is-showing-source");
  c.classList.add("composition-active");
  ml.pauseAllCompositions();
  ml.updateHashForComposition(c);

  // Play chosen composition from beginning
  ml.restartComposition(c);
  ml.pauseComposition(c);
  app.menu.hideMenuIcon();
  var spawnPosition = ml.spawnPositionForEventAndComp(e, c);
  app.overlay.show({
    position: spawnPosition,
    fill: "#" + c.dataset.color
  });

  // Prepare to animate in overlay elements
  select(".composition-back-button").style.opacity = 0;
  select(".composition-back-button").style.display = "block";
  select(".composition-source-text").style.opacity = 0;
  select(".composition-source").style.display = "block";
  select(".composition-source-container").style.transform = "scaleX(0)";
  select(".composition-source-container").style.display = "block";

  // Animate in overlay elements
  anime.timeline()
  .add({
    targets: ".composition-source-container",
    scaleX: [0, 1],
    duration: 900,
    delay: 500,
    easing: "easeOutExpo",
    complete: () => ml.playComposition(c)
  }).add({
    targets: ".composition-source-text",
    opacity: [0,1],
    translateY: [-50, 0],
    delay: (el, i) => 50 * i,
    easing: "easeOutExpo",
    offset: "-=150"
  }).add({
    targets: ml.ad,
    opacity: [0,1],
    easing: "easeOutExpo",
    offset: "-=1250"
  });

  anime({
    targets: ".composition-back-button",
    opacity: [0,1],
    easing: "easeOutExpo",
    scale: [0.8, 1],
    delay: 300,
    translateX: [-40, 0]
  });
}

ml.hideSource = function() {
  if (!ml.isShowingSource) return;
  ml.isShowingSource = false;
  ml.resetHash();

  ml.ad.classList.remove("ml-carbon-ad-source-showing");
  ml.refreshAd();

  select("html").classList.remove("is-showing-source");
  ml.onlyPlayVisible();
  select(".composition-active").classList.remove("composition-active");
  
  app.overlay.hide({
    position: app.overlay.lastStartingPoint,
    fill: app.overlay.bgColor
  });

  anime({
    targets: ".composition-source-text",
    opacity: 0,
    duration: 400,
    easing: "easeInQuad"
  });

  anime({
    targets: ".composition-source-container",
    translateX: "100%",
    duration: 500,
    easing: "easeInQuad",
    complete: function() {
      // Reset scroll position (could have changed if you opened before and scrolled)
      var comp = select(".composition-source");
      comp.scrollTop = 0;
      comp.style.display = "none";
    }
  });

  anime({
    targets: ".composition-back-button",
    opacity: [1,0],
    easing: "easeInQuad",
    translateX: [0, -40],
    scale: [1, 0.8],
    duration: 300,
    complete: function() {
      select(".composition-back-button").style.display = "none";
      app.menu.showMenuIcon();
    }
  });
}

ml.updateHashForComposition = function(c) {
  window.location.hash = ml.getElementIndex(c.parentElement) + 1;
}

ml.getElementIndex = function(node) {
  var index = 0;
  while ( (node = node.previousElementSibling) ) { index++; }
  return index;
}

ml.resetHash = function() {
  history.pushState("", document.title, window.location.pathname + window.location.search);
}

ml.loadCompositionFromCurrentHash = function() {
  var hash = window.location.hash;
  if (hash == "") return;

  ml.loadCompositionForHash(hash);
}

ml.loadCompositionForHash = function(hash) {
  var ID = parseInt(hash.substr(1,2));
  var comp = selectAll(".composition")[ID-1];
  var rect = comp.getBoundingClientRect();
  document.scrollTop = rect.top;
  ml.showComposition(comp.querySelector(".composition-wrapper"), {}, { refreshAd: false });
}

ml.spawnPositionForEventAndComp = (e, comp) => {
  if (e.touches) e = e.touches[0];

  return {
    x: e.clientX ? e.clientX : ml.horizontalCenterForElement(comp.parentElement),
    y: e.clientY ? e.clientY : ml.verticalCenterForElement(comp.parentElement)
  };
}

ml.horizontalCenterForElement = function(element) {
  var rect = element.getBoundingClientRect();
  return rect.left + rect.width / 2;
}

ml.verticalCenterForElement = function(element) {
  var rect = element.getBoundingClientRect();

  return rect.top + rect.height / 2 + 50;
}

ml.refreshAd = function() {
  if (select("#carbonads") == null) return;
  if (typeof _carbonads !== 'undefined') _carbonads.refresh();
}
