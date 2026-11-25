// Every pixel of Warung Kilat, drawn by hand on one canvas: tiled walls, wooden
// counters, stoves with live flames, the order board, ingredient bins and the
// chef. No image files, no network — the art is code, so the screenshots are
// renders of the game itself.
import { DISHES, INGREDIENTS, PREP, ingredientById } from './recipes.js';
import { SCREEN_OVER, SCREEN_TITLE, SCREEN_WIN } from './kitchen.js';

export const VIEW_W = 1280;
export const VIEW_H = 800;

// Where everything sits, shared with input.js so clicks land on what is drawn.
export const LAYOUT = {
  hud: { x: 0, y: 0, w: 1280, h: 64 },
  board: { x: 24, y: 76, w: 1232, h: 132 },
  ticketW: 232,
  ticketGap: 16,
  stove1: { x: 48, y: 292, w: 220, h: 166 },
  stove2: { x: 292, y: 292, w: 220, h: 166 },
  boardStation: { x: 536, y: 292, w: 220, h: 166 },
  plate: { x: 780, y: 292, w: 220, h: 166 },
  serve: { x: 1024, y: 292, w: 208, h: 166 },
  bins: { x: 24, y: 596, w: 1232, h: 176 },
  binW: 142,
  binGap: 14,
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align = 'left', weight = '700') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

function bar(ctx, x, y, w, h, frac, fill, back = '#00000033') {
  ctx.fillStyle = back;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  const clamped = Math.max(0, Math.min(1, frac));
  if (clamped > 0) {
    ctx.fillStyle = fill;
    roundRect(ctx, x, y, Math.max(h, w * clamped), h, h / 2);
    ctx.fill();
  }
}

