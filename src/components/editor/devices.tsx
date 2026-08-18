import { type ReactNode, useState, useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { DeviceId, DEVICE_COLORS, getDevice } from "@/lib/catalog";
import { GltfDevice } from "./gltf-devices";

type Color = { body: string; metal: string; glass: string };
type DeviceProps = {
  deviceId: DeviceId;
  colorId: string;
  map: THREE.Texture | null;
};

const EXTRUDE = {
  bevelEnabled: true,
  bevelThickness: 0.0032,
  bevelSize: 0.003,
  bevelSegments: 3,
  curveSegments: 16,
  steps: 1,
} as const;

function squircle(w: number, h: number, r: number) {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  const rr = Math.min(r, w / 2 - 0.0001, h / 2 - 0.0001);
  shape.moveTo(x + rr, y);
  shape.lineTo(x + w - rr, y);
  shape.absarc(x + w - rr, y + rr, rr, -Math.PI / 2, 0, false);
  shape.lineTo(x + w, y + h - rr);
  shape.absarc(x + w - rr, y + h - rr, rr, 0, Math.PI / 2, false);
  shape.lineTo(x + rr, y + h);
  shape.absarc(x + rr, y + h - rr, rr, Math.PI / 2, Math.PI, false);
  shape.lineTo(x, y + rr);
  shape.absarc(x + rr, y + rr, rr, Math.PI, Math.PI * 1.5, false);
  return shape;
}

function useExtrude(
  w: number,
  h: number,
  r: number,
  depth: number,
  extra?: Partial<THREE.ExtrudeGeometryOptions>,
) {
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(squircle(w, h, r), {
      ...EXTRUDE,
      ...extra,
      depth,
    });
    g.center();
    return g;
  }, [w, h, r, depth, extra?.bevelThickness, extra?.bevelSize]);
  useLayoutEffect(() => () => geo.dispose(), [geo]);
  return geo;
}

function useScreenMaterial(map: THREE.Texture | null, fallback: string) {
  const mat = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: map ? "#ffffff" : fallback,
      roughness: 0.18,
      metalness: 0,
      clearcoat: 0.85,
      clearcoatRoughness: 0.12,
      toneMapped: false,
      emissive: map ? new THREE.Color("#ffffff") : new THREE.Color("#000000"),
      emissiveIntensity: map ? 0.62 : 0,
    });
    if (map) {
      m.map = map;
      m.emissiveMap = map;
    }
    return m;
  }, [map, fallback]);
  useLayoutEffect(() => () => mat.dispose(), [mat]);
  return mat;
}

function Titanium({
  color,
  metal = 0.92,
  rough = 0.22,
}: {
  color: string;
  metal?: number;
  rough?: number;
}) {
  return (
    <meshStandardMaterial
      color={color}
      metalness={metal * 0.72}
      roughness={rough}
      envMapIntensity={1.05}
    />
  );
}

function GlassBack({ color }: { color: string }) {
  return (
    <meshStandardMaterial
      color={color}
      metalness={0.18}
      roughness={0.16}
      envMapIntensity={1.2}
    />
  );
}

export function DeviceModel({ deviceId, colorId, map }: DeviceProps) {
  const def = getDevice(deviceId);
  const color =
    def.colors.find((c) => c.id === colorId) ??
    DEVICE_COLORS[colorId] ??
    def.colors[0]!;

  if (deviceId === "iphone-17") {
    return (
      <GltfOrFallback
        url="/models/v1/iphone-17-p-sim.glb"
        map={map}
        height={1.48}
        color={color.body}
        fallback={<Phone color={color} map={map} pro={false} />}
      />
    );
  }
  if (deviceId === "macbook-neo") {
    return (
      <GltfOrFallback
        url="/models/v1/macbook-neo.glb"
        map={map}
        height={1.55}
        color={color.body}
        fallback={<Laptop color={color} map={map} wide={false} />}
      />
    );
  }
  if (def.kind === "laptop") {
    return <Laptop color={color} map={map} wide={deviceId === "macbook-pro"} />;
  }
  if (def.kind === "tablet") return <Tablet color={color} map={map} />;
  if (def.kind === "watch") return <Watch color={color} map={map} />;
  return <Phone color={color} map={map} pro={deviceId === "iphone-17-pro"} />;
}

