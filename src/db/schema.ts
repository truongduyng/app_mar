import { pgTable, text, integer, jsonb, serial, timestamp, primaryKey, unique, boolean } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id:          text("id").primaryKey(),
  name:        text("name").notNull(),
  iconPath:    text("icon_path").notNull(),
  mockupPath:  text("mockup_path"),
  bundleId:         text("bundle_id"),
  packageName:      text("package_name"),
  privacyPolicyUrl: text("privacy_policy_url"),
  supportUrl:       text("support_url"),
  archived:         boolean("archived").notNull().default(false),
  createdAt:        timestamp("created_at").defaultNow(),
});

export const productThemes = pgTable("product_themes", {
  productId: text("product_id").primaryKey().references(() => products.id, { onDelete: "cascade" }),
  tokens:    jsonb("tokens").notNull(),
});

/**
 * Explicit locale list for a product. If empty, product is implicitly English-only.
 * sort_order=0 is the primary locale (maps to SlideDef.copy and ProductConfig.metadata).
 */
export const productLocales = pgTable("product_locales", {
  id:        serial("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  code:      text("code").notNull(),
  label:     text("label").notNull(),
  flag:      text("flag"),
  sortOrder: integer("sort_order").notNull().default(0),
}, (t) => [
  unique().on(t.productId, t.code),
]);

/**
 * Logical grouping of slides for a product.
 * name='default'      → product.slides  (shown unless a locale-specific group applies)
 * name=<locale-code>  → product.slidesByLocale[name]  (replaces default when that locale is active)
 */
export const slideGroups = pgTable("slide_groups", {
  id:        serial("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  name:      text("name").notNull(),   // 'default' | locale code e.g. 'vi'
  sortOrder: integer("sort_order").notNull().default(0),
}, (t) => [
  unique().on(t.productId, t.name),
]);

/**
 * Which locales activate a non-default slide group.
 * Presence of (group_id, locale) means: use this group when active locale = locale.
 */
export const slideGroupLocales = pgTable("slide_group_locales", {
  groupId: integer("group_id").notNull().references(() => slideGroups.id, { onDelete: "cascade" }),
  locale:  text("locale").notNull(),
}, (t) => [
  primaryKey({ columns: [t.groupId, t.locale] }),
]);

/**
 * Individual slide slots within a group.
 * imagePath: full public path to the screenshot image, e.g. /products/amfo/screenshots/sc1.png
 */
export const productSlides = pgTable("product_slides", {
  id:           serial("id").primaryKey(),
  groupId:      integer("group_id").notNull().references(() => slideGroups.id, { onDelete: "cascade" }),
  device:       text("device").notNull(),         // 'iphone' | 'android'
  slideKey:     text("slide_key").notNull(),
  componentKey: text("component_key").notNull(),
  imagePath:    text("image_path"),               // uploaded screenshot path, null until uploaded
  sortOrder:    integer("sort_order").notNull().default(0),
}, (t) => [
  unique().on(t.groupId, t.device, t.slideKey),
]);

/**
 * Text content for one (product, slide, locale) combination.
 */
export const slideCopy = pgTable("slide_copy", {
  id:        serial("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  slideKey:  text("slide_key").notNull(),
  locale:    text("locale").notNull(),
  label:     text("label").notNull(),
  headline:  jsonb("headline").notNull(),  // RichTextSegment[]
  subtitle:  jsonb("subtitle").notNull(),  // RichTextSegment[]
}, (t) => [
  unique().on(t.productId, t.slideKey, t.locale),
]);

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
  whatsNew:         text("whats_new").notNull().default(""),
}, (t) => [
  unique().on(t.productId, t.locale),
]);

export const productFeatureGraphics = pgTable("product_feature_graphics", {
  id:        serial("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  locale:    text("locale").notNull(),
  tagline:   text("tagline").notNull(),
  subtitle:  text("subtitle"),
}, (t) => [
  unique().on(t.productId, t.locale),
]);

export const productSocialOgs = pgTable("product_social_ogs", {
  id:        serial("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  locale:    text("locale").notNull(),
  tagline:   text("tagline").notNull(),
  subtitle:  text("subtitle"),
}, (t) => [
  unique().on(t.productId, t.locale),
]);

export const productCtaImages = pgTable("product_cta_images", {
  id:        serial("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  locale:    text("locale").notNull(),
  headline:  text("headline").notNull(),
  sc1:       text("sc1").notNull(),
  sc2:       text("sc2").notNull(),
  ctaLabel:  text("cta_label"),
}, (t) => [
  unique().on(t.productId, t.locale),
]);
