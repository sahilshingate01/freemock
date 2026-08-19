import * as THREE from "three";
import { type DeviceId, DEVICE_COLORS, DEVICE_MODELS, getDevice } from "@/lib/catalog";
import { GltfDevice } from "./gltf-devices";

type DeviceProps = {
  deviceId: DeviceId;
  colorId: string;
  map: THREE.Texture | null;
};

export function DeviceModel({ deviceId, colorId, map }: DeviceProps) {
  const def = getDevice(deviceId);
  const color =
    def.colors.find((c) => c.id === colorId) ??
    DEVICE_COLORS[colorId] ??
    def.colors[0]!;
  const model = DEVICE_MODELS[deviceId] ?? DEVICE_MODELS["iphone-17"];
  return (
    <GltfDevice
      url={model.url}
      map={map}
      height={model.height}
      color={color.body}
    />
  );
}
