/*
 * Night Flight: the camera that carries the reader through Work.
 *
 * The five projects hang in one dark 3D space. Each scene is a full-viewport
 * panel facing the reader; the camera flies a curved route between them and
 * stops dead in front of each one, at exactly the perspective distance, so a
 * landed scene renders at its natural size, pixel for pixel, like a flat page.
 *
 * Units: world positions are written in viewport widths and turned into px by
 * `buildRoute`. Axes follow CSS: x right, y down, z toward the reader.
 * The transform order matches CSS (`translateZ(P) rotateZ rotateX rotateY
 * translate3d(-camera)`), so the canvas layers project points exactly where the
 * DOM panels end up.
 */

import { lookAt, smoother } from "../../lib/camera";

export { project, smoother, toCamera, worldTransform } from "../../lib/camera";

// Scene centres, in viewport widths. They zigzag away from the reader and rise
// and fall a little, so every hop between them is a turn.
const STATIONS = [
  [0, 0, 0],
  [2.4, -0.22, -2.4],
  [0.25, 0.12, -4.8],
  [2.6, -0.18, -7.2],
  [0.45, 0.14, -9.6],
];

// Scroll budget, in viewport heights.
const HOLD = 0.72; // landed on a scene
const HOP = 0.95; // flying from one scene to the next
const INTRO_HOLD = 0.2;
const INTRO = 1.05;
const OUTRO = 1.15;
const OUTRO_HOLD = 0.55;

const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
const lerp = (a, b, t) => a + (b - a) * t;
const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

function bezier(p0, p1, p2, p3, t) {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [0, 1, 2].map((k) => a * p0[k] + b * p1[k] + c * p2[k] + d * p3[k]);
}

/**
 * Lays the route out for a viewport. Everything returned is in px.
 * On a screen taller than wide the whole route is turned on its side: the
 * scenes zigzag up and down instead of left and right, so the camera climbs
 * and dives between them and the wide shots fill the tall frame.
 */
export function buildRoute(w, h, count = STATIONS.length) {
  const portrait = h > w;
  const P = Math.round(w * 0.9); // perspective distance = landing distance
  const px = (v) => (portrait ? [v[1], v[0], v[2]] : v).map((n) => Math.round(n * w));
  const stations = STATIONS.slice(0, count).map(px);
  const stops = stations.map((s) => [s[0], s[1], s[2] + P]);
  const last = stations.length - 1;

  // the overview shots that open and close the flight
  const openPos = px([-3, -4, 5.5]);
  const openLook = px([0.6, 0, -3]);
  // (upright, the closing shot echoes the opening one from a little higher, with the route lifted clear of the caption)
  const endPos = portrait ? [-4, -3.4, 5.5].map((n) => Math.round(n * w)) : px([3.5, -2.5, 5.5]);
  const endLook = portrait ? [0, 1.5, -3].map((n) => Math.round(n * w)) : px([2, 0, -4.5]);

  const phases = [];
  const hold = (len, pos, look, scene) => phases.push({ len, hold: true, pos, look, scene });
  const fly = (len, a, b, c1, c2, from, to) => phases.push({ len, a, b, c1, c2, from, to, lookA: a.look, lookB: b.look });

  const open = { pos: openPos, look: openLook };
  const end = { pos: endPos, look: endLook };
  const at = (i) => ({ pos: stops[i], look: stations[i] });

  hold(INTRO_HOLD, open.pos, open.look, -1);
  // a long descending swoop into the first scene, arriving from above and to the left
  fly(INTRO, open, at(0), add(open.pos, px([0.7, 1.3, -1.3])), add(stops[0], px([-1.1, -0.7, 1.3])), -1, 0);
  for (let i = 0; i <= last; i++) {
    hold(HOLD, stops[i], stations[i], i);
    if (i < last) {
      // lift up and back off the scene, then dive into the next one
      const dir = Math.sign(STATIONS[i + 1][0] - STATIONS[i][0]) || 1;
      fly(
        HOP,
        at(i),
        at(i + 1),
        add(stops[i], px([-0.7 * dir, -0.42, 0.75])),
        add(stops[i + 1], px([0.85 * dir, -0.3, 0.65])),
        i,
        i + 1
      );
    }
  }
  // climb away and look back over the whole route
  fly(OUTRO, at(last), end, add(stops[last], px([0.9, -0.6, 1.6])), add(end.pos, px([-0.6, 1.2, -3.5])), last, -1);
  hold(OUTRO_HOLD, end.pos, end.look, -1);

  let acc = 0;
  for (const ph of phases) {
    ph.start = acc;
    acc += ph.len;
  }
  // where each scene's hold sits on the scroll, in viewport heights
  const landings = phases.filter((ph) => ph.hold && ph.scene >= 0).map((ph) => ph.start + ph.len / 2);

  // a thread of light running just below the scenes (beside them, on its side), out ahead of the first and past the last
  const under = portrait ? [-Math.round(w * 0.66), 0, 0] : [0, Math.round(h * 0.62), 0];
  const knots = [
    add(stations[0], px([-1.6, 0.75, 0.4])),
    ...stations.map((s) => add(s, under)),
    add(stations[last], px([-0.8, 0.5, -2.4])),
  ];
  const thread = sampleThread(knots, 28);

  return { w, h, P, stations, phases, total: acc, landings, thread };
}

