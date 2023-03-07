const app = {
  ready: (callback) => {
    // In case the document is already rendered
    if (document.readyState!='loading') callback();
    else document.addEventListener('DOMContentLoaded', callback);
  },
  menu: {},
  search: {},
  keys: {},
  overlay: {},
  animations: {}
};

const dispatch = e => document.dispatchEvent(new Event(e));
const select = selector => document.querySelector(selector)
const selectAll = selector => document.querySelectorAll(selector)

const listen = (obj, event, callback) => {
  obj = typeof obj === "string" ? select(obj) : obj;
  obj.addEventListener(event, callback);
}

const listenAll = (objs, event, callback) => {
  objs = typeof objs === "string" ? selectAll(objs) : objs;
  for (const obj of objs) { listen(obj, event, callback) }
}

const create = (element, ...objs) => {
  let elArgs = element.split('.');
  const el = document.createElement(elArgs.shift());
  const children = objs.filter(el => el instanceof HTMLElement);
  const options = objs.filter(el => !(el instanceof HTMLElement) && typeof el === 'object')[0];
  const text = objs.filter(el => typeof el === 'string')[0];
  
  if (text !== undefined) el.textContent = text;
  for (const property in options) { el[property] = options[property] }
  if (elArgs.length > 0) el.classList.add(...elArgs);
  for (const child of children) { el.appendChild(child) }
  return el;
}

const animate = (elements, keyframeTemplates, optionsTemplate = {}) => {
  elements = typeof elements === "string" ? selectAll(elements) : elements;

  // shorthand version, move out options and construct keysFrom and keysTo
  if (!Array.isArray(keyframeTemplates) && typeof keyframeTemplates === 'object') {
    const optionProps = ['delay', 'direction', 'duration', 'easing', 'endDelay', 'fill', 'iterationStart', 'iterations'];
    for (const [key, value] of Object.entries(keyframeTemplates)) {
      if (optionProps.includes(key)) {
        optionsTemplate[key] = value;
        delete keyframeTemplates[key];
      }
    }

    const keysFrom = {}, keysTo = {};
    for (const [key, value] of Object.entries(keyframeTemplates)) {
      // if any keyframe is _not_ defined through an array (to, from), use its current value as from
      if (Array.isArray(value)) {
        keysFrom[key] = value[0];
        keysTo[key] = value[1];
      } else {
        // TODO: set to a keyword ('current'?) that can later be used to get its current value for keysFrom
        // keysFrom[key] = 'current'
        keysTo[key] = value;
      }
    }

    keyframeTemplates = [keysFrom, keysTo];
  }

  const animations = [];
  const easings = {
    easeInSine:     '0.12, 0, 0.39, 0',
    easeOutSine:    '0.61, 1, 0.88, 1',
    easeInOutSine:  '0.37, 0, 0.63, 1',
    easeInQuad:     '0.11, 0, 0.5, 0',
    easeOutQuad:    '0.5, 1, 0.89, 1',
    easeInOutQuad:  '0.45, 0, 0.55, 1',
    easeInCubic:    '0.32, 0, 0.67, 0',
    easeOutCubic:   '0.33, 1, 0.68, 1',
    easeInOutCubic: '0.65, 0, 0.35, 1',
    easeInQuart:    '0.5, 0, 0.75, 0',
    easeOutQuart:   '0.25, 1, 0.5, 1',
    easeInOutQuart: '0.76, 0, 0.24, 1',
    easeInQuint:    '0.64, 0, 0.78, 0',
    easeOutQuint:   '0.22, 1, 0.36, 1',
    easeInOutQuint: '0.83, 0, 0.17, 1',
    easeInExpo:     '0.7, 0, 0.84, 0',
    easeOutExpo:    '0.16, 1, 0.3, 1',
    easeInOutExpo:  '0.87, 0, 0.13, 1',
    easeInCirc:     '0.55, 0, 1, 0.45',
    easeOutCirc:    '0, 0.55, 0.45, 1',
    easeInOutCirc:  '0.85, 0, 0.15, 1',
    easeInBack:     '0.36, 0, 0.66, -0.56',
    easeOutBack:    '0.34, 1.56, 0.64, 1',
    easeInOutBack:  '0.68, -0.6, 0.32, 1.6'
  }

  const transformProps = ['matrix', 'matrix3d', 'perspective', 'rotate', 'rotate3d', 'rotateX', 'rotateY', 'rotateZ', 'translate', 'translate3d', 'translateX', 'translateY', 'translateZ', 'scale', 'scale3d', 'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skew'];

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const keyframes = [];

    for (const keyframeTemplate of keyframeTemplates) {
      const keyframe = {...keyframeTemplate};
      const transforms = [];
      for (const [key, value] of Object.entries(keyframe)) {
        keyframe[key] = typeof value === 'function' ? value(element, i) : value;
        if (transformProps.includes(key)) {
          transforms.push(`${key}(${keyframe[key]})`);
          delete keyframe[key];
        }
      }
      if (transforms.length > 0) keyframe.transform = transforms.join(' ');
      keyframes.push(keyframe);
    }

    const options = {...optionsTemplate};
    let finishCallback;
    if (options.finish !== null) {
      finishCallback = options.finish;
      delete options.finish;
    }

    for (const [key, value] of Object.entries(options)) {
      options[key] = typeof value === 'function' ? value(element, i) : value;
    }
    options.duration = options.duration || 600;
    options.easing = options.easing || "easeOutExpo";
    options.easing = easings[options.easing] !== null ? `cubic-bezier(${easings[options.easing]})` : options.easing;

    const animation = element.animate(keyframes, {...options, fill: 'both'});
    animation.addEventListener('finish', () => {
      try { animation.commitStyles(); } catch (error) { console.error({elements, error}); }
      animation.cancel();
      if (finishCallback !== null && typeof finishCallback === 'function') finishCallback(element, i, i == elements.length-1);
    });

    animations.push(animation);
  }

  return {
    animations,
    then: (callback) => {
      animations[animations.length-1].addEventListener('finish', () => {
        callback();
      });
    }
  };
}