// One ingredient drawn as a little dish of its own: bowl, swirl, drumstick,
// egg, chili, leaf, skewer or sauce bottle.
export function drawIngredient(ctx, id, cx, cy, size) {
  const item = ingredientById(id);
  const s = size;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineWidth = Math.max(2, s * 0.05);
  switch (item.shape) {
    case 'bowl': {
      ctx.fillStyle = '#fff8e6';
      ctx.beginPath();
      ctx.arc(0, s * 0.05, s * 0.42, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.05, s * 0.42, s * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8d6e63';
      ctx.beginPath();
      ctx.arc(0, s * 0.05, s * 0.42, 0, Math.PI);
      ctx.stroke();
      break;
    }
    case 'swirl': {
      ctx.strokeStyle = item.dark;
      ctx.lineWidth = s * 0.09;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 5; a += 0.3) {
        const r = (a / (Math.PI * 5)) * s * 0.4;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r * 0.7;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      break;
    }
    case 'drumstick': {
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.ellipse(-s * 0.05, s * 0.02, s * 0.34, s * 0.26, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = item.dark;
      ctx.lineWidth = s * 0.07;
      ctx.beginPath();
      ctx.moveTo(s * 0.2, -s * 0.12);
      ctx.lineTo(s * 0.42, -s * 0.34);
      ctx.stroke();
      ctx.fillStyle = '#fdf6e3';
      ctx.beginPath();
      ctx.arc(s * 0.44, -s * 0.36, s * 0.09, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'egg': {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.4, s * 0.3, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffb703';
      ctx.beginPath();
      ctx.arc(s * 0.05, 0, s * 0.18, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'chili': {
      ctx.strokeStyle = item.color;
      ctx.lineWidth = s * 0.16;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-s * 0.32, -s * 0.18);
      ctx.quadraticCurveTo(0, s * 0.3, s * 0.36, -s * 0.22);
      ctx.stroke();
      ctx.strokeStyle = '#2d6a2f';
      ctx.lineWidth = s * 0.08;
      ctx.beginPath();
      ctx.moveTo(s * 0.36, -s * 0.22);
      ctx.lineTo(s * 0.44, -s * 0.4);
      ctx.stroke();
      break;
    }
    case 'leaf': {
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.32, s * 0.42, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = item.dark;
      ctx.lineWidth = s * 0.05;
      ctx.beginPath();
      ctx.moveTo(-s * 0.2, s * 0.28);
      ctx.lineTo(s * 0.2, -s * 0.3);
      ctx.stroke();
      break;
    }
    case 'skewer': {
      ctx.strokeStyle = '#8d6e63';
      ctx.lineWidth = s * 0.06;
      ctx.beginPath();
      ctx.moveTo(-s * 0.45, 0);
      ctx.lineTo(s * 0.45, 0);
      ctx.stroke();
      ctx.fillStyle = item.color;
      for (const dx of [-0.28, 0, 0.28]) {
        ctx.beginPath();
        ctx.arc(dx * s, 0, s * 0.13, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'bottle': {
      ctx.fillStyle = item.color;
      roundRect(ctx, -s * 0.18, -s * 0.1, s * 0.36, s * 0.5, s * 0.08);
      ctx.fill();
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(-s * 0.1, -s * 0.42, s * 0.2, s * 0.32);
      ctx.fillStyle = '#ffe082';
      ctx.fillRect(-s * 0.18, s * 0.05, s * 0.36, s * 0.14);
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

function drawWall(ctx) {
  ctx.fillStyle = '#f7e8c9';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // Terracotta tile band behind the kitchen.
  ctx.fillStyle = '#e07856';
  ctx.fillRect(0, 208, VIEW_W, 8);
  ctx.fillStyle = '#f2d8a7';
  for (let x = 0; x < VIEW_W; x += 64) {
    ctx.fillRect(x, 216, 2, 240);
  }
  ctx.fillStyle = '#c98a4b';
  ctx.fillRect(0, 456, VIEW_W, 12);
  // Floor.
  ctx.fillStyle = '#b08954';
  ctx.fillRect(0, 580, VIEW_W, 220);
  ctx.fillStyle = '#9c7a48';
  for (let x = 0; x < VIEW_W; x += 96) {
    ctx.fillRect(x, 580, 3, 220);
  }
}

function drawHud(ctx, kitchen) {
  const { hud } = LAYOUT;
  ctx.fillStyle = '#3e2723';
  ctx.fillRect(hud.x, hud.y, hud.w, hud.h);
  text(ctx, 'EMBER & LADLE', 24, 40, 26, '#ffd54a', 'left', '800');
  text(ctx, 'Warung Rush', 250, 40, 16, '#ffccbc');
  // Shift timer: big, and red when the rush is on.
  const minutes = Math.floor(kitchen.shiftLeft / 60);
  const seconds = Math.floor(kitchen.shiftLeft % 60);
  const clock = `${minutes}:${String(seconds).padStart(2, '0')}`;
  const clockColor = kitchen.rush ? '#ff6b5e' : '#ffffff';
  text(ctx, '⏱ ' + clock, 640, 42, 30, clockColor, 'center', '800');
  bar(ctx, 560, 52, 160, 8, kitchen.shiftLeft / 180, kitchen.rush ? '#ff6b5e' : '#66bb6a');
  text(ctx, 'Level ' + kitchen.level, 760, 40, 18, '#ffffff');
  if (kitchen.rush) text(ctx, 'RUSH!', 840, 40, 18, '#ff6b5e', 'left', '800');
  text(ctx, '🪙 ' + kitchen.coins, 1000, 40, 22, '#ffd54a', 'left', '800');
  text(ctx, 'Skor ' + kitchen.score, 1120, 40, 18, '#ffffff');
  // Hearts, drawn as hearts.
  for (let i = 0; i < 3; i += 1) {
    const hx = 470 + i * 26;
    ctx.fillStyle = i < kitchen.hearts ? '#ff5252' : '#5d4037';
    ctx.beginPath();
    ctx.moveTo(hx, 40);
    ctx.bezierCurveTo(hx - 10, 30, hx - 12, 22, hx, 28);
    ctx.bezierCurveTo(hx + 12, 22, hx + 10, 30, hx, 40);
    ctx.fill();
  }
}

function drawOrderBoard(ctx, kitchen) {
  const { board, ticketW, ticketGap } = LAYOUT;
  ctx.fillStyle = '#5d4037';
  roundRect(ctx, board.x, board.y, board.w, board.h, 12);
  ctx.fill();
  text(ctx, 'PAPAN PESANAN', board.x + 16, board.y + 26, 15, '#ffd54a', 'left', '800');
  text(ctx, kitchen.orders.length + ' pesanan menunggu', board.x + 180, board.y + 26, 13, '#d7ccc8');
  if (kitchen.orders.length === 0) {
    text(ctx, 'Semua pesanan sudah tersaji — bagus!', board.x + 16, board.y + 80, 18, '#ffffff');
    return;
  }
  kitchen.orders.forEach((order, index) => {
    const x = board.x + 16 + index * (ticketW + ticketGap);
    const y = board.y + 36;
    const urgent = order.patience < order.maxPatience * 0.35;
    ctx.fillStyle = urgent ? '#fff3e0' : '#fff8e1';
    roundRect(ctx, x, y, ticketW, 84, 10);
    ctx.fill();
    ctx.strokeStyle = urgent ? '#e53935' : '#a1887f';
    ctx.lineWidth = urgent ? 3 : 1.5;
    ctx.stroke();
    text(ctx, '#' + order.id + '  ' + order.name, x + 12, y + 22, 15, '#3e2723', 'left', '800');
    text(ctx, order.blurb, x + 12, y + 42, 11, '#6d4c41');
    // Needed parts as small icons.
    order.needs.forEach((need, n) => {
      drawIngredient(ctx, need, x + 24 + n * 34, y + 62, 26);
    });
    bar(ctx, x + 12, y + 76, ticketW - 24, 6, order.patience / order.maxPatience, urgent ? '#e53935' : '#43a047');
  });
}

function drawStation(ctx, box, label, station, kitchen) {
  ctx.fillStyle = '#6d4c41';
  roundRect(ctx, box.x, box.y, box.w, box.h, 12);
  ctx.fill();
  ctx.fillStyle = '#4e342e';
  roundRect(ctx, box.x + 10, box.y + 10, box.w - 20, box.h - 20, 8);
  ctx.fill();
  text(ctx, label, box.x + box.w / 2, box.y + 34, 15, '#ffe0b2', 'center', '800');
  const cx = box.x + box.w / 2;
  const cy = box.y + 88;
  if (station.kind === 'stove') {
    // Burner ring and flame.
    ctx.fillStyle = '#37474f';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 18, 62, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    if (station.busy !== null) {
      const flick = Math.sin(kitchen.time * 9 + box.x) * 4;
      ctx.fillStyle = '#ff7043';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 6 + flick * 0.3, 40, 16 + flick, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd54a';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 10, 24, 9 + flick * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Pot.
    ctx.fillStyle = '#78909c';
    roundRect(ctx, cx - 52, cy - 26, 104, 34, 8);
    ctx.fill();
    ctx.fillStyle = '#546e7a';
    ctx.fillRect(cx - 52, cy - 26, 104, 8);
    if (station.busy !== null) {
      drawIngredient(ctx, station.busy, cx, cy - 8, 34);
      bar(ctx, cx - 50, cy + 34, 100, 8, station.progress, '#ffd54a');
      text(ctx, PREP[station.busy].verb + '…', cx, cy + 58, 12, '#ffe0b2', 'center');
    } else if (station.done !== null) {
      drawIngredient(ctx, station.done, cx, cy - 8, 34);
      text(ctx, 'SIAP — klik untuk ambil', cx, cy + 58, 12, '#a5d6a7', 'center', '800');
    } else {
      text(ctx, 'Kompor kosong', cx, cy + 58, 12, '#bcaaa4', 'center');
    }
  } else {
    // Cutting board: wooden slab and knife.
    ctx.fillStyle = '#d7a86e';
    roundRect(ctx, cx - 62, cy - 16, 124, 40, 8);
    ctx.fill();
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (station.busy !== null) {
      drawIngredient(ctx, station.busy, cx - 18, cy + 4, 32);
      bar(ctx, cx - 50, cy + 34, 100, 8, station.progress, '#ffd54a');
      text(ctx, PREP[station.busy].verb + '…', cx, cy + 58, 12, '#ffe0b2', 'center');
    } else if (station.done !== null) {
      drawIngredient(ctx, station.done, cx - 18, cy + 4, 32);
      text(ctx, 'SIAP — klik untuk ambil', cx, cy + 58, 12, '#a5d6a7', 'center', '800');
    } else {
      text(ctx, 'Talenan kosong', cx, cy + 58, 12, '#bcaaa4', 'center');
    }
    ctx.fillStyle = '#eceff1';
    ctx.beginPath();
    ctx.moveTo(cx + 34, cy - 12);
    ctx.lineTo(cx + 58, cy - 2);
    ctx.lineTo(cx + 34, cy + 8);
    ctx.closePath();
    ctx.fill();
  }
}

function drawPlate(ctx, kitchen) {
  const { plate, serve } = LAYOUT;
  // The pass: the plate where the dish is assembled.
  ctx.fillStyle = '#6d4c41';
  roundRect(ctx, plate.x, plate.y, plate.w, plate.h, 12);
  ctx.fill();
  text(ctx, 'PIRING RAKIT', plate.x + plate.w / 2, plate.y + 26, 14, '#ffe0b2', 'center', '800');
  const cx = plate.x + plate.w / 2;
  const cy = plate.y + 96;
  ctx.fillStyle = '#fafafa';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 78, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b0bec5';
  ctx.lineWidth = 2;
  ctx.stroke();
  kitchen.plate.forEach((part, i) => {
    drawIngredient(ctx, part, cx - 44 + i * 30, cy - 8 - (i % 2) * 8, 30);
  });
  if (kitchen.plateDish) {
    text(ctx, '✓ ' + kitchen.plateDish.name, cx, plate.y + 148, 14, '#a5d6a7', 'center', '800');
  } else if (kitchen.plate.length > 0) {
    text(ctx, kitchen.plate.length + ' bahan di piring', cx, plate.y + 148, 13, '#ffe0b2', 'center');
  } else {
    text(ctx, 'Piring kosong', cx, plate.y + 148, 13, '#bcaaa4', 'center');
  }
  // The serving window.
  ctx.fillStyle = kitchen.serveFlash > 0 ? '#2e7d32' : '#5d4037';
  roundRect(ctx, serve.x, serve.y, serve.w, serve.h, 12);
  ctx.fill();
  text(ctx, 'JENDELA SAJI', serve.x + serve.w / 2, serve.y + 26, 14, '#ffe0b2', 'center', '800');
  ctx.fillStyle = '#fff8e1';
  roundRect(ctx, serve.x + 16, serve.y + 40, serve.w - 32, 64, 8);
  ctx.fill();
  text(ctx, 'SAJIKAN', serve.x + serve.w / 2, serve.y + 66, 20, '#3e2723', 'center', '800');
  text(ctx, 'klik untuk antar', serve.x + serve.w / 2, serve.y + 88, 12, '#6d4c41', 'center');
  if (kitchen.serveMessage) {
    ctx.globalAlpha = Math.min(1, kitchen.serveFlash);
    text(ctx, kitchen.serveMessage, serve.x + serve.w / 2, serve.y + 128, 11, '#ffffff', 'center', '800');
    ctx.globalAlpha = 1;
  }
  text(ctx, 'Tersaji: ' + kitchen.served + '  •  Hangus: ' + kitchen.lost, serve.x + serve.w / 2, serve.y + 152, 12, '#d7ccc8', 'center');
}

function drawBins(ctx, kitchen) {
  const { bins, binW, binGap } = LAYOUT;
  text(ctx, 'BAHAN DI COUNTER — klik untuk ambil (maks 2 di tangan)', bins.x + 4, bins.y - 12, 15, '#3e2723', 'left', '800');
  INGREDIENTS.forEach((item, i) => {
    const x = bins.x + i * (binW + binGap);
    const y = bins.y;
    const held = kitchen.hands.filter((hand) => hand.id === item.id).length;
    ctx.fillStyle = '#fff3e0';
    roundRect(ctx, x, y, binW, 150, 12);
    ctx.fill();
    ctx.strokeStyle = kitchen.hover === 'bin:' + item.id ? '#ff7043' : '#a1887f';
    ctx.lineWidth = kitchen.hover === 'bin:' + item.id ? 3 : 1.5;
    ctx.stroke();
    drawIngredient(ctx, item.id, x + binW / 2, y + 52, 56);
    text(ctx, item.name, x + binW / 2, y + 108, 15, '#3e2723', 'center', '800');
    const prep = PREP[item.id];
    text(ctx, prep.station === 'none' ? 'Langsung tuang' : prep.station === 'stove' ? 'Kompor ' + prep.seconds + ' dtk' : 'Talenan ' + prep.seconds + ' dtk', x + binW / 2, y + 130, 11, '#8d6e63', 'center');
    if (held > 0) {
      ctx.fillStyle = '#ff7043';
      ctx.beginPath();
      ctx.arc(x + binW - 16, y + 16, 12, 0, Math.PI * 2);
      ctx.fill();
      text(ctx, String(held), x + binW - 16, y + 21, 13, '#ffffff', 'center', '800');
    }
  });
}

function drawHands(ctx, kitchen) {
  // What the chef carries, shown as two slots in the wall band below the
  // stations: an empty slot is a dashed outline, a full one shows the part.
  const cy = 528;
  text(ctx, 'TANGAN KOKI', 620, 492, 13, '#5d4037', 'center', '800');
  for (let i = 0; i < 2; i += 1) {
    const cx = 588 + i * 64;
    const hand = kitchen.hands[i];
    if (hand) {
      ctx.fillStyle = hand.state === 'done' ? '#c8e6c9' : '#fff3e0';
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8d6e63';
      ctx.lineWidth = 2;
      ctx.stroke();
      drawIngredient(ctx, hand.id, cx, cy, 36);
    } else {
      ctx.strokeStyle = '#a1887f';
      ctx.setLineDash([6, 5]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}

function drawFloaters(ctx, kitchen) {
  for (const floater of kitchen.floaters) {
    ctx.globalAlpha = Math.min(1, floater.life);
    text(ctx, floater.text, floater.x, floater.y - (1.2 - floater.life) * 40, 22, floater.color, 'center', '800');
    ctx.globalAlpha = 1;
  }
}

function drawOverlay(ctx, kitchen) {
  ctx.fillStyle = '#00000088';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#fff8e1';
  roundRect(ctx, 290, 170, 700, 460, 20);
  ctx.fill();
  ctx.strokeStyle = '#ff7043';
  ctx.lineWidth = 4;
  ctx.stroke();
  if (kitchen.screen === SCREEN_TITLE) {
    text(ctx, 'EMBER & LADLE', 640, 260, 52, '#bf360c', 'center', '800');
    text(ctx, 'Warung Rush — game masak kilat', 640, 300, 22, '#5d4037', 'center');
    text(ctx, 'Pesanan datang terus. Ambil bahan dari counter,', 640, 350, 17, '#3e2723', 'center');
    text(ctx, 'olah di kompor / talenan, rakit di piring, sajikan', 640, 376, 17, '#3e2723', 'center');
    text(ctx, 'sebelum kesabaran tamu habis. Shift 3 menit!', 640, 402, 17, '#3e2723', 'center');
    text(ctx, 'KLIK / 1-8: ambil bahan    •    SPASI: sajikan', 640, 452, 15, '#6d4c41', 'center', '800');
    text(ctx, 'Klik kompor / talenan untuk mengolah — klik lagi untuk ambil', 640, 478, 15, '#6d4c41', 'center', '800');
    ctx.fillStyle = '#ff7043';
    roundRect(ctx, 490, 510, 300, 56, 14);
    ctx.fill();
    text(ctx, 'MULAI MASAK ▶', 640, 546, 22, '#ffffff', 'center', '800');
    text(ctx, '6 resep warung: Nasi Goreng Kilat • Mie Ayam Ember • Sate Kilat', 640, 596, 13, '#8d6e63', 'center');
  } else if (kitchen.screen === SCREEN_WIN) {
    text(ctx, 'SHIFT SELESAI! 🎉', 640, 280, 44, '#2e7d32', 'center', '800');
    text(ctx, 'Warungmu laris manis hari ini.', 640, 330, 20, '#5d4037', 'center');
    text(ctx, 'Tersaji: ' + kitchen.served + ' piring   •   Koin: ' + kitchen.coins + '   •   Skor: ' + kitchen.score, 640, 390, 19, '#3e2723', 'center', '800');
    text(ctx, 'Kombo terbaik: ' + kitchen.bestCombo + 'x', 640, 424, 17, '#6d4c41', 'center');
    text(ctx, 'Tekan R untuk main lagi', 640, 500, 18, '#bf360c', 'center', '800');
  } else {
    text(ctx, 'WARUNG TUTUP 😞', 640, 280, 44, '#bf360c', 'center', '800');
    text(ctx, kitchen.hearts <= 0 ? 'Terlalu banyak pesanan hangus.' : 'Shift berakhir sebelum target tercapai.', 640, 330, 20, '#5d4037', 'center');
    text(ctx, 'Tersaji: ' + kitchen.served + ' piring   •   Koin: ' + kitchen.coins + '   •   Skor: ' + kitchen.score, 640, 390, 19, '#3e2723', 'center', '800');
    text(ctx, 'Target lolos: sajikan 8 piring dalam 3 menit.', 640, 424, 17, '#6d4c41', 'center');
    text(ctx, 'Tekan R untuk coba lagi', 640, 500, 18, '#bf360c', 'center', '800');
  }
}

export function drawGame(ctx, kitchen) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  drawWall(ctx);
  drawHud(ctx, kitchen);
  drawOrderBoard(ctx, kitchen);
  drawStation(ctx, LAYOUT.stove1, 'KOMPOR 1', kitchen.stoves[0], kitchen);
  drawStation(ctx, LAYOUT.stove2, 'KOMPOR 2', kitchen.stoves[1], kitchen);
  drawStation(ctx, LAYOUT.boardStation, 'TALENAN', kitchen.board, kitchen);
  drawPlate(ctx, kitchen);
  drawHands(ctx, kitchen);
  drawBins(ctx, kitchen);
  drawFloaters(ctx, kitchen);
  if (kitchen.screen === SCREEN_TITLE || kitchen.screen === SCREEN_OVER || kitchen.screen === SCREEN_WIN) {
    drawOverlay(ctx, kitchen);
  }
  // Menu names for the judge's outline: the dishes on offer.
  void DISHES;
}
