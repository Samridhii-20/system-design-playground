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
  if (lang === "cpp") {
    if (lowType === "number" || lowType === "float" || lowType === "double") return "double";
    if (lowType === "string") return "std::string";
    if (lowType === "boolean" || lowType === "bool") return "bool";
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
  language: "cpp" | "java" | "typescript" | "python"
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

  // 2. Discover all relationship connections (inheritance, realization, association, aggregation, composition, dependency)
  const extendsMap: Record<string, string[]> = {};
  const implementsMap: Record<string, string[]> = {};
  const associationsMap: Record<string, string[]> = {};
  const aggregationsMap: Record<string, string[]> = {};
  const compositionsMap: Record<string, string[]> = {};
  const dependenciesMap: Record<string, string[]> = {};

  edges.forEach((edge) => {
    const sourceName = nameMap[edge.source];
    const targetName = nameMap[edge.target];
    if (!sourceName || !targetName) return;

    const relationship = (edge.data as { relationship?: string })?.relationship || "association";

    if (relationship === "inheritance") {
      if (!extendsMap[edge.source]) extendsMap[edge.source] = [];
      extendsMap[edge.source].push(targetName);
    } else if (relationship === "realization") {
      if (!implementsMap[edge.source]) implementsMap[edge.source] = [];
      implementsMap[edge.source].push(targetName);
    } else if (relationship === "association") {
      if (!associationsMap[edge.source]) associationsMap[edge.source] = [];
      associationsMap[edge.source].push(targetName);
    } else if (relationship === "aggregation") {
      if (!aggregationsMap[edge.source]) aggregationsMap[edge.source] = [];
      aggregationsMap[edge.source].push(targetName);
    } else if (relationship === "composition") {
      if (!compositionsMap[edge.source]) compositionsMap[edge.source] = [];
      compositionsMap[edge.source].push(targetName);
    } else if (relationship === "dependency") {
      if (!dependenciesMap[edge.source]) dependenciesMap[edge.source] = [];
      dependenciesMap[edge.source].push(targetName);
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
      const assoc = associationsMap[node.id] || [];
      const aggr = aggregationsMap[node.id] || [];
      const comp = compositionsMap[node.id] || [];
      const dep = dependenciesMap[node.id] || [];

      const extStr = extensions.length > 0 ? ` extends ${extensions.join(", ")}` : "";
      const impStr = implementations.length > 0 ? ` implements ${implementations.join(", ")}` : "";

      if (config.isInterface) {
        output += `export interface ${name}${extStr} {\n`;
        config.attributes.forEach((attr) => {
          output += `  ${attr.name}: ${formatType(attr.type, "typescript")};\n`;
        });
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

        // 1. User declared Attributes
        config.attributes.forEach((attr) => {
          const prefix = attr.visibility === "private" ? "#" : attr.visibility === "protected" ? "protected " : "public ";
          output += `  ${prefix}${attr.name}: ${formatType(attr.type, "typescript")};\n`;
        });

        // 2. Class Connections (Association, Aggregation, Composition)
        if (assoc.length > 0) {
          output += `  // 🔗 Simple Association ("Knows-A" reference)\n`;
          assoc.forEach((target) => {
            output += `  public ${target.toLowerCase()}Ref?: ${target};\n`;
          });
        }
        if (aggr.length > 0) {
          output += `  // 🌿 Aggregation Association ("Weak Has-A" - Shared components)\n`;
          aggr.forEach((target) => {
            output += `  private ${target.toLowerCase()}List: ${target}[];\n`;
          });
        }
        if (comp.length > 0) {
          output += `  // 💎 Composition Association ("Strong Has-A" - Owned lifecycle)\n`;
          comp.forEach((target) => {
            output += `  private ${target.toLowerCase()}Part: ${target};\n`;
          });
        }

        if (config.attributes.length > 0 || assoc.length > 0 || aggr.length > 0 || comp.length > 0) {
          output += `\n`;
        }

        // 3. Constructor logic
        const hasPrivateConstructor = config.methods.some((m) => m.name === name && m.visibility === "private");
        const constructorPrefix = hasPrivateConstructor ? "private " : "public ";

        const constructorParams = aggr.map((target) => `${target.toLowerCase()}List: ${target}[]`).join(", ");
        output += `  ${constructorPrefix}constructor(${constructorParams}) {\n`;

        if (aggr.length > 0) {
          aggr.forEach((target) => {
            output += `    this.${target.toLowerCase()}List = ${target.toLowerCase()}List;\n`;
          });
        }
        if (comp.length > 0) {
          comp.forEach((target) => {
            output += `    this.${target.toLowerCase()}Part = new ${target}(); // Created & owned internally\n`;
          });
        }
        if (aggr.length === 0 && comp.length === 0) {
          output += `    // TODO: Initialize fields\n`;
        }

        output += `  }\n\n`;

        // 4. Methods
        config.methods.forEach((meth) => {
          if (meth.name === name) return;
          const vis = formatVisibility(meth.visibility, "typescript");
          const params = meth.parameters
            .map((p) => `${p.name}: ${formatType(p.type, "typescript")}`)
            .join(", ");

          output += `  ${vis}${meth.name}(${params}): ${formatType(meth.returnType, "typescript")} {\n`;
          if (dep.length > 0) {
            output += `    // 📝 Uses transient dependency: ${dep.join(", ")}\n`;
          }
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
    output += `// Generated Java Class Boilerplate\nimport java.util.List;\nimport java.util.ArrayList;\n\n`;

    umlNodes.forEach((node) => {
      const name = nameMap[node.id];
      const config = configMap[node.id];
      if (!config) return;

      const extensions = extendsMap[node.id] || [];
      const implementations = implementsMap[node.id] || [];
      const assoc = associationsMap[node.id] || [];
      const aggr = aggregationsMap[node.id] || [];
      const comp = compositionsMap[node.id] || [];
      const dep = dependenciesMap[node.id] || [];

      const extStr = extensions.length > 0 ? ` extends ${extensions.join(", ")}` : "";
      const impStr = implementations.length > 0 ? ` implements ${implementations.join(", ")}` : "";

      if (config.isInterface) {
        output += `public interface ${name}${extStr} {\n`;
        config.attributes.forEach((attr) => {
          output += `    public static final ${formatType(attr.type, "java")} ${attr.name.toUpperCase()} = null;\n`;
        });
        if (config.attributes.length > 0) output += `\n`;
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

        config.attributes.forEach((attr) => {
          const vis = formatVisibility(attr.visibility, "java");
          output += `    ${vis}${formatType(attr.type, "java")} ${attr.name};\n`;
        });

        if (assoc.length > 0) {
          output += `    // 🔗 Simple Association ("Knows-A")\n`;
          assoc.forEach((target) => {
            output += `    private ${target} ${target.toLowerCase()}Ref;\n`;
          });
        }
        if (aggr.length > 0) {
          output += `    // 🌿 Aggregation Association ("Weak Has-A" - Shared)\n`;
          aggr.forEach((target) => {
            output += `    private List<${target}> ${target.toLowerCase()}List;\n`;
          });
        }
        if (comp.length > 0) {
          output += `    // 💎 Composition Association ("Strong Has-A" - Owned)\n`;
          comp.forEach((target) => {
            output += `    private ${target} ${target.toLowerCase()}Part;\n`;
          });
        }

        if (config.attributes.length > 0 || assoc.length > 0 || aggr.length > 0 || comp.length > 0) {
          output += `\n`;
        }

        const hasPrivateConstructor = config.methods.some((m) => m.name === name && m.visibility === "private");
        const constVis = hasPrivateConstructor ? "private" : "public";

        const constructorParams = aggr.map((target) => `List<${target}> ${target.toLowerCase()}List`).join(", ");
        output += `    ${constVis} ${name}(${constructorParams}) {\n`;

        if (aggr.length > 0) {
          aggr.forEach((target) => {
            output += `        this.${target.toLowerCase()}List = ${target.toLowerCase()}List;\n`;
          });
        }
        if (comp.length > 0) {
          comp.forEach((target) => {
            output += `        this.${target.toLowerCase()}Part = new ${target}(); // Owned lifecycle\n`;
          });
        }
        if (aggr.length === 0 && comp.length === 0) {
          output += `        // TODO: Initialize fields\n`;
        }

        output += `    }\n\n`;

        config.methods.forEach((meth) => {
          if (meth.name === name) return;
          const vis = formatVisibility(meth.visibility, "java");
          const params = meth.parameters
            .map((p) => `${formatType(p.type, "java")} ${p.name}`)
            .join(", ");

          output += `    ${vis}${formatType(meth.returnType, "java")} ${meth.name}(${params}) {\n`;
          if (dep.length > 0) {
            output += `        // 📝 Uses transient dependency: ${dep.join(", ")}\n`;
          }
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
  } else if (language === "cpp") {
    output += `// Generated C++ Class Boilerplate\n#include <iostream>\n#include <string>\n#include <vector>\n#include <memory>\n\n`;

    umlNodes.forEach((node) => {
      const name = nameMap[node.id];
      const config = configMap[node.id];
      if (!config) return;

      const extensions = extendsMap[node.id] || [];
      const implementations = implementsMap[node.id] || [];
      const assoc = associationsMap[node.id] || [];
      const aggr = aggregationsMap[node.id] || [];
      const comp = compositionsMap[node.id] || [];
      const dep = dependenciesMap[node.id] || [];

      const baseClasses = [...extensions, ...implementations];
      const baseStr = baseClasses.length > 0 ? ` : ${baseClasses.map((b) => `public ${b}`).join(", ")}` : "";

      if (config.isInterface) {
        output += `class ${name} {\npublic:\n    virtual ~${name}() = default;\n`;
        config.methods.forEach((meth) => {
          const params = meth.parameters
            .map((p) => `${formatType(p.type, "cpp")} ${p.name}`)
            .join(", ");
          output += `    virtual ${formatType(meth.returnType, "cpp")} ${meth.name}(${params}) = 0;\n`;
        });
        output += `};\n\n`;
      } else {
        output += `class ${name}${baseStr} {\n`;

        // Private section
        output += `private:\n`;
        config.attributes
          .filter((a) => a.visibility === "private")
          .forEach((attr) => {
            output += `    ${formatType(attr.type, "cpp")} ${attr.name};\n`;
          });

        if (assoc.length > 0) {
          output += `    // 🔗 Simple Association ("Knows-A")\n`;
          assoc.forEach((target) => {
            output += `    ${target}* _${target.toLowerCase()}Ref;\n`;
          });
        }
        if (aggr.length > 0) {
          output += `    // 🌿 Aggregation Association ("Weak Has-A" - Shared)\n`;
          aggr.forEach((target) => {
            output += `    std::vector<${target}> _${target.toLowerCase()}List;\n`;
          });
        }
        if (comp.length > 0) {
          output += `    // 💎 Composition Association ("Strong Has-A" - Owned)\n`;
          comp.forEach((target) => {
            output += `    ${target} _${target.toLowerCase()}Part;\n`;
          });
        }

        // Protected section
        const protectedAttrs = config.attributes.filter((a) => a.visibility === "protected");
        if (protectedAttrs.length > 0) {
          output += `\nprotected:\n`;
          protectedAttrs.forEach((attr) => {
            output += `    ${formatType(attr.type, "cpp")} ${attr.name};\n`;
          });
        }

        // Public section
        output += `\npublic:\n`;
        config.attributes
          .filter((a) => a.visibility === "public")
          .forEach((attr) => {
            output += `    ${formatType(attr.type, "cpp")} ${attr.name};\n`;
          });

        // Constructor
        const constructorParams = aggr.map((target) => `std::vector<${target}> ${target.toLowerCase()}List`).join(", ");
        output += `    ${name}(${constructorParams}) {\n`;
        if (aggr.length > 0) {
          aggr.forEach((target) => {
            output += `        this->_${target.toLowerCase()}List = ${target.toLowerCase()}List;\n`;
          });
        }
        if (comp.length > 0) {
          comp.forEach((target) => {
            output += `        // ${target} owned internally\n`;
          });
        }
        if (aggr.length === 0 && comp.length === 0) {
          output += `        // TODO: Constructor logic\n`;
        }
        output += `    }\n\n`;

        output += `    virtual ~${name}() = default;\n\n`;

        config.methods.forEach((meth) => {
          if (meth.name === name) return;
          const params = meth.parameters
            .map((p) => `${formatType(p.type, "cpp")} ${p.name}`)
            .join(", ");

          output += `    ${formatType(meth.returnType, "cpp")} ${meth.name}(${params}) {\n`;
          if (dep.length > 0) {
            output += `        // 📝 Uses transient dependency: ${dep.join(", ")}\n`;
          }
          if (meth.returnType !== "void" && meth.returnType !== "undefined") {
            const retType = formatType(meth.returnType, "cpp");
            const defaultVal = retType === "int" || retType === "double" || retType === "float" ? "0" : retType === "bool" ? "false" : "{}";
            output += `        // TODO: Implement logic\n        return ${defaultVal};\n`;
          } else {
            output += `        // TODO: Implement logic\n`;
          }
          output += `    }\n\n`;
        });

        output += `};\n\n`;
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
      const assoc = associationsMap[node.id] || [];
      const aggr = aggregationsMap[node.id] || [];
      const comp = compositionsMap[node.id] || [];
      const dep = dependenciesMap[node.id] || [];

      const baseClasses = [...extensions, ...implementations];
      const baseStr = baseClasses.length > 0 ? `(${baseClasses.join(", ")})` : "";

      output += `class ${name}${baseStr}:\n`;

      const description = (node.data as { description?: string })?.description;
      if (description) {
        output += `    """\n    ${description}\n    """\n`;
      }

      const initParams = ["self", ...aggr.map((target) => `${target.toLowerCase()}_list: List[${target}] = None`)].join(", ");
      output += `    def __init__(${initParams}):\n`;

      let hasInitBody = false;

      config.attributes.forEach((attr) => {
        const prefix = attr.visibility === "private" ? "__" : attr.visibility === "protected" ? "_" : "";
        output += `        self.${prefix}${attr.name}: ${formatType(attr.type, "python")} = None\n`;
        hasInitBody = true;
      });

      if (assoc.length > 0) {
        assoc.forEach((target) => {
          output += `        self.${target.toLowerCase()}_ref: ${target} = None  # Simple Association ("Knows-A")\n`;
          hasInitBody = true;
        });
      }

      if (aggr.length > 0) {
        aggr.forEach((target) => {
          output += `        self.${target.toLowerCase()}_list: List[${target}] = ${target.toLowerCase()}_list or []  # Aggregation ("Weak Has-A")\n`;
          hasInitBody = true;
        });
      }

      if (comp.length > 0) {
        comp.forEach((target) => {
          output += `        self.${target.toLowerCase()}_part: ${target} = ${target}()  # Composition ("Strong Has-A" - Owned)\n`;
          hasInitBody = true;
        });
      }

      if (!hasInitBody) {
        output += `        pass\n`;
      }
      output += `\n`;

      config.methods.forEach((meth) => {
        if (meth.name === name) return;
        const prefix = meth.visibility === "private" ? "__" : meth.visibility === "protected" ? "_" : "";
        const params = ["self", ...meth.parameters.map((p) => `${p.name}: ${formatType(p.type, "python")}`)].join(", ");

        output += `    def ${prefix}${meth.name}(${params}) -> ${formatType(meth.returnType, "python")}:\n`;
        if (dep.length > 0) {
          output += `        # Uses transient dependency: ${dep.join(", ")}\n`;
        }
        if (meth.returnType !== "void") {
          output += `        # TODO: Implement method logic\n        return None\n\n`;
        } else {
          output += `        # TODO: Implement method logic\n        pass\n\n`;
        }
      });
    });
  }

  return output;
}

