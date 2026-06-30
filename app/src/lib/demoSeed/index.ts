import {
  db,
  now,
  uid,
  type FileRecord,
  type Note,
  type Project,
  type Reference,
} from "../db";
import {
  barChartSvg,
  csvBlob,
  heatmapSvg,
  lineChartSvg,
  minimalPdfBlob,
  scatterSvg,
  svgBlob,
  textBlob,
} from "./helpers";
import { refsForProject } from "./references";

export const DEMO_PROJECT_IDS = [
  "demo-biscuit-dunking",
  "demo-urban-heat-islands",
  "demo-ml-reproducibility",
] as const;

export type DemoProjectId = (typeof DEMO_PROJECT_IDS)[number];

export interface DemoMeta {
  id: DemoProjectId;
  name: string;
  description: string;
  color: string;
  blurb: string;
}

export const DEMO_CATALOG: DemoMeta[] = [
  {
    id: "demo-biscuit-dunking",
    name: "Physics of Biscuit Dunking",
    description: "Capillary uptake, stiffness loss, and the optimal dunk time.",
    color: "#b9532b",
    blurb:
      "A playful methods paper with LaTeX equations, figures, tables, and 12 linked references — great for exploring export and the citation graph.",
  },
  {
    id: "demo-urban-heat-islands",
    name: "Urban Heat Island Attribution",
    description: "Satellite LST trends across 120 global cities, 2000–2023.",
    color: "#2a5f8f",
    blurb:
      "Climate-science workflow demo: multi-panel figures, summary tables, PDFs, and references with DOIs for graph building.",
  },
  {
    id: "demo-ml-reproducibility",
    name: "Reproducible ML Benchmarks",
    description: "Random forests vs. gradient boosting on tabular climate features.",
    color: "#3d7a4a",
    blurb:
      "Methods + appendix code (R/Python), result tables, and reproducibility references — shows how code and data sit beside the manuscript.",
  },
];

const SETTINGS_KEY = "demos_v2_seeded";

type FileSeed = Omit<FileRecord, "id" | "project_id" | "created_at" | "updated_at">;

function fig(
  name: string,
  blob: Blob,
  order: number,
  caption: string,
  include = true,
): FileSeed {
  return {
    name,
    mime: "image/svg+xml",
    size: blob.size,
    blob,
    tags: ["demo", "figure"],
    include_in_export: include,
    sort_order: order,
    caption,
  };
}

function tbl(
  name: string,
  blob: Blob,
  order: number,
  caption: string,
  include = true,
): FileSeed {
  return {
    name,
    mime: "text/csv",
    size: blob.size,
    blob,
    tags: ["demo", "table"],
    include_in_export: include,
    sort_order: order,
    caption,
  };
}

function misc(
  name: string,
  mime: string,
  blob: Blob,
  order: number,
): FileSeed {
  return {
    name,
    mime,
    size: blob.size,
    blob,
    tags: ["demo"],
    include_in_export: false,
    sort_order: order,
  };
}

async function seedProject(
  meta: DemoMeta,
  notes: Omit<Note, "id" | "project_id" | "created_at" | "updated_at">[],
  refKeys: string[],
  files: FileSeed[],
): Promise<void> {
  const existing = await db.projects.get(meta.id);
  if (existing) return;

  const t = now() - 86400000 * 14;
  const project: Project = {
    id: meta.id,
    name: meta.name,
    description: meta.description,
    color: meta.color,
    is_demo: true,
    created_at: t,
    updated_at: t,
  };

  const noteRecords: Note[] = notes.map((n, i) => ({
    ...n,
    id: uid(),
    project_id: meta.id,
    sort_order: i,
    created_at: t + i * 3600000,
    updated_at: t + i * 3600000 + 60000,
  }));

  const refs: Reference[] = refsForProject(meta.id, refKeys, t);

  const fileRecords: FileRecord[] = files.map((f, i) => ({
    ...f,
    id: uid(),
    project_id: meta.id,
    created_at: t + i * 120000,
    updated_at: t + i * 120000,
  }));

  await db.transaction("rw", [db.projects, db.notes, db.references, db.files], async () => {
    await db.projects.add(project);
    await db.notes.bulkAdd(noteRecords);
    await db.references.bulkAdd(refs);
    await db.files.bulkAdd(fileRecords);
  });
}

