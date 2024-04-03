import { FunctionDeclaration, MethodSignature, Node, SyntaxKind, ts } from "ts-morph";
import { Factory } from "./Factory";
import { TsParameter } from "./TsParameter";

// It will be a method signature in TS 4.0

export class FactoryFunction {
  constructor(private readonly factory: Factory, private readonly declaration: FunctionDeclaration | MethodSignature) {
  }

  getName() {
    if (Node.isFunctionDeclaration(this.declaration)) {
      return this.declaration.getNameOrThrow();
    }
    return this.declaration.getName();
  }

  getParameters() {
    const params = this.declaration.getParameters().map(p => new TsParameter(this.factory, this, p));
    if (this.getName() === "createNumericLiteral") {
      return params.filter(p => p.getName() !== "numericLiteralFlags");
    }
    if (this.getName() === nameof(ts.createStringLiteral)) {
      return params.filter(p => p.getName() !== "isSingleQuote");
    }
    if (
      this.getName() === nameof(ts.createTemplateHead) || this.getName() === nameof(ts.createTemplateMiddle)
      || this.getName() === nameof(ts.createTemplateTail)
    ) {
      return params.filter(p => p.getName() !== "templateFlags");
    }
    return params;
  }

  getNode() {
    return this.factory.getNode(this.declaration.getReturnType());
  }

  getKindNames() {
    const kindNames = this.getNode().getKindNames();

    if (this.getName() === nameof(ts.createKeywordTypeNode)) {
      return kindNames.filter(kindName => {
        switch (kindName) {
          case nameof(SyntaxKind.NullKeyword): // use createNull
          case nameof(SyntaxKind.ThisKeyword): // use createThis
          case nameof(SyntaxKind.VoidKeyword): // use createVoid
            return false;
          default:
            return true;
        }
      });
    }

    return kindNames;
  }
}
