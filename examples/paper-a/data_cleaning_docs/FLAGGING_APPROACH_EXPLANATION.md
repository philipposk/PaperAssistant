# Flagging Approach: All Data Retained

## What Changed

The cleaning script now **FLAGS** vehicles instead of **REMOVING** them. This means:

### ✅ All 7.7M vehicles are kept in the dataset
### ✅ Quality flags are added for problematic records
### ✅ Detailed statistics still logged for what would have been removed

---

## Quality Flags Added

Each cleaning step adds a flag column:

1. **`flag_CS_invalid`** - Step 1: CS Mileage/FC Invalid
2. **`flag_missing_RW_EC`** - Step 2: Missing RW_EC
3. **`flag_missing_OEM_Model`** - Step 3: Missing OEM/Model
4. **`flag_RWEC_zero_reporting`** - Step 4: RW_EC Zero Reporting
5. **`flag_problematic_VFN`** - Step 5: Problematic VFN (if VFN file exists)
6. **`flag_physics_CO2_FC`** - Step 6: Physics-Based CO2/FC filters
7. **`flag_mileage_FC_inconsistency`** - Step 7: Mileage/FC Inconsistencies
8. **`flag_EDS_energy_violation`** - Step 8: EDS/Energy Violations

---

## Using Flags in Analysis

To use only "clean" PHEVs in analysis:

```r
# Get clean PHEVs (no quality flags)
phevs_clean <- obf2023 %>%
  filter(Powertrain == "P") %>%
  filter(
    !flag_CS_invalid &
    !flag_missing_RW_EC &
    !flag_missing_OEM_Model &
    !flag_RWEC_zero_reporting &
    !flag_physics_CO2_FC &
    !flag_mileage_FC_inconsistency &
    !flag_EDS_energy_violation
  )
```

Or create a combined flag:

```r
obf2023$any_quality_flag <- obf2023$flag_CS_invalid |
                             obf2023$flag_missing_RW_EC |
                             obf2023$flag_missing_OEM_Model |
                             obf2023$flag_RWEC_zero_reporting |
                             obf2023$flag_physics_CO2_FC |
                             obf2023$flag_mileage_FC_inconsistency |
                             obf2023$flag_EDS_energy_violation

phevs_clean <- obf2023 %>% filter(Powertrain == "P" & !any_quality_flag)
```

---

## Data Loading

The script now:
1. **Tries 7z archive first** - Extracts directly from archive to get full 7.7M entries
2. **Falls back to CSV** - If archive not found, uses pre-extracted CSV
3. **Warns if CSV is incomplete** - Alerts if CSV has fewer than expected entries

---

## Next Steps

1. Run the script (will take 10-20 minutes for 7.7M records)
2. Review the log file for flagging statistics
3. Use flags to filter for specific analyses as needed
4. All data remains available for transparency and alternative filtering approaches
