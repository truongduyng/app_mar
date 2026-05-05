CREATE TABLE "product_cta_images" (
	"product_id" text PRIMARY KEY NOT NULL,
	"headline" text NOT NULL,
	"headline_by_locale" jsonb DEFAULT '{}'::jsonb,
	"sc1" text NOT NULL,
	"sc2" text NOT NULL,
	"cta_label" text,
	"cta_label_by_locale" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "product_feature_graphics" (
	"product_id" text PRIMARY KEY NOT NULL,
	"tagline" text NOT NULL,
	"subtitle" text
);
--> statement-breakpoint
CREATE TABLE "product_locales" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"flag" text,
	"sort_order" integer DEFAULT 0 NOT NULL
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
	"keywords" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_slides" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"device" text NOT NULL,
	"slide_variant" text NOT NULL,
	"slide_key" text NOT NULL,
	"component_key" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_social_ogs" (
	"product_id" text PRIMARY KEY NOT NULL,
	"tagline" text NOT NULL,
	"subtitle" text
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
	"screenshot_base_by_locale" jsonb DEFAULT '{}'::jsonb,
	"mockup_path" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "slide_copy" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"slide_variant" text NOT NULL,
	"slide_key" text NOT NULL,
	"locale" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"label" text NOT NULL,
	"headline" jsonb NOT NULL,
	"subtitle" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_cta_images" ADD CONSTRAINT "product_cta_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_feature_graphics" ADD CONSTRAINT "product_feature_graphics_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_locales" ADD CONSTRAINT "product_locales_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_metadata" ADD CONSTRAINT "product_metadata_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_slides" ADD CONSTRAINT "product_slides_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_social_ogs" ADD CONSTRAINT "product_social_ogs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_themes" ADD CONSTRAINT "product_themes_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slide_copy" ADD CONSTRAINT "slide_copy_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;