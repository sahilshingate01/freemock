import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg text-sm font-medium transition-[opacity,transform,background-color,color] duration-150 ease-out select-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-3.5 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-fg text-accent-fg dark:bg-fg-on-ink dark:text-studio-ink hover:opacity-90",
        secondary:
          "bg-black/[0.05] text-fg hover:bg-black/[0.08] dark:bg-white/[0.06] dark:text-fg-on-ink dark:hover:bg-white/[0.1]",
        ghost:
          "text-muted hover:bg-black/[0.05] hover:text-fg dark:text-muted-on-ink dark:hover:bg-white/[0.06] dark:hover:text-fg-on-ink",
        outline:
          "border border-line bg-transparent text-fg hover:bg-black/[0.04] dark:border-line-ink dark:text-fg-on-ink dark:hover:bg-white/[0.06]",
        danger: "bg-danger text-accent-fg hover:opacity-90",
      },
      size: {
        default: "h-8 px-3",
        sm: "h-7 px-2.5 text-[13px]",
        xs: "h-6 px-2 text-xs rounded-md",
        icon: "size-8",
        "icon-sm": "size-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>) {
  return (
    <button
      type={type}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
