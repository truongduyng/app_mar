import React from "react";
import type { SlideCopyMap } from "@/lib/types";
import { TINYSTEPS_THEME as T } from "./theme";

/** Copy for the default (en) slide set */
export const TINYSTEPS_COPY: SlideCopyMap = {
  hero: {
    en: {
      label: "BABY GROWTH TRACKER",
      headline: <>Every milestone.<br /><span style={{ color: T.accent }}>Captured.</span></>,
      subtitle: <>Track weight, height, and head size<br />with beautiful growth charts.</>,
    },
    vi: {
      label: "THEO DÕI BÉ LỚN",
      headline: <>Từng bước nhỏ.<br /><span style={{ color: T.accent }}>Đều đáng nhớ.</span></>,
      subtitle: <>Theo dõi cân nặng, chiều cao,<br />và vòng đầu với biểu đồ trực quan.</>,
    },
  },
  milestones: {
    en: {
      label: "DEVELOPMENTAL MILESTONES",
      headline: <>Never miss<br /><span style={{ color: T.accent }}>a first.</span></>,
      subtitle: <>Track 42+ milestones from<br />0–12 months, guided by age.</>,
    },
    vi: {
      label: "CỘT MỐC PHÁT TRIỂN",
      headline: <>Đừng bỏ lỡ<br /><span style={{ color: T.accent }}>khoảnh khắc nào.</span></>,
      subtitle: <>Theo dõi 42+ cột mốc từ<br />0–12 tháng, theo từng giai đoạn.</>,
    },
  },
  vaccinations: {
    en: {
      label: "VACCINATION TRACKER",
      headline: <>Stay on<br /><span style={{ color: T.accent }}>schedule.</span></>,
      subtitle: <>Track every dose, see what's due,<br />never miss a vaccination.</>,
    },
    vi: {
      label: "LỊCH TIÊM CHỦNG",
      headline: <>Đúng lịch.<br /><span style={{ color: T.accent }}>An tâm.</span></>,
      subtitle: <>Theo dõi từng mũi tiêm,<br />không bao giờ quên lịch hẹn.</>,
    },
  },
  journal: {
    en: {
      label: "BABY JOURNAL",
      headline: <>Memories<br /><span style={{ color: T.accent }}>worth keeping.</span></>,
      subtitle: <>A beautiful timeline of your<br />baby's most precious moments.</>,
    },
    vi: {
      label: "NHẬT KÝ BÉ YÊU",
      headline: <>Kỷ niệm<br /><span style={{ color: T.accent }}>đáng giữ.</span></>,
      subtitle: <>Dòng thời gian xinh đẹp ghi lại<br />những khoảnh khắc quý giá nhất.</>,
    },
  },
  "ai-chat": {
    en: {
      label: "AI PARENTING GUIDE",
      headline: <>Ask anything.<br /><span style={{ color: T.accent }}>Get answers.</span></>,
      subtitle: <>AI-powered insights about your<br />baby's growth and development.</>,
    },
    vi: {
      label: "TRỢ LÝ AI CHO BỐ MẸ",
      headline: <>Hỏi gì<br /><span style={{ color: T.accent }}>cũng được.</span></>,
      subtitle: <>AI phân tích sự phát triển và<br />tăng trưởng của bé cho bạn.</>,
    },
  },
  family: {
    en: {
      label: "FAMILY SHARING",
      headline: <>Track<br /><span style={{ color: T.accent }}>together.</span></>,
      subtitle: <>Invite your partner or family<br />to share the journey.</>,
    },
    vi: {
      label: "CHIA SẺ GIA ĐÌNH",
      headline: <>Cùng nhau<br /><span style={{ color: T.accent }}>theo dõi.</span></>,
      subtitle: <>Mời bạn đời hoặc gia đình<br />cùng chăm sóc bé yêu.</>,
    },
  },
  growth: {
    en: {
      label: "COMPLETE PICTURE",
      headline: <>Watch them<br /><span style={{ color: T.accent }}>grow.</span></>,
      subtitle: <>Milestones, vaccinations, and growth<br />tracking — all in one place.</>,
    },
    vi: {
      label: "BỨC TRANH TOÀN DIỆN",
      headline: <>Nhìn bé<br /><span style={{ color: T.accent }}>lớn lên.</span></>,
      subtitle: <>Cột mốc, tiêm chủng, và biểu đồ<br />tăng trưởng — tất cả ở một chỗ.</>,
    },
  },
};

/** Copy for the vi-specific slide set (different screenshot images) */
export const TINYSTEPS_COPY_VI: SlideCopyMap = {
  hero: {
    vi: {
      label: "THEO DÕI BÉ LỚN",
      headline: <>Từng bước nhỏ.<br /><span style={{ color: T.accent }}>Đều đáng nhớ.</span></>,
      subtitle: <>Theo dõi cân nặng, chiều cao,<br />và vòng đầu với biểu đồ trực quan.</>,
    },
  },
  journal: {
    vi: {
      label: "NHẬT KÝ BÉ YÊU",
      headline: <>Kỷ niệm<br /><span style={{ color: T.accent }}>đáng giữ.</span></>,
      subtitle: <>Dòng thời gian xinh đẹp ghi lại<br />những khoảnh khắc quý giá nhất.</>,
    },
  },
  "ai-chat": {
    vi: {
      label: "TRỢ LÝ AI CHO BỐ MẸ",
      headline: <>Hỏi gì<br /><span style={{ color: T.accent }}>cũng được.</span></>,
      subtitle: <>AI phân tích sự phát triển và<br />tăng trưởng của bé cho bạn.</>,
    },
  },
  settings: {
    vi: {
      label: "TUỲ CHỈNH THEO Ý BẠN",
      headline: <>Cài đặt<br /><span style={{ color: T.accent }}>theo sở thích.</span></>,
      subtitle: <>Chọn ngôn ngữ, đơn vị đo lường,<br />và thông báo phù hợp với gia đình bạn.</>,
    },
  },
  milestones: {
    vi: {
      label: "CỘT MỐC PHÁT TRIỂN",
      headline: <>Đừng bỏ lỡ<br /><span style={{ color: T.accent }}>khoảnh khắc nào.</span></>,
      subtitle: <>Theo dõi 42+ cột mốc từ<br />0–24 tháng, theo từng giai đoạn.</>,
    },
  },
  vaccinations: {
    vi: {
      label: "LỊCH TIÊM CHỦNG",
      headline: <>Đúng lịch.<br /><span style={{ color: T.accent }}>An tâm.</span></>,
      subtitle: <>Theo dõi từng mũi tiêm,<br />không bao giờ quên lịch hẹn.</>,
    },
  },
};