/** Catmull-Rom through the knots, as a polyline; `seg` tells which scene each point belongs to. */
function sampleThread(knots, per) {
  const out = [];
  const n = knots.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = knots[Math.max(0, i - 1)];
    const p1 = knots[i];
    const p2 = knots[i + 1];
    const p3 = knots[Math.min(n - 1, i + 2)];
    for (let j = 0; j < per; j++) {
      const t = j / per;
      const t2 = t * t;
      const t3 = t2 * t;
      const p = [0, 1, 2].map(
        (k) =>
          0.5 *
          (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)
      );
      // knot 0 leads into scene 0; knot i (1..5) is scene i-1
      out.push({ p, seg: i - 1 + t });
    }
  }
  out.push({ p: knots[n - 1], seg: n - 2 });
  return out;
}

/**
 * The camera at a point of the scroll (in viewport heights from the start).
 * `near[i]` is how close the flight is to scene i: 1 when landed on it,
 * falling to 0 halfway to a neighbour. `landed` is 1 while holding on a scene
 * and 0 at the middle of a hop; `overview` is 1 on the opening and closing shots.
 */
export function cameraAt(route, t) {
  const { phases, stations } = route;
  let ph = phases[phases.length - 1];
  for (const p of phases) {
    if (t < p.start + p.len) {
      ph = p;
      break;
    }
  }
  const near = stations.map(() => 0);
  let pos;
  let look;
  let landed;
  let overview = 0;
  let prog; // how far along the thread of light the flight has come (-1 before scene 0, n after the last)
  const n = stations.length;
  if (ph.hold) {
    pos = ph.pos;
    look = ph.look;
    landed = 1;
    if (ph.scene >= 0) near[ph.scene] = 1;
    else overview = 1;
    prog = ph.scene >= 0 ? ph.scene : ph.start === 0 ? -1 : n;
  } else {
    const f = clamp01((t - ph.start) / ph.len);
    const e = smoother(f);
    pos = f >= 1 ? ph.b.pos : f <= 0 ? ph.a.pos : bezier(ph.a.pos, ph.c1, ph.c2, ph.b.pos, e);
    look = lerp3(ph.lookA, ph.lookB, smooth(clamp01((e - 0.06) / 0.6)));
    landed = Math.abs(2 * e - 1) ** 2;
    if (ph.from >= 0) near[ph.from] = 1 - e;
    if (ph.to >= 0) near[ph.to] = e;
    if (ph.from < 0) overview = 1 - e;
    if (ph.to < 0) overview = e;
    prog = lerp(ph.from >= 0 ? ph.from : -1, ph.to >= 0 ? ph.to : n, e);
  }
  return { ...lookAt(pos, look), near, landed, overview, prog };
}
