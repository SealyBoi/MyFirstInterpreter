import {
BooleanValue,
  MK_BOOL,
  MK_NATIVE_FN,
  MK_NULL,
  MK_NUMBER,
  NullValue,
  NumberValue,
  RuntimeValue,
  StringValue,
} from "./values.ts";

function setupScope(env: Environment) {
  // Create Default Global Environment
  env.declareVar("true", MK_BOOL(true), true);
  env.declareVar("false", MK_BOOL(false), true);
  env.declareVar("null", MK_NULL(), true);

  // Define a native builtin method
  env.declareVar(
    "print",
    MK_NATIVE_FN((args, scope) => {
      for (let i = 0; i < args.length; i++) {
        switch (args[i].type) {
          case "string":
            console.log((args[i] as StringValue).value);
            break;
          case "boolean":
            console.log((args[i] as BooleanValue).value);
            break;
          case "number":
            console.log((args[i] as NumberValue).value);
            break;
          case "null":
            console.log((args[i] as NullValue).value);
            break;
          default:
            console.log(args[i]);
            break;
        }
      }
      return MK_NULL();
    }),
    true
  );

  function timeFunction(args: RuntimeValue[], env: Environment) {
    return MK_NUMBER(Date.now());
  }
  env.declareVar("time", MK_NATIVE_FN(timeFunction), true);
}

export default class Environment {
  private parent?: Environment;
  private variables: Map<string, RuntimeValue>;
  private constants: Set<string>;

  constructor(parentENV?: Environment) {
    const global = parentENV ? false : true;
    this.parent = parentENV;
    this.variables = new Map();
    this.constants = new Set();

    if (global) {
      setupScope(this);
    }
  }

  public declareVar(
    varname: string,
    value: RuntimeValue,
    constant: boolean
  ): RuntimeValue {
    if (this.variables.has(varname)) {
      throw `Cannot declare variable ${varname}, as it is already defined.`;
    }

    this.variables.set(varname, value);
    if (constant) {
      this.constants.add(varname);
    }
    return value;
  }

  public assignVar(varname: string, value: RuntimeValue): RuntimeValue {
    const env = this.resolve(varname);

    // Cannot assign to constant
    if (env.constants.has(varname)) {
      throw `Cannot reassign to variable ${varname} as it was declared constant.`;
    }

    env.variables.set(varname, value);
    return value;
  }

  public lookupVar(varname: string): RuntimeValue {
    const env = this.resolve(varname);
    return env.variables.get(varname) as RuntimeValue;
  }

  public resolve(varname: string): Environment {
    if (this.variables.has(varname)) return this;
    if (this.parent == undefined)
      throw `Cannot resolve ${varname} as it does not exist.`;

    return this.parent.resolve(varname);
  }
}
