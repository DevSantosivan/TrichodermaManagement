export interface CropReminder {
  id?: string;
  crop_id: string;
  crop_name_en: string;
  crop_name_tl: string;
  description_en: string;
  description_tl: string;
  image_url: string;
  steps: {
    instructionEn: string;
    instructionTl: string;
    day: number;
  }[];
}
