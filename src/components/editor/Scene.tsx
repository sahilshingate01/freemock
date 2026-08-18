import { useEffect, useLayoutEffect, useMemo, useRef, Suspense } from "react";
import type { ComponentRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
} from "@react-three/drei";
import { EffectComposer, DepthOfField } from "@react-three/postprocessing";
import { DeviceModel } from "./devices";
import { useScreenMap } from "./use-screen-map";
import { interpolateAt, useEditor } from "@/lib/store";
import { rendererRef } from "@/lib/renderer-ref";

function ActiveDevice() {
  const url = useEditor((s) => {
    const shot = s.shots.find((x) => x.id === s.activeShotId) ?? s.shots[0];
    return shot?.mediaUrl ?? "/screens/aurora.jpg";
  });
  const deviceId = useEditor((s) => {
    const shot = s.shots.find((x) => x.id === s.activeShotId) ?? s.shots[0];
    return shot?.deviceId ?? "iphone-17";
  });
  const colorId = useEditor((s) => {
    const shot = s.shots.find((x) => x.id === s.activeShotId) ?? s.shots[0];
    return shot?.colorId ?? "white";
  });
  const map = useScreenMap(url);
  return <DeviceModel deviceId={deviceId} colorId={colorId} map={map} />;
}

function CameraRig() {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const { camera } = useThree();
  const playing = useEditor((s) => s.playing);
  const playhead = useEditor((s) => s.playhead);
  const keyframes = useEditor((s) => s.keyframes);
  const polar = useEditor((s) => s.polar);
  const azimuth = useEditor((s) => s.azimuth);
  const distance = useEditor((s) => s.distance);
  const fov = useEditor((s) => s.fov);
  const panX = useEditor((s) => s.panX);
  const panY = useEditor((s) => s.panY);
  const setCamera = useEditor((s) => s.setCamera);
  const spherical = useMemo(() => new THREE.Spherical(), []);
  const target = useMemo(() => new THREE.Vector3(0, 0.02, 0), []);

  useLayoutEffect(() => {
    target.set(panX, 0.02 + panY, 0);
    apply(polar, azimuth, distance, fov);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [polar, azimuth, distance, fov, panX, panY, playing]);

  function apply(p: number, a: number, d: number, f: number) {
    spherical.set(d, p, a);
    camera.position.setFromSpherical(spherical).add(target);
    camera.lookAt(target);
    if ("fov" in camera) {
      (camera as THREE.PerspectiveCamera).fov = f;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }
    controls.current?.update();
  }

  useFrame(() => {
    if (!playing) return;
    const kf = interpolateAt(playhead, keyframes);
    if (!kf) return;
    apply(kf.polar, kf.azimuth, kf.distance, kf.fov);
  });

  return (
    <OrbitControls
      ref={controls}
      enablePan
      enableDamping
      dampingFactor={0.08}
      minPolarAngle={0.18}
      maxPolarAngle={Math.PI / 1.55}
      minDistance={1.2}
      maxDistance={5.5}
      target={target}
      enabled={!playing}
      onEnd={() => {
        if (playing) return;
        const offset = camera.position.clone().sub(target);
        spherical.setFromVector3(offset);
        const cur = useEditor.getState();
        if (
          Math.abs(cur.polar - spherical.phi) < 0.002 &&
          Math.abs(cur.azimuth - spherical.theta) < 0.002 &&
          Math.abs(cur.distance - spherical.radius) < 0.002
        ) {
          return;
        }
        setCamera({
          polar: spherical.phi,
          azimuth: spherical.theta,
          distance: spherical.radius,
        });
      }}
    />
  );
}

function Lights() {
  const keyLight = useEditor((s) => s.keyLight);
  const keyLightHeight = useEditor((s) => s.keyLightHeight);
  const keyLightRotation = useEditor((s) => s.keyLightRotation);
  const lightRotation = useEditor((s) => s.lightRotation);
  const fillLight = useEditor((s) => s.fillLight);
  const rimLight = useEditor((s) => s.rimLight);
  const envIntensity = useEditor((s) => s.envIntensity);
  const fill = useEditor((s) => s.fill);
  const exposure = useEditor((s) => s.exposure);

  const keyAngle = lightRotation * Math.PI * 2 + keyLightRotation * Math.PI;
  const kx = Math.sin(keyAngle) * 2.6;
  const kz = Math.cos(keyAngle) * 2.6;
  const ky = 0.55 + keyLightHeight * 1.7;

  return (
    <>
      <color attach="background" args={[fill]} />
      <ambientLight intensity={0.12 + envIntensity * 0.08} />
      <hemisphereLight intensity={0.22} color="#fff7ee" groundColor="#8a8680" />
      <directionalLight
        castShadow
        position={[kx, ky, kz]}
        intensity={keyLight * 0.85}
        color="#fff4e6"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00015}
        shadow-camera-near={0.5}
        shadow-camera-far={10}
        shadow-camera-left={-2.4}
        shadow-camera-right={2.4}
        shadow-camera-top={2.4}
        shadow-camera-bottom={-2.4}
      />
      <directionalLight
        position={[-kx * 0.85, ky * 0.5, -kz * 0.55]}
        intensity={fillLight}
        color="#d7e3f4"
      />
      <directionalLight
        position={[-kx * 0.15, ky * 0.95, -2.6]}
        intensity={rimLight}
        color="#ffffff"
      />
      <Suspense fallback={null}>
        <Environment resolution={256} environmentIntensity={0.35 + envIntensity * 0.7}>
          <Lightformer
            intensity={1.4 * exposure}
            position={[0, 5.2, 0]}
            scale={[14, 14, 1]}
            rotation-x={Math.PI / 2}
          />
          <Lightformer
            intensity={keyLight * 0.7}
            position={[kx, ky + 0.2, kz]}
            scale={[3.6, 3.6, 1]}
            color="#fff6ea"
          />
          <Lightformer
            intensity={fillLight * 1.4}
            position={[-2.4, 1.2, 2.2]}
            scale={[2.4, 3.2, 1]}
            color="#dbe6f4"
          />
          <Lightformer
            intensity={rimLight * 1.6}
            position={[0.2, 1.4, -3.2]}
            scale={[4, 1.4, 1]}
          />
        </Environment>
      </Suspense>
    </>
  );
}

