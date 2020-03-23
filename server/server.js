const http = require('http');
const { app } = require('./app');


const port = process.env.PORT || '5000';
app.set('port', port);

// create http server
const server = http.createServer(app);


server.listen(port, () => {
  console.log(`server runs on 127.0.0.1:${port}`);
});


module.exports = server;
