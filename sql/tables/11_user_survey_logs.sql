CREATE TABLE IF NOT EXISTS user_survey_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL,
  user_email VARCHAR(255),
  use_case VARCHAR(128) NOT NULL,
  priority VARCHAR(128),
  source VARCHAR(64) DEFAULT 'web',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_survey_user_id ON user_survey_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_survey_created_at ON user_survey_logs(created_at);
