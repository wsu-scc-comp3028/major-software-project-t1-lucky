import express from 'express';
import debug from 'debug';
import * as server from './config/server.js';  // ← Add .js extension
import { homeRouter } from './routes/home.js';  // ← Specify the file
import { apiRouter } from './routes/api.js';    // ← Specify the file

// Setup debug module to spit out the stack trace.
// Do `npm start` to see the server.
export const codeTrace = debug('comp3028:server');

// Start the app
export const app = express();
server.setup(app);

// Register routers here
app.use('/', homeRouter);
app.use('/api', apiRouter);

// Not encouraged, but this is a good practice.
app.get('/test', (req, res) => {
  res.send('Test');
});

// ##############################
// Start the server
server.errorHandling(app);
export const runningServer = app.listen(3000, () => {
  console.log(`CareerLaunch app listening on http://127.0.0.1:3000`);
  codeTrace('Server started successfully');
});