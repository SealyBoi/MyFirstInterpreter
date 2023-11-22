import { RuntimeValue, MK_NUMBER } from "./values.ts";
import {
  AssignmentExp,
  BinaryExp,
CallExp,
  Identifier,
  NumericLiteral,
  ObjectLiteral,
  Program,
  Statement,
  VarDeclaration,
} from "../frontend/ast.ts";
import Environment from "./environment.ts";
import { eval_program, eval_var_declaration } from "./eval/statements.ts";
import {
  eval_assignment,
  eval_binary_exp,
eval_call_exp,
  eval_identifier,
  eval_object_exp,
} from "./eval/expressions.ts";

export function evaluate(astNode: Statement, env: Environment): RuntimeValue {
  switch (astNode.kind) {
    // Handle expressions
    case "NumericLiteral":
      return MK_NUMBER((astNode as NumericLiteral).value);
    case "Identifier":
      return eval_identifier(astNode as Identifier, env);
    case "ObjectLiteral":
      return eval_object_exp(astNode as ObjectLiteral, env);
    case "CallExp":
      return eval_call_exp(astNode as CallExp, env);
    case "AssignmentExp":
      return eval_assignment(astNode as AssignmentExp, env);
    case "BinaryExp":
      return eval_binary_exp(astNode as BinaryExp, env);
    case "Program":
      return eval_program(astNode as Program, env);

    // Handle statements
    case "VarDeclaration":
      return eval_var_declaration(astNode as VarDeclaration, env);

    // Handle unimplemented type as error
    default:
      console.error(
        "This AST Node has not yet been setup for interpretation.",
        astNode
      );
      Deno.exit(1);
  }
}
