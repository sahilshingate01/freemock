import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CAMERA_PRESETS,
  type CameraPresetId,
  type DeviceId,
  type Keyframe,
  type Shot,
  type Template,
  defaultKeyframes,
  defaultShot,
  getDevice,
  uid,
} from "./catalog";

export type InspectorTab = "scene" | "templates" | "help";

type EditorState = {
  darkMode: boolean;
  inspectorTab: InspectorTab;
  inspectorOpen: boolean;
  devicePickerOpen: boolean;
  upgradeOpen: boolean;
  exportOpen: boolean;
  capturesLeft: number;
  hintDismissed: boolean;
  firstDeviceReady: boolean;

  fill: string;
  lightRotation: number;
  keyLight: number;
  keyLightHeight: number;
  keyLightRotation: number;
  fillLight: number;
  rimLight: number;
  contactShadow: number;
  reflection: number;
  envIntensity: number;
  dof: number;
  exposure: number;

  polar: number;
  azimuth: number;
  distance: number;
  fov: number;
  cameraPreset: CameraPresetId | "manual";
  rotX: number;
  rotY: number;
  rotZ: number;
  panX: number;
  panY: number;
  exporting: boolean;

  shots: Shot[];
  activeShotId: string;
  playhead: number;
  playing: boolean;
  keyframes: Keyframe[];

  setDarkMode: (v: boolean) => void;
  setInspectorTab: (t: InspectorTab) => void;
  setInspectorOpen: (v: boolean) => void;
  setDevicePickerOpen: (v: boolean) => void;
  setUpgradeOpen: (v: boolean) => void;
  setExportOpen: (v: boolean) => void;
  dismissHint: () => void;
  setFirstDeviceReady: (v?: boolean) => void;
  consumeCapture: () => boolean;

  setFill: (v: string) => void;
  setLight: (patch: Partial<Pick<
    EditorState,
    | "lightRotation"
    | "keyLight"
    | "keyLightHeight"
    | "keyLightRotation"
    | "fillLight"
    | "rimLight"
    | "contactShadow"
    | "reflection"
    | "envIntensity"
    | "dof"
    | "exposure"
  >>) => void;

  setCamera: (patch: Partial<Pick<
    EditorState,
    "polar" | "azimuth" | "distance" | "fov" | "rotX" | "rotY" | "rotZ" | "panX" | "panY"
  >>) => void;
  applyPreset: (id: CameraPresetId) => void;
  generateScene: () => void;
  setExporting: (v: boolean) => void;

  activeShot: () => Shot;
  setActiveShot: (id: string) => void;
  updateShot: (id: string, patch: Partial<Shot>) => void;
  addShot: (mediaUrl?: string) => void;
  removeShot: (id: string) => void;
  setMedia: (url: string) => void;
  setDevice: (id: DeviceId) => void;
  setColor: (id: string) => void;

  setPlayhead: (t: number) => void;
  togglePlaying: () => void;
  setPlaying: (v: boolean) => void;
  addKeyframe: () => void;
  removeKeyframe: (id: string) => void;
  totalDuration: () => number;

  applyTemplate: (t: Template) => void;
  resetProject: () => void;
};

function firstShot(): Shot {
  return defaultShot();
}

const initialShot = firstShot();

