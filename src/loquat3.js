// A word-for-word translation of parsimmon's parser
"use strict";

const lq = require("@loquat/simple");

const interpretEscapes = str => {
  const escapes = {
    b: "\b",
    f: "\f",
    n: "\n",
    r: "\r",
    t: "\t"
  };
  return str.replace(/\\(u[0-9a-fA-F]{4}|[^u])/, (_, escape) => {
    const type = escape.charAt(0);
    const hex = escape.slice(1);
    if (type === "u") {
      return String.fromCharCode(parseInt(hex, 16));
    }
    if (escapes.hasOwnProperty(type)) {
      return escapes[type];
    }
    return type;
  });
}

const whitespace = lq.regexp(/\s*/);
const lexeme = parser => parser.left(whitespace);

const value = lq.lazy(() => lq.choice([
  object,
  array,
  string,
  number,
  litNull,
  litTrue,
  litFalse
]));

const lbrace = lexeme(lq.char("{"));
const rbrace = lexeme(lq.char("}"));
const lbracket = lexeme(lq.char("["));
const rbracket = lexeme(lq.char("]"));
const comma = lexeme(lq.char(","));
const colon = lexeme(lq.char(":"));

const litNull = lexeme(lq.string("null")).return(null);
const litTrue = lexeme(lq.string("true")).return(true);
const litFalse = lexeme(lq.string("false")).return(false);

const string = lexeme(lq.regexp(/"((?:\\.|.)*?)"/, 1))
  .map(interpretEscapes)
  .label("string");
const number = lexeme(lq.regexp(/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/))
  .map(parseFloat)
  .label("number");

const array = lbracket.right(value.sepBy(comma)).left(rbracket);

const keyValue = lq.sequence([string.left(colon), value]);
const object = lbrace.right(keyValue.sepBy(comma)).left(rbrace)
  .map(kvs => {
    const obj = {};
    for (const kv of kvs) {
      obj[kv[0]] = kv[1];
    }
    return obj;
  });

const json = whitespace.right(value).left(lq.eof);

module.exports.parse = src => {
  const res = json.parse("", src, undefined, { unicode: false });
  if (res.success) {
    return res.value;
  }
  else {
    throw res.error;
  }
}
