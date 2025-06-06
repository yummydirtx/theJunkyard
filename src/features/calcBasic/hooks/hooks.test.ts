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

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRandomTriesGeometric, calcBasic } from './hooks';

describe('calcBasic hooks', () => {
  beforeEach(() => {
    // Reset Math.random mock before each test
    vi.restoreAllMocks();
  });

  describe('getRandomTriesGeometric', () => {
    it('should return a positive integer', () => {
      // Mock Math.random to return a predictable value
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const p = Math.log(1 - (1 / 100)); // 1 in 100 odds
      const result = getRandomTriesGeometric(p);
      
      expect(result).toBeGreaterThan(0);
      expect(Number.isInteger(result)).toBe(true);
    });

    it('should return different values for different random inputs', () => {
      const p = Math.log(1 - (1 / 100));
      
      // Mock different random values
      vi.spyOn(Math, 'random').mockReturnValueOnce(0.1);
      const result1 = getRandomTriesGeometric(p);
      
      vi.spyOn(Math, 'random').mockReturnValueOnce(0.9);
      const result2 = getRandomTriesGeometric(p);
      
      expect(result1).not.toBe(result2);
    });

    it('should handle edge case with very small probability', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.999);
      
      const p = Math.log(1 - (1 / 1000000)); // 1 in 1,000,000 odds
      const result = getRandomTriesGeometric(p);
      
      expect(result).toBeGreaterThan(0);
      expect(Number.isInteger(result)).toBe(true);
    });

    it('should handle edge case with higher probability', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const p = Math.log(1 - (1 / 2)); // 1 in 2 odds (50% chance)
      const result = getRandomTriesGeometric(p);
      
      expect(result).toBeGreaterThan(0);
      expect(Number.isInteger(result)).toBe(true);
    });
  });

  describe('calcBasic', () => {
    beforeEach(() => {
      // Mock Math.random to return predictable sequence
      let callCount = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => {
        const values = [0.1, 0.5, 0.9, 0.3, 0.7]; // Predictable sequence
        return values[callCount++ % values.length];
      });
    });

    it('should return a tuple with lowest tries and count', () => {
      const result = calcBasic(100, 5);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(typeof result[0]).toBe('number'); // lowest tries
      expect(typeof result[1]).toBe('number'); // count of lowest
    });

    it('should return positive integers', () => {
      const result = calcBasic(100, 10);
      
      expect(result[0]).toBeGreaterThan(0); // lowest tries should be positive
      expect(result[1]).toBeGreaterThan(0); // count should be positive
      expect(Number.isInteger(result[0])).toBe(true);
      expect(Number.isInteger(result[1])).toBe(true);
    });

    it('should handle single iteration', () => {
      const result = calcBasic(100, 1);
      
      expect(result[1]).toBe(1); // count should be 1 for single iteration
      expect(result[0]).toBeGreaterThan(0);
    });

    it('should handle multiple iterations correctly', () => {
      const iterations = 100;
      const result = calcBasic(50, iterations);
      
      // Count should be between 1 and total iterations
      expect(result[1]).toBeGreaterThanOrEqual(1);
      expect(result[1]).toBeLessThanOrEqual(iterations);
    });

    it('should work with different odds values', () => {
      const result1 = calcBasic(10, 5); // 1 in 10 odds
      const result2 = calcBasic(1000, 5); // 1 in 1000 odds
      
      // Both should return valid results
      expect(result1[0]).toBeGreaterThan(0);
      expect(result1[1]).toBeGreaterThan(0);
      expect(result2[0]).toBeGreaterThan(0);
      expect(result2[1]).toBeGreaterThan(0);
    });

    it('should handle edge case with very low odds', () => {
      const result = calcBasic(1000000, 1);
      
      expect(result[0]).toBeGreaterThan(0);
      expect(result[1]).toBe(1);
    });

    it('should handle edge case with high odds', () => {
      const result = calcBasic(2, 1); // 1 in 2 odds
      
      expect(result[0]).toBeGreaterThan(0);
      expect(result[1]).toBe(1);
    });

    it('should be deterministic with mocked random values', () => {
      // Run the same calculation twice with the same mock
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const result1 = calcBasic(100, 3);
      
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const result2 = calcBasic(100, 3);
      
      expect(result1).toEqual(result2);
    });
  });
});
