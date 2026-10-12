const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const html = fs.readFileSync(
  path.join(__dirname, "../html/interactive-digital-research-background.html"),
  "utf8"
);
const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1]).join("\n");

function createDeck({ standalone = false, vertical = false, reducedMotion = false,
  readyState = "loading", useReveal = true } = {}) {
  const classes = new Set();
  const documentEvents = new Map();
  const revealEvents = new Map();
  const windowEvents = new Map();
  let animationCount = 0;
  let parsed = readyState !== "loading";
  let overview = false;
  let notifyMutation = () => {};
  const first = { tagName: "SECTION", children: [] };
  const second = { tagName: "SECTION", children: [] };
  const slides = {
    children: vertical
      ? [{ tagName: "SECTION", children: [first, second] }]
      : [first, second]
  };
  let current = first;
  const revealRoot = { querySelector: () => slides };
  const scene = {
    classList: {
      add: (name) => classes.add(name),
      toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name)
    }
  };
  const graphic = {
    style: {},
    getTotalLength: () => 100,
    animate: () => { animationCount += 1; }
  };
  const document = {
    readyState,
    getElementById: (id) => id === "teachingScene" ? scene : graphic,
    querySelector: (selector) => {
      if (!parsed || standalone) return null;
      if (selector === ".reveal") return revealRoot;
      if (selector === ".reveal .slides") return slides;
      return current;
    },
    addEventListener: (name, callback) => documentEvents.set(name, callback)
  };
  const window = {
    matchMedia: () => ({ matches: reducedMotion }),
    addEventListener: (name, callback) => windowEvents.set(name, callback)
  };
  function installReveal() {
    window.Reveal = {
      getCurrentSlide: () => current,
      isOverview: () => overview,
      on: (name, callback) => revealEvents.set(name, callback)
    };
  }
  if (useReveal && parsed && !standalone) installReveal();
  class MutationObserver {
    constructor(callback) { notifyMutation = callback; }
    observe() {}
  }
  vm.runInNewContext(script, { document, window, MutationObserver });

  return {
    first, second,
    visible: () => classes.has("is-visible"),
    animationCount: () => animationCount,
    finishParsing() {
      parsed = true;
      document.readyState = "interactive";
      if (useReveal && !standalone) installReveal();
      documentEvents.get("DOMContentLoaded")?.();
      revealEvents.get("ready")?.();
    },
    navigate(slide) {
      current = slide;
      revealEvents.get("slidechanged")?.();
      notifyMutation();
    },
    setOverview(enabled) {
      overview = enabled;
      revealEvents.get(enabled ? "overviewshown" : "overviewhidden")?.();
    },
    loadReveal() {
      installReveal();
      windowEvents.get("load")?.();
    }
  };
}

test("before-body include waits for the slides, then follows navigation", () => {
  const deck = createDeck();
  assert.equal(deck.visible(), false);
  assert.equal(deck.animationCount(), 0);
  deck.finishParsing();
  assert.equal(deck.visible(), true);
  const count = deck.animationCount();
  assert.ok(count > 0);
  deck.navigate(deck.second);
  assert.equal(deck.visible(), false);
  deck.navigate(deck.first);
  assert.equal(deck.visible(), true);
  assert.equal(deck.animationCount(), count);
});

test("a deep link to a later slide never shows the background on load", () => {
  const deck = createDeck();
  deck.navigate(deck.second);
  deck.finishParsing();
  assert.equal(deck.visible(), false);
  assert.equal(deck.animationCount(), 0);
});

test("only the first vertical slide shows the background", () => {
  const deck = createDeck({ vertical: true, readyState: "complete" });
  assert.equal(deck.visible(), true);
  deck.navigate(deck.second);
  assert.equal(deck.visible(), false);
});

test("DOM navigation works before the Reveal API is available", () => {
  const deck = createDeck({ useReveal: false });
  deck.finishParsing();
  assert.equal(deck.visible(), true);
  deck.navigate(deck.second);
  assert.equal(deck.visible(), false);
  deck.loadReveal();
  deck.navigate(deck.first);
  assert.equal(deck.visible(), true);
});

test("overview hides the background and restores it on the first slide", () => {
  const deck = createDeck({ readyState: "complete" });
  deck.setOverview(true);
  assert.equal(deck.visible(), false);
  deck.setOverview(false);
  assert.equal(deck.visible(), true);
});

test("reduced motion keeps visibility rules without starting animations", () => {
  const deck = createDeck({ reducedMotion: true });
  deck.finishParsing();
  assert.equal(deck.visible(), true);
  assert.equal(deck.animationCount(), 0);
  deck.navigate(deck.second);
  assert.equal(deck.visible(), false);
});

test("standalone preview becomes visible after parsing", () => {
  const deck = createDeck({ standalone: true });
  assert.equal(deck.visible(), false);
  deck.finishParsing();
  assert.equal(deck.visible(), true);
  assert.ok(deck.animationCount() > 0);
});
