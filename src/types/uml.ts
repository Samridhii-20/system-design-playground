export type UmlVisibility = "public" | "private" | "protected";

export interface UmlAttribute {
  id: string;
  name: string;
  type: string;
  visibility: UmlVisibility;
}

export interface UmlParameter {
  name: string;
  type: string;
}

export interface UmlMethod {
  id: string;
  name: string;
  returnType: string;
  parameters: UmlParameter[];
  visibility: UmlVisibility;
}

export interface UmlClassConfig {
  isInterface: boolean;
  isAbstract: boolean;
  attributes: UmlAttribute[];
  methods: UmlMethod[];
}

export type UmlRelationshipType =
  | "inheritance"  // extends (solid line, hollow arrow)
  | "realization"  // implements (dashed line, hollow arrow)
  | "composition"  // solid line, filled diamond
  | "aggregation"  // solid line, hollow diamond
  | "association"  // solid line, simple arrow
  | "dependency";  // dashed line, simple arrow

export interface DesignPatternPreset {
  id: string;
  name: string;
  category: "Creational" | "Structural" | "Behavioral";
  description: string;
  solidPrinciples: {
    principle: string;
    explanation: string;
  }[];
  nodes: {
    id: string;
    type: "umlClass";
    label: string;
    description: string;
    color: string;
    position: { x: number; y: number };
    config: UmlClassConfig;
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    type: string; // custom edge type e.g., 'umlEdge'
    data: {
      relationship: UmlRelationshipType;
      label?: string;
    };
  }[];
}
