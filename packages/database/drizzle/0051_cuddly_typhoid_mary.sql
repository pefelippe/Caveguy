ALTER TABLE "user" ADD COLUMN "onboarded_at" timestamp with time zone;--> statement-breakpoint
-- Everyone already here has seen the app: only new Users get the wizard.
UPDATE "user" SET "onboarded_at" = now();
