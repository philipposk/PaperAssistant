#!/usr/bin/env Rscript
#==============================================================================
# R Package Checker for Figure Generation Script
# Checks if all required packages are installed and provides installation instructions
#==============================================================================

required_packages <- c(
  "ggplot2",
  "dplyr",
  "viridis",
  "scales",
  "gridExtra",
  "grid",
  "RColorBrewer",
  "patchwork"
)

check_package <- function(package_name) {
  if (requireNamespace(package_name, quietly = TRUE)) {
    return(TRUE)
  } else {
    return(FALSE)
  }
}

install_package <- function(package_name) {
  tryCatch({
    install.packages(package_name, repos = "https://cran.r-project.org", quiet = TRUE)
    return(TRUE)
  }, error = function(e) {
    return(FALSE)
  })
}

cat("=", rep("=", 59), "\n", sep = "")
cat("R Package Checker for Figure Generation\n")
cat("=", rep("=", 59), "\n", sep = "")
cat("\n")

missing_packages <- character(0)
installed_packages <- character(0)

cat("Checking required packages...\n")
cat("-", rep("-", 59), "\n", sep = "")

for (pkg in required_packages) {
  if (check_package(pkg)) {
    cat("✓", pkg, "is installed\n")
    installed_packages <- c(installed_packages, pkg)
  } else {
    cat("✗", pkg, "is NOT installed\n")
    missing_packages <- c(missing_packages, pkg)
  }
}

cat("\n")

if (length(missing_packages) > 0) {
  cat("=", rep("=", 59), "\n", sep = "")
  cat("MISSING PACKAGES DETECTED\n")
  cat("=", rep("=", 59), "\n", sep = "")
  cat("\n")
  cat("To install missing packages, run:\n")
  cat("\n")
  cat("  install.packages(c(", paste0('"', missing_packages, '"', collapse = ", "), "), repos = \"https://cran.r-project.org\")\n")
  cat("\n")
  cat("Or install individually:\n")
  for (pkg in missing_packages) {
    cat("  install.packages(\"", pkg, "\", repos = \"https://cran.r-project.org\")\n", sep = "")
  }
  cat("\n")
  
  # Ask if user wants to install automatically (only if interactive)
  if (interactive()) {
    response <- readline("Would you like to install missing packages now? (y/n): ")
    if (tolower(response) %in% c("y", "yes")) {
      cat("\n")
      cat("Installing packages...\n")
      for (pkg in missing_packages) {
        cat("Installing", pkg, "...")
        if (install_package(pkg)) {
          cat(" ✓ installed successfully\n")
        } else {
          cat(" ✗ installation failed\n")
        }
      }
      cat("\n")
      
      # Re-check
      cat("Re-checking packages...\n")
      still_missing <- character(0)
      for (pkg in missing_packages) {
        if (check_package(pkg)) {
          cat("✓", pkg, "is now installed\n")
        } else {
          cat("✗", pkg, "installation failed\n")
          still_missing <- c(still_missing, pkg)
        }
      }
      
      if (length(still_missing) > 0) {
        cat("\n")
        cat("Some packages failed to install. Please install manually:\n")
        cat("  install.packages(c(", paste0('"', still_missing, '"', collapse = ", "), "))\n")
        quit(status = 1)
      } else {
        cat("\n")
        cat("All packages are now installed!\n")
        quit(status = 0)
      }
    }
  }
  
  quit(status = 1)
} else {
  cat("=", rep("=", 59), "\n", sep = "")
  cat("✓ ALL REQUIRED PACKAGES ARE INSTALLED\n")
  cat("=", rep("=", 59), "\n", sep = "")
  cat("\n")
  cat("You can now run the figure generation script:\n")
  cat("  source(\"paper_a_analysis/11_create_final_figures_MARKOS_INSTRUCTIONS.R\")\n")
  cat("\n")
  quit(status = 0)
}
