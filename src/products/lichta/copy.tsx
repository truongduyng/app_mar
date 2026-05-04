import React from "react";
import type { SlideCopyMap } from "@/lib/types";
import { LICHTA_THEME as T } from "./theme";

export const LICHTA_COPY: SlideCopyMap = {
  hero: {
    vi: {
      label: "LỊCH ÂM VIỆT NAM",
      headline: <>Lịch Âm<br /><span style={{ color: T.accent }}>trong tầm tay.</span></>,
      subtitle: <>Âm lịch, Can Chi, Tiết Khí,<br />Hoàng Đạo - tất cả ở một chỗ.</>,
    },
    en: {
      label: "LUNAR CALENDAR",
      headline: <>Today's date,<br /><span style={{ color: T.accent }}>at a glance.</span></>,
      subtitle: <>Lunar date, Can Chi, Solar Terms,<br />Auspicious Hours — all in one place.</>,
    },
  },
  events: {
    vi: {
      label: "SỰ KIỆN ÂM LỊCH",
      headline: <>Không bao giờ<br /><span style={{ color: T.accent }}>quên ngày giỗ.</span></>,
      subtitle: <>Giỗ chạp, sinh nhật, ngày cưới<br />theo âm lịch - nhắc tự động.</>,
    },
    en: {
      label: "LUNAR EVENTS",
      headline: <>Never miss<br /><span style={{ color: T.accent }}>an anniversary.</span></>,
      subtitle: <>Death anniversaries, birthdays,<br />weddings by lunar date — auto-reminded.</>,
    },
  },
  calendar: {
    vi: {
      label: "LỊCH ÂM CHI TIẾT",
      headline: <>Can Chi,<br /><span style={{ color: T.accent }}>Hoàng Đạo.</span></>,
      subtitle: <>Tiết khí, Thần Sát, giờ Hoàng Đạo<br />hiển thị ngay khi chọn ngày.</>,
    },
    en: {
      label: "DETAILED LUNAR",
      headline: <>Can Chi &<br /><span style={{ color: T.accent }}>Auspicious Hours.</span></>,
      subtitle: <>Solar terms, Lucky Gods, Auspicious Hours<br />shown the moment you pick a date.</>,
    },
  },
  ai: {
    vi: {
      label: "XEM TỬ VI AI",
      headline: <>Tử Vi AI<br /><span style={{ color: T.accent }}>bất cứ lúc nào.</span></>,
      subtitle: <>Tử vi, vận mệnh, phong thủy<br />AI trả lời ngay.</>,
    },
    en: {
      label: "LICH TA AI MASTER",
      headline: <>Your AI Astrologer,<br /><span style={{ color: T.accent }}>anytime.</span></>,
      subtitle: <>Horoscopes, feng shui, Vietnamese<br />customs — AI answers instantly.</>,
    },
  },
  themes: {
    vi: {
      label: "GIAO DIỆN CÁ NHÂN",
      headline: <>Màu sắc<br /><span style={{ color: T.accent }}>theo ý bạn.</span></>,
      subtitle: <>Hình nền thành phố Việt Nam,<br />màu chủ đạo tùy chỉnh thoải mái.</>,
    },
    en: {
      label: "PERSONAL THEMES",
      headline: <>Colors<br /><span style={{ color: T.accent }}>your way.</span></>,
      subtitle: <>Vietnamese city wallpapers,<br />custom accent colors to your taste.</>,
    },
  },
  wisdom: {
    vi: {
      label: "TỬ VI - PHONG THỦY",
      headline: <>Vận mệnh.<br /><span style={{ color: T.accent }}>Rõ từng ngày.</span></>,
      subtitle: <>Chat với AI về tình duyên, công việc,<br />sức khỏe - theo lá số của bạn.</>,
    },
    en: {
      label: "ASTROLOGY & FENG SHUI",
      headline: <>Your destiny.<br /><span style={{ color: T.accent }}>Day by day.</span></>,
      subtitle: <>Chat with AI about love, career,<br />health — based on your birth chart.</>,
    },
  },
  widgets: {
    vi: {
      label: "",
      headline: <>Widget đẹp<br /><span style={{ color: T.accent }}>mỗi ngày.</span></>,
      subtitle: <>Thêm widget vào màn hình chính,<br />xem lịch âm ngay không cần mở app.</>,
    },
    en: {
      label: "",
      headline: <>Beautiful widgets<br /><span style={{ color: T.accent }}>every day.</span></>,
      subtitle: <>Add a widget to your home screen,<br />check the lunar date without opening the app.</>,
    },
  },
};
