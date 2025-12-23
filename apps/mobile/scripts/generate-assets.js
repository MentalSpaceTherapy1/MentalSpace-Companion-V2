/**
 * Asset Generation Script for MentalSpace Companion
 * Generates app icons, splash screens, and notification icons using Jimp v1.x
 *
 * Run: node scripts/generate-assets.js
 */

const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

// MentalSpace Brand Colors (as hex integers - RGBA format)
const COLORS = {
  primary: 0x38B6E0FF,      // Teal - main brand color
  primaryDark: 0x2A8FB3FF,  // Darker teal
  white: 0xFFFFFFFF,
  transparent: 0x00000000,
  whiteTransparent: 0xFFFFFF33,
};

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

// Ensure assets directory exists
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

/**
 * Draw a filled circle on an image
 */
function drawCircle(image, centerX, centerY, radius, color) {
  const width = image.width;
  const height = image.height;

  for (let y = Math.max(0, Math.floor(centerY - radius)); y <= Math.min(height - 1, Math.ceil(centerY + radius)); y++) {
    for (let x = Math.max(0, Math.floor(centerX - radius)); x <= Math.min(width - 1, Math.ceil(centerX + radius)); x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      if (dx * dx + dy * dy <= radius * radius) {
        image.setPixelColor(color, x, y);
      }
    }
  }
}

/**
 * Draw a heart shape on an image
 */
function drawHeart(image, centerX, centerY, size, color) {
  const width = image.width;
  const height = image.height;
  const scale = size / 100;

  for (let y = -50; y <= 50; y++) {
    for (let x = -50; x <= 50; x++) {
      // Heart equation: (x^2 + y^2 - 1)^3 - x^2 * y^3 < 0
      const nx = x / 40;
      const ny = -y / 40 - 0.3; // Flip and shift

      const heartEq = Math.pow(nx * nx + ny * ny - 1, 3) - nx * nx * ny * ny * ny;

      if (heartEq < 0) {
        const px = Math.round(centerX + x * scale);
        const py = Math.round(centerY + y * scale);
        if (px >= 0 && px < width && py >= 0 && py < height) {
          image.setPixelColor(color, px, py);
        }
      }
    }
  }
}

/**
 * Fill the entire image with a gradient from top-left to bottom-right
 */
function fillGradient(image, color1, color2) {
  const width = image.width;
  const height = image.height;

  // Extract RGBA components
  const r1 = (color1 >> 24) & 0xFF;
  const g1 = (color1 >> 16) & 0xFF;
  const b1 = (color1 >> 8) & 0xFF;
  const a1 = color1 & 0xFF;

  const r2 = (color2 >> 24) & 0xFF;
  const g2 = (color2 >> 16) & 0xFF;
  const b2 = (color2 >> 8) & 0xFF;
  const a2 = color2 & 0xFF;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Diagonal gradient factor (0 to 1)
      const factor = (x / width + y / height) / 2;

      const r = Math.round(r1 + (r2 - r1) * factor);
      const g = Math.round(g1 + (g2 - g1) * factor);
      const b = Math.round(b1 + (b2 - b1) * factor);
      const a = Math.round(a1 + (a2 - a1) * factor);

      const color = (r << 24) | (g << 16) | (b << 8) | a;
      image.setPixelColor(color, x, y);
    }
  }
}

/**
 * Add a radial vignette effect
 */
function addVignette(image, strength = 0.3) {
  const width = image.width;
  const height = image.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const factor = 1 - (dist / maxDist) * strength;

      const color = image.getPixelColor(x, y);
      const r = Math.round(((color >> 24) & 0xFF) * factor);
      const g = Math.round(((color >> 16) & 0xFF) * factor);
      const b = Math.round(((color >> 8) & 0xFF) * factor);
      const a = color & 0xFF;

      image.setPixelColor((r << 24) | (g << 16) | (b << 8) | a, x, y);
    }
  }
}

/**
 * Generate main app icon (1024x1024)
 */
async function generateAppIcon() {
  const size = 1024;
  const image = new Jimp({ width: size, height: size, color: COLORS.primary });

  // Gradient background
  fillGradient(image, COLORS.primary, COLORS.primaryDark);

  // Add subtle vignette
  addVignette(image, 0.15);

  // Draw semi-transparent circle background for heart
  drawCircle(image, size / 2, size / 2, size * 0.35, COLORS.whiteTransparent);

  // Draw white heart
  drawHeart(image, size / 2, size / 2 + size * 0.02, size * 0.55, COLORS.white);

  await image.write(path.join(ASSETS_DIR, 'icon.png'));
  console.log('Generated: icon.png (1024x1024)');
}

