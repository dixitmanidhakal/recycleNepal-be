function knapsack(values, weights, capacity) {
  const n = values.length;

  // Initialize a 2D array to store the maximum values for each subproblem
  const dp = new Array(n + 1)
    .fill(0)
    .map(() => new Array(capacity.length).fill(0));

  // Build the table in a bottom-up manner
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < capacity.length; j++) {
      // If the current item's weight is greater than the current capacity, skip it
      if (weights[i - 1] > capacity[j]) {
        dp[i][j] = dp[i - 1][j];
      } else {
        // Choose the maximum value between including and excluding the current item
        dp[i][j] = Math.max(
          dp[i - 1][j],
          values[i - 1] + dp[i - 1][j - weights[i - 1]]
        );
      }
    }
  }

  // The final results are stored in the last element of each subarray
  const results = dp.map((row) => row[capacity.length - 1]);

  return results;
}

module.exports = { knapsack };