function GltfOrFallback({
  url,
  map,
  height,
  color,
  fallback,
}: {
  url: string;
  map: THREE.Texture | null;
  height: number;
  color: string;
  fallback: ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <>
      {!failed ? (
        <GltfDevice
          url={url}
          map={map}
          height={height}
          color={color}
          onReady={(ok) => {
            if (!ok) setFailed(true);
          }}
        />
      ) : (
        fallback
      )}
    </>
  );
}

function Phone({
  color,
  map,
  pro,
}: {
  color: Color;
  map: THREE.Texture | null;
  pro: boolean;
}) {
  const w = 0.717;
  const h = 1.478;
  const d = 0.078;
  const r = 0.124;
  const band = useExtrude(w + 0.012, h + 0.012, r, d, {
    bevelThickness: 0.0045,
    bevelSize: 0.004,
  });
  const back = useExtrude(w - 0.012, h - 0.012, r - 0.014, 0.01, {
    bevelThickness: 0.0016,
    bevelSize: 0.0014,
  });
  const bezel = useExtrude(w - 0.028, h - 0.028, 0.1, 0.006, {
    bevelThickness: 0.0012,
    bevelSize: 0.001,
  });
  const screen = useScreenMaterial(map, "#101012");

  return (
    <group position={[0, 0.16, 0]}>
      <mesh geometry={band} castShadow receiveShadow>
        <Titanium color={color.metal} metal={0.94} rough={0.18} />
      </mesh>
      <mesh geometry={back} position={[0, 0, -d / 2 + 0.004]} receiveShadow>
        <GlassBack color={color.body} />
      </mesh>
      <mesh geometry={bezel} position={[0, 0, d / 2 - 0.001]} castShadow>
        <meshStandardMaterial color="#050506" roughness={0.45} metalness={0.15} />
      </mesh>
      <mesh position={[0, -0.01, d / 2 + 0.006]} material={screen} castShadow>
        <planeGeometry args={[w - 0.068, h - 0.086]} />
      </mesh>
      <mesh position={[0, h / 2 - 0.092, d / 2 + 0.008]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.016, 0.086, 8, 16]} />
        <meshStandardMaterial color="#050505" roughness={0.28} />
      </mesh>
      <mesh position={[0.028, h / 2 - 0.092, d / 2 + 0.009]}>
        <circleGeometry args={[0.007, 20]} />
        <meshStandardMaterial color="#1a1c22" roughness={0.2} metalness={0.6} />
      </mesh>
      <ButtonStrip side={-1} y={0.18} metal={color.metal} length={0.168} />
      <ButtonStrip side={1} y={0.26} metal={color.metal} length={0.086} />
      <ButtonStrip side={1} y={0.08} metal={color.metal} length={0.052} action />
      <mesh position={[0, -h / 2 + 0.002, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.008, 0.028, 6, 12]} />
        <meshStandardMaterial color="#1a1a1c" roughness={0.35} metalness={0.7} />
      </mesh>
      {pro ? (
        <ProCamera color={color} z={-d / 2 - 0.006} />
      ) : (
        <DualCamera color={color} z={-d / 2 - 0.006} />
      )}
    </group>
  );
}

function ButtonStrip({
  side,
  y,
  metal,
  length,
  action,
}: {
  side: 1 | -1;
  y: number;
  metal: string;
  length: number;
  action?: boolean;
}) {
  return (
    <mesh position={[side * 0.366, y, 0]} castShadow>
      <capsuleGeometry args={[0.007, length, 4, 10]} />
      <Titanium
        color={action ? "#d4a017" : metal}
        metal={action ? 0.7 : 0.9}
        rough={0.2}
      />
    </mesh>
  );
}

function Lens({
  position,
  r = 0.032,
}: {
  position: [number, number, number];
  r?: number;
}) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r + 0.006, r + 0.006, 0.01, 28]} />
        <meshStandardMaterial color="#1a1a1c" metalness={0.75} roughness={0.28} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.002]}>
        <cylinderGeometry args={[r, r, 0.008, 28]} />
        <meshPhysicalMaterial
          color="#0b1220"
          metalness={0.2}
          roughness={0.04}
          clearcoat={1}
          clearcoatRoughness={0.04}
          transmission={0.35}
          thickness={0.02}
          ior={1.5}
          transparent
        />
      </mesh>
      <mesh position={[0, 0, 0.007]}>
        <circleGeometry args={[r * 0.38, 20]} />
        <meshStandardMaterial
          color="#1c3a6b"
          roughness={0.08}
          metalness={0.4}
          emissive="#0a1630"
          emissiveIntensity={0.25}
        />
      </mesh>
    </group>
  );
}

