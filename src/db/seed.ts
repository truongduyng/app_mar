/**
 * Seed script — run once to populate the DB from the static product data.
 * Usage: DATABASE_URL=... bun run src/db/seed.ts
 */
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { txt, br, acc } from "@/lib/rich-text";
import type { RichTextSegment } from "@/lib/rich-text";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(sql, { schema });

type SlideCopyRow = {
  productId: string;
  slideVariant: string;
  slideKey: string;
  locale: string;
  sortOrder: number;   // 0 = primary (SlideDef.copy), 1+ = copyByLocale overrides
  label: string;
  headline: RichTextSegment[];
  subtitle: RichTextSegment[];
};

type SlideRow = {
  productId: string;
  device: string;
  slideVariant: string;
  slideKey: string;
  componentKey: string;
  sortOrder: number;
};

// ─── HONE ─────────────────────────────────────────────────────────────────

const honeSlides: SlideRow[] = [
  { productId: "hone", device: "iphone", slideVariant: "default", slideKey: "hero",     componentKey: "HoneSlide1", sortOrder: 0 },
  { productId: "hone", device: "iphone", slideVariant: "default", slideKey: "journal",  componentKey: "HoneSlide2", sortOrder: 1 },
  { productId: "hone", device: "iphone", slideVariant: "default", slideKey: "protocol", componentKey: "HoneSlide3", sortOrder: 2 },
  { productId: "hone", device: "iphone", slideVariant: "default", slideKey: "reward",   componentKey: "HoneSlide7", sortOrder: 3 },
  { productId: "hone", device: "iphone", slideVariant: "default", slideKey: "progress", componentKey: "HoneSlide4", sortOrder: 4 },
  { productId: "hone", device: "iphone", slideVariant: "default", slideKey: "goals",    componentKey: "HoneSlide5", sortOrder: 5 },
  { productId: "hone", device: "iphone", slideVariant: "default", slideKey: "proof",    componentKey: "HoneSlide6", sortOrder: 6 },
];

const honeCopy: SlideCopyRow[] = [
  { productId: "hone", slideVariant: "default", slideKey: "hero",     locale: "en", sortOrder: 0, label: "THE POWER OF SMALL HABITS", headline: [txt("Lasting Change."), br(), acc("Starts Today.")],     subtitle: [txt("Focus on daily, sustainable actions for a better you.")] },
  { productId: "hone", slideVariant: "default", slideKey: "journal",  locale: "en", sortOrder: 0, label: "MINDFUL REFLECTION",        headline: [txt("Reflect. Align."), br(), acc("Thrive.")],            subtitle: [txt("Journal your daily thoughts. Let AI guide your emotional well-being and mental clarity.")] },
  { productId: "hone", slideVariant: "default", slideKey: "protocol", locale: "en", sortOrder: 0, label: "DAILY WELL-BEING",          headline: [txt("Micro-Habits."), br(), acc("Macro Growth.")],         subtitle: [txt("Focus on sustainable actions that improve your life over time.")] },
  { productId: "hone", slideVariant: "default", slideKey: "reward",   locale: "en", sortOrder: 0, label: "STAY CONSISTENT",           headline: [txt("Celebrate"), br(), acc("Every Win")],                 subtitle: [txt("Every small step counts. Build the momentum that makes change inevitable.")] },
  { productId: "hone", slideVariant: "default", slideKey: "progress", locale: "en", sortOrder: 0, label: "HOLISTIC PROGRESS",         headline: [txt("Visualize"), br(), acc("Your Evolution")],            subtitle: [txt("Track mood patterns, energy levels, and habit consistency in one unified view.")] },
  { productId: "hone", slideVariant: "default", slideKey: "goals",    locale: "en", sortOrder: 0, label: "SYSTEMS FOR LIFE",          headline: [txt("Daily Actions"), br(), acc("Not Overhauls")],         subtitle: [txt("Ditch the overnight pressure. Build systems that integrate into your lifestyle.")] },
  { productId: "hone", slideVariant: "default", slideKey: "proof",    locale: "en", sortOrder: 0, label: "YOUR JOURNEY",              headline: [txt("Document"), br(), acc("The Best You")],               subtitle: [txt("Share your path to well-being and celebrate the compounding power of daily habits.")] },
];

// ─── AMFO ─────────────────────────────────────────────────────────────────

const amfoSlides: SlideRow[] = [
  { productId: "amfo", device: "iphone", slideVariant: "default", slideKey: "calm",     componentKey: "AmfoSlide1", sortOrder: 0 },
  { productId: "amfo", device: "iphone", slideVariant: "default", slideKey: "mix",      componentKey: "AmfoSlide2", sortOrder: 1 },
  { productId: "amfo", device: "iphone", slideVariant: "default", slideKey: "timer",    componentKey: "AmfoSlide3", sortOrder: 2 },
  { productId: "amfo", device: "iphone", slideVariant: "default", slideKey: "focus",    componentKey: "AmfoSlide4", sortOrder: 3 },
  { productId: "amfo", device: "iphone", slideVariant: "default", slideKey: "settings", componentKey: "AmfoSlide5", sortOrder: 4 },
];

const amfoCopy: SlideCopyRow[] = [
  { productId: "amfo", slideVariant: "default", slideKey: "calm",     locale: "en", sortOrder: 0, label: "AMBIENT SOUNDS", headline: [txt("Find"),          br(), acc("your calm.")],      subtitle: [txt("50+ curated ambient sounds"), br(), txt("for focus, sleep, and flow.")] },
  { productId: "amfo", slideVariant: "default", slideKey: "mix",      locale: "en", sortOrder: 0, label: "SOUND MIXER",    headline: [txt("Layer sounds."), br(), acc("Save presets.")],   subtitle: [txt("Mix rain, café, and nature."), br(), txt("Save your perfect combinations.")] },
  { productId: "amfo", slideVariant: "default", slideKey: "timer",    locale: "en", sortOrder: 0, label: "FOCUS TIMER",    headline: [txt("Set a timer."), br(), acc("Disappear.")],        subtitle: [txt("Custom durations to perfectly"), br(), txt("match your workflow or sleep.")] },
  { productId: "amfo", slideVariant: "default", slideKey: "focus",    locale: "en", sortOrder: 0, label: "DEEP FOCUS",     headline: [txt("Silence"),       br(), acc("the noise.")],       subtitle: [txt("A beautiful, distraction-free"), br(), txt("timer keeps you locked in.")] },
  { productId: "amfo", slideVariant: "default", slideKey: "settings", locale: "en", sortOrder: 0, label: "CUSTOMIZE",      headline: [txt("Your perfect"),  br(), acc("environment")],     subtitle: [txt("Auto-hide controls. Sleep fade out."), br(), txt("Make the app work for you.")] },
];

