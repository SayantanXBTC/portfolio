/**
 * The colour of the light a picture gives off: an average that favours its
 * saturated, bright pixels, lifted to a usable brightness. Resolves to
 * [r, g, b], or null if the picture cannot be read.
 */
export function lightOf(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = 24;
        c.height = 24;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, 24, 24);
        const d = ctx.getImageData(0, 0, 24, 24).data;
        let r = 0;
        let g = 0;
        let b = 0;
        let w = 0;
        for (let i = 0; i < d.length; i += 4) {
          const max = Math.max(d[i], d[i + 1], d[i + 2]);
          const min = Math.min(d[i], d[i + 1], d[i + 2]);
          const sat = max ? (max - min) / max : 0;
          const wt = sat * sat * (max / 255) + 0.02;
          r += d[i] * wt;
          g += d[i + 1] * wt;
          b += d[i + 2] * wt;
          w += wt;
        }
        const k = 225 / Math.max(r / w, g / w, b / w, 1);
        resolve([(r / w) * k, (g / w) * k, (b / w) * k]);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
