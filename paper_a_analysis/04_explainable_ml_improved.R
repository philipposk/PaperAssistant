# Improved Explainable ML Model
# Logical feature selection, no log transforms, clear rationale

library(tidyverse)
library(here)
library(xgboost)
library(fastshap)

setwd(here("paper_a_analysis"))
set.seed(42)

data_dir <- here("paper_a_analysis", "data", "processed")
figures_dir <- here("paper_a_analysis", "figures")
tables_dir <- here("paper_a_analysis", "tables")

dir.create(figures_dir, showWarnings = FALSE)
dir.create(tables_dir, showWarnings = FALSE)

cat("=== IMPROVED EXPLAINABLE ML MODEL ===\n\n")

# Load data
data <- readRDS(file.path(data_dir, "obfcm_phevs_with_energies.rds"))
cat("Loaded", nrow(data), "records\n")

# Verify target variables
cat("\nTarget variable verification:\n")
cat("  EDSen_mech: ", sum(!is.na(data$EDSen_mech)), " records (range: ", 
    round(range(data$EDSen_mech, na.rm=TRUE)[1], 2), "-", 
    round(range(data$EDSen_mech, na.rm=TRUE)[2], 2), "%)\n")
cat("  EnTot_final100km: ", sum(!is.na(data$EnTot_final100km)), " records (mean: ", 
    round(mean(data$EnTot_final100km, na.rm=TRUE), 2), " kWh/100km)\n")
cat("  ✓ Using EnTot_final100km (final energy) as stated in paper\n\n")

# ============================================================================
# FEATURE SELECTION WITH CLEAR LOGIC
# ============================================================================

cat("=== FEATURE SELECTION RATIONALE ===\n\n")

# Group 1: Core vehicle specifications
# Rationale: Fundamental physical properties that directly affect energy consumption
core_specs <- c("Mass", "Electric_range", "Engine_power", "drive_battery_capacity_kwh")
cat("Group 1 - Core vehicle specifications:\n")
cat("  ", paste(core_specs, collapse=", "), "\n")
cat("  Rationale: Fundamental physical properties affecting energy consumption\n\n")

# Group 2: Engineered efficiency ratios
# Rationale: Capture design efficiency (range/mass, power/mass) rather than absolute values
# These ratios are physically meaningful and reduce multicollinearity
efficiency_ratios <- c("AER_to_Mass", "Power_to_Mass", "Battery_to_Mass")
cat("Group 2 - Engineered efficiency ratios:\n")
cat("  ", paste(efficiency_ratios, collapse=", "), "\n")
cat("  Rationale: Design efficiency metrics, reduce multicollinearity with mass\n\n")

# Group 3: Usage variable
# Rationale: Single usage metric (total mileage), captures trip patterns
# NO log transform - user feedback indicates log transforms give 0 importance
usage_var <- "Mileage_Tot"
cat("Group 3 - Usage variable:\n")
cat("  ", usage_var, "\n")
cat("  Rationale: Captures vehicle utilization patterns, no log transform\n\n")

# Group 4: Contextual variables
# Rationale: Infrastructure, climate, policy context
contextual <- c("Country", "Region", "Year", "segment", "Fuel_type")
cat("Group 4 - Contextual variables:\n")
cat("  ", paste(contextual, collapse=", "), "\n")
cat("  Rationale: Infrastructure, climate, policy, vehicle segment context\n\n")

# Prepare modeling dataset
model_data <- data %>%
  filter(!is.na(EDSen_mech) & !is.na(EnTot_final100km)) %>%
  filter(!is.na(Mass) & !is.na(Electric_range) & !is.na(Country)) %>%
  mutate(
    # Engineered features (physical relationships)
    AER_to_Mass = Electric_range / Mass,
    Power_to_Mass = Engine_power / Mass,
    Battery_to_Mass = drive_battery_capacity_kwh / Mass,
    # Encode categoricals
    Country_num = as.numeric(as.factor(Country)),
    Region_num = as.numeric(as.factor(Region)),
    Year_num = as.numeric(Year),
    segment_num = as.numeric(as.factor(segment)),
    Fuel_type_num = as.numeric(as.factor(Fuel_type))
  ) %>%
  filter_all(all_vars(!is.infinite(.))) %>%
  filter(!is.na(AER_to_Mass) & !is.na(Power_to_Mass) & !is.na(Battery_to_Mass))

