"use client";

import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from "@xyflow/react";
import type { UmlRelationshipType } from "@/types/uml";

/**
 * UmlEdge — renders a custom React Flow edge matching standard UML syntax,
 * utilizing custom markers defined in the ReactFlow container.
 */
export default function UmlEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 10,
  });

  const relationship = (data?.relationship as UmlRelationshipType) || "association";
  const label = data?.label as string | undefined;

  // 1. Determine line dash styling
  const isDashed = relationship === "realization" || relationship === "dependency";
  const customStyle: React.CSSProperties = {
    ...style,
    stroke: "#818cf8", // bright indigo edge
    strokeWidth: 2,
    strokeDasharray: isDashed ? "5, 5" : undefined,
  };

  // 2. Select target marker
  let resolvedMarkerEnd = "";
  let resolvedMarkerStart = "";

  if (relationship === "inheritance" || relationship === "realization") {
    resolvedMarkerEnd = "url(#uml-inheritance-arrow)";
  } else if (relationship === "association" || relationship === "dependency") {
    resolvedMarkerEnd = "url(#uml-association-arrow)";
  } else if (relationship === "composition") {
    resolvedMarkerStart = "url(#uml-composition-diamond)";
    resolvedMarkerEnd = "";
  } else if (relationship === "aggregation") {
    resolvedMarkerStart = "url(#uml-aggregation-diamond)";
    resolvedMarkerEnd = "";
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={customStyle}
        markerEnd={resolvedMarkerEnd || markerEnd}
        markerStart={resolvedMarkerStart}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: "#0f172a",
              color: "#c7d2fe",
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "9px",
              fontFamily: "monospace",
              border: "1px solid #312e81",
              pointerEvents: "all",
              zIndex: 10,
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
