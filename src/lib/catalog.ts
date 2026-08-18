export type DeviceId =
  | "iphone-17"
  | "iphone-17-pro"
  | "ipad-pro"
  | "macbook-neo"
  | "macbook-pro"
  | "watch-ultra";

export type DeviceKind = "phone" | "tablet" | "laptop" | "watch";

export type DeviceColor = {
  id: string;
  name: string;
  body: string;
  metal: string;
  glass: string;
};

export type DeviceDef = {
  id: DeviceId;
  name: string;
  kind: DeviceKind;
  pixels: [number, number];
  colors: DeviceColor[];
};

export const DEVICE_COLORS: Record<string, DeviceColor> = {
  white: {
    id: "white",
    name: "White",
    body: "#f3f3f5",
    metal: "#c8c8cc",
    glass: "#111113",
  },
  black: {
    id: "black",
    name: "Black",
    body: "#1c1c1e",
    metal: "#3f3f46",
    glass: "#050505",
  },
  natural: {
    id: "natural",
    name: "Natural",
    body: "#c7b9a5",
    metal: "#9c9182",
    glass: "#1a1814",
  },
  blue: {
    id: "blue",
    name: "Blue",
    body: "#2a3648",
    metal: "#4b5870",
    glass: "#0b0e14",
  },
  space: {
    id: "space",
    name: "Space Grey",
    body: "#4a4a4d",
    metal: "#6b6b70",
    glass: "#111113",
  },
  orange: {
    id: "orange",
    name: "Orange",
    body: "#d95a18",
    metal: "#8a3a12",
    glass: "#14110e",
  },
  mistBlue: {
    id: "mistBlue",
    name: "Mist Blue",
    body: "#8aa3b8",
    metal: "#c8c8cc",
    glass: "#111113",
  },
  sage: {
    id: "sage",
    name: "Sage",
    body: "#8a9a86",
    metal: "#c8c8cc",
    glass: "#111113",
  },
  lavender: {
    id: "lavender",
    name: "Lavender",
    body: "#b7a4c4",
    metal: "#c8c8cc",
    glass: "#111113",
  },
  silver: {
    id: "silver",
    name: "Silver",
    body: "#c9cdd3",
    metal: "#d5d8de",
    glass: "#111113",
  },
  blush: {
    id: "blush",
    name: "Blush",
    body: "#e3b8b2",
    metal: "#d5d8de",
    glass: "#111113",
  },
  citrus: {
    id: "citrus",
    name: "Citrus",
    body: "#e0c56a",
    metal: "#d5d8de",
    glass: "#111113",
  },
  indigo: {
    id: "indigo",
    name: "Indigo",
    body: "#3a3f6b",
    metal: "#4a5078",
    glass: "#111113",
  },
};

export const DEVICES: DeviceDef[] = [
  {
    id: "iphone-17",
    name: "iPhone 17",
    kind: "phone",
    pixels: [1206, 2622],
    colors: [
      DEVICE_COLORS.white,
      DEVICE_COLORS.black,
      DEVICE_COLORS.mistBlue,
      DEVICE_COLORS.sage,
      DEVICE_COLORS.lavender,
    ],
  },
  {
    id: "iphone-17-pro",
    name: "iPhone 17 Pro",
    kind: "phone",
    pixels: [1206, 2622],
    colors: [DEVICE_COLORS.natural, DEVICE_COLORS.black, DEVICE_COLORS.white],
  },
  {
    id: "ipad-pro",
    name: "iPad Pro",
    kind: "tablet",
    pixels: [2064, 2752],
    colors: [DEVICE_COLORS.space, DEVICE_COLORS.white],
  },
  {
    id: "macbook-neo",
    name: "MacBook Neo",
    kind: "laptop",
    pixels: [3024, 1964],
    colors: [DEVICE_COLORS.silver, DEVICE_COLORS.blush, DEVICE_COLORS.citrus, DEVICE_COLORS.indigo],
  },
  {
    id: "macbook-pro",
    name: "MacBook Pro",
    kind: "laptop",
    pixels: [3456, 2234],
    colors: [DEVICE_COLORS.space, DEVICE_COLORS.black],
  },
  {
    id: "watch-ultra",
    name: "Watch Ultra",
    kind: "watch",
    pixels: [410, 502],
    colors: [DEVICE_COLORS.orange, DEVICE_COLORS.natural, DEVICE_COLORS.black],
  },
];

export function getDevice(id: DeviceId): DeviceDef {
  return DEVICES.find((d) => d.id === id) ?? DEVICES[0]!;
}

export const FILL_SWATCHES = [
  { id: "studio", name: "Studio", value: "#e0e0e0" },
  { id: "paper", name: "Paper", value: "#f5f5f4" },
  { id: "cream", name: "Cream", value: "#efe6d6" },
  { id: "sand", name: "Sand", value: "#d6c7b0" },
  { id: "fog", name: "Fog", value: "#cbd5e1" },
  { id: "charcoal", name: "Charcoal", value: "#1a1a1c" },
  { id: "ink", name: "Ink", value: "#0a0a0b" },
  { id: "midnight", name: "Midnight", value: "#111827" },
] as const;

export const CAMERA_PRESETS = [
  { id: "hero", name: "Hero", polar: 1.22, azimuth: 0.62, distance: 2.85, fov: 32 },
  { id: "front", name: "Front", polar: 1.48, azimuth: 0.02, distance: 2.7, fov: 30 },
  { id: "three-quarter", name: "3/4", polar: 1.2, azimuth: 0.78, distance: 3.0, fov: 32 },
  { id: "macro", name: "Macro", polar: 1.32, azimuth: 0.32, distance: 1.85, fov: 34 },
  { id: "top", name: "Top", polar: 0.55, azimuth: 0.18, distance: 3.1, fov: 32 },
  { id: "low", name: "Low", polar: 1.62, azimuth: 0.5, distance: 2.75, fov: 32 },
] as const;

