function knapsack(items, capacity, itemIndex) {
  if (capacity === 0 || itemIndex < 0) {
    return { items: [], value: 0, weight: 0 };
  }

  // Check if the item is purchased and its weight is within the capacity
  if (items[itemIndex].purchased && capacity >= items[itemIndex].weight) {
    const itemIncluded = knapsack(
      items,
      capacity - items[itemIndex].weight,
      itemIndex - 1
    );
    itemIncluded.value += items[itemIndex].value;
    itemIncluded.weight += items[itemIndex].weight;
    itemIncluded.items.push(items[itemIndex]);

    const itemExcluded = knapsack(items, capacity, itemIndex - 1);

    return itemIncluded.value > itemExcluded.value ? itemIncluded : itemExcluded;
  } else {
    // If the item is not purchased or its weight exceeds the capacity, exclude it
    return knapsack(items, capacity, itemIndex - 1);
  }
}

module.exports = { knapsack };
