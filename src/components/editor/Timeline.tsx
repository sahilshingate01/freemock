import {
  CircleDot,
  Pause,
  Play,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CAMERA_PRESETS } from "@/lib/catalog";
import { useEditor } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Timeline() {
  const shots = useEditor((s) => s.shots);
  const activeShotId = useEditor((s) => s.activeShotId);
  const setActiveShot = useEditor((s) => s.setActiveShot);
  const addShot = useEditor((s) => s.addShot);
  const removeShot = useEditor((s) => s.removeShot);
  const playhead = useEditor((s) => s.playhead);
  const setPlayhead = useEditor((s) => s.setPlayhead);
  const playing = useEditor((s) => s.playing);
  const setPlaying = useEditor((s) => s.setPlaying);
  const togglePlaying = useEditor((s) => s.togglePlaying);
  const exporting = useEditor((s) => s.exporting);
  const keyframes = useEditor((s) => s.keyframes);
  const addKeyframe = useEditor((s) => s.addKeyframe);
  const removeKeyframe = useEditor((s) => s.removeKeyframe);
  const applyPreset = useEditor((s) => s.applyPreset);
  const duration = Math.max(
    4,
    shots.reduce((a, s) => a + s.duration, 0),
    ...keyframes.map((k) => k.time + 0.1),
  );

  const raf = useRef(0);
  const last = useRef(0);

  useEffect(() => {
    if (!playing || exporting) return;
    last.current = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last.current) / 1000);
      last.current = now;
      const next = useEditor.getState().playhead + dt;
      if (next >= duration) {
        useEditor.getState().setPlayhead(0);
        useEditor.getState().setPlaying(false);
        return;
      }
      useEditor.getState().setPlayhead(next);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, duration, exporting]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlaying();
      }
      if (e.key === "k" || e.key === "K") {
        addKeyframe();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [addKeyframe, togglePlaying]);

  return (
    <div className="flex h-[118px] shrink-0 flex-col rounded-2xl border border-line bg-panel px-2.5 py-2 dark:border-line-ink dark:bg-panel-ink max-md:h-[96px]">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Button
          size="icon-sm"
          variant="secondary"
          onClick={() => setPlaying(!playing)}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause /> : <Play />}
        </Button>
        <span className="w-14 font-mono text-[11px] text-muted tabular-nums dark:text-muted-on-ink">
          {playhead.toFixed(2)}s
        </span>
        <div className="ml-auto flex items-center gap-1">
          <div className="hidden items-center gap-1 sm:flex">
            {CAMERA_PRESETS.slice(0, 3).map((p) => (
              <Button
                key={p.id}
                size="xs"
                variant="ghost"
                onClick={() => applyPreset(p.id)}
              >
                {p.name}
              </Button>
            ))}
          </div>
          <Button size="xs" variant="secondary" onClick={addKeyframe}>
            <CircleDot />
            Record keyframes
          </Button>
          <Button size="xs" variant="secondary" onClick={() => addShot()}>
            <Plus />
            Add track
          </Button>
        </div>
      </div>

      <div
        className="relative min-h-0 flex-1 cursor-pointer rounded-md bg-black/[0.04] dark:bg-white/[0.05]"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const t = ((e.clientX - rect.left) / rect.width) * duration;
          setPlayhead(Math.max(0, Math.min(duration, t)));
        }}
      >
        <div className="absolute inset-x-0 top-1.5 flex h-7 gap-1 px-1">
          {shots.map((shot) => (
            <button
              key={shot.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveShot(shot.id);
              }}
              className={cn(
                "relative min-w-0 flex-1 overflow-hidden rounded-md px-2 text-left text-[11px] font-medium",
                shot.id === activeShotId
                  ? "bg-fg text-accent-fg dark:bg-fg-on-ink dark:text-studio-ink"
                  : "bg-black/[0.08] text-fg hover:bg-black/[0.12] dark:bg-white/[0.1] dark:text-fg-on-ink",
              )}
            >
              <span className="block truncate">{shot.name}</span>
              {shots.length > 1 ? (
                <span
                  role="button"
                  tabIndex={0}
                  className="absolute top-1 right-1 opacity-70 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeShot(shot.id);
                  }}
                >
                  <Trash2 className="size-2.5" />
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="absolute inset-x-1 bottom-1.5 h-6">
          {keyframes.map((kf) => (
            <button
              key={kf.id}
              type="button"
              title={`${kf.time.toFixed(2)}s`}
              className="absolute top-1 size-3.5 -translate-x-1/2 rounded-full bg-fg dark:bg-fg-on-ink"
              style={{ left: `${(kf.time / duration) * 100}%` }}
              onClick={(e) => {
                e.stopPropagation();
                setPlayhead(kf.time);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                removeKeyframe(kf.id);
              }}
            />
          ))}
          <Sparkles className="pointer-events-none absolute top-1.5 left-0 size-3 text-muted/50" />
        </div>

        <div
          className="pointer-events-none absolute inset-y-1 w-px bg-danger"
          style={{ left: `${(playhead / duration) * 100}%` }}
        />
      </div>
    </div>
  );
}
