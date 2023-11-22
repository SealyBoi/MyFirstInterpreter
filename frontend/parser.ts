import {
  Statement,
  Program,
  Exp,
  BinaryExp,
  NumericLiteral,
  Identifier,
  VarDeclaration,
  AssignmentExp,
  Property,
  ObjectLiteral,
  CallExp,
  MemberExp,
  FunctionDeclaration,
} from "./ast.ts";
import { tokenize, Token, TokenType } from "./lexer.ts";

export default class Parser {
  private tokens: Token[] = [];

  private not_eof(): boolean {
    return this.tokens[0].type != TokenType.EOF;
  }

  private at() {
    return this.tokens[0] as Token;
  }

  private eat() {
    const prev = this.tokens.shift() as Token;
    return prev;
  }

  private expect(type: TokenType, err: any) {
    const prev = this.tokens.shift() as Token;
    if (!prev || prev.type != type) {
      console.error("Parser Error:\n", err, prev, " - Expecting: ", type);
      Deno.exit(1);
    }
    return prev;
  }

  public produceAST(sourceCode: string): Program {
    this.tokens = tokenize(sourceCode);
    const program: Program = {
      kind: "Program",
      body: [],
    };

    // Parse until EOF
    while (this.not_eof()) {
      program.body.push(this.parse_statement());
    }

    return program;
  }

  private parse_statement(): Statement {
    switch (this.at().type) {
      case TokenType.Let:
      case TokenType.Const:
        return this.parse_var_declaration();
      case TokenType.Fn:
        return this.parse_fn_declaration();
      default:
        return this.parse_exp();
    }
  }

  private parse_fn_declaration(): Statement {
    this.eat(); // eat fn keyword
    const name = this.expect(
      TokenType.Identifier,
      "Expected function name following fn keyword."
    ).value;

    const args = this.parse_args();
    const params: string[] = [];
    for (const arg of args) {
      if (arg.kind !== "Identifier") {
        throw `Inside function declaration expected paramaters to be of type string.`;
      }

      params.push((arg as Identifier).symbol);
    }

    this.expect(
      TokenType.OpenBrace,
      "Expected function body following declaration."
    );
    const body: Statement[] = [];

    while (
      this.at().type !== TokenType.EOF &&
      this.at().type !== TokenType.CloseBrace
    ) {
      body.push(this.parse_statement());
    }

    this.expect(
      TokenType.CloseBrace,
      "Closing brace expected inside function declaration."
    );
    
    const fn = {
      kind: "FunctionDeclaration",
      parameters: params,
      name,
      body,
    } as FunctionDeclaration;

    return fn;
  }

  // (CONST | LET) IDENT;
  // (CONST | LET) IDENT = EXP;
  private parse_var_declaration(): Statement {
    const isConstant = this.eat().type == TokenType.Const;
    const identifier = this.expect(
      TokenType.Identifier,
      "Expected identifier name following let | const keywords."
    ).value;

    if (this.at().type == TokenType.Semicolon) {
      this.eat(); // expect semicolon
      if (isConstant)
        throw "Must assign value to constant expression. No value provided.";

      return {
        kind: "VarDeclaration",
        identifier,
        constant: false,
      } as VarDeclaration;
    }

    this.expect(
      TokenType.Equals,
      "Expected equals token following identifier in var declaration."
    );
    const declaration = {
      kind: "VarDeclaration",
      identifier,
      value: this.parse_exp(),
      constant: isConstant,
    } as VarDeclaration;
    this.expect(
      TokenType.Semicolon,
      "Variable declaration statement must end with semicolon."
    );
    return declaration;
  }

  private parse_exp(): Exp {
    return this.parse_assignment_exp();
  }

  private parse_assignment_exp(): Exp {
    const left = this.parse_object_exp();

    if (this.at().type == TokenType.Equals) {
      this.eat(); // advance past equals
      const value = this.parse_assignment_exp();
      return { value, assignee: left, kind: "AssignmentExp" } as AssignmentExp;
    }

    return left;
  }

