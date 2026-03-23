CREATE TABLE "accounts_read" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"type" text NOT NULL,
	"clabe" text NOT NULL,
	"currency" text NOT NULL,
	"balance" numeric(18, 2) NOT NULL,
	"daily_limit" numeric(18, 2) NOT NULL,
	"status" text NOT NULL,
	"alias" text NOT NULL,
	"opened_at" timestamp with time zone NOT NULL
);