function biscuitContent(): {
  notes: Omit<Note, "id" | "project_id" | "created_at" | "updated_at">[];
  refKeys: string[];
  files: FileSeed[];
} {
  const notes = [
    {
      title: "Abstract",
      markdown: `# Abstract

We study capillary uptake in porous baked goods during milk immersion. Using the Washburn equation and a simple stiffness model, we estimate optimal dunk duration before structural failure.

**Keywords:** biscuits, capillarity, food physics`,
    },
    {
      title: "Introduction",
      markdown: `# Introduction

The biscuit dunk is a daily experiment in fluid–solid interaction [@fisher1999]. When a dry biscuit meets tea, Lucas–Washburn dynamics govern pore filling [@washburn1921; @lucas1918].

Our aim: link uptake kinetics to perceptible softening.`,
    },
    {
      title: "Methods",
      markdown: `# Methods

## Capillary rise

Washburn height vs time:

$$h(t) = \\sqrt{\\frac{\\gamma r \\cos\\theta}{2\\mu}\\, t}$$

For a cylindrical pore of radius $r$, surface tension $\\gamma$, contact angle $\\theta$, and viscosity $\\mu$.

## Stiffness matrix

We model bending loss as:

$$\\mathbf{K} = \\begin{bmatrix} k_{11} & k_{12} \\\\ k_{12} & k_{22} \\end{bmatrix}$$

with $k_{ij}$ decreasing as moisture fraction $M$ rises.`,
    },
    {
      title: "Results",
      markdown: `# Results

Figure 1 shows uptake curves for digestive vs. rich-tea biscuits. Table 1 lists peak loads before fracture.

| Biscuit type | $t_{50}$ (s) | Max dunk (s) |
|--------------|-------------|--------------|
| Digestive    | 2.1         | 4.8          |
| Rich tea     | 1.6         | 3.9          |

See [@stokes1845] for the viscous limit at high saturation.`,
    },
    {
      title: "Discussion",
      markdown: `# Discussion

Optimal dunk time trades flavour absorption against mechanical collapse — consistent with [@fisher1999]. Future work: tomographic imaging of crumb pores.`,
    },
  ];

  const refKeys = [
    "fisher1999",
    "washburn1921",
    "lucas1918",
    "stokes1845",
    "oke1982",
    "arnfield2003",
    "peng2012",
    "breiman2001",
    "hastie2009",
    "molnar2022",
    "peng2011",
    "sandve2013",
  ];

  const files: FileSeed[] = [
    fig("fig01_uptake_curves.svg", svgBlob(lineChartSvg("Capillary uptake vs time", [0, 1, 2, 3, 4, 5], [0, 12, 28, 45, 58, 62])), 0, "Figure 1. Mean rise height (mm) during dunking."),
    fig("fig02_biscuit_types.svg", svgBlob(barChartSvg("Break force by biscuit type", ["Digestive", "Rich tea", "Oat", "Ginger"], [4.2, 3.1, 5.0, 3.8])), 1, "Figure 2. Peak load before fracture (N)."),
    fig("fig03_moisture_map.svg", svgBlob(heatmapSvg("Crumb moisture after 3 s")), 2, "Figure 3. Moisture fraction field (cross-section)."),
    fig("fig04_viscosity_effect.svg", svgBlob(lineChartSvg("Tea temperature effect", [20, 40, 60, 80, 90], [18, 24, 31, 38, 42], "#6b4c9a")), 3, "Figure 4. Uptake rate vs tea temperature (°C)."),
    fig("fig05_contact_angle.svg", svgBlob(scatterSvg("Contact angle variability", 35)), 4, "Figure 5. Measured contact angles (°)."),
    fig("fig06_stiffness_decay.svg", svgBlob(lineChartSvg("Bending stiffness vs moisture", [0, 0.1, 0.2, 0.3, 0.4], [1.0, 0.82, 0.61, 0.38, 0.15])), 5, "Figure 6. Normalised stiffness vs moisture fraction."),
    fig("fig07_repeatability.svg", svgBlob(barChartSvg("Trial repeatability (CV%)", ["Lab A", "Lab B", "Lab C"], [4.2, 5.1, 3.8], "#3d7a4a")), 6, "Figure 7. Coefficient of variation across labs."),
    fig("fig08_optimal_dunk.svg", svgBlob(barChartSvg("Sensory score vs dunk time", ["2s", "3s", "4s", "5s"], [6.2, 8.1, 7.4, 4.0])), 7, "Figure 8. Mean sensory score (1–10)."),
    fig("fig09_appendix_setup.svg", svgBlob(scatterSvg("Camera calibration residuals", 28, "#888")), 8, "Figure 9. Setup calibration (appendix).", false),
    tbl("table01_biscuit_specs.csv", csvBlob(["type", "mass_g", "porosity", "pore_um"], [["digestive", "8.2", "0.41", "120"], ["rich_tea", "7.1", "0.38", "95"], ["oat", "9.0", "0.35", "140"]]), 0, "Table 1. Biscuit physical properties."),
    tbl("table02_uptake_kinetics.csv", csvBlob(["time_s", "height_mm", "se"], [["1", "12.1", "1.2"], ["2", "28.4", "1.8"], ["3", "45.0", "2.1"], ["4", "58.2", "2.4"]]), 1, "Table 2. Uptake kinetics summary."),
    tbl("table03_stiffness.csv", csvBlob(["moisture", "k11", "k22"], [["0.1", "0.82", "0.79"], ["0.2", "0.61", "0.58"], ["0.3", "0.38", "0.35"]]), 2, "Table 3. Stiffness matrix entries."),
    tbl("table04_sensory.csv", csvBlob(["dunk_s", "flavour", "texture", "overall"], [["2", "5.1", "7.0", "6.2"], ["3", "7.8", "8.0", "8.1"], ["4", "8.2", "6.1", "7.4"]]), 3, "Table 4. Sensory panel scores."),
    tbl("table05_labs.csv", csvBlob(["lab", "n", "cv_pct"], [["A", "30", "4.2"], ["B", "28", "5.1"], ["C", "32", "3.8"]]), 4, "Table 5. Inter-lab repeatability."),
    tbl("table06_temperature.csv", csvBlob(["temp_c", "uptake_mm_s"], [["20", "0.18"], ["60", "0.31"], ["90", "0.42"]]), 5, "Table 6. Temperature sensitivity."),
    tbl("table07_materials.csv", csvBlob(["item", "supplier", "lot"], [["tea", "local", "T42"], ["milk", "dairy co", "M18"]]), 6, "Table 7. Materials log."),
    tbl("table08_statistics.csv", csvBlob(["test", "stat", "p"], [["uptake", "F=12.4", "0.002"], ["stiffness", "F=8.1", "0.011"]]), 7, "Table 8. ANOVA summary."),
    misc("fisher1999_preprint.pdf", "application/pdf", minimalPdfBlob("Fisher 1999 preprint"), 9),
    misc("lab_protocol.md", "text/markdown", textBlob("# Lab protocol\n\n1. Weigh biscuit.\n2. Preheat tea to 85°C.\n3. Dunk to 10 mm depth.\n", "text/markdown"), 10),
    misc("appendix_analysis.R", "text/plain", textBlob('# Appendix: uptake fit\nfit <- nls(height ~ a * sqrt(t), start = list(a = 20))\n', "text/plain"), 11),
    misc("raw_readings.json", "application/json", textBlob('{"trials":[{"id":1,"h_mm":12.1}]}', "application/json"), 12),
    misc("references_export.bib", "application/x-bibtex", textBlob("@article{fisher1999,...}", "application/x-bibtex"), 13),
  ];

  return { notes, refKeys, files };
}

