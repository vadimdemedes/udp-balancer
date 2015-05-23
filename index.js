'use strict';

/**
 * Dependencies
 */

const Balancer = require('./lib/balancer');


/**
 * Expose factory method
 */

module.exports = function createBalancer (servers, concurrency) {
  return new Balancer(servers, concurrency);
};
