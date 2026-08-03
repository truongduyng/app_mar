/**
 * Seed script — populates the DB with all product data.
 * Usage: DATABASE_URL=... bun run src/db/seed.ts
 */
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { txt, br, acc } from "@/lib/rich-text";
import type { RichTextSegment } from "@/lib/rich-text";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(sql, { schema });

type CopyRow = {
  productId: string;
  slideKey: string;
  locale: string;
  label: string;
  headline: RichTextSegment[];
};

type SlideRow = {
  groupKey: string; // "productId:groupName", e.g. "hone:default"
  device: string;
  slideKey: string;
  componentKey: string;
  sortOrder: number;
};

// ─── HONE ─────────────────────────────────────────────────────────────────

const honeSlides: SlideRow[] = [
  {
    groupKey: "hone:default",
    device: "iphone",
    slideKey: "hero",
    componentKey: "GenericCenteredSlide",
    sortOrder: 0,
  },
  {
    groupKey: "hone:default",
    device: "iphone",
    slideKey: "journal",
    componentKey: "GenericCenteredSlide",
    sortOrder: 1,
  },
  {
    groupKey: "hone:default",
    device: "iphone",
    slideKey: "protocol",
    componentKey: "GenericCenteredSlide",
    sortOrder: 2,
  },
  {
    groupKey: "hone:default",
    device: "iphone",
    slideKey: "reward",
    componentKey: "GenericCenteredSlide",
    sortOrder: 3,
  },
  {
    groupKey: "hone:default",
    device: "iphone",
    slideKey: "progress",
    componentKey: "GenericCenteredSlide",
    sortOrder: 4,
  },
  {
    groupKey: "hone:default",
    device: "iphone",
    slideKey: "goals",
    componentKey: "GenericCenteredSlide",
    sortOrder: 5,
  },
  {
    groupKey: "hone:default",
    device: "iphone",
    slideKey: "proof",
    componentKey: "GenericCenteredSlide",
    sortOrder: 6,
  },
];

const honeCopy: CopyRow[] = [
  {
    productId: "hone",
    slideKey: "hero",
    locale: "en",
    label: "THE POWER OF SMALL HABITS",
    headline: [txt("Lasting Change."), br(), acc("Starts Today.")],
  },
  {
    productId: "hone",
    slideKey: "journal",
    locale: "en",
    label: "MINDFUL REFLECTION",
    headline: [txt("Reflect. Align."), br(), acc("Thrive.")],
  },
  {
    productId: "hone",
    slideKey: "protocol",
    locale: "en",
    label: "DAILY WELL-BEING",
    headline: [txt("Micro-Habits."), br(), acc("Macro Growth.")],
  },
  {
    productId: "hone",
    slideKey: "reward",
    locale: "en",
    label: "STAY CONSISTENT",
    headline: [txt("Celebrate"), br(), acc("Every Win")],
  },
  {
    productId: "hone",
    slideKey: "progress",
    locale: "en",
    label: "HOLISTIC PROGRESS",
    headline: [txt("Visualize"), br(), acc("Your Evolution")],
  },
  {
    productId: "hone",
    slideKey: "goals",
    locale: "en",
    label: "SYSTEMS FOR LIFE",
    headline: [txt("Daily Actions"), br(), acc("Not Overhauls")],
  },
  {
    productId: "hone",
    slideKey: "proof",
    locale: "en",
    label: "YOUR JOURNEY",
    headline: [txt("Document"), br(), acc("The Best You")],
  },
];

// ─── AMFO ─────────────────────────────────────────────────────────────────

const amfoSlides: SlideRow[] = [
  {
    groupKey: "amfo:default",
    device: "iphone",
    slideKey: "calm",
    componentKey: "GenericCenteredSlide",
    sortOrder: 0,
  },
  {
    groupKey: "amfo:default",
    device: "iphone",
    slideKey: "mix",
    componentKey: "GenericCenteredSlide",
    sortOrder: 1,
  },
  {
    groupKey: "amfo:default",
    device: "iphone",
    slideKey: "timer",
    componentKey: "GenericCenteredSlide",
    sortOrder: 2,
  },
  {
    groupKey: "amfo:default",
    device: "iphone",
    slideKey: "focus",
    componentKey: "GenericCenteredSlide",
    sortOrder: 3,
  },
  {
    groupKey: "amfo:default",
    device: "iphone",
    slideKey: "settings",
    componentKey: "GenericCenteredSlide",
    sortOrder: 4,
  },
];

const amfoCopy: CopyRow[] = [
  {
    productId: "amfo",
    slideKey: "calm",
    locale: "en",
    label: "AMBIENT SOUNDS",
    headline: [txt("Find"), br(), acc("your calm.")],
  },
  {
    productId: "amfo",
    slideKey: "mix",
    locale: "en",
    label: "SOUND MIXER",
    headline: [txt("Layer sounds."), br(), acc("Save presets.")],
  },
  {
    productId: "amfo",
    slideKey: "timer",
    locale: "en",
    label: "FOCUS TIMER",
    headline: [txt("Set a timer."), br(), acc("Disappear.")],
  },
  {
    productId: "amfo",
    slideKey: "focus",
    locale: "en",
    label: "DEEP FOCUS",
    headline: [txt("Silence"), br(), acc("the noise.")],
  },
  {
    productId: "amfo",
    slideKey: "settings",
    locale: "en",
    label: "CUSTOMIZE",
    headline: [txt("Your perfect"), br(), acc("environment")],
  },
];

