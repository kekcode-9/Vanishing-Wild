export function convertBigIntsToNumbers(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntsToNumbers);
  } else if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        convertBigIntsToNumbers(value),
      ])
    );
  } else if (typeof obj === "bigint") {
    return Number(value); // might cause precision loss
  }
  return obj;
}
