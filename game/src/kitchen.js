// The kitchen itself: orders, stations, the chef's hands, the shift clock and
// the score. Nothing here draws; render.js reads this state and paints it.
// The world advances in fixed steps so a screenshot scene can be replayed
// from a seed and land on the exact same frame.
import { DISHES, PREP, ingredientById } from './recipes.js';
import { makeRng, pick, rangeInt } from './rng.js';

export const SHIFT_SECONDS = 180;
export const MAX_HEARTS = 3;
export const HAND_SLOTS = 2;
export const STOVE_COUNT = 2;

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';
export const SCREEN_WIN = 'win';

export const EVENT_SERVED = 1;
export const EVENT_LOST = 2;
export const EVENT_OVER = 4;
export const EVENT_WIN = 8;

function newStation(kind) {
  return { kind, busy: null, progress: 0, done: null };
}

export function createKitchen(seed) {
  const rng = makeRng(seed);
  return {
    rng,
    screen: SCREEN_TITLE,
    time: 0,
    shiftLeft: SHIFT_SECONDS,
    score: 0,
    coins: 0,
    served: 0,
    lost: 0,
    combo: 0,
    bestCombo: 0,
    hearts: MAX_HEARTS,
    level: 1,
    rush: false,
    // Orders waiting on the board, oldest first.
    orders: [],
    nextOrderIn: 1.5,
    orderNumber: 0,
    // What the chef carries: raw ids, then finished parts after a station.
    hands: [],
    // The plate being assembled on the pass.
    plate: [],
    plateDish: null,
    // Stations: two stoves and one cutting board.
    stoves: [newStation('stove'), newStation('stove')],
    board: newStation('board'),
    // Serving window feedback.
    serveFlash: 0,
    serveMessage: '',
    // Floating "+14" notes.
    floaters: [],
    // Which bin / station the mouse is hovering, for highlights.
    hover: null,
  };
}

// Patience shrinks as the rush builds: later levels give guests less time.
export function orderInterval(kitchen) {
  return Math.max(7, 16 - kitchen.level * 1.6);
}

function spawnOrder(kitchen) {
  const dish = pick(kitchen.rng, DISHES);
  const rushShorten = kitchen.rush ? 0.8 : 1;
  kitchen.orderNumber += 1;
  kitchen.orders.push({
    id: kitchen.orderNumber,
    dishId: dish.id,
    name: dish.name,
    blurb: dish.blurb,
    needs: dish.needs.slice(),
    coins: dish.coins,
    patience: dish.patience * rushShorten,
    maxPatience: dish.patience * rushShorten,
    arrivedAt: kitchen.time,
  });
}

function addFloater(kitchen, text, x, y, color) {
  kitchen.floaters.push({ text, x, y, color, life: 1.2 });
}

export function startShift(kitchen) {
  kitchen.screen = SCREEN_PLAY;
  kitchen.time = 0;
  kitchen.shiftLeft = SHIFT_SECONDS;
  kitchen.score = 0;
  kitchen.coins = 0;
  kitchen.served = 0;
  kitchen.lost = 0;
  kitchen.combo = 0;
  kitchen.bestCombo = 0;
  kitchen.hearts = MAX_HEARTS;
  kitchen.level = 1;
  kitchen.rush = false;
  kitchen.orders = [];
  kitchen.nextOrderIn = 1.5;
  kitchen.hands = [];
  kitchen.plate = [];
  kitchen.plateDish = null;
  kitchen.stoves = [newStation('stove'), newStation('stove')];
  kitchen.board = newStation('board');
  kitchen.serveFlash = 0;
  kitchen.serveMessage = '';
  kitchen.floaters = [];
  spawnOrder(kitchen);
  spawnOrder(kitchen);
}

// The chef takes a raw ingredient from a counter bin.
export function grabIngredient(kitchen, id) {
  if (kitchen.screen !== SCREEN_PLAY) return false;
  if (kitchen.hands.length >= HAND_SLOTS) return false;
  kitchen.hands.push({ id, state: 'raw' });
  return true;
}

// The chef puts a carried raw ingredient onto a station to be worked.
export function startPrep(kitchen, handIndex, station) {
  if (kitchen.screen !== SCREEN_PLAY) return false;
  const carried = kitchen.hands[handIndex];
  if (!carried || carried.state !== 'raw') return false;
  const prep = PREP[carried.id];
  if (prep.station === 'none') return false;
  if (prep.station !== station.kind) return false;
  if (station.busy !== null) return false;
  if (station.done !== null) return false;
  station.busy = carried.id;
  station.progress = 0;
  station.done = null;
  kitchen.hands.splice(handIndex, 1);
  return true;
}

// The chef collects a finished part from a station.
export function collectPrep(kitchen, station) {
  if (kitchen.screen !== SCREEN_PLAY) return false;
  if (station.done === null) return false;
  if (kitchen.hands.length >= HAND_SLOTS) return false;
  kitchen.hands.push({ id: station.done, state: 'done' });
  station.done = null;
  return true;
}

// Sauce needs no station: it goes straight from hand to plate.
export function pourSauce(kitchen, handIndex) {
  const carried = kitchen.hands[handIndex];
  if (!carried || carried.id !== 'sauce' || carried.state !== 'raw') return false;
  return addToPlate(kitchen, handIndex);
}

