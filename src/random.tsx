export function choose<T>(items: { value: T; weight: number }[]): T {
  if (items.length === 0) {
    throw new Error("The items array cannot be empty.");
  }

  let totalWeight = items.reduce((acc, item) => acc + item.weight, 0);
  let randomWeight = Math.random() * totalWeight;

  let sum = 0;
  for (let item of items) {
    sum += item.weight;
    if (randomWeight <= sum) {
      return item.value;
    }
  }

  // Fallback in case of floating-point arithmetic issues
  return items[items.length - 1].value;
}
