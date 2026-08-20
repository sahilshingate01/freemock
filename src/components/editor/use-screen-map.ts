import { useEffect, useState } from "react";
import * as THREE from "three";

const cache = new Map<string, THREE.Texture>();

export function useScreenMap(url: string): THREE.Texture | null {
  const [map, setMap] = useState<THREE.Texture | null>(() => cache.get(url) ?? null);

  useEffect(() => {
    const hit = cache.get(url);
    if (hit) {
      setMap(hit);
      return;
    }
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    if (/^https?:/i.test(url)) loader.setCrossOrigin("anonymous");
    loader.load(
      url,
      (tex) => {
        if (cancelled) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.needsUpdate = true;
        cache.set(url, tex);
        setMap(tex);
      },
      undefined,
      () => {
        if (!cancelled) setMap(null);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [url]);

  return map;
}