// ─── LICHTA ───────────────────────────────────────────────────────────────

const lichtaSlides: SlideRow[] = [
  {
    groupKey: "lichta:default",
    device: "iphone",
    slideKey: "hero",
    componentKey: "GenericCenteredSlide",
    sortOrder: 0,
  },
  {
    groupKey: "lichta:default",
    device: "iphone",
    slideKey: "events",
    componentKey: "GenericSideSlide",
    sortOrder: 1,
  },
  {
    groupKey: "lichta:default",
    device: "iphone",
    slideKey: "calendar",
    componentKey: "GenericCenteredSlide",
    sortOrder: 2,
  },
  {
    groupKey: "lichta:default",
    device: "iphone",
    slideKey: "ai",
    componentKey: "GenericCenteredSlide",
    sortOrder: 3,
  },
  {
    groupKey: "lichta:default",
    device: "iphone",
    slideKey: "themes",
    componentKey: "GenericSideSlide",
    sortOrder: 4,
  },
  {
    groupKey: "lichta:default",
    device: "iphone",
    slideKey: "wisdom",
    componentKey: "GenericCenteredSlide",
    sortOrder: 5,
  },
  {
    groupKey: "lichta:default",
    device: "iphone",
    slideKey: "widgets",
    componentKey: "GenericCenteredSlide",
    sortOrder: 6,
  },
  {
    groupKey: "lichta:default",
    device: "android",
    slideKey: "hero",
    componentKey: "GenericAndroidCenteredSlide",
    sortOrder: 0,
  },
  {
    groupKey: "lichta:default",
    device: "android",
    slideKey: "events",
    componentKey: "GenericAndroidSideSlide",
    sortOrder: 1,
  },
  {
    groupKey: "lichta:default",
    device: "android",
    slideKey: "calendar",
    componentKey: "GenericAndroidCenteredSlide",
    sortOrder: 2,
  },
  {
    groupKey: "lichta:default",
    device: "android",
    slideKey: "ai",
    componentKey: "GenericAndroidCenteredSlide",
    sortOrder: 3,
  },
  {
    groupKey: "lichta:default",
    device: "android",
    slideKey: "themes",
    componentKey: "GenericAndroidSideSlide",
    sortOrder: 4,
  },
  {
    groupKey: "lichta:default",
    device: "android",
    slideKey: "wisdom",
    componentKey: "GenericAndroidCenteredSlide",
    sortOrder: 5,
  },
  {
    groupKey: "lichta:default",
    device: "android",
    slideKey: "widgets",
    componentKey: "GenericAndroidCenteredSlide",
    sortOrder: 6,
  },
];

// Lichta primary locale is 'vi'; 'en' becomes copyByLocale
const lichtaCopy: CopyRow[] = [
  {
    productId: "lichta",
    slideKey: "hero",
    locale: "vi",
    label: "LỊCH ÂM VIỆT NAM",
    headline: [txt("Lịch Âm"), br(), acc("trong tầm tay.")],
  },
  {
    productId: "lichta",
    slideKey: "hero",
    locale: "en",
    label: "LUNAR CALENDAR",
    headline: [txt("Today's date,"), br(), acc("at a glance.")],
  },
  {
    productId: "lichta",
    slideKey: "events",
    locale: "vi",
    label: "SỰ KIỆN ÂM LỊCH",
    headline: [txt("Không bao giờ"), br(), acc("quên ngày giỗ.")],
  },
  {
    productId: "lichta",
    slideKey: "events",
    locale: "en",
    label: "LUNAR EVENTS",
    headline: [txt("Never miss"), br(), acc("an anniversary.")],
  },
  {
    productId: "lichta",
    slideKey: "calendar",
    locale: "vi",
    label: "LỊCH ÂM CHI TIẾT",
    headline: [txt("Can Chi,"), br(), acc("Hoàng Đạo.")],
  },
  {
    productId: "lichta",
    slideKey: "calendar",
    locale: "en",
    label: "DETAILED LUNAR",
    headline: [txt("Can Chi &"), br(), acc("Auspicious Hours.")],
  },
  {
    productId: "lichta",
    slideKey: "ai",
    locale: "vi",
    label: "XEM TỬ VI AI",
    headline: [txt("Tử Vi AI"), br(), acc("bất cứ lúc nào.")],
  },
  {
    productId: "lichta",
    slideKey: "ai",
    locale: "en",
    label: "LICH TA AI MASTER",
    headline: [txt("Your AI Astrologer,"), br(), acc("anytime.")],
  },
  {
    productId: "lichta",
    slideKey: "themes",
    locale: "vi",
    label: "GIAO DIỆN CÁ NHÂN",
    headline: [txt("Màu sắc"), br(), acc("theo ý bạn.")],
  },
  {
    productId: "lichta",
    slideKey: "themes",
    locale: "en",
    label: "PERSONAL THEMES",
    headline: [txt("Colors"), br(), acc("your way.")],
  },
  {
    productId: "lichta",
    slideKey: "wisdom",
    locale: "vi",
    label: "TỬ VI - PHONG THỦY",
    headline: [txt("Vận mệnh."), br(), acc("Rõ từng ngày.")],
  },
  {
    productId: "lichta",
    slideKey: "wisdom",
    locale: "en",
    label: "ASTROLOGY & FENG SHUI",
    headline: [txt("Your destiny."), br(), acc("Day by day.")],
  },
  {
    productId: "lichta",
    slideKey: "widgets",
    locale: "vi",
    label: "",
    headline: [txt("Widget đẹp"), br(), acc("mỗi ngày.")],
  },
  {
    productId: "lichta",
    slideKey: "widgets",
    locale: "en",
    label: "",
    headline: [txt("Beautiful widgets"), br(), acc("every day.")],
  },
];

