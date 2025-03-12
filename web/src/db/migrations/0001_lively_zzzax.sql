ALTER TABLE "conversations" ALTER COLUMN "root_node_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "is_initialized" boolean DEFAULT false NOT NULL;