export function calculateSUS(answers: number[]): number {
  let sum = 0;

  for (let i = 0; i < 10; i += 1) {
    if (i % 2 === 0) {
      sum += answers[i] - 1;
    } else {
      sum += 5 - answers[i];
    }
  }

  return sum * 2.5;
}