function urbanHeatContent(): {
  notes: Omit<Note, "id" | "project_id" | "created_at" | "updated_at">[];
  refKeys: string[];
  files: FileSeed[];
} {
  const notes = [
    {
      title: "Abstract",
      markdown: `# Abstract

We quantify land-surface temperature (LST) trends for 120 global cities (2000–2023) and attribute urban warming relative to peri-urban controls [@oke1982; @arnfield2003].

Night-time UHI intensity rose by $0.04 \\pm 0.01$ °C yr$^{-1}$ on average [@peng2012].`,
    },
    {
      title: "Methods",
      markdown: `# Methods

MODIS LST (1 km) aggregated per city polygon. Trend model:

$$LST_t = \\beta_0 + \\beta_1 t + \\beta_2 \\mathrm{NDVI}_t + \\epsilon_t$$

Bootstrap $n=1000$ for confidence intervals.`,
    },
    {
      title: "Results",
      markdown: `# Results

Coastal cities show weaker trends than inland megacities. See figures 1–4 and tables 1–4.`,
    },
  ];

  const refKeys = [
    "oke1982",
    "arnfield2003",
    "peng2012",
    "fisher1999",
    "washburn1921",
    "lucas1918",
    "stokes1845",
    "breiman2001",
    "hastie2009",
    "molnar2022",
    "peng2011",
    "sandve2013",
  ];

  const cities = ["London", "Tokyo", "Cairo", "São Paulo"];
  const files: FileSeed[] = [
    fig("fig01_lst_trends.svg", svgBlob(lineChartSvg("Mean LST trend 2000–2023", [0, 5, 10, 15, 20, 23], [0.2, 0.5, 0.9, 1.1, 1.3, 1.45])), 0, "Figure 1. Global mean urban LST anomaly (°C)."),
    fig("fig02_uhi_intensity.svg", svgBlob(barChartSvg("Night UHI by region", ["Europe", "Asia", "Americas", "Africa"], [2.1, 3.4, 2.8, 2.5], "#2a5f8f")), 1, "Figure 2. Night-time UHI intensity (°C)."),
    fig("fig03_ndvi_correlation.svg", svgBlob(scatterSvg("NDVI vs LST residuals", 50)), 2, "Figure 3. NDVI–LST relationship."),
    fig("fig04_seasonal_cycle.svg", svgBlob(lineChartSvg("Seasonal LST cycle", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], [2, 3, 8, 12, 18, 22, 24, 23, 18, 12, 6, 3])), 3, "Figure 4. Climatological monthly LST."),
    fig("fig05_city_map.svg", svgBlob(heatmapSvg("Urban warming hotspots")), 4, "Figure 5. Trend magnitude heatmap."),
    fig("fig06_day_night.svg", svgBlob(barChartSvg("Day vs night UHI", cities, [3.2, 4.1, 5.0, 3.8])), 5, "Figure 6. Selected city UHI (°C)."),
    fig("fig07_uncertainty.svg", svgBlob(lineChartSvg("Bootstrap CI width", [2000, 2005, 2010, 2015, 2020, 2023], [0.8, 0.7, 0.55, 0.5, 0.42, 0.38])), 6, "Figure 7. Trend uncertainty over time."),
    fig("fig08_peri_urban.svg", svgBlob(scatterSvg("Urban vs peri-urban LST", 45, "#2a5f8f")), 7, "Figure 8. Urban–peri-urban contrast."),
    fig("fig09_supplement.svg", svgBlob(barChartSvg("Cloud-free obs per city", cities, [82, 76, 91, 88], "#888")), 8, "Figure S1. Data availability.", false),
    tbl("table01_city_list.csv", csvBlob(["city", "lat", "lon", "population_M"], [["London", "51.5", "-0.1", "9.0"], ["Tokyo", "35.7", "139.7", "37.0"]]), 0, "Table 1. Study cities (excerpt)."),
    tbl("table02_lst_trends.csv", csvBlob(["city", "beta_c_per_yr", "se"], [["London", "0.038", "0.009"], ["Tokyo", "0.051", "0.011"]]), 1, "Table 2. LST trends."),
    tbl("table03_uhi_stats.csv", csvBlob(["region", "mean_uhi", "sd"], [["Europe", "2.1", "0.8"], ["Asia", "3.4", "1.1"]]), 2, "Table 3. Regional UHI statistics."),
    tbl("table04_model_fit.csv", csvBlob(["model", "r2", "aic"], [["linear", "0.72", "1240"], ["ndvi_adj", "0.81", "1188"]]), 3, "Table 4. Model comparison."),
    tbl("table05_seasonal.csv", csvBlob(["month", "lst_anom"], [["1", "2.1"], ["7", "24.0"]]), 4, "Table 5. Seasonal anomalies."),
    tbl("table06_quality.csv", csvBlob(["city", "cloud_pct"], [["Cairo", "9"], ["London", "18"]]), 5, "Table 6. Cloud contamination."),
    tbl("table07_attribution.csv", csvBlob(["factor", "contribution_pct"], [["impervious", "42"], ["anthropogenic", "31"]]), 6, "Table 7. Attribution breakdown."),
    tbl("table08_robustness.csv", csvBlob(["spec", "beta"], [["baseline", "0.041"], ["no_coast", "0.038"]]), 7, "Table 8. Robustness checks."),
    misc("modis_methods.pdf", "application/pdf", minimalPdfBlob("MODIS methods note"), 9),
    misc("city_polygons.geojson", "application/geo+json", textBlob('{"type":"FeatureCollection","features":[]}', "application/geo+json"), 10),
    misc("lst_pipeline.py", "text/plain", textBlob("# LST extraction\nimport xarray as xr\n", "text/plain"), 11),
    misc("readme_field_campaign.md", "text/markdown", textBlob("# Field validation\nMobile traverses in London, July 2022.\n", "text/markdown"), 12),
  ];

  return { notes, refKeys, files };
}

