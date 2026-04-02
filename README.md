# 武林考験 v1.0 — Multi-Subject Dland Quiz Platform

**Stack:** Next.js 14 · TypeScript · Tailwind CSS · Cinzel + Noto Serif JP · localStorage

## 🚀 Run
```bash
npm install && npm run dev  # → http://localhost:3000
```

## 🔑 Admin: `admin / admin123`

## 🆕 v1.0 Changes
- ✅ Login form input width fixed (full-width inputs)
- ✅ Quiz sidebar wider (w-72 + 全 progress bar)
- ✅ Subject hierarchy: JLPT N1-N5, TOEIC 300+~900+, English A1-C2, Math
- ✅ Level sub-filter on home page
- ✅ 💾 Data backup: Export/Import JSON (Admin → Backup tab)

## 💾 Backup / Restore
Admin → **💾 Backup** tab:
- **Export**: Downloads `quiz-backup-YYYY-MM-DD.json` with all users, results, exams
- **Import**: Upload backup file to restore data (merge, no overwrite)

## 📋 Sample files
- `public/sample-toeic-part5.json` — TOEIC Part 5 (15 câu, 10 phút)
- Upload JLPT N1 JSON from v3 package
