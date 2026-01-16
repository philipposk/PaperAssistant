#!/usr/bin/env Rscript
#==============================================================================
# Create Final Figures Following Markos's Instructions (R/Windows Version)
# Based on transcript: หมู่บ้านประมงปากนาย.txt
# 
# Key requirements:
# - 2-13 figures total (max 12 for paper)
# - EDS figures BEFORE energy figures (better flow)
# - Information-dense figures with good color palettes
# - Recreate Markos's 3 screenshots as better quality figures
# - Windows compatible
#==============================================================================

# Load required libraries
suppressPackageStartupMessages({
  if (!require(ggplot2)) install.packages("ggplot2", repos = "https://cran.r-project.org")
  if (!require(dplyr)) install.packages("dplyr", repos = "https://cran.r-project.org")
  if (!require(viridis)) install.packages("viridis", repos = "https://cran.r-project.org")
  if (!require(scales)) install.packages("scales", repos = "https://cran.r-project.org")
  if (!require(gridExtra)) install.packages("gridExtra", repos = "https://cran.r-project.org")
  if (!require(grid)) install.packages("grid", repos = "https://cran.r-project.org")
  if (!require(RColorBrewer)) install.packages("RColorBrewer", repos = "https://cran.r-project.org")
  if (!require(patchwork)) install.packages("patchwork", repos = "https://cran.r-project.org")
  
  library(ggplot2)
  library(dplyr)
  library(viridis)
  library(scales)
  library(gridExtra)
  library(grid)
  library(RColorBrewer)
  library(patchwork)
})

# Set working directory and paths
script_dir <- dirname(rstudioapi::getActiveDocumentContext()$path)
if (length(script_dir) == 0 || script_dir == "") {
  script_dir <- getwd()
}
setwd(script_dir)

# Alternative method for getting script directory (works in Rscript)
if (interactive() == FALSE) {
  args <- commandArgs(trailingOnly = FALSE)
  file_arg <- "--file="
  match <- grep(file_arg, args)
  if (length(match) > 0) {
    script_dir <- dirname(sub(file_arg, "", args[match]))
    setwd(script_dir)
  }
}

fig_dir <- file.path(script_dir, "figures")
data_dir <- file.path(script_dir, "data", "processed")

if (!dir.exists(fig_dir)) dir.create(fig_dir, recursive = TRUE)

# Load data
cat("Loading data...\n")
data_file <- file.path(data_dir, "obfcm_phevs_unflagged.rds")
if (!file.exists(data_file)) {
  stop(paste("Data file not found:", data_file, "\nPlease check the path."))
}

phevs <- readRDS(data_file)
cat(sprintf("Loaded %d records\n", nrow(phevs)))

# Define color palettes (Markos wants good color palettes)
palette_eds <- viridis::viridis(100, option = "plasma")
palette_energy <- viridis::viridis(100, option = "magma")
palette_regional <- RColorBrewer::brewer.pal(4, "Set2")
names(palette_regional) <- c("Northern", "Central", "Southern", "Western")

# Set ggplot theme for consistent, professional look
theme_set(theme_minimal(base_size = 12) +
  theme(
    plot.title = element_text(size = 14, face = "bold", hjust = 0.5),
    plot.subtitle = element_text(size = 11, color = "gray40", hjust = 0.5),
    axis.text = element_text(size = 10),
    axis.title = element_text(size = 11, face = "bold"),
    legend.position = "bottom",
    panel.grid.minor = element_blank(),
    panel.grid.major = element_line(color = "gray90", linewidth = 0.3),
    plot.background = element_rect(fill = "white", color = NA),
    panel.background = element_rect(fill = "white", color = NA)
  ))

# Function to save figures
save_figure <- function(plot, filename, width = 12, height = 8, dpi = 300) {
  ggsave(
    filename = file.path(fig_dir, filename),
    plot = plot,
    width = width,
    height = height,
    dpi = dpi,
    units = "in",
    bg = "white"
  )
  cat(sprintf("Saved: %s\n", filename))
}

#==============================================================================
# FIGURE 1: EDS Distribution (Markos wants this FIRST)
#==============================================================================
cat("\nCreating Figure 1: EDS Distribution...\n")

