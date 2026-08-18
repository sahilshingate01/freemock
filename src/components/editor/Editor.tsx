import { useEffect } from "react";
import { Toaster } from "sonner";
import { DevicePicker, ExportDialog } from "./Dialogs";
import { Inspector, InspectorToggle } from "./Inspector";
import { Timeline } from "./Timeline";
import { Toolbar } from "./Toolbar";
import { Viewport } from "./Viewport";
import { prefetchDefaultModels } from "./gltf-devices";
import { useEditor } from "@/lib/store";

function Skeleton() {
  return (
    <div
      className="fixed inset-0 z-[50] overflow-hidden bg-studio dark:bg-studio-ink"
      aria-busy="true"
      aria-label="Loading editor"
    >
      <div className="fixed inset-[14px] flex gap-[10px]">
        <div className="flex min-w-0 flex-1 flex-col gap-[10px]">
          <div className="flex h-10 items-center gap-2.5 rounded-xl border border-line bg-chrome/72 px-1.5 dark:border-line-ink dark:bg-chrome-ink/72">
            <span className="size-3.5 rounded-sm bg-black/[0.05] dark:bg-white/[0.06]" />
            <span className="h-2.5 w-[72px] rounded-sm bg-black/[0.05] dark:bg-white/[0.06]" />
            <span className="ml-auto flex items-center gap-2">
              <span className="h-[26px] w-[140px] rounded-lg bg-black/[0.05] dark:bg-white/[0.06]" />
              <span className="size-[26px] rounded-lg bg-black/[0.05] dark:bg-white/[0.06]" />
              <span className="h-[26px] w-20 rounded-lg bg-black/[0.05] dark:bg-white/[0.06]" />
            </span>
          </div>
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-line bg-panel dark:border-line-ink dark:bg-panel-ink">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="size-6 animate-spin text-muted"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
        </div>
        <div className="hidden w-[280px] shrink-0 overflow-hidden rounded-2xl border border-line bg-panel dark:border-line-ink dark:bg-panel-ink md:flex md:flex-col">
          <div className="flex h-9 items-center justify-between px-3">
            <span className="size-3.5 rounded-sm bg-black/[0.12] dark:bg-white/[0.1]" />
            <span className="flex gap-3">
              <span className="size-3.5 rounded-sm bg-black/[0.12] dark:bg-white/[0.1]" />
              <span className="size-3.5 rounded-full bg-black/[0.12] dark:bg-white/[0.1]" />
            </span>
          </div>
          <div className="flex flex-col gap-3 px-3 pb-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-7 w-full rounded-md bg-black/[0.05] dark:bg-white/[0.06]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Editor() {
  const darkMode = useEditor((s) => s.darkMode);
  const firstDeviceReady = useEditor((s) => s.firstDeviceReady);

  useEffect(() => {
    prefetchDefaultModels();
    document.documentElement.classList.toggle(
      "dark",
      useEditor.getState().darkMode,
    );
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-studio text-fg dark:bg-studio-ink dark:text-fg-on-ink">
      <div className="flex h-full flex-col gap-[10px] p-[14px] max-md:p-2.5 max-md:gap-2">
        <Toolbar />
        <div className="flex min-h-0 flex-1 gap-[10px]">
          <div className="flex min-w-0 flex-1 flex-col gap-[10px]">
            <Viewport />
            <Timeline />
          </div>
          <Inspector />
        </div>
      </div>
      <InspectorToggle />
      <DevicePicker />
      <ExportDialog />
      <Toaster
        position="bottom-center"
        theme={darkMode ? "dark" : "light"}
        toastOptions={{
          className: "font-[inherit]",
        }}
      />
      {!firstDeviceReady ? <Skeleton /> : null}
    </div>
  );
}
