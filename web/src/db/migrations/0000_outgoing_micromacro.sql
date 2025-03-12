CREATE TABLE "conversation_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"query" text NOT NULL,
	"content" text,
	"type" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"response_generation_time" integer,
	"is_user_query" boolean DEFAULT false,
	"flagged_by_ai" boolean DEFAULT false,
	"flagged_by_user" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"root_node_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "node_children" (
	"parent_node_id" uuid NOT NULL,
	"child_node_id" uuid NOT NULL,
	"order_index" integer NOT NULL,
	CONSTRAINT "node_children_parent_node_id_child_node_id_pk" PRIMARY KEY("parent_node_id","child_node_id"),
	CONSTRAINT "node_children_parent_node_id_child_node_id_unique" UNIQUE("parent_node_id","child_node_id")
);
--> statement-breakpoint
CREATE TABLE "references" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"node_id" uuid NOT NULL,
	"source" text NOT NULL,
	"title" varchar(255),
	"content" text,
	"relevance_score" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "conversation_nodes" ADD CONSTRAINT "conversation_nodes_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node_children" ADD CONSTRAINT "node_children_parent_node_id_conversation_nodes_id_fk" FOREIGN KEY ("parent_node_id") REFERENCES "public"."conversation_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node_children" ADD CONSTRAINT "node_children_child_node_id_conversation_nodes_id_fk" FOREIGN KEY ("child_node_id") REFERENCES "public"."conversation_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "references" ADD CONSTRAINT "references_node_id_conversation_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."conversation_nodes"("id") ON DELETE cascade ON UPDATE no action;