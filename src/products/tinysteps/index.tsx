import React from "react";
import type { ProductConfig, ThemeTokens } from "@/lib/types";
import {
  TinyStepsSlide1, TinyStepsSlide2, TinyStepsSlide3,
  TinyStepsSlide4, TinyStepsSlide5, TinyStepsSlide6, TinyStepsSlide7,
  TinyStepsViSlide1, TinyStepsViSlide2, TinyStepsViSlide3, TinyStepsViSlide4,
  TinyStepsViSlide5, TinyStepsViSlide6,
} from "./slides";

export const TINYSTEPS_THEME: ThemeTokens = {
  bg: "#0A0F0A",
  bgAlt: "#0E140E",
  fg: "#F5F8F2",
  fgMuted: "#8A9A82",
  accent: "#6B8E68",
  accentGlow: "rgba(107,142,104,0.35)",
  accentSoft: "rgba(107,142,104,0.12)",
  surface: "rgba(107,142,104,0.06)",
  gradients: {
    dark: "linear-gradient(180deg, #0A0F0A 0%, #0F150E 50%, #0A0F0A 100%)",
    warm: "linear-gradient(180deg, #0C100A 0%, #14190F 40%, #0C100A 100%)",
    accent: "linear-gradient(135deg, #0A0F0A 0%, #121D10 50%, #0A0F0A 100%)",
    deep: "linear-gradient(180deg, #080C08 0%, #0E130D 50%, #080C08 100%)",
    hero: "linear-gradient(180deg, #0C110A 0%, #141C10 35%, #0A0F0A 100%)",
  },
};

const T = TINYSTEPS_THEME;

