# Ember & Ladle — Warung Rush

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/agungtriyonode/cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/agungtriyonode/cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

A complete, original cooking game that plays offline in a desktop browser from its own static files. You run a little warung kitchen: orders land on the board, you grab ingredients from the counter, cook them on the stoves or chop them on the board, stack the finished parts on the plate, and serve before each guest's patience runs out. One 3-minute shift, rising rush, combo bonuses.

## How to play

- **Click an ingredient bin** (or press **1–8**) to grab it — the chef holds at most 2 things.
- **Click a stove / the cutting board** to start cooking or chopping what you carry; click again when it says SIAP to collect the finished part.
- **Click the plate** to add a finished part (sauce pours straight on).
- **Click SAJIKAN** (or press **Space**) to serve the plate to the order it matches.
- **X** clears a wrong plate. **R** restarts after the shift ends. **M** mutes the sounds.

## The menu

| Dish | Needs | Coins |
| --- | --- | --- |
| Nasi Goreng Kilat | Nasi + Telur + Cabai | 14 |
| Mie Ayam Ember | Mie + Ayam + Sayur | 16 |
| Sate Kilat | Sate + Ayam + Sambal | 18 |
| Gado-Gado Cepat | Sayur + Telur + Sambal | 13 |
| Ayam Geprek Api | Ayam + Cabai + Nasi | 17 |
| Mie Goreng Warung | Mie + Telur + Sayur | 15 |

Serve fast for a freshness bonus and chain serves for a combo bonus. An order left waiting too long burns out and costs a heart — lose all 3 hearts and the warung closes. Serve 8 plates before the 3-minute shift ends to win the day.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network, no libraries — plain ES modules on canvas, with WebAudio oscillator sounds. Screenshots are staged from the real game with `?shot=cover|mid|rush|served&seed=N` (see `shots.json`).