# Calculate summary statistics
eds_median <- median(phevs$EDSen_mech, na.rm = TRUE)
eds_q25 <- quantile(phevs$EDSen_mech, 0.25, na.rm = TRUE)
eds_q75 <- quantile(phevs$EDSen_mech, 0.75, na.rm = TRUE)

fig1 <- ggplot(phevs, aes(x = EDSen_mech)) +
  geom_histogram(aes(y = after_stat(density)), bins = 100, 
                 fill = palette_eds[50], alpha = 0.7, color = "white", linewidth = 0.1) +
  geom_density(color = palette_eds[80], linewidth = 1.2) +
  geom_vline(aes(xintercept = eds_median), 
             color = "red", linetype = "dashed", linewidth = 1) +
  geom_vline(aes(xintercept = eds_q25), 
             color = "orange", linetype = "dashed", linewidth = 0.8) +
  geom_vline(aes(xintercept = eds_q75), 
             color = "orange", linetype = "dashed", linewidth = 0.8) +
  annotate("text", x = eds_median, y = Inf, label = sprintf("Median: %.1f%%", eds_median),
           vjust = 1.5, hjust = -0.1, color = "red", fontface = "bold", size = 3.5) +
  labs(
    title = "Electric Driving Share (EDS) Distribution",
    subtitle = paste("n =", format(nrow(phevs), big.mark = ","), "PHEV records |",
                     "Median:", sprintf("%.1f%%", eds_median),
                     "| IQR:", sprintf("%.1f-%.1f%%", eds_q25, eds_q75)),
    x = "Electric Driving Share (EDSen_mech, %)",
    y = "Density"
  )

save_figure(fig1, "figure01_eds_distribution.png", width = 10, height = 6)

#==============================================================================
# FIGURE 2: EDS by Country/Region (Information-dense)
#==============================================================================
cat("\nCreating Figure 2: EDS by Country...\n")

country_eds <- phevs %>%
  filter(!is.na(Country), !is.na(EDSen_mech)) %>%
  group_by(Country) %>%
  summarise(
    median_eds = median(EDSen_mech, na.rm = TRUE),
    q25_eds = quantile(EDSen_mech, 0.25, na.rm = TRUE),
    q75_eds = quantile(EDSen_mech, 0.75, na.rm = TRUE),
    n = n(),
    .groups = "drop"
  ) %>%
  arrange(desc(median_eds)) %>%
  head(15) %>%
  mutate(Country = factor(Country, levels = Country))

fig2 <- ggplot(country_eds, aes(x = Country, y = median_eds)) +
  geom_col(fill = palette_eds[60], alpha = 0.8, width = 0.7) +
  geom_errorbar(aes(ymin = q25_eds, ymax = q75_eds), 
                width = 0.3, color = "gray30", linewidth = 0.8) +
  geom_text(aes(label = sprintf("%.1f", median_eds)), 
            vjust = -0.5, size = 3, color = "gray20", fontface = "bold") +
  labs(
    title = "Electric Driving Share by Country",
    subtitle = paste("Median EDS with IQR bars | Top 15 countries by sample size"),
    x = "Country",
    y = "Median EDS (%)"
  ) +
  theme(axis.text.x = element_text(angle = 45, hjust = 1, size = 9))

save_figure(fig2, "figure02_eds_by_country.png", width = 14, height = 7)

#==============================================================================
# FIGURE 3: EDS Density Plot with Timeline (Recreating Markos's Screenshot 1)
#==============================================================================
cat("\nCreating Figure 3: EDS Density Plot with Timeline...\n")

# Create period variable if year exists
if ("year" %in% names(phevs)) {
  phevs$period <- as.factor(phevs$year)
} else {
  phevs$period <- "2021-2023"
}

# EDS density plot by period
eds_by_period <- phevs %>%
  filter(!is.na(EDSen_mech), !is.na(period)) %>%
  group_by(period) %>%
  summarise(
    median_eds = median(EDSen_mech, na.rm = TRUE),
    mean_eds = mean(EDSen_mech, na.rm = TRUE),
    n = n(),
    .groups = "drop"
  )

p1 <- ggplot(phevs %>% filter(!is.na(EDSen_mech)), 
             aes(x = EDSen_mech, fill = period, color = period)) +
  geom_density(alpha = 0.6, adjust = 1.5, linewidth = 0.8) +
  scale_fill_viridis_d(option = "plasma", name = "Period", guide = "legend") +
  scale_color_viridis_d(option = "plasma", name = "Period", guide = "legend") +
  labs(
    title = "EDS Distribution Over Time",
    x = "Electric Driving Share (%)",
    y = "Density"
  ) +
  theme(legend.position = "bottom")

