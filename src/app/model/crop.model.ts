export interface Crop {
  id?: string;

  image_url: string;

  title_en: string;
  title_tl: string;

  description_en: string;
  description_tl: string;

  // ➕ NEW FIELDS (English & Tagalog)
  land_preparation_en?: string;
  land_preparation_tl?: string;

  seed_preparation_en?: string;
  seed_preparation_tl?: string;

  nursery_en?: string;
  nursery_tl?: string;

  transplanting_en?: string;
  transplanting_tl?: string;

  water_mgmt_en?: string;
  water_mgmt_tl?: string;

  harvest_en?: string;
  harvest_tl?: string;
}
