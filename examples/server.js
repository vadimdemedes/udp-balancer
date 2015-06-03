'use strict';

/**
 * Dependencies
 */

const udp = require('dgram');


/**
 * Example client
 */

const socket = udp.createSocket('udp4');

socket.on('message', function (data) {
  console.log(data.toString());
});

socket.bind(process.env.PORT || 3000);
