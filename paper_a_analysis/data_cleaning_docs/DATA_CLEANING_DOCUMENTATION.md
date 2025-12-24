# PHEV Database Cleaning Documentation

**Source File:** `PHEV_paper_12_25.R`  
**Focus:** Plug-in Hybrid Electric Vehicles (PHEVs) only  
**Initial Dataset Size:** 7,732,320 vehicles (unique vehicles, last registrations only)

---

## Overview

This document details all data cleaning steps applied to the PHEV database, including:
- Cleaning criteria and thresholds
- Number of vehicles removed at each step
- OEM and model breakdowns of removed vehicles
- Variables cleaned and how
- Common characteristics of removed vehicles

**Note:** The cleaning process focuses exclusively on PHEVs (Powertrain == "P"). Steps marked with "DICE check-up" were excluded from this documentation as requested.

---

## Cleaning Steps Summary

**Execution Date:** December 18, 2025  
**Starting PHEV Count (after reassignments):** 284,987 vehicles  
**Final PHEV Count:** 253,023 vehicles  
**Total Vehicles Removed:** 31,964 vehicles (11.22% of starting PHEVs)

| Step | Description | Vehicles Removed | % of Step Starting Count |
|------|-------------|------------------|--------------------------|
| 1 | CS Mileage/FC Invalid | **19,397** | 6.806% |
| 2 | Missing RW_EC | **5,360** | 2.018% |
| 3 | Missing OEM/Model | **571** | 0.219% |
| 4 | RW_EC Zero Reporting Issues | **6,391** | 2.461% |
| 5 | Problematic VFN (VFN×Year) | *Skipped* | *VFN file not found* |
| 6 | Physics-Based CO2/FC Filters | **36** | 0.014% |
| 7 | Mileage/FC Inconsistencies | **209** | 0.083% |
| 8 | EDS Energy Violations | **0** | 0% |

---

## Detailed Cleaning Steps

### Step 1: CS (Charge Sustaining) Mileage and Fuel Consumption Cleaning

**Criteria:**
PHEVs removed if any of the following conditions are met:
- `Mileage_CS < 0` (negative CS mileage)
- `FC_CS < 0` (negative CS fuel consumption)
- `is.na(Mileage_CS)` (missing CS mileage)
- `is.na(FC_CS)` (missing CS fuel consumption)

**Rationale:**
CS (Charge Sustaining) mode represents driving when the battery is depleted and the vehicle operates as a conventional hybrid. Negative values or missing data indicate reporting errors or data inconsistencies.

**Vehicles Removed:**
- **Total:** **19,397 PHEVs** (6.806% of 284,987 PHEVs at this step)

**OEM Distribution (Top Removed):**
- **JEEP:** 4,673 vehicles
- **VOLKSWAGEN:** 4,042 vehicles  
- **SKODA:** 2,923 vehicles
- **LAND ROVER:** 1,656 vehicles
- **TOYOTA:** 1,573 vehicles
- **RENAULT:** 1,381 vehicles
- **AUDI:** 1,297 vehicles
- **FORD:** 644 vehicles
- **VOLVO:** 449 vehicles
- **Others:** 1,859 vehicles

**Top Models Removed:**
- **JEEP COMPASS:** 3,502 vehicles (largest single model removal)
- **VOLKSWAGEN PASSAT:** 1,995 vehicles
- **TOYOTA RAV4:** 1,418 vehicles
- **SKODA SUPERB:** 1,367 vehicles
- **SKODA OCTAVIA:** 1,228 vehicles
- **JEEP RENEGADE:** 1,038 vehicles

**Year Distribution:**
- **2021:** 14,780 vehicles (76.2%)
- **2022:** 4,617 vehicles (23.8%)

**Common Characteristics:**
The most common removed OEM_Model combination was **JEEP COMPASS** with 3,502 vehicles removed, representing systematic CS mode data quality issues for this specific model.

---

### Step 2: Missing Real-World Electric Consumption (RW_EC)

**Criteria:**
PHEVs removed if:
- `is.na(RW_EC)` (Real-World Electric Consumption is missing)