// ─── LICHTA ───────────────────────────────────────────────────────────────

const lichtaSlides: SlideRow[] = [
  { productId: "lichta", device: "iphone",  slideVariant: "default", slideKey: "hero",     componentKey: "LichtaSlide1",   sortOrder: 0 },
  { productId: "lichta", device: "iphone",  slideVariant: "default", slideKey: "events",   componentKey: "LichtaSlide2",   sortOrder: 1 },
  { productId: "lichta", device: "iphone",  slideVariant: "default", slideKey: "calendar", componentKey: "LichtaSlide3",   sortOrder: 2 },
  { productId: "lichta", device: "iphone",  slideVariant: "default", slideKey: "ai",       componentKey: "LichtaSlide4",   sortOrder: 3 },
  { productId: "lichta", device: "iphone",  slideVariant: "default", slideKey: "themes",   componentKey: "LichtaSlide5",   sortOrder: 4 },
  { productId: "lichta", device: "iphone",  slideVariant: "default", slideKey: "wisdom",   componentKey: "LichtaSlide6",   sortOrder: 5 },
  { productId: "lichta", device: "iphone",  slideVariant: "default", slideKey: "widgets",  componentKey: "LichtaSlide7",   sortOrder: 6 },
  { productId: "lichta", device: "android", slideVariant: "default", slideKey: "hero",     componentKey: "LichtaAndroid1", sortOrder: 0 },
  { productId: "lichta", device: "android", slideVariant: "default", slideKey: "events",   componentKey: "LichtaAndroid2", sortOrder: 1 },
  { productId: "lichta", device: "android", slideVariant: "default", slideKey: "calendar", componentKey: "LichtaAndroid3", sortOrder: 2 },
  { productId: "lichta", device: "android", slideVariant: "default", slideKey: "ai",       componentKey: "LichtaAndroid4", sortOrder: 3 },
  { productId: "lichta", device: "android", slideVariant: "default", slideKey: "themes",   componentKey: "LichtaAndroid5", sortOrder: 4 },
  { productId: "lichta", device: "android", slideVariant: "default", slideKey: "wisdom",   componentKey: "LichtaAndroid6", sortOrder: 5 },
  { productId: "lichta", device: "android", slideVariant: "default", slideKey: "widgets",  componentKey: "LichtaAndroid7", sortOrder: 6 },
];

const lichtaCopy: SlideCopyRow[] = [
  // hero: vi (sortOrder=0 primary), en (sortOrder=1 copyByLocale)
  { productId: "lichta", slideVariant: "default", slideKey: "hero",     locale: "vi", sortOrder: 0, label: "LỊCH ÂM VIỆT NAM",     headline: [txt("Lịch Âm"),          br(), acc("trong tầm tay.")],         subtitle: [txt("Âm lịch, Can Chi, Tiết Khí,"), br(), txt("Hoàng Đạo - tất cả ở một chỗ.")] },
  { productId: "lichta", slideVariant: "default", slideKey: "hero",     locale: "en", sortOrder: 1, label: "LUNAR CALENDAR",       headline: [txt("Today's date,"),     br(), acc("at a glance.")],           subtitle: [txt("Lunar date, Can Chi, Solar Terms,"), br(), txt("Auspicious Hours — all in one place.")] },
  // events
  { productId: "lichta", slideVariant: "default", slideKey: "events",   locale: "vi", sortOrder: 0, label: "SỰ KIỆN ÂM LỊCH",     headline: [txt("Không bao giờ"),     br(), acc("quên ngày giỗ.")],         subtitle: [txt("Giỗ chạp, sinh nhật, ngày cưới"), br(), txt("theo âm lịch - nhắc tự động.")] },
  { productId: "lichta", slideVariant: "default", slideKey: "events",   locale: "en", sortOrder: 1, label: "LUNAR EVENTS",         headline: [txt("Never miss"),        br(), acc("an anniversary.")],         subtitle: [txt("Death anniversaries, birthdays,"), br(), txt("weddings by lunar date — auto-reminded.")] },
  // calendar
  { productId: "lichta", slideVariant: "default", slideKey: "calendar", locale: "vi", sortOrder: 0, label: "LỊCH ÂM CHI TIẾT",    headline: [txt("Can Chi,"),          br(), acc("Hoàng Đạo.")],               subtitle: [txt("Tiết khí, Thần Sát, giờ Hoàng Đạo"), br(), txt("hiển thị ngay khi chọn ngày.")] },
  { productId: "lichta", slideVariant: "default", slideKey: "calendar", locale: "en", sortOrder: 1, label: "DETAILED LUNAR",       headline: [txt("Can Chi &"),         br(), acc("Auspicious Hours.")],        subtitle: [txt("Solar terms, Lucky Gods, Auspicious Hours"), br(), txt("shown the moment you pick a date.")] },
  // ai
  { productId: "lichta", slideVariant: "default", slideKey: "ai",       locale: "vi", sortOrder: 0, label: "XEM TỬ VI AI",         headline: [txt("Tử Vi AI"),          br(), acc("bất cứ lúc nào.")],         subtitle: [txt("Tử vi, vận mệnh, phong thủy"), br(), txt("AI trả lời ngay.")] },
  { productId: "lichta", slideVariant: "default", slideKey: "ai",       locale: "en", sortOrder: 1, label: "LICH TA AI MASTER",    headline: [txt("Your AI Astrologer,"),br(), acc("anytime.")],                 subtitle: [txt("Horoscopes, feng shui, Vietnamese"), br(), txt("customs — AI answers instantly.")] },
  // themes
  { productId: "lichta", slideVariant: "default", slideKey: "themes",   locale: "vi", sortOrder: 0, label: "GIAO DIỆN CÁ NHÂN",   headline: [txt("Màu sắc"),           br(), acc("theo ý bạn.")],              subtitle: [txt("Hình nền thành phố Việt Nam,"), br(), txt("màu chủ đạo tùy chỉnh thoải mái.")] },
  { productId: "lichta", slideVariant: "default", slideKey: "themes",   locale: "en", sortOrder: 1, label: "PERSONAL THEMES",      headline: [txt("Colors"),            br(), acc("your way.")],                subtitle: [txt("Vietnamese city wallpapers,"), br(), txt("custom accent colors to your taste.")] },
  // wisdom
  { productId: "lichta", slideVariant: "default", slideKey: "wisdom",   locale: "vi", sortOrder: 0, label: "TỬ VI - PHONG THỦY",  headline: [txt("Vận mệnh."),         br(), acc("Rõ từng ngày.")],            subtitle: [txt("Chat với AI về tình duyên, công việc,"), br(), txt("sức khỏe - theo lá số của bạn.")] },
  { productId: "lichta", slideVariant: "default", slideKey: "wisdom",   locale: "en", sortOrder: 1, label: "ASTROLOGY & FENG SHUI",headline: [txt("Your destiny."),     br(), acc("Day by day.")],              subtitle: [txt("Chat with AI about love, career,"), br(), txt("health — based on your birth chart.")] },
  // widgets
  { productId: "lichta", slideVariant: "default", slideKey: "widgets",  locale: "vi", sortOrder: 0, label: "",                     headline: [txt("Widget đẹp"),        br(), acc("mỗi ngày.")],               subtitle: [txt("Thêm widget vào màn hình chính,"), br(), txt("xem lịch âm ngay không cần mở app.")] },
  { productId: "lichta", slideVariant: "default", slideKey: "widgets",  locale: "en", sortOrder: 1, label: "",                     headline: [txt("Beautiful widgets"), br(), acc("every day.")],              subtitle: [txt("Add a widget to your home screen,"), br(), txt("check the lunar date without opening the app.")] },
];

