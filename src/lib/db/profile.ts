import { prisma } from "@/lib/prisma";

export type ProfileData = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: Date;
  isPro: boolean;
  hasPassword: boolean;
  itemStats: {
    total: number;
    byType: { name: string; icon: string; color: string; count: number }[];
  };
  collectionTotal: number;
};

export async function getProfileData(userId: string): Promise<ProfileData | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isPro: true,
      password: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  const [itemTypes, collectionTotal] = await Promise.all([
    prisma.itemType.findMany({
      where: { isSystem: true },
      include: {
        _count: {
          select: { items: { where: { userId } } },
        },
      },
    }),
    prisma.collection.count({ where: { userId } }),
  ]);

  const byType = itemTypes.map((t) => ({
    name: t.name,
    icon: t.icon,
    color: t.color,
    count: t._count.items,
  }));

  const total = byType.reduce((sum, t) => sum + t.count, 0);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    createdAt: user.createdAt,
    isPro: user.isPro,
    hasPassword: !!user.password,
    itemStats: { total, byType },
    collectionTotal,
  };
}
