#!/usr/bin/env python3
#==============================================================================
# Create Final Figures Following Markos's Instructions (Python/Windows version)
# Based on transcript: หมู่บ้านประมงปากนาย.txt
# 
# Key requirements:
# - 2-13 figures total (max 12 for paper)
# - EDS figures BEFORE energy figures (better flow)
# - Information-dense figures with good color palettes
# - Recreate Markos's 3 screenshots as better quality figures
#==============================================================================

import os
import sys
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import pickle

# Set style
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")

# Set working directory
script_dir = Path(__file__).parent.absolute()
os.chdir(script_dir)

fig_dir = script_dir / "figures"
data_dir = script_dir / "data" / "processed"

fig_dir.mkdir(exist_ok=True, parents=True)

# Load data
print("Loading data...")
data_file = data_dir / "obfcm_phevs_unflagged.rds"

if not data_file.exists():
    # Try alternative path
    data_file = data_dir / "obfcm_phevs_unflagged.pkl"
    if data_file.exists():
        with open(data_file, 'rb') as f:
            phevs = pickle.load(f)
    else:
        print(f"Error: Data file not found at {data_file}")
        sys.exit(1)
else:
    # RDS files need R to read, so convert first or use pandas with pyreadr
    try:
        import pyreadr
        result = pyreadr.read_r(str(data_file))
        phevs = result[list(result.keys())[0]]
    except ImportError:
        print("pyreadr not installed. Install with: pip install pyreadr")
        print("Or convert RDS to CSV/PKL first")
        sys.exit(1)

print(f"Loaded {len(phevs)} records")

# Define color palettes
palette_eds = sns.color_palette("plasma", 100)
palette_energy = sns.color_palette("magma", 100)
palette_regional = sns.color_palette("Set2", 4)

# Function to save figures
def save_figure(fig, filename, dpi=300):
    """Save figure with consistent settings"""
    filepath = fig_dir / filename
    fig.savefig(filepath, dpi=dpi, bbox_inches='tight', facecolor='white')
    print(f"Saved: {filename}")

#==============================================================================
# FIGURE 1: EDS Distribution (Markos wants this FIRST)
#==============================================================================
print("\nCreating Figure 1: EDS Distribution...")

fig, ax = plt.subplots(figsize=(10, 6))

# Remove NaN values
eds_data = phevs['EDSen_mech'].dropna()

# Histogram
ax.hist(eds_data, bins=100, density=True, alpha=0.7, 
        color=palette_eds[50], edgecolor='white', linewidth=0.1)

# Density curve
from scipy import stats
kde = stats.gaussian_kde(eds_data)
x_range = np.linspace(eds_data.min(), eds_data.max(), 200)
ax.plot(x_range, kde(x_range), color=palette_eds[80], linewidth=1.5)

# Median and quartiles
median_val = eds_data.median()
q25 = eds_data.quantile(0.25)
q75 = eds_data.quantile(0.75)

ax.axvline(median_val, color='red', linestyle='--', linewidth=1, label=f'Median: {median_val:.1f}%')
ax.axvline(q25, color='orange', linestyle='--', linewidth=0.8)
ax.axvline(q75, color='orange', linestyle='--', linewidth=0.8)

ax.set_xlabel('Electric Driving Share (EDSen_mech, %)', fontsize=11, fontweight='bold')
ax.set_ylabel('Density', fontsize=11, fontweight='bold')
ax.set_title(f'Electric Driving Share (EDS) Distribution\n'
             f'n = {len(phevs):,} PHEV records | Median: {median_val:.1f}% | '
             f'IQR: {q25:.1f}-{q75:.1f}%', 
             fontsize=13, fontweight='bold')
ax.legend()
ax.grid(alpha=0.3)

save_figure(fig, "figure01_eds_distribution.png")

#==============================================================================
# FIGURE 2: EDS by Country/Region (Information-dense)
#==============================================================================
print("\nCreating Figure 2: EDS by Country...")

country_eds = phevs.groupby('Country')['EDSen_mech'].agg([
    ('median_eds', 'median'),
    ('q25_eds', lambda x: x.quantile(0.25)),
    ('q75_eds', lambda x: x.quantile(0.75)),
    ('n', 'count')
]).reset_index()

