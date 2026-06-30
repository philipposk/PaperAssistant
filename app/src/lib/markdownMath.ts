import type { MarkdownPreviewProps } from "@uiw/react-markdown-preview/nohighlight";

let cached: Omit<MarkdownPreviewProps, "source"> | null = null;

/** Lazy-load remark-math/rehype-katex (~1.3MB) only on the Notes route. */
export async function getMarkdownMathPreviewOptions(): Promise<
  Omit<MarkdownPreviewProps, "source">
> {
  if (cached) return cached;
  const [{ default: remarkMath }, { default: rehypeKatex }] = await Promise.all([
    import("remark-math"),
    import("rehype-katex"),
  ]);
  await import("katex/dist/katex.min.css");
  cached = {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  };
  return cached;
}
