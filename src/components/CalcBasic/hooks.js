export function getRandomTriesGeometric(p) {
  // Generate a uniform random number between 0 and 1
  let U = Math.random();
  // Use the inverse CDF of the geometric distribution to get the number of tries
  return Math.ceil(Math.log(U) / p);
}

export function calcBasic(odds, iterations) {
  let lowestTries = Number.MAX_VALUE;
  let numberOfLowest = 0;
  let p = Math.log(1 - (1 / odds));
  for (let i = 0; i < iterations; i++) {
    let tries = getRandomTriesGeometric(p);
    if (tries < lowestTries) {
      lowestTries = tries;
      numberOfLowest = 1;
    } else if (tries === lowestTries) {
      numberOfLowest++;
    }
  }
  return [lowestTries, numberOfLowest];
}

