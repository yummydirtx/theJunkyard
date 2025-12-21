#!/usr/bin/env node
/**
 * OpenGraph Image Generator
 * 
 * Generates the og-image.png for social media previews.
 * Uses the site logo (websitelogo.png) centered on a blue-to-black gradient background.
 * 
 * Usage: node scripts/generate-og-image.mjs
 * 
 * Dependencies: npm install canvas (one-time)
 */

import { createCanvas, loadImage } from 'canvas';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// OG Image dimensions (recommended size for optimal display)
const WIDTH = 1200;
const HEIGHT = 630;

// Gradient colors (matches site's dark mode gradient in PageLayout.tsx)
const NAVY_BLUE = '#02294F';  // Site's header gradient color
const BLACK_COLOR = '#090E10'; // Site's background color

// Gradient transition - matches site's backgroundSize: '100% 125px' 
// For a 630px image, 125px would be ~20% of height
const GRADIENT_END_RATIO = 0.20;

async function generateOGImage() {
    console.log('🎨 Generating OpenGraph image...');

    // Create canvas
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    // Create gradient background matching site's dark mode gradient
    // The site uses: linear-gradient(#02294F, transparent) with backgroundSize: 100% 125px
    const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    gradient.addColorStop(0, NAVY_BLUE);                      // Navy blue at very top
    gradient.addColorStop(GRADIENT_END_RATIO, BLACK_COLOR);   // Transition to black by ~20%
    gradient.addColorStop(1, BLACK_COLOR);                    // Stay black for rest

    // Fill background with gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Load the logo
    const logoPath = join(__dirname, '../src/assets/websitelogo.png');
    console.log(`📁 Loading logo from: ${logoPath}`);

    try {
        const logo = await loadImage(logoPath);

        // Calculate logo size (scale to fit nicely, max 60% of width)
        const maxLogoWidth = WIDTH * 0.5;
        const maxLogoHeight = HEIGHT * 0.4;

        let logoWidth = logo.width;
        let logoHeight = logo.height;

        // Scale down if needed, maintaining aspect ratio
        if (logoWidth > maxLogoWidth) {
            const scale = maxLogoWidth / logoWidth;
            logoWidth *= scale;
            logoHeight *= scale;
        }
        if (logoHeight > maxLogoHeight) {
            const scale = maxLogoHeight / logoHeight;
            logoWidth *= scale;
            logoHeight *= scale;
        }

        // Center the logo
        const logoX = (WIDTH - logoWidth) / 2;
        const logoY = (HEIGHT - logoHeight) / 2;

        // Draw the logo
        ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);

        console.log(`✅ Logo drawn at ${logoX.toFixed(0)}, ${logoY.toFixed(0)} (${logoWidth.toFixed(0)}x${logoHeight.toFixed(0)})`);
    } catch (error) {
        console.error('❌ Failed to load logo:', error.message);
        console.log('ℹ️  Continuing without logo...');
    }

    // Save the image
    const outputPath = join(__dirname, '../public/og-image.png');
    const buffer = canvas.toBuffer('image/png');
    writeFileSync(outputPath, buffer);

    console.log(`\n✨ OpenGraph image saved to: ${outputPath}`);
    console.log(`   Dimensions: ${WIDTH}x${HEIGHT}px`);
    console.log('\n📋 Make sure to deploy this file to your hosting!');
}

generateOGImage().catch(console.error);
