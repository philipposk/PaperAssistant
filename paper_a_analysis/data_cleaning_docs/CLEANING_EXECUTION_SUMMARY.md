# PHEV Data Cleaning Execution Summary

**Execution Date:** December 18, 2025  
**Dataset:** OBFCM 2021-2023 (2,579,995 vehicles, 1.2GB CSV)  
**Script:** `PHEV_CLEANING_WITH_LOG.R`

---

## Executive Summary

- **Starting PHEVs:** 284,987 (after reassignments)
- **Final PHEVs:** 253,023
- **Total Removed:** 31,964 vehicles (11.22%)
- **Most Significant Removal Steps:** 
  1. Step 1 (CS Mileage/FC): 19,397 vehicles (6.8%)
  2. Step 4 (RW_EC Zero Reporting): 6,391 vehicles (2.5%)
  3. Step 2 (Missing RW_EC): 5,360 vehicles (2.0%)

---

## Key Findings by Removal Step

### Step 1: CS Mileage/FC Invalid (19,397 vehicles removed)

**Most Affected Models:**
- **JEEP COMPASS:** 3,502 vehicles removed (18% of all Step 1 removals)
- **VOLKSWAGEN PASSAT:** 1,995 vehicles
- **TOYOTA RAV4:** 1,418 vehicles

**Most Affected OEMs:**
- JEEP: 4,673 vehicles
- VOLKSWAGEN: 4,042 vehicles
- SKODA: 2,923 vehicles

**Insight:** JEEP COMPASS had the largest single-model removal in the entire cleaning process, indicating systematic CS mode reporting issues.

---

### Step 2: Missing RW_EC (5,360 vehicles removed)

**Most Affected Models:**
- **PEUGEOT 308:** 1,304 vehicles removed (24% of Step 2 removals)
- **CITROEN C5 X:** 774 vehicles
- **DS DS4:** 483 vehicles

**Most Affected OEMs:**
- PEUGEOT: 1,431 vehicles
- CITROEN: 849 vehicles
- HYUNDAI: 758 vehicles

**Insight:** French manufacturers (PEUGEOT, CITROEN, DS) showed high proportions of missing RW_EC data, particularly the PEUGEOT 308 model.

---

### Step 3: Missing OEM/Model (571 vehicles removed)

**Key Finding:**
- 336 vehicles had completely missing OEM information
- Majority from 2022 (570 vehicles vs 1 from 2021)
- VFN-based imputation successfully filled 88 missing OEMs and 2,719 missing models before this step

---

### Step 4: RW_EC Zero Reporting (6,391 vehicles removed)

**Most Affected Models:**
- **PORSCHE CAYENNE E HYBRID:** 4,247 vehicles removed (66% of Step 4 removals!)
- **PORSCHE PANAMERA 4 E HYBRID:** 686 vehicles
- **PORSCHE PANAMERA 4S E HYBRID:** 468 vehicles

**Most Affected OEM:**
- PORSCHE: 6,271 vehicles (98.1% of all removals in this step)

**Insight:** Porsche PHEVs dominated this removal step with systematic zero RW_EC reporting across multiple models. This suggests either:
- Systematic data reporting issues with Porsche PHEVs
- Possible misclassification of some Porsche models as PHEVs
- Data collection/reporting differences for Porsche vehicles

---

### Step 6: Physics-Based CO2/FC Filters (36 vehicles removed)

**Most Affected:**
- **LAND ROVER RANGE ROVER SPORT:** 12 vehicles
- Luxury/high-performance vehicles with implausible CO2 values
- Includes: Ferrari SF90 STRADALE, Volvo Polestar 1

**Insight:** Very few vehicles (<0.02%) failed physics-based filters, indicating most data is physically plausible.

---

### Step 7: Mileage/FC Inconsistencies (209 vehicles removed)

**Most Affected Models:**
- **FORD KUGA:** 100 vehicles removed (48% of Step 7 removals)
- Primarily CI (Charge Increasing) mode inconsistencies
- JEEP models: 46 vehicles

**Insight:** FORD KUGA showed systematic inconsistencies in Charge Increasing mode reporting, where fuel consumption was recorded without corresponding distance.

---

### Step 8: EDS/Energy Violations (0 vehicles removed)

**Result:** No vehicles removed - all remaining PHEVs passed energy accounting checks.

---

## Model-Level Insights

### Models with Highest Total Removals

Based on aggregating across all steps:

1. **JEEP COMPASS:** ~3,502 vehicles (Step 1 - CS Mileage/FC issues)
2. **PORSCHE CAYENNE E HYBRID:** ~4,247 vehicles (Step 4 - Zero RW_EC reporting)
3. **VOLKSWAGEN PASSAT:** ~1,995 vehicles (Step 1)
4. **PEUGEOT 308:** ~1,304 vehicles (Step 2 - Missing RW_EC)
5. **FORD KUGA:** ~506 vehicles (Steps 2 and 7 - Missing RW_EC and Mileage/FC inconsistencies)

### OEM-Level Patterns

**OEMs with High Removal Rates:**
1. **PORSCHE:** 6,271 vehicles (primarily Step 4 - zero RW_EC)
2. **JEEP:** 4,673 vehicles (primarily Step 1 - CS mode issues)
3. **VOLKSWAGEN:** 4,042 vehicles (Step 1)
4. **SKODA:** 2,923 vehicles (Step 1)

**OEMs with Lower Removal Rates:**
- Most removals were concentrated in specific models rather than across entire OEMs
- Some OEMs showed higher proportions in specific steps (e.g., PEUGEOT in Step 2)

---

## Year Distribution Patterns

**General Pattern:** 
- 2021 vehicles show higher removal rates in Steps 1 and 7
- 2022 vehicles show higher removal rates in Steps 2, 3, and 4

This may reflect:
- Data collection improvements over time
- Different reporting requirements
- Early adoption issues in 2021 models

---

## Recommendations

1. **Investigate JEEP COMPASS:** 3,502 vehicles removed suggests systematic data quality issues that may warrant investigation at the source.

2. **Review Porsche PHEV Reporting:** 6,271 Porsche vehicles removed (98% due to zero RW_EC) suggests either systematic reporting differences or potential misclassification.

3. **FORD KUGA CI Mode:** 100 vehicles removed in Step 7 indicate Charge Increasing mode reporting inconsistencies.

4. **French OEM RW_EC:** PEUGEOT, CITROEN, and DS showed higher missing RW_EC rates - may reflect reporting practices or technical differences.

---

## Data Quality Assessment

- **Overall Removal Rate:** 11.22% (moderate - indicates substantial data quality issues)
- **Most Common Issues:** CS mode reporting, missing RW_EC, zero RW_EC reporting
- **Final Dataset:** 253,023 PHEVs with high data quality for analysis

---

*Generated from: `paper_a_analysis/DATA_CLEANING_DETAILED_LOG.txt`*



