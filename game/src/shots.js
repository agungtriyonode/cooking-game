// The screenshot scenes behind ?shot=cover|mid|rush|served. Each one plays the
// real rules forward from a fresh kitchen for a fixed number of steps, steered
// by a simple autopilot (fetch what the oldest order needs, work it at the
// right station, stack it on the plate, serve), so the frame is what a real
// game looks like and the same seed always gives the same frame.
import { PREP } from './recipes.js';
import { SCREEN_PLAY, collectPrep, grabIngredient, addToPlate, pourSauce, servePlate, startPrep, startShift, stepKitchen } from './kitchen.js';

const STEP = 1 / 30;

// What the autopilot should do right now: return an action for this step.
// Priority keeps the hands moving and never deadlocks: serve a finished
// plate, plate a finished part, pour sauce, work a raw hand at a free
// station (which frees a hand slot), collect a finished part when there is
// room, and only then grab the next missing ingredient.
function autopilotAction(kitchen) {
  const order = kitchen.orders[0];
  if (!order) return null;
  const plate = kitchen.plate;
  const needs = order.needs;
  const sorted = plate.slice().sort().join(',');
  if (sorted === needs.slice().sort().join(',')) return { type: 'serve' };
  // A finished part in hand goes onto the plate first.
  const doneHand = kitchen.hands.findIndex((hand) => hand.state === 'done' && !plate.includes(hand.id));
  if (doneHand >= 0) return { type: 'plate', hand: doneHand };
  // Sauce pours straight onto the plate.
  const sauceHand = kitchen.hands.findIndex((hand) => hand.id === 'sauce' && hand.state === 'raw');
  if (sauceHand >= 0) return { type: 'pour', hand: sauceHand };
  // A free station for this raw ingredient, if any (a station holding a
  // finished part does not count as free).
  const freeStationFor = (id) => {
    const prep = PREP[id];
    if (prep.station === 'stove') {
      return kitchen.stoves.find((stove) => stove.busy === null && stove.done === null) ?? null;
    }
    if (prep.station === 'board') {
      return kitchen.board.busy === null && kitchen.board.done === null ? kitchen.board : null;
    }
    return null;
  };
  // Work a raw hand at once: it frees a hand slot for the next fetch.
  const rawHand = kitchen.hands.findIndex((hand) => hand.state === 'raw' && PREP[hand.id].station !== 'none');
  if (rawHand >= 0) {
    const station = freeStationFor(kitchen.hands[rawHand].id);
    if (station) return { type: 'prep', hand: rawHand, station };
  }
  if (kitchen.hands.length < 2) {
    // Collect a finished part when there is room to carry it.
    for (const station of kitchen.stoves.concat([kitchen.board])) {
      if (station.done !== null && !plate.includes(station.done)) {
        return { type: 'collect', station };
      }
    }
    // Otherwise fetch the next missing raw ingredient. An ingredient counts
    // as accounted for when it is on the plate, in hand, cooking on a
    // station, or finished and waiting on one — never fetch it twice.
    const stations = kitchen.stoves.concat([kitchen.board]);
    const accounted = new Set(plate);
    for (const hand of kitchen.hands) accounted.add(hand.id);
    for (const station of stations) {
      if (station.busy !== null) accounted.add(station.busy);
      if (station.done !== null) accounted.add(station.done);
    }
    const missing = needs.find((need) => !accounted.has(need));
    if (missing) return { type: 'grab', id: missing };
  }
  return null;
}

function applyAction(kitchen, action) {
  if (!action) return;
  if (action.type === 'grab') grabIngredient(kitchen, action.id);
  else if (action.type === 'prep') startPrep(kitchen, action.hand, action.station);
  else if (action.type === 'collect') collectPrep(kitchen, action.station);
  else if (action.type === 'plate') addToPlate(kitchen, action.hand);
  else if (action.type === 'pour') pourSauce(kitchen, action.hand);
  else if (action.type === 'serve') servePlate(kitchen);
}

// Play the real game forward for `seconds`, one action per step, stopping
// early when `stopWhen` says the scene is ready. The pilot only acts every
// `actEvery` steps, so it plays at a human pace and orders pile up on the
// board instead of being cleared the instant they arrive.
function playForward(kitchen, seconds, stopWhen, actEvery = 12) {
  for (let i = 0; i < seconds / STEP; i += 1) {
    if (kitchen.screen !== SCREEN_PLAY) break;
    if (i % actEvery === 0) {
      const action = autopilotAction(kitchen);
      applyAction(kitchen, action);
    }
    stepKitchen(kitchen, STEP);
    if (stopWhen && stopWhen(kitchen)) break;
  }
}

// Put `kitchen` into the named scene and return the screen to draw over it.
export function stageShot(name, kitchen) {
  startShift(kitchen);
  if (name === 'cover') {
    // Early play, frozen the moment a dish is half-built on the plate while
    // orders wait on the board: kitchen, board, counter, mid-assembly dish,
    // timer and a plate ready to serve, all in one frame.
    playForward(kitchen, 40, (state) => state.plate.length >= 1 && state.orders.length >= 2);
    return SCREEN_PLAY;
  }
  if (name === 'mid') {
    playForward(kitchen, 60, (state) => state.plate.length >= 2 && state.orders.length >= 2);
    return kitchen.screen;
  }
  if (name === 'rush') {
    // Deep into the shift: the rush banner is up, patience is thin, the
    // board is full and a dish is being assembled.
    kitchen.time = 138;
    kitchen.shiftLeft = 42;
    kitchen.level = 4;
    kitchen.rush = true;
    playForward(kitchen, 60, (state) => state.orders.length >= 3 && state.plate.length >= 1);
    // The clock jumped to the rush, so age the waiting orders' patience to
    // match: a real rush frame has guests nearly out of patience.
    kitchen.orders.forEach((order, index) => {
      order.patience = Math.min(order.patience, order.maxPatience * (0.3 - index * 0.05));
    });
    return kitchen.screen;
  }
  if (name === 'served') {
    // Serve two dishes, then freeze on the second serve's flash.
    playForward(kitchen, 60, (state) => state.served >= 2 && state.serveFlash > 1.0);
    return kitchen.screen;
  }
  playForward(kitchen, 14);
  return SCREEN_PLAY;
}
