-- migrate:up

-- One row per password-reset email actually sent. The daily-quota check
-- in src/auth.ts counts rows in the last 24h to keep us under Resend's
-- free-tier ceiling.
CREATE TABLE password_reset_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sent_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    email text NOT NULL
);

CREATE INDEX password_reset_log_sent_at_idx ON password_reset_log (sent_at DESC);

-- migrate:down

DROP INDEX password_reset_log_sent_at_idx;
DROP TABLE password_reset_log;
