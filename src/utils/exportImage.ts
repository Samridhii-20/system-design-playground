import { toPng } from "html-to-image";

/**
 * Ensures that all SVG defs (such as custom UML markers) from the document
 * are present inside the viewport element so html-to-image can capture them.
 */
export function injectMissingSvgDefs(viewport: HTMLElement): () => void {
  const externalDefs = document.querySelectorAll("svg defs");
  const missingDefs: SVGDefsElement[] = [];

  externalDefs.forEach((defs) => {
    if (!viewport.contains(defs)) {
      missingDefs.push(defs as SVGDefsElement);
    }
  });

  if (missingDefs.length === 0) {
    return () => {};
  }

  const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  tempSvg.setAttribute("style", "position: absolute; width: 0; height: 0; pointer-events: none;");
  tempSvg.setAttribute("aria-hidden", "true");

  missingDefs.forEach((defs) => {
    tempSvg.appendChild(defs.cloneNode(true));
  });

  viewport.appendChild(tempSvg);

  return () => {
    if (tempSvg.parentNode) {
      tempSvg.parentNode.removeChild(tempSvg);
    }
  };
}

/**
 * Captures the active ReactFlow canvas viewport and triggers a PNG image download.
 */
export async function exportCanvasToImage(mode: "hld" | "lld" = "hld", customTitle?: string) {
  const viewportElement = document.querySelector(".react-flow__viewport") as HTMLElement;
  if (!viewportElement) {
    alert("Canvas element not found!");
    return;
  }

  const cleanupDefs = injectMissingSvgDefs(viewportElement);

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
  } finally {
    cleanupDefs();
  }
}