// A finished part from the chef's hands goes onto the plate.
export function addToPlate(kitchen, handIndex) {
  if (kitchen.screen !== SCREEN_PLAY) return false;
  const carried = kitchen.hands[handIndex];
  if (!carried || carried.state !== 'done') {
    if (!carried || carried.id !== 'sauce') return false;
  }
  kitchen.plate.push(carried.id);
  kitchen.hands.splice(handIndex, 1);
  kitchen.plateDish = matchDish(kitchen.plate);
  return true;
}

// Which dish, if any, do the parts on the plate make?
export function matchDish(plate) {
  const sorted = plate.slice().sort().join(',');
  for (const dish of DISHES) {
    if (dish.needs.slice().sort().join(',') === sorted) return dish;
  }
  return null;
}

// Serve the plate to the oldest order it matches. A wrong plate earns nothing.
export function servePlate(kitchen) {
  if (kitchen.screen !== SCREEN_PLAY) return 0;
  if (kitchen.plate.length === 0) return 0;
  const dish = matchDish(kitchen.plate);
  if (!dish) {
    kitchen.serveMessage = 'Bukan resep yang dipesan!';
    kitchen.serveFlash = 1.0;
    kitchen.combo = 0;
    return 0;
  }
  const orderIndex = kitchen.orders.findIndex((order) => order.dishId === dish.id);
  if (orderIndex === -1) {
    kitchen.serveMessage = 'Tidak ada yang memesan ' + dish.name;
    kitchen.serveFlash = 1.0;
    kitchen.combo = 0;
    return 0;
  }
  const order = kitchen.orders[orderIndex];
  kitchen.orders.splice(orderIndex, 1);
  kitchen.plate = [];
  kitchen.plateDish = null;
  const freshBonus = order.patience > order.maxPatience * 0.5 ? 4 : 0;
  kitchen.combo += 1;
  kitchen.bestCombo = Math.max(kitchen.bestCombo, kitchen.combo);
  const earned = order.coins + freshBonus + Math.min(kitchen.combo - 1, 5) * 2;
  kitchen.coins += earned;
  kitchen.score += earned * 10;
  kitchen.served += 1;
  kitchen.serveMessage = dish.name + ' tersaji! +' + earned + ' koin';
  kitchen.serveFlash = 1.4;
  addFloater(kitchen, '+' + earned, 640, 300, '#ffd54a');
  return EVENT_SERVED;
}

// Throw the plate away and start over (a burnt or wrong assembly).
export function clearPlate(kitchen) {
  kitchen.plate = [];
  kitchen.plateDish = null;
  kitchen.combo = 0;
}

// One fixed step of the shift: timers, stations, orders, hearts.
export function stepKitchen(kitchen, dt) {
  if (kitchen.screen !== SCREEN_PLAY) return 0;
  let events = 0;
  kitchen.time += dt;
  kitchen.shiftLeft = Math.max(0, SHIFT_SECONDS - kitchen.time);
  kitchen.level = 1 + Math.floor(kitchen.time / 45);
  kitchen.rush = kitchen.shiftLeft <= 45;

  if (kitchen.serveFlash > 0) kitchen.serveFlash = Math.max(0, kitchen.serveFlash - dt);
  for (const floater of kitchen.floaters) floater.life -= dt;
  kitchen.floaters = kitchen.floaters.filter((floater) => floater.life > 0);

  // New orders arrive on a schedule that quickens each level.
  kitchen.nextOrderIn -= dt;
  if (kitchen.nextOrderIn <= 0 && kitchen.orders.length < 5) {
    spawnOrder(kitchen);
    kitchen.nextOrderIn = orderInterval(kitchen) + kitchen.rng() * 3;
  }

  // Guests lose patience; an abandoned order costs a heart.
  for (let i = kitchen.orders.length - 1; i >= 0; i -= 1) {
    const order = kitchen.orders[i];
    order.patience -= dt;
    if (order.patience <= 0) {
      kitchen.orders.splice(i, 1);
      kitchen.lost += 1;
      kitchen.hearts -= 1;
      kitchen.combo = 0;
      addFloater(kitchen, 'Pesanan hangus!', 640, 200, '#ff6b5e');
      events |= EVENT_LOST;
    }
  }

  // Stations cook and chop; a finished part waits to be collected.
  const stations = kitchen.stoves.concat([kitchen.board]);
  for (const station of stations) {
    if (station.busy !== null) {
      const prep = PREP[station.busy];
      station.progress += dt / prep.seconds;
      if (station.progress >= 1) {
        station.done = station.busy;
        station.busy = null;
        station.progress = 0;
      }
    }
  }

  if (kitchen.hearts <= 0) {
    kitchen.screen = SCREEN_OVER;
    return events | EVENT_OVER;
  }
  if (kitchen.shiftLeft <= 0) {
    kitchen.screen = kitchen.served >= 8 ? SCREEN_WIN : SCREEN_OVER;
    return events | (kitchen.screen === SCREEN_WIN ? EVENT_WIN : EVENT_OVER);
  }
  return events;
}

export function ingredientName(id) {
  const found = ingredientById(id);
  return found ? found.name : id;
}
