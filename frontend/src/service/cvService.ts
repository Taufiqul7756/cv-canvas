import { get } from '@/lib/api/authHandlers';
import type { Cv, CvType } from '@/types/models/Cv';
import type { User } from '@/types/models/User';
import type { PaginatedResponse } from '@/types/Types';

export interface CvWithUser extends Cv {
  user: Pick<User, 'id' | 'email' | 'full_name' | 'avatar_url'>;
}

interface ListCvsParams {
  page?: number;
  page_size?: number;
  type?: CvType;
  sort?: 'newest' | 'upvotes';
  tags?: string;
  search?: string;
}

export const cvService = () => ({
  listCvs: (params: ListCvsParams = {}): Promise<PaginatedResponse<CvWithUser>> => {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.page_size) qs.set('page_size', String(params.page_size));
    if (params.type) qs.set('type', params.type);
    if (params.sort) qs.set('sort', params.sort);
    if (params.tags) qs.set('tags', params.tags);
    if (params.search) qs.set('search', params.search);
    return get<PaginatedResponse<CvWithUser>>(`/cvs/?${qs.toString()}`);
  },
});
