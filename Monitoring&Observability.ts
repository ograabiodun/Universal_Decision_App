// Add custom metrics
appInsights.trackMetric({
  name: "scorecardCreated",
  value: 1
});

// Track custom events
appInsights.trackEvent({
  name: "scorecardCompleted",
  properties: {
    category: "career",
    score: 3
  }
});

// Track exceptions
try {
  // Your code
} catch (error) {
  appInsights.trackException({
    exception: error,
    properties: {
      operation: "createScorecard"
    }
  });
}