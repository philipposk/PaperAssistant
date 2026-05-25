# Paper A: Variable Importance Analysis
# Step 5: LMG (Lindeman, Merenda, Gold) variable importance analysis
#
# Primary Method: LMG (relaimpo package)
# Secondary: GAMs (mgcv package)
# Tertiary: Random Forest (randomForest package)
#
# Author: Markos Ktistakis (with AI assistance)
# Date: December 2025

# ============================================================================
# SETUP
# ============================================================================

set.seed(42)

library(tidyverse)
library(here)

# Variable importance packages
required_packages <- c("relaimpo", "mgcv", "randomForest")

missing_packages <- required_packages[!(required_packages %in% installed.packages()[,"Package"])]
if(length(missing_packages) > 0) {
  cat("Installing missing packages:", paste(missing_packages, collapse = ", "), "\n")
  install.packages(missing_packages, dependencies = TRUE)
}

library(relaimpo)  # LMG method
library(mgcv)      # GAMs
library(randomForest)  # Random Forest

project_root <- here::here()

# ============================================================================
# LOAD DATA
# ============================================================================

cat("\n=== Loading Final Dataset ===\n\n")

phevs_path <- file.path(project_root, "paper_a_analysis", "data", "processed", 
                        "obfcm_phevs_final.csv")

if(!file.exists(phevs_path)) {
  stop("Final dataset not found. Please run 04_link_dice.R first.")
}

phevs <- read_csv(phevs_path, show_col_types = FALSE)
cat("Loaded", nrow(phevs), "PHEV records\n")

# ============================================================================
# PREPARE DATA FOR MODELING
# ============================================================================

cat("\n=== Preparing Data for Modeling ===\n\n")

# Use available variables (lean set)
mass_var <- if ("Mass" %in% names(phevs)) "Mass" else if ("mass" %in% names(phevs)) "mass" else NA
aer_var  <- if ("Electric_range" %in% names(phevs)) "Electric_range" else if ("aer" %in% names(phevs)) "aer" else NA

phevs_model <- phevs %>%
  filter(!is.na(total_energy))

if(!is.na(mass_var)) {
  phevs_model <- phevs_model %>% filter(!is.na(.data[[mass_var]]))
}
if(!is.na(aer_var)) {
  phevs_model <- phevs_model %>% filter(!is.na(.data[[aer_var]]))
}

cat("Complete cases for modeling:", nrow(phevs_model), "\n")
cat("Variables used: total_energy",
    if(!is.na(mass_var)) paste0(", ", mass_var) else "",
    if(!is.na(aer_var)) paste0(", ", aer_var) else "", "\n")

# ============================================================================
# STEP 5: VARIABLE IMPORTANCE ANALYSIS
# ============================================================================

cat("\n=== STEP 5: Variable Importance Analysis ===\n\n")

# ============================================================================
# METHOD 1: LMG (Primary Method)
# ============================================================================

cat("1. LMG Variable Importance Analysis (Primary Method)...\n")

# Prepare variables for LMG (using Markos's column names)
# LMG requires numeric variables, so convert factors to numeric if needed

# Use Mass/Electric_range if available, otherwise mass/aer
mass_var <- if("Mass" %in% names(phevs_model)) "Mass" else "mass"
aer_var <- if("Electric_range" %in% names(phevs_model)) "Electric_range" else "aer"

lmg_data <- phevs_model %>%
  dplyr::select(total_energy, !!sym(mass_var), !!sym(aer_var)) %>%
  rename(mass = !!sym(mass_var), aer = !!sym(aer_var)) %>%
  filter(complete.cases(.))

# Add region as numeric (if available)
if("region" %in% names(phevs_model)) {
  lmg_data$region_numeric <- as.numeric(as.factor(phevs_model$region[match(rownames(lmg_data), 
                                                                           rownames(phevs_model))]))
}

# Add registration year (if available)
if("registration_year" %in% names(phevs_model)) {
  lmg_data$registration_year <- phevs_model$registration_year[match(rownames(lmg_data), 
                                                                     rownames(phevs_model))]
}

cat("  Preparing LMG model with", nrow(lmg_data), "complete cases\n")

# Build linear model
if("region_numeric" %in% names(lmg_data)) {
  lmg_formula <- total_energy ~ mass + aer + region_numeric
} else {
  lmg_formula <- total_energy ~ mass + aer
}

lmg_model <- lm(lmg_formula, data = lmg_data)

cat("  Model R²:", round(summary(lmg_model)$r.squared, 4), "\n")

# Calculate LMG importance
cat("  Calculating LMG decomposition (this may take a while)...\n")
lmg_results <- calc.relimp(lmg_model, type = "lmg", rela = TRUE)

# Bootstrap confidence intervals
cat("  Bootstrapping LMG (1000 iterations - this will take several minutes)...\n")
lmg_boot <- boot.relimp(lmg_model, b = 1000, type = "lmg", fixed = FALSE)

# Extract results
lmg_summary <- data.frame(
  variable = names(lmg_results$lmg),
  lmg_contribution = as.numeric(lmg_results$lmg),
  lmg_percent = as.numeric(lmg_results$lmg) * 100
)