app.ready(() => {
  // Listen to keys, close menu if visible
  listen(document, "keyup", e => { if (e.keyCode == app.keys.ESC) app.keys.handleESC() });
    
  listen(document, "keydown", e => {
    if (e.keyCode == app.keys.arrowUp) app.keys.handleArrowUp(e);
    else if (e.keyCode == app.keys.arrowDown) app.keys.handleArrowDown(e);
    else if (e.keyCode == app.keys.enter) app.keys.handleEnter(e);
  });
});

// Search
app.search.visible = false;
app.search.storageKey = "globalSearchData";
app.ready(() => {
  var searchIcon = select(".js-search");
  if (!(searchIcon instanceof HTMLElement)) return;

  app.search.searchIcon = searchIcon;
  app.search.loadData();

  // Dispatched events
  listen(document, "app:menuDidHide", app.search.showIcon);
  listen(document, "app:menuWillShow", app.search.hideIcon);

  // User input
  listen(searchIcon, "click", e => !app.search.visible ? app.search.reveal(e) : app.search.hide(e));
  listen(".js-search-input", "input", e => app.search.updateForQuery(e.target.value));
});

app.search.loadData = () => {
  // Check if data already exists, if so load it instead
  const cachedData = localStorage.getItem(app.search.storageKey);
  if (cachedData) {
    const data = JSON.parse(cachedData);
    app.search.data = data["items"];
    return;
  }

  // If not, cache this with local storage and don't fetch on every page load
  fetch("/js/searchable.json")
    .then(response => response.json())
    .then(data => {
      localStorage.setItem(app.search.storageKey, JSON.stringify(data));
      app.search.data = data["items"];
    }).catch( err => { /* Handle error */ });
}

app.search.updateForQuery = query => {
  query = query.toLowerCase();
  let hits = [];
  // Look through all items
  for (var i = 0; i < app.search.data.length; i++) {
    // For every item, look for hits
    const entryValues = Object.values(app.search.data[i]);
    const searchString = entryValues.join(" ").toLowerCase();
    if (searchString.indexOf(query) == -1) continue;
    // Store new hit
    hits.push(app.search.data[i]);
  }
  
  app.search.renderResults(hits, query);
}

app.search.renderResults = (results, query) => {
  const searchElements = create("div.site-search-content-results-list");

  for (var i = 0; i < results.length; i++) {
    // Create link and add "active" if first row
    const link = create("a.site-search-results-item.js-site-search-results-item", {
        classList: i == 0 ? "site-search-results-item-active" : "",
        href: results[i]["url"],
        textContent: results[i]["title"]
      },
      create("span.site-search-results-item-desc", results[i]["description"])
    );
    searchElements.appendChild(link);
  }
  // If length is 0, add a placeholder saying you found nothing
  if (results.length == 0) {
    var noResult = create("span.site-search-results-item.site-search-results-item-message",
      'No hits for "' + query + '"'
    );
    searchElements.appendChild(noResult);
  }
  
  var results = select(".js-site-search-content-results");
  results.innerHTML = "";
  results.appendChild(searchElements);

  listenAll(".js-site-search-results-item", "mouseenter", e => app.search.focusItem(e.target));
}