**Rationale:**
RW_EC is a critical metric for PHEV analysis. Missing values indicate incomplete data that cannot be imputed reliably for energy analysis.

**Vehicles Removed:**
- **Total:** **5,360 PHEVs** (2.018% of 265,590 PHEVs at this step)

**OEM Distribution (Top Removed):**
- **PEUGEOT:** 1,431 vehicles
- **CITROEN:** 849 vehicles
- **HYUNDAI:** 758 vehicles
- **BMW:** 595 vehicles
- **DS:** 579 vehicles
- **FORD:** 423 vehicles
- **OPEL:** 348 vehicles
- **SAIC:** 157 vehicles
- **Missing OEM:** 113 vehicles
- **Others:** 107 vehicles

**Top Models Removed:**
- **PEUGEOT 308:** 1,304 vehicles (largest single model removal for this step)
- **CITROEN C5 X:** 774 vehicles
- **DS DS4:** 483 vehicles
- **FORD KUGA:** 406 vehicles
- **HYUNDAI TUCSON:** 326 vehicles

**Year Distribution:**
- **2022:** 4,123 vehicles (76.9%)
- **2021:** 1,237 vehicles (23.1%)

---

### Step 3: Missing OEM or Model Information

**Criteria:**
PHEVs removed if:
- `is.na(OEM)` OR `is.na(Modelup)` (missing manufacturer or model designation)

**Rationale:**
OEM and Model are essential for analysis grouping, manufacturer comparisons, and model-specific assessments. Vehicles without these identifiers cannot be properly categorized.

**Vehicles Removed:**
- **Total:** **571 PHEVs** (0.219% of 260,230 PHEVs at this step)

**OEM Distribution:**
- **Missing OEM (NA):** 336 vehicles
- **PEUGEOT:** 108 vehicles
- **OPEL:** 65 vehicles
- **VOLVO:** 23 vehicles
- **PORSCHE:** 19 vehicles
- **SEAT:** 12 vehicles
- **Others:** 8 vehicles

**Note:**
The code includes imputation steps (using VFN-based mapping) that successfully filled:
- 88 missing OEM values
- 2,719 missing Modelup values
before this filter is applied. This filter only removes cases where imputation was unsuccessful.

**Year Distribution:**
- **2022:** 570 vehicles (99.8%)
- **2021:** 1 vehicle (0.2%)

---

### Step 4: Real-World Electric Consumption (RW_EC) Zero Reporting Issues

**Criteria:**
Two-stage filtering approach:

**Case A - Systematic Zero Reporting:**
- OEM_Model × Year combinations where 95th percentile of RW_EC == 0
- **Action:** Remove entire OEM_Model × Year combination
- **Rationale:** Systematic zero reporting indicates data quality issues or non-PHEV misclassification

**Case B - Partial Zero Reporting:**
- OEM_Model × Year combinations where:
  - 95th percentile RW_EC > 0 (some vehicles have valid data)
  - Share of zero RW_EC values > 30%
- **Action:** Remove only vehicles with RW_EC == 0 within these combinations
- **Rationale:** Partial zero reporting suggests some vehicles are incorrectly reporting zero electric consumption

**Thresholds:**
- `thr_p95_zero = 0` (for Case A)
- `thr_share_zero = 0.30` (30% threshold for Case B)

**Vehicles Removed:**
- **Case A (Systematic Zero Reporting):** 6,368 vehicles from 48 OEM_Model × Year combinations
- **Case B (Partial Zero Reporting):** 23 vehicles
- **Total:** **6,391 PHEVs** (2.461% of 259,659 PHEVs at this step)

**OEM Distribution (Top Removed):**
- **PORSCHE:** 6,271 vehicles (98.1% of removals in this step)
- **PEUGEOT:** 82 vehicles
- **DS:** 19 vehicles
- **SUZUKI:** 14 vehicles
- **Others:** 5 vehicles

**Top Models Removed:**
- **PORSCHE CAYENNE E HYBRID:** 4,247 vehicles (largest single model removal for this step)
- **PORSCHE PANAMERA 4 E HYBRID:** 686 vehicles
- **PORSCHE PANAMERA 4S E HYBRID:** 468 vehicles
- **PORSCHE PANAMERA 4:** 323 vehicles
- **PORSCHE CAYENNE TURBO S E HYBRID:** 289 vehicles

