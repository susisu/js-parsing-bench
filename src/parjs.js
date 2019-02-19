"use strict";

const { Parjs } = require("parjs");

const escapes = {
    "\"": `"`,
    "\\": "\\",
    "/": "/",
    "f": "\f",
    "n": "\n",
    "r": "\r",
    "t": "\t"
};

let _pJsonValue = null;
const pJsonValue = Parjs.late(() => _pJsonValue);
const pEscapeChar = Parjs.anyCharOf(Object.getOwnPropertyNames(escapes).join()).map(char => {
    const result = escapes[char];
    return result;
});

// A unicode escape sequence is "u" followed by exactly 4 hex digits
const pEscapeUnicode = Parjs.string("u").then(Parjs.hex.exactly(4).str.map(hexStr => parseInt(hexStr, 16)));

// Any escape sequence begins with a \
const pEscapeAny = Parjs.string("\\").then(pEscapeChar.or(pEscapeUnicode));

// Here we process regular characters vs escape sequences
const pCharOrEscape = pEscapeAny.or(Parjs.noCharOf('"'));

// Repeat the char/escape to get a sequence, and then put between quotes to get a string
const pStr = pCharOrEscape.many().str.between('"');

// This is also a JSON string value
const pJsonString = pStr;

// Parjs has a dedicated floating point number parser
const pNumber = Parjs.float();

// Parse bools
const pBool = Parjs.anyStringOf("true", "false").map(str => str === "true");

// Parse nulls
const pNull = Parjs.string("null").map(_ => null);

// An array is a sequence of JSON values between ,s
const pArray = pJsonValue.manySepBy(",").between("[", "]").map(arr => arr);

// An object property is a string key, and then a value, separated by : and whitespace around it
// Plus, whitespace around the property
const pObjectProperty =
    pStr.then(Parjs.string(":").between(Parjs.whitespaces).q)
        .then(pJsonValue).between(Parjs.whitespaces)

// An object is a sequence of object properties between {...} separated by ","
const pObject = pObjectProperty.manySepBy(",").between("{", "}").map(properties => {
  const res = {};
  for (const prop of properties) {
      res[prop[0]] = prop[1];
  }
  return res;
});
_pJsonValue = Parjs.any(pJsonString, pNumber, pBool, pNull, pArray, pObject).between(Parjs.whitespaces);

module.exports.parse = src => {
  const res = pJsonValue.parse(src);
  if (res.kind === "OK") {
    return res.value;
  }
  else {
    throw new Error(Parjs.visualizer(res.trace));
  }
}
