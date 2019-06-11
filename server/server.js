const http = require('http');
const app = require('./app');


const port = process.env.PORT || '3000';
app.set('port', port);

// create http server
const server = http.createServer(app);


server.listen(port, () => {
  console.log('server runs on 127.0.0.1:3000');
});
module.exports = server;
