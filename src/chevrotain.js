// original:
// - https://github.com/SAP/chevrotain/blob/master/examples/grammars/json/json.js
// - http://sap.github.io/chevrotain/playground/?example=JSON%20grammar%20and%20embedded%20semantics
const { Parser, Lexer, createToken } = require("chevrotain")

// ----------------- lexer -----------------
const True = createToken({ name: "True", pattern: /true/ })
const False = createToken({ name: "False", pattern: /false/ })
const Null = createToken({ name: "Null", pattern: /null/ })
const LCurly = createToken({ name: "LCurly", pattern: /{/ })
const RCurly = createToken({ name: "RCurly", pattern: /}/ })
const LSquare = createToken({ name: "LSquare", pattern: /\[/ })
const RSquare = createToken({ name: "RSquare", pattern: /]/ })
const Comma = createToken({ name: "Comma", pattern: /,/ })
const Colon = createToken({ name: "Colon", pattern: /:/ })
const StringLiteral = createToken({
    name: "StringLiteral",
    pattern: /"(?:[^\\"]|\\(?:[bfnrtv"\\/]|u[0-9a-fA-F]{4}))*"/
})
const NumberLiteral = createToken({
    name: "NumberLiteral",
    pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/
})
const WhiteSpace = createToken({
    name: "WhiteSpace",
    pattern: /[ \t\n\r]+/,
    group: Lexer.SKIPPED
})

const allTokens = [
    WhiteSpace,
    NumberLiteral,
    StringLiteral,
    LCurly,
    RCurly,
    LSquare,
    RSquare,
    Comma,
    Colon,
    True,
    False,
    Null
]

const JsonLexer = new Lexer(allTokens)

// ----------------- parser -----------------

class JsonParser extends Parser {
    // Unfortunately no support for class fields with initializer in ES2015, only in esNext...
    // so the parsing rules are defined inside the constructor, as each parsing rule must be initialized by
    // invoking RULE(...)
    // see: https://github.com/jeffmo/es-class-fields-and-static-properties
    constructor(config) {
        super(allTokens, {recoveryEnabled: true, outputCst: false})

        // not mandatory, using $ (or any other sign) to reduce verbosity (this. this. this. this. .......)
        const $ = this

        // the parsing methods
        $.RULE("json", () => $.OR([
          {ALT: () => $.SUBRULE($.object)},
          {ALT: () => $.SUBRULE($.array)}
        ]));

        $.RULE("object", () => {
          const obj = {};

          $.CONSUME(LCurly);
          $.MANY_SEP({
            SEP: Comma, DEF: () => {
              Object.assign(obj, $.SUBRULE($.objectItem));
            }
          });
          $.CONSUME(RCurly);

          return obj;
        });


        $.RULE("objectItem", () => {
          let lit, key, value;
          const obj = {};

          lit = $.CONSUME(StringLiteral)
          $.CONSUME(Colon);
          value = $.SUBRULE($.value);

          // an empty json key is not valid, use "BAD_KEY" instead
          key = lit.isInsertedInRecovery ?
            "BAD_KEY" : lit.image.substr(1, lit.image.length - 2);
          obj[key] = value;
          return obj;
        });


        $.RULE("array", () => {
          const arr = [];
          $.CONSUME(LSquare);
          $.MANY_SEP({
            SEP: Comma, DEF: () => {
              arr.push($.SUBRULE($.value));
            }
          });
          $.CONSUME(RSquare);

          return arr;
        });
        $.RULE("value", () => $.OR([
          { ALT: () => {
            const stringLiteral = $.CONSUME(StringLiteral).image;
            // chop of the quotation marks
            return stringLiteral.substr(1, stringLiteral.length  - 2);
          }},
          { ALT: () => Number($.CONSUME(NumberLiteral).image)},
          { ALT: () => $.SUBRULE($.object)},
          { ALT: () => $.SUBRULE($.array)},
          { ALT: () => {
            $.CONSUME(True);
            return true;
          }},
          { ALT: () => {
            $.CONSUME(False);
            return false;
          }},
          { ALT: () => {
            $.CONSUME(Null);
            return null;
          }}
        ]));

        // very important to call this after all the rules have been defined.
        // otherwise the parser may not work correctly as it will lack information
        // derived during the self analysis phase.
        this.performSelfAnalysis()
    }
}

// ----------------- wrapping it all together -----------------

// reuse the same parser instance.
const parser = new JsonParser()

module.exports = {
    jsonTokens: allTokens,

    JsonParser: JsonParser,

    parse: function parse(text) {
        const lexResult = JsonLexer.tokenize(text)
        // setting a new input will RESET the parser instance's state.
        parser.input = lexResult.tokens
        // any top level rule may be used as an entry point
        const json = parser.json()

        return json;
    }
}