function Ground() {
  const reflection = useEditor((s) => s.reflection);
  const contactShadow = useEditor((s) => s.contactShadow);
  const fill = useEditor((s) => s.fill);

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]} receiveShadow>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial
          color={fill}
          roughness={0.92 - reflection * 0.35}
          metalness={0.04 + reflection * 0.18}
          envMapIntensity={0.35 + reflection * 0.4}
        />
      </mesh>
      <ContactShadows
        position={[0, -1.046, 0]}
        opacity={0.28 + contactShadow * 0.45}
        scale={6.5}
        blur={2.6}
        far={3.2}
        color="#161618"
      />
    </>
  );
}

function DeviceSpin() {
  const group = useRef<THREE.Group>(null);
  const rotX = useEditor((s) => s.rotX);
  const rotY = useEditor((s) => s.rotY);
  const rotZ = useEditor((s) => s.rotZ);
  const playing = useEditor((s) => s.playing);
  const playhead = useEditor((s) => s.playhead);
  const keyframes = useEditor((s) => s.keyframes);

  useFrame(() => {
    if (!group.current) return;
    if (playing) {
      const kf = interpolateAt(playhead, keyframes);
      if (kf) {
        group.current.rotation.set(kf.rotX, kf.rotY, kf.rotZ);
        group.current.position.y = 0.12;
        return;
      }
    }
    group.current.rotation.set(rotX, rotY, rotZ);
    group.current.position.y = 0.12;
  });

  return (
    <group ref={group}>
      <ActiveDevice />
    </group>
  );
}

function CaptureBinder() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    rendererRef.current = { gl, scene, camera } as never;
    return () => {
      rendererRef.current = null;
    };
  }, [gl, scene, camera]);
  return null;
}

function Post() {
  const dof = useEditor((s) => s.dof);
  if (dof < 0.05) return null;
  return (
    <EffectComposer enableNormalPass={false} multisampling={0}>
      <DepthOfField
        focusDistance={0.02}
        focalLength={0.018 + dof * 0.03}
        bokehScale={0.8 + dof * 3.5}
        height={420}
      />
    </EffectComposer>
  );
}

export function Scene() {
  return (
    <>
      <CaptureBinder />
      <Lights />
      <CameraRig />
      <DeviceSpin />
      <Ground />
      <Post />
    </>
  );
}
