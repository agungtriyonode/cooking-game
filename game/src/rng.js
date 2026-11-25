// Seeded random numbers for the kitchen: the same seed always deals the same
// orders, so a screenshot scene can be replayed exactly. Live play seeds from
// the clock, shot scenes seed from the shot's own number.
export function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pick one entry of `list` with the seeded stream.
export function pick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}

// A whole number in [min, max] from the seeded stream.
export function rangeInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}
