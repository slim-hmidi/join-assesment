const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 9090 });


const sendNotification = (caseId, message) => {
  wss.on('connection', (ws) => {
    ws.send(JSON.stringify({
      caseId,
      message,
    }));
  });
};

module.exports = { sendNotification };
