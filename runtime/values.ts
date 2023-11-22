import { Statement } from "../frontend/ast.ts";
import Environment from "./environment.ts";
export type ValueType = "null" | "number" | "boolean" | "string" | "object" | "native-fn" | "function";

export interface RuntimeValue {
  type: ValueType;
}

export interface NullValue extends RuntimeValue {
  type: "null";
  value: null;
}

export function MK_NULL() {
  return { type: "null", value: null } as NullValue;
}

export interface BooleanValue extends RuntimeValue {
  type: "boolean";
  value: boolean;
}

export function MK_BOOL(b = true) {
  return { type: "boolean", value: b } as BooleanValue;
}

export interface NumberValue extends RuntimeValue {
  type: "number";
  value: number;
}

export function MK_NUMBER(n = 0) {
  return { type: "number", value: n } as NumberValue;
}

export interface StringValue extends RuntimeValue {
  type: "string";
  value: string;
}

export function MK_STRING(s = "") {
  return { type: "string", value: s } as StringValue;
}

export interface ObjectValue extends RuntimeValue {
  type: "object";
  properties: Map<string, RuntimeValue>;
}

export type FunctionCall = (args: RuntimeValue[], env: Environment) => RuntimeValue;

export interface NativeFnValue extends RuntimeValue {
  type: "native-fn";
  call: FunctionCall;
}

export function MK_NATIVE_FN(call: FunctionCall) {
  return { type: "native-fn", call } as NativeFnValue;
}

export interface FunctionValue extends RuntimeValue {
  type: "function";
  name: string;
  parameters: string[];
  declarationEnv: Environment;
  body: Statement[];
}