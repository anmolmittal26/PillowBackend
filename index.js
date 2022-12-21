const express = require('express');

// Set the rate limit to 10 requests per minute
const RATE_LIMIT = 10;
const TIME_WINDOW = 60; // in seconds

const app = express();

// Keep track of the number of requests made in the current time window
let requestCount = 0;

// Set the start time of the current time window
let startTime = Date.now();

app.use((req, res, next) => {
  // Calculate the elapsed time since the start of the current time window
  const elapsedTime = (Date.now() - startTime) / 1000;

  // If the elapsed time is greater than the time window, reset the request count and start time
  if (elapsedTime > TIME_WINDOW) {
    requestCount = 0;
    startTime = Date.now();
  }

  // If the request count is greater than the rate limit, return a 429 error
  if (requestCount > RATE_LIMIT) {
    res.setHeader('X-RATE-LIMIT', RATE_LIMIT);

    // Calculate the time until the next time window starts
    const waitTime = TIME_WINDOW - elapsedTime;
    res.setHeader('X-WAIT-TILL', Date.now() + waitTime * 1000);

    return res.status(429).send('Too many requests');
  }

  // Increment the request count and proceed with the request
  requestCount++;
  next();
});

app.get('/', (req, res) => {
  // Return the number of requests made so far
  res.send(`Number of requests: ${requestCount}`);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});