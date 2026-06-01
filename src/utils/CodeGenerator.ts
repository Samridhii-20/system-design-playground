import type { Node, Edge } from "@xyflow/react";
import type { UmlClassConfig, UmlVisibility } from "@/types/uml";

/**
 * Maps visibility keyword to code format based on language standards.
 */
function formatVisibility(vis: UmlVisibility, lang: string): string {
  if (lang === "python") return ""; // Python visibility handled by naming (e.g., _ or __)
  return vis + " ";
}

/**
 * Maps type strings to target language equivalent structures.
 */
function formatType(type: string, lang: string): string {
  const lowType = type.toLowerCase();
  if (lang === "typescript") {
    if (lowType === "int" || lowType === "float" || lowType === "double" || lowType === "number") return "number";
    if (lowType === "char") return "string";
    return type;
  }
  if (lang === "java") {
    if (lowType === "number") return "double";
    if (lowType === "string") return "String";
    return type;
  }
  if (lang === "csharp") {
    if (lowType === "number") return "double";
    if (lowType === "string") return "string";
    return type;
  }
  if (lang === "python") {
    if (lowType === "number" || lowType === "int" || lowType === "float") return "float";
    if (lowType === "string") return "str";
    if (lowType === "boolean" || lowType === "bool") return "bool";
    return type;
  }
  return type;
}

/**
 * Traverses visual UML nodes and connections to compile boilerplate code.
 */