  private parse_object_exp(): Exp {
    // { Prop[] }
    if (this.at().type !== TokenType.OpenBrace) {
      return this.parse_additive_exp();
    }

    this.eat(); // advance past open brace
    const properties = new Array<Property>();

    while (this.not_eof() && this.at().type != TokenType.CloseBrace) {
      // { key: val, key2: val }
      const key = this.expect(
        TokenType.Identifier,
        "Object literal key expected."
      ).value;

      // allows shorthand key: pair -> { key, }
      if (this.at().type == TokenType.Comma) {
        this.eat(); // advance past comma
        properties.push({ key, kind: "Property" } as Property);
        continue;
      } // allows shorthand key: pair -> { key }
      else if (this.at().type == TokenType.CloseBrace) {
        properties.push({ key, kind: "Property" });
        continue;
      }

      // { key: val }
      this.expect(
        TokenType.Colon,
        "Missing colon following identifier in ObjectExp"
      );
      const value = this.parse_exp();

      properties.push({ kind: "Property", value, key });
      if (this.at().type != TokenType.CloseBrace) {
        this.expect(
          TokenType.Comma,
          "Expected comma or closing bracket following property."
        );
      }
    }

    this.expect(TokenType.CloseBrace, "Object literal missing closing brace.");
    return { kind: "ObjectLiteral", properties } as ObjectLiteral;
  }

  private parse_additive_exp(): Exp {
    let left = this.parse_multiplicative_exp();

    while (this.at().value == "+" || this.at().value == "-") {
      const operator = this.eat().value;
      const right = this.parse_multiplicative_exp();
      left = {
        kind: "BinaryExp",
        left,
        right,
        operator,
      } as BinaryExp;
    }

    return left;
  }

  private parse_multiplicative_exp(): Exp {
    let left = this.parse_call_member_exp();

    while (
      this.at().value == "/" ||
      this.at().value == "*" ||
      this.at().value == "%"
    ) {
      const operator = this.eat().value;
      const right = this.parse_call_member_exp();
      left = {
        kind: "BinaryExp",
        left,
        right,
        operator,
      } as BinaryExp;
    }

    return left;
  }

  private parse_call_member_exp(): Exp {
    const member = this.parse_member_exp();

    if (this.at().type == TokenType.OpenParen) {
      return this.parse_call_exp(member);
    }

    return member;
  }

  private parse_call_exp(caller: Exp): Exp {
    let call_exp: Exp = {
      kind: "CallExp",
      caller,
      args: this.parse_args(),
    } as CallExp;

    if (this.at().type == TokenType.OpenParen) {
      call_exp = this.parse_call_exp(call_exp);
    }

    return call_exp;
  }

  private parse_args(): Exp[] {
    this.expect(TokenType.OpenParen, "Expected open parenthesis.");
    const args =
      this.at().type == TokenType.CloseParen ? [] : this.parse_arguments_list();

    this.expect(
      TokenType.CloseParen,
      "Missing closing parenthesis inside arguments list."
    );
    return args;
  }

  private parse_arguments_list(): Exp[] {
    const args = [this.parse_assignment_exp()];

    while (this.at().type == TokenType.Comma && this.eat()) {
      args.push(this.parse_assignment_exp());
    }

    return args;
  }

  private parse_member_exp(): Exp {
    let object = this.parse_primary_exp();

    while (
      this.at().type == TokenType.Dot ||
      this.at().type == TokenType.OpenBracket
    ) {
      const operator = this.eat();
      let property: Exp;
      let computed: boolean;

      // non-computed values aka obj.exp
      if (operator.type == TokenType.Dot) {
        computed = false;
        // get identifier
        property = this.parse_primary_exp();

        if (property.kind != "Identifier") {
          throw `Cannot use dot operator without right hand side being an identifier.`;
        }
      } else {
        // this allows obj[computedValue]
        computed = true;
        property = this.parse_exp();
        this.expect(
          TokenType.CloseBracket,
          "Missing closing bracket in computed value."
        );
      }
      object = { kind: "MemberExp", object, property, computed } as MemberExp;
    }
    return object;
  }

  // Orders of Precedence
  // AdditiveExp
  // MultiplicativeExp
  // PrimaryExp

  private parse_primary_exp(): Exp {
    const tk = this.at().type;

    switch (tk) {
      case TokenType.Identifier:
        return { kind: "Identifier", symbol: this.eat().value } as Identifier;
      case TokenType.Number:
        return {
          kind: "NumericLiteral",
          value: parseFloat(this.eat().value),
        } as NumericLiteral;
      case TokenType.OpenParen: {
        this.eat(); // eat the opening paren
        const value = this.parse_exp();
        this.expect(
          TokenType.CloseParen,
          "Unexpected token found inside parenthesized expression. Expected closing parenthesis."
        ); // eat the closing paren
        return value;
      }
      default:
        console.error("Unexpected token found during parsing: ", this.at());
        Deno.exit(1);
    }
  }
}
