import { useEffect, useState } from "react";

const read = () => ({ w: window.innerWidth, h: window.innerHeight });

/**
 * The viewport size a pinned 3D stage is laid out for. It follows real resizes
 * and rotations, but not a phone's address bar sliding in and out while the
 * page scrolls (a small change in height only), which would otherwise rebuild
 * the whole scene mid-scroll.
 */
export function useStageSize() {
  const [size, setSize] = useState(read);
  useEffect(() => {
    let t;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        setSize((s) => {
          const n = read();
          return n.w !== s.w || Math.abs(n.h - s.h) > 140 ? n : s;
        });
      }, 120);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return size;
}
