import { pgTable, text, integer, boolean, jsonb, serial, timestamp } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id:                      text("id").primaryKey(),
  name:                    text("name").notNull(),
  iconPath:                text("icon_path").notNull(),
  screenshotBase:          text("screenshot_base").notNull(),
  screenshotBaseByLocale:  jsonb("screenshot_base_by_locale").$type<Record<string, string>>().default({}),
  mockupPath:              text("mockup_path"),
  createdAt:               timestamp("created_at").defaultNow(),
});

export const productThemes = pgTable("product_themes", {
  productId: text("product_id").primaryKey().references(() => products.id, { onDelete: "cascade" }),
  tokens:    jsonb("tokens").notNull(),
});

export const productLocales = pgTable("product_locales", {
  id:        serial("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  code:      text("code").notNull(),
  label:     text("label").notNull(),
  flag:      text("flag"),
  sortOrder: integer("sort_order").notNull().default(0),
});

/**
 * One row per slide slot.
 * slideVariant = 'default' → belongs to product.slides (shown for all locales unless overridden)
 * slideVariant = 'vi'      → belongs to product.slidesByLocale.vi (replaces default when locale is 'vi')
 * The variant name for locale-overrides is the locale code by convention.
 */
export const productSlides = pgTable("product_slides", {
  id:            serial("id").primaryKey(),
  productId:     text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  device:        text("device").notNull(),          // 'iphone' | 'android'
  slideVariant:  text("slide_variant").notNull(),   // 'default' | 'vi' | 'en' …
  slideKey:      text("slide_key").notNull(),
  componentKey:  text("component_key").notNull(),
  sortOrder:     integer("sort_order").notNull().default(0),
});

/**
 * Text content for one slide × locale combination.
 * slideVariant links to productSlides.slideVariant.
 * locale     is the language of this copy row.
 * sortOrder  0 = primary copy (SlideDef.copy), 1+ = copyByLocale overrides (SlideDef.copyByLocale[locale]).
 *
 * Example for tinysteps default hero:
 *   slideVariant='default', locale='en', sortOrder=0  → primary copy
 *   slideVariant='default', locale='vi', sortOrder=1  → copyByLocale.vi
 *
 * Example for tinysteps vi-variant hero (slidesByLocale.vi):
 *   slideVariant='vi', locale='vi', sortOrder=0       → primary copy (only one)
 */
export const slideCopy = pgTable("slide_copy", {
  id:           serial("id").primaryKey(),
  productId:    text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  slideVariant: text("slide_variant").notNull(),
  slideKey:     text("slide_key").notNull(),
  locale:       text("locale").notNull(),
  sortOrder:    integer("sort_order").notNull().default(0),
  label:        text("label").notNull(),
  headline:     jsonb("headline").notNull(),   // RichTextSegment[]
  subtitle:     jsonb("subtitle").notNull(),   // RichTextSegment[]
});

export const productMetadata = pgTable("product_metadata", {
  id:               serial("id").primaryKey(),
  productId:        text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  locale:           text("locale").notNull(),
  name:             text("name").notNull(),
  subtitle:         text("subtitle").notNull().default(""),
  promoText:        text("promo_text").notNull().default(""),
  shortDescription: text("short_description").notNull().default(""),
  description:      text("description").notNull().default(""),
  keywords:         text("keywords").notNull().default(""),
});

export const productFeatureGraphics = pgTable("product_feature_graphics", {
  productId: text("product_id").primaryKey().references(() => products.id, { onDelete: "cascade" }),
  tagline:   text("tagline").notNull(),
  subtitle:  text("subtitle"),
});

export const productSocialOgs = pgTable("product_social_ogs", {
  productId: text("product_id").primaryKey().references(() => products.id, { onDelete: "cascade" }),
  tagline:   text("tagline").notNull(),
  subtitle:  text("subtitle"),
});

export const productCtaImages = pgTable("product_cta_images", {
  productId:         text("product_id").primaryKey().references(() => products.id, { onDelete: "cascade" }),
  headline:          text("headline").notNull(),
  headlineByLocale:  jsonb("headline_by_locale").$type<Record<string, string>>().default({}),
  sc1:               text("sc1").notNull(),
  sc2:               text("sc2").notNull(),
  ctaLabel:          text("cta_label"),
  ctaLabelByLocale:  jsonb("cta_label_by_locale").$type<Record<string, string>>().default({}),
});
