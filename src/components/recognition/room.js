/*
 * The darkroom's layout and its timeline, worked out for one viewport.
 *
 * World units are px, CSS axes (x right, y down, z toward the reader). The
 * bench top is y = 0 and the back wall stands at z = WZ. Each achievement is
 * one batch: its prints develop together in their own tray on the bench, then
 * are lifted one by one and pegged to a drying line on the wall. When all
 * three batches are up, the safelight goes off and the room light comes on.
 */
import { lookAt, smoother } from "../../lib/camera";

// Scroll budget, in viewport heights.
export const T = { intro: 0.34, move: 0.28, dev: 0.46, hang: 0.52, hold: 0.16, reveal: 0.72, end: 0.42 };

const lerp = (a, b, t) => a + (b - a) * t;
const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const rand = (i, n) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;

export function buildRoom(w, h, slides, batchCount) {
  const u = (n) => Math.round(n * w);
  const P = u(0.9);
  const WZ = u(-0.95); // the back wall
  const TZ = u(-0.47); // tray centres
  const LX = u(-0.12); // the room's centre line
  const RIM = u(0.045); // tray wall height
  const LIQ = u(-0.03); // the liquid's surface
  const SOAK = u(-0.022); // a print lying in the tray, just under the surface
  const ih = u(0.118); // image height of every print
  const m = Math.round(ih * 0.075); // its white border

  const prints = slides.map((s, i) => {
    const iw = Math.round((ih * s.w) / s.h);
    return { i, owner: s.owner, k: s.k, iw, ih, m, W: iw + 2 * m, H: ih + 2 * m, rz0: (rand(i, 3) - 0.5) * 2.6 };
  });
  const batches = Array.from({ length: batchCount }, (_, b) => prints.filter((p) => p.owner === b));

  // trays: each batch packed into rows no wider than half the viewport
  const GX = u(0.022);
  const GZ = u(0.026);
  const PAD = u(0.04);
  const MAXW = u(0.5);
  const trays = batches.map((list, b) => {
    const rows = [[]];
    let rw = 0;
    for (const p of list) {
      const row = rows[rows.length - 1];
      const add = (row.length ? GX : 0) + p.W;
      if (row.length && rw + add > MAXW) {
        rows.push([p]);
        rw = p.W;
      } else {
        row.push(p);
        rw += add;
      }
    }
    const rowW = rows.map((r) => r.reduce((s, p) => s + p.W, 0) + GX * (r.length - 1));
    const rowH = rows.map((r) => Math.max(...r.map((p) => p.H)));
    const TW = Math.max(...rowW) + PAD * 2;
    const TD = rowH.reduce((s, x) => s + x, 0) + GZ * (rows.length - 1) + PAD * 2;
    return { b, TW, TD, rows, rowW, rowH, z: TZ };
  });
  const TGAP = u(0.17);
  const trayRun = trays.reduce((s, t) => s + t.TW, 0) + TGAP * (trays.length - 1);
  // the trays sit to the right of the lines, so a print carried up to its line never crosses the notes on the left
  let tx = LX + u(0.5) - trayRun / 2;
  for (const t of trays) {
    t.x = tx + t.TW / 2;
    tx += t.TW + TGAP;
    let z = t.z - t.TD / 2 + PAD;
    t.rows.forEach((row, ri) => {
      let x = t.x - t.rowW[ri] / 2;
      for (const p of row) {
        // where the print's top edge lies in the tray (it extends toward the reader from here)
        p.tray = [x + p.W / 2, SOAK, z + (t.rowH[ri] - p.H) / 2];
        x += p.W + GX;
      }
      z += t.rowH[ri] + GZ;
    });
  }

  // drying lines: the first batch on the upper line, the other two below it
  const HG = u(0.032);
  const BG = u(0.075);
  const groups = [batches[0], batches.slice(1).flat()];
  const lines = groups.map((list, li) => {
    const y = li === 0 ? u(-0.9) : u(-0.62);
    let total = 0;
    list.forEach((p, n) => {
      total += p.W + (n ? (p.owner !== list[n - 1].owner ? BG : HG) : 0);
    });
    const x0 = LX - total / 2 - u(0.14);
    const x1 = LX + total / 2 + u(0.14);
    const sag = u(0.016);
    const at = (x) => {
      const q = (x - (x0 + x1) / 2) / ((x1 - x0) / 2);
      return y + sag * (1 - q * q);
    };
    let x = LX - total / 2;
    list.forEach((p, n) => {
      if (n) x += p.owner !== list[n - 1].owner ? BG : HG;
      const cx = x + p.W / 2;
      p.line = li;
      p.wire = [cx, at(cx), WZ + u(0.03)];
      p.hang = [cx, at(cx) + u(0.004), WZ + u(0.03)];
      x += p.W;
    });
    return { y, x0, x1, sag, z: WZ + u(0.03) };
  });
  // left to right along the lines, top line first: the order the colour comes back in
  [...prints]
    .sort((a, b) => a.line - b.line || a.hang[0] - b.hang[0])
    .forEach((p, n) => {
      p.order = n;
    });

  // camera shots
  const introPose = { pos: [u(0.12), u(-0.6), WZ + u(2.75)], look: [u(0.1), u(-0.42), WZ + u(0.3)] };
  const revealPose = { pos: [LX - u(0.06), u(-0.7), WZ + u(1.36)], look: [LX - u(0.08), u(-0.73), WZ] };
  const devPose = (t, push) => {
    const look = [t.x - u(0.1), u(-0.01), t.z + u(0.02)];
    const pos = [t.x - u(0.07), u(-0.7), t.z + u(0.66)];
    return { pos: lerp3(pos, look, push), look };
  };
  const hangPose = (list) => {
    const sx = list.reduce((s, p) => s + p.hang[0], 0) / list.length;
    const ly = list[0].hang[1];
    // level with the line and to its left, so the prints sit up and to the right of the notes
    return { pos: [sx - u(0.17), ly + u(0.13), WZ + u(1.22)], look: [sx - u(0.19), ly + u(0.13), WZ] };
  };

  const keys = [];
  // `arc`: how far a move lifts and steps back at its middle, so the frame never empties
  const key = (t, pose, arc = null) => keys.push({ t, pos: pose.pos, look: pose.look, arc });
  let t = 0;
  key(t, introPose);
  t += T.intro;
  key(t, introPose);
  const sched = batches.map((list, b) => {
    const s = { moveStart: t };
    t += T.move;
    key(t, devPose(trays[b], 0), b ? [u(0.1), u(0.5)] : null);
    s.devStart = t;
    t += T.dev;
    key(t, devPose(trays[b], 0.06));
    s.hangStart = t;
    t += T.hang;
    key(t, hangPose(list));
    t += T.hold;
    key(t, hangPose(list));
    s.end = t;
    return s;
  });
  const revealStart = t;
  t += T.reveal;
  key(t, revealPose, [u(0.05), 0]);
  t += T.end;
  key(t, revealPose);

  const lamp = [LX, u(-1.16), WZ + u(0.02)];
  const bulb = [LX + u(0.55), u(-1.12), WZ + u(0.4)];
  const timer = [LX + u(0.86), u(-0.8), WZ + u(0.012)];
  // set dressing: the enlarger at the left end of the bench, a shelf of chemistry on the right
  // (left of where the lines end, so it never stands in front of a print)
  const enlarger = [Math.min(trays[0].x - trays[0].TW / 2 - u(0.36), Math.min(...lines.map((l) => l.x0)) - u(0.3)), 0, WZ + u(0.22)];
  const shelf = [trays[trays.length - 1].x + u(0.05), u(-0.42), WZ];

  return { w, h, P, WZ, TZ, LX, RIM, LIQ, prints, batches, trays, lines, keys, sched, revealStart, total: t, lamp, bulb, timer, enlarger, shelf, u };
}

/** The camera at a point of the scroll (viewport heights from the start). */
export function cameraAt(room, t) {
  const { keys } = room;
  let i = 0;
  while (i < keys.length - 2 && t >= keys[i + 1].t) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const f = b.t > a.t ? Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t))) : 1;
  const e = smoother(f);
  const pos = lerp3(a.pos, b.pos, e);
  // moves between shots lift and step back a little, like a head turning, rather than sliding flat
  if (b.arc) {
    const k = Math.sin(Math.PI * e);
    pos[1] -= b.arc[0] * k;
    pos[2] += b.arc[1] * k;
  }
  return lookAt(pos, lerp3(a.look, b.look, e));
}
