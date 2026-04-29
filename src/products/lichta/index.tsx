import React from "react";
import type { ProductConfig, ThemeTokens } from "@/lib/types";
import {
  LichtaSlide1, LichtaSlide2, LichtaSlide3, LichtaSlide4,
  LichtaSlide5, LichtaSlide6, LichtaSlide7,
  LichtaAndroid1, LichtaAndroid2, LichtaAndroid3, LichtaAndroid4,
  LichtaAndroid5, LichtaAndroid6, LichtaAndroid7,
} from "./slides";

export const LICHTA_THEME: ThemeTokens = {
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
    accent: "linear-gradient(135deg, #1A0A06 0%, #2A1008 50%, #1A0A06 100%)",
    deep: "linear-gradient(180deg, #120805 0%, #1C0C07 50%, #120805 100%)",
    hero: "linear-gradient(180deg, #1D0C07 0%, #2A1108 35%, #1A0A06 100%)",
  },
};

const T = LICHTA_THEME;

export const LICHTA: ProductConfig = {
  id: "lichta",
  name: "Lịch Ta - Lịch Âm & Tử Vi AI",
  iconPath: "/products/lichta/icon.png",
  screenshotBase: "/products/lichta/screenshots",
  theme: LICHTA_THEME,
  locales: [
    { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
    { code: "en", label: "English", flag: "🇺🇸" },
  ],
  slides: {
    iphone: [
      {
        id: "hero",
        copy: {
          label: "LỊCH ÂM VIỆT NAM",
          headline: <>Lịch Âm<br /><span style={{ color: T.accent }}>trong tầm tay.</span></>,
          subtitle: <>Âm lịch, Can Chi, Tiết Khí,<br />Hoàng Đạo - tất cả ở một chỗ.</>,
        },
        copyByLocale: {
          en: {
            label: "LUNAR CALENDAR",
            headline: <>Today's date,<br /><span style={{ color: T.accent }}>at a glance.</span></>,
            subtitle: <>Lunar date, Can Chi, Solar Terms,<br />Auspicious Hours — all in one place.</>,
          },
        },
        Component: LichtaSlide1,
      },
      {
        id: "events",
        copy: {
          label: "SỰ KIỆN ÂM LỊCH",
          headline: <>Không bao giờ<br /><span style={{ color: T.accent }}>quên ngày giỗ.</span></>,
          subtitle: <>Giỗ chạp, sinh nhật, ngày cưới<br />theo âm lịch - nhắc tự động.</>,
        },
        copyByLocale: {
          en: {
            label: "LUNAR EVENTS",
            headline: <>Never miss<br /><span style={{ color: T.accent }}>an anniversary.</span></>,
            subtitle: <>Death anniversaries, birthdays,<br />weddings by lunar date — auto-reminded.</>,
          },
        },
        Component: LichtaSlide2,
      },
      {
        id: "calendar",
        copy: {
          label: "LỊCH ÂM CHI TIẾT",
          headline: <>Can Chi,<br /><span style={{ color: T.accent }}>Hoàng Đạo.</span></>,
          subtitle: <>Tiết khí, Thần Sát, giờ Hoàng Đạo<br />hiển thị ngay khi chọn ngày.</>,
        },
        copyByLocale: {
          en: {
            label: "DETAILED LUNAR",
            headline: <>Can Chi &<br /><span style={{ color: T.accent }}>Auspicious Hours.</span></>,
            subtitle: <>Solar terms, Lucky Gods, Auspicious Hours<br />shown the moment you pick a date.</>,
          },
        },
        Component: LichtaSlide3,
      },
      {
        id: "ai",
        copy: {
          label: "XEM TỬ VI AI",
          headline: <>Tử Vi AI<br /><span style={{ color: T.accent }}>bất cứ lúc nào.</span></>,
          subtitle: <>Tử vi, vận mệnh, phong thủy<br />AI trả lời ngay.</>,
        },
        copyByLocale: {
          en: {
            label: "LICH TA AI MASTER",
            headline: <>Your AI Astrologer,<br /><span style={{ color: T.accent }}>anytime.</span></>,
            subtitle: <>Horoscopes, feng shui, Vietnamese<br />customs — AI answers instantly.</>,
          },
        },
        Component: LichtaSlide4,
      },
      {
        id: "themes",
        copy: {
          label: "GIAO DIỆN CÁ NHÂN",
          headline: <>Màu sắc<br /><span style={{ color: T.accent }}>theo ý bạn.</span></>,
          subtitle: <>Hình nền thành phố Việt Nam,<br />màu chủ đạo tùy chỉnh thoải mái.</>,
        },
        copyByLocale: {
          en: {
            label: "PERSONAL THEMES",
            headline: <>Colors<br /><span style={{ color: T.accent }}>your way.</span></>,
            subtitle: <>Vietnamese city wallpapers,<br />custom accent colors to your taste.</>,
          },
        },
        Component: LichtaSlide5,
      },
      {
        id: "wisdom",
        copy: {
          label: "TỬ VI - PHONG THỦY",
          headline: <>Vận mệnh.<br /><span style={{ color: T.accent }}>Rõ từng ngày.</span></>,
          subtitle: <>Chat với AI về tình duyên, công việc,<br />sức khỏe - theo lá số của bạn.</>,
        },
        copyByLocale: {
          en: {
            label: "ASTROLOGY & FENG SHUI",
            headline: <>Your destiny.<br /><span style={{ color: T.accent }}>Day by day.</span></>,
            subtitle: <>Chat with AI about love, career,<br />health — based on your birth chart.</>,
          },
        },
        Component: LichtaSlide6,
      },
      {
        id: "widgets",
        copy: {
          label: "",
          headline: <>Widget đẹp<br /><span style={{ color: T.accent }}>mỗi ngày.</span></>,
          subtitle: <>Thêm widget vào màn hình chính,<br />xem lịch âm ngay không cần mở app.</>,
        },
        copyByLocale: {
          en: {
            label: "",
            headline: <>Beautiful widgets<br /><span style={{ color: T.accent }}>every day.</span></>,
            subtitle: <>Add a widget to your home screen,<br />check the lunar date without opening the app.</>,
          },
        },
        Component: LichtaSlide7,
      },
    ],
    android: [
      {
        id: "hero",
        copy: {
          label: "LỊCH ÂM VIỆT NAM",
          headline: <>Lịch Âm<br /><span style={{ color: T.accent }}>trong tầm tay.</span></>,
          subtitle: <>Âm lịch, Can Chi, Tiết Khí,<br />Hoàng Đạo - tất cả ở một chỗ.</>,
        },
        copyByLocale: {
          en: {
            label: "LUNAR CALENDAR",
            headline: <>Today's date,<br /><span style={{ color: T.accent }}>at a glance.</span></>,
            subtitle: <>Lunar date, Can Chi, Solar Terms,<br />Auspicious Hours — all in one place.</>,
          },
        },
        Component: LichtaAndroid1,
      },
      {
        id: "events",
        copy: {
          label: "SỰ KIỆN ÂM LỊCH",
          headline: <>Không bao giờ<br /><span style={{ color: T.accent }}>quên ngày giỗ.</span></>,
          subtitle: <>Giỗ chạp, sinh nhật, ngày cưới<br />theo âm lịch - nhắc tự động.</>,
        },
        copyByLocale: {
          en: {
            label: "LUNAR EVENTS",
            headline: <>Never miss<br /><span style={{ color: T.accent }}>an anniversary.</span></>,
            subtitle: <>Death anniversaries, birthdays,<br />weddings by lunar date — auto-reminded.</>,
          },
        },
        Component: LichtaAndroid2,
      },
      {
        id: "calendar",
        copy: {
          label: "LỊCH ÂM CHI TIẾT",
          headline: <>Can Chi,<br /><span style={{ color: T.accent }}>Hoàng Đạo.</span></>,
          subtitle: <>Tiết khí, Thần Sát, giờ Hoàng Đạo<br />hiển thị ngay khi chọn ngày.</>,
        },
        copyByLocale: {
          en: {
            label: "DETAILED LUNAR",
            headline: <>Can Chi &<br /><span style={{ color: T.accent }}>Auspicious Hours.</span></>,
            subtitle: <>Solar terms, Lucky Gods, Auspicious Hours<br />shown the moment you pick a date.</>,
          },
        },
        Component: LichtaAndroid3,
      },
      {
        id: "ai",
        copy: {
          label: "THẦY LỊCH TA AI",
          headline: <>Tử Vi AI<br /><span style={{ color: T.accent }}>bất cứ lúc nào.</span></>,
          subtitle: <>Tử vi, vận mệnh, phong thủy<br />AI trả lời ngay.</>,
        },
        copyByLocale: {
          en: {
            label: "LICH TA AI MASTER",
            headline: <>Your AI Astrologer,<br /><span style={{ color: T.accent }}>anytime.</span></>,
            subtitle: <>Horoscopes, feng shui, Vietnamese<br />customs — AI answers instantly.</>,
          },
        },
        Component: LichtaAndroid4,
      },
      {
        id: "themes",
        copy: {
          label: "GIAO DIỆN CÁ NHÂN",
          headline: <>Màu sắc<br /><span style={{ color: T.accent }}>theo ý bạn.</span></>,
          subtitle: <>Hình nền thành phố Việt Nam,<br />màu chủ đạo tùy chỉnh thoải mái.</>,
        },
        copyByLocale: {
          en: {
            label: "PERSONAL THEMES",
            headline: <>Colors<br /><span style={{ color: T.accent }}>your way.</span></>,
            subtitle: <>Vietnamese city wallpapers,<br />custom accent colors to your taste.</>,
          },
        },
        Component: LichtaAndroid5,
      },
      {
        id: "wisdom",
        copy: {
          label: "TỬ VI - PHONG THỦY",
          headline: <>Vận mệnh.<br /><span style={{ color: T.accent }}>Rõ từng ngày.</span></>,
          subtitle: <>Chat với AI về tình duyên, công việc,<br />sức khỏe - theo lá số của bạn.</>,
        },
        copyByLocale: {
          en: {
            label: "ASTROLOGY & FENG SHUI",
            headline: <>Your destiny.<br /><span style={{ color: T.accent }}>Day by day.</span></>,
            subtitle: <>Chat with AI about love, career,<br />health — based on your birth chart.</>,
          },
        },
        Component: LichtaAndroid6,
      },
      {
        id: "widgets",
        copy: {
          label: "",
          headline: <>Widget đẹp<br /><span style={{ color: T.accent }}>mỗi ngày.</span></>,
          subtitle: <>Thêm widget vào màn hình chính,<br />xem lịch âm ngay không cần mở app.</>,
        },
        copyByLocale: {
          en: {
            label: "",
            headline: <>Beautiful widgets<br /><span style={{ color: T.accent }}>every day.</span></>,
            subtitle: <>Add a widget to your home screen,<br />check the lunar date without opening the app.</>,
          },
        },
        Component: LichtaAndroid7,
      },
    ],
  },
  ctaImage: {
    headline: "Lịch Âm & Tử Vi trong tầm tay",
    sc1: "sc1.png",
    sc2: "sc2.png",
    ctaLabel: "↑ link in bio",
  },
  featureGraphic: {
    tagline: "Lịch Ta",
    subtitle: "Lịch âm, Can Chi, Tiết Khí - tất cả ở một chỗ.",
  },
  socialOg: {
    tagline: "Lịch Ta - Lịch Âm & Tử Vi AI",
    subtitle: "Âm lịch, Can Chi, Hoàng Đạo, Tử Vi AI và hơn thế nữa.",
  },

  metadata: {
    name: "Lịch Ta - Lịch Âm & Tử Vi AI",
    subtitle: "Lịch Âm · Can Chi · Hoàng Đạo",
    promoText: "Hỏi Thầy AI về tử vi, phong thủy, phong tục Việt Nam - trả lời ngay trong app!",
    shortDescription: "Lịch âm Việt Nam với Can Chi, Tiết Khí, Hoàng Đạo và Thầy AI tử vi.",
    keywords: "lịch âm,lịch ta,can chi,tiết khí,hoàng đạo,tử vi,phong thủy,âm lịch,lịch việt nam",
    description: `Lịch Ta - Ứng dụng lịch âm duy nhất tích hợp Trợ lý Tử Vi AI. Xem ngày tốt xấu, giờ hoàng đạo, phong thủy - hoàn toàn không quảng cáo.
50.000+ người Việt tin dùng 4.8/5 sao

TÍNH NĂNG CHÍNH:

- Lịch Việt Chuẩn Xác

Tra cứu lịch âm, lịch dương nhanh chóng theo múi giờ Việt Nam
Hiển thị Can Chi, Nạp Âm cho từng ngày
Xem Giờ Hoàng Đạo chi tiết
Gợi ý việc nên làm và nên tránh mỗi ngày

- Lịch Ngày Lễ & Sự Kiện

Tự động nhắc nhở các ngày lễ âm lịch: Tết Nguyên Đán, Rằm tháng Giêng, Giỗ Tổ Hùng Vương, Tết Trung Thu, Vu Lan...
Đếm ngược đến ngày Rằm, Mồng 1 và các lễ lớn
Tạo sự kiện cá nhân theo âm lịch (giỗ, sinh nhật âm...)
Chia sẻ sự kiện với người thân

- Tử Vi Mệnh lý AI

Hỏi đáp về phong thủy, ngày tốt xấu, tuổi hợp
Tư vấn ngày cưới hỏi, động thổ, khai trương
Giải đáp thắc mắc về lịch âm, Can Chi, Nạp Âm
Trả lời theo phong cách dân gian Việt Nam

- Widget Tiện Lợi

Widget nhỏ: Xem nhanh ngày âm lịch trên màn hình chính
Widget vừa: Ngày âm + đếm ngược sự kiện sắp tới
Widget lịch tuần: Xem cả tuần với ngày âm dương

- Thông Báo Thông Minh

Nhắc nhở trước ngày lễ âm lịch
Thông báo sự kiện cá nhân tùy chỉnh
Chọn số ngày nhắc trước sự kiện

- Giao Diện Đẹp Mắt

Chế độ sáng/tối tự động theo hệ thống
6 màu chủ đề tùy chọn
Hình nền thành phố đẹp mắt
Thiết kế hiện đại, thuần Việt

TẠI SAO CHỌN LỊCH TA?
- Tính toán âm lịch chuẩn xác
- Không quảng cáo làm phiền
- AI thông minh, hiểu văn hóa Việt
- Nhẹ máy, mượt mà

Tải ngay Lịch Ta để đón năm mới bình an, may mắn!`,
  },
  metadataByLocale: {
    en: {
      name: "Lich Ta - Lunar Calendar & AI",
      subtitle: "Lunar Calendar · Feng Shui",
      promoText: "Ask the AI Master about horoscopes, feng shui, and Vietnamese customs - instant answers!",
      shortDescription: "Vietnamese lunar calendar with AI astrology, auspicious hours & event reminders.",
      keywords: "lunar calendar,vietnamese calendar,feng shui,horoscope,astrology,zodiac,lunar new year",
      description: `Lich Ta - The only lunar calendar app with a built-in AI Astrology Master. Check auspicious days, lucky hours, and feng shui guidance - completely ad-free.

50,000+ Vietnamese users trust Lich Ta · 4.8/5 stars

KEY FEATURES:

- Accurate Vietnamese Calendar

Quickly look up lunar and solar dates in Vietnam timezone
Display Can Chi (Heavenly Stems & Earthly Branches) for each day
View detailed Auspicious Hours
Daily suggestions for what to do and what to avoid

- Lunar Events & Holidays

Auto-reminders for lunar holidays: Lunar New Year, Mid-Autumn Festival, Ancestors' Day, and more
Countdown to Full Moon, New Moon, and major festivals
Create personal events by lunar date (death anniversaries, lunar birthdays)
Share events with family

- AI Astrology Master

Ask about feng shui, auspicious dates, compatible zodiac signs
Wedding date consultation, groundbreaking, grand opening guidance
Answers about lunar calendar, Can Chi, and Vietnamese traditions
Culturally-aware AI responses

- Convenient Widgets

Small widget: Quick lunar date on home screen
Medium widget: Lunar date + upcoming event countdown
Weekly calendar widget: Full week with lunar/solar dates

- Smart Notifications

Reminders before lunar holidays
Custom personal event alerts
Choose how many days before to be reminded

- Beautiful Interface

Auto light/dark mode
6 customizable theme colors
Beautiful Vietnamese city wallpapers
Modern design, authentically Vietnamese

WHY CHOOSE LICH TA?
- Precise lunar calendar calculations
- No ads whatsoever
- Smart AI that understands Vietnamese culture
- Lightweight and smooth

Download Lich Ta now for a peaceful, lucky new year!`,
    },
  },
};