app.menu.visible = false;
app.ready(() => {
  app.menu.icon = select(".js-menu");
  listen(app.menu.icon, "click", e => !app.menu.visible ? app.menu.reveal(e) : app.menu.hide(e));
});

app.menu.toggleStates = () => {
  select('body').classList.toggle('no-scroll');
  app.menu.icon.classList.toggle('menu-active');
  select('.js-nav').classList.toggle('site-nav-active');
}

app.search.toggleStates = () => {
  select('body').classList.toggle('no-scroll');
  select('.js-search-overlay').classList.toggle('site-nav-active');
}

app.menu.reveal = e => {
  app.menu.visible = true;
  app.menu.toggleStates();
  dispatch("app:menuWillShow");

  app.overlay.show({
    position: app.clickPosition(e),
    fill: "#1f4954"
  });

  anime.remove('.js-nav, .js-nav-header-line, .js-nav-animate');

  let containerDelay = 200;

  animate('.js-nav', {
    opacity: [0, 1],
    delay: containerDelay,
    duration: 200,
    easing: "easeInOutExpo"
  });

  var menuItemDelay = 90;
  containerDelay += 75;
  select(".js-nav-header").style.opacity = 0;
  animate('.js-nav-header', {
    opacity: [0, 1],
    delay: containerDelay,
    duration: 200,
    easing: "easeInOutExpo"
  });

  select(".js-nav-header-line").style.transform.replace(/scale\([0-9|\.]*\)/, 'scale(0.28)');
  animate('.js-nav-header-line', {
    scale: [0.28, 1],
    delay: containerDelay,
    duration: 600,
    easing: "easeInOutExpo"
  });
  containerDelay += 350;

  for (let animated of selectAll(".js-nav-animate")) {
    animated.style.opacity = 0;
    animated.style.transform.replace(/scale\([0-9|\.]*\)/, 'scale(0.9)');
  }

  animate('.js-nav-animate', [
    { opacity: 0, scale: 0.9, translateY: '-7px' },
    { opacity: 1, scale: 1, translateY: 0 }
   ], {
     delay: (el, i) => containerDelay + menuItemDelay * (i+1),
     duration: 1100,
     easing: "easeOutExpo"
  }).then(() => dispatch('app:menuDidReveal'));
}

app.search.reveal = e => {
  app.search.toggleStates();
  app.search.visible = true;
  app.menu.hideMenuIcon();

  app.overlay.show({
    position: app.clickPosition(e),
    fill: "#1f4954"
  });

  // Hide search icon and show X
  const searchIconDuration = 400;
  const searchIconDelay = 200;

  // Hide Search icon
  animate('.site-search-icon', [
    { scale: 1, translateY: 0, rotate: '0deg' },
    { scale: 0, translateY: '-5px', rotate: '90deg' }
   ], {
     delay: searchIconDelay,
     duration: searchIconDuration,
     easing: "easeOutExpo"
   });

  // Show close icon
  animate('.site-search-close-icon', {
    scale: [0, 1],
    opacity: [0, 1],
    delay: searchIconDelay,
    duration: searchIconDuration,
    easing: "easeOutExpo",
  });

  animate('.site-search-close-icon-line-1', {
    rotateZ: ['45deg', '225deg'],
    delay: searchIconDelay,
    duration: searchIconDuration,
    easing: "easeOutExpo"
  });

  animate('.site-search-close-icon-line-2', {
    rotateZ: ['45deg', '135deg'],
    delay: searchIconDelay,
    duration: searchIconDuration,
    easing: "easeOutExpo"
  });

  select(".js-search-input").style.opacity = 0;
  animate('.js-search-overlay', {
    opacity: [0, 1],
    delay: 200,
    duration: 200,
    easing: "easeInOutExpo"
  });

  animate('.js-search-input', {
    opacity: [0, 1],
    translateX: ['25px', 0],
    delay: 400,
    duration: 700,
    easing: "easeOutExpo"
  });

  // Focus on input field
  select(".js-search-input").focus();
}

