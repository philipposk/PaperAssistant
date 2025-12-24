# Windows version of Flagged Vehicles Pattern Analysis Script
# This script is identical to the Mac/Linux version as R handles both path separators
# File paths use forward slashes which work on both Windows and Unix systems

#!/usr/bin/env Rscript
suppressPackageStartupMessages({
  library(tidyverse)
  library(here)
})

set.seed(42)

df <- read_rds(here("paper_a_analysis/data/processed/obfcm_phevs_flagged_full.rds"))
flag_cols <- grep("^flag_", names(df), value = TRUE)

message("Analyzing patterns...")

analyze_flagged <- function(df, flag_col, step_name) {
  flagged <- df[df[[flag_col]], ]
  clean <- df[!df[[flag_col]], ]
  if (nrow(flagged) == 0) return(NULL)
  
  comparisons <- list()
  numeric_vars <- c("Mass", "TA_CO2", "Electric_range", "Engine_displacement", 
                    "Engine_power", "drive_battery_capacity_kwh", "Mileage_Tot",
                    "FC_Tot", "RW_EC", "Mileage_CS", "FC_CS")
  
  for (var in numeric_vars) {
    if (var %in% names(df)) {
      flagged_vals <- flagged[[var]][!is.na(flagged[[var]])]
      clean_vals <- clean[[var]][!is.na(clean[[var]])]
      if (length(flagged_vals) > 10 && length(clean_vals) > 10) {
        test_result <- tryCatch(t.test(flagged_vals, clean_vals), error = function(e) NULL)
        if (!is.null(test_result) && test_result$p.value < 0.05) {
          comparisons[[var]] <- list(
            flagged_mean = mean(flagged_vals),
            clean_mean = mean(clean_vals),
            diff_pct = (mean(flagged_vals) - mean(clean_vals)) / mean(clean_vals) * 100,
            p_value = test_result$p.value
          )
        }
      }
    }
  }
  
  cat_comparisons <- list()
  cat_vars <- c("OEM", "Model", "Fuel_type", "Gearbox", "segment", "Country", "Region")
  
  for (var in cat_vars) {
    if (var %in% names(df)) {
      flagged_tab <- table(flagged[[var]], useNA = "no")
      clean_tab <- table(clean[[var]], useNA = "no")
      if (length(flagged_tab) == 0 || length(clean_tab) == 0) next
      
      all_cats <- unique(c(names(flagged_tab), names(clean_tab)))
      flagged_aligned <- setNames(rep(0, length(all_cats)), all_cats)
      clean_aligned <- setNames(rep(0, length(all_cats)), all_cats)
      flagged_aligned[names(flagged_tab)] <- as.numeric(flagged_tab)
      clean_aligned[names(clean_tab)] <- as.numeric(clean_tab)
      
      flagged_pct <- flagged_aligned / sum(flagged_aligned) * 100
      clean_pct <- clean_aligned / sum(clean_aligned) * 100
      
      overrep <- numeric(length(all_cats))
      names(overrep) <- all_cats
      for (cat in all_cats) {
        clean_val <- clean_pct[cat]
        flagged_val <- flagged_pct[cat]
        if (!is.na(clean_val) && clean_val > 0) {
          overrep[cat] <- (flagged_val - clean_val) / clean_val * 100
        } else if (!is.na(flagged_val) && flagged_val > 0) {
          overrep[cat] <- 999
        }
      }
      overrep <- overrep[!is.na(overrep) & overrep > 20]
      if (length(overrep) > 0) {
        cat_comparisons[[var]] <- head(sort(overrep, decreasing = TRUE), 10)
      }
    }
  }
  
  list(
    step = step_name,
    n_flagged = nrow(flagged),
    numeric_differences = comparisons,
    categorical_overrepresentation = cat_comparisons,
    top_oems = head(sort(table(flagged$OEM), decreasing = TRUE), 10),
    top_models = head(sort(table(flagged$Model), decreasing = TRUE), 10)
  )
}

step_names <- c(
  "flag_cs_invalid" = "Step 1: CS Invalid",
  "flag_missing_rw_ec" = "Step 2: Missing RW_EC",
  "flag_missing_oem_model" = "Step 3: Missing OEM/Model",
  "flag_rw_ec_zero" = "Step 4: RW_EC Zero",
  "flag_vfn_issue" = "Step 5: VFN Issue",
  "flag_physics_co2_fc" = "Step 6: Physics CO2/FC",
  "flag_mileage_fc_incons" = "Step 7: Mileage/FC Inconsistency",
  "flag_eds_energy_violation" = "Step 8: EDS/Energy Violation"
)

all_analyses <- list()
for (flag in flag_cols) {
  if (flag %in% names(step_names)) {
    message(glue::glue("Analyzing {step_names[flag]}..."))
    all_analyses[[flag]] <- analyze_flagged(df, flag, step_names[flag])
  }
}

saveRDS(all_analyses, here("paper_a_analysis/data/processed/flagged_patterns_analysis.rds"))

summary_list <- list()
for (flag in names(all_analyses)) {
  analysis <- all_analyses[[flag]]
  if (!is.null(analysis)) {
    if (length(analysis$numeric_differences) > 0) {
      num_summary <- map_dfr(names(analysis$numeric_differences), function(var) {
        x <- analysis$numeric_differences[[var]]
        tibble(step = analysis$step, variable = var, flagged_mean = x$flagged_mean,
               clean_mean = x$clean_mean, diff_pct = x$diff_pct, p_value = x$p_value)
      })
      summary_list[[paste0(flag, "_numeric")]] <- num_summary
    }
    if (length(analysis$top_oems) > 0) {
      oem_summary <- tibble(step = analysis$step, OEM = names(analysis$top_oems),
                            n_flagged = as.numeric(analysis$top_oems),
                            pct_of_flagged = round(n_flagged / analysis$n_flagged * 100, 2))
      summary_list[[paste0(flag, "_oems")]] <- oem_summary
    }
  }
}

if (length(summary_list) > 0) {
  numeric_summary <- bind_rows(summary_list[grepl("_numeric$", names(summary_list))])
  oem_summary <- bind_rows(summary_list[grepl("_oems$", names(summary_list))])
  write_csv(numeric_summary, here("paper_a_analysis/tables/flagged_numeric_patterns.csv"))
  write_csv(oem_summary, here("paper_a_analysis/tables/flagged_oem_patterns.csv"))
}

message("\n=== COMPLETE ===")
