function multipleKnapsack(weights, profits, capacities) {
  const numKnapsacks = capacities.length;
  const numItems = weights.length;

  // Initialize a 2D array to store intermediate results
  const dp = Array.from({ length: numKnapsacks + 1 }, () =>
    Array.from({ length: numItems + 1 }, () => 0)
  );

  // Populate the dp array using bottom-up dynamic programming
  for (let knapsack = 1; knapsack <= numKnapsacks; knapsack++) {
    for (let item = 1; item <= numItems; item++) {
      if (weights[item - 1] <= capacities[knapsack - 1]) {
        dp[knapsack][item] = Math.max(
          dp[knapsack - 1][item],
          profits[item - 1] + dp[knapsack - 1][item - 1]
        );
      } else {
        dp[knapsack][item] = dp[knapsack - 1][item];
      }
    }
  }

  // Return the maximum profit
  return dp[numKnapsacks][numItems];
}

module.exports = multipleKnapsack;