app.search.moveSelectionInDirection = (options) => {
  // Find index of current focus
  var activeSelection = select(".site-search-results-item-active");
  if (!activeSelection) return;
  var newSelection = options.direction === "up" ? activeSelection.previousElementSibling : activeSelection.nextElementSibling;
  // Select next item (if any)
  if (newSelection == null) return;
  activeSelection.classList.remove("site-search-results-item-active");
  newSelection.classList.add("site-search-results-item-active");
}

app.search.moveSelectionUp = () => app.search.moveSelectionInDirection({direction: "up"});
app.search.moveSelectionDown = () => app.search.moveSelectionInDirection({direction: "down"});

app.search.focusItem = (item) => {
  select(".site-search-results-item-active").classList.remove("site-search-results-item-active");
  item.classList.add("site-search-results-item-active");
}

app.search.goToSelectedItem = () => {
  const activeItem = select(".site-search-results-item-active");
  if (!activeItem) return;
  window.location.href = activeItem.href;
}

app.search.hide = () => {
  app.search.toggleStates();
  app.search.visible = false;
  const searchIconDuration = 400;
  const searchIconDelay = 200;

  app.overlay.hide({
    position: app.overlay.lastStartingPoint,
    fill: "#1f4954",
    complete: app.menu.showMenuIcon
  });

  animate('.js-search-input', {
    opacity: [1, 0],
    translateX: [0, '25px'],
    duration: 400,
    easing: "easeOutExpo"
  });

  animate('.js-search-overlay', {
    opacity: [1, 0],
    delay: 200,
    duration: 200,
    easing: "easeInOutExpo"
  });

  // Animate out the cross
  animate('.site-search-close-icon', {
    opacity: [1, 0],
    scale: [1, 0],
    delay: searchIconDelay,
    duration: searchIconDuration + 10,
    easing: "easeInOutExpo"
  });

  animate('.site-search-close-icon-line-1', {
    rotateZ: ['225deg', '45deg'],
    scale: [1, 0.7],
    delay: searchIconDelay,
    duration: searchIconDuration,
    easing: "easeOutExpo"
  });

  animate('.site-search-close-icon-line-2', {
    rotateZ: ['135deg', '45deg'],
    scale: [1, 0.7],
    delay: searchIconDelay,
    duration: searchIconDuration,
    easing: "easeOutExpo"
  });

  animate('.site-search-icon', [
    { translateY: '-5px', rotateZ: '90deg', scale: 0, opacity: 0 },
    { translateY: '0px', rotateZ: '0deg', scale: 1, opacity: 1 }
   ], {
     delay: searchIconDelay,
     duration: searchIconDuration,
     easing: "easeOutExpo"
  });
}

app.menu.hide = (e) => {
  app.menu.visible = false;
  app.menu.toggleStates();
  dispatch("app:menuWillHide");

  app.overlay.hide({
    position: app.overlay.lastStartingPoint,
    fill: "#1f4954",
    complete: () => dispatch("app:menuDidHide")
  });

  animate('.js-nav', {
    opacity: [1, 0],
    duration: 200,
    easing: "easeInOutExpo"
  });

  animate('.js-nav-header-line', {
    scale: [1, 0.5],
    duration: 300,
    easing: "easeInExpo"
  });

  animate('.js-nav-animate', [
    { translateY: '0px', opacity: 1, scale: 1 },
    { translateY: '10px', opacity: 0, scale: 0.9 }
   ], {
     duration: 200,
     easing: "easeInExpo"
  });
}

app.menu.hideMenuIcon = () => app.menu.icon.classList.add("menu-hidden");

app.menu.showMenuIcon = () => {
  app.menu.icon.classList.remove("menu-hidden");
  animate('.menu', {
    opacity: [0, 1],
    duration: 500,
    easing: 'easeOutQuart'
  });
}

app.search.hideIcon = () => {
  if (!app.search.searchIcon) return;
  app.search.searchIcon.classList.add("menu-hidden");
}

app.search.showIcon = () => {
  if (!app.search.searchIcon) return;
  app.search.searchIcon.classList.remove("menu-hidden");
  animate('.js-search', {
    opacity: [0, 1],
    duration: 500,
    easing: 'easeOutQuart'
  });
}

app.keys.handleESC = () => {
  dispatch("pressed:ESC");
  if (app.menu.visible) app.menu.hide()
  if (app.search.visible) app.search.hide();
}

// Keyboard Key handling
app.keys.ESC = 27;
app.keys.arrowUp = 38;
app.keys.arrowDown = 40;
app.keys.enter = 13;

app.keys.handleArrowUp = (e) => {
  if (app.search.visible) {
    e.preventDefault();
    app.search.moveSelectionUp();
  }
}

