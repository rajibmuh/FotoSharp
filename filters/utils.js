// utils.js - Fungsi utilitas umum untuk semua filter

// Helper: Clamp value to 0-255
function clamp(value) {
    return Math.max(0, Math.min(255, Math.round(value)));
}

// Helper: Konversi RGB ke Grayscale
function rgbToGrayscale(r, g, b) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Helper: Hitung histogram dari image data
function calculateHistogram(imageData) {
    const histogram = new Array(256).fill(0);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const gray = Math.round(rgbToGrayscale(data[i], data[i + 1], data[i + 2]));
        histogram[gray]++;
    }
    
    return histogram;
}

// Helper: Hitung cumulative histogram
function calculateCumulativeHistogram(histogram) {
    const cumulative = new Array(256).fill(0);
    cumulative[0] = histogram[0];
    
    for (let i = 1; i < 256; i++) {
        cumulative[i] = cumulative[i - 1] + histogram[i];
    }
    
    return cumulative;
}

// Helper: Terapkan kernel konvolusi
function applyConvolution(imageData, kernel) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const output = new Uint8ClampedArray(data.length);
    
    const kSize = Math.sqrt(kernel.length);
    const kRadius = Math.floor(kSize / 2);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            
            // Inisialisasi akumulator untuk RGB
            let r = 0, g = 0, b = 0;
            let kSum = 0;
            
            // Terapkan kernel
            for (let ky = -kRadius; ky <= kRadius; ky++) {
                for (let kx = -kRadius; kx <= kRadius; kx++) {
                    const pixelY = Math.min(Math.max(y + ky, 0), height - 1);
                    const pixelX = Math.min(Math.max(x + kx, 0), width - 1);
                    const pixelIdx = (pixelY * width + pixelX) * 4;
                    
                    const kVal = kernel[(ky + kRadius) * kSize + (kx + kRadius)];
                    
                    r += data[pixelIdx] * kVal;
                    g += data[pixelIdx + 1] * kVal;
                    b += data[pixelIdx + 2] * kVal;
                    kSum += kVal;
                }
            }
            
            // Normalisasi dan clamp
            if (kSum !== 0) {
                r /= kSum;
                g /= kSum;
                b /= kSum;
            }
            
            output[idx] = clamp(r);
            output[idx + 1] = clamp(g);
            output[idx + 2] = clamp(b);
            output[idx + 3] = data[idx + 3]; // Alpha channel
        }
    }
    
    return new ImageData(output, width, height);
}

// Helper: Dapatkan nilai pixel dengan boundary checking
function getPixel(data, width, height, x, y, channel) {
    const px = Math.max(0, Math.min(width - 1, x));
    const py = Math.max(0, Math.min(height - 1, y));
    const idx = (py * width + px) * 4 + channel;
    return data[idx];
}

// Export fungsi untuk digunakan di file lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        clamp,
        rgbToGrayscale,
        calculateHistogram,
        calculateCumulativeHistogram,
        applyConvolution,
        getPixel
    };
}