import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { clone as cloneSkeleton } from "three/addons/utils/SkeletonUtils.js";
import { useEditor } from "@/lib/store";

let ktx2: KTX2Loader | null = null;
const cache = new Map<string, Promise<THREE.Group>>();
const resolved = new Map<string, THREE.Group>();
const bytes = new Map<string, Promise<ArrayBuffer>>();
const screenTex = new WeakMap<THREE.Texture, THREE.Texture>();

export function prefetchModel(url: string) {
  let hit = bytes.get(url);
  if (!hit) {
    hit = fetch(url, { cache: "force-cache" }).then((r) => {
      if (!r.ok) throw new Error(`fetch ${url} ${r.status}`);
      return r.arrayBuffer();
    });
    bytes.set(url, hit);
  }
  return hit;
}

export function prefetchDefaultModels() {
  prefetchModel("/models/v1/iphone-17-p-sim.glb");
  fetch("/basis/basis_transcoder.js", { cache: "force-cache" });
  fetch("/basis/basis_transcoder.wasm", { cache: "force-cache" });
  void MeshoptDecoder.ready;
  const idle =
    typeof window !== "undefined" && "requestIdleCallback" in window
      ? window.requestIdleCallback.bind(window)
      : (fn: () => void) => window.setTimeout(fn, 1200);
  idle(() => prefetchModel("/models/v1/macbook-neo.glb"));
}

if (typeof window !== "undefined") prefetchDefaultModels();

function getLoader(gl: THREE.WebGLRenderer) {
  if (!ktx2) {
    ktx2 = new KTX2Loader();
    ktx2.setTranscoderPath("/basis/");
    ktx2.setWorkerLimit(4);
  }
  ktx2.detectSupport(gl);
  const loader = new GLTFLoader();
  loader.setKTX2Loader(ktx2);
  loader.setMeshoptDecoder(MeshoptDecoder);
  return loader;
}

export function loadPacked(url: string, gl: THREE.WebGLRenderer) {
  const hit = cache.get(url);
  if (hit) return hit;
  const promise = prefetchModel(url).then(
    (buf) =>
      new Promise<THREE.Group>((resolve, reject) => {
        getLoader(gl).parse(
          buf,
          "",
          (gltf) => {
            resolved.set(url, gltf.scene);
            resolve(gltf.scene);
          },
          reject,
        );
      }),
  );
  cache.set(url, promise);
  return promise;
}

export function peekResolved(url: string) {
  return resolved.get(url) ?? null;
}

function isScreenMaterial(mat: THREE.Material): boolean {
  if (mat.userData.isScreen) return true;
  if (!("emissive" in mat)) return false;
  const em = (mat as THREE.MeshStandardMaterial).emissive;
  return (em.r + em.g + em.b) / 3 > 0.85;
}

function ensureScreenUVs(mesh: THREE.Mesh) {
  const geo = mesh.geometry;
  if (geo.userData.screenUv === 2) return;
  const pos = geo.getAttribute("position") as THREE.BufferAttribute | undefined;
  if (!pos) return;
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  if (!bb) return;
  const size = new THREE.Vector3();
  bb.getSize(size);
  // thinnest axis is the display normal; U = width, V = height
  const dims = [
    { axis: 0, s: size.x },
    { axis: 1, s: size.y },
    { axis: 2, s: size.z },
  ].sort((a, b) => a.s - b.s);
  const uAxis = dims[1]!.axis;
  const vAxis = dims[2]!.axis;
  const uMin = bb.min.getComponent(uAxis);
  const vMin = bb.min.getComponent(vAxis);
  const uSize = size.getComponent(uAxis) || 1;
  const vSize = size.getComponent(vAxis) || 1;
  const uv = new Float32Array(pos.count * 2);
  const p = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i);
    uv[i * 2] = (p.getComponent(uAxis) - uMin) / uSize;
    uv[i * 2 + 1] = (p.getComponent(vAxis) - vMin) / vSize;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geo.userData.screenUv = 2;
}

function screenMap(map: THREE.Texture | null) {
  if (!map) return null;
  const cached = screenTex.get(map);
  if (cached) return cached;
  const t = map.clone();
  t.colorSpace = THREE.SRGBColorSpace;
  t.flipY = false;
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  t.anisotropy = 8;
  t.needsUpdate = true;
  screenTex.set(map, t);
  return t;
}

