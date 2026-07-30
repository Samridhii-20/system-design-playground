import { toPng } from "html-to-image";

/**
 * Captures the active ReactFlow canvas viewport and triggers a PNG image download.
 */
export async function exportCanvasToImage(mode: "hld" | "lld" = "hld", customTitle?: string) {
  const viewportElement = document.querySelector(".react-flow__viewport") as HTMLElement;
  if (!viewportElement) {
    alert("Canvas element not found!");
    return;
  }

  try {
    const dataUrl = await toPng(viewportElement, {
      backgroundColor: "#0f172a", // Slate-900 theme background
      quality: 0.95,
      cacheBust: true,
      filter: (node) => {
        // Exclude unneeded UI overlays if any
        if (node instanceof HTMLElement && node.classList.contains("nodrag")) {
          return true;
        }
        return true;
      },
    });

    const cleanTitle = customTitle
      ? customTitle.toLowerCase().replace(/[^a-z0-9]/g, "_")
      : `${mode}_diagram`;

    const downloadLink = document.createElement("a");
    downloadLink.download = `${cleanTitle}_${Date.now()}.png`;
    downloadLink.href = dataUrl;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  } catch (error) {
    console.error("Failed to export canvas image:", error);
    alert("Could not export canvas as PNG image.");
  }
}
