/*
  # Add pages support for script editor
  
  1. New Tables
    - `script_pages`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `script_id` (uuid) - references scripts
      - `parent_id` (uuid) - self-reference for subpages
      - `title` (text)
      - `content` (jsonb)
      - `order` (integer)
      - `icon` (text)

  2. Security
    - Enable RLS on new table
    - Add policies for authenticated users
*/

CREATE TABLE script_pages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  script_id uuid REFERENCES scripts(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES script_pages(id) ON DELETE CASCADE,
  title text NOT NULL,
  content jsonb,
  "order" integer NOT NULL DEFAULT 0,
  icon text,
  CONSTRAINT valid_parent CHECK (parent_id != id) -- Prevent self-referencing
);

-- Add updated_at trigger
CREATE TRIGGER update_script_pages_updated_at
  BEFORE UPDATE ON script_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE script_pages ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can manage their script pages"
  ON script_pages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scripts
      JOIN projects ON projects.id = scripts.project_id
      WHERE scripts.id = script_pages.script_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scripts
      JOIN projects ON projects.id = scripts.project_id
      WHERE scripts.id = script_pages.script_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view pages from shared projects"
  ON script_pages
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM scripts
      JOIN projects ON projects.id = scripts.project_id
      WHERE scripts.id = script_pages.script_id
      AND projects.public_share_id IS NOT NULL
    )
  );