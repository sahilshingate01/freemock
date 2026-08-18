import { Download, Moon, Save, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FILL_SWATCHES } from "@/lib/catalog";
import { useEditor } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function FillControl() {
  const fill = useEditor((s) => s.fill);
  const setFill = useEditor((s) => s.setFill);
  return (
    <div className="flex items-center gap-1.5">
      <span className="hidden text-[12px] text-muted sm:inline dark:text-muted-on-ink">
        Fill
      </span>
      <div className="flex items-center gap-1">
        {FILL_SWATCHES.slice(0, 5).map((sw) => (
          <button
            key={sw.id}
            type="button"
            title={sw.name}
            onClick={() => setFill(sw.value)}
            className={cn(
              "size-4 rounded-[4px] border",
              fill.toLowerCase() === sw.value
                ? "border-fg dark:border-fg-on-ink"
                : "border-black/15 dark:border-white/15",
            )}
            style={{ background: sw.value }}
          />
        ))}
      </div>
    </div>
  );
}

export function Toolbar() {
  const darkMode = useEditor((s) => s.darkMode);
  const setDarkMode = useEditor((s) => s.setDarkMode);
  const setExportOpen = useEditor((s) => s.setExportOpen);

  return (
    <header className="flex h-10 shrink-0 items-center gap-2.5 rounded-xl border border-black/15 bg-white/72 px-1.5 shadow-chrome backdrop-blur-md dark:border-white/10 dark:bg-[rgba(14,14,16,0.72)]">
      <img src="/favicon.svg" alt="" className="size-3.5 shrink-0 rounded-[3px]" />
      <span className="hidden text-[13px] font-medium tracking-tight sm:block">
        Freemock
      </span>
      <FillControl />
      <div className="ml-auto flex items-center gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          className="hidden sm:inline-flex"
          onClick={() => toast.success("Project saved")}
        >
          <Save />
          Save project
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={darkMode ? "Light mode" : "Dark mode"}
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <Sun /> : <Moon />}
        </Button>
        <Button size="sm" onClick={() => setExportOpen(true)}>
          <Download />
          Export
        </Button>
      </div>
    </header>
  );
}
