# SkillRoute AI 2.0 — Testing & Quality Assurance Documentation

## 1. Testing Strategy
SkillRoute AI 2.0 enforces a layered testing approach:
1. **Unit & Mathematical Invariant Tests:** Strict verification of deterministic formulas, monotonicity, clamping, and official benchmark fixtures.
2. **Integration Tests:** Database transactions, authentication sessions, and server-side rubrics.
3. **Browser & End-to-End Verification:** Complete user journeys across all roles.

---

## 2. Running Automated Tests

```bash
# Run the core regression and mathematical invariant test suite
npm test
```

### Verified Benchmark Assertions

#### Benchmark A — Junior Data Analyst
- Profile: Python 3, SQL 2, Excel 3 (Statistics 0, Power BI 0)
- Match Percentage: `58.33%`
- Total Learning Effort: `80.0 hours`
- Weekly Availability: `8 hours`
- Total Duration: `10 weeks`
- First 4-Week Allocation: `32.0 hours`
- Remaining Effort Beyond Week 4: `48.0 hours`

#### Benchmark B — Updated SQL to Level 3
- Profile: Python 3, SQL 3, Excel 3 (Statistics 0, Power BI 0)
- Match Percentage: `66.67%`
- Total Learning Effort: `70.0 hours` (45h Statistics + 25h Power BI)
- Weekly Availability: `8 hours`
- Total Duration: `9 weeks`
- First 4-Week Allocation: `32.0 hours`
- Remaining Effort Beyond Week 4: `38.0 hours`

#### Monotonicity & Clamping
- Overqualification (Level 5 in all skills) clamps match at `100.0%` and effort at `0.0 hours`.
- Increasing skill proficiency never decreases match percentage or increases effort hours.

#### Localization & Bengali Numerals
- Exact numeral translation for dates, percentages, hours, and scores (`২০২৬`, `৫৮.৩৩%`, `৮০`).
- 100% translation key parity between English and Bengali dictionaries.
