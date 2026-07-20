#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const repoRoot = path.resolve(__dirname, "..");
const simHtmlPath = path.join(repoRoot, "html", "interactive-digital-research-background.html");
const html = fs.readFileSync(simHtmlPath, "utf8");
const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .join("\n");

const seeds = Number(process.argv[2] || 75);
const frames = Number(process.argv[3] || 7200);
const width = Number(process.argv[4] || 1280);
const height = Number(process.argv[5] || 720);

function makeNoopContext(canvas) {
  const noop = () => {};

  return new Proxy({}, {
    get(target, prop) {
      if (prop === "canvas") return canvas;
      if (prop === "createRadialGradient") return () => ({ addColorStop: noop });
      if (prop === "measureText") return () => ({ width: 0 });
      return target[prop] || noop;
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    }
  });
}

function runSeed(seed) {
  let timeoutCount = 0;
  const classList = {
    contains: () => true,
    toggle: () => {}
  };
  const element = {
    style: {},
    classList,
    children: [],
    tagName: "DIV",
    getBoundingClientRect: () => ({ width, height, left: 0, top: 0 })
  };
  const canvas = {
    width,
    height,
    getBoundingClientRect: () => ({ width, height, left: 0, top: 0 })
  };
  const ctx = makeNoopContext(canvas);
  canvas.getContext = () => ctx;

  const document = {
    body: { classList },
    getElementById: (id) => id === "rjsH1Canvas" ? canvas : element,
    querySelector: (selector) => selector === ".reveal .slides" ? element : null,
    querySelectorAll: () => []
  };

  class ResizeObserver {
    constructor(callback) {
      this.callback = callback;
    }

    observe() {
      this.callback();
    }
  }

  class MutationObserver {
    observe() {}
  }

  const window = {
    innerWidth: width,
    innerHeight: height,
    __rjsH1InteractiveBackgroundMounted: false,
    __rjsH1SpaceSimHeadless: true,
    matchMedia: () => ({ matches: false }),
    localStorage: {
      getItem: () => seed,
      setItem: () => {}
    },
    location: { search: `?space-seed=${seed}` },
    addEventListener: () => {},
    setTimeout: (callback) => {
      if (timeoutCount < 4) {
        timeoutCount += 1;
        callback();
      }
      return timeoutCount;
    },
    requestAnimationFrame: () => 0
  };

  const context = {
    console: { log: () => {}, warn: () => {}, error: () => {} },
    Math,
    URLSearchParams,
    ResizeObserver,
    MutationObserver,
    HTMLElement: function HTMLElement() {},
    document,
    window,
    requestAnimationFrame: window.requestAnimationFrame,
    setTimeout: window.setTimeout,
    localStorage: window.localStorage
  };

  window.window = window;
  window.document = document;
  window.URLSearchParams = URLSearchParams;
  window.ResizeObserver = ResizeObserver;
  window.MutationObserver = MutationObserver;

  vm.createContext(context);
  vm.runInContext(script, context, { timeout: 5000 });

  if (!window.__rjsH1SpaceSim) {
    throw new Error("Simulator API was not exposed");
  }

  window.__rjsH1SpaceSim.reseed(seed);
  return window.__rjsH1SpaceSim.runFrames(frames);
}

const results = [];

for (let i = 0; i < seeds; i += 1) {
  results.push(runSeed(`balance-${i + 1}`));
}

const average = (values) =>
  values.reduce((sum, value) => sum + (Number(value) || 0), 0) / Math.max(values.length, 1);
const known = (value) => value !== null && value !== undefined;
const survivalRate =
  results.filter((result) => result.survived).length / Math.max(results.length, 1);

const summary = {
  seeds,
  frames,
  survivalRate: Number(survivalRate.toFixed(2)),
  firstStationFrameAverage: Number(average(results.map((result) => result.firstStationFrame).filter(known)).toFixed(1)),
  firstOccupationFrameAverage: Number(average(results.map((result) => result.firstOccupationFrame).filter(known)).toFixed(1)),
  maxShipsAverage: Number(average(results.map((result) => result.maxShips)).toFixed(1)),
  maxStationsAverage: Number(average(results.map((result) => result.maxStations)).toFixed(1)),
  maxOccupiedAverage: Number(average(results.map((result) => result.maxOccupied)).toFixed(1)),
  collapsed: results.filter((result) => known(result.collapseFrame)).length,
  failedSurvivalAtHorizon: results.filter((result) => !result.survived).length,
  noStation: results.filter((result) => !known(result.firstStationFrame)).length,
  noOccupation: results.filter((result) => !known(result.firstOccupationFrame)).length
};

console.log(JSON.stringify({ summary, sample: results.slice(0, 8) }, null, 2));
