'use strict';

/**
 * Dependencies
 */

const Queue = require('basic-queue');
const debug = require('debug')('udp-balancer');
const round = require('roundround');
const udp = require('dgram');


/**
 * Balancer
 */

class Balancer {
  /**
   * Constructor
   *
   * @param {Array} servers - array of addresses
   * @param {Number} concurrency - send concurrency
   */
  
  constructor (servers, concurrency) {
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
  
  onMessage (data) {
    this.queue.add(data);
  }
  
  
  /**
   * Bind socket
   *
   * @see https://iojs.org/api/dgram.html#dgram_socket_bind_port_address_callback
   * @api public
   */
  
  bind (port) {
    this.socket.bind.apply(this.socket, arguments);
    debug('listening at %d', port);
  }
  
  
  /**
   * Close socket
   *
   * @see https://iojs.org/api/dgram.html#dgram_socket_close_callback
   * @api public
   */
  
  close () {
    this.socket.close.apply(this.socket, arguments);
    debug('closed');
  }
  
  
  /**
   * Set servers to balance
   *
   * @param {Array} hosts - array of addresses
   * @api public
   */
  
  setServers (hosts) {
    // convert to [address, port]
    let servers = hosts.map(host => host.split(':'));
    
    this.servers = servers;
    
    // function to get server
    // using round-robin algorithm
    this.next = round(servers);
    
    debug('set servers to %s', hosts.join(', '));
  }
  
  
  /**
   * Send data
   *
   * @param {Buffer} data
   * @param {Function} done
   * @api public
   */
  
  send (data, done) {
    // get destination server
    let dest = this.next();
    
    let address = dest[0];
    let port = dest[1];
    
    this.socket.send(data, 0, data.length, port, address);
    
    done();
    
    debug('sent data to %s:%d', address, port);
  }
}


/**
 * Expose balancer
 */

module.exports = Balancer;
