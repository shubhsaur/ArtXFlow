CREATE TYPE "public"."connection_status" AS ENUM('CONNECTED', 'EXPIRED', 'REAUTH_REQUIRED', 'REVOKED');--> statement-breakpoint
CREATE TABLE "platform_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"connection_id" uuid NOT NULL,
	"external_id" text NOT NULL,
	"username" text NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "platform_acc_conn_ext_unique" UNIQUE("connection_id","external_id")
);
--> statement-breakpoint
CREATE TABLE "platform_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"status" "connection_status" DEFAULT 'CONNECTED' NOT NULL,
	"encrypted_secret" text NOT NULL,
	"token_metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "platform_accounts" ADD CONSTRAINT "platform_accounts_connection_id_platform_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."platform_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_connections" ADD CONSTRAINT "platform_connections_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "platform_acc_conn_idx" ON "platform_accounts" USING btree ("connection_id");--> statement-breakpoint
CREATE INDEX "platform_acc_username_idx" ON "platform_accounts" USING btree ("username");--> statement-breakpoint
CREATE INDEX "platform_conn_org_idx" ON "platform_connections" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "platform_conn_provider_idx" ON "platform_connections" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "platform_conn_status_idx" ON "platform_connections" USING btree ("status");--> statement-breakpoint
ALTER TABLE "destinations" ADD CONSTRAINT "destinations_connection_id_platform_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."platform_connections"("id") ON DELETE cascade ON UPDATE no action;