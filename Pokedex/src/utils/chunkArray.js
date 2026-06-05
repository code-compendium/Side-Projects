export function chunkArray(array = [], size = 10) {
  if (!Array.isArray(array)) {
    throw new Error("chunkArray expects an array");
  }

  const chunks = [];

  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
}
