"use client";

import { Gavel } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { OrderRow } from "@/components/shared/order-row";
import { useOrders } from "@/lib/orders-context";
import { useRole } from "@/lib/role-context";

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-card-border bg-card p-12 text-center">
      <Gavel className="size-8 text-on-surface-variant" />
      <p className="text-body-md text-on-surface-variant">Nenhuma disputa em aberto no momento.</p>
    </div>
  );
}

export default function DisputesPage() {
  const { role } = useRole();
  const { getOrdersByStatus } = useOrders();
  const disputedOrders = getOrdersByStatus("em_disputa");

  if (role === "vendedor") {
    const awaitingResponse = disputedOrders.filter((o) => !o.sellerResponse);
    const responded = disputedOrders.filter((o) => o.sellerResponse);

    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Disputas"
          description="Responda com evidências aos pedidos contestados por compradores."
        />

        {disputedOrders.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <h2 className="text-body-lg font-semibold text-on-surface">
                Aguardando sua resposta ({awaitingResponse.length})
              </h2>
              {awaitingResponse.length > 0 ? (
                <div className="flex flex-col gap-2 rounded-lg border border-card-border bg-card p-2">
                  {awaitingResponse.map((order) => (
                    <OrderRow key={order.id} order={order} href={`/orders/${order.id}`} />
                  ))}
                </div>
              ) : (
                <p className="text-body-md text-on-surface-variant">Tudo em dia por aqui.</p>
              )}
            </div>

            {responded.length > 0 ? (
              <div className="flex flex-col gap-2">
                <h2 className="text-body-lg font-semibold text-on-surface">
                  Resposta enviada ({responded.length})
                </h2>
                <div className="flex flex-col gap-2 rounded-lg border border-card-border bg-card p-2">
                  {responded.map((order) => (
                    <OrderRow key={order.id} order={order} href={`/orders/${order.id}`} />
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Disputas"
        description="Acompanhe os pedidos que você contestou. Seu dinheiro continua retido até a decisão."
      />

      {disputedOrders.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-lg border border-card-border bg-card p-2">
          {disputedOrders.map((order) => (
            <OrderRow key={order.id} order={order} href={`/orders/${order.id}`} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