function mlReproContent(): {
  notes: Omit<Note, "id" | "project_id" | "created_at" | "updated_at">[];
  refKeys: string[];
  files: FileSeed[];
} {
  const notes = [
    {
      title: "Abstract",
      markdown: `# Abstract

We benchmark random forests [@breiman2001] and gradient boosting on tabular climate predictors with a reproducible pipeline [@peng2011; @sandve2013].

All code, seeds, and environment locks are versioned in the appendix.`,
    },
    {
      title: "Methods",
      markdown: `# Methods

Features standardised to zero mean and unit variance. Cross-validation with fixed seed $s=42$.

$$\\hat{y} = \\frac{1}{B}\\sum_{b=1}^{B} T_b(\\mathbf{x})$$

for $B$ bootstrap trees [@hastie2009].`,
    },
    {
      title: "Appendix — Code",
      markdown: `# Appendix

See \`appendix_train.py\` and \`appendix_figures.R\` in Files. SHAP summaries in [@molnar2022].`,
    },
  ];

  const refKeys = [
    "breiman2001",
    "hastie2009",
    "molnar2022",
    "peng2011",
    "sandve2013",
    "fisher1999",
    "washburn1921",
    "oke1982",
    "arnfield2003",
    "peng2012",
    "lucas1918",
    "stokes1845",
  ];

  const files: FileSeed[] = [
    fig("fig01_roc_curves.svg", svgBlob(lineChartSvg("ROC curves", [0, 0.2, 0.4, 0.6, 0.8, 1], [0, 0.55, 0.72, 0.84, 0.92, 1])), 0, "Figure 1. ROC curves by model."),
    fig("fig02_feature_importance.svg", svgBlob(barChartSvg("Feature importance", ["temp", "humidity", "wind", "ndvi"], [0.32, 0.24, 0.18, 0.14], "#3d7a4a")), 1, "Figure 2. Mean decrease in impurity."),
    fig("fig03_learning_curve.svg", svgBlob(lineChartSvg("Learning curve", [100, 500, 1000, 5000, 10000], [0.62, 0.71, 0.78, 0.84, 0.86])), 2, "Figure 3. Validation score vs training size."),
    fig("fig04_calibration.svg", svgBlob(scatterSvg("Calibration plot", 30)), 3, "Figure 4. Reliability diagram."),
    fig("fig05_runtime.svg", svgBlob(barChartSvg("Training time (s)", ["RF", "XGB", "LR"], [12, 28, 2])), 4, "Figure 5. Wall-clock training time."),
    fig("fig06_shap_summary.svg", svgBlob(heatmapSvg("SHAP summary")), 5, "Figure 6. SHAP value heatmap."),
    fig("fig07_fold_variance.svg", svgBlob(barChartSvg("CV fold variance", ["F1", "F2", "F3", "F4", "F5"], [0.81, 0.79, 0.83, 0.80, 0.82])), 6, "Figure 7. Per-fold AUC."),
    fig("fig08_ablation.svg", svgBlob(lineChartSvg("Ablation study", [0, 1, 2, 3, 4], [0.86, 0.84, 0.81, 0.76, 0.71], "#6b4c9a")), 7, "Figure 8. Score vs features removed."),
    fig("fig09_seed_stability.svg", svgBlob(scatterSvg("Seed stability", 20, "#888")), 8, "Figure S1. AUC across random seeds.", false),
    tbl("table01_benchmark.csv", csvBlob(["model", "auc", "f1", "runtime_s"], [["rf", "0.86", "0.79", "12"], ["xgb", "0.88", "0.81", "28"]]), 0, "Table 1. Benchmark results."),
    tbl("table02_hyperparams.csv", csvBlob(["param", "rf", "xgb"], [["n_trees", "500", "300"], ["max_depth", "12", "8"]]), 1, "Table 2. Hyperparameters."),
    tbl("table03_features.csv", csvBlob(["feature", "dtype", "missing_pct"], [["temp", "float", "0.1"], ["ndvi", "float", "2.4"]]), 2, "Table 3. Feature schema."),
    tbl("table04_cv_scores.csv", csvBlob(["fold", "auc"], [["1", "0.81"], ["2", "0.79"]]), 3, "Table 4. Cross-validation scores."),
    tbl("table05_ablation.csv", csvBlob(["removed", "auc"], [["wind", "0.84"], ["ndvi", "0.81"]]), 4, "Table 5. Ablation results."),
    tbl("table06_hardware.csv", csvBlob(["run", "cpu", "ram_gb"], [["main", "M2", "16"], ["sensitivity", "Xeon", "64"]]), 5, "Table 6. Compute environment."),
    tbl("table07_repro_checklist.csv", csvBlob(["item", "status"], [["seed_fixed", "yes"], ["env_lock", "yes"]]), 6, "Table 7. Reproducibility checklist."),
    tbl("table08_errors.csv", csvBlob(["city", "rmse"], [["A", "1.2"], ["B", "1.8"]]), 7, "Table 8. Per-city RMSE."),
    misc("appendix_train.py", "text/plain", textBlob('#!/usr/bin/env python3\n"""Appendix: train RF with fixed seed."""\nSEED = 42\n', "text/plain"), 9),
    misc("appendix_figures.R", "text/plain", textBlob("# Appendix figures\nggplot(data, aes(x, y)) + geom_point()\n", "text/plain"), 10),
    misc("environment.lock", "text/plain", textBlob("python==3.11\nscikit-learn==1.4\n", "text/plain"), 11),
    misc("paper_draft.pdf", "application/pdf", minimalPdfBlob("ML reproducibility draft"), 12),
    misc("supplementary.zip", "application/zip", textBlob("PK\x03\x04placeholder", "application/zip"), 13),
  ];

  return { notes, refKeys, files };
}

