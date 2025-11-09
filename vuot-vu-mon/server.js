const app = require('./server/app');
require('dotenv').config();

// C¥u hình port
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Khßi Ùng server
const server = app.listen(PORT, HOST, () => {
  console.log('');
  console.log('========================================');
  console.log('=€ SERVER ANG CH Y');
  console.log('========================================');
  console.log(`=á URL: http://localhost:${PORT}`);
  console.log(`< Host: ${HOST}`);
  console.log(`=Á Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('========================================');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = server;