p2 <- ggplot(eds_by_period, aes(x = period, y = median_eds, group = 1)) +
  geom_line(color = palette_eds[70], linewidth = 1.5) +
  geom_point(size = 4, color = palette_eds[70], fill = "white", shape = 21, stroke = 2) +
  geom_text(aes(label = sprintf("%.1f%%", median_eds)), 
            vjust = -1, size = 3.5, color = "gray30", fontface = "bold") +
  labs(
    title = "Median EDS Timeline",
    x = "Period",
    y = "Median EDS (%)"
  ) +
  expand_limits(y = 0)

fig3 <- p1 / p2 + 
  plot_layout(heights = c(2, 1)) +
  plot_annotation(title = "EDS Distribution and Temporal Trends",
                  theme = theme(plot.title = element_text(size = 16, face = "bold", hjust = 0.5)))

save_figure(fig3, "figure03_eds_density_timeline.png", width = 12, height = 10)

#==============================================================================
# FIGURE 4: EDS vs Key Variables (Information-dense scatter)
#==============================================================================
cat("\nCreating Figure 4: EDS vs Key Variables...\n")

# Sample data for faster plotting
set.seed(42)
sample_data <- phevs %>% 
  filter(!is.na(EDSen_mech)) %>%
  sample_n(min(50000, nrow(.)))

# EDS vs Electric Range
p1 <- ggplot(sample_data %>% filter(!is.na(Electric_range)), 
             aes(x = Electric_range, y = EDSen_mech)) +
  geom_point(alpha = 0.2, color = palette_eds[50], size = 0.5) +
  geom_smooth(method = "gam", color = palette_eds[80], linewidth = 1.2, se = TRUE,
              fill = palette_eds[70], alpha = 0.3) +
  labs(
    title = "EDS vs Electric Range",
    x = "Electric Range (km)",
    y = "EDS (%)"
  )

# EDS vs Total Mileage
p2 <- ggplot(sample_data %>% filter(!is.na(Mileage_Tot), Mileage_Tot > 0), 
             aes(x = Mileage_Tot, y = EDSen_mech)) +
  geom_point(alpha = 0.2, color = palette_eds[50], size = 0.5) +
  geom_smooth(method = "gam", color = palette_eds[80], linewidth = 1.2, se = TRUE,
              fill = palette_eds[70], alpha = 0.3) +
  scale_x_log10(labels = scales::comma) +
  labs(
    title = "EDS vs Total Mileage",
    x = "Total Mileage (km, log scale)",
    y = "EDS (%)"
  )

# EDS vs Mass
p3 <- ggplot(sample_data %>% filter(!is.na(Mass)), 
             aes(x = Mass, y = EDSen_mech)) +
  geom_point(alpha = 0.2, color = palette_eds[50], size = 0.5) +
  geom_smooth(method = "gam", color = palette_eds[80], linewidth = 1.2, se = TRUE,
              fill = palette_eds[70], alpha = 0.3) +
  labs(
    title = "EDS vs Vehicle Mass",
    x = "Mass (kg)",
    y = "EDS (%)"
  )

# EDS vs AER/Mass ratio
if ("AER_to_Mass" %in% names(sample_data)) {
  p4 <- ggplot(sample_data %>% filter(!is.na(AER_to_Mass)), 
               aes(x = AER_to_Mass, y = EDSen_mech)) +
    geom_point(alpha = 0.2, color = palette_eds[50], size = 0.5) +
    geom_smooth(method = "gam", color = palette_eds[80], linewidth = 1.2, se = TRUE,
                fill = palette_eds[70], alpha = 0.3) +
    labs(
      title = "EDS vs AER/Mass Ratio",
      x = "AER/Mass (km/kg)",
      y = "EDS (%)"
    )
} else {
  p4 <- ggplot() + 
    annotate("text", x = 0.5, y = 0.5, label = "AER/Mass not available", 
             size = 5, hjust = 0.5, vjust = 0.5) +
    theme_void()
}

