"use client";

import { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { OrderRow } from "@/components/shared/order-row";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewOrderSheet } from "@/components/shared/new-order-sheet";
import { useRole } from "@/lib/role-context";
import { useOrders } from "@/lib/orders-context";
import { filterOrders, type DateFilter, type StatusFilter } from "@/lib/order-filters";

const PAGE_SIZE = 5;

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pago_custodia", label: "Pago em Custódia" },
  { value: "concluido", label: "Concluído" },
  { value: "em_disputa", label: "Em Disputa" },
];

export default function OrdersPage() {
  const { role } = useRole();
  const { orders } = useOrders();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("todos");
  const [date, setDate] = useState<DateFilter>("todos");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => filterOrders(orders, { query, status, date }),
    [orders, query, status, date]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function updateStatus(next: StatusFilter) {
    setStatus(next);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={role === "comprador" ? "Minhas Compras" : "Meus Pedidos"}
        description={
          role === "comprador"
            ? "Gerencie seus pagamentos protegidos."
            : "Gerencie suas transações e acompanhe os status."
        }
        action={role === "vendedor" ? <NewOrderSheet /> : undefined}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por ID, cliente ou valor..."
            className="pl-10"
          />
        </div>
        <select
          value={date}
          onChange={(e) => {
            setDate(e.target.value as DateFilter);
            setPage(1);
          }}
          className="h-11 rounded-md border border-input-border bg-input px-4 text-body-md text-on-surface outline-none focus:border-2 focus:border-primary"
        >
          <option value="todos">Todo o período</option>
          <option value="30d">Últimos 30 dias</option>
          <option value="7d">Últimos 7 dias</option>
        </select>
      </div>

      <Tabs value={status} onValueChange={(v) => updateStatus(v as StatusFilter)}>
        <TabsList>
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-2 rounded-lg border border-card-border bg-card p-2">
        {paginated.length > 0 ? (
          paginated.map((order) => (
            <OrderRow key={order.id} order={order} href={`/orders/${order.id}`} />
          ))
        ) : (
          <p className="p-6 text-center text-body-md text-on-surface-variant">
            Nenhum pedido encontrado.
          </p>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-label-sm text-on-surface-variant">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            disabled={currentPage === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