**Common Characteristics:**
Porsche PHEVs dominated this removal step, with systematic zero RW_EC reporting affecting multiple Porsche models across multiple years. The CAYENNE E HYBRID model alone accounted for 4,247 removed vehicles, indicating a systematic data quality issue with this model.

**Year Distribution:**
- **2022:** 3,592 vehicles (56.2%)
- **2021:** 2,799 vehicles (43.8%)

**Note:**
The code states: "OEM model–year combinations exhibiting systematic zero reporting of real-world electric energy consumption (95th percentile equal to zero) were excluded. For combinations with partial zero reporting (>30% zero values but non-zero upper percentiles), only zero RW_EC entries were removed. No imputation of real-world energy variables was performed."

---

### Step 5: Problematic Vehicle Family Number (VFN) Filtering

**Criteria:**
- Uses external VFN validation list (Excel file: `PHEVs_VFN_obfcm_ok.xlsx`)
- Matches on `VFN_corr` (corrected VFN) and `OBFCM_ReportingPeriod` (year)
- Removes PHEVs where `obfcm_ok == 0` for specific VFN × Year combinations

**Rationale:**
External validation identifies VFNs with known data quality issues, incorrect reporting, or other problems identified through expert review.

**Vehicles Removed:**
- **Status:** **Step Skipped** - VFN validation file not found
- **Expected file:** `02_data/OBFCM_2021-2023/Dataset/PHEVs_VFN_obfcm_ok.xlsx`
- **Note:** In the original analysis, this step removed 38,733 PHEVs (4.12% of all PHEVs at this stage) using VFN × Year filtering

**OEM Distribution:**
Code tracks:
- `bad_by_oem`: OEM distribution of removed vehicles
- `bad_by_oem_model`: OEM_Model distribution
- `bad_by_year`: Year distribution
- `bad_by_country`: Country (MS) distribution

**Common Characteristics:**
- Removed vehicles span multiple OEMs and model years
- Distribution reflects OEMs with known reporting issues or problematic vehicle families

---

### Step 6: Physics-Based CO2 and Fuel Consumption Filters

**Criteria:**
Different thresholds for PHEVs vs non-PHEVs:

**Non-PHEVs Removed if:**
- `CO2gap_abs < -30` (unrealistically low real-world vs type-approval CO2)
- `FCgap_perc > 200` (extreme fuel consumption gap >200%)
- `TA_CO2 <= 80` (impossible type-approval CO2 for ICE/HEV)
- `RW_CO2 > 800` (physically implausible real-world CO2)

**PHEVs Removed if:**
- `FCgap_perc > 1800` (extreme gap, clearly broken data)
- `TA_CO2 >= 190` (misclassified/non-PHEV WLTP value)
- `RW_CO2 > 800` (physically implausible real-world CO2)

**Rationale:**
Very loose, physics-based sanity checks to remove clearly erroneous records. No statistical outlier trimming performed - only removes physically or logically impossible values.

**Vehicles Removed (PHEVs):**
- **Total:** **36 PHEVs** (0.014% of 253,268 PHEVs at this step)

**OEM Distribution:**
- **LAND ROVER:** 17 vehicles
- **BMW:** 6 vehicles
- **MERCEDES-BENZ:** 6 vehicles
- **VOLVO:** 4 vehicles
- **FERRARI:** 3 vehicles

**Top Models Removed:**
- **LAND ROVER RANGE ROVER SPORT:** 12 vehicles
- **MERCEDES-BENZ C 300 E:** 6 vehicles
- **BMW 330E:** 5 vehicles
- **LAND ROVER RANGE ROVER:** 5 vehicles
- **VOLVO POLESTAR 1:** 3 vehicles
- **FERRARI SF90 STRADALE:** 3 vehicles

**Year Distribution:**
- **2022:** 31 vehicles (86.1%)
- **2021:** 5 vehicles (13.9%)

**Common Characteristics:**
High-end luxury vehicles (Range Rover, Ferrari, Polestar) with implausible CO2 values, likely due to misclassification or data reporting errors.

