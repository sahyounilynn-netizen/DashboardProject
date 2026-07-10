import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "../../lib/utils";

function Label({ className, ...props }) {
  return (
    <LabelPrimitive.Root
      className={cn("text-sm font-medium text-[var(--text-secondary)]", className)}
      {...props}
    />
  );
}

export { Label };
