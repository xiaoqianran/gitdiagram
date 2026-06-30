import { useCallback } from "react";
import { toast } from "sonner";

import { exportMermaidSvgAsPng } from "~/features/diagram/export";
import { copyTextToClipboard } from "~/lib/clipboard";

export function useDiagramExport(diagram: string) {
  const handleCopy = useCallback(async () => {
    if (!diagram.trim()) {
      toast.error("No Mermaid code available yet. Wait for generation to finish.");
      throw new Error("No diagram to copy");
    }

    try {
      await copyTextToClipboard(diagram);
      toast.success("Mermaid code copied to clipboard.");
    } catch {
      toast.error(
        "Copy failed. If you are using HTTP, try HTTPS or select the diagram text manually.",
      );
      throw new Error("Clipboard copy failed");
    }
  }, [diagram]);

  const handleExportImage = useCallback(() => {
    const svgElement = document.querySelector(".mermaid svg");
    if (!(svgElement instanceof SVGSVGElement)) return;

    exportMermaidSvgAsPng(svgElement);
  }, []);

  return {
    handleCopy,
    handleExportImage,
  };
}
