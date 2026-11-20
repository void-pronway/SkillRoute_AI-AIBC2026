# SkillRoute AI — UI Screenshot Directory

This directory stores the official visual walkthrough screenshots referenced in the root `README.md`.

## 📁 Screenshot Inventory & Placeholders

| Filename | Resolution (Recommended) | Description | UI View / Location |
| :--- | :--- | :--- | :--- |
| `01_landing_page.png` | 1920x1080 | Landing page overview (Hero, CTA, Brand theme) | `/` |
| `02_student_step1_skills.png` | 1920x1080 | Step 1 Skill calibration sliders & Step Lock | `/dashboard` |
| `03_student_step2_assessment.png` | 1920x1080 | Step 2 Diagnostic assessment with 1-click answers | `/dashboard` |
| `04_student_step3_career_matches.png` | 1920x1080 | Step 3 Career matches, match %, effort & weeks | `/dashboard` |
| `05_student_step4_roadmap_tracker.png` | 1920x1080 | Step 4 4-week capacity roadmap & task checkboxes | `/dashboard` |
| `06_student_step4_gemini_ai_coach.png` | 1920x1080 | Step 4 Google Gemini AI Learning Coach guidance | `/dashboard` |
| `07_mission_arena_evaluator.png` | 1920x1080 | Mission Arena code editor & Mode A/B integrity | `/missions/[id]` |
| `08_skillproof_five_tier_portfolio.png` | 1920x1080 | SkillProof 5-tier portfolio, Tier 4 & Tier 5 badges | `/skillproof` |
| `09_credential_qr_verification.png` | 1920x1080 | Public SHA-256 credential verification & QR code | `/verify/[id]` |
| `10_employer_candidate_shortlist.png` | 1920x1080 | Employer discovery & instant shortlist toast | `/employer` |
| `11_employer_candidate_dossier_tier5.png` | 1920x1080 | Candidate dossier modal & Tier 5 endorse button | `/employer` |

## 🔄 How to Add or Replace Screenshots

1. Capture your desired screenshot from your browser at `http://localhost:3000`.
2. Save or copy the image into this directory (`docs/screenshots/`) using the exact corresponding filename from the table above (e.g. `01_landing_page.png`).
3. Commit and push your changes to GitHub:
   ```bash
   git add docs/screenshots/
   git commit -m "docs: update UI screenshots"
   git push origin main
   ```
4. The root `README.md` will immediately display your updated screenshot on GitHub!
