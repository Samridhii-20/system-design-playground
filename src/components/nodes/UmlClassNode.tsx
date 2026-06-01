"use client";

import { useCallback } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import type { UmlClassConfig, UmlVisibility } from "@/types/uml";

interface UmlClassNodeProps {
  id: string;
  selected: boolean;
  data: {
    label: string;
    description: string;
    color: string;
    config: UmlClassConfig;
  };
}

/**
 * Maps visibility to UML symbol: + for public, - for private, # for protected.
 */
function getVisSymbol(vis: UmlVisibility): string {
  switch (vis) {
    case "public":
      return "+";
    case "private":
      return "-";
    case "protected":
      return "#";
    default:
      return "+";
  }
}

/**
 * UmlClassNode — premium custom node for rendering standard UML Class boxes.
 */
export default function UmlClassNode({ id, selected, data }: UmlClassNodeProps) {
  const { label, description, color, config } = data;
  const { deleteElements, updateNodeData } = useReactFlow();

  const onDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteElements({ nodes: [{ id }] });
    },
    [id, deleteElements]
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeData(id, { label: e.target.value });
    },
    [id, updateNodeData]
  );

  if (!config) return null;

  const { isInterface, isAbstract, attributes, methods } = config;

  return (
    <div
      className={`uml-node rounded-lg overflow-hidden border bg-slate-900/90 shadow-2xl backdrop-blur-md transition-all ${
        selected ? "ring-2 ring-indigo-500 scale-102" : "border-slate-700/80"
      }`}
      style={{
        width: "250px",
        boxShadow: selected
          ? `0 0 30px ${color}55, 0 10px 30px rgba(0, 0, 0, 0.5)`
          : `0 8px 32px rgba(0, 0, 0, 0.4)`,
      }}
    >
      {/* Target handle on top */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-indigo-400 border border-slate-950" />

      {/* Delete Button */}
      {selected && (
        <button
          className="absolute -top-3.5 -right-3.5 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs hover:bg-rose-600 transition-colors z-20 cursor-pointer shadow-lg border border-slate-950"
          onClick={onDelete}
          title="Delete class"
        >
          ✕
        </button>
      )}

      {/* 1. Header Row */}
      <div
        className="p-3 border-b text-center relative"
        style={{
          borderBottomColor: `${color}30`,
          background: `linear-gradient(135deg, ${color}20 0%, ${color}08 100%)`,
        }}
      >
        {isInterface && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 block mb-0.5">
            «Interface»
          </span>
        )}
        {isAbstract && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block mb-0.5">
            «Abstract»
          </span>
        )}

        <input
          type="text"
          className="w-full text-center font-bold text-sm text-white bg-transparent border-none outline-none focus:bg-slate-800/40 rounded px-1 nodrag"
          value={label}
          onChange={handleTitleChange}
          placeholder="ClassName"
          style={{ textShadow: `0 0 10px ${color}33` }}
        />

        {description && (
          <span className="text-[10px] text-slate-400 block mt-1 leading-tight truncate">
            {description}
          </span>
        )}
      </div>

      {/* 2. Attributes Row */}
      <div className="p-3 border-b border-slate-800/80 min-h-[40px] flex flex-col gap-1 bg-slate-950/20">
        {attributes.length === 0 ? (
          <span className="text-[10px] text-slate-600 italic">No attributes</span>
        ) : (
          attributes.map((attr) => (
            <div key={attr.id} className="flex justify-between items-center text-[11px] font-mono text-slate-300">
              <span className="truncate">
                <span
                  className={`font-bold mr-1 ${
                    attr.visibility === "private"
                      ? "text-rose-400"
                      : attr.visibility === "protected"
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {getVisSymbol(attr.visibility)}
                </span>
                <span>{attr.name}</span>
              </span>
              <span className="text-slate-500 font-normal ml-2">{attr.type}</span>
            </div>
          ))
        )}
      </div>

      {/* 3. Methods Row */}
      <div className="p-3 min-h-[40px] flex flex-col gap-1 bg-slate-950/30">
        {methods.length === 0 ? (
          <span className="text-[10px] text-slate-600 italic">No methods</span>
        ) : (
          methods.map((meth) => {
            const params = meth.parameters.map((p) => `${p.name}: ${p.type}`).join(", ");
            return (
              <div key={meth.id} className="flex justify-between items-start text-[11px] font-mono text-slate-300">
                <span className="truncate flex-1 mr-1">
                  <span
                    className={`font-bold mr-1 ${
                      meth.visibility === "private"
                        ? "text-rose-400"
                        : meth.visibility === "protected"
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {getVisSymbol(meth.visibility)}
                  </span>
                  <span className="font-semibold">{meth.name}</span>
                  <span className="text-slate-400">({params})</span>
                </span>
                <span className="text-slate-500 font-normal shrink-0">{meth.returnType}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Source handle on bottom */}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-indigo-400 border border-slate-950" />
    </div>
  );
}
