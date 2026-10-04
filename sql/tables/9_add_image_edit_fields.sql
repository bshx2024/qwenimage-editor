-- Add input_image_url and task_type to works table for Qwen Image Editor
ALTER TABLE works ADD COLUMN IF NOT EXISTS input_image_url varchar;
ALTER TABLE works ADD COLUMN IF NOT EXISTS task_type varchar DEFAULT 'image_edit';

COMMENT ON COLUMN works.input_image_url IS 'original input image url for image-to-image or editing';
COMMENT ON COLUMN works.task_type IS 'task type: image_edit or text2image';
