"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, Phone, MoreVertical, Send, CheckCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ChatMockupContent } from "@/lib/i18n/landing-dictionary";

const TYPING_DURATION = 1100;
const PAUSE_BETWEEN_MESSAGES = 1700;
const HOLD_COMPLETE_DURATION = 2600;
const RESTART_DELAY = 500;

export function ChatMockup({ content, className }: { content: ChatMockupContent; className?: string }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    function step(count: number) {
      if (cancelled) return;

      if (count >= content.messages.length) {
        timeoutId = setTimeout(() => {
          if (cancelled) return;
          setIsTyping(false);
          setVisibleCount(0);
          timeoutId = setTimeout(() => step(0), RESTART_DELAY);
        }, HOLD_COMPLETE_DURATION);
        return;
      }

      setIsTyping(true);
      timeoutId = setTimeout(() => {
        if (cancelled) return;
        setIsTyping(false);
        setVisibleCount(count + 1);
        timeoutId = setTimeout(() => step(count + 1), PAUSE_BETWEEN_MESSAGES);
      }, TYPING_DURATION);
    }

    setVisibleCount(0);
    setIsTyping(false);
    timeoutId = setTimeout(() => step(0), RESTART_DELAY);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [content]);

  const visibleMessages = content.messages.slice(0, visibleCount);

  return (
    <Card className={cn("flex flex-col gap-0 overflow-hidden p-0", className)}>
      <div className="flex items-center gap-3 border-b border-outline-variant bg-mint-teal/10 p-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mint-teal/20 text-primary">
          <ShieldCheck className="size-4" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-body-md font-semibold text-on-surface">{content.contactName}</span>
          <span className="truncate text-label-sm text-on-surface-variant">
            {isTyping ? content.typingStatusLabel : content.idleStatusLabel}
          </span>
        </div>
        <Phone className="size-4 shrink-0 text-on-surface-variant" />
        <MoreVertical className="size-4 shrink-0 text-on-surface-variant" />
      </div>

      <div
        className="flex min-h-64 flex-col justify-end gap-2 bg-[length:240px_240px] bg-repeat p-4"
        style={{ backgroundImage: "url('/chat-doodle-bg.svg')" }}
      >
        <AnimatePresence initial={false}>
          {visibleMessages.map((message, index) => {
            const isHoldfy = message.from === "holdfy";
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={cn(
                  "flex max-w-[80%] flex-col gap-1 rounded-xl px-3 py-2",
                  isHoldfy
                    ? "self-end rounded-br-sm bg-mint-teal text-deep-carbon"
                    : "self-start rounded-bl-sm border border-card-border bg-card text-on-surface",
                  message.muted && "opacity-60"
                )}
              >
                <span className="text-body-md">{message.text}</span>
                <span
                  className={cn(
                    "flex items-center justify-end gap-1 text-[11px]",
                    isHoldfy ? "text-deep-carbon/70" : "text-on-surface-variant"
                  )}
                >
                  {message.time}
                  {isHoldfy && message.read ? <CheckCheck className="size-3" /> : null}
                </span>
              </motion.div>
            );
          })}

          {isTyping ? (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex w-fit shrink-0 items-center gap-1 self-start rounded-xl rounded-bl-sm border border-card-border bg-card px-3 py-2.5"
            >
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="size-1.5 animate-bounce rounded-full bg-on-surface-variant"
                  style={{ animationDelay: `${dot * 150}ms` }}
                />
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 border-t border-outline-variant p-3">
        <div className="flex-1 rounded-full border border-input-border bg-input px-4 py-2 text-body-md text-on-surface-variant">
          {content.inputPlaceholder}
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mint-teal text-deep-carbon">
          <Send className="size-4" />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-low px-4 py-3">
        <span className="flex items-center gap-1.5 text-label-sm text-primary">
          <ShieldCheck className="size-3.5" />
          {content.footerLeft}
        </span>
        <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <span className="size-1.5 rounded-full bg-on-surface-variant" />
          {content.footerRight}
        </span>
      </div>
    </Card>
  );
}