export type CameraPresetId = (typeof CAMERA_PRESETS)[number]["id"];

export type Shot = {
  id: string;
  name: string;
  mediaUrl: string;
  deviceId: DeviceId;
  colorId: string;
  duration: number;
};

export type Keyframe = {
  id: string;
  time: number;
  polar: number;
  azimuth: number;
  distance: number;
  fov: number;
  rotX: number;
  rotY: number;
  rotZ: number;
};

export type Template = {
  id: string;
  name: string;
  blurb: string;
  deviceId: DeviceId;
  colorId: string;
  mediaUrl: string;
  fill: string;
  polar: number;
  azimuth: number;
  distance: number;
  fov: number;
  keyLight: number;
  keyLightHeight: number;
  keyLightRotation: number;
  lightRotation: number;
  contactShadow: number;
  reflection: number;
  dof: number;
  envIntensity: number;
};

export const SCREENS = {
  aurora: "/screens/aurora.jpg",
  pulse: "/screens/pulse.jpg",
  ledger: "/screens/ledger.jpg",
  studio: "/screens/studio.jpg",
  watch: "/screens/watch.jpg",
} as const;

export const TEMPLATES: Template[] = [
  {
    id: "aurora-hero",
    name: "Aurora hero",
    blurb: "Crispy iPhone close-up",
    deviceId: "iphone-17",
    colorId: "white",
    mediaUrl: SCREENS.aurora,
    fill: "#e0e0e0",
    polar: 1.22,
    azimuth: 0.62,
    distance: 2.85,
    fov: 32,
    keyLight: 2.1,
    keyLightHeight: 1.4,
    keyLightRotation: 0.55,
    lightRotation: 0.4,
    contactShadow: 0.7,
    reflection: 0.28,
    dof: 0.08,
    envIntensity: 0.7,
  },
  {
    id: "pulse-macro",
    name: "Pulse macro",
    blurb: "Dark fitness close-up",
    deviceId: "iphone-17-pro",
    colorId: "black",
    mediaUrl: SCREENS.pulse,
    fill: "#0a0a0b",
    polar: 1.28,
    azimuth: 0.36,
    distance: 2.05,
    fov: 34,
    keyLight: 1.6,
    keyLightHeight: 1.1,
    keyLightRotation: 0.8,
    lightRotation: 0.7,
    contactShadow: 0.35,
    reflection: 0.12,
    dof: 0.22,
    envIntensity: 0.35,
  },
  {
    id: "ledger-desk",
    name: "Ledger desk",
    blurb: "Space grey MacBook showcase",
    deviceId: "macbook-neo",
    colorId: "space",
    mediaUrl: SCREENS.ledger,
    fill: "#e0e0e0",
    polar: 1.08,
    azimuth: 0.44,
    distance: 3.35,
    fov: 32,
    keyLight: 1.9,
    keyLightHeight: 1.6,
    keyLightRotation: 0.35,
    lightRotation: 0.25,
    contactShadow: 0.85,
    reflection: 0.4,
    dof: 0.06,
    envIntensity: 0.85,
  },
  {
    id: "studio-editorial",
    name: "Studio editorial",
    blurb: "iPad magazine spread",
    deviceId: "ipad-pro",
    colorId: "space",
    mediaUrl: SCREENS.studio,
    fill: "#e0e0e0",
    polar: 1.22,
    azimuth: 0.5,
    distance: 3.05,
    fov: 30,
    keyLight: 1.85,
    keyLightHeight: 1.35,
    keyLightRotation: 0.5,
    lightRotation: 0.3,
    contactShadow: 0.6,
    reflection: 0.22,
    dof: 0.08,
    envIntensity: 0.75,
  },
  {
    id: "watch-ultra",
    name: "Watch Ultra",
    blurb: "Apple Watch Ultra macro",
    deviceId: "watch-ultra",
    colorId: "orange",
    mediaUrl: SCREENS.watch,
    fill: "#14110e",
    polar: 1.24,
    azimuth: 0.42,
    distance: 1.65,
    fov: 34,
    keyLight: 1.7,
    keyLightHeight: 1.2,
    keyLightRotation: 0.7,
    lightRotation: 0.55,
    contactShadow: 0.45,
    reflection: 0.08,
    dof: 0.18,
    envIntensity: 0.4,
  },
  {
    id: "front-white",
    name: "Front white",
    blurb: "Clean product still",
    deviceId: "iphone-17",
    colorId: "white",
    mediaUrl: SCREENS.aurora,
    fill: "#f5f5f4",
    polar: 1.48,
    azimuth: 0.02,
    distance: 2.7,
    fov: 30,
    keyLight: 2.2,
    keyLightHeight: 1.5,
    keyLightRotation: 0.2,
    lightRotation: 0.15,
    contactShadow: 0.55,
    reflection: 0.18,
    dof: 0.04,
    envIntensity: 0.9,
  },
];

export function uid(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function defaultShot(): Shot {
  return {
    id: uid("shot"),
    name: "Shot 1",
    mediaUrl: SCREENS.aurora,
    deviceId: "iphone-17",
    colorId: "white",
    duration: 4,
  };
}

export function defaultKeyframes(): Keyframe[] {
  return [
    {
      id: uid("kf"),
      time: 0,
      polar: 1.22,
      azimuth: 0.62,
      distance: 2.85,
      fov: 32,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
    },
    {
      id: uid("kf"),
      time: 4,
      polar: 1.16,
      azimuth: -0.52,
      distance: 3.05,
      fov: 32,
      rotX: 0.04,
      rotY: 0.12,
      rotZ: 0,
    },
  ];
}
