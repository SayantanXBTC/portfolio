/*
 * A CSS 3D camera. World positions are in px with CSS axes (x right, y down,
 * z toward the reader). `cssCamera` gives the transform for a world element
 * inside a parent with `perspective: P`, and `toCamera` / `project` work out
 * where any world point lands on screen with exactly the same maths, so a
 * canvas or an overlay can line up with the DOM to the pixel.
 *
 * A camera is { pos: [x, y, z], yaw, pitch, roll } in radians; `lookAt`
 * fills in yaw and pitch.
 */

export const smoother = (t) => t * t * t * (t * (t * 6 - 15) + 10);

export function lookAt(pos, look) {
  const dx = look[0] - pos[0];
  const dy = look[1] - pos[1];
  const dz = look[2] - pos[2];
  return { pos, yaw: Math.atan2(dx, -dz), pitch: Math.atan2(-dy, Math.hypot(dx, dz)) };
}

/** Camera-space position of a world point (x right, y down, depth > 0 in front). */
export function toCamera(cam, p) {
  let x = p[0] - cam.pos[0];
  let y = p[1] - cam.pos[1];
  let z = p[2] - cam.pos[2];
  const cy = Math.cos(cam.yaw);
  const sy = Math.sin(cam.yaw);
  [x, z] = [x * cy + z * sy, -x * sy + z * cy];
  const cp = Math.cos(cam.pitch);
  const sp = Math.sin(cam.pitch);
  [y, z] = [y * cp - z * sp, y * sp + z * cp];
  const cr = Math.cos(cam.roll || 0);
  const sr = Math.sin(cam.roll || 0);
  [x, y] = [x * cr - y * sr, x * sr + y * cr];
  return [x, y, -z];
}

/** Screen position (px from the viewport's top left) and scale of a world point, or null behind the camera. `view` is { w, h, P }. */
export function project(view, cam, p) {
  const [x, y, depth] = toCamera(cam, p);
  if (depth < 1) return null;
  const k = view.P / depth;
  return { x: view.w / 2 + x * k, y: view.h / 2 + y * k, k, depth };
}

const r4 = (n) => Math.round(n * 1e4) / 1e4;

/** The CSS transform for the world element, matching `toCamera`. */
export function worldTransform(view, cam) {
  const [x, y, z] = cam.pos;
  return `translateZ(${view.P}px) rotateZ(${r4(cam.roll || 0)}rad) rotateX(${r4(cam.pitch)}rad) rotateY(${r4(cam.yaw)}rad) translate3d(${r4(-x)}px, ${r4(-y)}px, ${r4(-z)}px)`;
}
