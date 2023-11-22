import {
  AssignmentExp,
  BinaryExp,
  CallExp,
  Identifier,
  ObjectLiteral,
} from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import {
FunctionValue,
  MK_NULL,
  NativeFnValue,
  NumberValue,
  ObjectValue,
  RuntimeValue,
} from "../values.ts";

function eval_numeric_binary_exp(
  lhs: NumberValue,
  rhs: NumberValue,
  operator: string,
): NumberValue {
  let result: number;
  if (operator == "+") {
    result = lhs.value + rhs.value;
  } else if (operator == "-") {
    result = lhs.value - rhs.value;
  } else if (operator == "*") {
    result = lhs.value * rhs.value;
  } else if (operator == "/") {
    result = lhs.value / rhs.value;
  } else {
    result = lhs.value % rhs.value;
  }

  return { type: "number", value: result };
}

export function eval_binary_exp(
  binop: BinaryExp,
  env: Environment,
): RuntimeValue {
  const lhs = evaluate(binop.left, env);
  const rhs = evaluate(binop.right, env);

  if (lhs.type == "number" && rhs.type == "number") {
    return eval_numeric_binary_exp(
      lhs as NumberValue,
      rhs as NumberValue,
      binop.operator,
    );
  }

  // One or both are null
  return MK_NULL();
}

export function eval_identifier(
  ident: Identifier,
  env: Environment,
): RuntimeValue {
  const val = env.lookupVar(ident.symbol);
  return val;
}

export function eval_assignment(
  node: AssignmentExp,
  env: Environment,
): RuntimeValue {
  if (node.assignee.kind !== "Identifier") {
    throw `Invalid LHS inside assignment expression ${
      JSON.stringify(node.assignee)
    }`;
  }

  const varname = (node.assignee as Identifier).symbol;
  return env.assignVar(varname, evaluate(node.value, env));
}

export function eval_object_exp(
  obj: ObjectLiteral,
  env: Environment,
): RuntimeValue {
  const object = { type: "object", properties: new Map() } as ObjectValue;

  for (const { key, value } of obj.properties) {
    // handles valid key: pair
    const runtimeVal = (value == undefined)
      ? env.lookupVar(key)
      : evaluate(value, env);
    object.properties.set(key, runtimeVal);
  }

  return object;
}

export function eval_call_exp(exp: CallExp, env: Environment): RuntimeValue {
  const args = exp.args.map((arg) => evaluate(arg, env));
  const fn = evaluate(exp.caller, env);

  if (fn.type == "native-fn") {
    const result = (fn as NativeFnValue).call(args, env);
    return result;
  }

  if (fn.type == "function") {
    const func = fn as FunctionValue;
    const scope = new Environment(func.declarationEnv);

    // create the variables for the parameters list
    for (let i = 0; i < func.parameters.length; i++) {
      // TODO check the bounds here (could be less args than function).
      // verify arity of function
      const varname = func.parameters[i];
      scope.declareVar(varname, args[i], false);
    }

    let result: RuntimeValue = MK_NULL();
    // Evaluate the function body line by line
    for (const statement of func.body) {
      result = evaluate(statement, scope);
    }

    return result;
  }

  throw `Cannot call value that is not a function: ${JSON.stringify(fn)}`;
}