export const TINYSTEPS: ProductConfig = {
  id: "tinysteps",
  name: "TinySteps: Baby Tracker",
  iconPath: "/products/tinysteps/icon.png",
  screenshotBase: "/products/tinysteps/screenshots/en",
  screenshotBaseByLocale: {
    en: "/products/tinysteps/screenshots/en",
    vi: "/products/tinysteps/screenshots/vi",
  },
  theme: TINYSTEPS_THEME,
  locales: [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  ],
  slides: {
    iphone: [
      {
        id: "hero",
        copy: {
          label: "BABY GROWTH TRACKER",
          headline: <>Every milestone.<br /><span style={{ color: T.accent }}>Captured.</span></>,
          subtitle: <>Track weight, height, and head size<br />with beautiful growth charts.</>,
        },
        copyByLocale: {
          vi: {
            label: "THEO DÕI BÉ LỚN",
            headline: <>Từng bước nhỏ.<br /><span style={{ color: T.accent }}>Đều đáng nhớ.</span></>,
            subtitle: <>Theo dõi cân nặng, chiều cao,<br />và vòng đầu với biểu đồ trực quan.</>,
          },
        },
        Component: TinyStepsSlide1,
      },
      {
        id: "milestones",
        copy: {
          label: "DEVELOPMENTAL MILESTONES",
          headline: <>Never miss<br /><span style={{ color: T.accent }}>a first.</span></>,
          subtitle: <>Track 42+ milestones from<br />0–12 months, guided by age.</>,
        },
        copyByLocale: {
          vi: {
            label: "CỘT MỐC PHÁT TRIỂN",
            headline: <>Đừng bỏ lỡ<br /><span style={{ color: T.accent }}>khoảnh khắc nào.</span></>,
            subtitle: <>Theo dõi 42+ cột mốc từ<br />0–12 tháng, theo từng giai đoạn.</>,
          },
        },
        Component: TinyStepsSlide2,
      },
      {
        id: "vaccinations",
        copy: {
          label: "VACCINATION TRACKER",
          headline: <>Stay on<br /><span style={{ color: T.accent }}>schedule.</span></>,
          subtitle: <>Track every dose, see what's due,<br />never miss a vaccination.</>,
        },
        copyByLocale: {
          vi: {
            label: "LỊCH TIÊM CHỦNG",
            headline: <>Đúng lịch.<br /><span style={{ color: T.accent }}>An tâm.</span></>,
            subtitle: <>Theo dõi từng mũi tiêm,<br />không bao giờ quên lịch hẹn.</>,
          },
        },
        Component: TinyStepsSlide3,
      },
      {
        id: "journal",
        copy: {
          label: "BABY JOURNAL",
          headline: <>Memories<br /><span style={{ color: T.accent }}>worth keeping.</span></>,
          subtitle: <>A beautiful timeline of your<br />baby's most precious moments.</>,
        },
        copyByLocale: {
          vi: {
            label: "NHẬT KÝ BÉ YÊU",
            headline: <>Kỷ niệm<br /><span style={{ color: T.accent }}>đáng giữ.</span></>,
            subtitle: <>Dòng thời gian xinh đẹp ghi lại<br />những khoảnh khắc quý giá nhất.</>,
          },
        },
        Component: TinyStepsSlide4,
      },
      {
        id: "ai-chat",
        copy: {
          label: "AI PARENTING GUIDE",
          headline: <>Ask anything.<br /><span style={{ color: T.accent }}>Get answers.</span></>,
          subtitle: <>AI-powered insights about your<br />baby's growth and development.</>,
        },
        copyByLocale: {
          vi: {
            label: "TRỢ LÝ AI CHO BỐ MẸ",
            headline: <>Hỏi gì<br /><span style={{ color: T.accent }}>cũng được.</span></>,
            subtitle: <>AI phân tích sự phát triển và<br />tăng trưởng của bé cho bạn.</>,
          },
        },
        Component: TinyStepsSlide5,
      },
      {
        id: "family",
        copy: {
          label: "FAMILY SHARING",
          headline: <>Track<br /><span style={{ color: T.accent }}>together.</span></>,
          subtitle: <>Invite your partner or family<br />to share the journey.</>,
        },
        copyByLocale: {
          vi: {
            label: "CHIA SẺ GIA ĐÌNH",
            headline: <>Cùng nhau<br /><span style={{ color: T.accent }}>theo dõi.</span></>,
            subtitle: <>Mời bạn đời hoặc gia đình<br />cùng chăm sóc bé yêu.</>,
          },
        },
        Component: TinyStepsSlide6,
      },
      {
        id: "growth",
        copy: {
          label: "COMPLETE PICTURE",
          headline: <>Watch them<br /><span style={{ color: T.accent }}>grow.</span></>,
          subtitle: <>Milestones, vaccinations, and growth<br />tracking — all in one place.</>,
        },
        copyByLocale: {
          vi: {
            label: "BỨC TRANH TOÀN DIỆN",
            headline: <>Nhìn bé<br /><span style={{ color: T.accent }}>lớn lên.</span></>,
            subtitle: <>Cột mốc, tiêm chủng, và biểu đồ<br />tăng trưởng — tất cả ở một chỗ.</>,
          },
        },
        Component: TinyStepsSlide7,
      },
    ],
  },
  slidesByLocale: {
    vi: {
      iphone: [
        {
          // sc1: Home / Growth Dashboard
          id: "hero",
          copy: {
            label: "THEO DÕI BÉ LỚN",
            headline: <>Từng bước nhỏ.<br /><span style={{ color: T.accent }}>Đều đáng nhớ.</span></>,
            subtitle: <>Theo dõi cân nặng, chiều cao,<br />và vòng đầu với biểu đồ trực quan.</>,
          },
          Component: TinyStepsViSlide1,
        },
        {
          // sc2: Journal (photo timeline)
          id: "journal",
          copy: {
            label: "NHẬT KÝ BÉ YÊU",
            headline: <>Kỷ niệm<br /><span style={{ color: T.accent }}>đáng giữ.</span></>,
            subtitle: <>Dòng thời gian xinh đẹp ghi lại<br />những khoảnh khắc quý giá nhất.</>,
          },
          Component: TinyStepsViSlide2,
        },
        {
          // sc3: AI Chat
          id: "ai-chat",
          copy: {
            label: "TRỢ LÝ AI CHO BỐ MẸ",
            headline: <>Hỏi gì<br /><span style={{ color: T.accent }}>cũng được.</span></>,
            subtitle: <>AI phân tích sự phát triển và<br />tăng trưởng của bé cho bạn.</>,
          },
          Component: TinyStepsViSlide3,
        },
        {
          // sc4: Settings (bilingual / customisation)
          id: "settings",
          copy: {
            label: "TUỲ CHỈNH THEO Ý BẠN",
            headline: <>Cài đặt<br /><span style={{ color: T.accent }}>theo sở thích.</span></>,
            subtitle: <>Chọn ngôn ngữ, đơn vị đo lường,<br />và thông báo phù hợp với gia đình bạn.</>,
          },
          Component: TinyStepsViSlide4,
        },
        {
          // sc5: Developmental Milestones
          id: "milestones",
          copy: {
            label: "CỘT MỐC PHÁT TRIỂN",
            headline: <>Đừng bỏ lỡ<br /><span style={{ color: T.accent }}>khoảnh khắc nào.</span></>,
            subtitle: <>Theo dõi 42+ cột mốc từ<br />0–24 tháng, theo từng giai đoạn.</>,
          },
          Component: TinyStepsViSlide5,
        },
        {
          // sc6: Vaccinations
          id: "vaccinations",
          copy: {
            label: "LỊCH TIÊM CHỦNG",
            headline: <>Đúng lịch.<br /><span style={{ color: T.accent }}>An tâm.</span></>,
            subtitle: <>Theo dõi từng mũi tiêm,<br />không bao giờ quên lịch hẹn.</>,
          },
          Component: TinyStepsViSlide6,
        },
      ],
    },
  },
  ctaImage: {
    headline: "track your baby's growth, milestones, and vaccinations",
    headlineByLocale: {
      vi: "Cùng bé lớn lên với sự an tâm",
    },
    sc1: "sc1.png",
    sc2: "sc2.png",
    ctaLabel: "↑ link in bio",
  },
  featureGraphic: {
    tagline: "TinySteps: Baby Growth Tracker",
    subtitle: "Track milestones, vaccinations, and growth — all in one place.",
  },
  socialOg: {
    tagline: "TinySteps: Baby Growth Tracker",
    subtitle: "Beautiful growth charts, milestone tracking, AI insights, and family sharing.",
  },
  metadata: {
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

BABY JOURNAL

Capture every precious moment in a beautiful timeline. First words, first foods, funny moments — your baby's story, told day by day.

AI PARENTING GUIDE

Ask questions about your baby's growth, feeding, sleep, and development. TinySteps AI provides personalized insights based on your baby's actual data.

FAMILY SHARING

Invite your partner, grandparents, or caregivers to track together. Everyone stays in sync with a shared profile and real-time updates.

MULTI-BABY SUPPORT

Tracking twins or siblings? Add multiple baby profiles and switch between them effortlessly.

BILINGUAL

Full support for English and Vietnamese (Tiếng Việt).

Questions? hi@yikudo.xyz
Privacy: https://yikudo.xyz/tinysteps/privacy
Terms: https://yikudo.xyz/tinysteps/terms`,
  },
  metadataByLocale: {
    vi: {
      name: "TinySteps: Theo Dõi Bé",
      subtitle: "Tăng Trưởng & Cột Mốc",
      promoText: "Theo dõi sự phát triển, cột mốc, và lịch tiêm chủng của bé với biểu đồ đẹp và AI.",
      shortDescription: "Theo dõi bé với biểu đồ tăng trưởng, cột mốc phát triển, tiêm chủng và AI.",
      keywords: "theo dõi bé,biểu đồ tăng trưởng,cột mốc,tiêm chủng,nhật ký bé,nuôi con,sơ sinh",
      description: `Từng bước nhỏ đều đáng nhớ. TinySteps là ứng dụng theo dõi sự phát triển toàn diện của bé — được thiết kế đẹp mắt để giúp bạn ghi lại, hiểu và ăn mừng hành trình lớn lên của con.

THEO DÕI TĂNG TRƯỞNG

Ghi lại cân nặng, chiều cao, và vòng đầu dễ dàng. Xem tiến trình của bé trên biểu đồ tăng trưởng đẹp và cập nhật theo thời gian thực.

CỘT MỐC PHÁT TRIỂN

Theo dõi 42+ cột mốc theo độ tuổi từ 0–12 tháng. Biết trước những gì sẽ xảy ra ở từng giai đoạn, từ nụ cười đầu tiên đến bước đi đầu tiên.

LỊCH TIÊM CHỦNG

Không bao giờ bỏ lỡ mũi tiêm. Theo dõi tiêm chủng đã hoàn thành và sắp tới với cảnh báo quá hạn.

NHẬT KÝ BÉ YÊU

Ghi lại mỗi khoảnh khắc quý giá trong dòng thời gian xinh đẹp. Từ đầu tiên, thức ăn đầu tiên, những khoảnh khắc vui nhộn.

TRỢ LÝ AI CHO BỐ MẸ

Hỏi về sự phát triển, ăn uống, giấc ngủ và phát triển của bé. TinySteps AI cung cấp thông tin được cá nhân hóa dựa trên dữ liệu thực tế của bé.

CHIA SẺ GIA ĐÌNH

Mời bạn đời, ông bà, hoặc người chăm sóc cùng theo dõi. Mọi người đều đồng bộ với hồ sơ chung.

Câu hỏi? hi@yikudo.xyz
Quyền riêng tư: https://yikudo.xyz/tinysteps/privacy
Điều khoản: https://yikudo.xyz/tinysteps/terms`,
    },
  },
};
