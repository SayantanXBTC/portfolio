import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Abstract "system topology": nodes on a shell joined to their near neighbours,
 * with a faint wireframe core. Slow rotation + pointer parallax. Nothing else.
 */
function Network({ color, count }) {
  const group = useRef();

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
        if (pts[a].distanceTo(pts[b]) < 1.05) seg.push(pts[a].x, pts[a].y, pts[a].z, pts[b].x, pts[b].y, pts[b].z);
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
    g.rotation.y += dt * 0.12;
    g.rotation.x += (state.pointer.y * 0.35 - g.rotation.x) * 0.04;
    g.rotation.z += (state.pointer.x * 0.2 - g.rotation.z) * 0.04;
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color={color} size={0.055} sizeAttenuation transparent opacity={0.95} depthWrite={false} />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={lines.length / 3} array={lines} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.16} depthWrite={false} />
      </lineSegments>
      <mesh>
        <icosahedronGeometry args={[1.25, 1]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

export default function NetworkScene({ color = "#d61f36", active = true, count = 110 }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 6.4], fov: 45 }}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      style={{ background: "transparent" }}
    >
      <Network color={color} count={count} />
    </Canvas>
  );
}
