ALTER TABLE "product_cta_images" DROP CONSTRAINT "product_cta_images_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "product_feature_graphics" DROP CONSTRAINT "product_feature_graphics_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "product_locales" DROP CONSTRAINT "product_locales_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "product_metadata" DROP CONSTRAINT "product_metadata_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "product_social_ogs" DROP CONSTRAINT "product_social_ogs_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "product_themes" DROP CONSTRAINT "product_themes_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "slide_copy" DROP CONSTRAINT "slide_copy_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "slide_groups" DROP CONSTRAINT "slide_groups_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "product_cta_images" ADD CONSTRAINT "product_cta_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "product_feature_graphics" ADD CONSTRAINT "product_feature_graphics_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "product_locales" ADD CONSTRAINT "product_locales_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "product_metadata" ADD CONSTRAINT "product_metadata_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "product_social_ogs" ADD CONSTRAINT "product_social_ogs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "product_themes" ADD CONSTRAINT "product_themes_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "slide_copy" ADD CONSTRAINT "slide_copy_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "slide_groups" ADD CONSTRAINT "slide_groups_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE cascade;