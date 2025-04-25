/*
  # Add mindmap support
  
  1. Changes
    - Add `mindmap_data` column to projects table to store TLDraw data
*/

ALTER TABLE projects
ADD COLUMN mindmap_data jsonb;