// ─── TINYSTEPS ────────────────────────────────────────────────────────────

const tinystepsSlides: SlideRow[] = [
  // default set (en + vi copy overrides)
  { productId: "tinysteps", device: "iphone", slideVariant: "default", slideKey: "hero",         componentKey: "TinyStepsSlide1", sortOrder: 0 },
  { productId: "tinysteps", device: "iphone", slideVariant: "default", slideKey: "milestones",   componentKey: "TinyStepsSlide2", sortOrder: 1 },
  { productId: "tinysteps", device: "iphone", slideVariant: "default", slideKey: "vaccinations", componentKey: "TinyStepsSlide3", sortOrder: 2 },
  { productId: "tinysteps", device: "iphone", slideVariant: "default", slideKey: "journal",      componentKey: "TinyStepsSlide4", sortOrder: 3 },
  { productId: "tinysteps", device: "iphone", slideVariant: "default", slideKey: "ai-chat",      componentKey: "TinyStepsSlide5", sortOrder: 4 },
  { productId: "tinysteps", device: "iphone", slideVariant: "default", slideKey: "family",       componentKey: "TinyStepsSlide6", sortOrder: 5 },
  { productId: "tinysteps", device: "iphone", slideVariant: "default", slideKey: "growth",       componentKey: "TinyStepsSlide7", sortOrder: 6 },
  // vi-specific set (different screenshots/components)
  { productId: "tinysteps", device: "iphone", slideVariant: "vi", slideKey: "hero",         componentKey: "TinyStepsViSlide1", sortOrder: 0 },
  { productId: "tinysteps", device: "iphone", slideVariant: "vi", slideKey: "journal",      componentKey: "TinyStepsViSlide2", sortOrder: 1 },
  { productId: "tinysteps", device: "iphone", slideVariant: "vi", slideKey: "ai-chat",      componentKey: "TinyStepsViSlide3", sortOrder: 2 },
  { productId: "tinysteps", device: "iphone", slideVariant: "vi", slideKey: "settings",     componentKey: "TinyStepsViSlide4", sortOrder: 3 },
  { productId: "tinysteps", device: "iphone", slideVariant: "vi", slideKey: "milestones",   componentKey: "TinyStepsViSlide5", sortOrder: 4 },
  { productId: "tinysteps", device: "iphone", slideVariant: "vi", slideKey: "vaccinations", componentKey: "TinyStepsViSlide6", sortOrder: 5 },
];

