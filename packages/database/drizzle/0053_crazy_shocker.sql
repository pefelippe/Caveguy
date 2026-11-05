ALTER TABLE "bot" DROP CONSTRAINT "bot_organization_key_unique";--> statement-breakpoint
ALTER TABLE "bot" ADD COLUMN "instructions" text;--> statement-breakpoint
ALTER TABLE "bot" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "bot" ADD COLUMN "outfit" text;--> statement-breakpoint
CREATE UNIQUE INDEX "bot_organization_key_unique_fixed" ON "bot" USING btree ("organization_id","key") WHERE "bot"."name" is null;