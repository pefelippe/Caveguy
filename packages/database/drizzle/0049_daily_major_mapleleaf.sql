ALTER TABLE "expense" ADD COLUMN IF NOT EXISTS "own_transfer" boolean DEFAULT false NOT NULL;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "holder" ADD CONSTRAINT "holder_organization_user_unique" UNIQUE("organization_id","user_id");
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
END $$;
