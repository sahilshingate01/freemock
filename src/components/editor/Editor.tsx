import { useEffect } from "react";
import { Toaster } from "sonner";
import { DevicePicker, ExportDialog } from "./Dialogs";
import { Inspector, InspectorToggle } from "./Inspector";
import { Timeline } from "./Timeline";
import { Toolbar } from "./Toolbar";
import { Viewport } from "./Viewport";
import { prefetchDefaultModels } from "./gltf-devices";
import { useEditor } from "@/lib/store";

export function Editor() {
  const darkMode = useEditor((s) => s.darkMode);

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
    </div>
  );
}