fig4 <- (p1 | p2) / (p3 | p4) +
  plot_annotation(title = "EDS Relationships with Key Variables",
                  theme = theme(plot.title = element_text(size = 14, face = "bold", hjust = 0.5)))

save_figure(fig4, "figure04_eds_correlates.png", width = 14, height = 10)

#==============================================================================
# FIGURE 5: Energy Split vs EDS (After EDS figures, as Markos requested)
#==============================================================================
cat("\nCreating Figure 5: Energy Split vs EDS...\n")

# Sample for plotting
set.seed(42)
sample_data <- phevs %>%
  filter(!is.na(EDSen_mech), !is.na(EnTot_final100km), 
         !is.na(EnICE_final100km), !is.na(EnEl_final100km)) %>%
  sample_n(min(100000, nrow(.)))

# Create bins for EDS
sample_data$eds_bin <- cut(sample_data$EDSen_mech, 
                           breaks = seq(0, 100, by = 5), 
                           labels = seq(2.5, 97.5, by = 5),
                           include.lowest = TRUE)

energy_by_eds <- sample_data %>%
  filter(!is.na(eds_bin)) %>%
  group_by(eds_bin) %>%
  summarise(
    median_total = median(EnTot_final100km, na.rm = TRUE),
    median_ice = median(EnICE_final100km, na.rm = TRUE),
    median_el = median(EnEl_final100km, na.rm = TRUE),
    q25_total = quantile(EnTot_final100km, 0.25, na.rm = TRUE),
    q75_total = quantile(EnTot_final100km, 0.75, na.rm = TRUE),
    .groups = "drop"
  ) %>%
  mutate(eds_center = as.numeric(as.character(eds_bin)))

fig5 <- ggplot(energy_by_eds, aes(x = eds_center)) +
  geom_ribbon(aes(ymin = median_ice, ymax = median_total), 
              fill = palette_energy[30], alpha = 0.6) +
  geom_ribbon(aes(ymin = 0, ymax = median_ice), 
              fill = palette_energy[70], alpha = 0.6) +
  geom_line(aes(y = median_total), color = "black", linewidth = 1.2) +
  geom_line(aes(y = median_ice), color = palette_energy[50], linewidth = 1, linetype = "dashed") +
  geom_line(aes(y = median_el), color = palette_energy[90], linewidth = 1, linetype = "dashed") +
  labs(
    title = "Energy Split vs Electric Driving Share",
    subtitle = "Stacked area showing ICE (red) and Electric (purple) energy contributions",
    x = "Electric Driving Share (%)",
    y = "Energy Consumption (kWh/100 km)",
    fill = "Energy Type"
  )

save_figure(fig5, "figure05_energy_split_vs_eds.png", width = 12, height = 8)

#==============================================================================
# FIGURE 6: Total Energy Distribution
#==============================================================================
cat("\nCreating Figure 6: Total Energy Distribution...\n")

energy_median <- median(phevs$EnTot_final100km, na.rm = TRUE)
energy_q25 <- quantile(phevs$EnTot_final100km, 0.25, na.rm = TRUE)
energy_q75 <- quantile(phevs$EnTot_final100km, 0.75, na.rm = TRUE)

fig6 <- ggplot(phevs, aes(x = EnTot_final100km)) +
  geom_histogram(aes(y = after_stat(density)), bins = 100, 
                 fill = palette_energy[50], alpha = 0.7, color = "white", linewidth = 0.1) +
  geom_density(color = palette_energy[80], linewidth = 1.2) +
  geom_vline(aes(xintercept = energy_median), 
             color = "red", linetype = "dashed", linewidth = 1) +
  geom_vline(aes(xintercept = energy_q25), 
             color = "orange", linetype = "dashed", linewidth = 0.8) +
  geom_vline(aes(xintercept = energy_q75), 
             color = "orange", linetype = "dashed", linewidth = 0.8) +
  annotate("text", x = energy_median, y = Inf, 
           label = sprintf("Median: %.1f kWh/100km", energy_median),
           vjust = 1.5, hjust = -0.1, color = "red", fontface = "bold", size = 3.5) +
  labs(
    title = "Total Energy Consumption Distribution",
    subtitle = paste("n =", format(nrow(phevs), big.mark = ","), 
                     "| Median:", sprintf("%.1f kWh/100km", energy_median),
                     "| IQR:", sprintf("%.1f-%.1f", energy_q25, energy_q75)),
    x = "Total Energy (kWh/100 km)",
    y = "Density"
  )

