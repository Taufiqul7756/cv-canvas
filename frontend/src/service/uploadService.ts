import { post } from '@/lib/api/authHandlers';
import type { Cv } from '@/types/models/Cv';

export const uploadService = () => ({
  uploadInspirationCv: (formData: FormData): Promise<Cv> =>
    post<Cv>('/uploads/', formData),
});
