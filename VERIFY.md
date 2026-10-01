# Values to verify

The Landowner Calculator's rules are in `src/rules/`. Each value below is
marked `"needs_verification": true` in those files because the gazettes
are unclear about it. The calculator does **not** fill these gaps with
outside knowledge; it uses the reading described here and says so on the
results page. Please check each one with a registered architect or RAJUK
and update the data file.

Rules version: **bidhimala-2025 / dap-2025-12**

- Bidhimala = ঢাকা মহানগর ইমারত বিধিমালা, ২০২৫ (gazette of 14 Dec 2025)
- DAP = বিশদ অঞ্চল পরিকল্পনা ২০২২-২০৩৫, revised gazette of 14 Dec 2025

Page numbers are gazette page numbers, with the PDF page in brackets.

## Flagged values

### 1. `road-far.json.betweenSteps`: road widths between table columns

- **Source:** Bidhimala Rule 47(6), p. 13465 (PDF p. 57).
- **What it says:** If the road is wider than a listed step, FAR rises in
  proportion to the extra width, up to the next step's FAR.
- **Unclear:** Table 5's first three columns are ranges (1.8 to under 2.5 m,
  2.5 to under 3.66 m, 3.66 to under 4.88 m). The rest are single widths
  (4.88, 6, 9, 12, 18, 24+ m).
- **What the calculator does:** It interpolates only between the single
  widths and treats each range as one value. For example, a 7.5 m road in
  central Dhaka (A3) gets 3.25 + (1.5 / 3) x 0.25 = 3.375.

### 2. `road-far.json.groupChoice`: which road FAR group applies to a plot

- **Source:** Bidhimala Table 5 and DAP Appendix 3.5.
- **What it says:** The table has three groups: central Dhaka (with
  Purbachal and Jhilmil), outer city areas (e.g. Narayanganj City
  Corporation, Savar Pourashava), and other areas.
- **Unclear:** Neither gazette says which density blocks belong to which
  group.
- **What the calculator does:** The plot owner picks the group. The app
  does not guess.

### 3. `ground-coverage.json.minMgcPct`: the "minimum ground coverage" column

- **Source:** Bidhimala Table 3, p. 13456 (PDF p. 48).
- **What it says:** Column 3 is headed সর্বনিম্ন ভূমি আচ্ছাদন (MGC), for
  example 52.5% for plots up to 134 m². Column 4 is the maximum, 70%.
- **Unclear:** What column 3 means is not explained.
- **What the calculator does:** It uses only column 4 (maximum ground
  coverage).

### 4. `ground-coverage.json.boundaryNote`: square metres versus katha in Table 3

- **What it says:** Rows are bounded in m² with katha in brackets, for
  example "670 m² (10 katha)". At 720 sq ft per katha, 10 katha is
  668.9 m².
- **What the calculator does:** It uses the m² limits as printed. A plot of
  exactly 10 katha (668.9 m²) is in the "402 to 670 m²" row.

### 5. `setbacks.json.front`: front setback as a distance from the boundary

- **Source:** Bidhimala Rule 41(1), p. 13451 (PDF p. 43).
- **What it says:** The building must be at least 4.5 m from the road
  centre or 1.5 m from the plot boundary, whichever is greater.
- **What the calculator does:** It computes max(1.5, 4.5 − road width ÷ 2).
  This assumes the road centre is half the road width away from the plot
  boundary.

### 6. `setbacks.json.byStoreys.storeyCounting`: does the ground floor count as a storey?

- **Source:** Bidhimala Table 1, p. 13452 (PDF p. 44).
- **What it says:** Setbacks are set by the number of storeys (৭ তলা পর্যন্ত, …).
- **What the calculator does:** It counts the ground floor, so G+6 is 7
  storeys.

### 7. `setbacks.json.plotSizeTable`: no setback table by plot size

You asked for setbacks by plot size and building height. Bidhimala 2025
sets side and rear setbacks by storeys only (Table 1); there is no
plot-size table. The plot-size table in the 2016 worked examples is from
the repealed 2008 rules (Bidhimala 2025, Rule 75), so it is not used.