country_eds = country_eds.sort_values('median_eds', ascending=False).head(15)

fig, ax = plt.subplots(figsize=(14, 7))

x_pos = np.arange(len(country_eds))
bars = ax.bar(x_pos, country_eds['median_eds'], 
              color=palette_eds[60], alpha=0.8)

# Error bars for IQR
ax.errorbar(x_pos, country_eds['median_eds'],
            yerr=[country_eds['median_eds'] - country_eds['q25_eds'],
                  country_eds['q75_eds'] - country_eds['median_eds']],
            fmt='none', color='gray30', linewidth=0.5, capsize=3)

# Add value labels
for i, (idx, row) in enumerate(country_eds.iterrows()):
    ax.text(i, row['median_eds'] + 1, f"{row['median_eds']:.1f}",
            ha='center', va='bottom', fontsize=9, color='gray20')

ax.set_xticks(x_pos)
ax.set_xticklabels(country_eds['Country'], rotation=45, ha='right', fontsize=9)
ax.set_ylabel('Median EDS (%)', fontsize=11, fontweight='bold')
ax.set_title('Electric Driving Share by Country\n'
             'Median EDS with IQR bars | Top 15 countries by sample size',
             fontsize=13, fontweight='bold')
ax.grid(axis='y', alpha=0.3)

save_figure(fig, "figure02_eds_by_country.png")

#==============================================================================
# FIGURE 3: EDS Density Plot with Timeline (Recreating Markos's Screenshot 1)
#==============================================================================
print("\nCreating Figure 3: EDS Density with Timeline...")

# Create period variable if year exists
if 'year' in phevs.columns:
    phevs['period'] = phevs['year'].astype(str)
else:
    phevs['period'] = '2021-2023'

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 10), 
                                gridspec_kw={'height_ratios': [2, 1]})

# Top panel: Density by period
periods = phevs['period'].unique()
for period in periods:
    eds_period = phevs[phevs['period'] == period]['EDSen_mech'].dropna()
    if len(eds_period) > 0:
        ax1.hist(eds_period, bins=50, density=True, alpha=0.6, 
                label=f'Period {period}', histtype='step', linewidth=1.5)

ax1.set_xlabel('Electric Driving Share (%)', fontsize=11, fontweight='bold')
ax1.set_ylabel('Density', fontsize=11, fontweight='bold')
ax1.set_title('EDS Distribution Over Time', fontsize=12, fontweight='bold')
ax1.legend()
ax1.grid(alpha=0.3)

# Bottom panel: Timeline
eds_by_period = phevs.groupby('period')['EDSen_mech'].agg([
    ('median_eds', 'median'),
    ('mean_eds', 'mean'),
    ('n', 'count')
]).reset_index()

ax2.plot(range(len(eds_by_period)), eds_by_period['median_eds'], 
         color=palette_eds[70], linewidth=1.5, marker='o', markersize=6)
ax2.set_xticks(range(len(eds_by_period)))
ax2.set_xticklabels(eds_by_period['period'], rotation=45, ha='right')
ax2.set_ylabel('Median EDS (%)', fontsize=11, fontweight='bold')
ax2.set_title('Median EDS Timeline', fontsize=12, fontweight='bold')
ax2.grid(alpha=0.3)

# Add value labels
for i, row in eds_by_period.iterrows():
    ax2.text(i, row['median_eds'] + 1, f"{row['median_eds']:.1f}%",
            ha='center', va='bottom', fontsize=9, color='gray30')

fig.suptitle('EDS Distribution and Temporal Trends', 
             fontsize=14, fontweight='bold', y=0.98)

plt.tight_layout()
save_figure(fig, "figure03_eds_density_timeline.png")

#==============================================================================
# FIGURE 4: EDS vs Key Variables (Information-dense scatter)
#==============================================================================
print("\nCreating Figure 4: EDS vs Key Variables...")

fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# Sample data for faster plotting
sample_data = phevs.sample(min(50000, len(phevs)))

