"use client";

import { useState } from "react";
import { Briefcase, Building2, Calculator, Handshake, Store } from "lucide-react";
import { useLandingLocale } from "@/lib/landing-locale-context";
import { landingDictionary } from "@/lib/i18n/landing-dictionary";

// Preset amounts + icons, matched by index to dict.pricing.calculator.presets
// (which only carries the translated label) — the values themselves aren't
// language-dependent.
const PRESET_META = [
  { icon: Briefcase, value: 3500 },
  { icon: Store, value: 800 },
  { icon: Building2, value: 12000 },
  { icon: Handshake, value: 25000 },
];

// Real rates (see prisma/seed.ts PLAN_SEEDS) — this simulator only models
// the per-transaction percentage, not the R$197/month Pro fee.
const STARTER_RATE = 0.045;
const PRO_RATE = 0.025;

// Arredonda pra reais inteiros, sem centavos — é só uma simulação (o valor
// exato de centavos não importa aqui), e encurtar o número o suficiente pra
// caber no card num tamanho de fonte padrão, sem precisar de lógica extra
// pra medir/encolher a fonte em valores altos.
function formatWhole(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export function FeeCalculator() {
  const { locale } = useLandingLocale();
  const { calculator } = landingDictionary[locale].pricing;
  const [value, setValue] = useState(3500);
  // Qual perfil (Freelancer/Marketplace/Imobiliária/B2B) dita a palavra usada
  // no título e nos resultados ("prestador", "vendedor", "corretor"...) — só
  // muda quando um chip é clicado, não quando o valor sai de um preset exato
  // (arrastar o slider não deve fazer a palavra "piscar" de volta pro padrão).
  const [profileIndex, setProfileIndex] = useState(0);

  const clamped = Math.min(Math.max(value || 0, 0), 1000000);
  const starterNet = clamped * (1 - STARTER_RATE);
  const proNet = clamped * (1 - PRO_RATE);
  const role = calculator.presets[profileIndex]?.role ?? calculator.presets[0].role;
  const title = calculator.title.replace("{role}", role);
  const netLabel = calculator.netLabel.replace("{role}", role);
  const savingsPrefix = calculator.savingsPrefix.replace("{role}", role);

  return (
    <div className="calc-card" data-testid="fee-calculator">
      <div className="calc-inputs">
        <span className="icon-badge" style={{ marginBottom: 16 }}>
          <Calculator size={22} />
        </span>
        <h3 className="title-md" style={{ margin: "0 0 8px" }}>
          {title}
        </h3>
        <p className="body-md" style={{ margin: "0 0 24px", color: "var(--on-surface-variant)" }}>
          {calculator.subtitle}
        </p>
        <label htmlFor="fee-value" className="label-md" style={{ display: "block", marginBottom: 6 }}>
          {calculator.valueLabel}
        </label>
        <div className="calc-presets" role="group" aria-label={calculator.presetsLabel}>
          {calculator.presets.map((p, i) => {
            const meta = PRESET_META[i];
            return (
              <button
                key={p.key}
                type="button"
                className={`preset-chip ${profileIndex === i ? "active" : ""}`}
                onClick={() => {
                  setValue(meta.value);
                  setProfileIndex(i);
                }}
                data-testid={`fee-preset-${p.key}`}
              >
                <meta.icon size={14} />
                {p.label}
              </button>
            );
          })}
        </div>
        <input
          id="fee-value"
          className="input calc-value"
          type="number"
          min="0"
          max="1000000"
          step="50"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          data-testid="fee-value-input"
        />
        <input
          type="range"
          className="calc-slider"
          min="100"
          max="50000"
          step="100"
          value={Math.min(Math.max(clamped, 100), 50000)}
          onChange={(e) => setValue(Number(e.target.value))}
          aria-label={calculator.valueLabel}
          data-testid="fee-slider"
        />
        <div className="calc-range-marks">
          <span>{calculator.rangeMin}</span>
          <span>{calculator.rangeMax}</span>
        </div>
      </div>

      <div className="calc-results">
        <div className="calc-result" data-testid="fee-result-starter">
          <span className="label-md calc-plan">{calculator.starterLabel}</span>
          <span className="calc-fee">
            {calculator.feePrefix} {formatWhole(clamped * STARTER_RATE)}
          </span>
          <span className="calc-net" data-testid="fee-net-starter">
            {formatWhole(starterNet)}
          </span>
          <span className="calc-net-label">{netLabel}</span>
        </div>
        <div className="calc-result featured" data-testid="fee-result-pro">
          <span className="label-md calc-plan">{calculator.proLabel}</span>
          <span className="calc-fee">
            {calculator.feePrefix} {formatWhole(clamped * PRO_RATE)}
          </span>
          <span className="calc-net" data-testid="fee-net-pro">
            {formatWhole(proNet)}
          </span>
          <span className="calc-net-label">{netLabel}</span>
        </div>
        <div className="calc-result muted" data-testid="fee-result-enterprise">
          <span className="label-md calc-plan">{calculator.enterpriseLabel}</span>
          <span className="calc-fee">{calculator.enterpriseFee}</span>
          <span className="calc-net calc-net-sm">{calculator.enterpriseNet}</span>
          <span className="calc-net-label">{calculator.enterpriseNetLabel}</span>
        </div>
        <div className="calc-savings" data-testid="fee-savings">
          {savingsPrefix} <strong>{formatWhole(proNet - starterNet)}</strong> {calculator.savingsSuffix}
        </div>
      </div>
    </div>
  );
}