# (Optional) Bootstrap confidence intervals (disabled for robustness)
# lmg_ci <- booteval.relimp(lmg_boot, level = 0.95)
# ci_df <- data.frame(
#   variable = rownames(lmg_ci$lmg),
#   lmg_lower_ci = lmg_ci$lmg[,1],
#   lmg_upper_ci = lmg_ci$lmg[,2]
# )
# lmg_summary <- lmg_summary %>%
#   left_join(ci_df, by = "variable")
lmg_summary$lmg_lower_ci <- NA
lmg_summary$lmg_upper_ci <- NA

cat("\n  LMG Results:\n")
print(lmg_summary)

# Save LMG results
write_csv(lmg_summary, 
          file.path(project_root, "paper_a_analysis", "tables", 
                   "variable_importance_lmg.csv"))

# ============================================================================
# METHOD 2: GAMs (Secondary Method)
# ============================================================================

cat("\n2. GAM Variable Importance (Secondary Method)...\n")

# Fit GAM model (mass, aer, optional region)
gam_data <- lmg_data

if("region" %in% names(phevs_model)) {
  gam_data$region <- phevs_model$region[match(rownames(gam_data), rownames(phevs_model))]
}

# GAM with smooth terms
if("region" %in% names(gam_data)) {
  gam_formula <- total_energy ~ s(mass) + s(aer) + region
} else {
  gam_formula <- total_energy ~ s(mass) + s(aer)
}

gam_model <- gam(gam_formula, data = gam_data)

gam_summ <- summary(gam_model)
if(!is.null(gam_summ$r.sq)) {
  cat("  GAM R²:", round(gam_summ$r.sq, 4), "\n")
}
cat("  GAM Deviance Explained:", round(gam_summ$dev.expl * 100, 2), "%\n")

# Variable importance from GAM (using F-statistics)
gam_importance <- summary(gam_model)$s.table

# Save GAM results
gam_results <- data.frame(
  variable = rownames(gam_importance),
  edf = gam_importance[, "edf"],
  ref_df = gam_importance[, "Ref.df"],
  f_stat = gam_importance[, "F"],
  p_value = gam_importance[, "p-value"]
)

write_csv(gam_results, 
          file.path(project_root, "paper_a_analysis", "tables", 
                   "variable_importance_gam.csv"))

# ============================================================================
# METHOD 3: Random Forest (Tertiary Method)
# ============================================================================

cat("\n3. Random Forest Variable Importance (Tertiary Method)...\n")

# Prepare data for Random Forest (sample to reduce memory)
rf_data <- lmg_data %>%
  dplyr::select_if(is.numeric) %>%
  filter(complete.cases(.))

# Sample to a manageable size (max 50k)
if(nrow(rf_data) > 50000) {
  rf_data <- rf_data %>% sample_n(50000, replace = FALSE)
}

if(nrow(rf_data) > 0 && "total_energy" %in% names(rf_data)) {
  # Fit Random Forest
  rf_model <- randomForest(
    total_energy ~ .,
    data = rf_data,
    ntree = 200,
    importance = TRUE,
    na.action = na.omit
  )
  
  cat("  RF R²:", round(mean(rf_model$rsq), 4), "\n")
  
  # Extract variable importance
  rf_importance <- importance(rf_model)
  rf_results <- data.frame(
    variable = rownames(rf_importance),
    importance = rf_importance[, "%IncMSE"],
    importance_sd = rf_importance[, "IncNodePurity"]
  ) %>%
    arrange(desc(importance))
  
  cat("\n  RF Variable Importance:\n")
  print(rf_results)
  
  # Save RF results
  write_csv(rf_results, 
            file.path(project_root, "paper_a_analysis", "tables", 
                     "variable_importance_rf.csv"))
} else {
  warning("Cannot run Random Forest: insufficient data or missing variables")
}

# ============================================================================
# COMPARISON OF METHODS
# ============================================================================

cat("\n=== Variable Importance Comparison ===\n\n")

cat("LMG (Primary) - Top Variables:\n")
print(head(lmg_summary %>% arrange(desc(lmg_contribution)), 5))

if(exists("rf_results")) {
  cat("\nRandom Forest - Top Variables:\n")
  print(head(rf_results, 5))
}

# ============================================================================
# SAVE MODEL OBJECTS (for later use)
# ============================================================================

cat("\n=== Saving Model Objects ===\n")

save(lmg_model, lmg_results, lmg_boot, lmg_summary,
     file = file.path(project_root, "paper_a_analysis", "data", "processed", 
                     "variable_importance_models.RData"))

if(exists("gam_model")) {
  save(gam_model, file = file.path(project_root, "paper_a_analysis", "data", "processed", 
                                   "gam_model.RData"))
}

if(exists("rf_model")) {
  save(rf_model, file = file.path(project_root, "paper_a_analysis", "data", "processed", 
                                  "rf_model.RData"))
}

cat("Models saved\n")

cat("\n=== Step 5 Complete ===\n")
cat("Next: Run 06_campaign_analysis.R for campaign data analysis\n")





