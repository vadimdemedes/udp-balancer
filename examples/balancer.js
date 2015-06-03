'use strict';

/**
 * Dependencies
 */

const balance = require('../');


/**
 * Example balancer
 */

const balancer = balance(__dirname + '/servers.json');

balancer.bind(process.env.PORT || 3000);
