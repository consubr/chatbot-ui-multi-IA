-- Add token tracking columns to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS prompt_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completion_tokens INTEGER DEFAULT 0;

-- Optional: Add total_tokens if needed, but we can compute it
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS total_tokens INTEGER DEFAULT 0;
