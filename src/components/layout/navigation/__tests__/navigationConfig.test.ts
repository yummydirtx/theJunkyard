import { describe, it, expect } from 'vitest';
import { mainNavigationItems, moreNavigationItems, NavigationItem } from '../navigationConfig';

describe('navigationConfig', () => {
  describe('NavigationItem interface', () => {
    it('should have correct interface structure', () => {
      const testItem: NavigationItem = {
        label: 'Test',
        href: '/test',
        external: true,
        icon: () => null,
      };

      expect(testItem).toHaveProperty('label');
      expect(testItem).toHaveProperty('href');
      expect(testItem).toHaveProperty('external');
      expect(testItem).toHaveProperty('icon');
    });

    it('should allow optional properties', () => {
      const testItem: NavigationItem = {
        label: 'Test',
        href: '/test',
      };

      expect(testItem).toHaveProperty('label');
      expect(testItem).toHaveProperty('href');
      expect(testItem.external).toBeUndefined();
      expect(testItem.icon).toBeUndefined();
    });
  });

  describe('mainNavigationItems', () => {
    it('should be an array', () => {
      expect(Array.isArray(mainNavigationItems)).toBe(true);
    });

    it('should contain expected navigation items', () => {
      expect(mainNavigationItems.length).toBeGreaterThan(0);
      
      const labels = mainNavigationItems.map(item => item.label);
      expect(labels).toContain('Home');
      expect(labels).toContain('Manual Budget');
      expect(labels).toContain('Expense Report');
      expect(labels).toContain('AnteaterFind');
    });

    it('should have correct Home item structure', () => {
      const homeItem = mainNavigationItems.find(item => item.label === 'Home');
      expect(homeItem).toBeDefined();
      expect(homeItem?.href).toBe('/');
      expect(homeItem?.external).toBeUndefined();
    });

    it('should have correct Manual Budget item structure', () => {
      const budgetItem = mainNavigationItems.find(item => item.label === 'Manual Budget');
      expect(budgetItem).toBeDefined();
      expect(budgetItem?.href).toBe('/manualbudget');
      expect(budgetItem?.external).toBeUndefined();
    });

    it('should have correct Expense Report item structure', () => {
      const expenseItem = mainNavigationItems.find(item => item.label === 'Expense Report');
      expect(expenseItem).toBeDefined();
      expect(expenseItem?.href).toBe('/expensereport');
      expect(expenseItem?.external).toBeUndefined();
    });

    it('should have correct AnteaterFind item structure', () => {
      const anteaterItem = mainNavigationItems.find(item => item.label === 'AnteaterFind');
      expect(anteaterItem).toBeDefined();
      expect(anteaterItem?.href).toBe('https://anteaterfind.com');
      expect(anteaterItem?.external).toBe(true);
      expect(anteaterItem?.icon).toBeDefined();
    });

    it('should have valid href values', () => {
      mainNavigationItems.forEach(item => {
        expect(item.href).toBeDefined();
        expect(typeof item.href).toBe('string');
        expect(item.href.length).toBeGreaterThan(0);
      });
    });

    it('should have valid label values', () => {
      mainNavigationItems.forEach(item => {
        expect(item.label).toBeDefined();
        expect(typeof item.label).toBe('string');
        expect(item.label.length).toBeGreaterThan(0);
      });
    });

    it('should correctly identify external links', () => {
      const externalItems = mainNavigationItems.filter(item => item.external);
      const internalItems = mainNavigationItems.filter(item => !item.external);

      // External items should have absolute URLs
      externalItems.forEach(item => {
        expect(item.href).toMatch(/^https?:\/\//);
      });

      // Internal items should have relative URLs
      internalItems.forEach(item => {
        expect(item.href).toMatch(/^\/(?!\/)/);
      });
    });
  });

  describe('moreNavigationItems', () => {
    it('should be an array', () => {
      expect(Array.isArray(moreNavigationItems)).toBe(true);
    });

    it('should contain expected navigation items', () => {
      expect(moreNavigationItems.length).toBeGreaterThan(0);
      
      const labels = moreNavigationItems.map(item => item.label);
      expect(labels).toContain('calcBasic');
      expect(labels).toContain('YTThumb');
    });

    it('should have correct calcBasic item structure', () => {
      const calcItem = moreNavigationItems.find(item => item.label === 'calcBasic');
      expect(calcItem).toBeDefined();
      expect(calcItem?.href).toBe('/calcbasic-web');
      expect(calcItem?.external).toBeUndefined();
    });

    it('should have correct YTThumb item structure', () => {
      const ytItem = moreNavigationItems.find(item => item.label === 'YTThumb');
      expect(ytItem).toBeDefined();
      expect(ytItem?.href).toBe('/ytthumb');
      expect(ytItem?.external).toBeUndefined();
    });

    it('should have valid href values', () => {
      moreNavigationItems.forEach(item => {
        expect(item.href).toBeDefined();
        expect(typeof item.href).toBe('string');
        expect(item.href.length).toBeGreaterThan(0);
      });
    });

    it('should have valid label values', () => {
      moreNavigationItems.forEach(item => {
        expect(item.label).toBeDefined();
        expect(typeof item.label).toBe('string');
        expect(item.label.length).toBeGreaterThan(0);
      });
    });

    it('should not have external links by default', () => {
      moreNavigationItems.forEach(item => {
        expect(item.external).toBeUndefined();
      });
    });

    it('should have internal paths', () => {
      moreNavigationItems.forEach(item => {
        expect(item.href).toMatch(/^\/(?!\/)/);
      });
    });
  });

  describe('configuration consistency', () => {
    it('should not have duplicate labels across main and more items', () => {
      const allLabels = [
        ...mainNavigationItems.map(item => item.label),
        ...moreNavigationItems.map(item => item.label)
      ];
      
      const uniqueLabels = new Set(allLabels);
      expect(uniqueLabels.size).toBe(allLabels.length);
    });

    it('should not have duplicate hrefs across main and more items', () => {
      const allHrefs = [
        ...mainNavigationItems.map(item => item.href),
        ...moreNavigationItems.map(item => item.href)
      ];
      
      const uniqueHrefs = new Set(allHrefs);
      expect(uniqueHrefs.size).toBe(allHrefs.length);
    });

    it('should have consistent structure across all items', () => {
      const allItems = [...mainNavigationItems, ...moreNavigationItems];
      
      allItems.forEach(item => {
        expect(item).toHaveProperty('label');
        expect(item).toHaveProperty('href');
        expect(typeof item.label).toBe('string');
        expect(typeof item.href).toBe('string');
        
        if (item.external !== undefined) {
          expect(typeof item.external).toBe('boolean');
        }
      });
    });

    it('should maintain reasonable array lengths', () => {
      // Ensure we don't have too many items in either array
      expect(mainNavigationItems.length).toBeLessThanOrEqual(10);
      expect(moreNavigationItems.length).toBeLessThanOrEqual(10);
      
      // Ensure we have at least some items
      expect(mainNavigationItems.length).toBeGreaterThan(0);
      expect(moreNavigationItems.length).toBeGreaterThan(0);
    });
  });

  describe('LaunchIcon import', () => {
    it('should properly import and use LaunchIcon', () => {
      const anteaterItem = mainNavigationItems.find(item => item.label === 'AnteaterFind');
      expect(anteaterItem).toBeDefined();
      expect(anteaterItem?.icon).toBeDefined();
      // LaunchIcon is a React component, so it should be an object with $$typeof property
      expect(anteaterItem?.icon).toBeTypeOf('object');
      expect(anteaterItem?.icon).toHaveProperty('$$typeof');
    });
  });
});
