-- Add attribution and device environment fingerprint fields to user_info table
ALTER TABLE user_info
  ADD COLUMN IF NOT EXISTS first_source VARCHAR(64) DEFAULT '',
  ADD COLUMN IF NOT EXISTS first_medium VARCHAR(64) DEFAULT '',
  ADD COLUMN IF NOT EXISTS first_campaign VARCHAR(128) DEFAULT '',
  ADD COLUMN IF NOT EXISTS first_referrer VARCHAR(255) DEFAULT '',
  ADD COLUMN IF NOT EXISTS first_landing VARCHAR(255) DEFAULT '',
  ADD COLUMN IF NOT EXISTS first_touch_at BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_source VARCHAR(64) DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_medium VARCHAR(64) DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_campaign VARCHAR(128) DEFAULT '',
  ADD COLUMN IF NOT EXISTS register_country VARCHAR(64) DEFAULT '',
  ADD COLUMN IF NOT EXISTS register_device VARCHAR(32) DEFAULT '',
  ADD COLUMN IF NOT EXISTS register_os VARCHAR(32) DEFAULT '',
  ADD COLUMN IF NOT EXISTS register_browser VARCHAR(32) DEFAULT '',
  ADD COLUMN IF NOT EXISTS register_lang VARCHAR(32) DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_user_info_first_source ON user_info(first_source);
CREATE INDEX IF NOT EXISTS idx_user_info_register_country ON user_info(register_country);
CREATE INDEX IF NOT EXISTS idx_user_info_first_touch_at ON user_info(first_touch_at);
