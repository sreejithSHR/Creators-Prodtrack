/*
  # Initial Schema Setup for Shot List Planner

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `name` (text)
      - `type` (text) - 'video' or 'game'
      - `user_id` (uuid) - references auth.users
      - `public_share_id` (uuid) - for public slideshow links
      - `is_completed` (boolean)

    - `scenes`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `project_id` (uuid) - references projects
      - `title` (text)
      - `description` (text)
      - `order` (integer)

    - `shots`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `scene_id` (uuid) - references scenes
      - `title` (text)
      - `type` (text)
      - `duration` (interval)
      - `description` (text)
      - `order` (integer)
      - `whiteboard_data` (jsonb)
      - `whiteboard_image_url` (text)
      - `video_reference_url` (text)
      - `is_completed` (boolean)

    - `scripts`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `project_id` (uuid) - references projects
      - `content` (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public access to shared slideshows
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========== TABLES ==========

CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('video', 'game')),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  public_share_id uuid DEFAULT uuid_generate_v4(),
  is_completed boolean DEFAULT false
);

CREATE TABLE scenes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  "order" integer NOT NULL
);

CREATE TABLE shots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  scene_id uuid NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL,
  duration interval,
  description text,
  "order" integer NOT NULL,
  whiteboard_data jsonb,
  whiteboard_image_url text,
  video_reference_url text,
  is_completed boolean DEFAULT false
);

CREATE TABLE scripts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content text
);

-- ========== TRIGGERS FOR updated_at ==========

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scenes_updated_at
  BEFORE UPDATE ON scenes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shots_updated_at
  BEFORE UPDATE ON shots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scripts_updated_at
  BEFORE UPDATE ON scripts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========== ENABLE RLS ==========

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shots ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;

-- ========== POLICIES ==========

-- Projects
CREATE POLICY "Users can manage their own projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view shared projects"
  ON projects
  FOR SELECT
  TO anon
  USING (public_share_id IS NOT NULL);

-- Scenes
CREATE POLICY "Users can manage their scenes"
  ON scenes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = scenes.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = scenes.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view scenes from shared projects"
  ON scenes
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = scenes.project_id
      AND projects.public_share_id IS NOT NULL
    )
  );

-- Shots
CREATE POLICY "Users can manage their shots"
  ON shots
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scenes
      JOIN projects ON projects.id = scenes.project_id
      WHERE scenes.id = shots.scene_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scenes
      JOIN projects ON projects.id = scenes.project_id
      WHERE scenes.id = shots.scene_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view shots from shared projects"
  ON shots
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM scenes
      JOIN projects ON projects.id = scenes.project_id
      WHERE scenes.id = shots.scene_id
      AND projects.public_share_id IS NOT NULL
    )
  );

-- Scripts
CREATE POLICY "Users can manage their scripts"
  ON scripts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = scripts.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = scripts.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view scripts from shared projects"
  ON scripts
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = scripts.project_id
      AND projects.public_share_id IS NOT NULL
    )
  );
