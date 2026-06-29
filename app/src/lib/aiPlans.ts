// Shared free/plus tier constants. Mirror of the pa-chat edge function so
// the UI and the client logic agree on limits without a round-trip.

export const TIER_LIMITS = { free: 50, plus: 500 } as const;

export type Tier = "free" | "plus" | "byok";

export interface Quota {
  used: number;
  limit: number;
  remaining: number;
  resetsUTC: string;
}
