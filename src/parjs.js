// original: https://github.com/GregRos/parjs/blob/master/src/examples/json.ts

"use strict";

const { Parjs } = require("parjs");

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

let _pJsonValue = null;
const pJsonValue = Parjs.late(() => _pJsonValue);

// Repeat the char/escape to get a sequence, and then put between quotes to get a string
const pStr = Parjs.regexp(/"((?:\\.|.)*?)"/)
  .map(res => interpretEscapes(res[1]));

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
