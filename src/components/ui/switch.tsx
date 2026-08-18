import type { ComponentProps } from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-5 w-8 shrink-0 items-center rounded-full border border-transparent bg-black/15 transition-colors data-[state=checked]:bg-fg dark:bg-white/15 dark:data-[state=checked]:bg-fg-on-ink",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-3.5 translate-x-0.5 rounded-full bg-chrome shadow-sm transition-transform data-[state=checked]:translate-x-3.5 dark:bg-studio-ink" />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
