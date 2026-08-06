import { AdminOrderView } from "@/components/admin/admin-order-view";

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminOrderView id={id} />;
}
