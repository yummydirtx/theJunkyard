// Copyright (c) 2025 Alex Frutkin
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (theJunkyard), to deal in
// theJunkyard without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// theJunkyard, and to permit persons to whom theJunkyard is furnished to do so,
// subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of theJunkyard.
// 
// THEJUNKYARD IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THEJUNKYARD OR THE USE OR OTHER DEALINGS IN THEJUNKYARD.

/**
 * Generates a random number of tries using the geometric distribution.
 * This simulates the number of lottery tickets needed to win.
 * 
 * @param p - The logarithm of (1 - probability of winning)
 * @returns The number of tries needed to win
 */
export function getRandomTriesGeometric(p: number): number {
  // Generate a uniform random number between 0 and 1
  const U = Math.random();
  // Use the inverse CDF of the geometric distribution to get the number of tries
  return Math.ceil(Math.log(U) / p);
}

/**
 * Calculates lottery simulation results by running multiple iterations
 * and finding the lowest number of tickets needed to win.
 * 
 * @param odds - The odds of winning (e.g., 1000 for 1 in 1000)
 * @param iterations - The number of simulation iterations to run
 * @returns A tuple containing [lowestTries, numberOfLowest]
 */
export function calcBasic(odds: number, iterations: number): [number, number] {
  let lowestTries = Number.MAX_VALUE;
  let numberOfLowest = 0;
  const p = Math.log(1 - (1 / odds));
  
  for (let i = 0; i < iterations; i++) {
    const tries = getRandomTriesGeometric(p);
    if (tries < lowestTries) {
      lowestTries = tries;
      numberOfLowest = 1;
    } else if (tries === lowestTries) {
      numberOfLowest++;
    }
  }
  
  return [lowestTries, numberOfLowest];
}
