-- Add this to your Supabase SQL to create the admin_settings table

CREATE TABLE admin_settings (
  id BIGSERIAL PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default OneDrive link setting
INSERT INTO admin_settings (setting_key, setting_value, description, updated_by)
VALUES (
  'onedrive_excel_link',
  'https://1drv.ms/f/c/B6A282DAF4E2A35F/IgDut87lcIP0QYgkXmaSdS71AZDxNKdtobdFZwBNOu4j9uU?e=kNphIz',
  'Direct link to OneDrive Excel file for automated sync',
  'system'
)
ON CONFLICT (setting_key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX idx_admin_settings_key ON admin_settings(setting_key);

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for GitHub Actions)
CREATE POLICY "Allow public read admin_settings"
  ON admin_settings FOR SELECT
  TO anon USING (true);

-- Allow authenticated users to update (only admins in practice)
CREATE POLICY "Allow authenticated update admin_settings"
  ON admin_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
