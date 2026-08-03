import { supabase } from './supabase';

export type XpActivity = 'daily_tasks' | 'health_checkin';
export type XpProfile = { total_xp: number };
export type LeaderboardEntry = {
  rank: number;
  display_name: string;
  total_xp: number;
  level: number;
  is_current_user: boolean;
};

export async function syncXpProfile(displayName: string) {
  const { error } = await supabase.rpc('sync_xp_profile', { p_display_name: displayName });
  if (error) throw error;
}

export async function awardXp(activity: XpActivity) {
  const { data, error } = await supabase.rpc('award_xp', { p_activity: activity });
  if (error) throw error;
  const points = typeof data === 'number' ? data : 0;
  if (points > 0) window.dispatchEvent(new CustomEvent('smart-axis-xp-earned', { detail: points }));
  return points;
}

export async function loadMyXp(): Promise<number> {
  const { data, error } = await supabase.from('xp_profiles').select('total_xp').maybeSingle();
  if (error) throw error;
  return (data as XpProfile | null)?.total_xp ?? 0;
}

export async function loadLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase.rpc('get_leaderboard');
  if (error) throw error;
  return (data ?? []) as LeaderboardEntry[];
}
