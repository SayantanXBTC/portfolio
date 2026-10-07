import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Abstract "system topology": nodes on a shell joined to their near neighbours.
 * Barely moving; it leans toward the pointer and toward the column being read.
 */
function Network({ color, count, turn }) {
  const group = useRef();
  const spin = useRef(0);

  const { positions, lines } = useMemo(() => {
    const pts = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i += 1) {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = golden * i;
      const jitter = 0.88 + (((i * 9301 + 49297) % 233280) / 233280) * 0.3;
      pts.push(new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r).multiplyScalar(2.2 * jitter));
    }
    const seg = [];
    for (let a = 0; a < pts.length; a += 1) {
      for (let b = a + 1; b < pts.length; b += 1) {
        if (pts[a].distanceTo(pts[b]) < 1.25) seg.push(pts[a].x, pts[a].y, pts[a].z, pts[b].x, pts[b].y, pts[b].z);
      }
    }
    return {
      positions: new Float32Array(pts.flatMap((p) => [p.x, p.y, p.z])),
      lines: new Float32Array(seg),
    };
  }, [count]);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    // very slow drift; the structure turns toward the column being read,
    // and leans a little toward the pointer
    spin.current += dt * 0.035;
    const targetY = spin.current + turn * 0.55 + state.pointer.x * 0.18;
    g.rotation.y += (targetY - g.rotation.y) * 0.03;
    g.rotation.x += (-state.pointer.y * 0.16 - g.rotation.x) * 0.03;
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color={color} size={0.045} sizeAttenuation transparent opacity={0.8} depthWrite={false} />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={lines.length / 3} array={lines} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.1} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

export default function NetworkScene({ color = "#d61f36", active = true, count = 72, turn = 0 }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 6.4], fov: 45 }}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      style={{ background: "transparent" }}
      // the canvas ignores pointer events, so listen on the page instead
      eventSource={typeof document !== "undefined" ? document.getElementById("root") : undefined}
      eventPrefix="client"
    >
      <Network color={color} count={count} turn={turn} />
    </Canvas>
  );
}
