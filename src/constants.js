"use strict";

var BigNumber = require("bignumber.js");

var ten = new BigNumber(10, 10);
var decimals = new BigNumber(4, 10);
var multiple = ten.toPower(decimals);

module.exports = {
  ZERO: new BigNumber(0),

  PRECISION: {
    decimals: decimals.toNumber(),
    limit: ten.dividedBy(multiple),
    zero: new BigNumber(1, 10).dividedBy(multiple),
    multiple: multiple
  },
  MINIMUM_TRADE_SIZE: new BigNumber("0.01", 10),

  DEFAULT_NETWORK_ID: "3",
  DEFAULT_GASPRICE: 20000000000,

  GETTER_CHUNK_SIZE: 100,
  BLOCKS_PER_CHUNK: 100,

  AUGUR_UPLOAD_BLOCK_NUMBER: "0x1",

  GET_LOGS_DEFAULT_FROM_BLOCK: "0x1",
  GET_LOGS_DEFAULT_TO_BLOCK: "latest",

  // maximum number of transactions to auto-submit in parallel
  PARALLEL_LIMIT: 5,

  // fixed-point indeterminate: 1.5 * 10^18
  BINARY_INDETERMINATE: new BigNumber("0x14d1120d7b160000", 16),
  CATEGORICAL_SCALAR_INDETERMINATE: new BigNumber("0x6f05b59d3b20000", 16),
  INDETERMINATE_PLUS_ONE: new BigNumber("0x6f05b59d3b20001", 16),

  DUST_THRESHOLD: new BigNumber(1, 10), // placeholder value

  // keythereum crypto parameters
  KDF: "pbkdf2",
  ROUNDS: 65536,
  // KDF: "scrypt",
  // ROUNDS: 4096,
  KEYSIZE: 32,
  IVSIZE: 16

};
