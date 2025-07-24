-- PostgreSQL session table for scalable session management
-- This table is used by connect-pg-simple for session storage

CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- Create index on expire column for efficient cleanup
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

-- Comment explaining the table usage
COMMENT ON TABLE "session" IS 'Session storage for Express.js sessions using connect-pg-simple';
COMMENT ON COLUMN "session"."sid" IS 'Session ID (primary key)';
COMMENT ON COLUMN "session"."sess" IS 'Session data stored as JSON';
COMMENT ON COLUMN "session"."expire" IS 'Session expiration timestamp';