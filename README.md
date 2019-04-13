# Benchmark of parsing libraries in JavaScript
```
bin/bench ./gists.json 1000 <parser>
```

List of parsers:

* [loquat](https://github.com/susisu/loquat2)@2.0.0, @3.0.0-alpha.2
* [parsimmon](https://github.com/jneen/parsimmon)@1.12.0
* [pegjs](https://github.com/pegjs/pegjs)@0.10.0
* [parjs](https://github.com/GregRos/parjs)@0.10.4

`gists.json` is a snapshot of https://api.github.com/gists

### Results on my computer
```
Model Name:            MacBook Pro
Model Identifier:      MacBookPro14,2
Processor Name:        Intel Core i7
Processor Speed:       3.5 GHz
Number of Processors:  1
Total Number of Cores: 2
L2 Cache (per Core):   256 KB
L3 Cache:              4 MB
Memory:                16 GB
```

```
λ bin/bench ./gists.json 10000 loquat
Node.js version: 10.15.3
JSON file: ./gists.json
Loops: 10000
loquat: 31456.520ms

λ bin/bench ./gists.json 10000 loquat3
Node.js version: 10.15.3
JSON file: ./gists.json
Loops: 10000
loquat3: 31591.146ms

λ bin/bench ./gists.json 10000 parsimmon
Node.js version: 10.15.3
JSON file: ./gists.json
Loops: 10000
parsimmon: 36208.863ms

λ bin/bench ./gists.json 10000 pegjs
Node.js version: 10.15.3
JSON file: ./gists.json
Loops: 10000
pegjs: 54743.743ms

λ bin/bench ./gists.json 10000 parjs
Node.js version: 10.15.3
JSON file: ./gists.json
Loops: 10000
parjs: 69146.385ms
```
