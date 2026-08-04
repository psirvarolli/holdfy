import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderTimelineStep } from "@/lib/types";

export function Timeline({ steps }: { steps: OrderTimelineStep[] }) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li key={step.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                  step.state === "concluido" && "border-mint-teal bg-mint-teal",
                  step.state === "atual" && "border-mint-teal bg-transparent",
                  step.state === "pendente" && "border-outline-variant bg-transparent"
                )}
              >
                {step.state === "concluido" ? (
                  <Check className="size-3.5 text-deep-carbon" />
                ) : step.state === "atual" ? (
                  <span className="size-2 rounded-full bg-mint-teal" />
                ) : null}
              </span>
              {!isLast ? (
                <span
                  className={cn(
                    "w-px flex-1",
                    step.state === "concluido" ? "bg-mint-teal" : "bg-outline-variant"
                  )}
                />
              ) : null}
            </div>
            <div className={cn("flex flex-col gap-1 pb-8", isLast && "pb-0")}>
              <span
                className={cn(
                  "text-body-md font-semibold",
                  step.state === "pendente" ? "text-on-surface-variant" : "text-on-surface"
                )}
              >
                {step.title}
              </span>
              <span className="text-label-sm text-on-surface-variant">{step.description}</span>
              {step.timestamp ? (
                <span className="text-label-sm text-on-surface-variant">{step.timestamp}</span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
