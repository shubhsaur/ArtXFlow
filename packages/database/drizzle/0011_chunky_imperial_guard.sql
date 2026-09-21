CREATE TYPE "public"."asset_type" AS ENUM('IMAGE', 'DOCUMENT');--> statement-breakpoint
CREATE TABLE "analytics_raw_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"publication_id" uuid,
	"destination_id" uuid,
	"event_type" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"publication_id" uuid NOT NULL,
	"destination_id" uuid,
	"captured_at" timestamp with time zone NOT NULL,
	"views" bigint DEFAULT 0,
	"likes" bigint DEFAULT 0,
	"comments" bigint DEFAULT 0,
	"shares" bigint DEFAULT 0,
	"bookmarks" bigint DEFAULT 0,
	"metrics" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transformations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"article_version_id" uuid NOT NULL,
	"destination_id" uuid,
	"kind" text NOT NULL,
	"provider" text,
	"input_hash" text NOT NULL,
	"output_content" text NOT NULL,
	"output_metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" text DEFAULT 'PENDING_APPROVAL' NOT NULL,
	"approved_at" timestamp with time zone,
	"approved_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"type" "asset_type" DEFAULT 'IMAGE' NOT NULL,
	"storage_key" text NOT NULL,
	"file_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"width" integer,
	"height" integer,
	"url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"username" text,
	"job_title" text,
	"canonical_url" text,
	"bio" text,
	"public_email" text,
	"github_handle" text,
	"devto_handle" text,
	"hashnode_handle" text,
	"twitter_handle" text,
	"notify_success" boolean DEFAULT true NOT NULL,
	"notify_failure" boolean DEFAULT true NOT NULL,
	"notify_weekly_digest" boolean DEFAULT false NOT NULL,
	"launchpad_dismissed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"key_hash" text NOT NULL,
	"key_prefix" text NOT NULL,
	"scopes" text[] NOT NULL,
	"revoked_at" timestamp with time zone,
	"last_used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analytics_raw_events" ADD CONSTRAINT "analytics_raw_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_raw_events" ADD CONSTRAINT "analytics_raw_events_publication_id_publications_id_fk" FOREIGN KEY ("publication_id") REFERENCES "public"."publications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_raw_events" ADD CONSTRAINT "analytics_raw_events_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_snapshots" ADD CONSTRAINT "analytics_snapshots_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_snapshots" ADD CONSTRAINT "analytics_snapshots_publication_id_publications_id_fk" FOREIGN KEY ("publication_id") REFERENCES "public"."publications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_snapshots" ADD CONSTRAINT "analytics_snapshots_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transformations" ADD CONSTRAINT "transformations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transformations" ADD CONSTRAINT "transformations_article_version_id_article_versions_id_fk" FOREIGN KEY ("article_version_id") REFERENCES "public"."article_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transformations" ADD CONSTRAINT "transformations_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analytics_raw_events_org_idx" ON "analytics_raw_events" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "analytics_raw_events_pub_idx" ON "analytics_raw_events" USING btree ("publication_id");--> statement-breakpoint
CREATE INDEX "analytics_raw_events_dest_idx" ON "analytics_raw_events" USING btree ("destination_id");--> statement-breakpoint
CREATE INDEX "analytics_raw_events_type_idx" ON "analytics_raw_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "analytics_snapshots_org_idx" ON "analytics_snapshots" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "analytics_snapshots_pub_captured_idx" ON "analytics_snapshots" USING btree ("publication_id","captured_at");--> statement-breakpoint
CREATE INDEX "analytics_snapshots_dest_idx" ON "analytics_snapshots" USING btree ("destination_id");--> statement-breakpoint
CREATE INDEX "transformations_org_idx" ON "transformations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "transformations_version_idx" ON "transformations" USING btree ("article_version_id");--> statement-breakpoint
CREATE INDEX "transformations_dest_idx" ON "transformations" USING btree ("destination_id");--> statement-breakpoint
CREATE INDEX "transformations_status_idx" ON "transformations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "assets_org_idx" ON "assets" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "assets_storage_key_idx" ON "assets" USING btree ("storage_key");