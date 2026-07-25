"use client";

import { useState } from "react";

interface CodePanelProps {
  code: string;
  onLanguageChange: (lang: "cpp" | "java" | "typescript" | "python") => void;
  activeLanguage: "cpp" | "java" | "typescript" | "python";
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * CodePanel — bottom-docked interactive drawer displaying live generated UML code.
 */
export default function CodePanel({
  code,
  onLanguageChange,
  activeLanguage,
  isOpen,
  onToggle,
}: CodePanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const languages = [
    { id: "cpp", label: "C++" },
    { id: "java", label: "Java" },
    { id: "typescript", label: "TS / JS" },
    { id: "python", label: "Python" },
  ] as const;

  return (
    <div
      className={`absolute bottom-0 left-64 right-80 bg-slate-950/95 border-t border-slate-800/80 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-in-out z-20 flex flex-col ${isOpen ? "h-72" : "h-11"
        }`}
    >
      {/* Drawer Header & Toggle Bar */}
      <div className="flex justify-between items-center px-4 h-11 border-b border-slate-900 shrink-0 select-none bg-slate-900/60">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5 cursor-pointer bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1 rounded border border-slate-700/60"
          >
            <span>{isOpen ? "▼ Close Code Panel" : "▲ Open Code Panel"}</span>
          </button>
          <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <span></span> Live Code Compiler
          </span>
          <span className="text-[10px] bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900 font-mono">
            {isOpen ? "Active View" : "Updating Live"}
          </span>
        </div>

        {/* Tab Buttons & Copy Button */}
        {isOpen ? (
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-900 rounded-md p-0.5 border border-slate-800">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => onLanguageChange(lang.id)}
                  className={`text-[11px] px-3 py-1 rounded font-medium transition-colors cursor-pointer ${activeLanguage === lang.id
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                    }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs bg-indigo-950 hover:bg-indigo-900 text-indigo-200 px-3 py-1 rounded border border-indigo-800 font-medium transition-colors cursor-pointer"
            >
              <span>{copied ? "✓ Copied" : "📋 Copy Code"}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onToggle}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>💻 Click to View Generated Code</span>
          </button>
        )}
      </div>

      {/* Code Viewer Panel */}
      {isOpen && (
        <div className="flex-1 overflow-auto p-4 font-mono text-[12px] leading-relaxed text-slate-300 bg-slate-950/60 select-text">
          <pre className="whitespace-pre">{code}</pre>
        </div>
      )}
    </div>
  );
}
