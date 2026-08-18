import { useState } from "react";
import { Image as ImageIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DEVICES, getDevice } from "@/lib/catalog";
import { rendererRef } from "@/lib/renderer-ref";
import { useEditor } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function DevicePicker() {
  const open = useEditor((s) => s.devicePickerOpen);
  const setOpen = useEditor((s) => s.setDevicePickerOpen);
  const shotId = useEditor((s) => s.activeShotId);
  const shots = useEditor((s) => s.shots);
  const shot = shots.find((x) => x.id === shotId) ?? shots[0]!;
  const setDevice = useEditor((s) => s.setDevice);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[min(520px,calc(100vw-28px))]">
        <DialogHeader>
          <DialogTitle>Choose a mockup device</DialogTitle>
          <DialogDescription>
            Screens snap to the display. Lighting and camera stay as they are.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {DEVICES.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                setDevice(d.id);
                setOpen(false);
              }}
              className={cn(
                "rounded-xl border px-3 py-3 text-left",
                shot.deviceId === d.id
                  ? "border-fg bg-black/[0.04] dark:border-fg-on-ink dark:bg-white/[0.06]"
                  : "border-line hover:bg-black/[0.03] dark:border-line-ink dark:hover:bg-white/[0.04]",
              )}
            >
              <div className="text-[13px] font-medium">{d.name}</div>
              <div className="text-[11px] text-muted capitalize dark:text-muted-on-ink">
                {d.kind}
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

async function capturePng(): Promise<string | null> {
  const root = rendererRef.current;
  if (!root) return null;
  const { gl, scene, camera } = root;
  gl.render(scene, camera);
  return gl.domElement.toDataURL("image/png");
}

function download(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function pickMime() {
  const types = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];
  if (typeof MediaRecorder === "undefined") return null;
  return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? null;
}

async function recordVideo(seconds: number): Promise<{ blob: Blob; ext: string } | null> {
  const root = rendererRef.current;
  if (!root) return null;
  const mime = pickMime();
  if (!mime) return null;
  const { gl, scene, camera } = root;
  const canvas = gl.domElement;
  const stream = canvas.captureStream(30);
  const rec = new MediaRecorder(stream, {
    mimeType: mime,
    videoBitsPerSecond: 8_000_000,
  });
  const chunks: BlobPart[] = [];
  rec.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };
  const done = new Promise<Blob>((resolve) => {
    rec.onstop = () => resolve(new Blob(chunks, { type: mime }));
  });

  const store = useEditor.getState();
  store.setExporting(true);
  store.setPlayhead(0);
  store.setPlaying(true);
  rec.start(80);

  const start = performance.now();
  await new Promise<void>((resolve) => {
    const tick = (now: number) => {
      const t = Math.min(seconds, (now - start) / 1000);
      useEditor.getState().setPlayhead(t);
      gl.render(scene, camera);
      if (t >= seconds) {
        resolve();
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  useEditor.getState().setPlaying(false);
  useEditor.getState().setExporting(false);
  rec.stop();
  const blob = await done;
  stream.getTracks().forEach((tr) => tr.stop());
  const ext = mime.includes("mp4") ? "mp4" : "webm";
  return { blob, ext };
}

export function ExportDialog() {
  const open = useEditor((s) => s.exportOpen);
  const setOpen = useEditor((s) => s.setExportOpen);
  const consumeCapture = useEditor((s) => s.consumeCapture);
  const shotId = useEditor((s) => s.activeShotId);
  const shots = useEditor((s) => s.shots);
  const shot = shots.find((x) => x.id === shotId) ?? shots[0]!;
  const duration = useEditor((s) =>
    Math.max(
      4,
      s.shots.reduce((a, x) => a + x.duration, 0),
      ...s.keyframes.map((k) => k.time),
    ),
  );
  const [busy, setBusy] = useState<"png" | "video" | null>(null);

  const device = getDevice(shot.deviceId);

  async function onPng() {
    if (!consumeCapture()) return;
    setBusy("png");
    try {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const url = await capturePng();
      if (!url) {
        toast.error("Renderer not ready");
        return;
      }
      download(url, `freemock-${device.id}.png`);
      toast.success("PNG exported");
      setOpen(false);
    } finally {
      setBusy(null);
    }
  }

  async function onVideo() {
    if (!consumeCapture()) return;
    setBusy("video");
    try {
      const clip = await recordVideo(Math.min(8, Math.max(3, duration)));
      if (!clip) {
        toast.error("Video recording is not supported in this browser");
        return;
      }
      download(URL.createObjectURL(clip.blob), `freemock-${device.id}.${clip.ext}`);
      toast.success("Footage exported");
      setOpen(false);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export</DialogTitle>
          <DialogDescription>
            Capture a still or play the timeline out as video.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void onPng()}
            className="flex items-center gap-3 rounded-xl border border-line px-3 py-3 text-left hover:bg-black/[0.03] disabled:opacity-50 dark:border-line-ink dark:hover:bg-white/[0.04]"
          >
            <ImageIcon className="size-4" />
            <span>
              <span className="block text-sm font-medium">
                {busy === "png" ? "Rendering…" : "PNG still"}
              </span>
              <span className="text-[12px] text-muted dark:text-muted-on-ink">
                Viewport capture · {device.name}
              </span>
            </span>
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void onVideo()}
            className="flex items-center gap-3 rounded-xl border border-line px-3 py-3 text-left hover:bg-black/[0.03] disabled:opacity-50 dark:border-line-ink dark:hover:bg-white/[0.04]"
          >
            <Video className="size-4" />
            <span>
              <span className="block text-sm font-medium">
                {busy === "video" ? "Recording…" : "720p video"}
              </span>
              <span className="text-[12px] text-muted dark:text-muted-on-ink">
                Plays keyframes to WebM
              </span>
            </span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
