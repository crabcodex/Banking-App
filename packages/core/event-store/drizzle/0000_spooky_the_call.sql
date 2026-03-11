CREATE TABLE "events" (
	"global_position" bigserial PRIMARY KEY NOT NULL,
	"stream_id" text NOT NULL,
	"stream_version" integer NOT NULL,
	"event_type" text NOT NULL,
	"data" jsonb NOT NULL,
	"metadata" jsonb NOT NULL,
	"occurred_on" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snapshots" (
	"aggregate_id" text PRIMARY KEY NOT NULL,
	"version" integer NOT NULL,
	"state" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "uq_stream_version" ON "events" USING btree ("stream_id","stream_version");--> statement-breakpoint
CREATE INDEX "idx_events_stream_id" ON "events" USING btree ("stream_id","stream_version");--> statement-breakpoint
CREATE INDEX "idx_events_event_type" ON "events" USING btree ("event_type");