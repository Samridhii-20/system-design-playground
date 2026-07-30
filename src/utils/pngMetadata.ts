import { toPng } from "html-to-image";
import type { Node, Edge } from "@xyflow/react";
import type { SavedDiagram } from "@/types/savedDiagram";

const PNG_META_PREFIX = "___SDP_EDITABLE_PNG_METADATA___:";

/**
 * Renders the canvas viewport to PNG image and embeds the editable diagram payload inside the PNG file.
 */
export async function exportDiagramAsEditablePNG(diagram: {
  name: string;
  mode: "hld" | "lld";
  nodes: Node[];
  edges: Edge[];
}): Promise<void> {
  const viewportElement = document.querySelector(".react-flow__viewport") as HTMLElement;
  if (!viewportElement) {
    throw new Error("Canvas viewport not found!");
  }

  // 1. Render React Flow viewport to PNG base64 data URL
  const dataUrl = await toPng(viewportElement, {
    backgroundColor: "#0f172a",
    quality: 0.95,
    cacheBust: true,
  });

  // 2. Construct saved diagram payload
  const savedData: SavedDiagram = {
    id: `diag-${Date.now()}`,
    name: diagram.name || `${diagram.mode.toUpperCase()} Diagram`,
    mode: diagram.mode,
    updatedAt: new Date().toLocaleString(),
    nodes: diagram.nodes,
    edges: diagram.edges,
  };

  const jsonPayload = JSON.stringify(savedData);
  const base64Payload = btoa(encodeURIComponent(jsonPayload));
  const embeddedMetaTag = `\n${PNG_META_PREFIX}${base64Payload}\n`;

  // 3. Convert DataURL to Blob and append embedded metadata tag
  const res = await fetch(dataUrl);
  const pngBlob = await res.blob();
  const metaBlob = new Blob([pngBlob, embeddedMetaTag], { type: "image/png" });

  // 4. Download PNG file
  const cleanFileName = (diagram.name || `${diagram.mode}_diagram`)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_");

  const downloadUrl = URL.createObjectURL(metaBlob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = `${cleanFileName}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(downloadUrl);
}

/**
 * Reads an uploaded PNG image file and extracts the embedded editable diagram structure.
 */
export async function extractDiagramFromPNG(file: File): Promise<SavedDiagram | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const markerIdx = text.indexOf(PNG_META_PREFIX);
        if (markerIdx === -1) {
          resolve(null);
          return;
        }

        const rawData = text.substring(markerIdx + PNG_META_PREFIX.length).trim().split("\n")[0];
        const jsonStr = decodeURIComponent(atob(rawData));
        const diagram: SavedDiagram = JSON.parse(jsonStr);

        if (diagram && Array.isArray(diagram.nodes) && Array.isArray(diagram.edges)) {
          resolve(diagram);
        } else {
          resolve(null);
        }
      } catch (err) {
        console.error("Failed to extract editable diagram from PNG metadata:", err);
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsBinaryString(file);
  });
}
