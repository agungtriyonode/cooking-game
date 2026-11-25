// Mouse and keyboard for the warung: click a bin to grab, click a station to
// work or collect, click the plate to add a part, click the serving window
// (or press Space) to serve. Keys 1-8 grab the matching bin directly.
import { INGREDIENTS, PREP } from './recipes.js';
import { LAYOUT } from './render.js';
import {
  addToPlate,
  clearPlate,
  collectPrep,
  grabIngredient,
  pourSauce,
  servePlate,
  startPrep,
  startShift,
} from './kitchen.js';

function inside(x, y, box) {
  return x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;
}

function binAt(x, y, kitchen) {
  const { bins, binW, binGap } = LAYOUT;
  if (!inside(x, y, bins)) return null;
  const index = Math.floor((x - bins.x) / (binW + binGap));
  if (index < 0 || index >= INGREDIENTS.length) return null;
  const binX = bins.x + index * (binW + binGap);
  if (x > binX + binW) return null;
  return INGREDIENTS[index];
}

// The chef's first raw hand that fits this station, if any.
function rawHandFor(kitchen, stationKind) {
  for (let i = 0; i < kitchen.hands.length; i += 1) {
    const hand = kitchen.hands[i];
    if (hand.state === 'raw' && PREP[hand.id].station === stationKind) return i;
  }
  return -1;
}

// The chef's first finished part, if any.
function doneHand(kitchen) {
  for (let i = 0; i < kitchen.hands.length; i += 1) {
    if (kitchen.hands[i].state === 'done') return i;
  }
  return -1;
}

export function handleClick(kitchen, x, y, sounds) {
  if (kitchen.screen === 'title') {
    startShift(kitchen);
    sounds.play('start');
    return;
  }
  if (kitchen.screen === 'over' || kitchen.screen === 'win') return;
  const bin = binAt(x, y, kitchen);
  if (bin) {
    if (grabIngredient(kitchen, bin.id)) sounds.play('pick');
    return;
  }
  if (inside(x, y, LAYOUT.stove1) || inside(x, y, LAYOUT.stove2)) {
    const stove = inside(x, y, LAYOUT.stove1) ? kitchen.stoves[0] : kitchen.stoves[1];
    if (stove.done !== null) {
      if (collectPrep(kitchen, stove)) sounds.play('pick');
      return;
    }
    const handIndex = rawHandFor(kitchen, 'stove');
    if (handIndex >= 0 && startPrep(kitchen, handIndex, stove)) sounds.play('sizzle');
    return;
  }
  if (inside(x, y, LAYOUT.boardStation)) {
    const board = kitchen.board;
    if (board.done !== null) {
      if (collectPrep(kitchen, board)) sounds.play('pick');
      return;
    }
    const handIndex = rawHandFor(kitchen, 'board');
    if (handIndex >= 0 && startPrep(kitchen, handIndex, board)) sounds.play('chop');
    return;
  }
  if (inside(x, y, LAYOUT.plate)) {
    const sauceIndex = kitchen.hands.findIndex((hand) => hand.id === 'sauce' && hand.state === 'raw');
    if (sauceIndex >= 0) {
      if (pourSauce(kitchen, sauceIndex)) sounds.play('pour');
      return;
    }
    const doneIndex = doneHand(kitchen);
    if (doneIndex >= 0 && addToPlate(kitchen, doneIndex)) sounds.play('plate');
    return;
  }
  if (inside(x, y, LAYOUT.serve)) {
    const result = servePlate(kitchen);
    sounds.play(result ? 'serve' : 'error');
    return;
  }
}

export function handleKey(kitchen, key, sounds) {
  const lower = key.toLowerCase();
  if (kitchen.screen === 'title' && (lower === 'enter' || lower === ' ')) {
    startShift(kitchen);
    sounds.play('start');
    return;
  }
  if ((kitchen.screen === 'over' || kitchen.screen === 'win') && lower === 'r') {
    startShift(kitchen);
    sounds.play('start');
    return;
  }
  if (kitchen.screen !== 'play') return;
  if (lower === ' ') {
    const result = servePlate(kitchen);
    sounds.play(result ? 'serve' : 'error');
    return;
  }
  if (lower === 'x' || lower === 'backspace') {
    clearPlate(kitchen);
    sounds.play('error');
    return;
  }
  const digit = Number.parseInt(lower, 10);
  if (digit >= 1 && digit <= INGREDIENTS.length) {
    if (grabIngredient(kitchen, INGREDIENTS[digit - 1].id)) sounds.play('pick');
  }
}

// Track the hovered bin so render can highlight it.
export function handleHover(kitchen, x, y) {
  const bin = binAt(x, y, kitchen);
  kitchen.hover = bin ? 'bin:' + bin.id : null;
}
