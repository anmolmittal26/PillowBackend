const express = require('express');

const RATE_LIMIT = 10;
const TIME_WINDOW = 60; // (in seconds)

const app = express();

let requestCount = 0;

let startTime = Date.now();

app.use((req, res, next) => {
  const elapsedTime = (Date.now() - startTime) / 1000;

  if (elapsedTime > TIME_WINDOW) {
    requestCount = 0;
    startTime = Date.now();
  }

  if (requestCount > RATE_LIMIT) {
    res.setHeader('X-RATE-LIMIT', RATE_LIMIT);

    const waitTime = TIME_WINDOW - elapsedTime;
    res.setHeader('X-WAIT-TILL', Date.now() + waitTime * 1000);

    return res.status(429).send('Too many requests');
  }

  requestCount++;
  next();
});

app.get('/', (req, res) => {
  res.send(`Number of requests: ${requestCount}`);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});