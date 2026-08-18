import { Canvas } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Scene } from "./Scene";
import { useEditor } from "@/lib/store";
import { cn } from "@/lib/utils";

function readFiles(files: FileList | File[] | null): Promise<string | null> {
  const file = files?.[0];
  if (!file || !file.type.startsWith("image/")) return Promise.resolve(null);
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export function Viewport() {
  const setMedia = useEditor((s) => s.setMedia);
  const addShot = useEditor((s) => s.addShot);
  const hintDismissed = useEditor((s) => s.hintDismissed);
  const dismissHint = useEditor((s) => s.dismissHint);
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const apply = useCallback(
    async (files: FileList | File[] | null, asNewShot = false) => {
      const url = await readFiles(files);
      if (!url) return;
      if (asNewShot) addShot(url);
      else setMedia(url);
    },
    [addShot, setMedia],
  );

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.files;
      if (items && items.length) void apply(items);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [apply]);

  return (
    <div
      className={cn(
        "relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-line bg-panel dark:border-line-ink dark:bg-panel-ink",
        over && "ring-2 ring-fg/30 dark:ring-fg-on-ink/30",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const asNew = e.altKey;
        void apply(e.dataTransfer.files, asNew);
      }}
    >
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{
          antialias: true,
          preserveDrawingBuffer: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        camera={{ position: [1.55, 1.0, 2.18], fov: 32, near: 0.05, far: 20 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void apply(e.target.files);
          e.target.value = "";
        }}
      />

      {over ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-fg/20 text-sm font-medium text-accent-fg">
          Drop to replace screen
        </div>
      ) : null}

      {!hintDismissed ? (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-line bg-chrome/80 px-3 py-2 text-xs text-muted shadow-chrome backdrop-blur-md dark:border-line-ink dark:bg-chrome-ink/80 dark:text-muted-on-ink">
          <span>Drag to orbit · Scroll to zoom · Drop a screenshot</span>
          <button
            type="button"
            className="text-fg dark:text-fg-on-ink"
            onClick={dismissHint}
          >
            Don't show again
          </button>
        </div>
      ) : null}
    </div>
  );
}