const tinystepsCopy: SlideCopyRow[] = [
  // default variant — en (sortOrder=0 primary) + vi (sortOrder=1 copyByLocale)
  { productId: "tinysteps", slideVariant: "default", slideKey: "hero",         locale: "en", sortOrder: 0, label: "BABY GROWTH TRACKER",      headline: [txt("Every milestone."), br(), acc("Captured.")],                   subtitle: [txt("Track weight, height, and head size"), br(), txt("with beautiful growth charts.")] },
  { productId: "tinysteps", slideVariant: "default", slideKey: "hero",         locale: "vi", sortOrder: 1, label: "THEO DÕI BÉ LỚN",          headline: [txt("Từng bước nhỏ."), br(), acc("Đều đáng nhớ.")],                subtitle: [txt("Theo dõi cân nặng, chiều cao,"), br(), txt("và vòng đầu với biểu đồ trực quan.")] },
  { productId: "tinysteps", slideVariant: "default", slideKey: "milestones",   locale: "en", sortOrder: 0, label: "DEVELOPMENTAL MILESTONES", headline: [txt("Never miss"), br(), acc("a first.")],                          subtitle: [txt("Track 42+ milestones from"), br(), txt("0–12 months, guided by age.")] },
  { productId: "tinysteps", slideVariant: "default", slideKey: "milestones",   locale: "vi", sortOrder: 1, label: "CỘT MỐC PHÁT TRIỂN",       headline: [txt("Đừng bỏ lỡ"), br(), acc("khoảnh khắc nào.")],                subtitle: [txt("Theo dõi 42+ cột mốc từ"), br(), txt("0–12 tháng, theo từng giai đoạn.")] },
  { productId: "tinysteps", slideVariant: "default", slideKey: "vaccinations", locale: "en", sortOrder: 0, label: "VACCINATION TRACKER",      headline: [txt("Stay on"), br(), acc("schedule.")],                            subtitle: [txt("Track every dose, see what's due,"), br(), txt("never miss a vaccination.")] },
  { productId: "tinysteps", slideVariant: "default", slideKey: "vaccinations", locale: "vi", sortOrder: 1, label: "LỊCH TIÊM CHỦNG",          headline: [txt("Đúng lịch."), br(), acc("An tâm.")],                          subtitle: [txt("Theo dõi từng mũi tiêm,"), br(), txt("không bao giờ quên lịch hẹn.")] },
  { productId: "tinysteps", slideVariant: "default", slideKey: "journal",      locale: "en", sortOrder: 0, label: "BABY JOURNAL",             headline: [txt("Memories"), br(), acc("worth keeping.")],                      subtitle: [txt("A beautiful timeline of your"), br(), txt("baby's most precious moments.")] },
  { productId: "tinysteps", slideVariant: "default", slideKey: "journal",      locale: "vi", sortOrder: 1, label: "NHẬT KÝ BÉ YÊU",           headline: [txt("Kỷ niệm"), br(), acc("đáng giữ.")],                           subtitle: [txt("Dòng thời gian xinh đẹp ghi lại"), br(), txt("những khoảnh khắc quý giá nhất.")] },
  { productId: "tinysteps", slideVariant: "default", slideKey: "ai-chat",      locale: "en", sortOrder: 0, label: "AI PARENTING GUIDE",       headline: [txt("Ask anything."), br(), acc("Get answers.")],                   subtitle: [txt("AI-powered insights about your"), br(), txt("baby's growth and development.")] },
  { productId: "tinysteps", slideVariant: "default", slideKey: "ai-chat",      locale: "vi", sortOrder: 1, label: "TRỢ LÝ AI CHO BỐ MẸ",     headline: [txt("Hỏi gì"), br(), acc("cũng được.")],                           subtitle: [txt("AI phân tích sự phát triển và"), br(), txt("tăng trưởng của bé cho bạn.")] },
  { productId: "tinysteps", slideVariant: "default", slideKey: "family",       locale: "en", sortOrder: 0, label: "FAMILY SHARING",           headline: [txt("Track"), br(), acc("together.")],                               subtitle: [txt("Invite your partner or family"), br(), txt("to share the journey.")] },
  { productId: "tinysteps", slideVariant: "default", slideKey: "family",       locale: "vi", sortOrder: 1, label: "CHIA SẺ GIA ĐÌNH",         headline: [txt("Cùng nhau"), br(), acc("theo dõi.")],                          subtitle: [txt("Mời bạn đời hoặc gia đình"), br(), txt("cùng chăm sóc bé yêu.")] },
  { productId: "tinysteps", slideVariant: "default", slideKey: "growth",       locale: "en", sortOrder: 0, label: "COMPLETE PICTURE",         headline: [txt("Watch them"), br(), acc("grow.")],                             subtitle: [txt("Milestones, vaccinations, and growth"), br(), txt("tracking — all in one place.")] },
  { productId: "tinysteps", slideVariant: "default", slideKey: "growth",       locale: "vi", sortOrder: 1, label: "BỨC TRANH TOÀN DIỆN",      headline: [txt("Nhìn bé"), br(), acc("lớn lên.")],                            subtitle: [txt("Cột mốc, tiêm chủng, và biểu đồ"), br(), txt("tăng trưởng — tất cả ở một chỗ.")] },
  // vi variant — each slide has exactly one copy (sortOrder=0)
  { productId: "tinysteps", slideVariant: "vi", slideKey: "hero",         locale: "vi", sortOrder: 0, label: "THEO DÕI BÉ LỚN",      headline: [txt("Từng bước nhỏ."), br(), acc("Đều đáng nhớ.")],    subtitle: [txt("Theo dõi cân nặng, chiều cao,"), br(), txt("và vòng đầu với biểu đồ trực quan.")] },
  { productId: "tinysteps", slideVariant: "vi", slideKey: "journal",      locale: "vi", sortOrder: 0, label: "NHẬT KÝ BÉ YÊU",       headline: [txt("Kỷ niệm"), br(), acc("đáng giữ.")],               subtitle: [txt("Dòng thời gian xinh đẹp ghi lại"), br(), txt("những khoảnh khắc quý giá nhất.")] },
  { productId: "tinysteps", slideVariant: "vi", slideKey: "ai-chat",      locale: "vi", sortOrder: 0, label: "TRỢ LÝ AI CHO BỐ MẸ", headline: [txt("Hỏi gì"), br(), acc("cũng được.")],                subtitle: [txt("AI phân tích sự phát triển và"), br(), txt("tăng trưởng của bé cho bạn.")] },
  { productId: "tinysteps", slideVariant: "vi", slideKey: "settings",     locale: "vi", sortOrder: 0, label: "TUỲ CHỈNH THEO Ý BẠN",headline: [txt("Cài đặt"), br(), acc("theo sở thích.")],           subtitle: [txt("Chọn ngôn ngữ, đơn vị đo lường,"), br(), txt("và thông báo phù hợp với gia đình bạn.")] },
  { productId: "tinysteps", slideVariant: "vi", slideKey: "milestones",   locale: "vi", sortOrder: 0, label: "CỘT MỐC PHÁT TRIỂN",  headline: [txt("Đừng bỏ lỡ"), br(), acc("khoảnh khắc nào.")],     subtitle: [txt("Theo dõi 42+ cột mốc từ"), br(), txt("0–24 tháng, theo từng giai đoạn.")] },
  { productId: "tinysteps", slideVariant: "vi", slideKey: "vaccinations", locale: "vi", sortOrder: 0, label: "LỊCH TIÊM CHỦNG",     headline: [txt("Đúng lịch."), br(), acc("An tâm.")],               subtitle: [txt("Theo dõi từng mũi tiêm,"), br(), txt("không bao giờ quên lịch hẹn.")] },
];

