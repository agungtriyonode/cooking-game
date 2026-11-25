// The pantry of Warung Kilat: every ingredient, how it is prepared, and the
// dishes guests order. A dish is a set of prepared parts; the player must
// fetch each raw ingredient, work it at the right station, and stack the
// finished parts on the plate before the guest's patience runs out.

// Raw ingredients the player picks from the counter bins.
export const INGREDIENTS = [
  { id: 'rice', name: 'Nasi', color: '#f5ead2', dark: '#c9b489', shape: 'bowl', bin: 0 },
  { id: 'noodle', name: 'Mie', color: '#f7c948', dark: '#c98f1b', shape: 'swirl', bin: 1 },
  { id: 'chicken', name: 'Ayam', color: '#f2a65a', dark: '#b96a1e', shape: 'drumstick', bin: 2 },
  { id: 'egg', name: 'Telur', color: '#fdf3d0', dark: '#d9b96a', shape: 'egg', bin: 3 },
  { id: 'chili', name: 'Cabai', color: '#e23b2e', dark: '#8f1d12', shape: 'chili', bin: 4 },
  { id: 'veg', name: 'Sayur', color: '#4caf50', dark: '#2d6a2f', shape: 'leaf', bin: 5 },
  { id: 'skewer', name: 'Sate', color: '#c98f5a', dark: '#7a4a1e', shape: 'skewer', bin: 6 },
  { id: 'sauce', name: 'Sambal', color: '#c0392b', dark: '#7a1f14', shape: 'bottle', bin: 7 },
];

// How a raw ingredient becomes a finished part: which station works it and
// how long the work takes, in seconds.
export const PREP = {
  rice: { station: 'stove', seconds: 3.0, verb: 'Masak', result: 'Nasi hangat' },
  noodle: { station: 'stove', seconds: 2.5, verb: 'Rebus', result: 'Mie matang' },
  chicken: { station: 'stove', seconds: 3.5, verb: 'Panggang', result: 'Ayam panggang' },
  egg: { station: 'stove', seconds: 2.0, verb: 'Goreng', result: 'Telur mata sapi' },
  chili: { station: 'board', seconds: 1.5, verb: 'Iris', result: 'Cabai iris' },
  veg: { station: 'board', seconds: 1.5, verb: 'Potong', result: 'Sayur potong' },
  skewer: { station: 'stove', seconds: 3.0, verb: 'Bakar', result: 'Sate bakar' },
  sauce: { station: 'none', seconds: 0, verb: 'Tuang', result: 'Sambal' },
};

// The menu: each dish lists the raw ingredients it needs, its coin value and
// how fussy its guest is (patience in seconds).
export const DISHES = [
  {
    id: 'nasi-goreng',
    name: 'Nasi Goreng Kilat',
    needs: ['rice', 'egg', 'chili'],
    coins: 14,
    patience: 52,
    blurb: 'Nasi hangat + telur + cabai iris',
  },
  {
    id: 'mie-ayam',
    name: 'Mie Ayam Ember',
    needs: ['noodle', 'chicken', 'veg'],
    coins: 16,
    patience: 56,
    blurb: 'Mie matang + ayam panggang + sayur',
  },
  {
    id: 'sate-kilats',
    name: 'Sate Kilat',
    needs: ['skewer', 'chicken', 'sauce'],
    coins: 18,
    patience: 58,
    blurb: 'Sate bakar + ayam + sambal',
  },
  {
    id: 'gado-cepat',
    name: 'Gado-Gado Cepat',
    needs: ['veg', 'egg', 'sauce'],
    coins: 13,
    patience: 48,
    blurb: 'Sayur potong + telur + sambal',
  },
  {
    id: 'ayam-geprek',
    name: 'Ayam Geprek Api',
    needs: ['chicken', 'chili', 'rice'],
    coins: 17,
    patience: 55,
    blurb: 'Ayam panggang + cabai + nasi hangat',
  },
  {
    id: 'mie-goreng',
    name: 'Mie Goreng Warung',
    needs: ['noodle', 'egg', 'veg'],
    coins: 15,
    patience: 54,
    blurb: 'Mie matang + telur + sayur potong',
  },
];

export function ingredientById(id) {
  return INGREDIENTS.find((item) => item.id === id);
}

export function dishById(id) {
  return DISHES.find((dish) => dish.id === id);
}