// ─── TINYSTEPS ────────────────────────────────────────────────────────────

const tinystepsSlides: SlideRow[] = [
  // default group — English screenshots; en is primary, vi is copyByLocale
  {
    groupKey: "tinysteps:default",
    device: "iphone",
    slideKey: "hero",
    componentKey: "GenericCenteredSlide",
    sortOrder: 0,
  },
  {
    groupKey: "tinysteps:default",
    device: "iphone",
    slideKey: "milestones",
    componentKey: "GenericCenteredSlide",
    sortOrder: 1,
  },
  {
    groupKey: "tinysteps:default",
    device: "iphone",
    slideKey: "vaccinations",
    componentKey: "GenericCenteredSlide",
    sortOrder: 2,
  },
  {
    groupKey: "tinysteps:default",
    device: "iphone",
    slideKey: "journal",
    componentKey: "GenericCenteredSlide",
    sortOrder: 3,
  },
  {
    groupKey: "tinysteps:default",
    device: "iphone",
    slideKey: "ai-chat",
    componentKey: "GenericCenteredSlide",
    sortOrder: 4,
  },
  {
    groupKey: "tinysteps:default",
    device: "iphone",
    slideKey: "family",
    componentKey: "GenericSideSlide",
    sortOrder: 5,
  },
  {
    groupKey: "tinysteps:default",
    device: "iphone",
    slideKey: "growth",
    componentKey: "GenericCenteredSlide",
    sortOrder: 6,
  },
  // vi group — Vietnamese screenshots; vi-prefixed slide keys avoid collisions with default group
  {
    groupKey: "tinysteps:vi",
    device: "iphone",
    slideKey: "vi-hero",
    componentKey: "GenericCenteredSlide",
    sortOrder: 0,
  },
  {
    groupKey: "tinysteps:vi",
    device: "iphone",
    slideKey: "vi-journal",
    componentKey: "GenericCenteredSlide",
    sortOrder: 1,
  },
  {
    groupKey: "tinysteps:vi",
    device: "iphone",
    slideKey: "vi-ai-chat",
    componentKey: "GenericCenteredSlide",
    sortOrder: 2,
  },
  {
    groupKey: "tinysteps:vi",
    device: "iphone",
    slideKey: "vi-settings",
    componentKey: "GenericCenteredSlide",
    sortOrder: 3,
  },
  {
    groupKey: "tinysteps:vi",
    device: "iphone",
    slideKey: "vi-milestones",
    componentKey: "GenericCenteredSlide",
    sortOrder: 4,
  },
  {
    groupKey: "tinysteps:vi",
    device: "iphone",
    slideKey: "vi-vaccinations",
    componentKey: "GenericCenteredSlide",
    sortOrder: 5,
  },
];

