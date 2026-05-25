# PHEV Quality Flagging Statistics

## Summary
- **Total PHEVs in dataset:** 994,764
- **Clean PHEVs (no flags):** 938,604 (94.4%)
- **Flagged PHEVs (with ≥1 flag):** 56,160 (5.6%)

## Breakdown by Flag Type

| Step | Flag Description | Number Flagged | Percentage of PHEVs |
|------|-----------------|----------------|---------------------|
| Step 1 | CS Mileage/FC Invalid | 33,348 | 3.35% |
| Step 2 | Missing RW_EC | 12,554 | 1.26% |
| Step 3 | Missing OEM/Model | 2,646 | 0.27% |
| Step 4 | RW_EC Zero Reporting | 11,100 | 1.12% |
| Step 5 | Problematic VFN | *Skipped* | - |
| Step 6 | Physics-Based CO2/FC | 417 | 0.04% |
| Step 7 | Mileage/FC Inconsistencies | 565 | 0.06% |
| Step 8 | EDS/Energy Violations | 4,396 | 0.44% |

**Note:** Step 5 (VFN filtering) was skipped because the VFN validation file was not found.

**Important:** All vehicles were retained in the dataset. Flags indicate quality issues but do not remove vehicles from the analysis. Some vehicles may have multiple flags, so the sum of individual flag counts (64,926) exceeds the total number of vehicles with any flag (56,160).