app.keys.handleArrowDown = (e) => {
  if (app.search.visible) {
    e.preventDefault();
    app.search.moveSelectionDown();
  }
}

app.keys.handleEnter = (e) => {
  if (app.search.visible) {
    e.preventDefault();
    app.search.goToSelectedItem();
  }
}

app.animations.track = (animeTimeline, el) => {
  const animationObserver = new IntersectionObserver((entries, observer) => {
    entries[0].isIntersecting ? animeTimeline.play() : animeTimeline.pause();
  }, { rootMargin: '-5px 0px' });
  animationObserver.observe(el);
}

app.ready(() => {
  app.overlay.c = select(".site-nav-canvas");
  app.overlay.ctx = app.overlay.c.getContext("2d");
  app.overlay.cH;
  app.overlay.cW;
  app.overlay.bgColor = "transparent";
  app.overlay.resizeCanvas();
  app.overlay.lastStartingPoint = {x: 0, y: 0};

  listen(window, "resize", app.overlay.resizeCanvas);
});

app.overlay.resizeCanvas = function() {
  app.overlay.cW = window.innerWidth;
  app.overlay.cH = window.innerHeight;
  app.overlay.c.width = app.overlay.cW * window.devicePixelRatio;
  app.overlay.c.height = app.overlay.cH * window.devicePixelRatio;
  app.overlay.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  app.overlay.ctx.fillStyle = app.overlay.bgColor;
  app.overlay.ctx.fillRect(0, 0, app.overlay.cW, app.overlay.cH);
}

app.overlay.show = options => {
  app.overlay.c.style.display = "block";
  app.overlay.lastStartingPoint = options.position;

  options.targetRadius = app.overlay.calcPageFillRadius(options.position.x, options.position.y);
  options.startRadius = 0;
  options.easing = "easeOutQuart";
  app.overlay.animate(options);
}

// Hide the overlay. Args:
// fill: color to animate with
// position: position to target as the circle shrinks
// complete: completion callback
app.overlay.hide = options => {
  options.targetRadius = 0;
  options.easing = "easeInOutQuart";

  const callback = options.complete;
  options.complete = () => { 
    app.overlay.c.style.display = "none";
    app.overlay.bgColor = "transparent";
    if (callback) callback();
  };

  options.startRadius = app.overlay.calcPageFillRadius(options.position.x, options.position.y);
  app.overlay.animate(options);
}

// Animate from one size to another. Args:
// position: {x, y}
// fill: "color" 
// startRadius: number
// targetRadius: number
// complete: callback method
app.overlay.animate = (options) => {
  const minCoverDuration = 750;
  app.overlay.bgColor = options.fill;
  
  app.overlay.circle.x = options.position.x;
  app.overlay.circle.y = options.position.y;
  app.overlay.circle.r = options.startRadius;
  app.overlay.circle.fill = options.fill;

  anime.remove(app.overlay.circle)

  anime({
    targets: app.overlay.circle,
    r: options.targetRadius,
    duration:  Math.max(options.targetRadius/2, minCoverDuration),
    easing: options.easing,
    complete: options.complete ? options.complete : null,
    update: () => app.overlay.circle.draw({
      startRadius: options.startRadius,
      targetRadius: options.targetRadius
    })
  });
}

app.overlay.calcPageFillRadius = function(x, y) {
  var l = Math.max(x - 0, app.overlay.cW - x);
  var h = Math.max(y - 0, app.overlay.cH - y);
  return Math.sqrt(Math.pow(l, 2) + Math.pow(h, 2));
}

app.clickPosition = (e) => {
  if (e.touches) e = e.touches[0];

  if (e.clientX && e.clientY) return {
    x: e.clientX, 
    y: e.clientY
  }

  // If there was no clientX and Y set, use the center position of
  // the target as a backup
  var rect = e.target.getBoundingClientRect();
  return {
    x: rect.top + (rect.bottom - rect.top)/2,
    y: rect.left + (rect.right - rect.left)/2
  }
}

app.overlay.circle = {};

app.overlay.circle.draw = function(options) {
  if (options.targetRadius < options.startRadius) {
    app.overlay.ctx.clearRect(0,0, app.overlay.cW, app.overlay.cH);
  }

  app.overlay.ctx.beginPath();
  app.overlay.ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
  app.overlay.ctx.fillStyle = this.fill;
  app.overlay.ctx.fill();
  app.overlay.ctx.closePath();
}
