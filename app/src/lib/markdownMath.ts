import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { MarkdownPreviewProps } from "@uiw/react-markdown-preview/nohighlight";
import "katex/dist/katex.min.css";

/** Shared remark/rehype plugins so `$x$` and `$$…$$` render in MD preview. */
export const markdownMathPreviewOptions: Omit<MarkdownPreviewProps, "source"> = {
  remarkPlugins: [remarkMath],
  rehypePlugins: [rehypeKatex],
};