/**
 * Generate Android adaptive icon foreground (1024x1024)
 */
async function generateAdaptiveIcon() {
  const size = 1024;
  const image = new Jimp({ width: size, height: size, color: COLORS.transparent });

  // Safe zone is ~72% of total size for adaptive icons
  const safeZone = size * 0.72;

  // Draw circular background
  drawCircle(image, size / 2, size / 2, safeZone / 2, COLORS.primary);

  // Draw white heart (smaller to fit in safe zone)
  drawHeart(image, size / 2, size / 2, safeZone * 0.45, COLORS.white);

  await image.write(path.join(ASSETS_DIR, 'adaptive-icon.png'));
  console.log('Generated: adaptive-icon.png (1024x1024)');
}

/**
 * Generate splash screen (1284x2778)
 */
async function generateSplashScreen() {
  const width = 1284;
  const height = 2778;
  const image = new Jimp({ width: width, height: height, color: COLORS.primary });

  // Gradient background
  fillGradient(image, COLORS.primary, COLORS.primaryDark);

  // Add vignette
  addVignette(image, 0.2);

  // Draw semi-transparent circle behind heart
  const logoSize = width * 0.35;
  const logoY = height / 2 - height * 0.08;
  drawCircle(image, width / 2, logoY, logoSize * 0.6, COLORS.whiteTransparent);

  // Draw heart
  drawHeart(image, width / 2, logoY, logoSize, COLORS.white);

  await image.write(path.join(ASSETS_DIR, 'splash.png'));
  console.log('Generated: splash.png (1284x2778)');
}

/**
 * Generate notification icon (96x96, white on transparent)
 */
async function generateNotificationIcon() {
  const size = 96;
  const image = new Jimp({ width: size, height: size, color: COLORS.transparent });

  // White heart silhouette
  drawHeart(image, size / 2, size / 2, size * 0.7, COLORS.white);

  await image.write(path.join(ASSETS_DIR, 'notification-icon.png'));
  console.log('Generated: notification-icon.png (96x96)');
}

/**
 * Generate web favicon (48x48)
 */
async function generateFavicon() {
  const size = 48;
  const image = new Jimp({ width: size, height: size, color: COLORS.primary });

  // Gradient background
  fillGradient(image, COLORS.primary, COLORS.primaryDark);

  // White heart
  drawHeart(image, size / 2, size / 2, size * 0.6, COLORS.white);

  await image.write(path.join(ASSETS_DIR, 'favicon.png'));
  console.log('Generated: favicon.png (48x48)');
}

/**
 * Create sounds directory placeholder
 */
function createSoundPlaceholder() {
  const soundsDir = path.join(ASSETS_DIR, 'sounds');
  if (!fs.existsSync(soundsDir)) {
    fs.mkdirSync(soundsDir, { recursive: true });
  }

  const readmePath = path.join(soundsDir, 'README.md');
  const readme = `# Notification Sounds

Place your notification sounds here.

## Requirements:
- **notification.wav**: Main notification sound
  - Format: WAV (recommended) or MP3
  - Duration: 1-3 seconds
  - Suggested: Soft, calming tone appropriate for a mental health app

## Free Sound Resources:
- https://freesound.org (search for "gentle notification")
- https://notificationsounds.com
- https://mixkit.co/free-sound-effects/notification/

## Note:
For a mental health app, use calming, non-jarring sounds that won't
cause anxiety. Avoid harsh or loud notification tones.
`;

  fs.writeFileSync(readmePath, readme);
  console.log('Created: sounds/README.md with sound requirements');
}

// Run all generators
async function main() {
  console.log('\nGenerating MentalSpace app assets...\n');

  try {
    await generateAppIcon();
    await generateAdaptiveIcon();
    await generateSplashScreen();
    await generateNotificationIcon();
    await generateFavicon();
    createSoundPlaceholder();

    console.log('\nAll assets generated successfully!');
    console.log('\nNote: For the notification sound, please add a calming WAV file');
    console.log('to assets/sounds/notification.wav');
  } catch (error) {
    console.error('Error generating assets:', error);
    process.exit(1);
  }
}

main();