// ─── FITFO ────────────────────────────────────────────────────────────────

const fitfoSlides: SlideRow[] = [
  { productId: "fitfo", device: "iphone", slideVariant: "default", slideKey: "hero",      componentKey: "FitFoSlide1", sortOrder: 0 },
  { productId: "fitfo", device: "iphone", slideVariant: "default", slideKey: "workout",   componentKey: "FitFoSlide2", sortOrder: 1 },
  { productId: "fitfo", device: "iphone", slideVariant: "default", slideKey: "nutrition", componentKey: "FitFoSlide3", sortOrder: 2 },
  { productId: "fitfo", device: "iphone", slideVariant: "default", slideKey: "fit-score", componentKey: "FitFoSlide4", sortOrder: 3 },
  { productId: "fitfo", device: "iphone", slideVariant: "default", slideKey: "forecast",  componentKey: "FitFoSlide5", sortOrder: 4 },
  { productId: "fitfo", device: "iphone", slideVariant: "default", slideKey: "body-type", componentKey: "FitFoSlide6", sortOrder: 5 },
  { productId: "fitfo", device: "iphone", slideVariant: "default", slideKey: "progress",  componentKey: "FitFoSlide7", sortOrder: 6 },
  { productId: "fitfo", device: "iphone", slideVariant: "default", slideKey: "more",      componentKey: "FitFoSlide8", sortOrder: 7 },
];

const fitfoCopy: SlideCopyRow[] = [
  { productId: "fitfo", slideVariant: "default", slideKey: "hero",      locale: "en", sortOrder: 0, label: "FITNESS TRACKER",         headline: [txt("Your fitness."),    br(), acc("Scored.")],       subtitle: [txt("Track workouts, calories, and progress"), br(), txt("with a personal AI-generated plan.")] },
  { productId: "fitfo", slideVariant: "default", slideKey: "workout",   locale: "en", sortOrder: 0, label: "AI WORKOUT PLAN",         headline: [txt("Train smarter."),   br(), acc("Every day.")],    subtitle: [txt("A daily workout built around"), br(), txt("your goals, schedule, and body type.")] },
  { productId: "fitfo", slideVariant: "default", slideKey: "nutrition", locale: "en", sortOrder: 0, label: "NUTRITION TRACKING",      headline: [txt("Fuel the"),         br(), acc("right way.")],    subtitle: [txt("Track macros and calories for every meal."), br(), txt("Adjust for training and rest days.")] },
  { productId: "fitfo", slideVariant: "default", slideKey: "fit-score", locale: "en", sortOrder: 0, label: "PERSONAL FIT SCORE",      headline: [txt("Know where"),       br(), acc("you stand.")],   subtitle: [txt("Your fitness mapped across strength,"), br(), txt("stamina, discipline, and more.")] },
  { productId: "fitfo", slideVariant: "default", slideKey: "forecast",  locale: "en", sortOrder: 0, label: "30-DAY FORECAST",         headline: [txt("See what's"),       br(), acc("possible.")],    subtitle: [txt("Your AI plan predicts muscle gained,"), br(), txt("calories burned, and score growth.")] },
  { productId: "fitfo", slideVariant: "default", slideKey: "body-type", locale: "en", sortOrder: 0, label: "PERSONALIZED ONBOARDING", headline: [txt("Built for"),        br(), acc("your body.")],   subtitle: [txt("FitFo learns your somatotype and builds"), br(), txt("a plan that actually fits you.")] },
  { productId: "fitfo", slideVariant: "default", slideKey: "progress",  locale: "en", sortOrder: 0, label: "VISUAL PROGRESS",         headline: [txt("Watch the"),        br(), acc("change.")],      subtitle: [txt("Log progress photos and your profile"), br(), txt("side by side — see your transformation.")] },
  { productId: "fitfo", slideVariant: "default", slideKey: "more",      locale: "en", sortOrder: 0, label: "EVERYTHING YOU NEED",     headline: [txt("And so"),           br(), acc("much more.")],   subtitle: [txt("Every tool to hit your goal, in one app.")] },
];

// ─── SEED ─────────────────────────────────────────────────────────────────

