CREATE TYPE "public"."schedule_status" AS ENUM('SCHEDULED', 'EXECUTING', 'COMPLETED', 'CANCELED', 'FAILED');--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"article_id" uuid NOT NULL,
	"article_version_id" uuid NOT NULL,
	"destination_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"destination_overrides" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"status" "schedule_status" DEFAULT 'SCHEDULED' NOT NULL,
	"workflow_id" text,
	"error_message" text,
	"error_code" text,
	"executed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_article_version_id_article_versions_id_fk" FOREIGN KEY ("article_version_id") REFERENCES "public"."article_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "schedules_org_idx" ON "schedules" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "schedules_article_idx" ON "schedules" USING btree ("article_id");--> statement-breakpoint
CREATE INDEX "schedules_version_idx" ON "schedules" USING btree ("article_version_id");--> statement-breakpoint
CREATE INDEX "schedules_status_idx" ON "schedules" USING btree ("status");--> statement-breakpoint
CREATE INDEX "schedules_scheduled_at_idx" ON "schedules" USING btree ("scheduled_at");