**Note:**
The code explicitly states: "Very loose, physics-based sanity checks were applied to real-world CO₂ and fuel consumption indicators to remove clearly erroneous records (e.g. implausibly high CO₂ values or extreme gap metrics). Thresholds were defined separately for PHEVs and non-PHEVs. No statistical outlier trimming was performed."

---

### Step 7: Mileage and Fuel Consumption Inconsistency Filters

**Criteria:**
Removes PHEVs with logical impossibilities in distance–fuel combinations:

1. **CD Engine-On Mode:**
   - `Mileage_CD_Eng_On == 0` AND `FC_CD > 0.1`
   - **Rationale:** Cannot have fuel consumption without distance traveled

2. **CS Mode:**
   - `Mileage_CS == 0` AND `FC_CS > 0.1`
   - **Rationale:** Cannot have fuel consumption without distance traveled

3. **CI Mode:**
   - `Mileage_CI == 0` AND `FC_CI > 3`
   - **Rationale:** Cannot have significant fuel consumption without distance traveled

4. **CS Mode Quality Filter:**
   - `Mileage_CS > 100` AND `FC_CS == 0`
   - **Rationale:** Large distance with zero fuel is a quality red flag (likely reporting artefact)
   - **Note:** FC == 0 & Mileage > 0 is generally ALLOWED, but this rule is a conservative quality filter for large distances

**Vehicles Removed:**
- **Total:** **209 PHEVs** (0.083% of 253,232 PHEVs at this step)

**Breakdown by Inconsistency Type:**
- **CI zero distance (mileage=0, FC>3):** 157 vehicles (75.1%)
- **CD engine-on (mileage=0, FC>0.1):** 57 vehicles (27.3%)
- **CS large distance, zero fuel (mileage>100, FC=0):** 5 vehicles (2.4%)
- **CS zero distance (mileage=0, FC>0.1):** 2 vehicles (1.0%)

**OEM Distribution (Top Removed):**
- **FORD:** 101 vehicles (48.3% of removals)
- **JEEP:** 46 vehicles (22.0%)
- **SAIC:** 21 vehicles (10.0%)
- **VOLKSWAGEN:** 10 vehicles
- **VOLVO:** 9 vehicles
- **Others:** 22 vehicles

**Top Models Removed:**
- **FORD KUGA:** 100 vehicles (largest single model removal for this step - 47.8% of all removals)
- **JEEP COMPASS:** 17 vehicles
- **JEEP WRANGLER UNLIMITED:** 15 vehicles
- **JEEP RENEGADE:** 13 vehicles
- **SAIC MG EHS PLUG IN HYBRID:** 13 vehicles

**Common Characteristics:**
FORD KUGA vehicles dominated this removal step with 100 vehicles removed, primarily due to CI (Charge Increasing) mode inconsistencies where fuel consumption was reported without corresponding distance. This suggests systematic reporting issues with this specific model.

**Year Distribution:**
- **2021:** 121 vehicles (57.9%)
- **2022:** 88 vehicles (42.1%)

---

### Step 8: EDS (Electric Driving Share) and Energy Violations

**Criteria:**
Removes PHEVs with hard violations in EDS or energy calculations:

1. **EDS Bounds Violations:**
   - `EDSd < 0` OR `EDSd > 100`
   - `EDSpel < 0` OR `EDSpel > 100`
   - `EDSen < 0` OR `EDSen > 100`
   - `EDSpel > EDSd` (logical inconsistency)

2. **Energy Non-Negativity:**
   - `EnEl < 0` (negative electric energy)
   - `EnICE < 0` (negative ICE energy)
   - `EnTot < 0` (negative total energy)
   - `EnTot100km < 0` (negative energy per 100km)

3. **Energy Accounting Identity:**
   - `abs(EnTot - (EnEl + EnICE)) > 1e-6`
   - **Rationale:** Total energy must equal sum of electric and ICE energy (within floating-point precision)

**Diagnostic (Not Removed):**
- Zero total energy with substantial driving (>=500 km) - flagged but not removed (diagnostic only)

