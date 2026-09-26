/**
 * LayerNormalizer - O(1) validated layer normalization utility (1 to 10 layers).
 */
export const normalizeLayer = val => {
  const num = parseInt(val, 10);
  return Number.isInteger(num) && num >= 1 && num <= 10 ? num : 10;
};
