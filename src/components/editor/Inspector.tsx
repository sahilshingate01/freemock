import { useRef, type ReactNode } from "react";
import {
  Camera,
  HelpCircle,
  ImagePlus,
  Info,
  LayoutGrid,
  Lightbulb,
  Smartphone,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { CAMERA_PRESETS, FILL_SWATCHES, TEMPLATES, getDevice } from "@/lib/catalog";
import { useEditor } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function Section({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 px-1 pt-1 pb-0.5 text-[11px] font-medium tracking-wide text-muted uppercase dark:text-muted-on-ink">
        <span className="[&_svg]:size-2.5">{icon}</span>
        {label}
      </div>
      {children}
    </section>
  );
}

function Row({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-md bg-black/[0.04] px-2.5 py-1.5 dark:bg-white/[0.06]">
      <div className="mb-1 flex items-center justify-between text-[12px]">
        <span className="text-fg/80 dark:text-fg-on-ink/80">{label}</span>
        {value ? (
          <span className="font-mono text-[11px] text-muted tabular-nums dark:text-muted-on-ink">
            {value}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function fmt(n: number, d = 2) {
  return n.toFixed(d).replace(/\.?0+$/, "") || "0";
}

export function Inspector() {
  const tab = useEditor((s) => s.inspectorTab);
  const setTab = useEditor((s) => s.setInspectorTab);
  const inspectorOpen = useEditor((s) => s.inspectorOpen);
  const setInspectorOpen = useEditor((s) => s.setInspectorOpen);

  return (
    <aside
      className={cn(
        "flex min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-line bg-panel dark:border-line-ink dark:bg-panel-ink",
        "md:w-[280px]",
        "max-md:fixed max-md:inset-x-3.5 max-md:bottom-3.5 max-md:z-40 max-md:max-h-[72vh]",
        "max-md:transition-transform max-md:duration-300",
        inspectorOpen ? "max-md:translate-y-0" : "max-md:translate-y-[110%]",
      )}
    >
      <div className="flex h-9 shrink-0 items-center justify-between px-2.5">
        <div className="flex items-center gap-0.5">
          {(
            [
              ["scene", <Info key="i" />, "Info"],
              ["templates", <LayoutGrid key="t" />, "Templates"],
              ["help", <HelpCircle key="h" />, "Help"],
            ] as const
          ).map(([id, icon, label]) => (
            <button
              key={id}
              type="button"
              title={label}
              onClick={() => setTab(id)}
              className={cn(
                "grid size-7 place-items-center rounded-md",
                tab === id
                  ? "bg-black/[0.06] text-fg dark:bg-white/[0.1] dark:text-fg-on-ink"
                  : "text-muted hover:bg-black/[0.04] dark:text-muted-on-ink dark:hover:bg-white/[0.06]",
              )}
            >
              <span className="[&_svg]:size-3.5">{icon}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="grid size-7 place-items-center rounded-md text-muted md:hidden"
            onClick={() => setInspectorOpen(false)}
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        {tab === "scene" ? <ScenePanel /> : null}
        {tab === "templates" ? <TemplatesPanel /> : null}
        {tab === "help" ? <HelpPanel /> : null}
      </div>
    </aside>
  );
}

function ScenePanel() {
  const shotId = useEditor((s) => s.activeShotId);
  const shots = useEditor((s) => s.shots);
  const shot = shots.find((x) => x.id === shotId) ?? shots[0]!;
  const setMedia = useEditor((s) => s.setMedia);
  const generateScene = useEditor((s) => s.generateScene);
  const setDevicePickerOpen = useEditor((s) => s.setDevicePickerOpen);
  const setColor = useEditor((s) => s.setColor);
  const fill = useEditor((s) => s.fill);
  const setFill = useEditor((s) => s.setFill);
  const lightRotation = useEditor((s) => s.lightRotation);
  const keyLight = useEditor((s) => s.keyLight);
  const keyLightHeight = useEditor((s) => s.keyLightHeight);
  const keyLightRotation = useEditor((s) => s.keyLightRotation);
  const fillLight = useEditor((s) => s.fillLight);
  const rimLight = useEditor((s) => s.rimLight);
  const contactShadow = useEditor((s) => s.contactShadow);
  const reflection = useEditor((s) => s.reflection);
  const envIntensity = useEditor((s) => s.envIntensity);
  const dof = useEditor((s) => s.dof);
  const setLight = useEditor((s) => s.setLight);
  const cameraPreset = useEditor((s) => s.cameraPreset);
  const applyPreset = useEditor((s) => s.applyPreset);
  const setCamera = useEditor((s) => s.setCamera);
  const polar = useEditor((s) => s.polar);
  const azimuth = useEditor((s) => s.azimuth);
  const distance = useEditor((s) => s.distance);
  const fov = useEditor((s) => s.fov);
  const rotX = useEditor((s) => s.rotX);
  const rotY = useEditor((s) => s.rotY);
  const rotZ = useEditor((s) => s.rotZ);
  const panX = useEditor((s) => s.panX);
  const panY = useEditor((s) => s.panY);
  const inputRef = useRef<HTMLInputElement>(null);
  const device = getDevice(shot.deviceId);

  return (
    <div className="flex flex-col gap-3">
      <Section icon={<ImagePlus />} label="Source">
        <div className="text-[12px] text-muted dark:text-muted-on-ink">
          {shot.name}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (!file || !file.type.startsWith("image/")) return;
            const reader = new FileReader();
            reader.onload = () => setMedia(String(reader.result));
            reader.readAsDataURL(file);
          }}
          className="flex h-[72px] w-full flex-col items-center justify-center gap-0.5 rounded-md border border-dashed border-line bg-black/[0.03] text-[12px] text-muted hover:bg-black/[0.05] dark:border-line-ink dark:bg-white/[0.04] dark:text-muted-on-ink dark:hover:bg-white/[0.07]"
        >
          <span className="font-medium text-fg dark:text-fg-on-ink">
            Click to upload
          </span>
          <span>Drag & drop or paste</span>
        </button>
        <Button
          size="sm"
          variant="secondary"
          className="w-full"
          onClick={() => {
            generateScene();
            toast.success("Scene generated — play the timeline or export video");
          }}
        >
          Generate scene
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => setMedia(String(reader.result));
            reader.readAsDataURL(file);
            e.target.value = "";
          }}
        />
      </Section>

      <Section icon={<Smartphone />} label="Mockup">
        <div className="flex items-center justify-between rounded-md bg-black/[0.04] px-2.5 py-2 dark:bg-white/[0.06]">
          <div>
            <div className="text-[13px] font-medium">{device.name}</div>
            <div className="text-[11px] text-muted tabular-nums dark:text-muted-on-ink">
              {device.pixels[0].toLocaleString()} × {device.pixels[1].toLocaleString()}
            </div>
          </div>
          <Button
            size="xs"
            variant="secondary"
            onClick={() => setDevicePickerOpen(true)}
          >
            Change
          </Button>
        </div>
        <div className="mb-1 text-[12px] text-muted dark:text-muted-on-ink">
          Finish
        </div>
        <div className="flex flex-wrap gap-1.5">
          {device.colors.map((c) => (
            <button
              key={c.id}
              type="button"
              title={c.name}
              onClick={() => setColor(c.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px]",
                shot.colorId === c.id
                  ? "bg-black/[0.08] dark:bg-white/[0.12]"
                  : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
              )}
            >
              <span
                className="size-3 rounded-full border border-line dark:border-line-ink"
                style={{ background: c.body }}
              />
              {c.name}
            </button>
          ))}
        </div>
      </Section>

      <Section icon={<span className="block size-2 rounded-[1.5px] bg-current" />} label="Fill">
        <div className="grid grid-cols-8 gap-1.5 px-0.5">
          {FILL_SWATCHES.map((sw) => (
            <button
              key={sw.id}
              type="button"
              title={sw.name}
              onClick={() => setFill(sw.value)}
              className={cn(
                "aspect-square rounded-md border",
                fill.toLowerCase() === sw.value
                  ? "border-fg dark:border-fg-on-ink"
                  : "border-line dark:border-line-ink",
              )}
              style={{ background: sw.value }}
            />
          ))}
        </div>
      </Section>

      <Section icon={<Lightbulb />} label="Light">
        <Row label="Light Rotation" value={fmt(lightRotation)}>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[lightRotation]}
            onValueChange={([v]) => setLight({ lightRotation: v ?? 0 })}
          />
        </Row>
        <Row label="Key Light" value={fmt(keyLight)}>
          <Slider
            min={0}
            max={4}
            step={0.05}
            value={[keyLight]}
            onValueChange={([v]) => setLight({ keyLight: v ?? 0 })}
          />
        </Row>
        <Row label="Key Light Height" value={fmt(keyLightHeight)}>
          <Slider
            min={0}
            max={2}
            step={0.02}
            value={[keyLightHeight]}
            onValueChange={([v]) => setLight({ keyLightHeight: v ?? 0 })}
          />
        </Row>
        <Row label="Key Light Rotation" value={fmt(keyLightRotation)}>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[keyLightRotation]}
            onValueChange={([v]) => setLight({ keyLightRotation: v ?? 0 })}
          />
        </Row>
        <Row label="Fill Light" value={fmt(fillLight)}>
          <Slider
            min={0}
            max={2}
            step={0.02}
            value={[fillLight]}
            onValueChange={([v]) => setLight({ fillLight: v ?? 0 })}
          />
        </Row>
        <Row label="Rim Light" value={fmt(rimLight)}>
          <Slider
            min={0}
            max={2}
            step={0.02}
            value={[rimLight]}
            onValueChange={([v]) => setLight({ rimLight: v ?? 0 })}
          />
        </Row>
        <Row label="Contact Shadow" value={fmt(contactShadow)}>
          <Slider
            min={0}
            max={1}
            step={0.02}
            value={[contactShadow]}
            onValueChange={([v]) => setLight({ contactShadow: v ?? 0 })}
          />
        </Row>
        <Row label="Reflection" value={fmt(reflection)}>
          <Slider
            min={0}
            max={1}
            step={0.02}
            value={[reflection]}
            onValueChange={([v]) => setLight({ reflection: v ?? 0 })}
          />
        </Row>
        <Row label="Environment" value={fmt(envIntensity)}>
          <Slider
            min={0}
            max={2}
            step={0.02}
            value={[envIntensity]}
            onValueChange={([v]) => setLight({ envIntensity: v ?? 0 })}
          />
        </Row>
        <Row label="Depth of Field" value={fmt(dof)}>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[dof]}
            onValueChange={([v]) => setLight({ dof: v ?? 0 })}
          />
        </Row>
      </Section>

      <Section icon={<Camera />} label="Camera">
        <div className="flex rounded-md bg-black/[0.04] p-0.5 dark:bg-white/[0.06]">
          <span
            className={cn(
              "flex-1 rounded-[6px] py-1 text-center text-[12px]",
              cameraPreset === "manual"
                ? "bg-chrome shadow-sm dark:bg-chrome-ink"
                : "text-muted dark:text-muted-on-ink",
            )}
          >
            Manual
          </span>
          <span
            className={cn(
              "flex-1 rounded-[6px] py-1 text-center text-[12px]",
              cameraPreset !== "manual"
                ? "bg-chrome shadow-sm dark:bg-chrome-ink"
                : "text-muted dark:text-muted-on-ink",
            )}
          >
            Presets
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {CAMERA_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className={cn(
                "h-7 rounded-md text-[12px]",
                cameraPreset === p.id
                  ? "bg-fg text-accent-fg dark:bg-fg-on-ink dark:text-studio-ink"
                  : "bg-black/[0.04] hover:bg-black/[0.07] dark:bg-white/[0.06] dark:hover:bg-white/[0.1]",
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
        <Row label="Tilt X" value={fmt(polar)}>
          <Slider
            min={0.2}
            max={1.7}
            step={0.01}
            value={[polar]}
            onValueChange={([v]) => setCamera({ polar: v ?? 1.1 })}
          />
        </Row>
        <Row label="Tilt Y" value={fmt(azimuth)}>
          <Slider
            min={-3.14}
            max={3.14}
            step={0.01}
            value={[azimuth]}
            onValueChange={([v]) => setCamera({ azimuth: v ?? 0 })}
          />
        </Row>
        <Row label="FOV" value={`${Math.round(fov)}°`}>
          <Slider
            min={18}
            max={55}
            step={1}
            value={[fov]}
            onValueChange={([v]) => setCamera({ fov: v ?? 28 })}
          />
        </Row>
        <Row label="Zoom" value={fmt(distance)}>
          <Slider
            min={0.8}
            max={4}
            step={0.01}
            value={[distance]}
            onValueChange={([v]) => setCamera({ distance: v ?? 1.8 })}
          />
        </Row>
        <Row label="Pan X" value={fmt(panX)}>
          <Slider
            min={-1.2}
            max={1.2}
            step={0.01}
            value={[panX]}
            onValueChange={([v]) => setCamera({ panX: v ?? 0 })}
          />
        </Row>
        <Row label="Pan Y" value={fmt(panY)}>
          <Slider
            min={-1}
            max={1}
            step={0.01}
            value={[panY]}
            onValueChange={([v]) => setCamera({ panY: v ?? 0 })}
          />
        </Row>
        <Row label="Roll" value={fmt(rotZ)}>
          <Slider
            min={-0.6}
            max={0.6}
            step={0.01}
            value={[rotZ]}
            onValueChange={([v]) => setCamera({ rotZ: v ?? 0 })}
          />
        </Row>
        <Row label="Rotate X" value={fmt(rotX)}>
          <Slider
            min={-0.8}
            max={0.8}
            step={0.01}
            value={[rotX]}
            onValueChange={([v]) => setCamera({ rotX: v ?? 0 })}
          />
        </Row>
        <Row label="Rotate Y" value={fmt(rotY)}>
          <Slider
            min={-3.14}
            max={3.14}
            step={0.01}
            value={[rotY]}
            onValueChange={([v]) => setCamera({ rotY: v ?? 0 })}
          />
        </Row>
        <Row label="Blur" value={fmt(dof)}>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[dof]}
            onValueChange={([v]) => setLight({ dof: v ?? 0 })}
          />
        </Row>
      </Section>
    </div>
  );
}

function TemplatesPanel() {
  const applyTemplate = useEditor((s) => s.applyTemplate);
  return (
    <div className="grid grid-cols-1 gap-2">
      {TEMPLATES.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => applyTemplate(t)}
          className="group overflow-hidden rounded-xl border border-line text-left dark:border-line-ink"
        >
          <div className="relative aspect-[16/10] overflow-hidden bg-black/[0.04]">
            <img
              src={t.mediaUrl}
              alt=""
              className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </div>
          <div className="px-2.5 py-2">
            <div className="text-[13px] font-medium">{t.name}</div>
            <div className="text-[11px] text-muted dark:text-muted-on-ink">
              {t.blurb}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function HelpPanel() {
  const playing = useEditor((s) => s.playing);
  return (
    <div className="space-y-3 pt-1 text-[13px] leading-relaxed text-muted dark:text-muted-on-ink">
      <p className="text-fg dark:text-fg-on-ink">
        Turn product screens into premium visuals.
      </p>
      <ul className="space-y-1.5">
        <li>Drag in the canvas to orbit the camera.</li>
        <li>Scroll to zoom. Drop a PNG or JPG onto the device.</li>
        <li>Paste from the clipboard to replace the screen.</li>
        <li>Hold Alt while dropping to add a new shot.</li>
        <li>Space plays the timeline. K records a keyframe.</li>
      </ul>
      <p>
        Free exports — PNG stills and video, no limits.
      </p>
      <p className="text-[11px]">Playback {playing ? "running" : "idle"}.</p>
    </div>
  );
}

export function InspectorToggle() {
  const open = useEditor((s) => s.inspectorOpen);
  const setOpen = useEditor((s) => s.setInspectorOpen);
  return (
    <button
      type="button"
      className="fixed right-4 bottom-4 z-30 grid size-11 place-items-center rounded-full bg-fg text-accent-fg shadow-chrome md:hidden dark:bg-fg-on-ink dark:text-studio-ink"
      onClick={() => setOpen(!open)}
    >
      <Info className="size-4" />
      <span className="sr-only">Inspector</span>
    </button>
  );
}

export function DeviceLockRow() {
  const dof = useEditor((s) => s.dof);
  const setLight = useEditor((s) => s.setLight);
  return (
    <div className="flex items-center justify-between px-1 text-[12px] text-muted">
      <span>Cinematic blur</span>
      <Switch
        checked={dof > 0.04}
        onCheckedChange={(v) => setLight({ dof: v ? 0.22 : 0 })}
      />
    </div>
  );
}
