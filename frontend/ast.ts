export type NodeType =
  // STATEMENTS
  | "Program"
  | "VarDeclaration"
  | "FunctionDeclaration"
  // EXPRESSIONS
  | "AssignmentExp"
  | "MemberExp"
  | "CallExp"
  // LITERALS
  | "Property"
  | "ObjectLiteral"
  | "NumericLiteral"
  | "Identifier"
  | "BinaryExp";

export interface Statement {
    kind: NodeType;
}

export interface Program extends Statement {
    kind: "Program";
    body: Statement[];
}

export interface VarDeclaration extends Statement {
    kind: "VarDeclaration";
    constant: boolean;
    identifier: string;
    value?: Exp;
}

export interface FunctionDeclaration extends Statement {
    kind: "FunctionDeclaration";
    parameters: string[];
    name: string;
    body: Statement[];
}

export interface Exp extends Statement {}

export interface AssignmentExp extends Exp {
    kind: "AssignmentExp";
    assignee: Exp;
    value: Exp;
}

export interface BinaryExp extends Exp {
    kind: "BinaryExp";
    left: Exp;
    right: Exp;
    operator: string;
}

export interface CallExp extends Exp {
    kind: "CallExp";
    args: Exp[];
    caller: Exp;
}

export interface MemberExp extends Exp {
    kind: "MemberExp";
    object: Exp;
    property: Exp;
    computed: boolean;
}

export interface Identifier extends Exp {
    kind: "Identifier";
    symbol: string;
}

export interface NumericLiteral extends Exp {
    kind: "NumericLiteral";
    value: number;
}

export interface Property extends Exp {
    kind: "Property";
    key: string;
    value?: Exp;
}

export interface ObjectLiteral extends Exp {
    kind: "ObjectLiteral";
    properties: Property[];
}