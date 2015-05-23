'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/**
 * Dependencies
 */

var Queue = require('basic-queue');
var debug = require('debug')('udp-balancer');
var round = require('roundround');
var udp = require('dgram');

/**
 * Balancer
 */

var Balancer = (function () {
  /**
   * Constructor
   *
   * @param {Array} servers - array of addresses
   * @param {Number} concurrency - send concurrency
   */

  function Balancer(servers, concurrency) {
    _classCallCheck(this, Balancer);

    // initialize udp socket
    this.socket = udp.createSocket('udp4');
    this.socket.on('message', this.onMessage.bind(this));

    // initialize queue
    this.queue = new Queue(this.send.bind(this), concurrency || 1);

    // setup servers
    this.setServers(servers);
  }

  /**
   * Message handler
   *
   * @api private
   */

  Balancer.prototype.onMessage = function onMessage(data) {
    this.queue.add(data);
  };

  /**
   * Bind socket
   *
   * @see https://iojs.org/api/dgram.html#dgram_socket_bind_port_address_callback
   * @api public
   */

  Balancer.prototype.bind = function bind(port) {
    this.socket.bind.apply(this.socket, arguments);
    debug('listening at %d', port);
  };

  /**
   * Close socket
   *
   * @see https://iojs.org/api/dgram.html#dgram_socket_close_callback
   * @api public
   */

  Balancer.prototype.close = function close() {
    this.socket.close.apply(this.socket, arguments);
    debug('closed');
  };

  /**
   * Set servers to balance
   *
   * @param {Array} hosts - array of addresses
   * @api public
   */

  Balancer.prototype.setServers = function setServers(hosts) {
    // convert to [address, port]
    var servers = hosts.map(function (host) {
      return host.split(':');
    });

    this.servers = servers;

    // function to get server
    // using round-robin algorithm
    this.next = round(servers);

    debug('set servers to %s', hosts.join(', '));
  };

  /**
   * Send data
   *
   * @param {Buffer} data
   * @param {Function} done
   * @api public
   */

  Balancer.prototype.send = function send(data, done) {
    // get destination server
    var dest = this.next();

    var address = dest[0];
    var port = dest[1];

    this.socket.send(data, 0, data.length, port, address);

    done();

    debug('sent data to %s:%d', address, port);
  };

  return Balancer;
})();

/**
 * Expose balancer
 */

module.exports = Balancer;
