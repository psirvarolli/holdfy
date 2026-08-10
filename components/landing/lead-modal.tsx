"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, X } from "lucide-react";
import { useLandingLocale } from "@/lib/landing-locale-context";
import { landingDictionary } from "@/lib/i18n/landing-dictionary";

interface LeadModalProps {
  open: boolean;
  source: string;
  onClose: () => void;
}

export function LeadModal({ open, source, onClose }: LeadModalProps) {
  const { locale } = useLandingLocale();
  const { leadModal } = landingDictionary[locale];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => emailRef.current?.focus(), 60);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, source }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || leadModal.toastErrorGeneric);
        return;
      }
      if (data.status === "existing") {
        toast.info(leadModal.toastExisting);
      } else {
        toast.success(leadModal.toastSuccess);
      }
      setName("");
      setEmail("");
      onClose();
    } catch {
      toast.error(leadModal.toastErrorNetwork);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      data-testid="lead-modal-overlay"
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="lead-modal-title" data-testid="lead-modal">
        <button className="icon-btn modal-close" onClick={onClose} aria-label={leadModal.closeLabel} data-testid="lead-modal-close">
          <X size={19} />
        </button>
        <span className="icon-badge">
          <ShieldCheck size={22} />
        </span>
        <h3 className="title-md" id="lead-modal-title">
          {leadModal.title}
        </h3>
        <p className="modal-sub">{leadModal.subtitle}</p>
        <form onSubmit={submit}>
          <div>
            <label htmlFor="lead-name">{leadModal.nameLabel}</label>
            <input
              id="lead-name"
              className="input"
              type="text"
              placeholder={leadModal.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="lead-name-input"
            />
          </div>
          <div>
            <label htmlFor="lead-email">{leadModal.emailLabel}</label>
            <input
              id="lead-email"
              ref={emailRef}
              className="input"
              type="email"
              placeholder={leadModal.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="lead-email-input"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: "100%" }}
            disabled={loading}
            data-testid="lead-submit-button"
          >
            {loading ? leadModal.submitLoading : leadModal.submitLabel}
          </button>
          <p className="modal-note">{leadModal.note}</p>
        </form>
      </div>
    </div>
  );
}
