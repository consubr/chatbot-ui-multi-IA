-- Add credits column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits INT DEFAULT 0;

-- Function to deduct credits when a message is inserted
CREATE OR REPLACE FUNCTION deduct_credits_on_message()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if total_tokens is valid
    IF NEW.total_tokens IS NOT NULL AND NEW.total_tokens > 0 THEN
        UPDATE profiles
        -- Update the function to deduct credits and not allow it to go below 0
        SET credits = GREATEST(0, credits - NEW.total_tokens)
        WHERE user_id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function after a message is inserted
DROP TRIGGER IF EXISTS deduct_credits_on_message_trigger ON messages;

CREATE TRIGGER deduct_credits_on_message_trigger
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION deduct_credits_on_message();