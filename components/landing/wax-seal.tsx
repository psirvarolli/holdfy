import { Lock, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface WaxSealProps {
  /** "retido" plays the lock stamp; "liberado" restamps in verde-cédula. */
  state: "retido" | "liberado";
  label: string;
  className?: string;
}

/**
 * The one signature element carrying real creative risk (see globals.css
 * "Cofre e Recibo" comment) — a literal wax-seal stamp for the moment funds
 * change custody state. Keyed by `state` so React remounts the node on a
 * transition, which is what actually restarts the CSS keyframe (animating
 * `data-state` in place would not, since animation-name doesn't change).
 */
export function WaxSeal({ state, label, className }: WaxSealProps) {
  const Icon = state === "retido" ? Lock : CheckCheck;
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div key={state} className="holdfy-seal" data-state={state} aria-hidden="true">
        <Icon className="size-7" strokeWidth={2.5} />
      </div>
      <span className="font-mono text-label-sm uppercase tracking-wide opacity-70">{label}</span>
    </div>
  );
}
