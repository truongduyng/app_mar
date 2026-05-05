CREATE TABLE "product_cta_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"locale" text NOT NULL,
	"headline" text NOT NULL,
	"sc1" text NOT NULL,
	"sc2" text NOT NULL,
	"cta_label" text,
	CONSTRAINT "product_cta_images_product_id_locale_unique" UNIQUE("product_id","locale")
);
--> statement-breakpoint
CREATE TABLE "product_feature_graphics" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"locale" text NOT NULL,
	"tagline" text NOT NULL,
	"subtitle" text,
	CONSTRAINT "product_feature_graphics_product_id_locale_unique" UNIQUE("product_id","locale")
);
--> statement-breakpoint
CREATE TABLE "product_locales" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"flag" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"screenshot_base_override" text,
	CONSTRAINT "product_locales_product_id_code_unique" UNIQUE("product_id","code")
);
--> statement-breakpoint
CREATE TABLE "product_metadata" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"locale" text NOT NULL,
	"name" text NOT NULL,
	"subtitle" text DEFAULT '' NOT NULL,
	"promo_text" text DEFAULT '' NOT NULL,
	"short_description" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"keywords" text DEFAULT '' NOT NULL,
	CONSTRAINT "product_metadata_product_id_locale_unique" UNIQUE("product_id","locale")
);
--> statement-breakpoint
CREATE TABLE "product_slides" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"device" text NOT NULL,
	"slide_key" text NOT NULL,
	"component_key" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "product_slides_group_id_device_slide_key_unique" UNIQUE("group_id","device","slide_key")
);
--> statement-breakpoint
CREATE TABLE "product_social_ogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"locale" text NOT NULL,
	"tagline" text NOT NULL,
	"subtitle" text,
	CONSTRAINT "product_social_ogs_product_id_locale_unique" UNIQUE("product_id","locale")
);
--> statement-breakpoint
CREATE TABLE "product_themes" (
	"product_id" text PRIMARY KEY NOT NULL,
	"tokens" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"icon_path" text NOT NULL,
	"screenshot_base" text NOT NULL,
	"mockup_path" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "slide_copy" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"slide_key" text NOT NULL,
	"locale" text NOT NULL,
	"label" text NOT NULL,
	"headline" jsonb NOT NULL,
	"subtitle" jsonb NOT NULL,
	CONSTRAINT "slide_copy_product_id_slide_key_locale_unique" UNIQUE("product_id","slide_key","locale")
);
--> statement-breakpoint
CREATE TABLE "slide_group_locales" (
	"group_id" integer NOT NULL,
	"locale" text NOT NULL,
	CONSTRAINT "slide_group_locales_group_id_locale_pk" PRIMARY KEY("group_id","locale")
);
--> statement-breakpoint
CREATE TABLE "slide_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "slide_groups_product_id_name_unique" UNIQUE("product_id","name")
);
--> statement-breakpoint
ALTER TABLE "product_cta_images" ADD CONSTRAINT "product_cta_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_feature_graphics" ADD CONSTRAINT "product_feature_graphics_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_locales" ADD CONSTRAINT "product_locales_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_metadata" ADD CONSTRAINT "product_metadata_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_slides" ADD CONSTRAINT "product_slides_group_id_slide_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."slide_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_social_ogs" ADD CONSTRAINT "product_social_ogs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_themes" ADD CONSTRAINT "product_themes_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slide_copy" ADD CONSTRAINT "slide_copy_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slide_group_locales" ADD CONSTRAINT "slide_group_locales_group_id_slide_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."slide_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slide_groups" ADD CONSTRAINT "slide_groups_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;