const tinystepsCopy: CopyRow[] = [
  // default group — en primary + vi copyByLocale
  {
    productId: "tinysteps",
    slideKey: "hero",
    locale: "en",
    label: "BABY GROWTH TRACKER",
    headline: [txt("Every milestone."), br(), acc("Captured.")],
  },
  {
    productId: "tinysteps",
    slideKey: "hero",
    locale: "vi",
    label: "THEO DÕI BÉ LỚN",
    headline: [txt("Từng bước nhỏ."), br(), acc("Đều đáng nhớ.")],
  },
  {
    productId: "tinysteps",
    slideKey: "milestones",
    locale: "en",
    label: "DEVELOPMENTAL MILESTONES",
    headline: [txt("Never miss"), br(), acc("a first.")],
  },
  {
    productId: "tinysteps",
    slideKey: "milestones",
    locale: "vi",
    label: "CỘT MỐC PHÁT TRIỂN",
    headline: [txt("Đừng bỏ lỡ"), br(), acc("khoảnh khắc nào.")],
  },
  {
    productId: "tinysteps",
    slideKey: "vaccinations",
    locale: "en",
    label: "VACCINATION TRACKER",
    headline: [txt("Stay on"), br(), acc("schedule.")],
  },
  {
    productId: "tinysteps",
    slideKey: "vaccinations",
    locale: "vi",
    label: "LỊCH TIÊM CHỦNG",
    headline: [txt("Đúng lịch."), br(), acc("An tâm.")],
  },
  {
    productId: "tinysteps",
    slideKey: "journal",
    locale: "en",
    label: "BABY JOURNAL",
    headline: [txt("Memories"), br(), acc("worth keeping.")],
  },
  {
    productId: "tinysteps",
    slideKey: "journal",
    locale: "vi",
    label: "NHẬT KÝ BÉ YÊU",
    headline: [txt("Kỷ niệm"), br(), acc("đáng giữ.")],
  },
  {
    productId: "tinysteps",
    slideKey: "ai-chat",
    locale: "en",
    label: "AI PARENTING GUIDE",
    headline: [txt("Ask anything."), br(), acc("Get answers.")],
  },
  {
    productId: "tinysteps",
    slideKey: "ai-chat",
    locale: "vi",
    label: "TRỢ LÝ AI CHO BỐ MẸ",
    headline: [txt("Hỏi gì"), br(), acc("cũng được.")],
  },
  {
    productId: "tinysteps",
    slideKey: "family",
    locale: "en",
    label: "FAMILY SHARING",
    headline: [txt("Track"), br(), acc("together.")],
  },
  {
    productId: "tinysteps",
    slideKey: "family",
    locale: "vi",
    label: "CHIA SẺ GIA ĐÌNH",
    headline: [txt("Cùng nhau"), br(), acc("theo dõi.")],
  },
  {
    productId: "tinysteps",
    slideKey: "growth",
    locale: "en",
    label: "COMPLETE PICTURE",
    headline: [txt("Watch them"), br(), acc("grow.")],
  },
  {
    productId: "tinysteps",
    slideKey: "growth",
    locale: "vi",
    label: "BỨC TRANH TOÀN DIỆN",
    headline: [txt("Nhìn bé"), br(), acc("lớn lên.")],
  },
  // vi group — vi locale only (locale-specific slides shown when locale='vi')
  {
    productId: "tinysteps",
    slideKey: "vi-hero",
    locale: "vi",
    label: "THEO DÕI BÉ LỚN",
    headline: [txt("Từng bước nhỏ."), br(), acc("Đều đáng nhớ.")],
  },
  {
    productId: "tinysteps",
    slideKey: "vi-journal",
    locale: "vi",
    label: "NHẬT KÝ BÉ YÊU",
    headline: [txt("Kỷ niệm"), br(), acc("đáng giữ.")],
  },
  {
    productId: "tinysteps",
    slideKey: "vi-ai-chat",
    locale: "vi",
    label: "TRỢ LÝ AI CHO BỐ MẸ",
    headline: [txt("Hỏi gì"), br(), acc("cũng được.")],
  },
  {
    productId: "tinysteps",
    slideKey: "vi-settings",
    locale: "vi",
    label: "TUỲ CHỈNH THEO Ý BẠN",
    headline: [txt("Cài đặt"), br(), acc("theo sở thích.")],
  },
  {
    productId: "tinysteps",
    slideKey: "vi-milestones",
    locale: "vi",
    label: "CỘT MỐC PHÁT TRIỂN",
    headline: [txt("Đừng bỏ lỡ"), br(), acc("khoảnh khắc nào.")],
  },
  {
    productId: "tinysteps",
    slideKey: "vi-vaccinations",
    locale: "vi",
    label: "LỊCH TIÊM CHỦNG",
    headline: [txt("Đúng lịch."), br(), acc("An tâm.")],
  },
];

// ─── FITFO ────────────────────────────────────────────────────────────────

const fitfoSlides: SlideRow[] = [
  {
    groupKey: "fitfo:default",
    device: "iphone",
    slideKey: "hero",
    componentKey: "GenericCenteredSlide",
    sortOrder: 0,
  },
  {
    groupKey: "fitfo:default",
    device: "iphone",
    slideKey: "workout",
    componentKey: "GenericCenteredSlide",
    sortOrder: 1,
  },
  {
    groupKey: "fitfo:default",
    device: "iphone",
    slideKey: "nutrition",
    componentKey: "GenericCenteredSlide",
    sortOrder: 2,
  },
  {
    groupKey: "fitfo:default",
    device: "iphone",
    slideKey: "fit-score",
    componentKey: "GenericCenteredSlide",
    sortOrder: 3,
  },
  {
    groupKey: "fitfo:default",
    device: "iphone",
    slideKey: "forecast",
    componentKey: "GenericCenteredSlide",
    sortOrder: 4,
  },
  {
    groupKey: "fitfo:default",
    device: "iphone",
    slideKey: "body-type",
    componentKey: "GenericCenteredSlide",
    sortOrder: 5,
  },
  {
    groupKey: "fitfo:default",
    device: "iphone",
    slideKey: "progress",
    componentKey: "GenericSideSlide",
    sortOrder: 6,
  },
  {
    groupKey: "fitfo:default",
    device: "iphone",
    slideKey: "more",
    componentKey: "GenericFeatureListSlide",
    sortOrder: 7,
  },
];

const fitfoCopy: CopyRow[] = [
  {
    productId: "fitfo",
    slideKey: "hero",
    locale: "en",
    label: "FITNESS TRACKER",
    headline: [txt("Your fitness."), br(), acc("Scored.")],
  },
  {
    productId: "fitfo",
    slideKey: "workout",
    locale: "en",
    label: "AI WORKOUT PLAN",
    headline: [txt("Train smarter."), br(), acc("Every day.")],
  },
  {
    productId: "fitfo",
    slideKey: "nutrition",
    locale: "en",
    label: "NUTRITION TRACKING",
    headline: [txt("Fuel the"), br(), acc("right way.")],
  },
  {
    productId: "fitfo",
    slideKey: "fit-score",
    locale: "en",
    label: "PERSONAL FIT SCORE",
    headline: [txt("Know where"), br(), acc("you stand.")],
  },
  {
    productId: "fitfo",
    slideKey: "forecast",
    locale: "en",
    label: "30-DAY FORECAST",
    headline: [txt("See what's"), br(), acc("possible.")],
  },
  {
    productId: "fitfo",
    slideKey: "body-type",
    locale: "en",
    label: "PERSONALIZED ONBOARDING",
    headline: [txt("Built for"), br(), acc("your body.")],
  },
  {
    productId: "fitfo",
    slideKey: "progress",
    locale: "en",
    label: "VISUAL PROGRESS",
    headline: [txt("Watch the"), br(), acc("change.")],
  },
  {
    productId: "fitfo",
    slideKey: "more",
    locale: "en",
    label: "EVERYTHING YOU NEED",
    headline: [txt("And so"), br(), acc("much more.")],
  },
];

