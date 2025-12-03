-- Fix the Review table sequence after manual ID inserts
-- This script resets the sequence to the next available ID

SELECT setval(
    pg_get_serial_sequence('review', 'id'),
    (SELECT MAX(id) FROM review)
);

-- Verify the sequence was set correctly
SELECT last_value FROM review_id_seq;
