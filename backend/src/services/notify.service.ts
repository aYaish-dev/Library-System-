import { redis } from "../redis";

const KEY = "notify:queue";

export type NotifyEvent =
  | { type: "HOLD_READY"; userId: number; resourceId: number; copyId: number }
  | { type: "DUE_SOON"; userId: number; loanId: number }
  | { type: "OVERDUE"; userId: number; loanId: number };

export async function enqueueNotification(event: NotifyEvent) {
  await redis.lPush(KEY, JSON.stringify(event));
}

export async function popNotification(): Promise<NotifyEvent | null> {
  const raw = await redis.rPop(KEY);
  return raw ? (JSON.parse(raw) as NotifyEvent) : null;
}
