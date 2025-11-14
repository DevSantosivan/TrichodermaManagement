export interface Crop {
  id?: string; // from Supabase, may uuid or numeric depende sa table mo
  image_url: string;
  title_en: string;
  title_tl: string;
  description_en: string;
  description_tl: string;
}