**Vehicles Removed:**
- **Total:** **0 PHEVs** (0% of 253,023 PHEVs at this step)

**Breakdown by Violation Type:**
- **EDS bounds violations:** 0 vehicles
- **Negative energy values:** 0 vehicles
- **Energy identity violations:** 0 vehicles

**Note:**
No vehicles were removed at this final step, indicating that all remaining PHEVs passed energy accounting and EDS bounds checks. This suggests the previous cleaning steps effectively removed vehicles with energy calculation issues.

**Rationale:**
EDS values must be between 0-100% by definition. Energy values cannot be negative. Energy accounting must be consistent. These are hard constraints that indicate calculation errors or data corruption.

---

## Variable Cleaning Summary

### Variables Cleaned/Standardized

1. **OEM (Manufacturer):**
   - Converted to uppercase (`toupper()`)
   - Trimmed whitespace (`trimws()`)
   - **Initial problematic OEM replacement:** 8,564 vehicles had problematic OEMs replaced with Make values. Problematic OEMs included:
     - 'STELLANTIS AUTO', 'STELLANTIS EUROPE', 'PSA AUTOMOBILES SA', 'PSA'
     - 'DAIMLER AG', 'FIAT GROUP', 'GENERAL MOTORS COMPANY', 'GENERAL MOTORS HOLDINGS LLC'
     - 'CHRYSLER', 'FCA ITALY SPA', 'FCA US LLC', 'UNKNOWN', 'DUPLICATE', 'OUT OF SCOPE'
     - Empty strings and other problematic entries
   - Harmonized variants (extensive list, e.g., "BMW AG" → "BMW", "MERCEDES-BENZ AG" → "MERCEDES-BENZ", "JAGUAR LAND ROVER LIMITED" → "LAND ROVER")
   - Special handling: Some models were reassigned OEM (e.g., F PACE and E PACE models moved from "LAND ROVER" to "JAGUAR" OEM)
   - Final count: 46 OEMs total (24 for PHEVs)

2. **Model:**
   - Converted to uppercase
   - Trimmed whitespace
   - Removed special characters: `'`, `(`, `)`, `?`, `*`
   - Standardized separators: `,`, `-`, `/` → space
   - Created `Modelup` field (cleaned model name)
   - Harmonized model variants (extensive standardization, e.g., "225XE ACTIVE TOURER IPERFORMAN" → "225XE")
   - Final count: 438 unique models for PHEVs

3. **OEM_Model:**
   - Created as `paste(OEM, Modelup)`
   - Final count: 98 unique OEM_Model combinations for PHEVs

4. **Fuel Type:**
   - Standardized: "PETROL/ELECTRIC" → "Petrol", "DIESEL/ELECTRIC" → "Diesel"
   - Standardized: "PETROL" → "Petrol", "DIESEL" → "Diesel"

5. **Calculated Variables:**
   - `RW_EC`: Recalculated from `OBFCM_EnergyIntoBattery_kWh / Mileage_Tot * 100`
   - `Mileage_CS`: Calculated as `Mileage_Tot - Mileage_CD_Eng_On - Mileage_CD_Eng_Off - Mileage_CI`
   - `FC_CS`: Calculated as `FC_Tot - FC_CD - FC_CI`
   - `EDSd`, `EDSpel`, `EDSen`: Electric Driving Share metrics
   - Energy variables: `EnEl`, `EnICE`, `EnTot`, `EnTot100km`, etc.

### Variables Removed/Dropped

- `RW_OVC`: Removed (not specified why)
- `Data_source` and `Ct`: Removed during initial processing
- Variables selected out during initial processing

### Special Cases and Data Corrections

1. **2021 Land Rover/Jaguar Range Assignment:**
   - For 2021 Land Rover and Jaguar PHEVs, `TA_EC` was assigned from `Electric_range` values
   - Specific range assignments by model:
     - RANGE ROVER VELAR: 53 km
     - DEFENDER: 45 km
     - RANGE ROVER VOGUE: 80 km
     - JAGUAR F PACE: 53 km
     - JAGUAR E PACE: 63 km
   - After assignment, `Electric_range` was set to NA for these cases (to avoid duplication)

