import { Program, VarDeclaration } from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { MK_NULL, RuntimeValue } from "../values.ts";

export function eval_program(program: Program, env: Environment): RuntimeValue {
  let lastEvaluated: RuntimeValue = MK_NULL();
  for (const statement of program.body) {
    lastEvaluated = evaluate(statement, env);
  }
  return lastEvaluated;
}

export function eval_var_declaration(
  declaration: VarDeclaration,
  env: Environment
): RuntimeValue {
  const value = declaration.value ? evaluate(declaration.value, env) : MK_NULL();
  return env.declareVar(declaration.identifier, value, declaration.constant);
}