function DualCamera({ color, z }: { color: Color; z: number }) {
  const plate = useExtrude(0.168, 0.34, 0.08, 0.016, {
    bevelThickness: 0.002,
    bevelSize: 0.002,
  });
  return (
    <group position={[-0.198, 0.48, z]}>
      <mesh geometry={plate} castShadow>
        <Titanium color={color.metal} metal={0.9} rough={0.2} />
      </mesh>
      <Lens position={[0, 0.072, 0.01]} />
      <Lens position={[0, -0.072, 0.01]} />
      <mesh position={[0.048, 0, 0.01]}>
        <circleGeometry args={[0.01, 16]} />
        <meshStandardMaterial color="#f4e7b0" emissive="#f4e7b0" emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

function ProCamera({ color, z }: { color: Color; z: number }) {
  const plate = useExtrude(0.3, 0.3, 0.072, 0.02, {
    bevelThickness: 0.0024,
    bevelSize: 0.0022,
  });
  return (
    <group position={[-0.168, 0.5, z]}>
      <mesh geometry={plate} castShadow>
        <Titanium color={color.metal} metal={0.88} rough={0.22} />
      </mesh>
      <Lens position={[-0.062, 0.062, 0.012]} r={0.036} />
      <Lens position={[0.062, 0.062, 0.012]} r={0.036} />
      <Lens position={[-0.062, -0.062, 0.012]} r={0.036} />
      <mesh position={[0.062, -0.04, 0.014]}>
        <circleGeometry args={[0.012, 16]} />
        <meshStandardMaterial color="#f2e4a8" emissive="#f2e4a8" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0.062, -0.082, 0.014]}>
        <circleGeometry args={[0.01, 16]} />
        <meshStandardMaterial color="#111" metalness={0.8} roughness={0.25} />
      </mesh>
    </group>
  );
}

function Tablet({ color, map }: { color: Color; map: THREE.Texture | null }) {
  const w = 1.16;
  const h = 1.54;
  const d = 0.056;
  const chassis = useExtrude(w, h, 0.068, d, {
    bevelThickness: 0.003,
    bevelSize: 0.0028,
  });
  const bezel = useExtrude(w - 0.03, h - 0.03, 0.05, 0.005);
  const screen = useScreenMaterial(map, "#101012");
  return (
    <group position={[0, 0.14, 0]}>
      <mesh geometry={chassis} castShadow receiveShadow>
        <Titanium color={color.metal} metal={0.78} rough={0.28} />
      </mesh>
      <mesh geometry={bezel} position={[0, 0, d / 2 - 0.001]}>
        <meshStandardMaterial color="#080809" roughness={0.42} />
      </mesh>
      <mesh position={[0, 0, d / 2 + 0.005]} material={screen} castShadow>
        <planeGeometry args={[w - 0.078, h - 0.078]} />
      </mesh>
      <mesh position={[0, h / 2 - 0.028, d / 2 + 0.006]}>
        <circleGeometry args={[0.007, 16]} />
        <meshStandardMaterial color="#1a1c22" metalness={0.6} roughness={0.2} />
      </mesh>
      <group position={[-0.42, 0.58, -d / 2 - 0.004]}>
        <mesh>
          <circleGeometry args={[0.028, 24]} />
          <Titanium color={color.metal} />
        </mesh>
        <Lens position={[0, 0, 0.004]} r={0.016} />
      </group>
    </group>
  );
}

function useDeckTexture() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 640;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#161618";
    ctx.fillRect(0, 0, 1024, 640);
    const key = (x: number, y: number, w: number, h: number) => {
      ctx.fillStyle = "#2a2a2e";
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 4);
      ctx.fill();
      ctx.fillStyle = "#3a3a40";
      ctx.beginPath();
      ctx.roundRect(x + 1, y + 1, w - 2, h * 0.35, 3);
      ctx.fill();
    };
    const gap = 6;
    const kw = 58;
    const kh = 36;
    const ox = 56;
    const oy = 28;
    for (let row = 0; row < 5; row++) {
      const inset = row === 0 ? 0 : row === 4 ? 36 : row * 10;
      const cols = row === 4 ? 12 : 14;
      for (let col = 0; col < cols; col++) {
        const extra = row === 4 && (col === 0 || col === 11) ? 28 : 0;
        key(ox + inset + col * (kw + gap), oy + row * (kh + gap), kw + extra, kh);
      }
    }
    ctx.fillStyle = "#222226";
    ctx.beginPath();
    ctx.roundRect(352, 430, 320, 176, 16);
    ctx.fill();
    ctx.strokeStyle = "#3a3a40";
    ctx.lineWidth = 2;
    ctx.stroke();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    t.needsUpdate = true;
    return t;
  }, []);
  useLayoutEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

