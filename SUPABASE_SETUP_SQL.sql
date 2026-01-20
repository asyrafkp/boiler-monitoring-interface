-- Create boiler_readings table for storing Excel data
CREATE TABLE boiler_readings (
  id BIGSERIAL PRIMARY KEY,
  b1_steam NUMERIC NOT NULL,
  b2_steam NUMERIC NOT NULL,
  b3_steam NUMERIC NOT NULL,
  b1_water NUMERIC NOT NULL,
  b2_water NUMERIC NOT NULL,
  b3_water NUMERIC NOT NULL,
  ng_ratio NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_boiler_readings_created_at ON boiler_readings(created_at DESC);

-- Create admin_uploads table for tracking file uploads
CREATE TABLE admin_uploads (
  id BIGSERIAL PRIMARY KEY,
  file_name TEXT NOT NULL,
  uploaded_by TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rows_processed INTEGER,
  status TEXT DEFAULT 'success'
);

-- Create index for uploads
CREATE INDEX idx_admin_uploads_date ON admin_uploads(upload_date DESC);

-- Enable Row Level Security
ALTER TABLE boiler_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_uploads ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to boiler_readings" 
  ON boiler_readings FOR SELECT 
  TO anon USING (true);

CREATE POLICY "Allow public read access to admin_uploads" 
  ON admin_uploads FOR SELECT 
  TO anon USING (true);
