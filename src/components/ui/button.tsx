import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const variants = cva(
  "press focus-ring inline-flex items-center justify-center gap-2 font-medium disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "bg-roast text-paper hover:bg-ink",
        quiet: "border border-line bg-sheet text-ink hover:bg-paper",
        ghost: "bg-transparent text-ink hover:bg-ink/5",
      },
      size: {
        md: "h-11 rounded-control px-4 text-sm",
        lg: "h-12 rounded-control px-5 text-base",
        icon: "size-11 rounded-control",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof variants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild, type, ...props }: Props) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(variants({ variant, size }), className)}
      {...(asChild ? {} : { type: type ?? "button" })}
      {...props}
    />
  );
}