# EDS vs Electric Range
ax = axes[0, 0]
ax.scatter(sample_data['Electric_range'], sample_data['EDSen_mech'],
          alpha=0.3, s=0.5, color=palette_eds[50])
z = np.polyfit(sample_data['Electric_range'].dropna(), 
               sample_data.loc[sample_data['Electric_range'].notna(), 'EDSen_mech'],
               1)
p = np.poly1d(z)
x_range = np.linspace(sample_data['Electric_range'].min(), 
                      sample_data['Electric_range'].max(), 100)
ax.plot(x_range, p(x_range), color=palette_eds[80], linewidth=1.5)
ax.set_xlabel('Electric Range (km)', fontsize=10)
ax.set_ylabel('EDS (%)', fontsize=10)
ax.set_title('EDS vs Electric Range', fontsize=11)
ax.grid(alpha=0.3)

# EDS vs Total Mileage
ax = axes[0, 1]
mileage_data = sample_data[['Mileage_Tot', 'EDSen_mech']].dropna()
ax.scatter(mileage_data['Mileage_Tot'], mileage_data['EDSen_mech'],
          alpha=0.3, s=0.5, color=palette_eds[50])
ax.set_xscale('log')
z = np.polyfit(np.log10(mileage_data['Mileage_Tot']), 
               mileage_data['EDSen_mech'], 1)
x_range_log = np.logspace(np.log10(mileage_data['Mileage_Tot'].min()),
                          np.log10(mileage_data['Mileage_Tot'].max()), 100)
ax.plot(x_range_log, z[0]*np.log10(x_range_log) + z[1], 
        color=palette_eds[80], linewidth=1.5)
ax.set_xlabel('Total Mileage (km, log scale)', fontsize=10)
ax.set_ylabel('EDS (%)', fontsize=10)
ax.set_title('EDS vs Total Mileage', fontsize=11)
ax.grid(alpha=0.3)

# EDS vs Mass
ax = axes[1, 0]
mass_data = sample_data[['Mass', 'EDSen_mech']].dropna()
ax.scatter(mass_data['Mass'], mass_data['EDSen_mech'],
          alpha=0.3, s=0.5, color=palette_eds[50])
z = np.polyfit(mass_data['Mass'], mass_data['EDSen_mech'], 1)
x_range = np.linspace(mass_data['Mass'].min(), mass_data['Mass'].max(), 100)
ax.plot(x_range, p(x_range), color=palette_eds[80], linewidth=1.5)
ax.set_xlabel('Mass (kg)', fontsize=10)
ax.set_ylabel('EDS (%)', fontsize=10)
ax.set_title('EDS vs Vehicle Mass', fontsize=11)
ax.grid(alpha=0.3)

# EDS vs AER/Mass ratio (if available)
ax = axes[1, 1]
if 'AER_to_Mass' in sample_data.columns:
    aer_data = sample_data[['AER_to_Mass', 'EDSen_mech']].dropna()
    ax.scatter(aer_data['AER_to_Mass'], aer_data['EDSen_mech'],
              alpha=0.3, s=0.5, color=palette_eds[50])
    z = np.polyfit(aer_data['AER_to_Mass'], aer_data['EDSen_mech'], 1)
    x_range = np.linspace(aer_data['AER_to_Mass'].min(), 
                          aer_data['AER_to_Mass'].max(), 100)
    ax.plot(x_range, p(x_range), color=palette_eds[80], linewidth=1.5)
    ax.set_xlabel('AER/Mass (km/kg)', fontsize=10)
    ax.set_ylabel('EDS (%)', fontsize=10)
    ax.set_title('EDS vs AER/Mass Ratio', fontsize=11)
else:
    ax.text(0.5, 0.5, 'AER/Mass not available', ha='center', va='center')
    ax.set_title('AER/Mass Ratio', fontsize=11)
ax.grid(alpha=0.3)

fig.suptitle('EDS Relationships with Key Variables', 
             fontsize=14, fontweight='bold')
plt.tight_layout()
save_figure(fig, "figure04_eds_correlates.png")

