import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-md border border-input-border bg-input px-4 text-body-md text-on-surface placeholder:text-on-surface-variant transition-colors outline-none focus:border-primary focus:border-2",
        className
      )}
      {...props}
    />
  );
}

export { Input };
