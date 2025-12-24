# PHEV Cleaning Script with Logging

## Script: `PHEV_CLEANING_WITH_LOG.R`

This script is an adapted version of `PHEV_paper_12_25.R` with:
- **Mac path adaptations** (reads from CSV directly)
- **Comprehensive logging** at each removal step
- **Detailed statistics** including OEM/Model/Year breakdowns
- **Excludes DICE merging section** (as requested)

## What the Script Does

1. **Loads data** from CSV file (1.2GB file, may take several minutes)
2. **Prepares variables** (calculates mileage, FC, energy, EDS metrics)
3. **Cleans OEM names** (harmonizes manufacturer names)
4. **Cleans Model names** (extracts and applies 244 harmonization rules from original file)
5. **Applies reassignments** (VFN-based filling, high TA_CO2 reassignments)
6. **Removes vehicles** through 8 cleaning steps with detailed logging

## Removal Steps Logged

1. **CS Mileage/FC Invalid** - Negative or missing CS mode data
2. **Missing RW_EC** - Missing real-world electric consumption
3. **Missing OEM/Model** - Vehicles without manufacturer/model info
4. **RW_EC Zero Reporting** - Systematic or partial zero reporting issues
5. **Problematic VFN** - Vehicles with problematic VFN×Year combinations
6. **Physics-Based CO2/FC Filters** - Implausible CO2/fuel consumption values
7. **Mileage/FC Inconsistencies** - Logical impossibilities (fuel without distance, etc.)
8. **EDS/Energy Violations** - EDS outside 0-100%, negative energy, accounting errors

## How to Run

```r
# Set working directory to project root
setwd("/Users/phktistakis/Devoloper Projects/Markos project")

# Source the script
source("paper_a_analysis/PHEV_CLEANING_WITH_LOG.R")
```

## Output

The script generates a detailed log file:
- **Location:** `paper_a_analysis/DATA_CLEANING_DETAILED_LOG.txt`
- **Contents:**
  - Removal statistics for each step
  - OEM distribution of removed vehicles
  - Model distribution (top 30)
  - OEM_Model distribution (top 30)
  - Year distribution
  - Final summary with total removals

## Requirements

- Original file `PHEV_paper_12_25.R` must be in project root (for model harmonization extraction)
- CSV file: `02_data/OBFCM_2021-2023/Dataset/db_212223concatpub_vdb_M1_v10_20250716.csv`
- VFN validation file (optional): `02_data/OBFCM_2021-2023/Dataset/PHEVs_VFN_obfcm_ok.xlsx`

## Notes

- Model harmonization automatically extracts from original file (lines 421-790)
- If extraction fails, a warning will be logged but script continues
- Processing time: Expect 10-30 minutes depending on system (1.2GB CSV file)
- Memory: Ensure sufficient RAM (recommended: 8GB+ free)