#==============================================================================
# FIGURE 5: Energy Split vs EDS (After EDS figures, as Markos requested)
#==============================================================================
print("\nCreating Figure 5: Energy Split vs EDS...")

sample_data = phevs[['EDSen_mech', 'EnTot_final100km', 'EnICE_final100km', 
                     'EnEl_final100km']].dropna().sample(min(100000, len(phevs)))

# Create bins for EDS
sample_data['eds_bin'] = pd.cut(sample_data['EDSen_mech'], 
                                bins=20, 
                                labels=range(20))

energy_by_eds = sample_data.groupby('eds_bin', observed=True).agg({
    'EnTot_final100km': 'median',
    'EnICE_final100km': 'median',
    'EnEl_final100km': 'median'
}).reset_index()

# Convert bin labels to numeric centers
energy_by_eds['eds_center'] = pd.cut(sample_data['EDSen_mech'], bins=20).apply(
    lambda x: x.mid if pd.notna(x) else np.nan
).drop_duplicates().values[:len(energy_by_eds)]

fig, ax = plt.subplots(figsize=(12, 8))

# Stacked area
ax.fill_between(energy_by_eds['eds_center'], 
                energy_by_eds['EnICE_final100km'],
                energy_by_eds['EnTot_final100km'],
                alpha=0.6, color=palette_energy[30], label='ICE Energy')
ax.fill_between(energy_by_eds['eds_center'], 
                0,
                energy_by_eds['EnICE_final100km'],
                alpha=0.6, color=palette_energy[70], label='Electric Energy')

# Lines
ax.plot(energy_by_eds['eds_center'], energy_by_eds['EnTot_final100km'],
        color='black', linewidth=1.5, label='Total Energy')
ax.plot(energy_by_eds['eds_center'], energy_by_eds['EnICE_final100km'],
        color=palette_energy[50], linewidth=1, linestyle='--')
ax.plot(energy_by_eds['eds_center'], energy_by_eds['EnEl_final100km'],
        color=palette_energy[90], linewidth=1, linestyle='--')

ax.set_xlabel('Electric Driving Share (%)', fontsize=12, fontweight='bold')
ax.set_ylabel('Energy Consumption (kWh/100 km)', fontsize=12, fontweight='bold')
ax.set_title('Energy Split vs Electric Driving Share\n'
             'Stacked area showing ICE (red) and Electric (purple) energy contributions',
             fontsize=13, fontweight='bold')
ax.legend()
ax.grid(alpha=0.3)

save_figure(fig, "figure05_energy_split_vs_eds.png")

#==============================================================================
# FIGURE 6: Total Energy Distribution
#==============================================================================
print("\nCreating Figure 6: Total Energy Distribution...")

fig, ax = plt.subplots(figsize=(10, 6))

energy_data = phevs['EnTot_final100km'].dropna()

ax.hist(energy_data, bins=100, density=True, alpha=0.7,
        color=palette_energy[50], edgecolor='white', linewidth=0.1)

# Density curve
kde = stats.gaussian_kde(energy_data)
x_range = np.linspace(energy_data.min(), energy_data.max(), 200)
ax.plot(x_range, kde(x_range), color=palette_energy[80], linewidth=1.5)

# Median and quartiles
median_val = energy_data.median()
q25 = energy_data.quantile(0.25)
q75 = energy_data.quantile(0.75)

ax.axvline(median_val, color='red', linestyle='--', linewidth=1,
           label=f'Median: {median_val:.1f} kWh/100km')
ax.axvline(q25, color='orange', linestyle='--', linewidth=0.8)
ax.axvline(q75, color='orange', linestyle='--', linewidth=0.8)

ax.set_xlabel('Total Energy (kWh/100 km)', fontsize=11, fontweight='bold')
ax.set_ylabel('Density', fontsize=11, fontweight='bold')
ax.set_title(f'Total Energy Consumption Distribution\n'
             f'n = {len(phevs):,} | Median: {median_val:.1f} kWh/100km | '
             f'IQR: {q25:.1f}-{q75:.1f}',
             fontsize=13, fontweight='bold')
ax.legend()
ax.grid(alpha=0.3)

save_figure(fig, "figure06_total_energy_distribution.png")

