export const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export const LOGO_HORIZONTAL =
  "/images/Horizontal-Logo.png";

export const LOGO_MONOGRAM =
  "/images/Monogram.png";

export const DASH_MAIN =
  "/images/dashboard-main.jpg";

export const SHOT_CASES =
  "images/shot-cases.png";

export const SHOT_LIBRARY =
  "/images/shot-library.png";

export const SHOT_REMINDERS =
  "/images/shot-reminders.png";

export const SHOT_APPLICATION_GENERATOR =
  "/images/shot-library.png";

export const SHOT_JUDGMENTS =
  "/images/shot-judgments.png";

export const SHOT_SETTINGS =
  "/images/shot-settings.png";

export const SHOT_CALENDAR =
  "images/shot-calendar.png";

export const SHOT_CROSSEXAM =
  "/images/shot-crossexam.png";
