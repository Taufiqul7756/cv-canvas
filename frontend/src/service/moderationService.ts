import { get, patch } from '@/lib/api/authHandlers';
import type { Cv } from '@/types/models/Cv';

interface CvWithUser extends Cv {
  user: { id: number; email: string; full_name: string | null };
}

export const moderationService = () => ({
  listQueue: (): Promise<CvWithUser[]> => get<CvWithUser[]>('/moderation/queue'),
  approve: (cvId: number): Promise<Cv> => patch<Cv>(`/moderation/${cvId}/approve`, {}),
  reject: (cvId: number): Promise<Cv> => patch<Cv>(`/moderation/${cvId}/reject`, {}),
});
