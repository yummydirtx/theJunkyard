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