save_figure(fig6, "figure06_total_energy_distribution.png", width = 10, height = 6)

#==============================================================================
# FIGURE 7: Energy vs Mass by EDS (Information-dense heatmap style)
#==============================================================================
cat("\nCreating Figure 7: Energy vs Mass by EDS...\n")

# Create bins for mass and EDS
set.seed(42)
sample_data <- phevs %>%
  filter(!is.na(Mass), !is.na(EDSen_mech), !is.na(EnTot_final100km)) %>%
  sample_n(min(100000, nrow(.)))

sample_data$mass_bin <- cut(sample_data$Mass, breaks = 20, include.lowest = TRUE)
sample_data$eds_bin2 <- cut(sample_data$EDSen_mech, breaks = 20, include.lowest = TRUE)

energy_heatmap <- sample_data %>%
  filter(!is.na(mass_bin), !is.na(eds_bin2)) %>%
  group_by(mass_bin, eds_bin2) %>%
  summarise(
    median_energy = median(EnTot_final100km, na.rm = TRUE),
    n = n(),
    .groups = "drop"
  ) %>%
  mutate(
    mass_center = as.numeric(sub(".*,([0-9.]+)\\]", "\\1", as.character(mass_bin))),
    eds_center = as.numeric(sub(".*,([0-9.]+)\\]", "\\1", as.character(eds_bin2)))
  )

fig7 <- ggplot(energy_heatmap, aes(x = eds_center, y = mass_center, fill = median_energy)) +
  geom_tile() +
  scale_fill_viridis_c(option = "magma", name = "Energy\n(kWh/100km)") +
  labs(
    title = "Energy Consumption Heatmap: Mass vs EDS",
    subtitle = "Darker colors = higher energy consumption",
    x = "Electric Driving Share (%)",
    y = "Vehicle Mass (kg)"
  )

save_figure(fig7, "figure07_energy_heatmap_mass_eds.png", width = 12, height = 8)

#==============================================================================
# FIGURE 8: Regional Energy Comparison (Recreating Markos's Screenshot 2)
#==============================================================================
cat("\nCreating Figure 8: Regional Energy Comparison...\n")

if ("Region" %in% names(phevs)) {
  regional_energy <- phevs %>%
    filter(!is.na(Region), !is.na(EnTot_final100km), !is.na(EDSen_mech)) %>%
    group_by(Region) %>%
    summarise(
      median_energy = median(EnTot_final100km, na.rm = TRUE),
      median_eds = median(EDSen_mech, na.rm = TRUE),
      median_ice = median(EnICE_final100km, na.rm = TRUE),
      median_el = median(EnEl_final100km, na.rm = TRUE),
      q25_energy = quantile(EnTot_final100km, 0.25, na.rm = TRUE),
      q75_energy = quantile(EnTot_final100km, 0.75, na.rm = TRUE),
      n = n(),
      .groups = "drop"
    )
  
  p1 <- ggplot(regional_energy, aes(x = Region, y = median_energy, fill = Region)) +
    geom_col(alpha = 0.8, width = 0.7) +
    geom_errorbar(aes(ymin = q25_energy, ymax = q75_energy), 
                  width = 0.3, linewidth = 0.8, color = "gray30") +
    geom_text(aes(label = sprintf("%.1f", median_energy)),
              vjust = -0.5, size = 3.5, fontface = "bold") +
    scale_fill_manual(values = palette_regional, guide = "none") +
    labs(
      title = "Total Energy Consumption by Region",
      x = "Region",
      y = "Median Energy (kWh/100 km)"
    ) +
    theme(axis.text.x = element_text(angle = 45, hjust = 1))
  
  p2 <- ggplot(regional_energy, aes(x = Region, y = median_eds, fill = Region)) +
    geom_col(alpha = 0.8, width = 0.7) +
    geom_text(aes(label = sprintf("%.1f%%", median_eds)),
              vjust = -0.5, size = 3.5, fontface = "bold") +
    scale_fill_manual(values = palette_regional, guide = "none") +
    labs(
      title = "Median EDS by Region",
      x = "Region",
      y = "Median EDS (%)"
    ) +
    theme(axis.text.x = element_text(angle = 45, hjust = 1))
  
  fig8 <- p1 | p2 +
    plot_annotation(title = "Regional Patterns: Energy and EDS",
                    theme = theme(plot.title = element_text(size = 14, face = "bold", hjust = 0.5)))
  
  save_figure(fig8, "figure08_regional_comparison.png", width = 14, height = 7)
} else {
  cat("Region variable not found, skipping Figure 8\n")
}

