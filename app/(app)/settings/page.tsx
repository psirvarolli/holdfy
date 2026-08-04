"use client";

import { useState } from "react";
import { User, Wallet, Landmark, Palette, Copy, Check, MapPin, Percent } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoleSwitch } from "@/components/shared/role-switch";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useRole } from "@/lib/role-context";
import { useTheme } from "@/lib/theme-context";

const MOCK_PIX_KEY = "holdfy.demo@pix.com.br";

function CopyPixKeyButton() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(MOCK_PIX_KEY);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponível (ex: contexto não seguro) — ignora silenciosamente
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? "Copiado" : "Copiar"}
    </Button>
  );
}

export default function SettingsPage() {
  const { role } = useRole();
  const { theme } = useTheme();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Configurações" description="Gerencie seu perfil e preferências." />

      <Card className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-on-surface">
          <User className="size-5" />
          <h2 className="text-body-lg font-semibold">Perfil</h2>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-body-md text-on-surface-variant">Visualizando como</span>
          <RoleSwitch />
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-on-surface">
          <Palette className="size-5" />
          <h2 className="text-body-lg font-semibold">Aparência</h2>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-body-md text-on-surface-variant">
            Tema {theme === "light" ? "claro" : "escuro"}
          </span>
          <ThemeToggle />
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-on-surface">
          <Wallet className="size-5" />
          <h2 className="text-body-lg font-semibold">Carteira</h2>
        </div>
        {/* TODO: exibir endereço da carteira Stellar abstraída via Privy (embedded wallet). */}
        <p className="text-body-md text-on-surface-variant">
          Sua carteira é criada e protegida automaticamente pela Holdfy — você não precisa
          gerenciar chaves ou frases de recuperação.
        </p>
      </Card>

      {role === "comprador" ? (
        <>
          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-on-surface">
              <Landmark className="size-5" />
              <h2 className="text-body-lg font-semibold">Método de Pagamento</h2>
            </div>
            {/* TODO: exibir chave PIX real do usuário e status de conversão BRL <-> USDC via BlindPay. */}
            <p className="text-body-md text-on-surface-variant">
              Seus pagamentos via Pix são convertidos automaticamente para custódia segura. Use a
              chave abaixo para receber estornos de disputas resolvidas a seu favor.
            </p>
            <div className="flex items-center justify-between rounded-md border border-input-border bg-input px-4 py-3">
              <span className="text-body-md text-on-surface">{MOCK_PIX_KEY}</span>
              <CopyPixKeyButton />
            </div>
          </Card>

          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-on-surface">
              <MapPin className="size-5" />
              <h2 className="text-body-lg font-semibold">Endereço de Entrega</h2>
            </div>
            <p className="text-body-md text-on-surface-variant">
              Av. Paulista, 777 — Bela Vista, São Paulo/SP
            </p>
          </Card>
        </>
      ) : (
        <>
          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-on-surface">
              <Landmark className="size-5" />
              <h2 className="text-body-lg font-semibold">Dados de Recebimento</h2>
            </div>
            {/* TODO: exibir chave PIX de recebimento real e status de liberação via BlindPay. */}
            <p className="text-body-md text-on-surface-variant">
              Suas liberações são convertidas de volta para Pix automaticamente nesta chave.
            </p>
            <div className="flex items-center justify-between rounded-md border border-input-border bg-input px-4 py-3">
              <span className="text-body-md text-on-surface">{MOCK_PIX_KEY}</span>
              <CopyPixKeyButton />
            </div>
          </Card>

          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-on-surface">
              <Percent className="size-5" />
              <h2 className="text-body-lg font-semibold">Taxas</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1 rounded-md bg-surface-container-high px-3 py-2">
                <span className="text-body-md font-semibold text-on-surface">1,5–2,5%</span>
                <span className="text-label-sm text-on-surface-variant">Taxa base</span>
              </div>
              <div className="flex flex-col gap-1 rounded-md bg-surface-container-high px-3 py-2">
                <span className="text-body-md font-semibold text-on-surface">70/10/20</span>
                <span className="text-label-sm text-on-surface-variant">Divisão de yield</span>
              </div>
              <div className="flex flex-col gap-1 rounded-md bg-surface-container-high px-3 py-2">
                <span className="text-body-md font-semibold text-on-surface">&lt; 5s</span>
                <span className="text-label-sm text-on-surface-variant">Liquidação típica</span>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