export function generateBoilerplate(
  nodes: Node[],
  edges: Edge[],
  language: "typescript" | "java" | "csharp" | "python"
): string {
  const umlNodes = nodes.filter((n) => n.type === "umlClass");
  if (umlNodes.length === 0) {
    return `// Drag some UML Class nodes onto the canvas to generate code!`;
  }

  // 1. Map node IDs to node names and config
  const nameMap: Record<string, string> = {};
  const configMap: Record<string, UmlClassConfig> = {};
  umlNodes.forEach((n) => {
    if (!n.data) return;
    const label = (n.data as { label?: string }).label || "";
    nameMap[n.id] = label.replace(/\s+/g, "");
    configMap[n.id] = (n.data as { config: UmlClassConfig }).config;
  });

  // 2. Discover extends and implements relations
  const extendsMap: Record<string, string[]> = {};
  const implementsMap: Record<string, string[]> = {};

  edges.forEach((edge) => {
    const sourceName = nameMap[edge.source];
    const targetName = nameMap[edge.target];
    if (!sourceName || !targetName) return;

    const relationship = (edge.data as { relationship?: string })?.relationship;

    if (relationship === "inheritance") {
      if (!extendsMap[edge.source]) extendsMap[edge.source] = [];
      extendsMap[edge.source].push(targetName);
    } else if (relationship === "realization") {
      if (!implementsMap[edge.source]) implementsMap[edge.source] = [];
      implementsMap[edge.source].push(targetName);
    }
  });

  let output = "";

  if (language === "typescript") {
    output += `// Generated TypeScript Class Boilerplate\n\n`;

    umlNodes.forEach((node) => {
      const name = nameMap[node.id];
      const config = configMap[node.id];
      if (!config) return;

      const extensions = extendsMap[node.id] || [];
      const implementations = implementsMap[node.id] || [];

      const extStr = extensions.length > 0 ? ` extends ${extensions.join(", ")}` : "";
      const impStr = implementations.length > 0 ? ` implements ${implementations.join(", ")}` : "";

      if (config.isInterface) {
        output += `export interface ${name}${extStr} {\n`;
        // Attributes in TS interfaces
        config.attributes.forEach((attr) => {
          output += `  ${attr.name}: ${formatType(attr.type, "typescript")};\n`;
        });
        // Methods in TS interfaces
        config.methods.forEach((meth) => {
          const params = meth.parameters
            .map((p) => `${p.name}: ${formatType(p.type, "typescript")}`)
            .join(", ");
          output += `  ${meth.name}(${params}): ${formatType(meth.returnType, "typescript")};\n`;
        });
        output += `}\n\n`;
      } else {
        const abstractPrefix = config.isAbstract ? "abstract " : "";
        output += `export ${abstractPrefix}class ${name}${extStr}${impStr} {\n`;

        // Attributes
        config.attributes.forEach((attr) => {
          const prefix = attr.visibility === "private" ? "#" : attr.visibility === "protected" ? "protected " : "public ";
          const attrName = attr.visibility === "private" ? attr.name : attr.name;
          output += `  ${prefix}${attrName}: ${formatType(attr.type, "typescript")};\n`;
        });

        if (config.attributes.length > 0) output += `\n`;

        // Constructor
        const hasPrivateConstructor = config.methods.some((m) => m.name === name && m.visibility === "private");
        const constructorPrefix = hasPrivateConstructor ? "private " : "public ";
        output += `  ${constructorPrefix}constructor() {\n    // TODO: Initialize properties\n  }\n\n`;

        // Methods
        config.methods.forEach((meth) => {
          if (meth.name === name) return; // skip custom constructor signature in methods section
          const vis = formatVisibility(meth.visibility, "typescript");
          const params = meth.parameters
            .map((p) => `${p.name}: ${formatType(p.type, "typescript")}`)
            .join(", ");

          output += `  ${vis}${meth.name}(${params}): ${formatType(meth.returnType, "typescript")} {\n`;
          if (meth.returnType !== "void" && meth.returnType !== "undefined") {
            output += `    // TODO: Return ${formatType(meth.returnType, "typescript")}\n    return {} as any;\n`;
          } else {
            output += `    // TODO: Implement method logic\n`;
          }
          output += `  }\n\n`;
        });

        output += `}\n\n`;
      }
    });
  } else if (language === "java") {
    output += `// Generated Java Class Boilerplate\n\n`;

    umlNodes.forEach((node) => {
      const name = nameMap[node.id];
      const config = configMap[node.id];
      if (!config) return;

      const extensions = extendsMap[node.id] || [];
      const implementations = implementsMap[node.id] || [];

      const extStr = extensions.length > 0 ? ` extends ${extensions.join(", ")}` : "";
      const impStr = implementations.length > 0 ? ` implements ${implementations.join(", ")}` : "";

      if (config.isInterface) {
        output += `public interface ${name}${extStr} {\n`;
        // Interface Attributes
        config.attributes.forEach((attr) => {
          output += `    public static final ${formatType(attr.type, "java")} ${attr.name.toUpperCase()} = null;\n`;
        });
        if (config.attributes.length > 0) output += `\n`;
        // Interface Methods
        config.methods.forEach((meth) => {
          const params = meth.parameters
            .map((p) => `${formatType(p.type, "java")} ${p.name}`)
            .join(", ");
          output += `    ${formatType(meth.returnType, "java")} ${meth.name}(${params});\n`;
        });
        output += `}\n\n`;
      } else {
        const abstractPrefix = config.isAbstract ? "abstract " : "";
        output += `public ${abstractPrefix}class ${name}${extStr}${impStr} {\n`;

        // Attributes
        config.attributes.forEach((attr) => {
          const vis = formatVisibility(attr.visibility, "java");
          output += `    ${vis}${formatType(attr.type, "java")} ${attr.name};\n`;
        });

        if (config.attributes.length > 0) output += `\n`;

        // Constructor
        const hasPrivateConstructor = config.methods.some((m) => m.name === name && m.visibility === "private");
        const constVis = hasPrivateConstructor ? "private" : "public";
        output += `    ${constVis} ${name}() {\n        // TODO: Initialize fields\n    }\n\n`;

        // Methods
        config.methods.forEach((meth) => {
          if (meth.name === name) return; // constructor
          const vis = formatVisibility(meth.visibility, "java");
          const params = meth.parameters
            .map((p) => `${formatType(p.type, "java")} ${p.name}`)
            .join(", ");

          output += `    ${vis}${formatType(meth.returnType, "java")} ${meth.name}(${params}) {\n`;
          if (meth.returnType !== "void") {
            const retType = formatType(meth.returnType, "java");
            const defaultVal = retType === "int" || retType === "double" || retType === "float" ? "0" : retType === "boolean" ? "false" : "null";
            output += `        // TODO: Implement logic\n        return ${defaultVal};\n`;
          } else {
            output += `        // TODO: Implement logic\n`;
          }
          output += `    }\n\n`;
        });

        output += `}\n\n`;
      }
    });
  } else if (language === "csharp") {
    output += `// Generated C# Class Boilerplate\nusing System;\nusing System.Collections.Generic;\n\n`;

    umlNodes.forEach((node) => {
      const name = nameMap[node.id];
      const config = configMap[node.id];
      if (!config) return;

      const extensions = extendsMap[node.id] || [];
      const implementations = implementsMap[node.id] || [];

      const baseClasses = [...extensions, ...implementations];
      const baseStr = baseClasses.length > 0 ? ` : ${baseClasses.join(", ")}` : "";

      if (config.isInterface) {
        output += `public interface ${name}${baseStr} {\n`;
        config.methods.forEach((meth) => {
          const params = meth.parameters
            .map((p) => `${formatType(p.type, "csharp")} ${p.name}`)
            .join(", ");
          output += `    ${formatType(meth.returnType, "csharp")} ${meth.name}(${params});\n`;
        });
        output += `}\n\n`;
      } else {
        const abstractPrefix = config.isAbstract ? "abstract " : "";
        output += `public ${abstractPrefix}class ${name}${baseStr} {\n`;

        // Attributes
        config.attributes.forEach((attr) => {
          const vis = formatVisibility(attr.visibility, "csharp");
          // Convert first letter to uppercase for public fields in C# properties
          const attrName = attr.visibility === "public" ? attr.name.charAt(0).toUpperCase() + attr.name.slice(1) : attr.name;
          output += `    ${vis}${formatType(attr.type, "csharp")} ${attrName};\n`;
        });

        if (config.attributes.length > 0) output += `\n`;

        // Constructor
        const hasPrivateConstructor = config.methods.some((m) => m.name === name && m.visibility === "private");
        const constVis = hasPrivateConstructor ? "private" : "public";
        output += `    ${constVis} ${name}() {\n        // TODO: Constructor logic\n    }\n\n`;

        // Methods
        config.methods.forEach((meth) => {
          if (meth.name === name) return; // constructor
          const vis = formatVisibility(meth.visibility, "csharp");
          const methName = meth.name.charAt(0).toUpperCase() + meth.name.slice(1);
          const params = meth.parameters
            .map((p) => `${formatType(p.type, "csharp")} ${p.name}`)
            .join(", ");

          output += `    ${vis}${formatType(meth.returnType, "csharp")} ${methName}(${params}) {\n`;
          if (meth.returnType !== "void") {
            const retType = formatType(meth.returnType, "csharp");
            const defaultVal = retType === "int" || retType === "double" || retType === "float" ? "0" : retType === "bool" ? "false" : "null";
            output += `        // TODO: Implement logic\n        return ${defaultVal};\n`;
          } else {
            output += `        // TODO: Implement logic\n`;
          }
          output += `    }\n\n`;
        });

        output += `}\n\n`;
      }
    });
  } else if (language === "python") {
    output += `# Generated Python Class Boilerplate\nfrom typing import List, Any\n\n`;

    umlNodes.forEach((node) => {
      const name = nameMap[node.id];
      const config = configMap[node.id];
      if (!config) return;

      const extensions = extendsMap[node.id] || [];
      const implementations = implementsMap[node.id] || [];

      const baseClasses = [...extensions, ...implementations];
      const baseStr = baseClasses.length > 0 ? `(${baseClasses.join(", ")})` : "";

      output += `class ${name}${baseStr}:\n`;

      let hasBody = false;

      // Attributes / docstring
      if (node.description) {
        output += `    """\n    ${node.description}\n    """\n`;
        hasBody = true;
      }

      // __init__ constructor
      output += `    def __init__(self):\n`;
      if (config.attributes.length > 0) {
        config.attributes.forEach((attr) => {
          const prefix = attr.visibility === "private" ? "__" : attr.visibility === "protected" ? "_" : "";
          output += `        self.${prefix}${attr.name}: ${formatType(attr.type, "python")} = None\n`;
        });
      } else {
        output += `        pass\n`;
      }
      output += `\n`;
      hasBody = true;

      // Methods
      config.methods.forEach((meth) => {
        if (meth.name === name) return; // skip constructor
        const prefix = meth.visibility === "private" ? "__" : meth.visibility === "protected" ? "_" : "";
        const params = ["self", ...meth.parameters.map((p) => `${p.name}: ${formatType(p.type, "python")}`)].join(", ");

        output += `    def ${prefix}${meth.name}(${params}) -> ${formatType(meth.returnType, "python")}:\n`;
        if (meth.returnType !== "void") {
          output += `        # TODO: Implement method logic\n        return None\n\n`;
        } else {
          output += `        # TODO: Implement method logic\n        pass\n\n`;
        }
        hasBody = true;
      });

      if (!hasBody) {
        output += `    pass\n\n`;
      }
    });
  }

  return output;
}
