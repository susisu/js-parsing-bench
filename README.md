# Benchmark of parsing libraries in JavaScript
```
bin/bench ./gists.json 1000 <parser>
```

List of parsers:

* [loquat](https://github.com/susisu/loquat2)
* [parsimmon](https://github.com/jneen/parsimmon)
* [pegjs](https://github.com/pegjs/pegjs)

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
Node.js version: 10.0.0
JSON file: ./gists.json
Loops: 10000
loquat: 35081.334ms

λ bin/bench ./gists.json 10000 parsimmon
Node.js version: 10.0.0
JSON file: ./gists.json
Loops: 10000
parsimmon: 36396.170ms

λ bin/bench ./gists.json 10000 pegjs
Node.js version: 10.0.0
JSON file: ./gists.json
Loops: 10000
pegjs: 56340.549ms
```