export async function ensureDemoProjects(): Promise<void> {
  const flag = await db.settings.get(SETTINGS_KEY);
  if (flag?.value) {
    for (const meta of DEMO_CATALOG) {
      if (!(await db.projects.get(meta.id))) {
        await seedOne(meta);
      }
    }
    return;
  }

  for (const meta of DEMO_CATALOG) {
    await seedOne(meta);
  }
  await db.settings.put({ key: SETTINGS_KEY, value: true });
}

async function seedOne(meta: DemoMeta): Promise<void> {
  let content: ReturnType<typeof biscuitContent>;
  if (meta.id === "demo-biscuit-dunking") content = biscuitContent();
  else if (meta.id === "demo-urban-heat-islands") content = urbanHeatContent();
  else content = mlReproContent();
  await seedProject(meta, content.notes, content.refKeys, content.files);
}

export async function clearAllDemoProjects(): Promise<void> {
  for (const id of DEMO_PROJECT_IDS) {
    await deleteProjectCascade(id);
  }
}

async function deleteProjectCascade(projectId: string): Promise<void> {
  await db.transaction(
    "rw",
    [db.projects, db.files, db.notes, db.references, db.highlights, db.sync_queue, db.activity_log],
    async () => {
      await db.files.where("project_id").equals(projectId).delete();
      await db.notes.where("project_id").equals(projectId).delete();
      await db.references.where("project_id").equals(projectId).delete();
      await db.highlights.where("project_id").equals(projectId).delete();
      await db.activity_log.where("project_id").equals(projectId).delete();
      await db.projects.delete(projectId);
    },
  );
}

