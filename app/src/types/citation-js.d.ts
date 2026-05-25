declare module "@citation-js/core" {
  // Citation.js (https://citation.js.org) — minimal typing for what we use.
  // The library is JS-only; this declaration covers Cite + plugin registry.

  type CslJson = Record<string, unknown>;

  interface CiteFormatOptions {
    format?: "text" | "html" | "string";
    template?: string;
    lang?: string;
  }

  export class Cite {
    constructor(input?: unknown);
    static async(input: unknown): Promise<Cite>;
    data: CslJson[];
    format(name: string, options?: CiteFormatOptions): string;
  }

  export const plugins: {
    config: {
      get(name: string): unknown;
      set(name: string, value: unknown): void;
    };
  };
}

declare module "@citation-js/plugin-doi";
declare module "@citation-js/plugin-bibtex";
declare module "@citation-js/plugin-csl";
