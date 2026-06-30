import { type Reference, uid } from "../db";

export interface RefSeed {
  citation_key: string;
  doi?: string;
  url?: string;
  csl_json: Record<string, unknown>;
}

/** Twelve well-known papers with real DOIs for citation graph + link-out demos. */
export const SHARED_REF_SEEDS: RefSeed[] = [
  ref("fisher1999", "10.1038/25156", {
    type: "article-journal",
    title: "Physics takes the biscuit",
    author: [{ family: "Fisher", given: "Len" }],
    "container-title": "Nature",
    issued: { "date-parts": [[1999, 11, 11]] },
    volume: "397",
    page: "469",
  }),
  ref("washburn1921", "10.1103/PhysRev.17.273", {
    type: "article-journal",
    title: "The dynamics of capillary flow",
    author: [{ family: "Washburn", given: "E. W." }],
    "container-title": "Physical Review",
    issued: { "date-parts": [[1921]] },
    volume: "17",
    page: "273-283",
  }),
  ref("lucas1918", "10.1007/BF01209296", {
    type: "article-journal",
    title: "Ueber das Zeitgesetz des kapillaren Aufstiegs von Flüssigkeiten",
    author: [{ family: "Lucas", given: "R." }],
    "container-title": "Kolloid Zeitschrift",
    issued: { "date-parts": [[1918]] },
    volume: "23",
    page: "15-22",
  }),
  ref("stokes1845", "10.1098/rstl.1845.0015", {
    type: "article-journal",
    title: "On the theories of the internal friction of fluids in motion",
    author: [{ family: "Stokes", given: "G. G." }],
    "container-title": "Philosophical Transactions of the Royal Society",
    issued: { "date-parts": [[1845]] },
    volume: "8",
    page: "287-319",
  }),
  ref("oke1982", "10.1002/qj.49710845602", {
    type: "article-journal",
    title: "The energetic basis of the urban heat island",
    author: [{ family: "Oke", given: "T. R." }],
    "container-title": "Quarterly Journal of the Royal Meteorological Society",
    issued: { "date-parts": [[1982]] },
    volume: "108",
    page: "1-24",
  }),
  ref("arnfield2003", "10.1016/S0034-4257(03)00079-4", {
    type: "article-journal",
    title: "Two decades of urban climate research: a review of turbulence, exchanges of energy and water, and the urban heat island",
    author: [{ family: "Arnfield", given: "A. J." }],
    "container-title": "International Journal of Climatology",
    issued: { "date-parts": [[2003]] },
    volume: "23",
    page: "1-26",
  }),
  ref("peng2012", "10.1038/nclimate1503", {
    type: "article-journal",
    title: "Surface urban heat island across 419 global big cities",
    author: [
      { family: "Peng", given: "Shushi" },
      { family: "Piao", given: "Shilong" },
    ],
    "container-title": "Nature Climate Change",
    issued: { "date-parts": [[2012]] },
    volume: "2",
    page: "730-733",
  }),
  ref("breiman2001", "10.1023/A:1010933404324", {
    type: "article-journal",
    title: "Random forests",
    author: [{ family: "Breiman", given: "Leo" }],
    "container-title": "Machine Learning",
    issued: { "date-parts": [[2001]] },
    volume: "45",
    page: "5-32",
  }),
  ref("hastie2009", "10.1007/978-0-387-84858-7", {
    type: "book",
    title: "The Elements of Statistical Learning",
    author: [
      { family: "Hastie", given: "Trevor" },
      { family: "Tibshirani", given: "Robert" },
      { family: "Friedman", given: "Jerome" },
    ],
    issued: { "date-parts": [[2009]] },
    publisher: "Springer",
  }),
  ref("molnar2022", "10.1201/9780429446813", {
    type: "book",
    title: "Interpretable Machine Learning",
    author: [{ family: "Molnar", given: "Christoph" }],
    issued: { "date-parts": [[2022]] },
    publisher: "Chapman and Hall/CRC",
  }),
  ref("peng2011", "10.1126/science.1213847", {
    type: "article-journal",
    title: "Reproducible research in computational science",
    author: [{ family: "Peng", given: "Roger D." }],
    "container-title": "Science",
    issued: { "date-parts": [[2011]] },
    volume: "334",
    page: "1226-1227",
  }),
  ref("sandve2013", "10.1371/journal.pcbi.1003285", {
    type: "article-journal",
    title: "Ten simple rules for reproducible computational research",
    author: [{ family: "Sandve", given: "Geir K." }],
    "container-title": "PLOS Computational Biology",
    issued: { "date-parts": [[2013]] },
    volume: "9",
    issue: "10",
  }),
];

function ref(
  key: string,
  doi: string,
  csl: Record<string, unknown>,
): RefSeed {
  return {
    citation_key: key,
    doi,
    url: `https://doi.org/${doi}`,
    csl_json: { ...csl, DOI: doi, URL: `https://doi.org/${doi}` },
  };
}

export function refsForProject(
  projectId: string,
  keys: string[],
  t: number,
): Reference[] {
  const map = new Map(SHARED_REF_SEEDS.map((r) => [r.citation_key, r]));
  return keys.map((key) => {
    const seed = map.get(key);
    if (!seed) throw new Error(`Unknown ref key: ${key}`);
    return {
      id: uid(),
      project_id: projectId,
      citation_key: seed.citation_key,
      csl_json: seed.csl_json,
      doi: seed.doi,
      url: seed.url,
      tags: ["demo"],
      created_at: t,
      updated_at: t,
    };
  });
}
