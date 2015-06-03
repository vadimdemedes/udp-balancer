# udp-balancer

Load balancer for UDP protocol.


### Installation

```
$ npm install udp-balancer --save
```


### Features

- Round-robin rotation
- Customizable concurrency of sending data
- Lightweight
- Update servers on-the-fly



### Usage

Whatever data you send to the udp-balancer is proxied to one of the specified servers using round-robin algorithm.


#### Command-line tool

```
$ udp-balancer servers.json
```


### Docker

```
$ docker run -e PORT=3000 -p 3000:3000 -v servers.json:/servers.json vdemedes/udp-balancer /servers.json
```


#### API

```javascript
const balance = require('udp-balancer');

// servers to balance
const servers = [
	'127.0.0.1:3001',
	'127.0.0.1:3002'
];

// create instance of balancer
const balancer = balance(servers);

// bind balancer to port 3000
balancer.bind(3000);
```


### License

udp-balancer is released under the MIT license.
