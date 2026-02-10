-- Create popup_settings table to manage which popups to display on homepage
CREATE TABLE IF NOT EXISTS popup_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  popup_type VARCHAR(50) NOT NULL UNIQUE, -- 'enquiry', 'message', 'both', 'none'
  is_active BOOLEAN DEFAULT true,
  title VARCHAR(255),
  description TEXT,
  delay_ms INTEGER DEFAULT 5000, -- Delay before showing popup in milliseconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create message_popup table to store message content for message popups
CREATE TABLE IF NOT EXISTS message_popup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  button_text VARCHAR(100),
  button_link VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  is_show_on_home_page BOOLEAN DEFAULT true,
  background_color VARCHAR(20) DEFAULT '#ffffff',
  text_color VARCHAR(20) DEFAULT '#000000',
  button_color VARCHAR(20) DEFAULT '#6a4c93',
  image_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create popup_control table to manage which popup type is currently active
CREATE TABLE IF NOT EXISTS popup_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  active_popup_type VARCHAR(50) DEFAULT 'none', -- 'enquiry', 'message', or 'none'
  message_popup_id UUID REFERENCES message_popup(id) ON DELETE SET NULL,
  enquiry_popup_delay_ms INTEGER DEFAULT 5000,
  is_enquiry_popup_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default popup control record
INSERT INTO popup_control (active_popup_type, is_enquiry_popup_enabled)
VALUES ('enquiry', true)
ON CONFLICT DO NOTHING;

-- Create an index for quick lookup
CREATE INDEX IF NOT EXISTS idx_popup_control_active ON popup_control(active_popup_type);
CREATE INDEX IF NOT EXISTS idx_message_popup_active ON message_popup(is_active);