#==============================================================================
# FIGURE 7: Energy vs Mass by EDS (Information-dense heatmap style)
#==============================================================================
print("\nCreating Figure 7: Energy Heatmap (Mass vs EDS)...")

sample_data = phevs[['Mass', 'EDSen_mech', 'EnTot_final100km']].dropna().sample(
    min(100000, len(phevs)))

# Create bins
sample_data['mass_bin'] = pd.cut(sample_data['Mass'], bins=20)
sample_data['eds_bin'] = pd.cut(sample_data['EDSen_mech'], bins=20)

energy_heatmap = sample_data.groupby(['mass_bin', 'eds_bin'], observed=True).agg({
    'EnTot_final100km': 'median'
}).reset_index()

# Extract bin centers
energy_heatmap['mass_center'] = energy_heatmap['mass_bin'].apply(
    lambda x: x.mid if pd.notna(x) else np.nan
)
energy_heatmap['eds_center'] = energy_heatmap['eds_bin'].apply(
    lambda x: x.mid if pd.notna(x) else np.nan
)

# Pivot for heatmap
heatmap_pivot = energy_heatmap.pivot(index='mass_center', 
                                     columns='eds_center',
                                     values='EnTot_final100km')

fig, ax = plt.subplots(figsize=(12, 8))

sns.heatmap(heatmap_pivot, cmap='magma', cbar_kws={'label': 'Energy (kWh/100km)'},
            ax=ax, linewidths=0, rasterized=True)

ax.set_xlabel('Electric Driving Share (%)', fontsize=12, fontweight='bold')
ax.set_ylabel('Vehicle Mass (kg)', fontsize=12, fontweight='bold')
ax.set_title('Energy Consumption Heatmap: Mass vs EDS\n'
             'Darker colors = higher energy consumption',
             fontsize=13, fontweight='bold')

save_figure(fig, "figure07_energy_heatmap_mass_eds.png")

#==============================================================================
# FIGURE 8: Regional Energy Comparison (Recreating Markos's Screenshot 2)
#==============================================================================
print("\nCreating Figure 8: Regional Comparison...")

if 'Region' in phevs.columns:
    regional_data = phevs[['Region', 'EnTot_final100km', 'EDSen_mech']].dropna()
    
    regional_summary = regional_data.groupby('Region').agg({
        'EnTot_final100km': ['median', lambda x: x.quantile(0.25), lambda x: x.quantile(0.75)],
        'EDSen_mech': 'median',
        'EnTot_final100km': 'count'
    }).reset_index()
    
    regional_summary.columns = ['Region', 'median_energy', 'q25_energy', 'q75_energy', 
                                'median_eds', 'n']
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 7))
    
    # Energy by region
    regions = regional_summary['Region'].values
    x_pos = np.arange(len(regions))
    
    bars1 = ax1.bar(x_pos, regional_summary['median_energy'],
                   color=palette_regional[:len(regions)], alpha=0.8)
    ax1.errorbar(x_pos, regional_summary['median_energy'],
                yerr=[regional_summary['median_energy'] - regional_summary['q25_energy'],
                      regional_summary['q75_energy'] - regional_summary['median_energy']],
                fmt='none', color='black', linewidth=1, capsize=5)
    ax1.set_xticks(x_pos)
    ax1.set_xticklabels(regions, rotation=45, ha='right')
    ax1.set_ylabel('Median Energy (kWh/100 km)', fontsize=11, fontweight='bold')
    ax1.set_title('Total Energy Consumption by Region', fontsize=12, fontweight='bold')
    ax1.grid(axis='y', alpha=0.3)
    
    # EDS by region
    bars2 = ax2.bar(x_pos, regional_summary['median_eds'],
                   color=palette_regional[:len(regions)], alpha=0.8)
    ax2.set_xticks(x_pos)
    ax2.set_xticklabels(regions, rotation=45, ha='right')
    ax2.set_ylabel('Median EDS (%)', fontsize=11, fontweight='bold')
    ax2.set_title('Median EDS by Region', fontsize=12, fontweight='bold')
    ax2.grid(axis='y', alpha=0.3)
    
    fig.suptitle('Regional Patterns: Energy and EDS', 
                 fontsize=14, fontweight='bold')
    plt.tight_layout()
    save_figure(fig, "figure08_regional_comparison.png")
