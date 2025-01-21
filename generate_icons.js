const fs = require('fs');
const { createCanvas } = require('canvas');

function generateIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Set up colors
    const etsyOrange = '#F1641E';
    const white = '#FFFFFF';
    const lightOrange = '#FFF3EE';

    // Clear background
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, size, size);

    // Draw main circle (background)
    ctx.fillStyle = etsyOrange;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw message bubble
    ctx.fillStyle = white;
    const bubbleSize = size * 0.7;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, bubbleSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw AI dots
    ctx.fillStyle = etsyOrange;
    const dotSize = size * 0.12;
    const dotSpacing = size * 0.18;
    const dotY = size / 2;

    // Left dot
    ctx.beginPath();
    ctx.arc(size / 2 - dotSpacing, dotY, dotSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Middle dot
    ctx.beginPath();
    ctx.arc(size / 2, dotY, dotSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Right dot
    ctx.beginPath();
    ctx.arc(size / 2 + dotSpacing, dotY, dotSize / 2, 0, Math.PI * 2);
    ctx.fill();

    return canvas.createPNGStream();
}

// Create the images directory if it doesn't exist
if (!fs.existsSync('images')) {
    fs.mkdirSync('images');
}

// Generate all required icon sizes
const sizes = [16, 32, 48, 128];
sizes.forEach(size => {
    const out = fs.createWriteStream(`images/icon${size}.png`);
    generateIcon(size).pipe(out);
    console.log(`Generated icon${size}.png`);
}); 