cat("Clean records for modeling:", nrow(model_data), "\n\n")

# Final feature set (NO log transforms)
feature_cols <- c(core_specs, efficiency_ratios, usage_var, 
                  "Country_num", "Region_num", "Year_num", "segment_num", "Fuel_type_num")

cat("Total features:", length(feature_cols), "\n")
cat("Features:", paste(feature_cols, collapse=", "), "\n\n")

# ============================================================================
# MODEL TRAINING
# ============================================================================

train_idx <- sample(nrow(model_data), size = floor(0.8 * nrow(model_data)))

# Model 1: EDSen_mech
cat("=== MODEL 1: EDSen_mech ===\n")
X_eds <- as.matrix(model_data[train_idx, feature_cols])
y_eds_train <- model_data$EDSen_mech[train_idx]
X_eds_test <- as.matrix(model_data[-train_idx, feature_cols])
y_eds_test <- model_data$EDSen_mech[-train_idx]

xgb_eds <- xgboost(x = X_eds, y = y_eds_train, nrounds = 100, 
                   max_depth = 6, learning_rate = 0.1, 
                   objective = "reg:squarederror", verbose = 0)

pred_eds_test <- predict(xgb_eds, X_eds_test)
r2_eds_test <- 1 - sum((y_eds_test - pred_eds_test)^2) / sum((y_eds_test - mean(y_eds_test))^2)
rmse_eds_test <- sqrt(mean((y_eds_test - pred_eds_test)^2))

cat("  Test R²: ", round(r2_eds_test, 4), " (", round(r2_eds_test*100, 2), "%)\n")
cat("  Test RMSE: ", round(rmse_eds_test, 2), "%\n\n")

# Model 2: EnTot_final100km
cat("=== MODEL 2: EnTot_final100km ===\n")
X_energy <- as.matrix(model_data[train_idx, feature_cols])
y_energy_train <- model_data$EnTot_final100km[train_idx]
X_energy_test <- as.matrix(model_data[-train_idx, feature_cols])
y_energy_test <- model_data$EnTot_final100km[-train_idx]

xgb_energy <- xgboost(x = X_energy, y = y_energy_train, nrounds = 100,
                      max_depth = 6, learning_rate = 0.1, 
                      objective = "reg:squarederror", verbose = 0)

pred_energy_test <- predict(xgb_energy, X_energy_test)
r2_energy_test <- 1 - sum((y_energy_test - pred_energy_test)^2) / sum((y_energy_test - mean(y_energy_test))^2)
rmse_energy_test <- sqrt(mean((y_energy_test - pred_energy_test)^2))

cat("  Test R²: ", round(r2_energy_test, 4), " (", round(r2_energy_test*100, 2), "%)\n")
cat("  Test RMSE: ", round(rmse_energy_test, 2), " kWh/100km\n\n")

# Feature importance
cat("=== FEATURE IMPORTANCE ===\n\n")
importance_eds <- xgb.importance(model = xgb_eds)
importance_energy <- xgb.importance(model = xgb_energy)

cat("Top 10 features for EDSen_mech:\n")
print(head(importance_eds, 10))

cat("\nTop 10 features for EnTot_final100km:\n")
print(head(importance_energy, 10))

# Save results
write.csv(importance_eds, file.path(tables_dir, "table4_feature_importance_eds.csv"), row.names = FALSE)
write.csv(importance_energy, file.path(tables_dir, "table4_feature_importance_energy.csv"), row.names = FALSE)

cat("\n✅ Model training complete!\n")
cat("Results saved to tables/\n")
