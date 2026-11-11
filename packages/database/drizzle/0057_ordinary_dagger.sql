ALTER TABLE "alert_state" ADD COLUMN "sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "conversation" ADD COLUMN "alerts" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "conversation_alerts_member_once" ON "conversation" USING btree ("organization_id","user_id") WHERE "conversation"."alerts";