export const useEditor = create<EditorState>()(
  persist(
    (set, get) => ({
      darkMode: false,
      inspectorTab: "scene",
      inspectorOpen: true,
      devicePickerOpen: false,
      upgradeOpen: false,
      exportOpen: false,
      capturesLeft: 24,
      hintDismissed: false,
      firstDeviceReady: false,

      fill: "#e0e0e0",
      lightRotation: 0.4,
      keyLight: 2.1,
      keyLightHeight: 1.4,
      keyLightRotation: 0.55,
      fillLight: 0.45,
      rimLight: 0.55,
      contactShadow: 0.7,
      reflection: 0.28,
      envIntensity: 0.7,
      dof: 0,
      exposure: 1.05,

      polar: 1.22,
      azimuth: 0.62,
      distance: 2.85,
      fov: 32,
      cameraPreset: "hero",
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      panX: 0,
      panY: 0,
      exporting: false,

      shots: [initialShot],
      activeShotId: initialShot.id,
      playhead: 0,
      playing: false,
      keyframes: defaultKeyframes(),

      setDarkMode: (v) => {
        set({ darkMode: v });
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", v);
        }
      },
      setInspectorTab: (t) => set({ inspectorTab: t, inspectorOpen: true }),
      setInspectorOpen: (v) => set({ inspectorOpen: v }),
      setDevicePickerOpen: (v) => set({ devicePickerOpen: v }),
      setUpgradeOpen: (v) => set({ upgradeOpen: v }),
      setExportOpen: (v) => set({ exportOpen: v }),
      dismissHint: () => set({ hintDismissed: true }),
      setFirstDeviceReady: (v = true) => set({ firstDeviceReady: v }),
      consumeCapture: () => true,

      setFill: (v) => set({ fill: v }),
      setLight: (patch) => set(patch),
      setCamera: (patch) => set({ ...patch, cameraPreset: "manual" }),
      applyPreset: (id) => {
        const p = CAMERA_PRESETS.find((c) => c.id === id);
        if (!p) return;
        set({
          cameraPreset: id,
          polar: p.polar,
          azimuth: p.azimuth,
          distance: p.distance,
          fov: p.fov,
        });
      },
      setExporting: (v) => set({ exporting: v }),
      generateScene: () => {
        const s = get();
        const kfs: Keyframe[] = [
          {
            id: uid("kf"),
            time: 0,
            polar: s.polar,
            azimuth: s.azimuth,
            distance: s.distance,
            fov: s.fov,
            rotX: s.rotX,
            rotY: s.rotY,
            rotZ: s.rotZ,
          },
          {
            id: uid("kf"),
            time: 2.4,
            polar: Math.max(0.45, s.polar - 0.12),
            azimuth: s.azimuth + 0.72,
            distance: s.distance + 0.18,
            fov: s.fov,
            rotX: s.rotX + 0.04,
            rotY: s.rotY + 0.18,
            rotZ: s.rotZ,
          },
          {
            id: uid("kf"),
            time: 5.2,
            polar: Math.min(1.55, s.polar + 0.08),
            azimuth: s.azimuth - 0.55,
            distance: Math.max(1.6, s.distance - 0.15),
            fov: s.fov - 1,
            rotX: s.rotX,
            rotY: s.rotY - 0.1,
            rotZ: s.rotZ,
          },
        ];
        set({
          keyframes: kfs,
          playhead: 0,
          playing: false,
        });
      },

      activeShot: () => {
        const s = get();
        return s.shots.find((x) => x.id === s.activeShotId) ?? s.shots[0]!;
      },
      setActiveShot: (id) => set({ activeShotId: id }),
      updateShot: (id, patch) =>
        set({
          shots: get().shots.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        }),
      addShot: (mediaUrl) => {
        const n = get().shots.length + 1;
        const prev = get().activeShot();
        const shot: Shot = {
          id: uid("shot"),
          name: `Shot ${n}`,
          mediaUrl: mediaUrl ?? prev.mediaUrl,
          deviceId: prev.deviceId,
          colorId: prev.colorId,
          duration: 4,
        };
        set({ shots: [...get().shots, shot], activeShotId: shot.id });
      },
      removeShot: (id) => {
        const shots = get().shots.filter((s) => s.id !== id);
        if (shots.length === 0) return;
        const active =
          get().activeShotId === id ? shots[0]!.id : get().activeShotId;
        set({ shots, activeShotId: active });
      },
      setMedia: (url) => {
        const id = get().activeShotId;
        set({
          shots: get().shots.map((s) =>
            s.id === id ? { ...s, mediaUrl: url } : s,
          ),
        });
      },
      setDevice: (id) => {
        const def = getDevice(id);
        const shot = get().activeShot();
        const color =
          def.colors.find((c) => c.id === shot.colorId) ?? def.colors[0]!;
        get().updateShot(shot.id, { deviceId: id, colorId: color.id });
      },
      setColor: (id) => get().updateShot(get().activeShotId, { colorId: id }),

      setPlayhead: (t) => set({ playhead: Math.max(0, t) }),
      togglePlaying: () => set({ playing: !get().playing }),
      setPlaying: (v) => set({ playing: v }),
      addKeyframe: () => {
        const s = get();
        const kf: Keyframe = {
          id: uid("kf"),
          time: s.playhead,
          polar: s.polar,
          azimuth: s.azimuth,
          distance: s.distance,
          fov: s.fov,
          rotX: s.rotX,
          rotY: s.rotY,
          rotZ: s.rotZ,
        };
        set({
          keyframes: [...s.keyframes, kf].sort((a, b) => a.time - b.time),
        });
      },
      removeKeyframe: (id) =>
        set({ keyframes: get().keyframes.filter((k) => k.id !== id) }),
      totalDuration: () =>
        Math.max(
          4,
          get().shots.reduce((a, s) => a + s.duration, 0),
          ...get().keyframes.map((k) => k.time),
        ),

      applyTemplate: (t) => {
        const shot = get().activeShot();
        get().updateShot(shot.id, {
          deviceId: t.deviceId,
          colorId: t.colorId,
          mediaUrl: t.mediaUrl,
        });
        set({
          fill: t.fill,
          polar: t.polar,
          azimuth: t.azimuth,
          distance: t.distance,
          fov: t.fov,
          keyLight: t.keyLight,
          keyLightHeight: t.keyLightHeight,
          keyLightRotation: t.keyLightRotation,
          lightRotation: t.lightRotation,
          contactShadow: t.contactShadow,
          reflection: t.reflection,
          dof: t.dof,
          envIntensity: t.envIntensity,
          cameraPreset: "manual",
          inspectorTab: "scene",
        });
        get().generateScene();
      },
      resetProject: () => {
        const shot = defaultShot();
        set({
          shots: [shot],
          activeShotId: shot.id,
          keyframes: defaultKeyframes(),
          playhead: 0,
          playing: false,
        });
      },
    }),
    {
      name: "freemock-project-v1",
      partialize: (s) => ({
        darkMode: s.darkMode,
        fill: s.fill,
        lightRotation: s.lightRotation,
        keyLight: s.keyLight,
        keyLightHeight: s.keyLightHeight,
        keyLightRotation: s.keyLightRotation,
        fillLight: s.fillLight,
        rimLight: s.rimLight,
        contactShadow: s.contactShadow,
        reflection: s.reflection,
        envIntensity: s.envIntensity,
        dof: s.dof,
        exposure: s.exposure,
        polar: s.polar,
        azimuth: s.azimuth,
        distance: s.distance,
        fov: s.fov,
        cameraPreset: s.cameraPreset,
        rotX: s.rotX,
        rotY: s.rotY,
        rotZ: s.rotZ,
        panX: s.panX,
        panY: s.panY,
        shots: s.shots.map((shot) =>
          shot.mediaUrl.startsWith("data:")
            ? { ...shot, mediaUrl: "/screens/aurora.jpg" }
            : shot,
        ),
        activeShotId: s.activeShotId,
        keyframes: s.keyframes,
        capturesLeft: s.capturesLeft,
        hintDismissed: s.hintDismissed,
      }),
    },
  ),
);

export function interpolateAt(time: number, frames: Keyframe[]): Keyframe | null {
  if (frames.length === 0) return null;
  const sorted = [...frames].sort((a, b) => a.time - b.time);
  if (time <= sorted[0]!.time) return sorted[0]!;
  const last = sorted[sorted.length - 1]!;
  if (time >= last.time) return last;
  let a = sorted[0]!;
  let b = sorted[1]!;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (time >= sorted[i]!.time && time <= sorted[i + 1]!.time) {
      a = sorted[i]!;
      b = sorted[i + 1]!;
      break;
    }
  }
  const span = b.time - a.time || 1;
  const t = easeInOut((time - a.time) / span);
  return {
    id: "lerp",
    time,
    polar: lerp(a.polar, b.polar, t),
    azimuth: lerp(a.azimuth, b.azimuth, t),
    distance: lerp(a.distance, b.distance, t),
    fov: lerp(a.fov, b.fov, t),
    rotX: lerp(a.rotX, b.rotX, t),
    rotY: lerp(a.rotY, b.rotY, t),
    rotZ: lerp(a.rotZ, b.rotZ, t),
  };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
