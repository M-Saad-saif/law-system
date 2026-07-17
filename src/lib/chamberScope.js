import { getChamberForUser } from "@/lib/subscriptionService";

export async function resolveChamberOwnerId(user) {
  if (!user) return null;
  if (user.role === "admin") return null;

  const chamber = await getChamberForUser(user.id);
  if (!chamber) return user.id;

  return String(chamber.owner);
}
