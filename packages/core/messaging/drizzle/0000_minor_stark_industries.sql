CREATE TABLE "outbox_checkpoint" (
	"id" text PRIMARY KEY DEFAULT 'outbox' NOT NULL,
	"last_position" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