#==============================================================================
# FIGURE 9: EDS Density Plot with Material Space Below (Markos's Screenshot 3)
#==============================================================================
cat("\nCreating Figure 9: EDS Density with Mass Category...\n")

# Create mass categories
phevs$mass_cat <- cut(phevs$Mass, 
                      breaks = c(0, 1600, 2000, Inf),
                      labels = c("Light (<1600 kg)", "Medium (1600-2000 kg)", "Heavy (≥2000 kg)"),
                      include.lowest = TRUE)

mass_data <- phevs %>% filter(!is.na(mass_cat), !is.na(EDSen_mech))

p_top <- ggplot(mass_data, aes(x = EDSen_mech, fill = mass_cat, color = mass_cat)) +
  geom_density(alpha = 0.6, adjust = 1.5, linewidth = 0.8) +
  scale_fill_brewer(palette = "Set2", name = "Mass Category") +
  scale_color_brewer(palette = "Set2", name = "Mass Category") +
  labs(
    title = "EDS Distribution by Vehicle Mass Category",
    x = "Electric Driving Share (%)",
    y = "Density"
  ) +
  theme(legend.position = "bottom")

# Bottom panel: Summary statistics by mass category
mass_summary <- mass_data %>%
  group_by(mass_cat) %>%
  summarise(
    median_eds = median(EDSen_mech, na.rm = TRUE),
    median_energy = median(EnTot_final100km, na.rm = TRUE),
    median_mass = median(Mass, na.rm = TRUE),
    n = n(),
    .groups = "drop"
  )

p_bottom <- ggplot(mass_summary, aes(x = mass_cat)) +
  geom_col(aes(y = median_eds), fill = palette_eds[60], alpha = 0.8, width = 0.6) +
  geom_col(aes(y = median_energy/10), fill = palette_energy[50], alpha = 0.6, width = 0.4, 
           position = position_nudge(x = 0.2)) +
  scale_y_continuous(
    name = "Median EDS (%)",
    sec.axis = sec_axis(~ . * 10, name = "Median Energy (kWh/100 km)")
  ) +
  geom_text(aes(y = median_eds, label = sprintf("%.1f%%", median_eds)), 
            vjust = -0.5, size = 3.5, color = "gray30", fontface = "bold") +
  labs(
    title = "Summary Statistics by Mass Category",
    x = "Mass Category",
    subtitle = "Bars: EDS (left axis, wide) | Energy (right axis, narrow)"
  ) +
  theme(axis.text.x = element_text(angle = 45, hjust = 1))

fig9 <- p_top / p_bottom + 
  plot_layout(heights = c(2, 1)) +
  plot_annotation(title = "EDS Patterns by Vehicle Mass Category",
                  theme = theme(plot.title = element_text(size = 14, face = "bold", hjust = 0.5)))

save_figure(fig9, "figure09_eds_density_mass_category.png", width = 12, height = 10)

#==============================================================================
# Summary
#==============================================================================
cat("\n", rep("=", 60), "\n")
cat("Figure Generation Complete!\n")
cat(rep("=", 60), "\n")
cat(sprintf("Figures saved to: %s\n", fig_dir))
cat("\nGenerated figures:\n")
cat("  1. EDS Distribution\n")
cat("  2. EDS by Country\n")
cat("  3. EDS Density with Timeline\n")
cat("  4. EDS vs Key Variables\n")
cat("  5. Energy Split vs EDS\n")
cat("  6. Total Energy Distribution\n")
cat("  7. Energy Heatmap (Mass vs EDS)\n")
cat("  8. Regional Comparison\n")
cat("  9. EDS Density by Mass Category\n")
cat("\nFigures follow Markos's instructions:\n")
cat("  - EDS figures come before energy figures\n")
cat("  - Information-dense with good color palettes\n")
cat("  - Recreated Markos's 3 screenshot concepts\n")
cat("  - Windows compatible\n")
cat("\n")