### 8. `far-derivation.json.dwellingUnits`: number of flats from density

- **Source:** DAP Appendix 3.6 ("কাঠা প্রতি আবাসন ইউনিট"), Bidhimala
  Table 5 note 4, DAP amendment (1)(ঘ).
- **Unclear:** The gazette does not say how fractions are rounded. For
  example, 5 katha × 1.9 units per katha = 9.5 units.
- **What the calculator does:** It rounds down. It also says that up to 10%
  more units may be approved.

### 9. `far-derivation.json.parkingNotInFar`: ground floor left out of FAR

- **Source:** DAP amendment (5), para 3.6.4.3, p. 13390 (PDF p. 6).
- **What it says:** Parking is left out of floor area only up to the
  required parking area (×2 if the road is 6.1 m or wider, else ×1.5).
- **What the calculator does:** It shows floors as G+N with the whole
  ground floor as parking, not counted in FAR, as in the 2016 sample
  calculation. Whether the whole ground floor qualifies depends on the
  parking requirement.

### 10. `incentives.json.items[plotSize]`: plot-size incentive bands

- **Source:** DAP Table 3.28, item 1, p. 13388 (PDF p. 4).
- **What it says:** "3 to 6 katha" 0.20, "6 to 10 katha" 0.35, "10 to 15"
  0.50, "15 to 20" 0.65, "20 katha or more" 0.75.
- **Unclear:**
  - Which band a boundary value (6, 10, 15 katha) belongs to.
  - Whether any single plot of that size qualifies, or only amalgamated
    plots. The heading is "প্লট একত্রীকরণ/একক আয়তন".
- **What the calculator does:** A boundary goes in the higher band. The
  incentive is offered as an option the owner must tick.

### 11. `incentives.json.items[affordableFloor]`: "unplanned areas only"

- **Source:** DAP Table 3.28, item 3.
- **What it says:** The affordable-housing incentive is only for
  অপরিকল্পিত (unplanned) areas.
- **What the calculator does:** "Unplanned" is matched to block type
  স্বতঃস্ফূর্ত উন্নয়ন (spontaneous) in Appendix 3.6. Both 3(a) and 3(b)
  use this check.

## Other things to know

### The worked examples use the old rules

`worked-examples (answers from a architect).pdf` is a RAJUK slide deck
dated 18 May 2016, based on the 2008 Bidhimala, which the 2025 Bidhimala
repealed (Rule 75). Its sample calculation (5 katha, 6 m road, FAR 3.5,
MGC 62.5%) can only be partly reproduced:

| Part of the sample                                                        | 2025 rules                                                               | Test      |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------ | --------- |
| Arithmetic (12,600 sq ft, 2,250 sq ft, 5.6 floors, 2,100 sq ft per floor) | same method                                                              | passes    |
| Max ground coverage 62.5% for 5 katha                                     | Table 3 row 5: 62.5%                                                     | passes    |
| FAR 3.5 for 5 katha on a 6 m road                                         | Road FAR at 6 m is at most 3.25 (A3, central); base FAR can never be 3.5 | **fails** |
| Setbacks for 5 katha (rear 2.0 m, sides 1.25 m)                           | 7 storeys: rear 1.25 m, sides 1.0 m                                      | **fails** |

The rules data was not changed to make these pass. The failing cases are
written as expected failures (`it.fails`) in
`src/landowner/worked-examples.test.ts`. They stay visible without
blocking every deployment, and turn red if the data ever starts matching
the 2016 values.

### Reference websites were not reachable

farcalculator.com and shellmark.net are blocked by this project's cloud
environment network settings, so neither was read. All values come from
the two gazettes.

### Setting, not a rule

The saleable-area percentage (default 70%) and the default owner share
(50%) are negotiation settings in `src/landowner/settings.ts`. No gazette
gives them, and the owner can change both on the form.
