import { prisma } from "@/lib/prisma";
import type { Notification, UserRole } from "@/lib/types";

// Notificação dentro do próprio app — sem e-mail/push por enquanto, isso
// exigiria uma conta num provedor externo (Resend, etc.) que ainda não
// existe. Ainda assim resolve o problema real: hoje nada avisa ninguém de
// nada, só descobre atualizando a página.
export async function createNotification(
  orderId: string,
  recipientRole: UserRole,
  message: string
): Promise<void> {
  await prisma.notification.create({
    data: { orderId, recipientRole, message },
  });
}

export async function listNotifications(role: UserRole): Promise<Notification[]> {
  const rows = await prisma.notification.findMany({
    where: { recipientRole: role },
    include: { order: { select: { displayId: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return rows.map((row) => ({
    id: row.id,
    orderId: row.orderId,
    orderDisplayId: row.order.displayId,
    message: row.message,
    read: row.read,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function markNotificationRead(id: string): Promise<void> {
  await prisma.notification.update({ where: { id }, data: { read: true } });
}

export async function markAllNotificationsRead(role: UserRole): Promise<void> {
  await prisma.notification.updateMany({
    where: { recipientRole: role, read: false },
    data: { read: true },
  });
}
