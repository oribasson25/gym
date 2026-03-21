"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const slides = [
  {
    icon: "💪",
    title: "GYM Tracker",
    subtitle: "האפליקציה שתעלה לך את האימון לרמה הבאה",
    bullets: [
      "מעקב אימונים חכם",
      "תוכנית תזונה מותאמת אישית",
      "צ'אט עם המאמן",
      "תמונות התקדמות",
    ],
    bg: "from-primary to-primary-600",
  },
  {
    icon: "🏋️",
    title: "אימונים מותאמים",
    subtitle: "6 סוגי אימונים עם התאמה אישית",
    bullets: [
      "גוף מלא · דחיפה · משיכה · רגליים",
      "חזה+גב · כתפיים+ידיים",
      "אנימציות תרגילים מובנות",
      "מעקב סטים, חזרות ומשקלים",
    ],
    bg: "from-indigo-500 to-purple-600",
  },
  {
    icon: "🧠",
    title: "המלצות משקל חכמות",
    subtitle: "האפליקציה לומדת מהביצועים שלך",
    bullets: [
      "דירוג קושי 1-10 בסוף כל אימון",
      "קל (1-3): +10 ק\"ג באימון הבא",
      "בינוני (4-6): +5 ק\"ג באימון הבא",
      "קשה (7-8): +2.5 ק\"ג באימון הבא",
      "מקסימלי (9-10): שמירה על משקל",
    ],
    bg: "from-amber-500 to-orange-600",
  },
  {
    icon: "🍗",
    title: "תוכנית תזונה",
    subtitle: "ניהול ארוחות וקלוריות יומי",
    bullets: [
      "חישוב TDEE אוטומטי",
      "מעקב קלוריות, חלבון, פחמימות ושומן",
      "סימון ארוחות שנאכלו",
      "הוספת מזון מותאם אישית",
      "מטרות: מסה או חיטוב",
    ],
    bg: "from-emerald-500 to-teal-600",
  },
  {
    icon: "📸",
    title: "תמונות התקדמות",
    subtitle: "תיעוד ויזואלי של המסע שלך",
    bullets: [
      "תמונה חודשית להשוואה",
      "תיעוד משקל לכל תמונה",
      "גלריה של כל החודשים",
      "תזכורת אוטומטית בתחילת חודש",
    ],
    bg: "from-pink-500 to-rose-600",
  },
  {
    icon: "💬",
    title: "צ'אט עם המאמן",
    subtitle: "תקשורת ישירה בזמן אמת",
    bullets: [
      "שליחת הודעות למאמן",
      "התראות הודעות חדשות",
      "המאמן רואה את כל המתאמנים",
      "עדכון אוטומטי כל 3 שניות",
    ],
    bg: "from-blue-500 to-cyan-600",
  },
  {
    icon: "👨‍💼",
    title: "פאנל מאמן",
    subtitle: "ניהול מלא של כל המתאמנים",
    bullets: [
      "יצירת משתמשים וסיסמאות",
      "עריכת תוכניות אימון לכל מתאמן",
      "עריכת תוכניות תזונה",
      "צפייה בהיסטוריית אימונים",
      "צ'אט עם כל מתאמן בנפרד",
    ],
    bg: "from-slate-600 to-slate-800",
  },
  {
    icon: "🌙",
    title: "עוד פיצ'רים",
    subtitle: "חוויה מלאה ונוחה",
    bullets: [
      "מצב כהה / בהיר",
      "עיצוב מותאם למובייל",
      "עברית מלאה (RTL)",
      "היסטוריית אימונים מלאה",
      "BMI אוטומטי בפרופיל",
    ],
    bg: "from-violet-500 to-purple-700",
  },
];

export default function AboutPage() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const router = useRouter();

  const goTo = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const next = () => {
    if (current < slides.length - 1) goTo(current + 1);
  };

  const prev = () => {
    if (current > 0) goTo(current - 1);
  };

  const slide = slides[current];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col overflow-hidden relative">
      {/* Close button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-50 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition-all"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Slide counter */}
      <div className="absolute top-5 right-4 z-50 text-white/60 text-sm font-medium">
        {current + 1} / {slides.length}
      </div>

      {/* Main content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-1 flex flex-col"
        >
          {/* Gradient header */}
          <div className={`bg-gradient-to-br ${slide.bg} px-6 pt-16 pb-10 text-center`}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
              className="text-7xl mb-4"
            >
              {slide.icon}
            </motion.div>
            <h1 className="text-3xl font-black text-white mb-2">{slide.title}</h1>
            <p className="text-white/80 text-base">{slide.subtitle}</p>
          </div>

          {/* Bullets */}
          <div className="flex-1 bg-slate-900 px-6 py-8">
            <div className="space-y-4 max-w-sm mx-auto">
              {slide.bullets.map((bullet, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-white/90 text-base leading-relaxed">{bullet}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom navigation */}
      <div className="bg-slate-900 px-6 pb-8 pt-2">
        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-8 bg-primary"
                  : "w-2 bg-white/30"
              }`}
            />
          ))}
        </div>

        {/* Arrows */}
        <div className="flex items-center justify-between">
          <button
            onClick={prev}
            disabled={current === 0}
            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white disabled:opacity-20 active:scale-90 transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {current === slides.length - 1 ? (
            <button
              onClick={() => router.back()}
              className="px-8 py-3 rounded-full bg-primary text-white font-bold text-base active:scale-95 transition-all"
            >
              בואו נתחיל!
            </button>
          ) : (
            <button
              onClick={next}
              className="px-8 py-3 rounded-full bg-white/10 text-white font-semibold text-base active:scale-95 transition-all"
            >
              הבא
            </button>
          )}

          <button
            onClick={next}
            disabled={current === slides.length - 1}
            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white disabled:opacity-20 active:scale-90 transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
