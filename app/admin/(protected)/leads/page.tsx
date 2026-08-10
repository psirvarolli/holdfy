"use client";

import { useEffect, useState } from "react";
import { Download, Mail, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

interface Lead {
  id: string;
  name: string;
  email: string;
  source: string;
  createdAt: string;
}

function downloadCsv(leads: Lead[]) {
  const header = "Nome,E-mail,Origem,Data\n";
  const rows = leads
    .map((lead) => {
      const name = lead.name.replace(/"/g, '""');
      return `"${name}","${lead.email}","${lead.source}","${lead.createdAt}"`;
    })
    .join("\n");

  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `holdfy-lista-de-espera-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/leads")
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao carregar a lista.");
        return res.json();
      })
      .then((data: { leads: Lead[] }) => setLeads(data.leads))
      .catch(() => setError("Não foi possível carregar a lista de espera."));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Lista de Espera"
        description="Quem se cadastrou pelo formulário de acesso antecipado na landing page."
        action={
          leads && leads.length > 0 ? (
            <Button variant="outline" size="sm" onClick={() => downloadCsv(leads)}>
              <Download className="size-4" />
              Exportar CSV
            </Button>
          ) : null
        }
      />

      {error ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-card-border bg-card p-12 text-center">
          <p className="text-body-md text-error">{error}</p>
        </div>
      ) : leads === null ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-on-surface-variant" />
        </div>
      ) : leads.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-card-border bg-card p-12 text-center">
          <Mail className="size-8 text-on-surface-variant" />
          <p className="text-body-md text-on-surface-variant">Ninguém se cadastrou ainda.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-card-border bg-card">
          <table className="w-full text-left text-body-md">
            <thead>
              <tr className="border-b border-card-border text-label-sm uppercase text-on-surface-variant">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Origem</th>
                <th className="px-4 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-card-border last:border-0">
                  <td className="px-4 py-3 text-on-surface">{lead.name || "—"}</td>
                  <td className="px-4 py-3 text-on-surface">{lead.email}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{lead.source}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{formatDate(lead.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
