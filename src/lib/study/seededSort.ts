function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

export function seededRankScore(baseScore: number, seed: string, key: string, weight = 0.04) {
  const seededNoise = hashString(`${seed}:${key}`) * weight;
  return baseScore + seededNoise;
}

export function seededSort<T>(
  items: T[],
  seed: string,
  getKey: (item: T) => string,
  getBaseScore: (item: T) => number,
  compareTie?: (left: T, right: T) => number
) {
  return [...items].sort((left, right) => {
    const leftScore = seededRankScore(getBaseScore(left), seed, getKey(left));
    const rightScore = seededRankScore(getBaseScore(right), seed, getKey(right));

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    return compareTie ? compareTie(left, right) : 0;
  });
}