// ─── SEED ─────────────────────────────────────────────────────────────────

async function seed() {
  console.log("Seeding database…");

  // Clear in reverse dependency order
  await db.delete(schema.slideCopy);
  await db.delete(schema.productSlides);
  await db.delete(schema.slideGroupLocales);
  await db.delete(schema.slideGroups);
  await db.delete(schema.productMetadata);
  await db.delete(schema.productFeatureGraphics);
  await db.delete(schema.productSocialOgs);
  await db.delete(schema.productCtaImages);
  await db.delete(schema.productLocales);
  await db.delete(schema.productThemes);
  await db.delete(schema.products);

  // ── Products ────────────────────────────────────────────────────────────
  await db.insert(schema.products).values([
    {
      id: "hone",
      name: "Life Refine",
      iconPath: "/products/hone/icon.png",
    },
    {
      id: "amfo",
      name: "Amfo: Ambient Focus Sounds",
      iconPath: "/products/amfo/icon.png",
    },
    {
      id: "lichta",
      name: "Lịch Ta - Lịch Âm & Tử Vi AI",
      iconPath: "/products/lichta/icon.png",
    },
    {
      id: "tinysteps",
      name: "TinySteps: Baby Growth Tracker",
      iconPath: "/products/tinysteps/icon.png",
    },
    {
      id: "fitfo",
      name: "FitFo: Workout Plan & Log Pal",
      iconPath: "/products/fitfo/icon.png",
    },
  ]);

  // ── Themes ───────────────────────────────────────────────────────────────
  await db.insert(schema.productThemes).values([
    {
      productId: "hone",
      tokens: {
        bg: "#0A0A0C",
        bgAlt: "#111114",
        fg: "#F8F8F2",
        fgMuted: "#8A8A94",
        accent: "#F97316",
        accentGlow: "rgba(249,115,22,0.35)",
        accentSoft: "rgba(249,115,22,0.12)",
        surface: "rgba(255,255,255,0.04)",
        gradients: {
          dark: "linear-gradient(180deg, #0A0A0C 0%, #12120F 50%, #0A0A0C 100%)",
          warm: "linear-gradient(180deg, #0F0D0A 0%, #1A150E 40%, #0F0D0A 100%)",
          accent:
            "linear-gradient(135deg, #0A0A0C 0%, #1A120A 50%, #0A0A0C 100%)",
          deep: "linear-gradient(180deg, #08080A 0%, #0F0E10 50%, #08080A 100%)",
          hero: "linear-gradient(180deg, #0E0C08 0%, #141008 35%, #0A0A0C 100%)",
        },
      },
    },
    {
      productId: "amfo",
      tokens: {
        bg: "#09090F",
        bgAlt: "#0F0F1A",
        fg: "#F0EEFF",
        fgMuted: "#9090B0",
        accent: "#A78BFA",
        accentGlow: "rgba(167,139,250,0.35)",
        accentSoft: "rgba(167,139,250,0.12)",
        surface: "rgba(139,92,246,0.06)",
        gradients: {
          dark: "linear-gradient(180deg, #09090F 0%, #100F1C 50%, #09090F 100%)",
          warm: "linear-gradient(180deg, #0C0B18 0%, #130F24 40%, #0C0B18 100%)",
          accent:
            "linear-gradient(135deg, #09090F 0%, #12102A 50%, #09090F 100%)",
          deep: "linear-gradient(180deg, #07070D 0%, #0D0C1A 50%, #07070D 100%)",
          hero: "linear-gradient(180deg, #0B0A16 0%, #110E22 35%, #09090F 100%)",
        },
      },
    },
    {
      productId: "lichta",
      tokens: {
        bg: "#1A0A06",
        bgAlt: "#230E08",
        fg: "#FFF5EF",
        fgMuted: "#C4957A",
        accent: "#E8321A",
        accentGlow: "rgba(232,50,26,0.38)",
        accentSoft: "rgba(232,50,26,0.13)",
        surface: "rgba(232,50,26,0.07)",
        gradients: {
          dark: "linear-gradient(180deg, #1A0A06 0%, #200D08 50%, #1A0A06 100%)",
          warm: "linear-gradient(180deg, #180C07 0%, #261208 40%, #180C07 100%)",
          accent:
            "linear-gradient(135deg, #1A0A06 0%, #2A1008 50%, #1A0A06 100%)",
          deep: "linear-gradient(180deg, #120805 0%, #1C0C07 50%, #120805 100%)",
          hero: "linear-gradient(180deg, #1D0C07 0%, #2A1108 35%, #1A0A06 100%)",
        },
      },
    },
    {
      productId: "tinysteps",
      tokens: {
        bg: "#0A0F0A",
        bgAlt: "#0E140E",
        fg: "#F5F8F2",
        fgMuted: "#8A9A88",
        accent: "#6B8E68",
        accentGlow: "rgba(107,142,104,0.35)",
        accentSoft: "rgba(107,142,104,0.12)",
        surface: "rgba(107,142,104,0.06)",
        gradients: {
          dark: "linear-gradient(180deg, #0A0F0A 0%, #0E140E 50%, #0A0F0A 100%)",
          warm: "linear-gradient(180deg, #0C110C 0%, #121A12 40%, #0C110C 100%)",
          accent:
            "linear-gradient(135deg, #0A0F0A 0%, #0F1A0F 50%, #0A0F0A 100%)",
          deep: "linear-gradient(180deg, #080D08 0%, #0C120C 50%, #080D08 100%)",
          hero: "linear-gradient(180deg, #0C120C 0%, #111A11 35%, #0A0F0A 100%)",
        },
      },
    },
    {
      productId: "fitfo",
      tokens: {
        bg: "#0A0A0B",
        bgAlt: "#0F0F10",
        fg: "#F8F8F6",
        fgMuted: "#8A8A90",
        accent: "#F97316",
        accentGlow: "rgba(249,115,22,0.35)",
        accentSoft: "rgba(249,115,22,0.12)",
        surface: "rgba(249,115,22,0.06)",
        gradients: {
          dark: "linear-gradient(180deg, #0A0A0B 0%, #0F0F10 50%, #0A0A0B 100%)",
          warm: "linear-gradient(180deg, #0C0A08 0%, #181008 40%, #0C0A08 100%)",
          accent:
            "linear-gradient(135deg, #0A0A0B 0%, #140D06 50%, #0A0A0B 100%)",
          deep: "linear-gradient(180deg, #080808 0%, #0E0B07 50%, #080808 100%)",
          hero: "linear-gradient(180deg, #0C0B09 0%, #16100A 35%, #0A0A0B 100%)",
        },
      },
    },
  ]);

  // ── Locales ──────────────────────────────────────────────────────────────
  // hone and amfo have no explicit locales (implicitly en-only).
  // TinySteps: screenshot_base_override maps each locale to its screenshot folder.
  await db.insert(schema.productLocales).values([
    {
      productId: "lichta",
      code: "vi",
      label: "Tiếng Việt",
      flag: "🇻🇳",
      sortOrder: 0,
    },
    {
      productId: "lichta",
      code: "en",
      label: "English",
      flag: "🇺🇸",
      sortOrder: 1,
    },
    {
      productId: "tinysteps",
      code: "en",
      label: "English",
      flag: "🇺🇸",
      sortOrder: 0,
    },
    {
      productId: "tinysteps",
      code: "vi",
      label: "Tiếng Việt",
      flag: "🇻🇳",
      sortOrder: 1,
    },
    {
      productId: "fitfo",
      code: "en",
      label: "English",
      flag: "🇺🇸",
      sortOrder: 0,
    },
  ]);

  // ── Slide groups ─────────────────────────────────────────────────────────
  // Insert and capture auto-assigned IDs so we can reference them in product_slides.
  const insertedGroups = await db
    .insert(schema.slideGroups)
    .values([
      { productId: "hone", name: "default", sortOrder: 0 },
      { productId: "amfo", name: "default", sortOrder: 0 },
      { productId: "lichta", name: "default", sortOrder: 0 },
      { productId: "tinysteps", name: "default", sortOrder: 0 },
      { productId: "tinysteps", name: "vi", sortOrder: 1 },
      { productId: "fitfo", name: "default", sortOrder: 0 },
    ])
    .returning();

  const groupId = new Map(
    insertedGroups.map((g) => [`${g.productId}:${g.name}`, g.id]),
  );

  // ── Slide group locales ───────────────────────────────────────────────────
  // Only non-default groups need entries here.
  await db
    .insert(schema.slideGroupLocales)
    .values([{ groupId: groupId.get("tinysteps:vi")!, locale: "vi" }]);

  // ── Slides ────────────────────────────────────────────────────────────────
  const allSlideRows = [
    ...honeSlides,
    ...amfoSlides,
    ...lichtaSlides,
    ...tinystepsSlides,
    ...fitfoSlides,
  ];
  await db.insert(schema.productSlides).values(
    allSlideRows.map(({ groupKey, ...rest }) => ({
      groupId: groupId.get(groupKey)!,
      ...rest,
    })),
  );

  // ── Slide copy ────────────────────────────────────────────────────────────
  await db
    .insert(schema.slideCopy)
    .values([
      ...honeCopy,
      ...amfoCopy,
      ...lichtaCopy,
      ...tinystepsCopy,
      ...fitfoCopy,
    ]);

  // ── Metadata ──────────────────────────────────────────────────────────────
  await db.insert(schema.productMetadata).values([
    {
      productId: "hone",
      locale: "en",
      name: "Life Refine: Hone Skills Daily",
      subtitle: "Refine your life daily with AI",
      promoText:
        "Focus on the daily, sustainable actions that improve your physical, mental, and emotional well-being.",
      shortDescription:
        "Cultivate lasting change through small, consistent habits and AI-guided reflection.",
      keywords:
        "daily habits,well-being,mindfulness,habit tracker,self improvement,reflection,wellness,journal",
      description: `Stop chasing overnight overhauls. Start cultivating lasting change with the power of small, consistent habits.

Hone is your personal AI companion designed to help you focus on the daily, sustainable actions that improve your physical, mental, and emotional well-being over time.

KEY FEATURES

- AI-Powered Mindful Journaling - A reflective space to clear your mind and gain insight.
- Smart Habit Extraction - AI turns your reflections into manageable, daily actions.
- Holistic Well-being Tracking - Monitor your mood, energy, and consistency in one place.
- Voice & Photo Journaling - Capture your journey in whatever way feels most natural.
- Consistency Heatmap - Visualize the momentum you're building every single day.
- Privacy-First - Your journey is for your eyes only. Local encryption, no cloud, no ads.

Questions? support@thehoneapp.com
Privacy: https://thehoneapp.com/privacy
Terms: https://thehoneapp.com/terms`,
    },
    {
      productId: "amfo",
      locale: "en",
      name: "Amfo: Ambient Focus Sounds",
      subtitle: "Ambient Sounds, Focus, Sleep",
      promoText:
        "50+ curated ambient sounds - mix rain, café, and nature for your perfect focus session.",
      shortDescription:
        "Ambient sounds and custom mixes for focus, sleep, and relaxation.",
      keywords:
        "ambient sounds,white noise,focus,sleep sounds,nature sounds,rain sounds,sound mixer,relaxation",
      description: `Find your calm and enter deep flow with Amfo.

Mix 50+ curated ambient sounds to create your perfect environment. Whether you need deep focus for work, a calming atmosphere for study, or peaceful background noise to fall asleep, Amfo gives you the tools to silence distractions.

FEATURES
- Mix unlimited sounds with independent volumes
- Save your favorite mixes as custom Presets
- Beautiful distraction-free Focus Timer
- Auto-hide UI during active timer sessions
- Sleep Fade Out for bedtime routines
- Background audio: Keeps playing when you switch apps
- Absolutely zero intrusive ads`,
    },
    {
      productId: "lichta",
      locale: "vi",
      name: "Lịch Ta - Lịch Âm & Tử Vi AI",
      subtitle: "Lịch Âm · Can Chi · Hoàng Đạo",
      promoText:
        "Hỏi Thầy AI về tử vi, phong thủy, phong tục Việt Nam - trả lời ngay trong app!",
      shortDescription:
        "Lịch âm Việt Nam với Can Chi, Tiết Khí, Hoàng Đạo và Thầy AI tử vi.",
      keywords:
        "lịch âm,lịch ta,can chi,tiết khí,hoàng đạo,tử vi,phong thủy,âm lịch,lịch việt nam",
      description: `Lịch Ta - Ứng dụng lịch âm duy nhất tích hợp Trợ lý Tử Vi AI. Xem ngày tốt xấu, giờ hoàng đạo, phong thủy - hoàn toàn không quảng cáo.`,
    },
    {
      productId: "lichta",
      locale: "en",
      name: "Lich Ta - Lunar Calendar & AI",
      subtitle: "Lunar Calendar · Feng Shui",
      promoText:
        "Ask the AI Master about horoscopes, feng shui, and Vietnamese customs - instant answers!",
      shortDescription:
        "Vietnamese lunar calendar with AI astrology, auspicious hours & event reminders.",
      keywords:
        "lunar calendar,vietnamese calendar,feng shui,horoscope,astrology,zodiac,lunar new year",
      description: `Lich Ta - The only lunar calendar app with a built-in AI Astrology Master. Check auspicious days, lucky hours, and feng shui guidance - completely ad-free.`,
    },
    {
      productId: "tinysteps",
      locale: "en",
      name: "TinySteps: Baby Tracker",
      subtitle: "Growth, Milestones & Vaccines",
      promoText:
        "Track your baby's growth, milestones, and vaccinations with beautiful charts and AI insights.",
      shortDescription:
        "Baby growth tracker with milestones, vaccinations, AI chat, and family sharing.",
      keywords:
        "baby tracker,growth chart,milestones,vaccination tracker,baby journal,parenting,newborn",
      description: `Every tiny step matters. TinySteps is your all-in-one baby growth companion — beautifully designed to help you track, understand, and celebrate your baby's journey.

Questions? hi@yikudo.xyz
Privacy: https://yikudo.xyz/tinysteps/privacy
Terms: https://yikudo.xyz/tinysteps/terms`,
    },
    {
      productId: "tinysteps",
      locale: "vi",
      name: "TinySteps: Theo dõi bé yêu",
      subtitle: "Theo dõi tăng trưởng, cột mốc & tiêm chủng với AI",
      promoText:
        "Theo dõi sự phát triển, cột mốc, và lịch tiêm chủng của bé với biểu đồ đẹp và AI.",
      shortDescription:
        "Theo dõi bé với biểu đồ tăng trưởng, cột mốc phát triển, tiêm chủng và AI.",
      keywords:
        "theo dõi bé,biểu đồ tăng trưởng,cột mốc,tiêm chủng,nhật ký bé,nuôi con,sơ sinh",
      description: `Từng bước nhỏ đều đáng nhớ. TinySteps là ứng dụng theo dõi sự phát triển toàn diện của bé.

Câu hỏi? hi@yikudo.xyz
Quyền riêng tư: https://yikudo.xyz/tinysteps/privacy
Điều khoản: https://yikudo.xyz/tinysteps/terms`,
    },
    {
      productId: "fitfo",
      locale: "en",
      name: "FitFo Workout AI Planner & Log",
      subtitle: "Workout Plan & Nutrition with AI coach",
      promoText:
        "AI-generated workout plans and macro tracking built around your body type and goals.",
      shortDescription:
        "AI fitness tracker with workouts, nutrition, progress photos, and Fit Score.",
      keywords:
        "fitness tracker,workout planner,macro tracker,AI workout,calorie tracker,strength training",
      description: `Your fitness, scored. FitFo is the all-in-one AI fitness companion that builds a plan around your body type, goals, and schedule — then tracks every rep, meal, and milestone.`,
    },
  ]);

  // ── Feature Graphics ──────────────────────────────────────────────────────
  await db.insert(schema.productFeatureGraphics).values([
    {
      productId: "hone",
      locale: "en",
      tagline: "Refine your life daily with HONE",
      subtitle: "Sharpen your edge. Every day.",
    },
    {
      productId: "amfo",
      locale: "en",
      tagline: "Amfo: Ambient Focus Sounds",
      subtitle: "50+ ambient sounds for focus, sleep, and flow.",
    },
    {
      productId: "lichta",
      locale: "vi",
      tagline: "Lịch Ta",
      subtitle: "Lịch âm, Can Chi, Tiết Khí - tất cả ở một chỗ.",
    },
    {
      productId: "lichta",
      locale: "en",
      tagline: "Lich Ta - Lunar Calendar",
      subtitle: "Lunar date, Can Chi, Solar Terms — all in one place.",
    },
    {
      productId: "tinysteps",
      locale: "en",
      tagline: "TinySteps: Baby Growth Tracker",
      subtitle:
        "Track milestones, vaccinations, and growth — all in one place.",
    },
    {
      productId: "tinysteps",
      locale: "vi",
      tagline: "TinySteps: Theo dõi bé yêu",
      subtitle:
        "Theo dõi cột mốc, tiêm chủng, và tăng trưởng — tất cả ở một nơi.",
    },
    {
      productId: "fitfo",
      locale: "en",
      tagline: "FitFo Workout AI Planner & Log",
      subtitle:
        "Workouts, nutrition, progress photos, and a personal Fit Score — all in one place.",
    },
  ]);

  // ── Social OGs ────────────────────────────────────────────────────────────
  await db.insert(schema.productSocialOgs).values([
    {
      productId: "hone",
      locale: "en",
      tagline: "Refine your life daily with HONE",
      subtitle:
        "Daily protocols, AI coaching, and progress tracking for peak performance.",
    },
    {
      productId: "amfo",
      locale: "en",
      tagline: "Amfo: Ambient Focus Sounds",
      subtitle:
        "Curated ambient sounds and custom mixes for deep focus and restful sleep.",
    },
    {
      productId: "lichta",
      locale: "vi",
      tagline: "Lịch Ta - Lịch Âm & Tử Vi AI",
      subtitle: "Âm lịch, Can Chi, Hoàng Đạo, Tử Vi AI và hơn thế nữa.",
    },
    {
      productId: "lichta",
      locale: "en",
      tagline: "Lich Ta - Lunar Calendar & AI",
      subtitle:
        "Vietnamese lunar calendar with AI astrology, auspicious hours, and event reminders.",
    },
    {
      productId: "tinysteps",
      locale: "en",
      tagline: "TinySteps: Baby Growth Tracker",
      subtitle:
        "Beautiful growth charts, milestone tracking, AI insights, and family sharing.",
    },
    {
      productId: "tinysteps",
      locale: "vi",
      tagline: "TinySteps: Theo dõi bé yêu",
      subtitle:
        "Biểu đồ tăng trưởng đẹp, cột mốc, AI tư vấn và chia sẻ gia đình.",
    },
    {
      productId: "fitfo",
      locale: "en",
      tagline: "FitFo Workout AI Planner & Log",
      subtitle:
        "AI workout plans, macro tracking, progress photos, and a personal Fit Score.",
    },
  ]);

  // ── CTA Images ────────────────────────────────────────────────────────────
  // Each locale gets its own row; no JSONB blobs needed.
  await db.insert(schema.productCtaImages).values([
    {
      productId: "hone",
      locale: "en",
      headline: "Small habits repeated = Big change",
      sc1: "sc_hone1.png",
      sc2: "sc_hone2.png",
      ctaLabel: "↑ link in bio",
    },
    {
      productId: "amfo",
      locale: "en",
      headline: "drown out the world, dial into focus",
      sc1: "sc_amfo2.png",
      sc2: "sc_amfo3.png",
      ctaLabel: "↑ link in bio",
    },
    {
      productId: "lichta",
      locale: "vi",
      headline: "Lịch Âm & Tử Vi trong tầm tay",
      sc1: "sc1.png",
      sc2: "sc2.png",
      ctaLabel: "↑ link in bio",
    },
    {
      productId: "lichta",
      locale: "en",
      headline: "Lunar Calendar & AI Astrology at your fingertips",
      sc1: "sc1.png",
      sc2: "sc2.png",
      ctaLabel: "↑ link in bio",
    },
    {
      productId: "tinysteps",
      locale: "en",
      headline: "track your baby's growth, milestones, and vaccinations",
      sc1: "sc1.png",
      sc2: "sc2.png",
      ctaLabel: "↑ link in bio",
    },
    {
      productId: "tinysteps",
      locale: "vi",
      headline: "Cùng bé lớn lên với sự an tâm",
      sc1: "sc1.png",
      sc2: "sc2.png",
      ctaLabel: "↑ link in bio",
    },
    {
      productId: "fitfo",
      locale: "en",
      headline: "Your fitness, scored, tracked and coached — all in one place.",
      sc1: "sc1.png",
      sc2: "sc2.png",
      ctaLabel: "↑ link in bio",
    },
  ]);

  await sql.end();
  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
