// Bootstrap for Ember & Ladle — Warung Rush: size the canvas, wire input,
// run the loop, and stage screenshot scenes from ?shot= when asked.
// ?shot=cover|mid|rush|served&seed=N renders one fixed frame and stops, so a
// headless screenshot always catches the same game.
import { createKitchen, stepKitchen } from './kitchen.js';
import { drawGame, VIEW_H, VIEW_W } from './render.js';
import { handleClick, handleHover, handleKey } from './input.js';
import { createSounds } from './audio.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed') || '7');
const sounds = createSounds();
const kitchen = createKitchen(Number.isFinite(seed) ? seed : 7);

function fitCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const scale = Math.min(window.innerWidth / VIEW_W, window.innerHeight / VIEW_H);
  canvas.width = Math.round(VIEW_W * ratio);
  canvas.height = Math.round(VIEW_H * ratio);
  canvas.style.width = `${Math.round(VIEW_W * scale)}px`;
  canvas.style.height = `${Math.round(VIEW_H * scale)}px`;
  ctx.setTransform(canvas.width / VIEW_W, 0, 0, canvas.height / VIEW_H, 0, 0);
}

function toGameCoords(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * VIEW_W,
    y: ((event.clientY - rect.top) / rect.height) * VIEW_H,
  };
}

function announce() {
  const order = kitchen.orders[0];
  status.textContent = kitchen.screen === 'play'
    ? `Skor ${kitchen.score}, koin ${kitchen.coins}, ${kitchen.served} tersaji, ${kitchen.orders.length} pesanan menunggu` +
      (order ? `, pesanan berikut ${order.name}` : '')
    : kitchen.screen === 'title'
      ? 'Ember and Ladle Warung Rush. Klik untuk mulai masak.'
      : `Selesai. Skor ${kitchen.score}, ${kitchen.served} piring tersaji. Tekan R untuk main lagi.`;
}

fitCanvas();
window.addEventListener('resize', fitCanvas);

canvas.addEventListener('click', (event) => {
  const point = toGameCoords(event);
  handleClick(kitchen, point.x, point.y, sounds);
  announce();
});
canvas.addEventListener('mousemove', (event) => {
  const point = toGameCoords(event);
  handleHover(kitchen, point.x, point.y);
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'm' || event.key === 'M') {
    sounds.toggleMute();
    return;
  }
  handleKey(kitchen, event.key, sounds);
  announce();
});

if (shotName) {
  // Screenshot mode: stage the scene, paint one frame, stop.
  stageShot(shotName, kitchen);
  drawGame(ctx, kitchen);
  window.__shotReady = true;
} else {
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    stepKitchen(kitchen, dt);
    drawGame(ctx, kitchen);
    requestAnimationFrame(frame);
  }
  drawGame(ctx, kitchen);
  announce();
  requestAnimationFrame(frame);
}
