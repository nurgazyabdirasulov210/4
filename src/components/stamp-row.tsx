import { cn } from "@/lib/cn";

export function StampRow({ stamps }: { stamps: number }) {
  const filled = Math.min(8, stamps);
  return (
    <div className="flex gap-2" aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => (
        <span
          key={index}
          className={cn(
            "size-4 rounded-full border",
            index < filled ? "border-roast bg-roast" : "border-line bg-transparent",
          )}
        />
      ))}
    </div>
  );
}