else:
    print("Region variable not found, skipping Figure 8")

#==============================================================================
# FIGURE 9: EDS Density Plot with Material Space Below (Markos's Screenshot 3)
#==============================================================================
print("\nCreating Figure 9: EDS Density with Mass Category...")

# Create mass categories
phevs['mass_cat'] = pd.cut(phevs['Mass'],
                          bins=[0, 1600, 2000, np.inf],
                          labels=['Light (<1600 kg)', 'Medium (1600-2000 kg)', 'Heavy (≥2000 kg)'])

mass_eds_data = phevs[['mass_cat', 'EDSen_mech', 'EnTot_final100km', 'Mass']].dropna()

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 10),
                                gridspec_kw={'height_ratios': [2, 1]})

# Top panel: EDS density by mass category
for cat in mass_eds_data['mass_cat'].cat.categories:
    cat_data = mass_eds_data[mass_eds_data['mass_cat'] == cat]['EDSen_mech']
    if len(cat_data) > 0:
        ax1.hist(cat_data, bins=50, density=True, alpha=0.6,
                label=str(cat), histtype='step', linewidth=1.5)

ax1.set_xlabel('Electric Driving Share (%)', fontsize=11, fontweight='bold')
ax1.set_ylabel('Density', fontsize=11, fontweight='bold')
ax1.set_title('EDS Distribution by Vehicle Mass Category', 
             fontsize=12, fontweight='bold')
ax1.legend()
ax1.grid(alpha=0.3)

# Bottom panel: Summary statistics
mass_summary = mass_eds_data.groupby('mass_cat').agg({
    'EDSen_mech': 'median',
    'EnTot_final100km': 'median',
    'Mass': 'median'
}).reset_index()

x_pos = np.arange(len(mass_summary))
width = 0.35

bars1 = ax2.bar(x_pos - width/2, mass_summary['EDSen_eds'],
               width, label='Median EDS (%)', color=palette_eds[60], alpha=0.8)
bars2 = ax2.bar(x_pos + width/2, mass_summary['EnTot_final100km']/10,
               width, label='Median Energy/10', color=palette_energy[50], alpha=0.6)

ax2.set_xlabel('Mass Category', fontsize=11, fontweight='bold')
ax2.set_ylabel('Median EDS (%)', fontsize=11, fontweight='bold')
ax2.set_title('Summary Statistics by Mass Category', fontsize=12, fontweight='bold')
ax2.set_xticks(x_pos)
ax2.set_xticklabels([str(cat) for cat in mass_summary['mass_cat']], rotation=45, ha='right')
ax2.legend()
ax2.grid(axis='y', alpha=0.3)

# Add value labels
for i, row in mass_summary.iterrows():
    ax2.text(i - width/2, row['EDSen_mech'] + 1,
            f"{row['EDSen_mech']:.1f}%", ha='center', va='bottom',
            fontsize=9, color='gray30')

fig.suptitle('EDS Patterns by Vehicle Mass Category',
             fontsize=14, fontweight='bold')
plt.tight_layout()
save_figure(fig, "figure09_eds_density_mass_category.png")

#==============================================================================
# Summary
#==============================================================================
print("\n" + "="*60)
print("Figure Generation Complete!")
print("="*60)
print(f"Figures saved to: {fig_dir}")
print("\nGenerated figures:")
print("  1. EDS Distribution")
print("  2. EDS by Country")
print("  3. EDS Density with Timeline")
print("  4. EDS vs Key Variables")
print("  5. Energy Split vs EDS")
print("  6. Total Energy Distribution")
print("  7. Energy Heatmap (Mass vs EDS)")
print("  8. Regional Comparison")
print("  9. EDS Density by Mass Category")
print("\nFigures follow Markos's instructions:")
print("  - EDS figures come before energy figures")
print("  - Information-dense with good color palettes")
print("  - Recreated Markos's 3 screenshot concepts")
print("\n")