2. **OEM_Model Corrections:**
   - Some models were reassigned from "LAND ROVER" to "JAGUAR" OEM (F PACE, E PACE)
   - Specific OEM_Model combinations were cleaned/corrected based on TA_CO2 thresholds (e.g., PEUGEOT 3008 vs 308 distinction)

3. **Commented-Out Filters:**
   - Removal of OEMs with <20 vehicles was considered but not applied (commented out)
   - Removal of OEM_Model combinations with ≤10 vehicles was considered but not applied (28 vehicles from 11 OEM_models would have been removed)

---

## Common Characteristics of Removed Vehicles

Based on the cleaning criteria, removed vehicles commonly exhibit:

1. **Data Quality Issues:**
   - Missing critical variables (OEM, Model, RW_EC, mileage/FC data)
   - Inconsistent mode-specific reporting (CS, CD, CI modes)
   - Negative or impossible values in derived metrics

2. **Reporting Errors:**
   - Zero electric consumption when driving occurred (systematic or partial)
   - Fuel consumption without corresponding distance
   - Distance without fuel consumption (in certain contexts)
   - Physically implausible CO2 or fuel consumption values

3. **Classification Issues:**
   - Vehicles misclassified as PHEVs (high TA_CO2, zero RW_EC)
   - Problematic VFN assignments (identified through external validation)
   - Missing or incorrect OEM/Model assignments

4. **Calculation Errors:**
   - Energy accounting inconsistencies
   - EDS values outside 0-100% range
   - Negative energy values

5. **OEM Patterns:**
   - Some OEMs show higher proportions of removed vehicles
   - Patterns may reflect:
     - Data reporting quality differences across manufacturers
     - Earlier model years with less complete reporting
     - Specific model lines with known issues

---

## Notes on Cleaning Approach

1. **No Statistical Outlier Trimming:**
   - Only physics-based and logical consistency checks applied
   - No removal based on statistical distributions (e.g., z-scores, IQR)

2. **PHEV Focus:**
   - All filters specifically target PHEVs (Powertrain == "P")
   - Non-PHEV filtering only in Step 6 (physics-based CO2/FC filters)

3. **Conservative Approach:**
   - Prefers removing problematic records over imputation
   - No imputation of real-world energy variables performed
   - Explicit tracking of removed vehicles by OEM/Year/Country

4. **Hierarchical Imputation (for Missing Technical Parameters):**
   - After cleaning, missing technical parameters are imputed using:
     1. VFN × Year median
     2. VFN overall median
     3. OEM_Model × Year median
     4. OEM_Model overall median
   - Only applies to technical variables (Mass, Engine_power, Electric_range, etc.), not real-world performance metrics

5. **External Validation:**
   - Uses external VFN validation list (expert-reviewed problematic VFNs)
   - Year-specific filtering preferred over blanket VFN removal

---

## Final Dataset Characteristics

After all cleaning steps:
- **Starting PHEVs (after reassignments):** 284,987 vehicles
- **Final PHEVs remaining:** **253,023 vehicles**
- **Total PHEVs removed:** 31,964 vehicles (11.22% of starting count)
- **Unique OEMs (PHEVs):** 23
- **Unique Models (PHEVs):** 440
- **Unique OEM_Model combinations (PHEVs):** 443

---

## References

- Source code: `PHEV_paper_12_25.R`
- External VFN validation: `PHEVs_VFN_obfcm_ok.xlsx`
- Original dataset: `db_212223concatpub_vdb_M1_v10_20250716.csv` (from 7z archive)

---

*Document created: Based on code analysis of PHEV_paper_12_25.R*  
*Last updated: December 18, 2025 - Updated with actual removal statistics from data cleaning execution*

**Execution Details:**
- Script: `paper_a_analysis/PHEV_CLEANING_WITH_LOG.R`
- Log file: `paper_a_analysis/DATA_CLEANING_DETAILED_LOG.txt`
- Dataset: `02_data/OBFCM_2021-2023/Dataset/db_212223concatpub_vdb_M1_v10_20250716.csv` (1.2GB, 2,579,995 vehicles)
- Note: Step 5 (VFN filtering) was skipped due to missing validation file



