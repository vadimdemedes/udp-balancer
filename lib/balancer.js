'use strict';

/**
 * Dependencies
 */

const Queue = require('basic-queue');
const debug = require('debug')('udp-balancer');
const roundrobin = require('round-robin');
const udp = require('dgram');
const fs = require('fs');


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
    let self = this;
    
    // initialize udp socket
    this.socket = udp.createSocket('udp4');
    this.socket.on('message', function () {
      self.onMessage.apply(self, arguments);
    });
    
    // initialize queue
    this.queue = new Queue(function () {
      self.send.apply(self, arguments);
    }, concurrency || 1);
    
    // listen for SIGHUP
    process.on('SIGHUP', function () {
      debug('received SIGHUP');
      
      self.reload();
    });
    
    // listen for SIGTERM
    process.on('SIGTERM', function () {
      debug('received SIGTERM');
      
      self.close();
    });
    
    // if path given, read config
    if (servers.constructor === String) {
      debug('reading list of servers from file');
      
      // store path for future reloads
      this._path = servers;
      
      // read servers
      servers = parse(servers);
    }
    
    // setup servers
    this.setServers(servers);
  }
  
  
  /**
   * Reload servers
   */
  
  reload () {
    if (!this._path) {
      debug('could not reload servers, path was not given');
      return;
    }
    
    debug('reloading servers');
    
    let servers = parse(this._path);
    
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
    let servers = hosts.map(function (host) {
      return host.split(':');
    });
    
    this.servers = servers;
    
    // function to get server
    // using round-robin algorithm
    this.next = roundrobin(servers);
    
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
 * Helpers
 */

function parse (path) {
  let content = fs.readFileSync(path).toString();
  let servers = JSON.parse(content);
  
  return servers;
}


/**
 * Expose balancer
 */

module.exports = Balancer;
