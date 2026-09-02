import { prisma } from "@/lib/prisma";

export interface SellerProfileData {
  sellerAddress: string;
  monthlyRevenueReais: number;
}

export async function getSellerProfile(sellerAddress: string): Promise<SellerProfileData | null> {
  const profile = await prisma.sellerProfile.findUnique({ where: { sellerAddress } });
  return profile ? { sellerAddress: profile.sellerAddress, monthlyRevenueReais: profile.monthlyRevenueReais } : null;
}

export async function saveMonthlyRevenue(
  sellerAddress: string,
  monthlyRevenueReais: number
): Promise<SellerProfileData> {
  const profile = await prisma.sellerProfile.upsert({
    where: { sellerAddress },
    create: { sellerAddress, monthlyRevenueReais },
    update: { monthlyRevenueReais },
  });
  return { sellerAddress: profile.sellerAddress, monthlyRevenueReais: profile.monthlyRevenueReais };
}
