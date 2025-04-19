export interface Project {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  type: 'video' | 'game';
  user_id: string;
  public_share_id: string | null;
  is_completed: boolean;
}

export interface Scene {
  id: string;
  created_at: string;
  updated_at: string;
  project_id: string;
  title: string;
  description: string | null;
  order: number;
}

export interface Shot {
  id: string;
  created_at: string;
  updated_at: string;
  scene_id: string;
  title: string;
  type: string;
  duration: string | null;
  description: string | null;
  dialogue: text
  scene_name: text
  day_setting: text  // e.g., "Day", "Night"
  location: text
  order: number;
  whiteboard_data: any | null;
  whiteboard_image_url: string | null;
  video_reference_url: string | null;
  is_completed: boolean;
}

export interface Script {
  id: string;
  created_at: string;
  updated_at: string;
  project_id: string;
  content: string | null;
}