function Laptop({
  color,
  map,
  wide,
}: {
  color: Color;
  map: THREE.Texture | null;
  wide: boolean;
}) {
  const sw = wide ? 1.64 : 1.52;
  const sh = wide ? 1.06 : 0.99;
  const base = useExtrude(sw, sh, 0.034, 0.028, {
    bevelThickness: 0.004,
    bevelSize: 0.0035,
  });
  const lid = useExtrude(sw, sh, 0.034, 0.018, {
    bevelThickness: 0.0026,
    bevelSize: 0.0024,
  });
  const screen = useScreenMaterial(map, "#101012");
  const deck = useDeckTexture();
  const lidAngle = -1.14;

  return (
    <group position={[0, 0.12, 0.08]}>
      <mesh geometry={base} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <Titanium color={color.metal} metal={0.72} rough={0.32} />
      </mesh>
      <mesh
        position={[0, 0.016, 0.02]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[sw * 0.94, sh * 0.9]} />
        <meshStandardMaterial map={deck} roughness={0.55} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.01, -sh / 2 + 0.016]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.016, 0.016, sw * 0.94, 20]} />
        <Titanium color={color.metal} metal={0.68} rough={0.34} />
      </mesh>
      <group position={[0, 0.014, -sh / 2 + 0.016]} rotation={[lidAngle, 0, 0]}>
        <group position={[0, sh / 2, 0]}>
          <mesh geometry={lid} castShadow receiveShadow>
            <Titanium color={color.metal} metal={0.74} rough={0.3} />
          </mesh>
          <mesh position={[0, 0.004, 0.011]}>
            <planeGeometry args={[sw - 0.09, sh - 0.09]} />
            <meshStandardMaterial color="#050506" roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.006, 0.013]} material={screen}>
            <planeGeometry args={[sw - 0.118, sh - 0.122]} />
          </mesh>
          <mesh position={[0, sh / 2 - 0.046, 0.014]}>
            <capsuleGeometry args={[0.007, 0.036, 6, 12]} />
            <meshStandardMaterial color="#050505" roughness={0.3} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function Watch({ color, map }: { color: Color; map: THREE.Texture | null }) {
  const caseGeo = useExtrude(0.54, 0.64, 0.13, 0.128, {
    bevelThickness: 0.01,
    bevelSize: 0.008,
  });
  const glass = useExtrude(0.46, 0.56, 0.11, 0.012, {
    bevelThickness: 0.002,
    bevelSize: 0.002,
  });
  const screen = useScreenMaterial(map, "#101012");
  return (
    <group position={[0, 0.18, 0]}>
      <mesh geometry={caseGeo} castShadow receiveShadow>
        <Titanium color={color.metal} metal={0.62} rough={0.32} />
      </mesh>
      <mesh geometry={glass} position={[0, 0, 0.062]}>
        <meshStandardMaterial color="#080809" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.072]} material={screen}>
        <planeGeometry args={[0.4, 0.49]} />
      </mesh>
      <mesh position={[0.292, 0.07, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.032, 0.034, 0.036, 24]} />
        <Titanium color={color.metal} metal={0.7} rough={0.28} />
      </mesh>
      <mesh position={[0.292, 0.07, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, 0.04, 16]} />
        <meshStandardMaterial color="#1a1a1c" roughness={0.4} />
      </mesh>
      <mesh position={[-0.286, 0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.046, 0.018, 0.03]} />
        <meshStandardMaterial color="#e07a20" metalness={0.4} roughness={0.35} />
      </mesh>
      <Band y={0.38} color={color.body} />
      <Band y={-0.38} color={color.body} flip />
    </group>
  );
}

function Band({ y, color, flip }: { y: number; color: string; flip?: boolean }) {
  return (
    <group position={[0, y, 0]} rotation={[flip ? Math.PI : 0, 0, 0]}>
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[0.3, 0.18, 0.055]} />
        <meshStandardMaterial color={color} roughness={0.62} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.22, 0.01]} rotation={[0.35, 0, 0]} castShadow>
        <boxGeometry args={[0.26, 0.16, 0.04]} />
        <meshStandardMaterial color={color} roughness={0.64} metalness={0.06} />
      </mesh>
    </group>
  );
}