function normalizeDemoName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Remove duplicate demo projects (e.g. manual copies or old seeds with new IDs). */
export async function dedupeDemoProjects(): Promise<void> {
  const allProjects = await db.projects.toArray();

  for (const meta of DEMO_CATALOG) {
    const canonicalNorm = normalizeDemoName(meta.name);
    const matches = allProjects.filter(
      (p) =>
        p.id === meta.id ||
        normalizeDemoName(p.name) === canonicalNorm ||
        normalizeDemoName(p.name).includes("biscuit dunk") && meta.id === "demo-biscuit-dunking",
    );

    if (matches.length <= 1) continue;

    const keep =
      matches.find((p) => p.id === meta.id) ??
      matches.find((p) => p.is_demo) ??
      matches[0];

    for (const dup of matches) {
      if (dup.id === keep.id) continue;
      await deleteProjectCascade(dup.id);
    }
  }

  // Non-demo projects that share a demo name while the canonical demo exists
  for (const meta of DEMO_CATALOG) {
    const canonical = await db.projects.get(meta.id);
    if (!canonical) continue;
    const canonicalNorm = normalizeDemoName(meta.name);
    const dupes = await db.projects
      .filter(
        (p) =>
          p.id !== meta.id &&
          !p.is_demo &&
          normalizeDemoName(p.name) === canonicalNorm,
      )
      .toArray();
    for (const dup of dupes) {
      await deleteProjectCascade(dup.id);
    }
  }
}

export async function reloadDemoProject(id: DemoProjectId): Promise<void> {
  await deleteProjectCascade(id);
  const meta = DEMO_CATALOG.find((m) => m.id === id);
  if (!meta) return;
  await seedOne(meta);
}
