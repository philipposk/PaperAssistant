# Data Cleaning Documentation

This folder contains all documentation related to the PHEV database cleaning process.

## Files in this folder

1. **[DATA_CLEANING_DOCUMENTATION.md](DATA_CLEANING_DOCUMENTATION.md)** - Main comprehensive documentation of all cleaning steps, criteria, and results

2. **[FLAGGING_STATISTICS_TABLE.md](FLAGGING_STATISTICS_TABLE.md)** - Summary table with flagging statistics by step

3. **[FLAGGING_APPROACH_EXPLANATION.md](FLAGGING_APPROACH_EXPLANATION.md)** - Explanation of the flagging approach (vs. removal approach)

4. **[CLEANING_EXECUTION_SUMMARY.md](CLEANING_EXECUTION_SUMMARY.md)** - Executive summary of cleaning execution and key findings

5. **[CLEANING_SCRIPT_README.md](CLEANING_SCRIPT_README.md)** - Instructions for running the cleaning script

6. **[DATA_CLEANING_DETAILED_LOG.txt](DATA_CLEANING_DETAILED_LOG.txt)** - Complete detailed log from script execution with all statistics

## Quick Summary

- **Total vehicles processed:** 7,732,320
- **Total PHEVs:** 994,764
- **Clean PHEVs (no flags):** 938,604 (94.4%)
- **Flagged PHEVs (with ≥1 flag):** 56,160 (5.6%)
- **Approach:** All vehicles retained, quality flags applied

## Related Files

- Cleaning script: `../PHEV_CLEANING_WITH_LOG.R`
- Source script: `../PHEV_paper_12_25.R` (original cleaning logic)







