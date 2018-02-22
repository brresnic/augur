"use strict";

const assert = require("chai").assert;
const setupTestDb = require("../../test.database");
const { processTokensTransferredLog, processTokensTransferredLogRemoval } = require("../../../build/blockchain/log-processors/tokens-transferred");

describe("blockchain/log-processors/tokens-transferred", () => {
  const test = (t) => {
    const getState = (db, params, callback) => db("transfers").where({ transactionHash: params.log.transactionHash, logIndex: params.log.logIndex }).asCallback(callback);
    const getPositionsState = (db, params, callback) => db("positions").where({ account: params.log.from, marketId: params.log.market }).asCallback(callback);
    const getTokenBalances = (db, params, callback) => db("balances").where({ token: params.log.token }).asCallback(callback);
    it(t.description, (done) => {
      setupTestDb((err, db) => {
        assert.isNull(err);
        db.transaction((trx) => {
          processTokensTransferredLog(trx, t.params.augur, t.params.log, (err) => {
            assert.isNull(err);
            getState(trx, t.params, (err, records) => {
              t.assertions.onAdded(err, records);
              getPositionsState(trx, t.params, (err, positions) => {
                t.assertions.onUpdatedPositions(err, positions);
                getTokenBalances(trx, t.params, (err, balances) => {
                  t.assertions.onInitialBalances(err, balances);
                  processTokensTransferredLogRemoval(trx, t.params.augur, t.params.log, (err) => {
                    getState(trx, t.params, (err, records) => {
                      t.assertions.onRemoved(err, records);
                      getTokenBalances(trx, t.params, (err, balances) => {
                        t.assertions.onRemovedBalances(err, balances);
                        done();
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  };
  test({
    description: "TokensTransferred log and removal",
    params: {
      log: {
        transactionHash: "TRANSACTION_HASH",
        logIndex: 0,
        from: "FROM_ADDRESS",
        to: "TO_ADDRESS",
        token: "TOKEN_ADDRESS",
        value: "9000",
        blockNumber: 1400101,
      },
      augur: {},
    },
    assertions: {
      onAdded: (err, records) => {
        assert.isNull(err);
        assert.deepEqual(records, [{
          transactionHash: "TRANSACTION_HASH",
          logIndex: 0,
          sender: "FROM_ADDRESS",
          recipient: "TO_ADDRESS",
          token: "TOKEN_ADDRESS",
          value: 9000,
          blockNumber: 1400101,
        }]);
      },
      onRemoved: (err, records) => {
        assert.isNull(err);
        assert.deepEqual(records, []);
      },
      onUpdatedPositions: (err, records) => {},
      onInitialBalances: (err, balances) => {
        assert.isNull(err);
        assert.deepEqual(balances, [{
          token: "TOKEN_ADDRESS",
          owner: "FROM_ADDRESS",
          balance: 1,
        }, {
          token: "TOKEN_ADDRESS",
          owner: "TO_ADDRESS",
          balance: 9000,
        }]);
      },
      onRemovedBalances: (err, balances) => {
        assert.isNull(err);
        assert.deepEqual(balances, [{
          token: "TOKEN_ADDRESS",
          owner: "FROM_ADDRESS",
          balance: 9001,
        }, {
          token: "TOKEN_ADDRESS",
          owner: "TO_ADDRESS",
          balance: 0,
        }]);
      },
    },
  });
  test({
    description: "TokensTransferred for ShareToken log and removal",
    params: {
      log: {
        transactionHash: "TRANSACTION_HASH",
        logIndex: 0,
        from: "FROM_ADDRESS",
        to: "TO_ADDRESS",
        token: "TOKEN_ADDRESS",
        value: "2",
        tokenType: 1,
        market: "0x0000000000000000000000000000000000000002",
        blockNumber: 1400101,
      },
      augur: {
        api: {
          Orders: {
            getLastOutcomePrice: (p, callback) => {
              assert.strictEqual(p._market, "0x0000000000000000000000000000000000000002");
              if (p._outcome === 0) {
                callback(null, "7000");
              } else {
                callback(null, "1250");
              }
            },
          },
        },
        trading: {
          calculateProfitLoss: (p) => ({
            position: "2",
            realized: "0",
            unrealized: "0",
            meanOpenPrice: "0.75",
            queued: "0",
          }),
          getPositionInMarket: (p, callback) => {
            assert.strictEqual(p.market, "0x0000000000000000000000000000000000000002");
            assert.oneOf(p.address, ["FROM_ADDRESS", "TO_ADDRESS"]);
            callback(null, ["2", "0", "0", "0", "0", "0", "0", "0"]);
          },
          normalizePrice: p => p.price,
        },
      },
    },
    assertions: {
      onAdded: (err, records) => {
        assert.isNull(err);
        assert.deepEqual(records, [{
          transactionHash: "TRANSACTION_HASH",
          logIndex: 0,
          sender: "FROM_ADDRESS",
          recipient: "TO_ADDRESS",
          token: "TOKEN_ADDRESS",
          value: 2,
          blockNumber: 1400101,
        }]);
      },
      onRemoved: (err, records) => {
        assert.isNull(err);
        assert.deepEqual(records, []);
      },
      onInitialBalances: (err, balances) => {
        assert.isNull(err);
      },
      onRemovedBalances: (err, balances) => {
        assert.isNull(err);
      },
      onUpdatedPositions: (err, positions) => {
        assert.isNull(err);
        assert.lengthOf(positions, 8);
        assert.deepEqual(positions, [{
          positionId: positions[0].positionId,
          account: "FROM_ADDRESS",
          marketId: "0x0000000000000000000000000000000000000002",
          outcome: 0,
          numShares: 2,
          numSharesAdjustedForUserIntention: 0,
          realizedProfitLoss: 0,
          unrealizedProfitLoss: 0,
          averagePrice: 0,
          lastUpdated: positions[0].lastUpdated,
        }, {
          positionId: positions[1].positionId,
          account: "FROM_ADDRESS",
          marketId: "0x0000000000000000000000000000000000000002",
          outcome: 1,
          numShares: 0,
          numSharesAdjustedForUserIntention: 0,
          realizedProfitLoss: 0,
          unrealizedProfitLoss: 0,
          averagePrice: 0,
          lastUpdated: positions[0].lastUpdated,
        }, {
          positionId: positions[2].positionId,
          account: "FROM_ADDRESS",
          marketId: "0x0000000000000000000000000000000000000002",
          outcome: 2,
          numShares: 0,
          numSharesAdjustedForUserIntention: 0,
          realizedProfitLoss: 0,
          unrealizedProfitLoss: 0,
          averagePrice: 0,
          lastUpdated: positions[0].lastUpdated,
        }, {
          positionId: positions[3].positionId,
          account: "FROM_ADDRESS",
          marketId: "0x0000000000000000000000000000000000000002",
          outcome: 3,
          numShares: 0,
          numSharesAdjustedForUserIntention: 0,
          realizedProfitLoss: 0,
          unrealizedProfitLoss: 0,
          averagePrice: 0,
          lastUpdated: positions[0].lastUpdated,
        }, {
          positionId: positions[4].positionId,
          account: "FROM_ADDRESS",
          marketId: "0x0000000000000000000000000000000000000002",
          outcome: 4,
          numShares: 0,
          numSharesAdjustedForUserIntention: 0,
          realizedProfitLoss: 0,
          unrealizedProfitLoss: 0,
          averagePrice: 0,
          lastUpdated: positions[0].lastUpdated,
        }, {
          positionId: positions[5].positionId,
          account: "FROM_ADDRESS",
          marketId: "0x0000000000000000000000000000000000000002",
          outcome: 5,
          numShares: 0,
          numSharesAdjustedForUserIntention: 0,
          realizedProfitLoss: 0,
          unrealizedProfitLoss: 0,
          averagePrice: 0,
          lastUpdated: positions[0].lastUpdated,
        }, {
          positionId: positions[6].positionId,
          account: "FROM_ADDRESS",
          marketId: "0x0000000000000000000000000000000000000002",
          outcome: 6,
          numShares: 0,
          numSharesAdjustedForUserIntention: 0,
          realizedProfitLoss: 0,
          unrealizedProfitLoss: 0,
          averagePrice: 0,
          lastUpdated: positions[0].lastUpdated,
        }, {
          positionId: positions[7].positionId,
          account: "FROM_ADDRESS",
          marketId: "0x0000000000000000000000000000000000000002",
          outcome: 7,
          numShares: 0,
          numSharesAdjustedForUserIntention: 0,
          realizedProfitLoss: 0,
          unrealizedProfitLoss: 0,
          averagePrice: 0,
          lastUpdated: positions[0].lastUpdated,
        }]);
      },
    },
  });
});
