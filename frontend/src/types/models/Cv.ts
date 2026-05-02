export type CvType = 'EDITABLE_TEMPLATE' | 'EDITABLE_USER' | 'INSPIRATION_UPLOAD';
export type CvStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Cv {
  id: number;
  title: string;
  slug: string | null;
  type: CvType;
  status: CvStatus;
  is_public: boolean;
  tags: string[];
  file_url: string | null;
  thumbnail_url: string | null;
  original_file_name: string | null;
  file_mime_type: string | null;
  upvotes_count: number;
  downvotes_count: number;
  comments_count: number;
  views_count: number;
  is_deleted: boolean;
  user_id: number;
  template_id: number | null;
  forked_from_id: number | null;
  created_at: string;
  updated_at: string;
}