async function seed() {
  console.log("Seeding database…");

  // Clear all existing data in dependency order
  await db.delete(schema.slideCopy);
  await db.delete(schema.productSlides);
  await db.delete(schema.productMetadata);
  await db.delete(schema.productFeatureGraphics);
  await db.delete(schema.productSocialOgs);
  await db.delete(schema.productCtaImages);
  await db.delete(schema.productLocales);
  await db.delete(schema.productThemes);
  await db.delete(schema.products);

  // ── Products ────────────────────────────────────────────────────────────
  await db.insert(schema.products).values([
    { id: "hone",      name: "Life Refine",                   iconPath: "/products/hone/icon.png",      screenshotBase: "/products/hone/screenshots" },
    { id: "amfo",      name: "Amfo: Ambient Focus Sounds",    iconPath: "/products/amfo/icon.png",      screenshotBase: "/products/amfo/screenshots" },
    { id: "lichta",    name: "Lịch Ta - Lịch Âm & Tử Vi AI", iconPath: "/products/lichta/icon.png",    screenshotBase: "/products/lichta/screenshots" },
    {
      id: "tinysteps", name: "TinySteps: Baby Growth Tracker", iconPath: "/products/tinysteps/icon.png",
      screenshotBase: "/products/tinysteps/screenshots/en",
      screenshotBaseByLocale: { en: "/products/tinysteps/screenshots/en", vi: "/products/tinysteps/screenshots/vi" },
    },
    { id: "fitfo",     name: "FitFo: Workout Plan & Log Pal", iconPath: "/products/fitfo/icon.png",    screenshotBase: "/products/fitfo/screenshots" },
  ]);

  // ── Themes ───────────────────────────────────────────────────────────────
  await db.insert(schema.productThemes).values([
    { productId: "hone", tokens: { bg: "#0A0A0C", bgAlt: "#111114", fg: "#F8F8F2", fgMuted: "#8A8A94", accent: "#F97316", accentGlow: "rgba(249,115,22,0.35)", accentSoft: "rgba(249,115,22,0.12)", surface: "rgba(255,255,255,0.04)", gradients: { dark: "linear-gradient(180deg, #0A0A0C 0%, #12120F 50%, #0A0A0C 100%)", warm: "linear-gradient(180deg, #0F0D0A 0%, #1A150E 40%, #0F0D0A 100%)", accent: "linear-gradient(135deg, #0A0A0C 0%, #1A120A 50%, #0A0A0C 100%)", deep: "linear-gradient(180deg, #08080A 0%, #0F0E10 50%, #08080A 100%)", hero: "linear-gradient(180deg, #0E0C08 0%, #141008 35%, #0A0A0C 100%)" } } },
    { productId: "amfo", tokens: { bg: "#09090F", bgAlt: "#0F0F1A", fg: "#F0EEFF", fgMuted: "#9090B0", accent: "#A78BFA", accentGlow: "rgba(167,139,250,0.35)", accentSoft: "rgba(167,139,250,0.12)", surface: "rgba(139,92,246,0.06)", gradients: { dark: "linear-gradient(180deg, #09090F 0%, #100F1C 50%, #09090F 100%)", warm: "linear-gradient(180deg, #0C0B18 0%, #130F24 40%, #0C0B18 100%)", accent: "linear-gradient(135deg, #09090F 0%, #12102A 50%, #09090F 100%)", deep: "linear-gradient(180deg, #07070D 0%, #0D0C1A 50%, #07070D 100%)", hero: "linear-gradient(180deg, #0B0A16 0%, #110E22 35%, #09090F 100%)" } } },
    { productId: "lichta", tokens: { bg: "#1A0A06", bgAlt: "#230E08", fg: "#FFF5EF", fgMuted: "#C4957A", accent: "#E8321A", accentGlow: "rgba(232,50,26,0.38)", accentSoft: "rgba(232,50,26,0.13)", surface: "rgba(232,50,26,0.07)", gradients: { dark: "linear-gradient(180deg, #1A0A06 0%, #200D08 50%, #1A0A06 100%)", warm: "linear-gradient(180deg, #180C07 0%, #261208 40%, #180C07 100%)", accent: "linear-gradient(135deg, #1A0A06 0%, #2A1008 50%, #1A0A06 100%)", deep: "linear-gradient(180deg, #120805 0%, #1C0C07 50%, #120805 100%)", hero: "linear-gradient(180deg, #1D0C07 0%, #2A1108 35%, #1A0A06 100%)" } } },
    { productId: "tinysteps", tokens: { bg: "#0A0F0A", bgAlt: "#0E140E", fg: "#F5F8F2", fgMuted: "#8A9A88", accent: "#6B8E68", accentGlow: "rgba(107,142,104,0.35)", accentSoft: "rgba(107,142,104,0.12)", surface: "rgba(107,142,104,0.06)", gradients: { dark: "linear-gradient(180deg, #0A0F0A 0%, #0E140E 50%, #0A0F0A 100%)", warm: "linear-gradient(180deg, #0C110C 0%, #121A12 40%, #0C110C 100%)", accent: "linear-gradient(135deg, #0A0F0A 0%, #0F1A0F 50%, #0A0F0A 100%)", deep: "linear-gradient(180deg, #080D08 0%, #0C120C 50%, #080D08 100%)", hero: "linear-gradient(180deg, #0C120C 0%, #111A11 35%, #0A0F0A 100%)" } } },
    { productId: "fitfo", tokens: { bg: "#0A0A0B", bgAlt: "#0F0F10", fg: "#F8F8F6", fgMuted: "#8A8A90", accent: "#F97316", accentGlow: "rgba(249,115,22,0.35)", accentSoft: "rgba(249,115,22,0.12)", surface: "rgba(249,115,22,0.06)", gradients: { dark: "linear-gradient(180deg, #0A0A0B 0%, #0F0F10 50%, #0A0A0B 100%)", warm: "linear-gradient(180deg, #0C0A08 0%, #181008 40%, #0C0A08 100%)", accent: "linear-gradient(135deg, #0A0A0B 0%, #140D06 50%, #0A0A0B 100%)", deep: "linear-gradient(180deg, #080808 0%, #0E0B07 50%, #080808 100%)", hero: "linear-gradient(180deg, #0C0B09 0%, #16100A 35%, #0A0A0B 100%)" } } },
  ]);

  // ── Locales ──────────────────────────────────────────────────────────────
  await db.insert(schema.productLocales).values([
    // hone — no locales defined (en only, implicit)
    // amfo — no locales defined
    { productId: "lichta",    code: "vi", label: "Tiếng Việt", flag: "🇻🇳", sortOrder: 0 },
    { productId: "lichta",    code: "en", label: "English",    flag: "🇺🇸", sortOrder: 1 },
    { productId: "tinysteps", code: "en", label: "English",    flag: "🇺🇸", sortOrder: 0 },
    { productId: "tinysteps", code: "vi", label: "Tiếng Việt", flag: "🇻🇳", sortOrder: 1 },
    { productId: "fitfo",     code: "en", label: "English",    flag: "🇺🇸", sortOrder: 0 },
  ]);

  // ── Slides ────────────────────────────────────────────────────────────────
  await db.insert(schema.productSlides).values([
    ...honeSlides, ...amfoSlides, ...lichtaSlides, ...tinystepsSlides, ...fitfoSlides,
  ]);

  // ── Slide copy ────────────────────────────────────────────────────────────
  await db.insert(schema.slideCopy).values([
    ...honeCopy, ...amfoCopy, ...lichtaCopy, ...tinystepsCopy, ...fitfoCopy,
  ]);

  // ── Metadata ──────────────────────────────────────────────────────────────
  await db.insert(schema.productMetadata).values([
    {
      productId: "hone", locale: "en",
      name: "Life Refine: Hone Skills Daily",
      subtitle: "Refine your life daily with AI",
      promoText: "Focus on the daily, sustainable actions that improve your physical, mental, and emotional well-being.",
      shortDescription: "Cultivate lasting change through small, consistent habits and AI-guided reflection.",
      keywords: "daily habits,well-being,mindfulness,habit tracker,self improvement,reflection,wellness,journal",
      description: `Stop chasing overnight overhauls. Start cultivating lasting change with the power of small, consistent habits.

Hone is your personal AI companion designed to help you focus on the daily, sustainable actions that improve your physical, mental, and emotional well-being over time. By shifting the focus from massive results to daily repetitions, Hone makes personal growth inevitable and burnout impossible.

THE COMPOUNDING EFFECT OF MICRO-HABITS

Science shows that small, consistent actions are significantly more effective for lasting change than ambitious, one-time efforts. Hone is built entirely on this principle: winning the day, one habit at a time.

HOW HONE WORKS

1. REFLECT - Journal your thoughts, feelings, and actions. Our AI companion listens with empathy, helping you identify patterns and find clarity in your daily life.

2. CULTIVATE - Hone automatically transforms your reflections into small, actionable habits. No more complex planning—just focus on the next sustainable step.

3. EVOLVE - Watch your progress compound. With visual heatmaps, mood flow tracking, and consistency streaks, you can see the tangible results of your daily commitment to well-being.

KEY FEATURES

- AI-Powered Mindful Journaling - A reflective space to clear your mind and gain insight.
- Smart Habit Extraction - AI turns your reflections into manageable, daily actions.
- Holistic Well-being Tracking - Monitor your mood, energy, and consistency in one place.
- Voice & Photo Journaling - Capture your journey in whatever way feels most natural.
- Consistency Heatmap - Visualize the momentum you're building every single day.
- Privacy-First - Your journey is for your eyes only. Local encryption, no cloud, no ads.

Hone isn't about being perfect. It's about being consistent. Sharpen your life, one day at a time.

Questions? support@thehoneapp.com
Privacy: https://thehoneapp.com/privacy
Terms: https://thehoneapp.com/terms`,
    },
    {
      productId: "amfo", locale: "en",
      name: "Amfo: Ambient Focus Sounds",
      subtitle: "Ambient Sounds, Focus, Sleep",
      promoText: "50+ curated ambient sounds - mix rain, café, and nature for your perfect focus session.",
      shortDescription: "Ambient sounds and custom mixes for focus, sleep, and relaxation.",
      keywords: "ambient sounds,white noise,focus,sleep sounds,nature sounds,rain sounds,sound mixer,relaxation",
      description: `Find your calm and enter deep flow with Amfo.

Mix 50+ curated ambient sounds to create your perfect environment. Whether you need deep focus for work, a calming atmosphere for study, or peaceful background noise to fall asleep, Amfo gives you the tools to silence distractions.

FEATURES
- Mix unlimited sounds with independent volumes
- Save your favorite mixes as custom Presets
- Beautiful distraction-free Focus Timer
- Auto-hide UI during active timer sessions
- Sleep Fade Out for bedtime routines
- Background audio: Keeps playing when you switch apps
- Absolutely zero intrusive ads

Privacy Policy: https://www.apple.com/legal/privacy/
Terms of Service: https://www.apple.com/legal/internet-services/itunes/`,
    },
    {
      productId: "lichta", locale: "vi",
      name: "Lịch Ta - Lịch Âm & Tử Vi AI",
      subtitle: "Lịch Âm · Can Chi · Hoàng Đạo",
      promoText: "Hỏi Thầy AI về tử vi, phong thủy, phong tục Việt Nam - trả lời ngay trong app!",
      shortDescription: "Lịch âm Việt Nam với Can Chi, Tiết Khí, Hoàng Đạo và Thầy AI tử vi.",
      keywords: "lịch âm,lịch ta,can chi,tiết khí,hoàng đạo,tử vi,phong thủy,âm lịch,lịch việt nam",
      description: `Lịch Ta - Ứng dụng lịch âm duy nhất tích hợp Trợ lý Tử Vi AI. Xem ngày tốt xấu, giờ hoàng đạo, phong thủy - hoàn toàn không quảng cáo.`,
    },
    {
      productId: "lichta", locale: "en",
      name: "Lich Ta - Lunar Calendar & AI",
      subtitle: "Lunar Calendar · Feng Shui",
      promoText: "Ask the AI Master about horoscopes, feng shui, and Vietnamese customs - instant answers!",
      shortDescription: "Vietnamese lunar calendar with AI astrology, auspicious hours & event reminders.",
      keywords: "lunar calendar,vietnamese calendar,feng shui,horoscope,astrology,zodiac,lunar new year",
      description: `Lich Ta - The only lunar calendar app with a built-in AI Astrology Master. Check auspicious days, lucky hours, and feng shui guidance - completely ad-free.`,
    },
    {
      productId: "tinysteps", locale: "en",
      name: "TinySteps: Baby Tracker",
      subtitle: "Growth, Milestones & Vaccines",
      promoText: "Track your baby's growth, milestones, and vaccinations with beautiful charts and AI insights.",
      shortDescription: "Baby growth tracker with milestones, vaccinations, AI chat, and family sharing.",
      keywords: "baby tracker,growth chart,milestones,vaccination tracker,baby journal,parenting,newborn",
      description: `Every tiny step matters. TinySteps is your all-in-one baby growth companion — beautifully designed to help you track, understand, and celebrate your baby's journey.

GROWTH TRACKING

Log weight, height, and head circumference with ease. Watch your baby's progress on beautiful, easy-to-read growth charts that update in real time.

DEVELOPMENTAL MILESTONES

Track 42+ age-based milestones from 0–12 months. Know what to expect at each stage, from first smiles to first steps. Check them off as your baby reaches each one.

VACCINATION SCHEDULE

Never miss a dose. Track completed and upcoming vaccinations with overdue alerts. See your baby's full immunization history at a glance.

Questions? hi@yikudo.xyz
Privacy: https://yikudo.xyz/tinysteps/privacy
Terms: https://yikudo.xyz/tinysteps/terms`,
    },
    {
      productId: "tinysteps", locale: "vi",
      name: "TinySteps: ",
      subtitle: "Theo dõi tăng trưởng, cột mốc & tiêm chủng với AI",
      promoText: "Theo dõi sự phát triển, cột mốc, và lịch tiêm chủng của bé với biểu đồ đẹp và AI.",
      shortDescription: "Theo dõi bé với biểu đồ tăng trưởng, cột mốc phát triển, tiêm chủng và AI.",
      keywords: "theo dõi bé,biểu đồ tăng trưởng,cột mốc,tiêm chủng,nhật ký bé,nuôi con,sơ sinh",
      description: `Từng bước nhỏ đều đáng nhớ. TinySteps là ứng dụng theo dõi sự phát triển toàn diện của bé — được thiết kế đẹp mắt để giúp bạn ghi lại, hiểu và ăn mừng hành trình lớn lên của con.

Câu hỏi? hi@yikudo.xyz
Quyền riêng tư: https://yikudo.xyz/tinysteps/privacy
Điều khoản: https://yikudo.xyz/tinysteps/terms`,
    },
    {
      productId: "fitfo", locale: "en",
      name: "FitFo Workout AI Planner & Log",
      subtitle: "Workout Plan & Nutrition with AI coach",
      promoText: "AI-generated workout plans and macro tracking built around your body type and goals.",
      shortDescription: "AI fitness tracker with workouts, nutrition, progress photos, and Fit Score.",
      keywords: "fitness tracker,workout planner,macro tracker,AI workout,calorie tracker,strength training",
      description: `Your fitness, scored. FitFo is the all-in-one AI fitness companion that builds a plan around your body type, goals, and schedule — then tracks every rep, meal, and milestone.

AI WORKOUT PLAN

FitFo generates a personalized daily workout plan based on your somatotype, training frequency, and goals. Push Day, Pull Day, rest — it's all mapped out for you.

NUTRITION TRACKING

Log meals and track macros with smart calorie targets adjusted for training and rest days. See protein, carbs, and fat broken down for every meal.

PERSONAL FIT SCORE

Your Fit Score maps your fitness across five dimensions: Strength, Stamina, Physique, Discipline, and Mobility. Know exactly where you're strong and what to improve next.`,
    },
  ]);

  // ── Feature Graphics ──────────────────────────────────────────────────────
  await db.insert(schema.productFeatureGraphics).values([
    { productId: "hone",      tagline: "Refine your life daily with HONE",        subtitle: "Sharpen your edge. Every day." },
    { productId: "amfo",      tagline: "Amfo: Ambient Focus Sounds",               subtitle: "50+ ambient sounds for focus, sleep, and flow." },
    { productId: "lichta",    tagline: "Lịch Ta",                                  subtitle: "Lịch âm, Can Chi, Tiết Khí - tất cả ở một chỗ." },
    { productId: "tinysteps", tagline: "TinySteps: Baby Growth Tracker",           subtitle: "Track milestones, vaccinations, and growth — all in one place." },
    { productId: "fitfo",     tagline: "FitFo Workout AI Planner & Log",           subtitle: "Workouts, nutrition, progress photos, and a personal Fit Score — all in one place." },
  ]);

  // ── Social OGs ────────────────────────────────────────────────────────────
  await db.insert(schema.productSocialOgs).values([
    { productId: "hone",      tagline: "Refine your life daily with HONE",        subtitle: "Daily protocols, AI coaching, and progress tracking for peak performance." },
    { productId: "amfo",      tagline: "Amfo: Ambient Focus Sounds",               subtitle: "Curated ambient sounds and custom mixes for deep focus and restful sleep." },
    { productId: "lichta",    tagline: "Lịch Ta - Lịch Âm & Tử Vi AI",            subtitle: "Âm lịch, Can Chi, Hoàng Đạo, Tử Vi AI và hơn thế nữa." },
    { productId: "tinysteps", tagline: "TinySteps: Baby Growth Tracker",           subtitle: "Beautiful growth charts, milestone tracking, AI insights, and family sharing." },
    { productId: "fitfo",     tagline: "FitFo Workout AI Planner & Log",           subtitle: "AI workout plans, macro tracking, progress photos, and a personal Fit Score." },
  ]);

  // ── CTA Images ────────────────────────────────────────────────────────────
  await db.insert(schema.productCtaImages).values([
    { productId: "hone",      headline: "Small habits repeated = Big change",                                      sc1: "sc_hone1.png",  sc2: "sc_hone2.png",  ctaLabel: "↑ link in bio" },
    { productId: "amfo",      headline: "drown out the world, dial into focus",                                    sc1: "sc_amfo2.png",  sc2: "sc_amfo3.png",  ctaLabel: "↑ link in bio" },
    { productId: "lichta",    headline: "Lịch Âm & Tử Vi trong tầm tay",                                          sc1: "sc1.png",       sc2: "sc2.png",       ctaLabel: "↑ link in bio" },
    { productId: "tinysteps", headline: "track your baby's growth, milestones, and vaccinations",  headlineByLocale: { vi: "Cùng bé lớn lên với sự an tâm" },  sc1: "sc1.png", sc2: "sc2.png", ctaLabel: "↑ link in bio" },
    { productId: "fitfo",     headline: "Your fitness, scored, tracked and coached — all in one place.",           sc1: "sc1.png",       sc2: "sc2.png",       ctaLabel: "↑ link in bio" },
  ]);

  await sql.end();
  console.log("Seed complete.");
}

seed().catch((err) => { console.error(err); process.exit(1); });
