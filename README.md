# Gym Tracker 💪

אפליקציית מעקב אימונים אישית — מנהלת תוכניות אימון, מציעה משקל חכם לפי האימון הקודם, ועוקבת אחר התקדמות חודשית עם תמונות.

---

## דרישות מקדימות

| תוכנה | גרסה מינימלית | הורדה |
|-------|--------------|-------|
| Node.js | 18+ | https://nodejs.org |
| npm | מגיע עם Node.js | — |

> **Cloudinary** — נדרש לתמונות פרופיל ותמונות תקדמות חודשיות.
> חשבון חינמי: https://cloudinary.com (אופציונלי בשלב הראשון — ניתן לדלג על תמונות)

---

## הפעלה ראשונה

### 1. כניסה לתיקייה
```bash
cd ~/Documents/gym
```

### 2. התקנת חבילות
```bash
npm install
```

### 3. הגדרת בסיס הנתונים
```bash
npx prisma migrate dev --name init
```

### 4. sטעינת רשימת התרגילים
```bash
npm run db:seed
```

### 5. הפעלת השרת
```bash
npm run dev
```

פתח בדפדפן: **http://localhost:3000**

---

## הפעלה בכל פעם מחדש

פתח **שני טרמינלים**:

**טרמינל 1 — השרת:**
```bash
cd ~/Documents/gym
npm run dev
```

**טרמינל 2 — גישה מהטלפון (Cloudflare Tunnel):**
```bash
cd ~/Documents/gym
npm run tunnel
```

תקבל קישור כזה — פתח אותו מכל מכשיר:
```
https://abc-def-123.trycloudflare.com
```

> הקישור משתנה בכל הפעלה. לגישה מהמחשב בלבד — מספיק טרמינל 1 ו-http://localhost:3000

---

## הגדרת Cloudinary (לתמונות)

1. צור חשבון ב-https://cloudinary.com
2. פתח את הקובץ `.env.local` בתיקיית הפרויקט
3. מלא את הפרטים:

```
CLOUDINARY_CLOUD_NAME=שם_הענן_שלך
CLOUDINARY_API_KEY=מפתח_ה_api
CLOUDINARY_API_SECRET=הסוד
```

הפרטים נמצאים ב-Dashboard של Cloudinary.

---

## כיבוי השרת

בטרמינל בו רץ השרת: `Ctrl + C`

---

## פקודות שימושיות

| פקודה | תיאור |
|-------|-------|
| `npm run dev` | הפעלת שרת פיתוח |
| `npm run build` | בנייה לייצור |
| `npm run db:studio` | פתיחת ממשק גרפי לבסיס הנתונים |
| `npm run db:seed` | טעינת תרגילים מחדש |
| `npm run db:reset` | איפוס מלא של הנתונים |

---

## מבנה האפליקציה

```
/setup          ← רישום ראשוני (מופיע רק בפעם הראשונה)
/dashboard      ← בחירת סוג אימון
/workout/[type] ← אימון פעיל
/workout/summary← דירוג קושי בסיום אימון
/history        ← היסטוריה וגרפי התקדמות
/progress-photo ← תמונות תקדמות חודשיות
/profile        ← עריכת פרטים אישיים
```

---

## עדכון האפליקציה (Deploy)

האפליקציה מאוחסנת ב-**Vercel** עם בסיס נתונים ב-**Neon** (PostgreSQL).

לאחר שינוי בקוד, הרץ בטרמינל:
```bash
git add .
git commit -m "תיאור השינוי"
git push
```

Vercel יזהה את ה-push ויעשה deploy אוטומטית תוך ~30 שניות.

---

## שאלות נפוצות

**ש: שכחתי את הפרטים שהזנתי — איך מתחיל מחדש?**
```bash
npm run db:reset
```
ואז רענן את http://localhost:3000 — תועבר לדף הרישום מחדש.

**ש: השרת לא עולה — "port already in use"**
```bash
npx kill-port 3000
npm run dev
```

**ש: איפה קובץ בסיס הנתונים?**
`prisma/gym.db` — קובץ SQLite מקומי, לא נמחק בין הפעלות.