function applyScreen(root: THREE.Object3D, map: THREE.Texture | null) {
  const tex = screenMap(map);
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const hit = list.some((m) => m && isScreenMaterial(m));
    if (!hit && !mesh.userData.isScreen) return;
    mesh.userData.isScreen = true;
    ensureScreenUVs(mesh);
    const screen = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: tex,
      toneMapped: false,
      fog: false,
    });
    screen.userData.isScreen = true;
    if (!tex) screen.color.set("#161618");
    mesh.material = screen;
  });
}

function texturesReady(root: THREE.Object3D) {
  let pending = 0;
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || mesh.userData.isScreen) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      const std = mat as THREE.MeshStandardMaterial;
      for (const tex of [std.map, std.normalMap]) {
        if (!tex) continue;
        const img = tex.image as { width?: number } | undefined;
        if (!img || !img.width) pending += 1;
      }
    }
  });
  return pending === 0;
}

function tintBody(root: THREE.Object3D, color: string) {
  const c = new THREE.Color(color);
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || mesh.userData.isScreen) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      if (!("color" in mat)) continue;
      const m = mat as THREE.MeshStandardMaterial;
      if (m.map || m.userData.isScreen) continue;
      const lum = (m.color.r + m.color.g + m.color.b) / 3;
      if (lum > 0.25 && lum < 0.92) m.color.lerp(c, 0.35);
    }
  });
}

function fitFloating(root: THREE.Object3D, height: number) {
  root.scale.set(1, 1, 1);
  root.position.set(0, 0, 0);
  root.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(root, true);
  if (box.isEmpty()) return false;
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  if (!Number.isFinite(maxDim) || maxDim < 0.001) return false;
  root.scale.setScalar(height / maxDim);
  root.updateWorldMatrix(true, true);
  const fitted = new THREE.Box3().setFromObject(root, true);
  const center = fitted.getCenter(new THREE.Vector3());
  root.position.sub(center);
  root.position.y += 0.08;
  return true;
}

export function GltfDevice({
  url,
  map,
  height,
  color,
  rotation = [0, 0, 0],
  onReady,
}: {
  url: string;
  map: THREE.Texture | null;
  height: number;
  color?: string;
  rotation?: [number, number, number];
  onReady?: (ok: boolean) => void;
}) {
  const gl = useThree((s) => s.gl);
  const cached = peekResolved(url);
  const [clone, setClone] = useState<THREE.Object3D | null>(() =>
    cached ? cloneSkeleton(cached) : null,
  );
  const [visible, setVisible] = useState(false);
  const group = useRef<THREE.Group>(null);
  const readyRef = useRef(onReady);
  const warm = useRef(0);
  readyRef.current = onReady;

  useEffect(() => {
    if (!peekResolved(url) && !clone) {
      useEditor.getState().setFirstDeviceReady(false);
    }
    if (clone) return;
    let cancelled = false;
    loadPacked(url, gl)
      .then((scene) => {
        if (cancelled) return;
        setClone(cloneSkeleton(scene));
      })
      .catch(() => {
        if (cancelled) return;
        window.setTimeout(() => {
          cache.delete(url);
          bytes.delete(url);
          loadPacked(url, gl)
            .then((scene) => {
              if (!cancelled) setClone(cloneSkeleton(scene));
            })
            .catch(() => {});
        }, 400);
      });
    return () => {
      cancelled = true;
    };
  }, [url, gl, clone]);

  useLayoutEffect(() => {
    if (!clone) return;
    applyScreen(clone, map);
    if (color) tintBody(clone, color);
  }, [clone, map, color]);

  useFrame(({ gl: renderer, scene, camera }) => {
    if (visible || !clone || !group.current) return;
    if (!fitFloating(group.current, height)) return;
    if (!texturesReady(clone) && warm.current < 45) {
      warm.current += 1;
      return;
    }
    renderer.compile(scene, camera);
    setVisible(true);
    readyRef.current?.(true);
    useEditor.getState().setFirstDeviceReady();
  });

  if (!clone) return null;

  return (
    <group ref={group} rotation={rotation} visible={visible}>
      <primitive object={clone} />
    </group>
  );
}
