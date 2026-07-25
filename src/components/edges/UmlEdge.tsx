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
  selected,
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

  // 1. Determine line dash styling & selection highlight
  const isDashed = relationship === "realization" || relationship === "dependency";
  const customStyle: React.CSSProperties = {
    ...style,
    stroke: selected ? "#c084fc" : "#818cf8", // bright glowing violet when selected
    strokeWidth: selected ? 3.5 : 2.5,
    strokeDasharray: isDashed ? "6, 6" : undefined,
    filter: selected ? "drop-shadow(0 0 6px #c084fc)" : undefined,
    transition: "stroke 0.2s, stroke-width 0.2s",
  };

  // 2. Select target/start marker
  let resolvedMarkerEnd = "";
  let resolvedMarkerStart = "";

  const suffix = selected ? "-selected" : "";

  if (relationship === "inheritance" || relationship === "realization") {
    resolvedMarkerEnd = `url(#uml-inheritance-arrow${suffix})`;
  } else if (relationship === "association" || relationship === "dependency") {
    resolvedMarkerEnd = `url(#uml-association-arrow${suffix})`;
  } else if (relationship === "composition") {
    resolvedMarkerStart = `url(#uml-composition-diamond${suffix})`;
  } else if (relationship === "aggregation") {
    resolvedMarkerStart = `url(#uml-aggregation-diamond${suffix})`;
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={customStyle}
        markerEnd={resolvedMarkerEnd || markerEnd}
        markerStart={resolvedMarkerStart}
        interactionWidth={25}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: selected ? "#3b0764" : "#0f172a",
              color: selected ? "#f0abfc" : "#c7d2fe",
              padding: "3px 7px",
              borderRadius: "4px",
              fontSize: "10px",
              fontFamily: "monospace",
              fontWeight: 600,
              border: selected ? "1px solid #c084fc" : "1px solid #312e81",
              pointerEvents: "all",
              zIndex: 10,
              boxShadow: selected ? "0 0 10px rgba(192, 132, 252, 0.4)" : "none",
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
