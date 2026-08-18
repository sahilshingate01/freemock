import type { ComponentProps } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

function Slider({ className, ...props }: ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      className={cn(
        "relative flex w-full touch-none items-center select-none",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-black/[0.08] dark:bg-white/[0.1]">
        <SliderPrimitive.Range className="absolute h-full bg-fg dark:bg-fg-on-ink" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block size-3 rounded-full border border-line bg-chrome shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-fg/20 dark:border-line-ink dark:bg-fg-on-ink" />
    </SliderPrimitive.Root>
  );
}

export { Slider };
