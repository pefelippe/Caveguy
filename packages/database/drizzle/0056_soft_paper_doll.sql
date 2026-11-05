DROP INDEX "conversation_whatsapp_once";--> statement-breakpoint
ALTER TABLE "conversation" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- Every Organization had one Member until now: its WhatsApp Conversation is that Member's.
UPDATE "conversation" SET "user_id" = (
  SELECT "member"."user_id" FROM "member"
  WHERE "member"."organization_id" = "conversation"."organization_id"
  ORDER BY "member"."created_at" LIMIT 1
) WHERE "channel" = 'WHATSAPP';--> statement-breakpoint
CREATE UNIQUE INDEX "conversation_whatsapp_member_once" ON "conversation" USING btree ("organization_id","user_id") WHERE "conversation"."channel" = 'WHATSAPP';