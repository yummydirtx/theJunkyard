import { describe, it, expect } from 'vitest';
import React from 'react';
import {
  ColorMode,
  FeatureItem,
  PastWebsiteItem,
  TestimonialItem,
  LandingPageProps,
  PageLayoutProps,
} from '../types/index';
import { vi } from 'vitest';

describe('Landing Page Types', () => {
  describe('ColorMode', () => {
    it('should accept light mode', () => {
      const mode: ColorMode = 'light';
      expect(mode).toBe('light');
    });

    it('should accept dark mode', () => {
      const mode: ColorMode = 'dark';
      expect(mode).toBe('dark');
    });
  });

  describe('FeatureItem', () => {
    it('should create a valid FeatureItem with all properties', () => {
      const feature: FeatureItem = {
        icon: React.createElement('div'),
        title: 'Test Feature',
        demoLink: 'https://example.com/demo',
        githubLink: 'https://github.com/test/repo',
        description: 'A test feature description',
        imageLight: 'url(test-image.png)',
      };

      expect(feature.title).toBe('Test Feature');
      expect(feature.description).toBe('A test feature description');
      expect(feature.demoLink).toBe('https://example.com/demo');
      expect(feature.githubLink).toBe('https://github.com/test/repo');
      expect(feature.imageLight).toBe('url(test-image.png)');
      expect(React.isValidElement(feature.icon)).toBe(true);
    });

    it('should create a valid FeatureItem with optional properties undefined', () => {
      const feature: FeatureItem = {
        icon: React.createElement('div'),
        title: 'Test Feature',
        description: 'A test feature description',
        imageLight: 'url(test-image.png)',
      };

      expect(feature.title).toBe('Test Feature');
      expect(feature.description).toBe('A test feature description');
      expect(feature.demoLink).toBeUndefined();
      expect(feature.githubLink).toBeUndefined();
    });
  });

  describe('PastWebsiteItem', () => {
    it('should create a valid PastWebsiteItem', () => {
      const website: PastWebsiteItem = {
        icon: React.createElement('div'),
        title: 'Test Website',
        link: 'https://example.com',
        description: 'A test website description',
        imageLight: 'url(test-image.png)',
      };

      expect(website.title).toBe('Test Website');
      expect(website.link).toBe('https://example.com');
      expect(website.description).toBe('A test website description');
      expect(website.imageLight).toBe('url(test-image.png)');
      expect(React.isValidElement(website.icon)).toBe(true);
    });
  });

  describe('TestimonialItem', () => {
    it('should create a valid TestimonialItem', () => {
      const testimonial: TestimonialItem = {
        avatar: React.createElement('div'),
        name: 'John Doe',
        occupation: 'Software Engineer',
        testimonial: 'This is a great testimonial!',
      };

      expect(testimonial.name).toBe('John Doe');
      expect(testimonial.occupation).toBe('Software Engineer');
      expect(testimonial.testimonial).toBe('This is a great testimonial!');
      expect(React.isValidElement(testimonial.avatar)).toBe(true);
    });
  });

  describe('LandingPageProps', () => {
    it('should create valid LandingPageProps', () => {
      const mockSetMode = vi.fn();
      const props: LandingPageProps = {
        setMode: mockSetMode,
        mode: 'light',
      };

      expect(props.mode).toBe('light');
      expect(typeof props.setMode).toBe('function');
    });
  });

  describe('PageLayoutProps', () => {
    it('should create valid PageLayoutProps', () => {
      const mockSetMode = vi.fn();
      const props: PageLayoutProps = {
        children: React.createElement('div'),
        setMode: mockSetMode,
        mode: 'dark',
        sx: { backgroundColor: 'red' },
      };

      expect(props.mode).toBe('dark');
      expect(typeof props.setMode).toBe('function');
      expect(React.isValidElement(props.children)).toBe(true);
      expect(props.sx).toEqual({ backgroundColor: 'red' });
    });

    it('should create valid PageLayoutProps without optional sx', () => {
      const mockSetMode = vi.fn();
      const props: PageLayoutProps = {
        children: React.createElement('div'),
        setMode: mockSetMode,
        mode: 'light',
      };

      expect(props.sx).toBeUndefined();
    });
  });
});
