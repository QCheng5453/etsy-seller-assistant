const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

function drawIcon(size) {
    canvas.width = size;
    canvas.height = size;

    // Background
    ctx.fillStyle = '#FF5500'; // Etsy orange color
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Message bubble
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 3, 0, Math.PI * 2);
    ctx.fill();

    // AI dots
    ctx.fillStyle = '#FF5500';
    const dotSize = size / 10;
    ctx.beginPath();
    ctx.arc(size / 2 - dotSize, size / 2, dotSize / 2, 0, Math.PI * 2);
    ctx.arc(size / 2, size / 2, dotSize / 2, 0, Math.PI * 2);
    ctx.arc(size / 2 + dotSize, size / 2, dotSize / 2, 0, Math.PI * 2);
    ctx.fill();

    return canvas.toDataURL();
}

// Generate icons in required sizes
const sizes = [16, 48, 128];
sizes.forEach(size => {
    const dataUrl = drawIcon(size);
    // Convert to PNG and save
    const link = document.createElement('a');
    link.download = `icon${size}.png`;
    link.href = dataUrl;
    link.click();
}); 